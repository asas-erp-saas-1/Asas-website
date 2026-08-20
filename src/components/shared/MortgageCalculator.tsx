'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useMotionValue, useSpring, useTransform, animate, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { formatPrice } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  ArrowRight,
  TrendingDown,
  Wallet,
  Percent,
  PiggyBank,
  Landmark,
  ChevronDown,
} from 'lucide-react';

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
  return new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(Math.round(amount)) + ' DA';
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

  if (monthlyRate === 0 || principal <= 0) {
    const monthly = principal / numPayments;
    return {
      monthlyPayment: monthly,
      totalInterest: 0,
      totalCost: propertyPrice,
      principal,
      downPayment,
      interestPct: 0,
    };
  }

  const monthlyPayment =
    principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - principal;
  const totalCost = totalPaid + downPayment;
  const interestPct = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0;

  return { monthlyPayment, totalInterest, totalCost, principal, downPayment, interestPct };
}

/* ---------- Animated Number (framer-motion spring) ---------- */

function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 120,
    damping: 30,
    mass: 0.5,
  });
  const rounded = useTransform(springVal, (latest) => Math.round(latest));
  const [displayStr, setDisplayStr] = useState(format(value));

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.6,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, motionVal]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      setDisplayStr(format(v));
    });
    return unsubscribe;
  }, [rounded, format]);

  return <span ref={ref}>{displayStr}</span>;
}

/* ---------- SVG Donut Chart ---------- */

function DonutChart({ principal, interest }: { principal: number; interest: number }) {
  const total = principal + interest;
  if (total === 0) return null;

  const principalPct = principal / total;
  const interestPct = interest / total;

  const radius = 70;
  const strokeWidth = 22;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;

  const principalDash = principalPct * circumference;
  const interestDash = interestPct * circumference;
  const rotation = -90;

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[180px] mx-auto">
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

/* ---------- LOAN TERMS ---------- */

const LOAN_TERMS = [
  { value: 10, label: '10 ans' },
  { value: 15, label: '15 ans' },
  { value: 20, label: '20 ans' },
  { value: 25, label: '25 ans' },
  { value: 30, label: '30 ans' },
];

/* ---------- Component ---------- */

interface MortgageCalculatorProps {
  defaultPrice?: number;
}

export function MortgageCalculator({ defaultPrice }: MortgageCalculatorProps) {
  const router = useRouter();
  const fmt = useCallback((v: number) => formatDZD(v), []);

  const {
    control,
    formState: { errors },
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageSchema),
    defaultValues: {
      propertyPrice: defaultPrice ?? 15_000_000,
      downPaymentPercent: 30,
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
            <CardTitle className="text-lg text-foreground">Simulateur de crédit immobilier</CardTitle>
            <CardDescription>Estimez vos mensualités en quelques secondes</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---- Inputs Column ---- */}
          <div className="space-y-5">
            {/* Property Price */}
            <div className="space-y-2">
              <Label htmlFor="mc-propertyPrice" className="text-foreground text-sm font-medium">
                Prix du bien
              </Label>
              <Controller
                name="propertyPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    id="mc-propertyPrice"
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

            {/* Down Payment */}
            <div className="space-y-2">
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

            {/* Loan Duration — Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-sm font-medium">Durée du crédit</Label>
                <span className="text-sm font-semibold text-forest">{loanTermYears} ans</span>
              </div>
              <Controller
                name="loanTermYears"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={5}
                    max={30}
                    step={5}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                    className="py-2 [&_[data-slot=slider-track]]:bg-forest/10 [&_[data-slot=slider-range]]:bg-forest [&_[data-slot=slider-thumb]]:border-forest"
                  />
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {LOAN_TERMS.map((t) => (
                  <span key={t.value}>{t.label}</span>
                ))}
              </div>
            </div>

            {/* Interest Rate — Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-sm font-medium">Taux d&apos;intérêt</Label>
                <span className="text-sm font-semibold text-forest">
                  {interestRate}% <span className="text-muted-foreground font-normal">/ an</span>
                </span>
              </div>
              <Controller
                name="interestRate"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={1}
                    max={15}
                    step={0.1}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                    className="py-2 [&_[data-slot=slider-track]]:bg-forest/10 [&_[data-slot=slider-range]]:bg-forest [&_[data-slot=slider-thumb]]:border-forest"
                  />
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>5%</span>
                <span>10%</span>
                <span>15%</span>
              </div>
            </div>
          </div>

          {/* ---- Results Column ---- */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Monthly Payment — hero stat */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-forest text-white">
              <Wallet className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-xs opacity-80 mb-1">Mensualité</p>
              <p className="text-2xl sm:text-3xl font-bold">
                <AnimatedNumber value={results.monthlyPayment} format={fmt} />
              </p>
            </div>

            {/* Total Cost + Interest side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-sand/50 border border-border">
                <Landmark className="h-5 w-5 mb-1 text-forest" />
                <p className="text-[10px] text-muted-foreground mb-1 text-center">Coût total du crédit</p>
                <p className="text-sm font-bold text-foreground">
                  <AnimatedNumber value={results.totalCost} format={fmt} />
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gold/10 border border-gold/30">
                <TrendingDown className="h-5 w-5 mb-1 text-gold" />
                <p className="text-[10px] text-muted-foreground mb-1 text-center">Part des intérêts</p>
                <p className="text-sm font-bold text-foreground">
                  <AnimatedNumber value={results.totalInterest} format={fmt} />
                </p>
                <p className="text-xs font-semibold text-gold mt-0.5">
                  {results.interestPct.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Donut Chart + Legend */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <DonutChart principal={results.principal} interest={results.totalInterest} />
              </div>
              <div className="space-y-2 text-sm flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-forest inline-block flex-shrink-0" />
                  <span className="text-muted-foreground">Capital emprunté :</span>
                  <span className="font-semibold text-foreground ml-auto">{formatPrice(results.principal)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gold inline-block flex-shrink-0" />
                  <span className="text-muted-foreground">Intérêts :</span>
                  <span className="font-semibold text-foreground ml-auto">{formatPrice(results.totalInterest)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-3.5 w-3.5 text-forest flex-shrink-0" />
                  <span className="text-muted-foreground">Apport personnel :</span>
                  <span className="font-semibold text-forest ml-auto">{formatPrice(results.downPayment)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ---- CTA ---- */}
        <div className="pt-4 mt-4 border-t border-forest/10">
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

export default MortgageCalculator;
