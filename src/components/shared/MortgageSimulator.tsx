'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { formatPrice } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, ArrowRight, TrendingDown, Wallet, Percent } from 'lucide-react';

/* ---------- Schema ---------- */

const mortgageSchema = z.object({
  propertyPrice: z
    .number({ error: 'Entrez un prix valide' })
    .min(1_000_000, 'Le prix minimum est 1 000 000 DA')
    .max(10_000_000_000, 'Le prix maximum est 10 000 000 000 DA'),
  downPaymentPercent: z
    .number()
    .min(0, 'Min 0%')
    .max(90, 'Max 90%'),
  loanTermYears: z
    .number()
    .min(5, 'Min 5 ans')
    .max(30, 'Max 30 ans'),
  interestRate: z
    .number()
    .min(0.1, 'Min 0.1%')
    .max(25, 'Max 25%'),
});

type MortgageFormData = z.infer<typeof mortgageSchema>;

/* ---------- Helpers ---------- */

function formatDZD(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(amount) + ' DA';
}

function computeMortgage(
  propertyPrice: number,
  downPaymentPercent: number,
  loanTermYears: number,
  annualRate: number,
) {
  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const principal = propertyPrice - downPayment;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = loanTermYears * 12;

  if (monthlyRate === 0) {
    const monthly = principal / numPayments;
    return {
      monthlyPayment: monthly,
      totalInterest: 0,
      totalCost: propertyPrice,
      principal,
      downPayment,
    };
  }

  const monthlyPayment =
    principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalCost = monthlyPayment * numPayments + downPayment;
  const totalInterest = monthlyPayment * numPayments - principal;

  return { monthlyPayment, totalInterest, totalCost, principal, downPayment };
}

/* ---------- Animated Number ---------- */

function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const [displayed, setDisplayed] = useState(value);
  const [displayStr, setDisplayStr] = useState(format(value));

  useEffect(() => {
    const start = displayed;
    const end = value;
    const duration = 400;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + (end - start) * eased;
      setDisplayed(current);
      setDisplayStr(format(current));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value, format]);

  return <span>{displayStr}</span>;
}

/* ---------- SVG Donut Chart ---------- */

