'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Building2, Home, Building, Users, Settings,
  ChevronRight, Eye, EyeOff, Star, StarOff, Trash2, RefreshCw,
  Plus, Filter, ArrowUpDown, Loader2, Image as ImageIcon, Upload, X, Search, Menu, LogOut, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/constants';
import { adminRouteHref, getAdminRoute, type AdminWorkspaceId } from '@/lib/admin-route';
import AdminApartmentsWorkspace from '@/components/admin/AdminApartmentsWorkspace';
import AdminProjectsWorkspace from '@/components/admin/AdminProjectsWorkspace';
import AdminLeadsPremiumWorkspace from '@/components/admin/AdminLeadsPremiumWorkspace';
import AdminBuildingsWorkspace from '@/components/admin/AdminBuildingsWorkspace';

/* ─── Types ─── */

interface AdminProject {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  city: string;
  district: string;
  projectType: string;
  status: string;
  published: boolean;
  featured: boolean;
  startingPrice?: number;
  priceOnRequest: boolean;
  deliveryYear?: number;
  deliveryQuarter?: string;
  apartmentCount: number;
  heroImage: string | null;
  developer?: { id: string; name: string; slug: string };
  order: number;
  createdAt: string;
  updatedAt?: string;
}

interface AdminApartment {
  id: string;
  slug: string;
  unitNumber?: string;
  apartmentType: string;
  typeName: string;
  surface: number;
  floor?: number;
  orientation?: string;
  bedrooms: number;
  bathrooms?: number;
  hasParking?: boolean;
  parkingSpots?: number;
  status: string;
  price?: number;
  priceOnRequest: boolean;
  published: boolean;
  order: number;
  building?: { id: string; name: string; code: string };
  project: { id: string; slug: string; name: string; district: string; city: string };
  heroImage: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface AdminLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  intent: string;
  message?: string;
  projectName?: string;
  apartmentName?: string;
  source?: string;
  status: string;
  createdAt: string;
}

interface AdminBuilding {
  id: string;
  slug: string;
  name: string;
  code: string;
  floors: number;
  hasElevator: boolean;
  apartmentCount: number;
  project: { id: string; slug: string; name: string };
}

/* ─── Helpers ─── */

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── API Fetch Helpers ─── */

