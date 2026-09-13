import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const PROJECT_STATUSES = ['AVAILABLE', 'COMING_SOON', 'SOLD_OUT', 'DRAFT'] as const;

const projectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  search: z.string().trim().max(200).default(''),
  status: z.string().trim().default(''),
});

const projectCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalide'),
  nameAr: z.string().trim().max(500).nullable().optional(),
  tagline: z.string().trim().max(500).nullable().optional(),
  taglineAr: z.string().trim().max(500).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  descriptionAr: z.string().max(10000).nullable().optional(),
  city: z.string().trim().min(1).max(200),
  cityAr: z.string().trim().max(200).nullable().optional(),
  district: z.string().trim().min(1).max(200),
  districtAr: z.string().trim().max(200).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  addressAr: z.string().trim().max(500).nullable().optional(),
  latitude: z.number().finite().min(-90).max(90).nullable().optional(),
  longitude: z.number().finite().min(-180).max(180).nullable().optional(),
  projectType: z.string().trim().min(1).max(100).default('RESIDENTIAL'),
  status: z.enum(PROJECT_STATUSES).default('DRAFT'),
  apartmentTypes: z.any().default([]),
  minSurface: z.number().int().nonnegative().nullable().optional(),
  maxSurface: z.number().int().nonnegative().nullable().optional(),
  deliveryYear: z.number().int().min(1900).max(2200).nullable().optional(),
  deliveryQuarter: z.string().trim().max(20).nullable().optional(),
  hasParking: z.boolean().default(false),
  hasElevator: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  hasSecurity: z.boolean().default(false),
  hasClim: z.boolean().default(false),
  startingPrice: z.number().finite().nonnegative().nullable().optional(),
  priceOnRequest: z.boolean().default(false),
  developerId: z.string().uuid().nullable().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
  seoTitle: z.string().trim().max(500).nullable().optional(),
  seoDescription: z.string().max(10000).nullable().optional(),
  seoKeywords: z.string().max(10000).nullable().optional(),
  canonicalUrl: z.string().trim().url().max(1000).nullable().optional(),
  ogImage: z.string().trim().max(1000).nullable().optional(),
  robotsIndex: z.boolean().default(true),
}).strict();

export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const parsed = projectQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) return withSecurityHeaders(NextResponse.json({ error: 'Paramètres de requête invalides' }, { status: 400 }));
    const { page, limit, search, status } = parsed.data;

    const where = {
      archived: false,
      ...(status && status !== 'all' ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { slug: { contains: search, mode: 'insensitive' as const } },
              { city: { contains: search, mode: 'insensitive' as const } },
              { district: { contains: search, mode: 'insensitive' as const } },
              { developer: { is: { name: { contains: search, mode: 'insensitive' as const } } } },
            ],
          }
        : {}),
    };

    const total = await db.project.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const effectivePage = Math.min(page, totalPages);

    const projects = await db.project.findMany({
      where,
      skip: (effectivePage - 1) * limit,
      take: limit,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }, { id: 'asc' }],
      include: {
        _count: { select: { apartments: true, buildings: true } },
        developer: { select: { id: true, name: true, slug: true } },
        imagesRelation: { where: { type: 'hero' }, take: 1 },
      },
    });
    const result = projects.map((p) => ({
      id: p.id, slug: p.slug, name: p.name, nameAr: p.nameAr, city: p.city, district: p.district,
      projectType: p.projectType, status: p.status, published: p.published, featured: p.featured,
      startingPrice: p.startingPrice, priceOnRequest: p.priceOnRequest, deliveryYear: p.deliveryYear,
      deliveryQuarter: p.deliveryQuarter, apartmentCount: p._count.apartments, buildingCount: p._count.buildings,
      heroImage: p.imagesRelation[0]?.url ?? null, developer: p.developer, order: p.order,
      createdAt: p.createdAt, updatedAt: p.updatedAt,
    }));

    return withSecurityHeaders(NextResponse.json({ data: result, meta: { page: effectivePage, limit, total, totalPages } }));
  } catch (error) {
    console.error('[API /admin/projects] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 }));
  }
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminAuth(request);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) return withSecurityHeaders(NextResponse.json({ error: 'Privilèges insuffisants. Réservé aux administrateurs et éditeurs.' }, { status: 403 }));

  try {
    const body = await request.json();
    const parsed = projectCreateSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json({ error: 'Données de création du projet invalides', details: parsed.error.flatten() }, { status: 400 }));
    }

    const data = parsed.data;
    if (data.minSurface !== null && data.minSurface !== undefined && data.maxSurface !== null && data.maxSurface !== undefined && data.minSurface > data.maxSurface) {
      return withSecurityHeaders(NextResponse.json({ error: 'La surface minimale ne peut pas dépasser la surface maximale.' }, { status: 400 }));
    }
    if (data.priceOnRequest !== true && data.startingPrice === null || data.priceOnRequest !== true && data.startingPrice === undefined) {
      return withSecurityHeaders(NextResponse.json({ error: 'Un prix de départ ou l’option « prix sur demande » est requis.' }, { status: 400 }));
    }
    if (await db.project.findUnique({ where: { slug: data.slug } })) {
      return withSecurityHeaders(NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 }));
    }

    const project = await db.project.create({ data });
    await logAudit({ request, session, action: 'CREATE_PROJECT', entityType: 'Project', entityId: project.id, entitySlug: project.slug, after: { name: project.name, slug: project.slug, status: project.status, published: project.published } });
    return withSecurityHeaders(NextResponse.json({ data: project }, { status: 201 }));
  } catch (error) {
    console.error('[API /admin/projects] POST error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create project' }, { status: 500 }));
  }
}