function DonutChart({ principal, interest }: { principal: number; interest: number }) {
  const total = principal + interest;
  if (total === 0) return null;

  const principalPct = principal / total;
  const interestPct = interest / total;

  // SVG arc math
  const radius = 70;
  const strokeWidth = 22;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;

  const principalDash = principalPct * circumference;
  const interestDash = interestPct * circumference;

  // Rotate so the chart starts at top
  const rotation = -90;

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto">
      {/* Background track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-muted/30"
        strokeWidth={strokeWidth}
      />
      {/* Principal arc (forest green) */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--color-forest, #2D6A4F)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${principalDash} ${circumference - principalDash}`}
        strokeDashoffset={0}
        strokeLinecap="butt"
        transform={`rotate(${rotation} ${cx} ${cy})`}
        className="transition-all duration-500"
      />
      {/* Interest arc (gold) */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--color-gold, #D4A843)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${interestDash} ${circumference - interestDash}`}
        strokeDashoffset={-principalDash}
        strokeLinecap="butt"
        transform={`rotate(${rotation} ${cx} ${cy})`}
        className="transition-all duration-500"
      />
      {/* Center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
        Capital
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="fill-forest text-[13px] font-bold">
        {Math.round(principalPct * 100)}%
      </text>
    </svg>
  );
}

/* ---------- Component ---------- */

interface MortgageSimulatorProps {
  defaultPrice?: number;
}

const LOAN_TERMS = [
  { value: 10, label: '10 ans' },
  { value: 15, label: '15 ans' },
  { value: 20, label: '20 ans' },
  { value: 25, label: '25 ans' },
];

export function MortgageSimulator({ defaultPrice }: MortgageSimulatorProps) {
  const router = useRouter();
  const fmt = useCallback((v: number) => formatDZD(v), []);

  const {
    control,
    formState: { errors },
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageSchema),
    defaultValues: {
      propertyPrice: defaultPrice ?? 15_000_000,
      downPaymentPercent: 20,
      loanTermYears: 20,
      interestRate: 5.5,
    },
    mode: 'onChange',
  });

  const { propertyPrice, downPaymentPercent, loanTermYears, interestRate } = useWatch({
    control,
  });

  const results = useMemo(
    () => computeMortgage(propertyPrice ?? 0, downPaymentPercent ?? 30, loanTermYears ?? 20, interestRate ?? 5.5),
    [propertyPrice, downPaymentPercent, loanTermYears, interestRate],
  );

  const downPaymentAmount = (propertyPrice ?? 0) * ((downPaymentPercent ?? 30) / 100);

  return (
    <Card className="border-forest/20 shadow-lg overflow-hidden">
      {/* Header accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-forest via-forest-light to-gold" />

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center">
            <Calculator className="h-5 w-5 text-forest" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Simulateur de prêt immobilier</CardTitle>
            <CardDescription>Estimez votre mensualité en quelques clics</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ---- Inputs ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Property Price */}
          <div className="space-y-2">
            <Label htmlFor="propertyPrice" className="text-foreground text-sm font-medium">
              Prix du bien
            </Label>
            <Controller
              name="propertyPrice"
              control={control}
              render={({ field }) => (
                <Input
                  id="propertyPrice"
                  type="text"
                  inputMode="numeric"
                  className="h-10 border-forest/20 focus-visible:border-forest"
                  placeholder="15 000 000"
                  value={new Intl.NumberFormat('fr-DZ').format(field.value || 0)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s/g, '').replace(/,/g, '');
                    const num = parseInt(raw, 10);
                    if (!isNaN(num)) field.onChange(num);
                  }}
                  onBlur={field.onBlur}
                />
              )}
            />
            {errors.propertyPrice && (
              <p className="text-xs text-destructive">{errors.propertyPrice.message}</p>
            )}
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="interestRate" className="text-foreground text-sm font-medium">
              Taux d&apos;intérêt (%)
            </Label>
            <Controller
              name="interestRate"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="25"
                    className="h-10 border-forest/20 focus-visible:border-forest"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    onBlur={field.onBlur}
                  />
                  <Percent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              )}
            />
            {errors.interestRate && (
              <p className="text-xs text-destructive">{errors.interestRate.message}</p>
            )}
          </div>

          {/* Down Payment */}
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-medium">Apport personnel</Label>
              <span className="text-sm font-semibold text-forest">
                {downPaymentPercent}% — {formatDZD(downPaymentAmount)}
              </span>
            </div>
            <Controller
              name="downPaymentPercent"
              control={control}
              render={({ field }) => (
                <Slider
                  min={0}
                  max={90}
                  step={1}
                  value={[field.value]}
                  onValueChange={(v) => field.onChange(v[0])}
                  className="py-2 [&_[data-slot=slider-track]]:bg-forest/10 [&_[data-slot=slider-range]]:bg-forest [&_[data-slot=slider-thumb]]:border-forest"
                />
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>30%</span>
              <span>60%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-foreground text-sm font-medium">Durée du prêt</Label>
            <Controller
              name="loanTermYears"
              control={control}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="w-full h-10 border-forest/20 focus-visible:border-forest">
                    <SelectValue placeholder="Sélectionnez une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_TERMS.map((term) => (
                      <SelectItem key={term.value} value={String(term.value)}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* ---- Divider ---- */}
        <div className="border-t border-forest/10" />

        {/* ---- Results ---- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Monthly Payment — hero stat */}
            <div className="sm:col-span-1 flex flex-col items-center justify-center p-5 rounded-xl bg-forest text-white">
              <Wallet className="h-5 w-5 mb-1 opacity-80" />
              <p className="text-xs opacity-80 mb-1">Mensualité</p>
              <p className="text-xl sm:text-2xl font-bold">
                <AnimatedNumber value={results.monthlyPayment} format={fmt} />
              </p>
            </div>

            {/* Total Interest */}
            <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gold/10 border border-gold/30">
              <TrendingDown className="h-5 w-5 mb-1 text-gold" />
              <p className="text-xs text-muted-foreground mb-1">Intérêts totaux</p>
              <p className="text-lg font-bold text-foreground">
                <AnimatedNumber value={results.totalInterest} format={fmt} />
              </p>
            </div>

            {/* Total Cost */}
            <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-sand/50 border border-border">
              <Calculator className="h-5 w-5 mb-1 text-forest" />
              <p className="text-xs text-muted-foreground mb-1">Coût total</p>
              <p className="text-lg font-bold text-foreground">
                <AnimatedNumber value={results.totalCost} format={fmt} />
              </p>
            </div>
          </div>

          {/* Donut Chart + Legend */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <DonutChart principal={results.principal} interest={results.totalInterest} />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-forest inline-block flex-shrink-0" />
                <span className="text-muted-foreground">Capital emprunté :</span>
                <span className="font-semibold text-foreground">{formatPrice(results.principal)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gold inline-block flex-shrink-0" />
                <span className="text-muted-foreground">Intérêts :</span>
                <span className="font-semibold text-foreground">{formatPrice(results.totalInterest)}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <span className="text-muted-foreground">Apport personnel :</span>
                <span className="font-semibold text-forest">{formatPrice(results.downPayment)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---- CTA ---- */}
        <div className="pt-2">
          <Button
            className="w-full sm:w-auto bg-forest hover:bg-forest-dark text-white gap-2"
            size="lg"
            onClick={() => router.goContact()}
          >
            Demander un devis
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Simulation indicative. Taux et conditions sujets à confirmation par notre partenaire bancaire.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MortgageSimulator;