async function fetchAdminProjects(): Promise<AdminProject[]> {
  const limit = 100;
  const firstRes = await fetch(`/api/admin/projects?page=1&limit=${limit}`, { credentials: 'include' });
  if (!firstRes.ok) throw new Error('Failed to fetch projects');
  const firstJson = await firstRes.json() as { data?: AdminProject[]; meta?: { totalPages?: number } };
  const firstPage = firstJson.data ?? [];
  const totalPages = Math.max(1, firstJson.meta?.totalPages ?? 1);
  if (totalPages === 1) return firstPage;

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map(async (page) => {
      const res = await fetch(`/api/admin/projects?page=${page}&limit=${limit}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const json = await res.json() as { data?: AdminProject[] };
      return json.data ?? [];
    }),
  );

  return [...firstPage, ...remaining.flat()];
}

async function fetchAdminApartments(filters: { projectSlug?: string; status?: string; type?: string }): Promise<AdminApartment[]> {
  const params = new URLSearchParams();
  if (filters.projectSlug) params.set('projectSlug', filters.projectSlug);
  if (filters.status) params.set('status', filters.status);
  if (filters.type) params.set('type', filters.type);
  params.set('limit', '50');
  const res = await fetch(`/api/admin/apartments?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch apartments');
  const json = await res.json();
  return json.data ?? [];
}

async function fetchAdminBuildings(): Promise<AdminBuilding[]> {
  const res = await fetch('/api/admin/buildings');
  if (!res.ok) throw new Error('Failed to fetch buildings');
  const json = await res.json();
  return json.data ?? [];
}

async function fetchAdminLeads(statusFilter?: string): Promise<AdminLead[]> {
  const params = new URLSearchParams();
  if (statusFilter) params.set('status', statusFilter);
  params.set('limit', '50');
  const res = await fetch(`/api/admin/leads?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leads');
  const json = await res.json();
  return json.data ?? [];
}

/* ─── Status Badge ─── */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    AVAILABLE: { label: 'Disponible', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    RESERVED: { label: 'Réservé', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    SOLD: { label: 'Vendu', className: 'bg-red-100 text-red-800 border-red-200' },
    COMING_SOON: { label: 'Bientôt', className: 'bg-sky-100 text-sky-800 border-sky-200' },
    OFF_MARKET: { label: 'Retiré', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    DRAFT: { label: 'Brouillon', className: 'bg-gray-100 text-gray-500 border-gray-200' },
    SOLD_OUT: { label: 'Épuisé', className: 'bg-red-100 text-red-800 border-red-200' },
    NEW: { label: 'Nouveau', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    CONTACTED: { label: 'Contacté', className: 'bg-sky-100 text-sky-800 border-sky-200' },
    QUALIFIED: { label: 'Qualifié', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    VISIT: { label: 'Visite prévue', className: 'bg-violet-100 text-violet-800 border-violet-200' },
    NEGOTIATION: { label: 'Négociation', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    CONVERTED: { label: 'Converti', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    LOST: { label: 'Perdu', className: 'bg-red-100 text-red-800 border-red-200' },
  };
  const c = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}

/* ─── Intent Label ─── */

function IntentLabel({ intent }: { intent: string }) {
  const labels: Record<string, string> = {
    REQUEST_INFORMATION: 'Info',
    REQUEST_PRICE: 'Prix',
    REQUEST_FLOOR_PLAN: 'Plan',
    BOOK_VISIT: 'Visite',
    WHATSAPP: 'WhatsApp',
    CALL: 'Appel',
    RESERVATION: 'Réservation',
  };
  return <span className="text-xs">{labels[intent] ?? intent}</span>;
}

/* ─── Sidebar ─── */

type TabId = 'dashboard' | 'projects' | 'apartments' | 'buildings' | 'media' | 'videos' | 'leads' | 'audit' | 'users' | 'settings';

interface SidebarItem { id: TabId; label: string; icon: typeof LayoutDashboard }
interface SidebarGroup { label: string; items: SidebarItem[] }

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: '',
    items: [{ id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard }],
  },
  {
    label: 'GESTION DU SITE',
    items: [
      { id: 'projects', label: 'Projets', icon: Building2 },
      { id: 'buildings', label: 'Bâtiments', icon: Building },
      { id: 'apartments', label: 'Appartements', icon: Home },
      { id: 'media', label: 'Médiathèque', icon: ImageIcon },
      { id: 'videos', label: 'Vidéos', icon: ImageIcon },
    ],
  },
  {
    label: 'GESTION DES CLIENTS',
    items: [{ id: 'leads', label: 'Leads & suivi commercial', icon: Users }],
  },
  {
    label: 'SYSTÈME',
    items: [
      { id: 'users', label: 'Utilisateurs', icon: Users },
      { id: 'audit', label: 'Journal d\'audit', icon: RefreshCw },
      { id: 'settings', label: 'Paramètres', icon: Settings },
    ],
  },
];

// Flattened for backwards compat with lookup-by-id code
const SIDEBAR_ITEMS: SidebarItem[] = SIDEBAR_GROUPS.flatMap(g => g.items);

/* ─── Dashboard Tab ─── */

function DashboardTab({
  stats,
  leads,
  projects,
  apartments,
  onNavigate,
  onCreateProject,
  onCreateApartment,
}: {
  stats: {
    totalProjects: number;
    totalApartments: number;
    availableCount: number;
    reservedCount: number;
    soldCount: number;
    totalLeads: number;
    newLeadsCount: number;
    intentBreakdown: Record<string, number>;
  };
  leads: AdminLead[];
  projects: AdminProject[];
  apartments: AdminApartment[];
  onNavigate: (tab: TabId) => void;
  onCreateProject: () => void;
  onCreateApartment: () => void;
}) {
  const qc = useQueryClient();

  // Lead intent breakdown (WhatsApp / Call / Form / Other)
  const intentBreakdown = stats.intentBreakdown;

  const intentLabels: Record<string, string> = {
    REQUEST_INFORMATION: 'Demande d\'infos',
    REQUEST_PRICE: 'Demande de prix',
    REQUEST_FLOOR_PLAN: 'Demande de plan',
    BOOK_VISIT: 'Demande de visite',
    WHATSAPP: 'WhatsApp',
    CALL: 'Appel',
    RESERVATION: 'Réservation',
  };

  // Most recent projects (sorted by createdAt desc)
  const recentProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    }).slice(0, 5);
  }, [projects]);

  // Most recent apartments
  const recentApartments = useMemo(() => {
    return [...apartments].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    }).slice(0, 5);
  }, [apartments]);

  // ─── Content Completeness ───
  // Per directive §20: every project + apartment should have a completion score.
  // Compute from existing summary fields (without fetching full data).
  function projectCompleteness(p: AdminProject): { score: number; missing: string[] } {
    const checks: { label: string; ok: boolean }[] = [
      { label: 'Nom', ok: !!p.name },
      { label: 'Localisation', ok: !!p.district && !!p.city },
      { label: 'Statut', ok: !!p.status },
      { label: 'Appartements', ok: p.apartmentCount > 0 },
      { label: 'Prix de départ', ok: !!p.startingPrice || p.priceOnRequest },
      { label: 'Image hero', ok: !!p.heroImage },
      { label: 'Publié', ok: p.published },
    ];
    const passed = checks.filter(c => c.ok).length;
    const missing = checks.filter(c => !c.ok).map(c => c.label);
    return { score: Math.round((passed / checks.length) * 100), missing };
  }

  function apartmentCompleteness(a: AdminApartment): { score: number; missing: string[] } {
    const checks: { label: string; ok: boolean }[] = [
      { label: 'Type', ok: !!a.apartmentType },
      { label: 'Nom du type', ok: !!a.typeName },
      { label: 'Surface', ok: !!a.surface && a.surface > 0 },
      { label: 'Étage', ok: a.floor !== undefined && a.floor !== null },
      { label: 'Chambres', ok: a.bedrooms > 0 },
      { label: 'Prix', ok: !!a.price || a.priceOnRequest },
      { label: 'Orientation', ok: !!a.orientation },
      { label: 'Image hero', ok: !!a.heroImage },
      { label: 'Publié', ok: a.published },
    ];
    const passed = checks.filter(c => c.ok).length;
    const missing = checks.filter(c => !c.ok).map(c => c.label);
    return { score: Math.round((passed / checks.length) * 100), missing };
  }

  // Projects needing attention: score < 100% OR not published
  const projectsNeedingAttention = useMemo(() => {
    return projects
      .map(p => ({ project: p, ...projectCompleteness(p) }))
      .filter(item => item.score < 100 || item.missing.length > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  }, [projects]);

  const apartmentsNeedingAttention = useMemo(() => {
    return apartments
      .map(a => ({ apartment: a, ...apartmentCompleteness(a) }))
      .filter(item => item.score < 100 || item.missing.length > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  }, [apartments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-charcoal">Tableau de Bord</h2>
        <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ['admin'] })} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-forest">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Projets</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-forest">{stats.totalProjects}</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Disponibles</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-emerald-600">{stats.availableCount}</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Réservés</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-amber-600">{stats.reservedCount}</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Leads (nouveaux)</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-sky-600">{stats.newLeadsCount} <span className="text-sm font-normal text-muted-foreground">/ {stats.totalLeads}</span></p></CardContent>
        </Card>
      </div>

      {/* Apartment distribution + Lead intent breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Répartition des Appartements</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Disponibles', count: stats.availableCount, color: 'bg-emerald-500' },
                { label: 'Réservés', count: stats.reservedCount, color: 'bg-amber-500' },
                { label: 'Vendus', count: stats.soldCount, color: 'bg-red-500' },
                { label: 'Total', count: stats.totalApartments, color: 'bg-charcoal' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div>
                    <p className="text-lg font-semibold">{item.count}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Intention des Leads</CardTitle></CardHeader>
          <CardContent>
            {stats.totalLeads === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun lead pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(intentBreakdown).map(([intent, count]) => (
                  <div key={intent} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-muted-foreground">{intentLabels[intent] ?? intent}</div>
                    <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                      <div className="bg-forest h-full transition-all" style={{ width: `${(count / stats.totalLeads) * 100}%` }} />
                    </div>
                    <div className="text-xs font-medium w-8 text-right">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Actions Rapides</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2 bg-forest hover:bg-forest/90 text-white" onClick={onCreateProject}>
              <Plus className="h-4 w-4" /> Nouveau Projet
            </Button>
            <Button className="gap-2 bg-forest hover:bg-forest/90 text-white" onClick={onCreateApartment}>
              <Plus className="h-4 w-4" /> Nouvel Appartement
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => onNavigate('media')}>
              <Upload className="h-4 w-4" /> Téléverser un média
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => onNavigate('leads')}>
              <Users className="h-4 w-4" /> Voir Leads
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent leads + Recent apartments side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {leads.length > 0 && (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Leads Récents</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('leads')} className="text-xs">Voir tout →</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.phone} · {lead.projectName ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <IntentLabel intent={lead.intent} />
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {recentApartments.length > 0 && (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Appartements Récents</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('apartments')} className="text-xs">Voir tout →</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentApartments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{apt.typeName}</p>
                      <p className="text-xs text-muted-foreground truncate">{apt.project?.name ?? '—'} · {apt.surface} m²</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={apt.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Projects needing attention — completion score */}
      {projectsNeedingAttention.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-amber-600">⚠</span>
                Projets nécessitant attention
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Complétion {`<`} 100% — informations manquantes.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('projects')} className="text-xs">Voir tout →</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectsNeedingAttention.map(({ project, score, missing }) => (
                <div key={project.id} className="flex items-center gap-3 bg-white border border-amber-200 rounded-md p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.district}, {project.city}</p>
                    {missing.length > 0 && (
                      <p className="text-xs text-amber-700 mt-1">
                        <span className="font-medium">Manquant:</span> {missing.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-bold ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apartments needing attention */}
      {apartmentsNeedingAttention.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-amber-600">⚠</span>
                Appartements nécessitant attention
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Complétion {`<`} 100% — informations manquantes.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('apartments')} className="text-xs">Voir tout →</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apartmentsNeedingAttention.map(({ apartment, score, missing }) => (
                <div key={apartment.id} className="flex items-center gap-3 bg-white border border-amber-200 rounded-md p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{apartment.typeName}</p>
                    <p className="text-xs text-muted-foreground truncate">{apartment.project?.name ?? '—'} · {apartment.surface} m²</p>
                    {missing.length > 0 && (
                      <p className="text-xs text-amber-700 mt-1">
                        <span className="font-medium">Manquant:</span> {missing.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-bold ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent projects */}
      {recentProjects.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Projets Récents</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('projects')} className="text-xs">Voir tout →</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProjects.map((p) => (
                <div key={p.id} className="border border-border rounded-md p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{p.district}, {p.city}</p>
                  <p className="text-xs text-muted-foreground">{p.apartmentCount} lots · {p.published ? 'Publié' : 'Brouillon'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Projects Tab ─── */

function ProjectsTab({
  projects,
  isLoading,
  onEdit,
  onCreate,
}: {
  projects: AdminProject[];
  isLoading: boolean;
  onEdit: (project: AdminProject) => void;
  onCreate: () => void;
}) {
  const qc = useQueryClient();

  const togglePublished = useMutation({
    mutationFn: async ({ slug, published }: { slug: string; published: boolean }) => {
      const res = await fetch(`/api/admin/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'projects'] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ slug, featured }: { slug: string; featured: boolean }) => {
      const res = await fetch(`/api/admin/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'projects'] }),
  });

  const archive = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/admin/projects/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'projects'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-charcoal">Projets</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'projects'] })} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Actualiser
          </Button>
          <Button size="sm" className="gap-2 bg-forest hover:bg-forest/90" onClick={onCreate}>
            <Plus className="h-3.5 w-3.5" /> Nouveau
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-forest" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Quartier</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Publié</TableHead>
                  <TableHead className="text-center">Apts</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Aucun projet trouvé</TableCell>
                  </TableRow>
                ) : projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{project.district}, {project.city}</TableCell>
                    <TableCell><StatusBadge status={project.status} /></TableCell>
                    <TableCell>
                      <button
                        type="button"
                        disabled={togglePublished.isPending || archive.isPending}
                        onClick={() => togglePublished.mutate({ slug: project.slug, published: !project.published })}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                          project.published
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                        }`}
                        title={project.published ? 'Dépublier' : 'Publier'}
                      >
                        {project.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {project.published ? 'Publié' : 'Brouillon'}
                      </button>
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">{project.apartmentCount}</TableCell>
                    <TableCell>
                      <button type="button" disabled={toggleFeatured.isPending || archive.isPending} onClick={() => toggleFeatured.mutate({ slug: project.slug, featured: !project.featured })} className="text-muted-foreground hover:text-amber-500 transition-colors" title={project.featured ? 'Retirer des favoris' : 'Mettre en avant'}>
                        {project.featured ? <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> : <StarOff className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm">
                      {project.priceOnRequest ? 'Sur demande' : project.startingPrice ? formatPrice(project.startingPrice) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/#/projects/${project.slug}`, '_blank', 'noopener,noreferrer')}
                          className="h-9 w-9 px-0"
                          title="Aperçu sur le site"
                          aria-label={`Aperçu de ${project.name} sur le site`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(project)} className="h-7 px-2" title="Modifier"><ChevronRight className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Archiver le projet "${project.name}" ? Il sera dépublié et masqué du site public.`)) archive.mutate(project.slug); }} className="h-7 px-2 text-red-500 hover:text-red-700" title="Archiver"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Apartments Tab ─── */

function ApartmentsTab({
  apartments,
  projects,
  isLoading,
  projectFilter,
  statusFilter,
  typeFilter,
  onProjectFilterChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onEdit,
  onCreate,
}: {
  apartments: AdminApartment[];
  projects: AdminProject[];
  isLoading: boolean;
  projectFilter: string;
  statusFilter: string;
  typeFilter: string;
  onProjectFilterChange: (val: string) => void;
  onStatusFilterChange: (val: string) => void;
  onTypeFilterChange: (val: string) => void;
  onEdit: (apt: AdminApartment) => void;
  onCreate: () => void;
}) {
  const qc = useQueryClient();
  // Inline price quick edit state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState('');
  const [priceConfirmInline, setPriceConfirmInline] = useState<{ apt: AdminApartment; oldPrice: number | null; newPrice: number | null } | null>(null);

  const savePriceInline = useMutation({
    mutationFn: async ({ slug, price }: { slug: string; price: number | null }) => {
      const res = await fetch(`/api/admin/apartments/${slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price }) });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'apartments'] }),
  });

  const togglePublished = useMutation({
    mutationFn: async ({ slug, published }: { slug: string; published: boolean }) => {
      const res = await fetch(`/api/admin/apartments/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'apartments'] }),
  });

  const changeStatus = useMutation({
    mutationFn: async ({ slug, status }: { slug: string; status: string }) => {
      const res = await fetch(`/api/admin/apartments/${slug}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed');
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'apartments'] }),
  });

  const archive = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/admin/apartments/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'apartments'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-charcoal">Appartements</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'apartments'] })} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Actualiser
          </Button>
          <Button size="sm" className="gap-2 bg-forest hover:bg-forest/90" onClick={onCreate}>
            <Plus className="h-3.5 w-3.5" /> Nouveau
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtres:</span>
        </div>
        <Select value={projectFilter} onValueChange={onProjectFilterChange}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Projet" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les projets</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="AVAILABLE">Disponible</SelectItem>
            <SelectItem value="RESERVED">Réservé</SelectItem>
            <SelectItem value="SOLD">Vendu</SelectItem>
            <SelectItem value="COMING_SOON">Bientôt</SelectItem>
            <SelectItem value="OFF_MARKET">Retiré</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="F2">F2</SelectItem>
            <SelectItem value="F3">F3</SelectItem>
            <SelectItem value="F4">F4</SelectItem>
            <SelectItem value="F5">F5</SelectItem>
            <SelectItem value="Duplex">Duplex</SelectItem>
            <SelectItem value="Studio">Studio</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-forest" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unité</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Surface</TableHead>
                  <TableHead>Projet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix <span className="text-[10px] text-muted-foreground font-normal">(cliquer)</span></TableHead>
                  <TableHead>Compl.</TableHead>
                  <TableHead>Publié</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Aucun appartement trouvé</TableCell>
                  </TableRow>
                ) : apartments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{apt.unitNumber ?? apt.typeName}</p>
                        <p className="text-xs text-muted-foreground">{apt.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{apt.apartmentType}</TableCell>
                    <TableCell className="text-sm">{apt.surface} m²</TableCell>
                    <TableCell className="text-sm">{apt.project.name}</TableCell>
                    <TableCell>
                      <Select value={apt.status} onValueChange={(val) => changeStatus.mutate({ slug: apt.slug, status: val })}>
                        <SelectTrigger className="h-7 w-32 border-0 p-0 focus:ring-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">Disponible</SelectItem>
                          <SelectItem value="RESERVED">Réservé</SelectItem>
                          <SelectItem value="SOLD">Vendu</SelectItem>
                          <SelectItem value="COMING_SOON">Bientôt</SelectItem>
                          <SelectItem value="OFF_MARKET">Retiré</SelectItem>
                          <SelectItem value="DRAFT">Brouillon</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">
                      {editingPriceId === apt.id ? (
                        <Input
                          type="number"
                          defaultValue={apt.price ?? ''}
                          className="h-7 w-28 text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const newPrice = input.value ? parseInt(input.value, 10) : null;
                              const oldPrice = apt.price ?? null;
                              if (newPrice !== oldPrice && newPrice !== null && oldPrice !== null) {
                                setPriceConfirmInline({ apt, oldPrice, newPrice });
                              } else if (newPrice !== oldPrice) {
                                savePriceInline.mutate({ slug: apt.slug, price: newPrice });
                              }
                              setEditingPriceId(null);
                            }
                            if (e.key === 'Escape') setEditingPriceId(null);
                          }}
                          placeholder="Prix en DA"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingPriceId(apt.id)}
                          className="hover:bg-muted px-2 py-1 rounded text-xs cursor-pointer transition-colors"
                          title="Cliquer pour éditer le prix rapidement"
                        >
                          {apt.priceOnRequest ? 'Sur demande' : apt.price ? formatPrice(apt.price) : '— ⚠'}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const checks = [
                          !!apt.typeName, apt.surface > 0, apt.floor !== undefined && apt.floor !== null,
                          apt.bedrooms > 0, !!apt.price || apt.priceOnRequest, !!apt.orientation, !!apt.heroImage, apt.published,
                        ];
                        const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
                        return (
                          <span className={`text-xs font-bold ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`} title={`${score}% complet`}>
                            {score}%
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePublished.mutate({ slug: apt.slug, published: !apt.published })}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                          apt.published
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                        }`}
                        title={apt.published ? 'Dépublier' : 'Publier'}
                      >
                        {apt.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {apt.published ? 'Publié' : 'Brouillon'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/#/projects/${apt.project.slug}/apartments/${apt.slug}`, '_blank')}
                          className="h-7 px-2"
                          title="Aperçu sur le site"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(apt)} className="h-7 px-2" title="Modifier"><ChevronRight className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Archiver l'appartement "${apt.typeName}" ? Il sera dépublié et masqué du site public.`)) archive.mutate(apt.slug); }} className="h-7 px-2 text-red-500 hover:text-red-700" title="Archiver"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Inline price change confirmation dialog */}
      <Dialog open={!!priceConfirmInline} onOpenChange={(o) => !o && setPriceConfirmInline(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmer le changement de prix</DialogTitle></DialogHeader>
          {priceConfirmInline && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Vous modifiez le prix de <strong>{priceConfirmInline.apt.typeName}</strong>. Cette action sera auditée.
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="border border-border rounded-md p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Ancien prix</p>
                  <p className="text-lg font-bold text-muted-foreground">{(priceConfirmInline.oldPrice ?? 0).toLocaleString('fr-FR')} DA</p>
                </div>
                <div className="border border-forest/30 bg-forest/5 rounded-md p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Nouveau prix</p>
                  <p className="text-lg font-bold text-forest">{(priceConfirmInline.newPrice ?? 0).toLocaleString('fr-FR')} DA</p>
                </div>
              </div>
              <div className="text-center p-2 rounded-md bg-amber-50 border border-amber-200">
                <p className="text-sm font-semibold text-amber-800">
                  Différence: {((priceConfirmInline.newPrice ?? 0) - (priceConfirmInline.oldPrice ?? 0)).toLocaleString('fr-FR')} DA
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setPriceConfirmInline(null); setEditingPriceId(null); }}>Annuler</Button>
                <Button
                  className="bg-forest hover:bg-forest/90"
                  onClick={() => {
                    savePriceInline.mutate({ slug: priceConfirmInline.apt.slug, price: priceConfirmInline.newPrice });
                    setPriceConfirmInline(null);
                    setEditingPriceId(null);
                  }}
                >
                  Confirmer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Buildings Tab ─── */

function BuildingsTab({ buildings, isLoading }: { buildings: AdminBuilding[]; isLoading: boolean }) {
  const qc = useQueryClient();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-charcoal">Bâtiments</h2>
        <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'buildings'] })} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-forest" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Étages</TableHead>
                  <TableHead>Ascenseur</TableHead>
                  <TableHead>Projet</TableHead>
                  <TableHead className="text-center">Apts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildings.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun bâtiment trouvé</TableCell></TableRow>
                ) : buildings.map((bldg) => (
                  <TableRow key={bldg.id}>
                    <TableCell className="font-medium text-sm">{bldg.name}</TableCell>
                    <TableCell className="text-sm">{bldg.code}</TableCell>
                    <TableCell className="text-sm">{bldg.floors}</TableCell>
                    <TableCell><Badge variant={bldg.hasElevator ? 'default' : 'secondary'} className="text-xs">{bldg.hasElevator ? 'Oui' : 'Non'}</Badge></TableCell>
                    <TableCell className="text-sm">{bldg.project.name}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{bldg.apartmentCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Leads Tab ─── */

function LeadsTab({
  leads,
  isLoading,
  leadStatusFilter,
  onStatusFilterChange,
}: {
  leads: AdminLead[];
  isLoading: boolean;
  leadStatusFilter: string;
  onStatusFilterChange: (val: string) => void;
}) {
  const qc = useQueryClient();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Array<{ id: string; body: string; authorEmail: string | null; createdAt: string }>>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'VISIT', 'NEGOTIATION', 'SOLD', 'LOST'];

  async function changeStatus(leadId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
    } catch (err) {
      console.error(err);
    }
  }

  async function loadNotes(leadId: string) {
    setNotesLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/notes`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setNotes(json.data ?? []);
      }
    } catch { /* ignore */ }
    setNotesLoading(false);
  }

  async function addNote(leadId: string) {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: newNote }),
      });
      if (res.ok) {
        setNewNote('');
        loadNotes(leadId);
      }
    } catch { /* ignore */ }
    setAddingNote(false);
  }

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-charcoal">Leads</h2>
        <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'leads'] })} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </Button>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Statut:</span>
        </div>
        <Select value={leadStatusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-forest" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Intention</TableHead>
                  <TableHead>Propriété</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun lead trouvé</TableCell></TableRow>
                ) : leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{lead.name}</p>
                        {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{lead.phone}</TableCell>
                    <TableCell><IntentLabel intent={lead.intent} /></TableCell>
                    <TableCell className="text-sm">{lead.projectName ?? lead.apartmentName ?? '—'}</TableCell>
                    <TableCell>
                      {/* Inline status change */}
                      <Select
                        value={lead.status}
                        onValueChange={(v) => changeStatus(lead.id, v)}
                      >
                        <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(lead.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => { setSelectedLeadId(lead.id); loadNotes(lead.id); }}
                      >
                        Notes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Notes drawer */}
      <Dialog open={!!selectedLeadId} onOpenChange={(o) => !o && setSelectedLeadId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notes — {selectedLead?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notesLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune note pour le moment.</p>
              ) : notes.map((n) => (
                <div key={n.id} className="border border-border rounded-md p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">{n.authorEmail ?? 'Inconnu'}</span> · {new Date(n.createdAt).toLocaleString('fr-FR')}
                  </p>
                  <p className="text-sm">{n.body}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                onKeyDown={(e) => { if (e.key === 'Enter' && selectedLeadId) addNote(selectedLeadId); }}
                disabled={addingNote}
              />
              <Button
                onClick={() => selectedLeadId && addNote(selectedLeadId)}
                disabled={addingNote || !newNote.trim()}
                className="bg-forest hover:bg-forest/90 text-white"
              >
                {addingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Media Library Tab ─── */

interface MediaItem {
  id: string;
  entity: 'project' | 'apartment';
  entityId: string;
  entityName: string | null;
  entitySlug: string | null;
  url: string;
  alt: string;
  caption: string;
  type: string;
  order: number;
  width?: number | null;
  height?: number | null;
  createdAt: string;
}

async function fetchMedia(filters: { projectId?: string; apartmentId?: string; type?: string; q?: string }): Promise<MediaItem[]> {
  const params = new URLSearchParams();
  if (filters.projectId) params.set('projectId', filters.projectId);
  if (filters.apartmentId) params.set('apartmentId', filters.apartmentId);
  if (filters.type) params.set('type', filters.type);
  if (filters.q) params.set('q', filters.q);
  const res = await fetch(`/api/admin/media?${params.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch media');
  const json = await res.json();
  return json.data ?? [];
}

const MEDIA_TYPES = ['hero', 'gallery', 'floor-plan', '3d-plan', 'render', 'interior', 'exterior', 'amenity'];

function MediaUploadCard({ projects, apartments, onUploaded }: {
  projects: AdminProject[];
  apartments: AdminApartment[];
  onUploaded: () => void;
}) {
  const [entityType, setEntityType] = useState<'project' | 'apartment'>('project');
  const [entityId, setEntityId] = useState('');
  const [type, setType] = useState('gallery');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const entityOptions = entityType === 'project'
    ? projects
    : apartments;

  async function doUpload() {
    if (!file) { setError('Aucun fichier sélectionné'); return; }
    if (!entityId) { setError('Veuillez sélectionner une cible (projet ou appartement)'); return; }
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);
      formData.append('type', type);
      formData.append('alt', alt);
      formData.append('caption', caption);
      const res = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/media/upload');
        xhr.withCredentials = true;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }));
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setFile(null);
      setAlt('');
      setCaption('');
      setProgress(0);
      qc.invalidateQueries({ queryKey: ['admin', 'media'] });
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l\'upload');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4" /> Téléverser un média
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Cible</Label>
            <Select value={entityType} onValueChange={(v) => { setEntityType(v as 'project' | 'apartment'); setEntityId(''); }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Projet</SelectItem>
                <SelectItem value="apartment">Appartement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{entityType === 'project' ? 'Projet' : 'Appartement'}</Label>
            <Select value={entityId} onValueChange={setEntityId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {entityOptions.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {entityType === 'project' ? (e as AdminProject).name : `${(e as AdminApartment).typeName} (${(e as AdminApartment).project?.name ?? '—'})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEDIA_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Texte alt (accessibilité)</Label>
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="ex: Façade principale" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Légende (optionnel)</Label>
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="ex: Rendu nocturne" />
        </div>

        {/* Drag-drop area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) setFile(f);
          }}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-forest bg-forest/5' : 'border-border hover:border-forest/50'
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
          />
          {file ? (
            <div className="space-y-2">
              <img src={URL.createObjectURL(file)} alt="preview" className="mx-auto max-h-32 object-contain" />
              <p className="text-sm text-muted-foreground">{file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-600 hover:underline">
                Retirer
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Glisser une image ici, ou cliquer pour choisir</p>
              <p className="text-xs text-muted-foreground/70">JPEG, PNG, WebP, AVIF, GIF — 8 MB max</p>
            </div>
          )}
        </div>

        {progress > 0 && progress < 100 && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-forest h-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500"><X className="h-4 w-4" /></button>
          </div>
        )}

        <Button
          onClick={doUpload}
          disabled={uploading || !file || !entityId}
          className="w-full bg-forest hover:bg-forest/90 text-white"
        >
          {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi… {progress}%</> : 'Téléverser'}
        </Button>
      </CardContent>
    </Card>
  );
}

function MediaGrid({ items, onDeleted }: { items: MediaItem[]; onDeleted: () => void }) {
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [altDraft, setAltDraft] = useState('');
  const [captionDraft, setCaptionDraft] = useState('');
  const [typeDraft, setTypeDraft] = useState('gallery');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);
  const qc = useQueryClient();

  function startEdit(item: MediaItem) {
    setEditing(item);
    setAltDraft(item.alt);
    setCaptionDraft(item.caption);
    setTypeDraft(item.type);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/media/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ alt: altDraft, caption: captionDraft, type: typeDraft }),
      });
      if (!res.ok) throw new Error('Failed to update media');
      qc.invalidateQueries({ queryKey: ['admin', 'media'] });
      setEditing(null);
      onDeleted();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteMedia(id: string) {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete media');
      qc.invalidateQueries({ queryKey: ['admin', 'media'] });
      onDeleted();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDelete(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg p-12 text-center">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">Aucun média. Téléversez votre première image ci-dessus.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="aspect-[4/3] bg-muted relative">
              <img src={item.url} alt={item.alt || ''} className="w-full h-full object-cover" loading="lazy" />
              <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                {item.entity}: {item.entityName ?? '—'}
              </span>
              <span className="absolute top-2 right-2 bg-forest text-white text-[10px] px-1.5 py-0.5 rounded uppercase">
                {item.type}
              </span>
            </div>
            <div className="p-2 space-y-1">
              <p className="text-xs text-muted-foreground truncate">{item.alt || <em className="text-amber-700">Pas de alt</em>}</p>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => startEdit(item)}>
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => setConfirmDelete(item)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le média</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <img src={editing.url} alt={editing.alt} className="w-full max-h-64 object-contain rounded-md" />
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={typeDraft} onValueChange={setTypeDraft}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEDIA_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Texte alt</Label>
                <Input value={altDraft} onChange={(e) => setAltDraft(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Légende</Label>
                <Input value={captionDraft} onChange={(e) => setCaptionDraft(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Annuler</Button>
                <Button onClick={saveEdit} disabled={saving} className="bg-forest hover:bg-forest/90 text-white">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer ce média?</DialogTitle>
          </DialogHeader>
          {confirmDelete && (
            <div className="space-y-3">
              {/* Preview */}
              <div className="border border-border rounded-md p-2 bg-muted/30 flex items-center gap-3">
                <img src={confirmDelete.url} alt={confirmDelete.alt || ''} className="w-16 h-16 object-cover rounded" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{confirmDelete.entityName ?? 'Inconnu'}</p>
                  <p className="text-[10px] text-muted-foreground">Type: {confirmDelete.type}</p>
                  <p className="text-[10px] text-muted-foreground">Alt: {confirmDelete.alt || <em className="text-amber-700">manquant</em>}</p>
                </div>
              </div>
              {/* Usage warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">⚠ Cette image est actuellement utilisée comme média {confirmDelete.type} pour :</span>
                  <br />
                  <span className="font-medium">{confirmDelete.entity}: {confirmDelete.entityName ?? 'Inconnu'}</span>
                </p>
                <p className="text-[10px] text-amber-700 mt-1">
                  La suppression est définitive. Le fichier sera retiré du disque et de la base.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Cette action sera enregistrée dans le journal d&apos;audit.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDelete(null)}>Annuler</Button>
                <Button
                  variant="destructive"
                  onClick={() => confirmDelete && deleteMedia(confirmDelete.id)}
                >
                  Supprimer définitivement
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaTab({ projects, apartments }: { projects: AdminProject[]; apartments: AdminApartment[] }) {
  const [filterEntity, setFilterEntity] = useState<'all' | 'project' | 'apartment'>('all');
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [search, setSearch] = useState('');

  const mediaQuery = useQuery({
    queryKey: ['admin', 'media', filterEntity, filterType, search],
    queryFn: () => fetchMedia({
      type: filterType !== 'all' ? filterType : undefined,
      q: search.trim() || undefined,
    }),
  });

  const items = mediaQuery.data ?? [];
  const filtered = items.filter((m) => {
    if (filterEntity !== 'all' && m.entity !== filterEntity) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-charcoal">Médiathèque</h2>
        <Button variant="outline" size="sm" onClick={() => mediaQuery.refetch()} disabled={mediaQuery.isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${mediaQuery.isFetching ? 'animate-spin' : ''}`} /> Actualiser
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterEntity} onValueChange={(v) => setFilterEntity(v as 'all' | 'project' | 'apartment')}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Cible" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes cibles</SelectItem>
            <SelectItem value="project">Projets</SelectItem>
            <SelectItem value="apartment">Appartements</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            {MEDIA_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher (alt, légende)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} média(s)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <MediaUploadCard projects={projects} apartments={apartments} onUploaded={() => mediaQuery.refetch()} />
          <VideoManager projects={projects} apartments={apartments} />
        </div>
        <div className="lg:col-span-2">
          {mediaQuery.isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : mediaQuery.isError ? (
            <div className="border border-red-200 bg-red-50 text-red-700 p-4 rounded-lg">Échec du chargement des médias.</div>
          ) : (
            <MediaGrid items={filtered} onDeleted={() => mediaQuery.refetch()} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Video Manager (inside Media tab) ─── */

interface AdminVideo {
  id: string;
  url: string | null;
  storagePath: string | null;
  thumbnailUrl: string | null;
  title: string;
  description: string | null;
  type: string;
  featured: boolean;
  published: boolean;
  projectId: string | null;
  apartmentId: string | null;
}

async function fetchVideos(target: { projectId?: string; apartmentId?: string }): Promise<AdminVideo[]> {
  const params = new URLSearchParams();
  if (target.projectId) params.set('projectId', target.projectId);
  if (target.apartmentId) params.set('apartmentId', target.apartmentId);
  const res = await fetch(`/api/admin/videos?${params.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch videos');
  const json = await res.json();
  return json.data ?? [];
}

function VideoManager({ projects, apartments }: { projects: AdminProject[]; apartments: AdminApartment[] }) {
  const qc = useQueryClient();
  const [entityType, setEntityType] = useState<'project' | 'apartment'>('project');
  const [entityId, setEntityId] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'HERO' | 'GALLERY' | 'WALKTHROUGH' | 'INTERVIEW'>('GALLERY');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const videosQuery = useQuery({
    queryKey: ['admin', 'videos', entityType, entityId],
    queryFn: () => fetchVideos(entityId ? (entityType === 'project' ? { projectId: entityId } : { apartmentId: entityId }) : {}),
    enabled: !!entityId,
  });

  async function createVideo() {
    if (!entityId) { setError('Sélectionnez une cible d\'abord'); return; }
    if (!url) { setError('URL vidéo requise (YouTube/Vimeo)'); return; }
    if (!title) { setError('Titre requis'); return; }
    setError(null);
    setCreating(true);
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: entityType === 'project' ? entityId : null,
          apartmentId: entityType === 'apartment' ? entityId : null,
          url,
          title,
          description: description || null,
          type,
          thumbnailUrl: thumbnailUrl || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Échec' }));
        throw new Error(j.error || 'Échec');
      }
      setUrl(''); setTitle(''); setDescription(''); setThumbnailUrl('');
      qc.invalidateQueries({ queryKey: ['admin', 'videos'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec');
    } finally {
      setCreating(false);
    }
  }

  async function deleteVideo(id: string) {
    try {
      await fetch(`/api/admin/videos/${id}`, { method: 'DELETE', credentials: 'include' });
      qc.invalidateQueries({ queryKey: ['admin', 'videos'] });
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDelete(null);
    }
  }

  async function toggleFeatured(v: AdminVideo) {
    try {
      await fetch(`/api/admin/videos/${v.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ featured: !v.featured }),
      });
      qc.invalidateQueries({ queryKey: ['admin', 'videos'] });
    } catch (err) {
      console.error(err);
    }
  }

  async function togglePublished(v: AdminVideo) {
    try {
      await fetch(`/api/admin/videos/${v.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ published: !v.published }),
      });
      qc.invalidateQueries({ queryKey: ['admin', 'videos'] });
    } catch (err) {
      console.error(err);
    }
  }

  const entityOptions = entityType === 'project' ? projects : apartments;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span className="h-4 w-4 inline-block">▶</span> Gestion des vidéos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Cible</Label>
            <Select value={entityType} onValueChange={(v) => { setEntityType(v as 'project' | 'apartment'); setEntityId(''); }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Projet</SelectItem>
                <SelectItem value="apartment">Appartement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{entityType === 'project' ? 'Projet' : 'Appartement'}</Label>
            <Select value={entityId} onValueChange={setEntityId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {entityOptions.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {entityType === 'project' ? (e as AdminProject).name : `${(e as AdminApartment).typeName} (${(e as AdminApartment).project?.name ?? '—'})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {entityId && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">URL Vidéo (YouTube/Vimeo)</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
              </div>
              <div>
                <Label className="text-xs">Titre</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Visite guidée Résidence" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Description (optionnel)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HERO">HERO</SelectItem>
                    <SelectItem value="GALLERY">GALLERY</SelectItem>
                    <SelectItem value="WALKTHROUGH">WALKTHROUGH</SelectItem>
                    <SelectItem value="INTERVIEW">INTERVIEW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">URL Thumbnail (optionnel)</Label>
              <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://…/thumbnail.jpg" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
            )}

            <Button onClick={createVideo} disabled={creating || !url || !title} className="bg-forest hover:bg-forest/90 text-white">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Ajouter la vidéo
            </Button>

            <Separator />

            {/* List existing videos */}
            {videosQuery.isLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : videosQuery.data && videosQuery.data.length > 0 ? (
              <div className="space-y-2">
                {videosQuery.data.map((v) => (
                  <div key={v.id} className="border border-border rounded-md p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{v.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{v.url ?? v.storagePath ?? ''}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{v.type}</Badge>
                        {v.featured && <Badge className="text-[10px] bg-forest/15 text-forest">Featured</Badge>}
                        {!v.published && <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-800">Non publié</Badge>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleFeatured(v)}>
                      <Star className={`h-3.5 w-3.5 ${v.featured ? 'fill-forest text-forest' : ''}`} />
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => togglePublished(v)}>
                      {v.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => setConfirmDelete(v.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Aucune vidéo pour cette cible.</p>
            )}
          </>
        )}

        <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Supprimer cette vidéo?</DialogTitle></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Annuler</Button>
              <Button variant="destructive" onClick={() => confirmDelete && deleteVideo(confirmDelete)}>Supprimer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/* ─── Users Tab ─── */

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  EDITOR: 'Éditeur',
  VIEWER: 'Lecteur',
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  ADMIN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  EDITOR: 'bg-sky-100 text-sky-800 border-sky-200',
  VIEWER: 'bg-gray-100 text-gray-700 border-gray-200',
};

function UsersTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      return json.data as AdminUser[];
    },
  });

  const users = usersQuery.data ?? [];

  async function toggleActive(user: AdminUser) {
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active: !user.active }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Échec' }));
        setActionError(j.error ?? 'Échec de la mise à jour.');
        return;
      }
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      window.dispatchEvent(new Event('asas-admin-data-changed'));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Échec de la mise à jour.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Utilisateurs</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez les comptes administrateurs et leurs rôles.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => usersQuery.refetch()} disabled={usersQuery.isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${usersQuery.isFetching ? 'animate-spin' : ''}`} /> Actualiser
          </Button>
          <Button size="sm" className="bg-forest hover:bg-forest/90 text-white" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5 mr-2" /> Nouvel utilisateur
          </Button>
        </div>
      </div>

      {actionError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>}

      {usersQuery.isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : usersQuery.isError ? (
        <div className="border border-red-200 bg-red-50 text-red-700 p-4 rounded-lg">Échec du chargement des utilisateurs.</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASSES[u.role] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {u.active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Actif</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-400" /> Désactivé</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(u)}>Modifier</Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => setConfirmDelete(u)}
                        title={u.active ? 'Désactiver' : 'Activer'}
                      >
                        {u.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{confirmDelete?.active ? 'Désactiver cet utilisateur ?' : 'Activer cet utilisateur ?'}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmDelete?.active
              ? 'Le compte ne pourra plus se connecter tant qu’il reste désactivé.'
              : 'Le compte pourra à nouveau se connecter après activation.'}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Annuler</Button>
            <Button variant={confirmDelete?.active ? 'destructive' : 'default'} onClick={async () => {
              if (!confirmDelete) return;
              const user = confirmDelete;
              setConfirmDelete(null);
              await toggleActive(user);
            }}>
              {confirmDelete?.active ? 'Désactiver' : 'Activer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create user dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouvel utilisateur</DialogTitle></DialogHeader>
          <UserForm
            mode="create"
            onClose={() => setShowCreate(false)}
            onSaved={() => qc.invalidateQueries({ queryKey: ['admin', 'users'] })}
          />
        </DialogContent>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Modifier: {editing?.name}</DialogTitle></DialogHeader>
          {editing && (
            <UserForm
              mode="edit"
              user={editing}
              onClose={() => setEditing(null)}
              onSaved={() => qc.invalidateQueries({ queryKey: ['admin', 'users'] })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserForm({ mode, user, onClose, onSaved }: {
  mode: 'create' | 'edit';
  user?: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [email, setEmail] = useState(user?.email ?? '');
  const [name, setName] = useState(user?.name ?? '');
  const [role, setRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>(user?.role as 'ADMIN' | 'EDITOR' | 'VIEWER' ?? 'VIEWER');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<{ oldPrice: number | null; newPrice: number | null } | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (mode === 'create') {
        if (!email || !name || !password) { setError('Email, nom et mot de passe requis'); setSaving(false); return; }
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, name, password, role, active: true }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({ error: 'Échec' }));
          throw new Error(j.error ?? 'Échec');
        }
      } else if (user) {
        const body: Record<string, unknown> = { name, role };
        if (password) body.newPassword = password;
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({ error: 'Échec' }));
          throw new Error(j.error ?? 'Échec');
        }
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={mode === 'edit'}
          placeholder="admin@asas.dz"
        />
        {mode === 'edit' && <p className="text-[10px] text-muted-foreground mt-1">L&apos;email ne peut pas être modifié.</p>}
      </div>
      <div>
        <Label className="text-xs">Nom complet</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Admin ASAS" />
      </div>
      <div>
        <Label className="text-xs">Rôle</Label>
        <Select value={role} onValueChange={(v) => setRole(v as 'ADMIN' | 'EDITOR' | 'VIEWER')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrateur — accès complet</SelectItem>
            <SelectItem value="EDITOR">Éditeur — créer/modifier contenu</SelectItem>
            <SelectItem value="VIEWER">Lecteur — lecture seule</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">{mode === 'create' ? 'Mot de passe (min 8 caractères)' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'}</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
        <Button onClick={save} disabled={saving} className="bg-forest hover:bg-forest/90 text-white">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} {mode === 'create' ? 'Créer' : 'Enregistrer'}
        </Button>
      </DialogFooter>
    </div>
  );
}

/* ─── Audit Log Tab ─── */

interface AuditLogEntry {
  id: string;
  actorEmail: string | null;
  actorRole: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  entitySlug: string | null;
  before: string | null;
  after: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Connexion',
  LOGOUT: 'Déconnexion',
  LOGIN_FAILED: 'Échec de connexion',
  CREATE_PROJECT: 'Création projet',
  UPDATE_PROJECT: 'Modification projet',
  ARCHIVE_PROJECT: 'Archivage projet',
  CREATE_APARTMENT: 'Création appartement',
  UPDATE_APARTMENT: 'Modification appartement',
  UPDATE_APARTMENT_STATUS: 'Statut appartement modifié',
  ARCHIVE_APARTMENT: 'Archivage appartement',
  PRICE_CHANGE: 'Changement de prix',
  UPLOAD_MEDIA: 'Upload média',
  DELETE_MEDIA: 'Suppression média',
  UPDATE_MEDIA: 'Modification média',
  CREATE_VIDEO: 'Création vidéo',
  UPDATE_VIDEO: 'Modification vidéo',
  DELETE_VIDEO: 'Suppression vidéo',
  UPDATE_LEAD: 'Modification lead',
  UPDATE_LEAD_STATUS: 'Statut lead modifié',
  CREATE_LEAD_NOTE: 'Note lead ajoutée',
  CREATE_USER: 'Création utilisateur',
  UPDATE_USER: 'Modification utilisateur',
  DEACTIVATE_USER: 'Désactivation utilisateur',
};

function AuditLogTab() {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [limit, setLimit] = useState(50);

  const query = useQuery({
    queryKey: ['admin', 'audit', actionFilter, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.set('action', actionFilter);
      params.set('limit', String(limit));
      const res = await fetch(`/api/admin/audit?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      return json.data as AuditLogEntry[];
    },
  });

  const entries = query.data ?? [];

  function formatPayload(s: string | null): string {
    if (!s) return '—';
    try {
      const obj = JSON.parse(s);
      return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(' | ');
    } catch {
      return s.slice(0, 100);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Journal d&apos;audit</h2>
          <p className="text-sm text-muted-foreground mt-1">Traçabilité de toutes les actions administrateur.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${query.isFetching ? 'animate-spin' : ''}`} /> Actualiser
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Toutes les actions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les actions</SelectItem>
            {Object.keys(ACTION_LABELS).map((a) => (
              <SelectItem key={a} value={a}>{ACTION_LABELS[a]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(limit)} onValueChange={(v) => setLimit(parseInt(v, 10))}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25 entrées</SelectItem>
            <SelectItem value="50">50 entrées</SelectItem>
            <SelectItem value="100">100 entrées</SelectItem>
            <SelectItem value="200">200 entrées</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{entries.length} entrée(s)</span>
      </div>

      {query.isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : query.isError ? (
        <div className="border border-red-200 bg-red-50 text-red-700 p-4 rounded-lg">Échec du chargement du journal.</div>
      ) : entries.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <RefreshCw className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Aucune entrée dans le journal.</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Action</TableHead>
                <TableHead>Acteur</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Avant</TableHead>
                <TableHead>Après</TableHead>
                <TableHead className="w-44">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <span className="text-xs font-medium">{ACTION_LABELS[e.action] ?? e.action}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium">{e.actorEmail ?? '—'}</p>
                    <p className="text-[10px] text-muted-foreground">{e.actorRole ?? ''}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{e.entityType ?? '—'}</p>
                    {e.entitySlug && <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{e.entitySlug}</p>}
                  </TableCell>
                  <TableCell>
                    <p className="text-[10px] text-muted-foreground font-mono max-w-[200px] truncate" title={e.before ?? ''}>
                      {formatPayload(e.before)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-[10px] text-muted-foreground font-mono max-w-[200px] truncate" title={e.after ?? ''}>
                      {formatPayload(e.after)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{new Date(e.createdAt).toLocaleString('fr-FR')}</p>
                    {e.ipAddress && <p className="text-[10px] text-muted-foreground">{e.ipAddress}</p>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

/* ─── Settings Tab ─── */

function SettingsTab() {
  const [me, setMe] = useState<{ id: string; email: string; name: string; role: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/me', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          setMe(json.user);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    EDITOR: 'Éditeur',
    VIEWER: 'Lecteur',
  };
  const roleDescriptions: Record<string, string> = {
    ADMIN: 'Accès complet : projets, appartements, médias, leads, paramètres.',
    EDITOR: 'Création et édition de contenu immobilier et médias. Pas de gestion des utilisateurs.',
    VIEWER: 'Lecture seule. Pas de modification.',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-charcoal">Paramètres</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Compte administrateur</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {me ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-forest flex items-center justify-center text-white text-lg font-bold">
                  {me.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{me.name}</p>
                  <p className="text-xs text-muted-foreground">{me.email}</p>
                </div>
                <Badge className="ml-auto bg-forest/15 text-forest border border-forest/30">
                  {roleLabels[me.role] ?? me.role}
                </Badge>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">{roleDescriptions[me.role] ?? ''}</p>
              <p className="text-xs text-muted-foreground">
                Session valide 8 heures. Déconnexion via le bouton en bas de la barre latérale.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Sécurité</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Authentification basée sur la base de données (bcrypt).</p>
          <p>✓ Session cookie httpOnly, sameSite=lax.</p>
          <p>✓ Toutes les routes <code>/api/admin/*</code> protégées côté serveur.</p>
          <p>✓ Validation stricte des uploads (MIME + magic bytes + taille).</p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Project Edit Form ─── */

function ProjectEditForm({ project, onClose }: { project: AdminProject; onClose: () => void }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'basic' | 'location' | 'commercial' | 'amenities' | 'seo' | 'publish'>('basic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for all editable fields — initialized from project (or fetched full data)
  const [form, setForm] = useState<Record<string, unknown>>({
    name: project.name,
    nameAr: '',
    tagline: '',
    taglineAr: '',
    description: '',
    descriptionAr: '',
    city: project.city ?? '',
    cityAr: '',
    district: project.district ?? '',
    districtAr: '',
    address: '',
    addressAr: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    projectType: 'RESIDENTIAL',
    status: project.status,
    apartmentTypes: '[]',
    minSurface: undefined as number | undefined,
    maxSurface: undefined as number | undefined,
    deliveryYear: undefined as number | undefined,
    deliveryQuarter: '',
    hasParking: false,
    hasElevator: false,
    hasGarden: false,
    hasPool: false,
    hasSecurity: false,
    hasClim: false,
    startingPrice: undefined as number | undefined,
    priceOnRequest: false,
    developerId: '',
    heroImage: '' as string,
    published: project.published,
    featured: project.featured,
    order: project.order,
    // SEO metadata
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalUrl: '',
    ogImage: '',
    robotsIndex: true,
  });

  // Fetch full project data (with description, location, etc.)
  const { data: fullProject, isLoading: loadingFull } = useQuery({
    queryKey: ['admin', 'project', project.slug],
    queryFn: async () => {
      const res = await fetch(`/api/admin/projects/${project.slug}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      return json.data;
    },
  });

  // Sync form state when full data arrives (only fields not in summary project)
  useEffect(() => {
    if (!fullProject) return;
    setForm(prev => ({
      ...prev,
      nameAr: fullProject.nameAr ?? '',
      tagline: fullProject.tagline ?? '',
      taglineAr: fullProject.taglineAr ?? '',
      description: fullProject.description ?? '',
      descriptionAr: fullProject.descriptionAr ?? '',
      city: fullProject.city ?? prev.city,
      cityAr: fullProject.cityAr ?? '',
      district: fullProject.district ?? prev.district,
      districtAr: fullProject.districtAr ?? '',
      address: fullProject.address ?? '',
      addressAr: fullProject.addressAr ?? '',
      latitude: fullProject.latitude ?? undefined,
      longitude: fullProject.longitude ?? undefined,
      projectType: fullProject.projectType ?? 'RESIDENTIAL',
      apartmentTypes: fullProject.apartmentTypes ?? '[]',
      minSurface: fullProject.minSurface ?? undefined,
      maxSurface: fullProject.maxSurface ?? undefined,
      deliveryYear: fullProject.deliveryYear ?? undefined,
      deliveryQuarter: fullProject.deliveryQuarter ?? '',
      hasParking: fullProject.hasParking ?? false,
      hasElevator: fullProject.hasElevator ?? false,
      hasGarden: fullProject.hasGarden ?? false,
      hasPool: fullProject.hasPool ?? false,
      hasSecurity: fullProject.hasSecurity ?? false,
      hasClim: fullProject.hasClim ?? false,
      startingPrice: fullProject.startingPrice ?? undefined,
      priceOnRequest: fullProject.priceOnRequest ?? false,
      developerId: fullProject.developerId ?? '',
      heroImage: (fullProject.images && fullProject.images.length > 0) ? fullProject.images[0].url : '',
      order: fullProject.order ?? 0,
      // SEO sync
      seoTitle: fullProject.seoTitle ?? '',
      seoDescription: fullProject.seoDescription ?? '',
      seoKeywords: fullProject.seoKeywords ?? '',
      canonicalUrl: fullProject.canonicalUrl ?? '',
      ogImage: fullProject.ogImage ?? '',
      robotsIndex: fullProject.robotsIndex ?? true,
    }));
  }, [fullProject]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleFlag(key: 'hasParking' | 'hasElevator' | 'hasGarden' | 'hasPool' | 'hasSecurity' | 'hasClim' | 'priceOnRequest' | 'published' | 'featured') {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleApartmentType(t: string) {
    const current = typeof form.apartmentTypes === 'string' ? JSON.parse(form.apartmentTypes as string) : [];
    const next = current.includes(t) ? current.filter((x: string) => x !== t) : [...current, t];
    update('apartmentTypes', JSON.stringify(next));
  }

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      // Build clean payload — convert empty strings to null for optional fields
      const payload: Record<string, unknown> = { ...form };
      // Numbers: send undefined as null
      for (const k of ['latitude', 'longitude', 'minSurface', 'maxSurface', 'deliveryYear', 'startingPrice', 'order']) {
        if (payload[k] === '' || payload[k] === undefined) payload[k] = null;
        else if (typeof payload[k] === 'string' && payload[k] !== '') payload[k] = Number(payload[k]);
      }
      // DeveloperId: empty → null
      if (!payload.developerId) payload.developerId = null;
      // DeliveryQuarter: '_none' placeholder → ''
      if (payload.deliveryQuarter === '_none') payload.deliveryQuarter = '';

      const res = await fetch(`/api/admin/projects/${project.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Échec de mise à jour' }));
        throw new Error(j.error ?? 'Échec de mise à jour');
      }
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
      qc.invalidateQueries({ queryKey: ['admin', 'project', project.slug] });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec');
    } finally {
      setSaving(false);
    }
  };

  const TABS: { id: typeof tab; label: string }[] = [
    { id: 'basic', label: 'Infos' },
    { id: 'location', label: 'Localisation' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'amenities', label: 'Équipements' },
    { id: 'seo', label: 'SEO' },
    { id: 'publish', label: 'Publication' },
  ];

  const selectedTypes: string[] = typeof form.apartmentTypes === 'string'
    ? (() => { try { return JSON.parse(form.apartmentTypes as string) as string[]; } catch { return []; } })()
    : [];

  if (loadingFull && !fullProject) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="flex border-b border-border overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.id ? 'border-forest text-forest' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Basic Info */}
      {tab === 'basic' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs">Nom (FR) *</Label>
            <Input value={String(form.name)} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Nom (AR)</Label>
            <Input value={String(form.nameAr)} onChange={(e) => update('nameAr', e.target.value)} dir="rtl" />
          </div>
          <div>
            <Label className="text-xs">Slogan (FR)</Label>
            <Input value={String(form.tagline)} onChange={(e) => update('tagline', e.target.value)} placeholder="ex: L'élégance au cœur de Chéraga" />
          </div>
          <div>
            <Label className="text-xs">Slogan (AR)</Label>
            <Input value={String(form.taglineAr)} onChange={(e) => update('taglineAr', e.target.value)} dir="rtl" />
          </div>
          <div>
            <Label className="text-xs">Description (FR)</Label>
            <Textarea value={String(form.description)} onChange={(e) => update('description', e.target.value)} rows={4} />
          </div>
          <div>
            <Label className="text-xs">Description (AR)</Label>
            <Textarea value={String(form.descriptionAr)} onChange={(e) => update('descriptionAr', e.target.value)} rows={4} dir="rtl" />
          </div>
          <div>
            <Label className="text-xs">Statut</Label>
            <Select value={String(form.status)} onValueChange={(v) => update('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">En commercialisation</SelectItem>
                <SelectItem value="COMING_SOON">Bientôt disponible</SelectItem>
                <SelectItem value="SOLD_OUT">Épuisé</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Type de projet</Label>
            <Select value={String(form.projectType)} onValueChange={(v) => update('projectType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENTIAL">Résidentiel</SelectItem>
                <SelectItem value="MIXED_USE">Mixte</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Types d'appartements</Label>
            <div className="flex flex-wrap gap-2">
              {['F2', 'F3', 'F4', 'F5', 'Duplex', 'Studio', 'Villa'].map(t => (
                <button
                  key={t}
                  onClick={() => toggleApartmentType(t)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    selectedTypes.includes(t) ? 'bg-forest text-white border-forest' : 'bg-background text-muted-foreground border-border hover:border-forest/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Location */}
      {tab === 'location' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Ville (FR)</Label>
              <Input value={String(form.city)} onChange={(e) => update('city', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Ville (AR)</Label>
              <Input value={String(form.cityAr)} onChange={(e) => update('cityAr', e.target.value)} dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Quartier (FR)</Label>
              <Input value={String(form.district)} onChange={(e) => update('district', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Quartier (AR)</Label>
              <Input value={String(form.districtAr)} onChange={(e) => update('districtAr', e.target.value)} dir="rtl" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Adresse (FR)</Label>
            <Input value={String(form.address)} onChange={(e) => update('address', e.target.value)} placeholder="ex: Lot 12, Cité des Oliviers" />
          </div>
          <div>
            <Label className="text-xs">Adresse (AR)</Label>
            <Input value={String(form.addressAr)} onChange={(e) => update('addressAr', e.target.value)} dir="rtl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Latitude</Label>
              <Input type="number" step="any" value={form.latitude === undefined ? '' : String(form.latitude)} onChange={(e) => update('latitude', e.target.value === '' ? undefined : parseFloat(e.target.value))} placeholder="36.7687" />
            </div>
            <div>
              <Label className="text-xs">Longitude</Label>
              <Input type="number" step="any" value={form.longitude === undefined ? '' : String(form.longitude)} onChange={(e) => update('longitude', e.target.value === '' ? undefined : parseFloat(e.target.value))} placeholder="2.9497" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Les coordonnées GPS alimentent la carte Leaflet sur la page publique du projet.</p>
        </div>
      )}

      {/* Tab: Commercial */}
      {tab === 'commercial' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Surface min (m²)</Label>
              <Input type="number" value={form.minSurface === undefined ? '' : String(form.minSurface)} onChange={(e) => update('minSurface', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
            <div>
              <Label className="text-xs">Surface max (m²)</Label>
              <Input type="number" value={form.maxSurface === undefined ? '' : String(form.maxSurface)} onChange={(e) => update('maxSurface', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Année de livraison</Label>
              <Input type="number" value={form.deliveryYear === undefined ? '' : String(form.deliveryYear)} onChange={(e) => update('deliveryYear', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} placeholder="2026" />
            </div>
            <div>
              <Label className="text-xs">Trimestre</Label>
              <Select value={String(form.deliveryQuarter)} onValueChange={(v) => update('deliveryQuarter', v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">—</SelectItem>
                  <SelectItem value="Q1">Q1</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Prix de départ (DA)</Label>
            <Input type="number" value={form.startingPrice === undefined ? '' : String(form.startingPrice)} onChange={(e) => update('startingPrice', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} placeholder="ex: 12000000" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={Boolean(form.priceOnRequest)} onCheckedChange={() => toggleFlag('priceOnRequest')} />
            <Label className="text-sm">Prix sur demande (masque le prix sur le site)</Label>
          </div>
          <div>
            <Label className="text-xs">Ordre d'affichage</Label>
            <Input type="number" value={String(form.order)} onChange={(e) => update('order', parseInt(e.target.value, 10) || 0)} placeholder="0" />
            <p className="text-xs text-muted-foreground mt-1">Les projets sont triés par ordre croissant.</p>
          </div>
        </div>
      )}

      {/* Tab: Amenities */}
      {tab === 'amenities' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground">Activez les équipements disponibles dans la résidence. Les équipements s'affichent sur la page projet publique.</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: 'hasParking', label: 'Parking souterrain' },
              { key: 'hasElevator', label: 'Ascenseur' },
              { key: 'hasGarden', label: 'Espaces verts' },
              { key: 'hasPool', label: 'Piscine' },
              { key: 'hasSecurity', label: 'Sécurité 24h/24' },
              { key: 'hasClim', label: 'Climatisation' },
            ] as const).map(a => (
              <label key={a.key} className="flex items-center gap-2 p-2 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                <Switch checked={Boolean(form[a.key])} onCheckedChange={() => toggleFlag(a.key)} />
                <span className="text-sm">{a.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Pour gérer des équipements personnalisés (ex: « Salle de sport », « Aire de jeux »), utilisez l&apos;onglet Projets {`>`} éditer les amenities (à venir dans une prochaine version).</p>
        </div>
      )}

      {/* Tab: SEO */}
      {tab === 'seo' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground">Laissez vide pour utiliser les valeurs par défaut. Ou cliquez sur le bouton pour générer automatiquement.</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-2"
            onClick={() => {
              // Auto-generate SEO from entity data
              const name = String(form.name || '');
              const district = String(form.district || '');
              const city = String(form.city || '');
              const startingPrice = form.startingPrice ? Number(form.startingPrice).toLocaleString('fr-FR') : '';
              const tagline = String(form.tagline || '');
              const description = String(form.description || '');

              if (!form.seoTitle) update('seoTitle', `${name} — ${district} | ASAS Immobilier`);
              if (!form.seoDescription) update('seoDescription', `${tagline || description.slice(0, 150)}. ${startingPrice ? 'À partir de ' + startingPrice + ' DA.' : ''}`);
              if (!form.ogImage && form.heroImage) update('ogImage', String(form.heroImage));
            }}
          >
            <span className="mr-2">✨</span> Générer SEO automatiquement
          </Button>
          <div>
            <Label className="text-xs">Titre SEO (meta title)</Label>
            <Input value={String(form.seoTitle)} onChange={(e) => update('seoTitle', e.target.value)} placeholder="ex: Résidence Les Oliviers à Chéraga — ASAS" />
            <p className="text-[10px] text-muted-foreground mt-1">Recommandé: 50-60 caractères. Laissez vide pour générer automatiquement.</p>
          </div>
          <div>
            <Label className="text-xs">Description SEO (meta description)</Label>
            <Textarea value={String(form.seoDescription)} onChange={(e) => update('seoDescription', e.target.value)} rows={3} placeholder="ex: Découvrez la Résidence Les Oliviers à Chéraga. Appartements F2, F3, F4 neufs à partir de 12M DA." />
            <p className="text-[10px] text-muted-foreground mt-1">Recommandé: 150-160 caractères.</p>
          </div>
          <div>
            <Label className="text-xs">Mots-clés (séparés par virgules)</Label>
            <Input value={String(form.seoKeywords)} onChange={(e) => update('seoKeywords', e.target.value)} placeholder="résidence, Chéraga, F3, neuf, Alger" />
          </div>
          <div>
            <Label className="text-xs">URL canonique (canonical)</Label>
            <Input value={String(form.canonicalUrl)} onChange={(e) => update('canonicalUrl', e.target.value)} placeholder="Laissez vide pour auto" />
          </div>
          <div>
            <Label className="text-xs">Image OpenGraph (URL)</Label>
            <Input value={String(form.ogImage)} onChange={(e) => update('ogImage', e.target.value)} placeholder="/images/projects/..." />
            <p className="text-[10px] text-muted-foreground mt-1">Image affichée lors du partage sur Facebook/WhatsApp. Recommandé: 1200×630.</p>
          </div>
          <div className="flex items-center gap-2 p-3 border border-border rounded-md">
            <Switch checked={Boolean(form.robotsIndex)} onCheckedChange={() => setForm(prev => ({ ...prev, robotsIndex: !prev.robotsIndex }))} />
            <div>
              <p className="text-sm font-medium">{form.robotsIndex ? 'Indexable par Google' : 'NOINDEX (non indexé)'}</p>
              <p className="text-xs text-muted-foreground">Désactivez pour les brouillons ou les pages privées.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Publish */}
      {tab === 'publish' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {/* Pre-publish validation checklist */}
          <div className="border border-border rounded-md p-3 bg-muted/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">État de préparation</p>
            <div className="space-y-1.5">
              {[
                { label: 'Nom du projet', ok: !!form.name, required: true },
                { label: 'Localisation (ville + quartier)', ok: !!form.city && !!form.district, required: true },
                { label: 'Description', ok: !!form.description, required: false },
                { label: 'Prix de départ', ok: !!form.startingPrice || form.priceOnRequest, required: true },
                { label: 'Image hero', ok: !!form.heroImage, required: true },
                { label: 'Description SEO', ok: !!form.seoDescription, required: false },
                { label: 'Image OpenGraph', ok: !!form.ogImage, required: false },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={c.ok ? 'text-emerald-600' : (c.required ? 'text-red-600' : 'text-amber-600')}>
                    {c.ok ? '✓' : (c.required ? '✕' : '⚠')}
                  </span>
                  <span className={c.ok ? 'text-foreground' : (c.required ? 'text-red-700 font-medium' : 'text-amber-700')}>
                    {c.label}{c.required ? ' (requis)' : ''}
                  </span>
                </div>
              ))}
            </div>
            {!form.name || !form.city || !form.district || !form.startingPrice ? (
              <p className="text-[10px] text-red-700 mt-2">⚠ Des champs requis manquent. La publication est déconseillée.</p>
            ) : (
              <p className="text-[10px] text-emerald-700 mt-2">✓ Prêt pour publication.</p>
            )}
          </div>
          <div className="flex items-center gap-2 p-3 border border-border rounded-md">
            <Switch checked={Boolean(form.published)} onCheckedChange={() => toggleFlag('published')} />
            <div>
              <p className="text-sm font-medium">{form.published ? 'Publié' : 'Brouillon'}</p>
              <p className="text-xs text-muted-foreground">Les projets non publiés sont invisibles sur le site public.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 border border-border rounded-md">
            <Switch checked={Boolean(form.featured)} onCheckedChange={() => toggleFlag('featured')} />
            <div>
              <p className="text-sm font-medium">Mettre en avant</p>
              <p className="text-xs text-muted-foreground">Affiché sur la page d'accueil.</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(`/#/projects/${project.slug}`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" /> Aperçu sur le site
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={saving} className="bg-forest hover:bg-forest/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Sauvegarder
        </Button>
      </DialogFooter>
    </div>
  );
}

/* ─── Project Create Form ─── */

function ProjectCreateForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [city, setCity] = useState('Alger');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [projectType, setProjectType] = useState('RESIDENTIAL');
  const [status, setStatus] = useState('DRAFT');
  const [startingPrice, setStartingPrice] = useState('');
  const [deliveryYear, setDeliveryYear] = useState(String(new Date().getFullYear() + 1));
  const [deliveryQuarter, setDeliveryQuarter] = useState('Q4');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slug = useMemo(() => slugify(name), [name]);
  // Smart auto-fill is handled in onChange handlers, not useEffect (to avoid lint warnings)

  const save = async () => {
    if (!name.trim() || !district.trim()) { setError('Le nom du projet et le quartier sont obligatoires.'); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, slug, city, district,
          description: description || null,
          tagline: tagline || null,
          projectType,
          status,
          startingPrice: startingPrice ? parseInt(startingPrice, 10) : null,
          deliveryYear: deliveryYear ? parseInt(deliveryYear, 10) : null,
          deliveryQuarter: deliveryQuarter || null,
          published: false,
        }),
      });
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
        onClose();
      } else {
        const err = await res.json();
        setError(err.error ?? 'Impossible de créer le projet.');
      }
    } catch {
      setError('Impossible de créer le projet. Vérifiez votre connexion puis réessayez.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Identity section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Nom du projet <span className="text-red-500">*</span></Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Résidence Les Oliviers" autoFocus />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Slug (auto-généré, URL)</Label>
        <Input value={slug} readOnly className="bg-muted text-xs font-mono" />
      </div>

      {/* Tagline with auto-suggestion */}
      <div className="space-y-2">
        <Label className="text-xs">Slogan marketing</Label>
        <Input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Auto-suggéré basé sur le quartier"
        />
        <p className="text-[10px] text-muted-foreground">💡 Suggéré automatiquement — modifiable</p>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Ville <span className="text-red-500">*</span></Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Quartier <span className="text-red-500">*</span></Label>
          <Input value={district} onChange={(e) => {
            setDistrict(e.target.value);
            if (name && !tagline) setTagline(`Résidence moderne à ${e.target.value}`);
          }} placeholder="Ex: Chéraga" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-xs">Description (optionnel)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description du projet..." />
      </div>

      {/* Type + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Type de projet</Label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="RESIDENTIAL">Résidentiel</SelectItem>
              <SelectItem value="MIXED_USE">Mixte</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Statut</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="AVAILABLE">En commercialisation</SelectItem>
              <SelectItem value="COMING_SOON">Bientôt disponible</SelectItem>
              <SelectItem value="SOLD_OUT">Épuisé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Commercial */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Prix de départ (DA)</Label>
          <Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="12000000" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Année livraison</Label>
          <Input type="number" value={deliveryYear} onChange={(e) => setDeliveryYear(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Trimestre</Label>
          <Select value={deliveryQuarter} onValueChange={setDeliveryQuarter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1">Q1</SelectItem>
              <SelectItem value="Q2">Q2</SelectItem>
              <SelectItem value="Q3">Q3</SelectItem>
              <SelectItem value="Q4">Q4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground bg-muted/50 rounded p-2">
        💡 Le projet sera créé en <strong>Brouillon</strong> (invisible publiquement). 
        Complétez les détails via le formulaire d'édition (6 onglets) puis publiez.
      </p>

      {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
        <Button onClick={save} disabled={saving || !name.trim() || !district.trim()} className="bg-forest hover:bg-forest/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Créer le projet
        </Button>
      </DialogFooter>
    </div>
  );
}

/* ─── Apartment Edit Form ─── */

function ApartmentEditForm({ apartment, onClose }: { apartment: AdminApartment; onClose: () => void }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'basic' | 'spec' | 'rooms' | 'price' | 'description' | 'seo' | 'publish'>('basic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceChangeConfirm, setPriceChangeConfirm] = useState<{ oldPrice: number | null; newPrice: number | null } | null>(null);

  // Build initial form from apartment summary, plus fetched full data
  const [form, setForm] = useState<Record<string, unknown>>({
    unitNumber: apartment.unitNumber ?? '',
    apartmentType: apartment.apartmentType,
    typeName: apartment.typeName,
    typeNameAr: '',
    surface: apartment.surface,
    floor: apartment.floor ?? undefined,
    totalFloors: undefined as number | undefined,
    orientation: apartment.orientation ?? '',
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms ?? undefined,
    balconies: undefined as number | undefined,
    balconySurface: undefined as number | undefined,
    hasParking: apartment.hasParking ?? false,
    parkingSpots: apartment.parkingSpots ?? undefined,
    hasTerrace: false,
    terraceSurface: undefined as number | undefined,
    hasGarden: false,
    gardenSurface: undefined as number | undefined,
    status: apartment.status,
    price: apartment.price ?? undefined,
    priceOnRequest: apartment.priceOnRequest ?? false,
    paymentPlan: '',
    paymentPlanAr: '',
    description: '',
    descriptionAr: '',
    features: '[]',
    featuresAr: '[]',
    published: apartment.published,
    order: apartment.order,
    // SEO
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalUrl: '',
    ogImage: '',
    robotsIndex: true,
  });

  // Fetch full apartment (incl. description, paymentPlan, features)
  const { data: fullApt, isLoading: loadingFull } = useQuery({
    queryKey: ['admin', 'apartment', apartment.slug],
    queryFn: async () => {
      const res = await fetch(`/api/admin/apartments/${apartment.slug}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (!fullApt) return;
    setForm(prev => ({
      ...prev,
      typeNameAr: fullApt.typeNameAr ?? '',
      totalFloors: fullApt.totalFloors ?? undefined,
      balconies: fullApt.balconies ?? undefined,
      balconySurface: fullApt.balconySurface ?? undefined,
      hasParking: fullApt.hasParking ?? prev.hasParking,
      parkingSpots: fullApt.parkingSpots ?? undefined,
      hasTerrace: fullApt.hasTerrace ?? false,
      terraceSurface: fullApt.terraceSurface ?? undefined,
      hasGarden: fullApt.hasGarden ?? false,
      gardenSurface: fullApt.gardenSurface ?? undefined,
      orientation: fullApt.orientation ?? prev.orientation,
      paymentPlan: fullApt.paymentPlan ?? '',
      paymentPlanAr: fullApt.paymentPlanAr ?? '',
      description: fullApt.description ?? '',
      descriptionAr: fullApt.descriptionAr ?? '',
      features: fullApt.features ?? '[]',
      featuresAr: fullApt.featuresAr ?? '[]',
      // SEO sync
      seoTitle: fullApt.seoTitle ?? '',
      seoDescription: fullApt.seoDescription ?? '',
      seoKeywords: fullApt.seoKeywords ?? '',
      canonicalUrl: fullApt.canonicalUrl ?? '',
      ogImage: fullApt.ogImage ?? '',
      robotsIndex: fullApt.robotsIndex ?? true,
    }));
  }, [fullApt]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }
  function toggleFlag(key: 'hasParking' | 'hasTerrace' | 'hasGarden' | 'priceOnRequest' | 'published') {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleFeature(feature: string) {
    const arr = typeof form.features === 'string' ? JSON.parse(form.features as string) as string[] : [];
    const next = arr.includes(feature) ? arr.filter(f => f !== feature) : [...arr, feature];
    update('features', JSON.stringify(next));
  }

  const save = async (force = false) => {
    // Pre-check: if price has changed, show confirmation dialog (only on first attempt)
    const oldPrice = apartment.price ?? null;
    const newPriceVal = form.price === '' || form.price === undefined || form.price === null ? null : Number(form.price);
    if (!force && newPriceVal !== null && oldPrice !== null && newPriceVal !== oldPrice) {
      setPriceChangeConfirm({ oldPrice, newPrice: newPriceVal });
      return; // Stop here — user must confirm
    }
    setPriceChangeConfirm(null);
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { ...form };
      // Numeric fields → null if empty/undefined
      for (const k of ['floor', 'totalFloors', 'bathrooms', 'balconies', 'balconySurface', 'parkingSpots', 'terraceSurface', 'gardenSurface', 'price', 'order']) {
        if (payload[k] === '' || payload[k] === undefined) payload[k] = null;
        else if (typeof payload[k] === 'string' && payload[k] !== '') payload[k] = Number(payload[k]);
      }
      // Orientation: '_none' placeholder → ''
      if (payload.orientation === '_none') payload.orientation = '';
      const res = await fetch(`/api/admin/apartments/${apartment.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Échec' }));
        throw new Error(j.error ?? 'Échec');
      }
      qc.invalidateQueries({ queryKey: ['admin', 'apartments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'apartment', apartment.slug] });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec');
    } finally {
      setSaving(false);
    }
  };

  const TABS: { id: typeof tab; label: string }[] = [
    { id: 'basic', label: 'Identité' },
    { id: 'spec', label: 'Spec' },
    { id: 'rooms', label: 'Pièces' },
    { id: 'price', label: 'Prix' },
    { id: 'description', label: 'Description' },
    { id: 'seo', label: 'SEO' },
    { id: 'publish', label: 'Publication' },
  ];

  const selectedFeatures: string[] = typeof form.features === 'string'
    ? (() => { try { return JSON.parse(form.features as string) as string[]; } catch { return []; } })()
    : [];

  if (loadingFull && !fullApt) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex border-b border-border overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.id ? 'border-forest text-forest' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Basic */}
      {tab === 'basic' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Numéro/Référence</Label>
              <Input value={String(form.unitNumber)} onChange={(e) => update('unitNumber', e.target.value)} placeholder="ex: A-103" />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={String(form.apartmentType)} onValueChange={(v) => {
                update('apartmentType', v);
                // Smart auto-fill: when type changes, auto-suggest bedrooms + typeName
                const smartDefaults: Record<string, { bedrooms: number; typeName: string; typeNameAr: string; surface?: number }> = {
                  'F2': { bedrooms: 2, typeName: 'F2 Confort', typeNameAr: 'شقة F2', surface: 65 },
                  'F3': { bedrooms: 3, typeName: 'F3 Familial', typeNameAr: 'شقة F3', surface: 92 },
                  'F4': { bedrooms: 4, typeName: 'F4 Standing', typeNameAr: 'شقة F4', surface: 120 },
                  'F5': { bedrooms: 5, typeName: 'F5 Prestige', typeNameAr: 'شقة F5', surface: 150 },
                  'Duplex': { bedrooms: 4, typeName: 'Duplex Panoramique', typeNameAr: 'دوبلكس', surface: 140 },
                  'Studio': { bedrooms: 1, typeName: 'Studio Moderne', typeNameAr: 'استوديو', surface: 40 },
                  'Villa': { bedrooms: 5, typeName: 'Villa', typeNameAr: 'فيلا', surface: 250 },
                };
                const defaults = smartDefaults[v];
                if (defaults) {
                  // Only auto-fill if the field is empty or matches a previous default (not user-customized)
                  const currentTypeName = String(form.typeName);
                  const wasPreviousDefault = Object.values(smartDefaults).some(d => d.typeName === currentTypeName) || !currentTypeName;
                  if (wasPreviousDefault) {
                    update('typeName', defaults.typeName);
                    update('typeNameAr', defaults.typeNameAr);
                  }
                  // Auto-suggest bedrooms if 0 or matches a previous default
                  const currentBedrooms = Number(form.bedrooms);
                  if (currentBedrooms === 0 || Object.values(smartDefaults).some(d => d.bedrooms === currentBedrooms)) {
                    update('bedrooms', defaults.bedrooms);
                  }
                  // Auto-suggest surface if empty or 0
                  const currentSurface = Number(form.surface);
                  if (currentSurface === 0 && defaults.surface) {
                    update('surface', defaults.surface);
                  }
                }
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['F2', 'F3', 'F4', 'F5', 'Duplex', 'Studio', 'Villa'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">ينبئ تلقائيًا: عدد الغرف + اسم النوع + المساحة</p>
            </div>
          </div>
          <div>
            <Label className="text-xs">Nom du type (FR)</Label>
            <Input value={String(form.typeName)} onChange={(e) => update('typeName', e.target.value)} placeholder="ex: F3 Familial" />
          </div>
          <div>
            <Label className="text-xs">Nom du type (AR)</Label>
            <Input value={String(form.typeNameAr)} onChange={(e) => update('typeNameAr', e.target.value)} dir="rtl" />
          </div>
          <div>
            <Label className="text-xs">Statut</Label>
            <Select value={String(form.status)} onValueChange={(v) => update('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Disponible</SelectItem>
                <SelectItem value="RESERVED">Réservé</SelectItem>
                <SelectItem value="SOLD">Vendu</SelectItem>
                <SelectItem value="COMING_SOON">Bientôt</SelectItem>
                <SelectItem value="OFF_MARKET">Retiré</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Surface (m²) *</Label>
              <Input type="number" value={String(form.surface)} onChange={(e) => update('surface', parseInt(e.target.value, 10) || 0)} />
            </div>
            <div>
              <Label className="text-xs">Ordre</Label>
              <Input type="number" value={String(form.order)} onChange={(e) => update('order', parseInt(e.target.value, 10) || 0)} />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Spec */}
      {tab === 'spec' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Étage</Label>
              <Input type="number" value={form.floor === undefined || form.floor === null ? '' : String(form.floor)} onChange={(e) => update('floor', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
            <div>
              <Label className="text-xs">Total étages (bâtiment)</Label>
              <Input type="number" value={form.totalFloors === undefined || form.totalFloors === null ? '' : String(form.totalFloors)} onChange={(e) => update('totalFloors', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Orientation</Label>
            <Select value={String(form.orientation)} onValueChange={(v) => update('orientation', v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                <SelectItem value="Nord">Nord</SelectItem>
                <SelectItem value="Sud">Sud</SelectItem>
                <SelectItem value="Est">Est</SelectItem>
                <SelectItem value="Ouest">Ouest</SelectItem>
                <SelectItem value="Nord-Est">Nord-Est</SelectItem>
                <SelectItem value="Nord-Ouest">Nord-Ouest</SelectItem>
                <SelectItem value="Sud-Est">Sud-Est</SelectItem>
                <SelectItem value="Sud-Ouest">Sud-Ouest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Balcons</Label>
              <Input type="number" value={form.balconies === undefined || form.balconies === null ? '' : String(form.balconies)} onChange={(e) => update('balconies', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
            <div>
              <Label className="text-xs">Surface balcon (m²)</Label>
              <Input type="number" value={form.balconySurface === undefined || form.balconySurface === null ? '' : String(form.balconySurface)} onChange={(e) => update('balconySurface', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Places de parking</Label>
              <Input type="number" value={form.parkingSpots === undefined || form.parkingSpots === null ? '' : String(form.parkingSpots)} onChange={(e) => update('parkingSpots', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={Boolean(form.hasParking)} onCheckedChange={() => toggleFlag('hasParking')} />
                Parking
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Surface terrasse (m²)</Label>
              <Input type="number" value={form.terraceSurface === undefined || form.terraceSurface === null ? '' : String(form.terraceSurface)} onChange={(e) => update('terraceSurface', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={Boolean(form.hasTerrace)} onCheckedChange={() => toggleFlag('hasTerrace')} />
                Terrasse
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Surface jardin (m²)</Label>
              <Input type="number" value={form.gardenSurface === undefined || form.gardenSurface === null ? '' : String(form.gardenSurface)} onChange={(e) => update('gardenSurface', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={Boolean(form.hasGarden)} onCheckedChange={() => toggleFlag('hasGarden')} />
                Jardin
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Rooms */}
      {tab === 'rooms' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Chambres</Label>
              <Input type="number" value={String(form.bedrooms)} onChange={(e) => update('bedrooms', parseInt(e.target.value, 10) || 0)} />
            </div>
            <div>
              <Label className="text-xs">Salles de bain</Label>
              <Input type="number" value={form.bathrooms === undefined || form.bathrooms === null ? '' : String(form.bathrooms)} onChange={(e) => update('bathrooms', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Caractéristiques (cliquer pour activer/désactiver)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                'Climatisation', 'Double vitrage', 'Chauffage central', 'Volets roulants électriques',
                'Cuisine équipée', 'Porte blindée', 'Vidéophone', 'Jardin privé', 'Débarras',
                'Cellier', 'Dressing', 'Cheminée', 'Alarme', 'Fibre optique', 'Domotique',
              ].map(f => (
                <button
                  key={f}
                  onClick={() => toggleFeature(f)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    selectedFeatures.includes(f) ? 'bg-forest text-white border-forest' : 'bg-background text-muted-foreground border-border hover:border-forest/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{selectedFeatures.length} caractéristique(s) sélectionnée(s).</p>
          </div>
        </div>
      )}

      {/* Tab: Price */}
      {tab === 'price' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs">Prix (DA)</Label>
            <Input type="number" value={form.price === undefined || form.price === null ? '' : String(form.price)} onChange={(e) => update('price', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} placeholder="ex: 16800000" />
            {form.price !== undefined && form.price !== null && form.surface ? (
              <p className="text-xs text-muted-foreground mt-1">Prix/m² : {Math.round(Number(form.price) / Number(form.surface)).toLocaleString('fr-FR')} DA/m²</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 p-3 border border-border rounded-md">
            <Switch checked={Boolean(form.priceOnRequest)} onCheckedChange={() => toggleFlag('priceOnRequest')} />
            <div>
              <p className="text-sm font-medium">Prix sur demande</p>
              <p className="text-xs text-muted-foreground">Masque le prix sur le site public.</p>
            </div>
          </div>
          <div>
            <Label className="text-xs">Plan de paiement (FR)</Label>
            <Textarea value={String(form.paymentPlan)} onChange={(e) => update('paymentPlan', e.target.value)} rows={3} placeholder="ex: 30% à la signature, solde sur 24 mois sans intérêts" />
          </div>
          <div>
            <Label className="text-xs">Plan de paiement (AR)</Label>
            <Textarea value={String(form.paymentPlanAr)} onChange={(e) => update('paymentPlanAr', e.target.value)} rows={3} dir="rtl" />
          </div>
        </div>
      )}

      {/* Tab: Description */}
      {tab === 'description' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs">Description (FR)</Label>
            <Textarea value={String(form.description)} onChange={(e) => update('description', e.target.value)} rows={6} />
          </div>
          <div>
            <Label className="text-xs">Description (AR)</Label>
            <Textarea value={String(form.descriptionAr)} onChange={(e) => update('descriptionAr', e.target.value)} rows={6} dir="rtl" />
          </div>
        </div>
      )}

      {/* Tab: SEO */}
      {tab === 'seo' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground">Laissez vide pour utiliser les valeurs par défaut. Ou cliquez sur le bouton pour générer automatiquement.</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-2"
            onClick={() => {
              // Auto-generate apartment SEO from entity data
              const typeName = String(form.typeName || '');
              const surface = form.surface ? String(form.surface) : '';
              const price = form.price ? Number(form.price).toLocaleString('fr-FR') : '';
              const bedrooms = form.bedrooms ? String(form.bedrooms) : '';
              const status = String(form.status || '');

              if (!form.seoTitle) update('seoTitle', `${typeName} ${surface}m² — ASAS Immobilier`);
              if (!form.seoDescription) update('seoDescription', `${typeName} de ${surface}m². ${bedrooms} chambres. ${price ? 'Prix: ' + price + ' DA.' : ''} Statut: ${status}.`);
              if (!form.ogImage && form.heroImage) update('ogImage', String(form.heroImage));
            }}
          >
            <span className="mr-2">✨</span> Générer SEO automatiquement
          </Button>
          <div>
            <Label className="text-xs">Titre SEO (meta title)</Label>
            <Input value={String(form.seoTitle)} onChange={(e) => update('seoTitle', e.target.value)} placeholder="ex: F3 Familial 92m² Résidence Les Oliviers — ASAS" />
            <p className="text-[10px] text-muted-foreground mt-1">Recommandé: 50-60 caractères.</p>
          </div>
          <div>
            <Label className="text-xs">Description SEO (meta description)</Label>
            <Textarea value={String(form.seoDescription)} onChange={(e) => update('seoDescription', e.target.value)} rows={3} placeholder="ex: Appartement F3 de 92m² à la Résidence Les Oliviers, Chéraga. 3 chambres, balcon. À partir de 16,8M DA." />
            <p className="text-[10px] text-muted-foreground mt-1">Recommandé: 150-160 caractères.</p>
          </div>
          <div>
            <Label className="text-xs">Mots-clés (séparés par virgules)</Label>
            <Input value={String(form.seoKeywords)} onChange={(e) => update('seoKeywords', e.target.value)} placeholder="F3, 92m², Chéraga, neuf, Alger" />
          </div>
          <div>
            <Label className="text-xs">URL canonique (canonical)</Label>
            <Input value={String(form.canonicalUrl)} onChange={(e) => update('canonicalUrl', e.target.value)} placeholder="Laissez vide pour auto" />
          </div>
          <div>
            <Label className="text-xs">Image OpenGraph (URL)</Label>
            <Input value={String(form.ogImage)} onChange={(e) => update('ogImage', e.target.value)} placeholder="/images/apartments/..." />
          </div>
          <div className="flex items-center gap-2 p-3 border border-border rounded-md">
            <Switch checked={Boolean(form.robotsIndex)} onCheckedChange={() => setForm(prev => ({ ...prev, robotsIndex: !prev.robotsIndex }))} />
            <div>
              <p className="text-sm font-medium">{form.robotsIndex ? 'Indexable par Google' : 'NOINDEX (non indexé)'}</p>
              <p className="text-xs text-muted-foreground">Désactivez pour les brouillons.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Publish */}
      {tab === 'publish' && (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {/* Pre-publish validation checklist */}
          <div className="border border-border rounded-md p-3 bg-muted/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">État de préparation</p>
            <div className="space-y-1.5">
              {[
                { label: 'Référence/numéro', ok: !!form.unitNumber, required: false },
                { label: 'Type + nom du type', ok: !!form.apartmentType && !!form.typeName, required: true },
                { label: 'Surface', ok: !!form.surface && Number(form.surface) > 0, required: true },
                { label: 'Étage', ok: form.floor !== undefined && form.floor !== null, required: true },
                { label: 'Chambres', ok: Number(form.bedrooms) > 0, required: true },
                { label: 'Prix', ok: !!form.price || form.priceOnRequest, required: true },
                { label: 'Orientation', ok: !!form.orientation, required: false },
                { label: 'Description SEO', ok: !!form.seoDescription, required: false },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={c.ok ? 'text-emerald-600' : (c.required ? 'text-red-600' : 'text-amber-600')}>
                    {c.ok ? '✓' : (c.required ? '✕' : '⚠')}
                  </span>
                  <span className={c.ok ? 'text-foreground' : (c.required ? 'text-red-700 font-medium' : 'text-amber-700')}>
                    {c.label}{c.required ? ' (requis)' : ''}
                  </span>
                </div>
              ))}
            </div>
            {!form.apartmentType || !form.typeName || !form.surface || !form.price ? (
              <p className="text-[10px] text-red-700 mt-2">⚠ Des champs requis manquent. La publication est déconseillée.</p>
            ) : (
              <p className="text-[10px] text-emerald-700 mt-2">✓ Prêt pour publication.</p>
            )}
          </div>
          <div className="flex items-center gap-2 p-3 border border-border rounded-md">
            <Switch checked={Boolean(form.published)} onCheckedChange={() => toggleFlag('published')} />
            <div>
              <p className="text-sm font-medium">{form.published ? 'Publié' : 'Brouillon'}</p>
              <p className="text-xs text-muted-foreground">Les appartements non publiés sont invisibles sur le site public.</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(`/#/projects/${apartment.project.slug}/apartments/${apartment.slug}`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" /> Aperçu sur le site
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
      )}

      {/* Price change confirmation dialog */}
      <Dialog open={!!priceChangeConfirm} onOpenChange={(o) => !o && setPriceChangeConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmer le changement de prix</DialogTitle></DialogHeader>
          {priceChangeConfirm && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Vous êtes sur le point de modifier le prix de cet appartement. Cette action sera enregistrée dans le journal d&apos;audit.
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="border border-border rounded-md p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Ancien prix</p>
                  <p className="text-lg font-bold text-muted-foreground">
                    {(priceChangeConfirm.oldPrice ?? 0).toLocaleString('fr-FR')} DA
                  </p>
                </div>
                <div className="border border-forest/30 bg-forest/5 rounded-md p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Nouveau prix</p>
                  <p className="text-lg font-bold text-forest">
                    {(priceChangeConfirm.newPrice ?? 0).toLocaleString('fr-FR')} DA
                  </p>
                </div>
              </div>
              <div className="text-center p-2 rounded-md bg-amber-50 border border-amber-200">
                <p className="text-sm font-semibold text-amber-800">
                  Différence: {((priceChangeConfirm.newPrice ?? 0) - (priceChangeConfirm.oldPrice ?? 0)).toLocaleString('fr-FR')} DA
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPriceChangeConfirm(null)}>Annuler</Button>
                <Button onClick={() => save(true)} className="bg-forest hover:bg-forest/90">
                  Confirmer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button onClick={() => save(false)} disabled={saving} className="bg-forest hover:bg-forest/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Sauvegarder
        </Button>
      </DialogFooter>
    </div>
  );
}

/* ─── Apartment Create Form ─── */

function ApartmentCreateForm({ projects, onClose }: { projects: AdminProject[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [projectId, setProjectId] = useState('');
  const [typeName, setTypeName] = useState('');
  const [surface, setSurface] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [apartmentType, setApartmentType] = useState('F3');
  const [price, setPrice] = useState('');
  const [floor, setFloor] = useState('1');
  const [status, setStatus] = useState('AVAILABLE');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slug = useMemo(() => slugify(`${typeName}-${surface || ''}`), [typeName, surface]);

  // Smart defaults: when type changes, auto-fill bedrooms + typeName + suggested surface
  const SMART_DEFAULTS: Record<string, { bedrooms: string; typeName: string; surface: string; price: string }> = {
    'F2':     { bedrooms: '2', typeName: 'F2 Confort',     surface: '65',  price: '8000000'  },
    'F3':     { bedrooms: '3', typeName: 'F3 Familial',    surface: '92',  price: '16000000' },
    'F4':     { bedrooms: '4', typeName: 'F4 Standing',    surface: '120', price: '22000000' },
    'F5':     { bedrooms: '5', typeName: 'F5 Prestige',    surface: '150', price: '28000000' },
    'Duplex': { bedrooms: '4', typeName: 'Duplex Panoramique', surface: '140', price: '25000000' },
    'Studio': { bedrooms: '1', typeName: 'Studio Moderne',  surface: '40',  price: '5000000'  },
    'Villa':  { bedrooms: '5', typeName: 'Villa',           surface: '250', price: '45000000' },
  };

  const onTypeChange = (newType: string) => {
    setApartmentType(newType);
    const defaults = SMART_DEFAULTS[newType];
    if (defaults) {
      // Only auto-fill if fields are empty or match a previous default
      const currentTypeName = typeName;
      const wasPreviousDefault = Object.values(SMART_DEFAULTS).some(d => d.typeName === currentTypeName) || !currentTypeName;
      if (wasPreviousDefault) {
        setTypeName(defaults.typeName);
      }
      const currentBedrooms = bedrooms;
      if (!currentBedrooms || Object.values(SMART_DEFAULTS).some(d => d.bedrooms === currentBedrooms)) {
        setBedrooms(defaults.bedrooms);
      }
      if (!surface || Object.values(SMART_DEFAULTS).some(d => d.surface === surface)) {
        setSurface(defaults.surface);
      }
      if (!price || Object.values(SMART_DEFAULTS).some(d => d.price === price)) {
        setPrice(defaults.price);
      }
    }
  };

  // Auto-calculate price per m² for display
  const pricePerM2 = price && surface ? Math.round(parseInt(price, 10) / parseInt(surface, 10)) : null;

  const save = async () => {
    if (!projectId || !typeName.trim() || !surface || Number(surface) <= 0) { setError('Projet, nom du type et surface valide sont obligatoires.'); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/apartments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          slug,
          typeName,
          apartmentType,
          surface: parseInt(surface, 10),
          bedrooms: parseInt(bedrooms, 10),
          floor: floor ? parseInt(floor, 10) : null,
          price: price ? parseInt(price, 10) : null,
          status,
          published: false,
        }),
      });
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ['admin', 'apartments'] });
        onClose();
      } else {
        const err = await res.json();
        setError(err.error ?? 'Impossible de créer l’appartement.');
      }
    } catch {
      setError('Impossible de créer l’appartement. Vérifiez votre connexion puis réessayez.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Project selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Projet <span className="text-red-500">*</span></Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger><SelectValue placeholder="Sélectionner un projet" /></SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} — {p.district}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type + auto-fill */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Type <span className="text-red-500">*</span></Label>
          <Select value={apartmentType} onValueChange={onTypeChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(SMART_DEFAULTS).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">💡 Remplit auto: chambres, nom, surface, prix</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Nom du type</Label>
          <Input value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder="Ex: F3 Familial" />
        </div>
      </div>

      {/* Surface + Bedrooms + Floor */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Surface (m²) <span className="text-red-500">*</span></Label>
          <Input type="number" value={surface} onChange={(e) => setSurface(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Chambres</Label>
          <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Étage</Label>
          <Input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} />
        </div>
      </div>

      {/* Price + auto-calculated price/m² */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Prix (DA)</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="16000000" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Prix/m² (auto)</Label>
          <div className="h-9 flex items-center px-3 bg-muted rounded-md">
            <span className="text-sm font-medium text-muted-foreground">
              {pricePerM2 ? `${pricePerM2.toLocaleString('fr-FR')} DA/m²` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-xs">Statut</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="AVAILABLE">Disponible</SelectItem>
            <SelectItem value="RESERVED">Réservé</SelectItem>
            <SelectItem value="SOLD">Vendu</SelectItem>
            <SelectItem value="COMING_SOON">Bientôt</SelectItem>
            <SelectItem value="OFF_MARKET">Retiré</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Slug preview */}
      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground">Slug (auto)</Label>
        <Input value={slug} className="bg-muted text-xs font-mono" readOnly />
      </div>

      <p className="text-[10px] text-muted-foreground bg-muted/50 rounded p-2">
        💡 L'appartement sera créé en <strong>Brouillon</strong>. Complétez les détails
        (orientation, plan, galerie, SEO) via le formulaire d'édition (7 onglets) puis publiez.
      </p>

      {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
        <Button onClick={save} disabled={saving || !projectId || !typeName.trim() || !surface || Number(surface) <= 0} className="bg-forest hover:bg-forest/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Créer l'appartement
        </Button>
      </DialogFooter>
    </div>
  );
}

/* ─── Login Gate ─── */

function AdminLoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('admin@asas.dz');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if there's already a valid session cookie.
  // If yes, call onSuccess to skip the login form.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/me', { credentials: 'include' });
        if (!cancelled && res.ok) {
          onSuccess();
        }
      } catch {
        // ignore — stay on login form
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => { cancelled = true; };
  }, [onSuccess]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez saisir votre email et mot de passe');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Échec de connexion' }));
        throw new Error(data.error ?? 'Échec de connexion');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest to-charcoal">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest to-charcoal p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-charcoal text-white px-8 py-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-xl bg-forest flex items-center justify-center mb-3">
            <span className="text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ASAS Admin</h1>
          <p className="text-sm text-sand/80 mt-1">Panneau de gestion immobilière</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@asas.dz"
              autoFocus
              autoComplete="email"
              disabled={loading}
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              className="w-full"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-forest hover:bg-forest/90 text-white"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion…</>
            ) : (
              'Se connecter'
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            Accès réservé aux administrateurs ASAS
          </p>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminWorkspaceId>(() => getAdminRoute().workspace);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function navigateTab(tab: AdminWorkspaceId) {
    const nextHref = adminRouteHref(tab);
    setActiveTab(tab);
    window.history.pushState(null, '', nextHref);
    if (window.innerWidth < 768) setMobileSidebarOpen(false);
  }

  useEffect(() => {
    const syncFromUrl = () => setActiveTab(getAdminRoute().workspace);
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    syncFromUrl();
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, []);

  useEffect(() => {
    const invalidateAdminData = () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    };
    window.addEventListener('asas-admin-data-changed', invalidateAdminData);
    return () => window.removeEventListener('asas-admin-data-changed', invalidateAdminData);
  }, [queryClient]);


  // Filter state
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');

  // Dialog state
  const [editProject, setEditProject] = useState<AdminProject | null>(null);
  const [editApartment, setEditApartment] = useState<AdminApartment | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateApartment, setShowCreateApartment] = useState(false);

  /* ─── Queries ─── */

  const projectsQuery = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: fetchAdminProjects,
    enabled: isAuthenticated && (activeTab === 'dashboard' || activeTab === 'media'),
  });

  const apartmentsQuery = useQuery({
    queryKey: ['admin', 'apartments', projectFilter, statusFilter, typeFilter],
    queryFn: () => fetchAdminApartments({
      projectSlug: projectFilter !== 'all' ? projectFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
    }),
    enabled: isAuthenticated && (activeTab === 'dashboard' || activeTab === 'media'),
  });

  const buildingsQuery = useQuery({
    queryKey: ['admin', 'buildings'],
    queryFn: fetchAdminBuildings,
    enabled: isAuthenticated && activeTab === 'dashboard',
  });

  const leadsQuery = useQuery({
    queryKey: ['admin', 'leads', leadStatusFilter],
    queryFn: () => fetchAdminLeads(leadStatusFilter !== 'all' ? leadStatusFilter : undefined),
    enabled: isAuthenticated && activeTab === 'dashboard',
  });

  // Dashboard KPIs come from database aggregates, never from paginated/list datasets.
  const projects = projectsQuery.data ?? [];
  const apartments = apartmentsQuery.data ?? [];
  const leads = leadsQuery.data ?? [];

  const dashboardStatsQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      const json = await res.json() as { data: {
        totalProjects: number;
        totalApartments: number;
        availableCount: number;
        reservedCount: number;
        soldCount: number;
        totalLeads: number;
        newLeadsCount: number;
        intentBreakdown: Record<string, number>;
      }};
      return json.data;
    },
    enabled: isAuthenticated && activeTab === 'dashboard',
    staleTime: 30_000,
  });

  const stats = dashboardStatsQuery.data ?? {
    totalProjects: 0,
    totalApartments: 0,
    availableCount: 0,
    reservedCount: 0,
    soldCount: 0,
    totalLeads: 0,
    newLeadsCount: 0,
    intentBreakdown: {},
  };

  /* ─── Render ─── */

  if (!isAuthenticated) {
    return (
      <AdminLoginGate
        onSuccess={() => {
          setIsAuthenticated(true);
          // Re-trigger all admin queries now that we have a session cookie
          queryClient.invalidateQueries({ queryKey: ['admin'] });
        }}
      />
    );
  }

  return (
    <div className="admin-page-shell min-h-screen bg-ivory flex">
      {/* Mobile navigation */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 shadow-sm backdrop-blur md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest text-sm font-bold text-white">A</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-charcoal">ASAS Admin</p>
            <p className="truncate text-[10px] text-muted-foreground">{SIDEBAR_GROUPS.flatMap((group) => group.items).find((item) => item.id === activeTab)?.label ?? 'Tableau de bord'}</p>
          </div>
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => setMobileSidebarOpen(true)} aria-label="Ouvrir le menu d’administration" aria-expanded={mobileSidebarOpen}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu d’administration"
          className="fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-[1px] md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col bg-charcoal text-white shadow-2xl transition-transform duration-200 md:sticky md:top-0 md:z-30 md:h-screen md:shadow-none translate-x-0 ${sidebarOpen ? 'md:w-56' : 'md:w-16'}`} data-mobile-open={mobileSidebarOpen}>
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-sm font-bold tracking-tight">ASAS Admin</p>
              <p className="text-[10px] text-sand/60">Panneau de gestion</p>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-4">
          {SIDEBAR_GROUPS.map((group, gi) => (
            <div key={gi} className="space-y-1">
              {sidebarOpen && group.label && (
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-sand/40 uppercase">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    activeTab === item.id
                      ? 'bg-forest text-white shadow-lg shadow-forest/20'
                      : 'text-sand/80 hover:bg-white/5 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button
          onClick={async () => {
            try { await fetch('/api/admin/logout', { method: 'POST' }); } catch {}
            setIsAuthenticated(false);
            queryClient.invalidateQueries({ queryKey: ['admin'] });
          }}
          className="m-2 mb-1 px-3 py-2 rounded-lg text-xs text-red-200 hover:bg-red-500/20 border border-white/5 hover:border-red-500/40 transition-colors flex items-center gap-2 justify-center"
          title="Se déconnecter"
        >
          <span className="h-3.5 w-3.5 inline-block">⎋</span>
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
        <button
          onClick={() => { if (window.innerWidth < 768) setMobileSidebarOpen(false); else setSidebarOpen(!sidebarOpen); }}
          className="flex items-center justify-center border-t border-white/10 p-3 text-sand/60 transition-colors hover:text-white"
          aria-label={sidebarOpen ? 'Réduire le menu' : 'Développer le menu'} aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-6 pt-20 sm:px-6 md:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            stats={stats}
            leads={leads}
            projects={projects}
            apartments={apartments}
            onNavigate={(tab) => navigateTab(tab)}
            onCreateProject={() => setShowCreateProject(true)}
            onCreateApartment={() => setShowCreateApartment(true)}
          />
        )}
        {activeTab === 'projects' && (
          <AdminProjectsWorkspace />
        )}
        {activeTab === 'apartments' && (
          <AdminApartmentsWorkspace />
        )}
        {activeTab === 'buildings' && (
          <AdminBuildingsWorkspace />
        )}
        {activeTab === 'media' && (
          <MediaTab projects={projects} apartments={apartments} />
        )}
        {activeTab === 'leads' && (
          <AdminLeadsPremiumWorkspace />
        )}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'audit' && <AuditLogTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Dialogs */}
      {editProject && (
        <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Modifier: {editProject.name}</DialogTitle></DialogHeader>
            <ProjectEditForm project={editProject} onClose={() => setEditProject(null)} />
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nouveau Projet</DialogTitle></DialogHeader>
          <ProjectCreateForm onClose={() => setShowCreateProject(false)} />
        </DialogContent>
      </Dialog>
      {editApartment && (
        <Dialog open={!!editApartment} onOpenChange={() => setEditApartment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Modifier: {editApartment.unitNumber ?? editApartment.typeName}</DialogTitle></DialogHeader>
            <ApartmentEditForm apartment={editApartment} onClose={() => setEditApartment(null)} />
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={showCreateApartment} onOpenChange={setShowCreateApartment}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nouvel Appartement</DialogTitle></DialogHeader>
          <ApartmentCreateForm projects={projects} onClose={() => setShowCreateApartment(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
