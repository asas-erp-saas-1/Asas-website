'use client';

import { useState } from 'react';
import { CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToastStore } from '@/lib/toast-store';
import { trackEvent } from '@/lib/analytics';
import { ASAS, formatPrice, formatSurface } from '@/lib/constants';
import type { PublicApartmentDetail, PublicApartmentProjectSummary, PublicProjectDetail } from '@/lib/catalog-contracts';

type BrochureProject = PublicApartmentProjectSummary | PublicProjectDetail;

interface BrochureDownloadProps {
  apartment: PublicApartmentDetail;
  project?: BrochureProject | null;
  variant?: 'full' | 'icon';
}

export function BrochureDownload({ apartment, project, variant = 'full' }: BrochureDownloadProps) {
  const [status, setStatus] = useState<'idle' | 'preparing' | 'done'>('idle');
  const addToast = useToastStore(s => s.addToast);

  const handleDownload = () => {
    if (status === 'preparing') return;
    setStatus('preparing');
    try {
      const printWindow = window.open('', '_blank', 'width=900,height=1200');
      if (!printWindow) {
        addToast({ title: 'Pop-up bloqué', description: 'Autorisez les pop-ups pour télécharger la fiche.', variant: 'error' });
        setStatus('idle');
        return;
      }
      printWindow.document.open();
      printWindow.document.write(buildBrochureHtml(apartment, project));
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => { try { printWindow.close(); } catch {} }, 500);
        }, 300);
      };
      trackEvent('brochure_download', { apartment_id: apartment.id, apartment_type: apartment.apartmentType, apartment_surface: apartment.surface, project_slug: project?.slug ?? '' });
      addToast({ title: 'Fiche prête', description: 'Choisissez « Enregistrer en PDF » dans la fenêtre d’impression.', variant: 'success' });
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (error) {
      console.error('[BrochureDownload]', error);
      addToast({ title: 'Erreur', description: 'Impossible de générer la fiche. Réessayez.', variant: 'error' });
      setStatus('idle');
    }
  };

  return (
    <Button type="button" onClick={handleDownload} disabled={status === 'preparing'} variant={variant === 'icon' ? 'ghost' : 'outline'} size={variant === 'icon' ? 'icon' : 'default'} className={variant === 'full' ? 'border-white text-white hover:bg-white/10 bg-white/5' : 'text-foreground hover:text-forest hover:bg-forest/5'} aria-label="Télécharger la fiche" title="Télécharger la fiche en PDF">
      {status === 'preparing' ? <Loader2 className="h-4 w-4 animate-spin" /> : status === 'done' ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      {variant === 'full' && <span className="ml-2">{status === 'done' ? 'Fiche prête' : 'Fiche PDF'}</span>}
    </Button>
  );
}

