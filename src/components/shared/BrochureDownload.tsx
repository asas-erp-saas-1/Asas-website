'use client';

import { useState } from 'react';
import { FileText, Loader2, CheckCircle2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToastStore } from '@/lib/toast-store';
import { trackEvent } from '@/lib/analytics';
import { ASAS, formatPrice, formatSurface } from '@/lib/constants';
import type { Apartment, Project } from '@/lib/types';

interface BrochureDownloadProps {
  apartment: Apartment;
  project?: Project | null;
  variant?: 'full' | 'icon';
}

/**
 * Generates a printable HTML brochure for an apartment and triggers the browser print dialog.
 * The user can then "Save as PDF" via the print dialog.
 *
 * This avoids needing a PDF generation library — we open a styled print-friendly window.
 */
export function BrochureDownload({ apartment, project, variant = 'full' }: BrochureDownloadProps) {
  const [status, setStatus] = useState<'idle' | 'preparing' | 'done'>('idle');
  const addToast = useToastStore(s => s.addToast);

  const handleDownload = async () => {
    if (status === 'preparing') return;
    setStatus('preparing');

    try {
      const html = buildBrochureHtml(apartment, project);
      // Open a new window for printing — this allows us to use a clean print stylesheet
      const printWindow = window.open('', '_blank', 'width=900,height=1200');
      if (!printWindow) {
        addToast({
          title: 'Pop-up bloqué',
          description: 'Autorisez les pop-ups pour télécharger la fiche.',
          variant: 'error',
        });
        setStatus('idle');
        return;
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for images to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          // Close after print dialog (most browsers do this automatically)
          // Some browsers need a slight delay before close
          setTimeout(() => {
            try {
              printWindow.close();
            } catch {
              // ignore
            }
          }, 500);
        }, 300);
      };

      trackEvent('brochure_download', {
        apartment_id: apartment.id,
        apartment_type: apartment.apartmentType,
        apartment_surface: apartment.surface,
        project_slug: project?.slug ?? '',
      });

      addToast({
        title: 'Fiche prête',
        description: 'La fenêtre d\'impression s\'est ouverte. Choisissez "Enregistrer en PDF".',
        variant: 'success',
      });

      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      console.error('[BrochureDownload] Error:', err);
      addToast({
        title: 'Erreur',
        description: 'Impossible de générer la fiche. Réessayez.',
        variant: 'error',
      });
      setStatus('idle');
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={status === 'preparing'}
      variant={variant === 'icon' ? 'ghost' : 'outline'}
      size={variant === 'icon' ? 'icon' : 'default'}
      className={
        variant === 'full'
          ? 'border-white text-white hover:bg-white/10 bg-white/5'
          : 'text-foreground hover:text-forest hover:bg-forest/5'
      }
      aria-label="Télécharger la fiche"
      title="Télécharger la fiche en PDF"
    >
      {status === 'preparing' ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === 'done' ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {variant === 'full' && (
        <span className="ml-2">{status === 'done' ? 'Fiche prête' : 'Fiche PDF'}</span>
      )}
    </Button>
  );
}

function buildBrochureHtml(apartment: Apartment, project?: Project | null): string {
  const priceText = apartment.priceOnRequest
    ? 'Prix sur demande'
    : apartment.price != null
      ? formatPrice(apartment.price)
      : '—';

  const pricePerM2 =
    apartment.price != null && !apartment.priceOnRequest
      ? `${Math.round(apartment.price / apartment.surface).toLocaleString('fr-FR')} DZD/m²`
      : null;

  const statusLabel =
    {
      AVAILABLE: 'Disponible',
      RESERVED: 'Réservé',
      SOLD: 'Vendu',
      COMING_SOON: 'À venir',
    }[apartment.status] ?? apartment.status;

  // Parse rooms JSON if present
  let rooms: Array<{ name: string; surface: number }> = [];
  try {
    if (apartment.rooms) {
      const parsed = JSON.parse(apartment.rooms);
      if (Array.isArray(parsed)) rooms = parsed;
    }
  } catch {
    // ignore
  }

  // Extract hero image from structured images array
  const aptHeroImg = apartment.images?.find(img => img.type === 'hero')?.url
    ?? apartment.images?.find(img => img.type === 'gallery')?.url
    ?? apartment.images?.[0]?.url;
  const projHeroImg = project?.images?.find(img => img.type === 'hero')?.url
    ?? project?.images?.[0]?.url;
  const heroImage = aptHeroImg ?? projHeroImg ?? '';

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Fiche ${apartment.typeName} - ${project?.name ?? 'ASAS'}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    color: #1a1a1a;
    background: #fff;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 40px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #2d5a3d;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .logo {
    font-size: 28px;
    font-weight: 800;
    color: #2d5a3d;
    letter-spacing: -0.5px;
  }
  .logo-sub {
    font-size: 11px;
    color: #6b6b6b;
    margin-top: 2px;
  }
  .doc-meta {
    text-align: right;
    font-size: 11px;
    color: #6b6b6b;
  }
  .doc-meta strong {
    color: #2d5a3d;
    font-size: 12px;
  }
  .hero {
    background: #f5f3ee;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 24px;
    ${heroImage ? `background-image: url('${heroImage}');` : ''}
    background-size: cover;
    background-position: center;
    min-height: 280px;
    position: relative;
  }
  .hero-overlay {
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%);
    color: white;
    padding: 24px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
  .hero-type {
    font-size: 14px;
    font-weight: 600;
    color: #c9a961;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 4px;
  }
  .hero-title {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 6px 0;
    line-height: 1.1;
  }
  .hero-meta {
    font-size: 14px;
    opacity: 0.85;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }
  .card {
    background: #faf9f6;
    border: 1px solid #e5e0d6;
    border-radius: 10px;
    padding: 18px;
  }
  .card-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #2d5a3d;
    font-weight: 700;
    margin: 0 0 10px 0;
  }
  .specs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .spec {
    padding: 10px 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #ece8de;
  }
  .spec-label {
    font-size: 10px;
    text-transform: uppercase;
    color: #6b6b6b;
    letter-spacing: 0.8px;
    margin-bottom: 2px;
  }
  .spec-value {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
  }
  .price-card {
    background: #2d5a3d;
    color: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    text-align: center;
  }
  .price-card-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    opacity: 0.8;
    margin-bottom: 6px;
  }
  .price-card-value {
    font-size: 36px;
    font-weight: 800;
    margin: 0;
  }
  .price-card-perm2 {
    font-size: 13px;
    opacity: 0.8;
    margin-top: 6px;
  }
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .status-AVAILABLE { background: #d4edda; color: #155724; }
  .status-RESERVED { background: #fff3cd; color: #856404; }
  .status-SOLD { background: #f8d7da; color: #721c24; }
  .status-COMING_SOON { background: #d1ecf1; color: #0c5460; }
  table.rooms {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  table.rooms th {
    text-align: left;
    padding: 8px 12px;
    background: #f5f3ee;
    border-bottom: 2px solid #2d5a3d;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #2d5a3d;
  }
  table.rooms td {
    padding: 10px 12px;
    border-bottom: 1px solid #ece8de;
  }
  .footer-cta {
    background: #f5f3ee;
    border-left: 4px solid #c9a961;
    padding: 18px 20px;
    border-radius: 8px;
    margin-bottom: 24px;
  }
  .footer-cta p {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #1a1a1a;
  }
  .footer-cta-contact {
    font-size: 13px;
    color: #2d5a3d;
    font-weight: 600;
  }
  .doc-footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid #ece8de;
    font-size: 10px;
    color: #6b6b6b;
    display: flex;
    justify-content: space-between;
  }
  @media print {
    body { background: white; }
    .container { max-width: 100%; padding: 12mm; }
    .no-print { display: none !important; }
    @page { margin: 12mm; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div>
      <div class="logo">ASAS</div>
      <div class="logo-sub">Agence de Commercialisation Immobilière · Alger</div>
    </div>
    <div class="doc-meta">
      <strong>FICHE APPARTEMENT</strong><br />
      Document généré le ${dateStr}<br />
      Réf. ${apartment.unitNumber ?? apartment.slug}
    </div>
  </div>

  <div class="hero"${heroImage ? ` style="background-image: url('${heroImage}');"` : ''}>
    <div class="hero-overlay">
      <div class="hero-type">${apartment.apartmentType} · ${formatSurface(apartment.surface)}</div>
      <h1 class="hero-title">${apartment.typeName}</h1>
      <div class="hero-meta">${project ? `${project.name} · ` : ''}${apartment.unitNumber ? `Unité ${apartment.unitNumber}` : ''}${apartment.floor != null ? ` · Étage ${apartment.floor}${apartment.totalFloors != null ? `/${apartment.totalFloors}` : ''}` : ''}</div>
    </div>
  </div>

  <div class="price-card">
    <div class="price-card-label">Prix</div>
    <div class="price-card-value">${priceText}</div>
    ${pricePerM2 ? `<div class="price-card-perm2">${pricePerM2}</div>` : ''}
    <div style="margin-top: 12px;"><span class="status-badge status-${apartment.status}">${statusLabel}</span></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Caractéristiques</h3>
      <div class="specs">
        <div class="spec">
          <div class="spec-label">Surface</div>
          <div class="spec-value">${formatSurface(apartment.surface)}</div>
        </div>
        <div class="spec">
          <div class="spec-label">Chambres</div>
          <div class="spec-value">${apartment.bedrooms}</div>
        </div>
        <div class="spec">
          <div class="spec-label">Salles de bain</div>
          <div class="spec-value">${apartment.bathrooms ?? '—'}</div>
        </div>
        <div class="spec">
          <div class="spec-label">Balcons</div>
          <div class="spec-value">${apartment.balconies ?? 0}${apartment.balconySurface ? ` (${formatSurface(apartment.balconySurface)})` : ''}</div>
        </div>
        <div class="spec">
          <div class="spec-label">Étage</div>
          <div class="spec-value">${apartment.floor ?? '—'}</div>
        </div>
        <div class="spec">
          <div class="spec-label">Orientation</div>
          <div class="spec-value">${apartment.orientation ?? '—'}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <h3 class="card-title">Localisation</h3>
      ${project ? `
        <p style="margin:0 0 4px 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${project.name}</p>
        <p style="margin:0 0 12px 0; font-size: 13px; color: #6b6b6b;">${project.district}${project.city ? `, ${project.city}` : ''}</p>
        ${project.address ? `<p style="margin:0; font-size: 12px; color: #6b6b6b;">${project.address}</p>` : ''}
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e0d6;">
          <div style="font-size: 11px; text-transform: uppercase; color: #6b6b6b; letter-spacing: 0.8px; margin-bottom: 4px;">Livraison</div>
          <div style="font-size: 14px; font-weight: 600;">${project.deliveryQuarter ?? ''} ${project.deliveryYear ?? ''}</div>
        </div>
      ` : '<p style="margin:0; color: #6b6b6b;">Information projet non disponible</p>'}
    </div>
  </div>

  ${rooms.length > 0 ? `
    <div class="card" style="margin-bottom: 24px;">
      <h3 class="card-title">Répartition des pièces</h3>
      <table class="rooms">
        <thead>
          <tr><th>Pièce</th><th style="text-align:right;">Surface</th></tr>
        </thead>
        <tbody>
          ${rooms.map(r => `
            <tr><td>${r.name}</td><td style="text-align:right; font-weight:600;">${formatSurface(r.surface)}</td></tr>
          `).join('')}
          <tr style="background: #f5f3ee; font-weight: 700;">
            <td>Total</td><td style="text-align:right;">${formatSurface(apartment.surface)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : ''}

  ${apartment.paymentPlan ? `
    <div class="card" style="margin-bottom: 24px;">
      <h3 class="card-title">Plan de paiement</h3>
      <p style="margin: 0; font-size: 14px;">${apartment.paymentPlan}</p>
    </div>
  ` : ''}

  ${project?.description ? `
    <div class="card" style="margin-bottom: 24px;">
      <h3 class="card-title">À propos du projet</h3>
      <p style="margin: 0; font-size: 13px; line-height: 1.6;">${project.description}</p>
    </div>
  ` : ''}

  <div class="footer-cta">
    <p><strong>Intéressé par cet appartement ?</strong></p>
    <p style="font-size: 13px; color: #6b6b6b;">Contactez notre équipe pour organiser une visite ou obtenir plus d'informations.</p>
    <div style="margin-top: 8px;">
      <span class="footer-cta-contact">📞 ${ASAS.phone}</span>
      <span style="margin: 0 12px; color: #ece8de;">|</span>
      <span class="footer-cta-contact">✉ ${ASAS.email}</span>
      <span style="margin: 0 12px; color: #ece8de;">|</span>
      <span class="footer-cta-contact">💬 WhatsApp: ${ASAS.whatsapp}</span>
    </div>
  </div>

  <div class="doc-footer">
    <div>ASAS — Agence de Commercialisation Immobilière · ${ASAS.city}, ${ASAS.country}</div>
    <div>${apartment.slug}</div>
  </div>
</div>
</body>
</html>`;
}