function buildBrochureHtml(apartment: PublicApartmentDetail, project?: BrochureProject | null): string {
  const esc = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
  const price = apartment.priceOnRequest ? 'Prix sur demande' : apartment.price != null ? formatPrice(apartment.price) : '—';
  const pricePerM2 = apartment.price != null && !apartment.priceOnRequest ? `${Math.round(apartment.price / apartment.surface).toLocaleString('fr-FR')} DZD/m²` : '';
  const status = ({ AVAILABLE: 'Disponible', RESERVED: 'Réservé', SOLD: 'Vendu', COMING_SOON: 'À venir' } as Record<string, string>)[apartment.status] ?? apartment.status;
  const projectName = project?.name ?? apartment.project?.name ?? 'ASAS';
  const location = project ? `${project.district}, ${project.city}` : apartment.project ? `${apartment.project.district}, ${apartment.project.city}` : '';
  const images = apartment.images ?? [];
  const hero = images.find(image => image.type === 'hero')?.url ?? images.find(image => image.type === 'gallery')?.url ?? images[0]?.url ?? '';
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  let rooms: Array<{ name: string; surface: number }> = [];
  try { const parsed = apartment.rooms ? JSON.parse(apartment.rooms) : []; if (Array.isArray(parsed)) rooms = parsed.filter(item => item && typeof item.name === 'string' && typeof item.surface === 'number'); } catch {}
  const spec = (label: string, value: unknown) => `<div class="spec"><span>${esc(label)}</span><strong>${esc(value ?? '—')}</strong></div>`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Fiche ${esc(apartment.typeName)} - ${esc(projectName)}</title><style>*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#1a1a1a;background:#fff;line-height:1.45}.page{max-width:820px;margin:auto;padding:32px}.header{display:flex;justify-content:space-between;border-bottom:3px solid #2d5a3d;padding-bottom:14px;margin-bottom:20px}.logo{font-size:28px;font-weight:800;color:#2d5a3d}.sub{font-size:11px;color:#666}.meta{text-align:right;font-size:11px;color:#666}.meta strong{color:#2d5a3d}.hero{min-height:280px;border-radius:12px;background:#f5f3ee ${hero ? `url('${esc(hero)}') center/cover no-repeat` : ''};position:relative;overflow:hidden}.overlay{position:absolute;inset:auto 0 0;padding:24px;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.78))}.type{color:#c9a961;text-transform:uppercase;font-weight:700;letter-spacing:1.5px}.title{font-size:32px;margin:4px 0;font-weight:800}.price{background:#2d5a3d;color:#fff;text-align:center;padding:22px;border-radius:12px;margin:20px 0}.price strong{display:block;font-size:34px}.badge{display:inline-block;margin-top:8px;padding:4px 12px;border-radius:999px;background:#fff;color:#2d5a3d;font-size:11px;font-weight:700}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{border:1px solid #e5e0d6;background:#faf9f6;border-radius:10px;padding:18px}.card h2{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#2d5a3d;margin:0 0 12px}.specs{display:grid;grid-template-columns:1fr 1fr;gap:10px}.spec{background:#fff;border:1px solid #ece8de;border-radius:8px;padding:10px}.spec span{display:block;font-size:10px;text-transform:uppercase;color:#777}.spec strong{display:block;font-size:15px}.rooms{width:100%;border-collapse:collapse}.rooms th,.rooms td{text-align:left;padding:9px;border-bottom:1px solid #e5e0d6}.cta{margin-top:20px;padding:18px;background:#f5f3ee;border-left:4px solid #c9a961;border-radius:8px}.footer{margin-top:25px;padding-top:12px;border-top:1px solid #ddd;font-size:10px;color:#777;display:flex;justify-content:space-between}@media print{.page{padding:12mm}@page{margin:12mm}}</style></head><body><main class="page"><header class="header"><div><div class="logo">ASAS</div><div class="sub">Agence de Commercialisation Immobilière · Alger</div></div><div class="meta"><strong>FICHE APPARTEMENT</strong><br>Généré le ${esc(date)}<br>Réf. ${esc(apartment.unitNumber ?? apartment.slug)}</div></header><section class="hero"><div class="overlay"><div class="type">${esc(apartment.apartmentType)} · ${esc(formatSurface(apartment.surface))}</div><h1 class="title">${esc(apartment.typeName)}</h1><div>${esc(projectName)}${location ? ` · ${esc(location)}` : ''}${apartment.unitNumber ? ` · Unité ${esc(apartment.unitNumber)}` : ''}${apartment.floor != null ? ` · Étage ${esc(apartment.floor)}` : ''}</div></div></section><section class="price"><div>PRIX</div><strong>${esc(price)}</strong>${pricePerM2 ? `<div>${esc(pricePerM2)}</div>` : ''}<span class="badge">${esc(status)}</span></section><section class="grid"><article class="card"><h2>Caractéristiques</h2><div class="specs">${spec('Surface', formatSurface(apartment.surface))}${spec('Chambres', apartment.bedrooms)}${spec('Salles de bain', apartment.bathrooms)}${spec('Balcons', apartment.balconies)}${spec('Étage', apartment.floor)}${spec('Orientation', apartment.orientation)}${spec('Parking', apartment.hasParking ? `${apartment.parkingSpots ?? 1} place(s)` : 'Non')}${spec('Terrasse', apartment.hasTerrace ? (apartment.terraceSurface ? `${apartment.terraceSurface} m²` : 'Oui') : 'Non')}${spec('Jardin', apartment.hasGarden ? (apartment.gardenSurface ? `${apartment.gardenSurface} m²` : 'Oui') : 'Non')}${spec('Paiement', apartment.paymentPlan)}</div></article><article class="card"><h2>Projet</h2><div class="specs">${spec('Projet', projectName)}${spec('Ville', project?.city ?? apartment.project?.city)}${spec('Quartier', project?.district ?? apartment.project?.district)}${spec('Ascenseur', apartment.project?.hasElevator ? 'Oui' : 'Non')}${spec('Sécurité', apartment.project?.hasSecurity ? 'Oui' : 'Non')}</div></article></section>${rooms.length ? `<section class="card" style="margin-top:20px"><h2>Distribution</h2><table class="rooms"><thead><tr><th>Pièce</th><th>Surface</th></tr></thead><tbody>${rooms.map(room => `<tr><td>${esc(room.name)}</td><td>${esc(room.surface)} m²</td></tr>`).join('')}</tbody></table></section>` : ''}<section class="cta"><strong>Intéressé par cet appartement ?</strong><br>Contactez ASAS pour les disponibilités, le prix et les conditions de réservation.<br><strong>${esc(ASAS.phone)} · ${esc(ASAS.email)}</strong></section><footer class="footer"><span>ASAS · Agence de Commercialisation Immobilière</span><span>${esc(date)}</span></footer></main></body></html>`;
}
