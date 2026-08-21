import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';

function jsonString(value: unknown): string { if (value == null) return '[]'; if (typeof value === 'string') return value; try { return JSON.stringify(value); } catch { return '[]'; } }
function normalizeApartment<T extends Record<string, any>>(a: T) { return { ...a, rooms: jsonString(a.rooms), features: jsonString(a.features), featuresAr: jsonString(a.featuresAr) }; }
function normalizeProject<T extends Record<string, any>>(p: T) { return { ...p, apartmentTypes: jsonString(p.apartmentTypes), apartments: (p.apartments ?? []).map(normalizeApartment), buildings: (p.buildings ?? []).map((b: any) => ({ ...b, apartments: (b.apartments ?? []).map(normalizeApartment) })) }; }

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 });
    const project = await db.project.findUnique({ where: { slug }, include: {
      buildings: { orderBy: { order: 'asc' }, include: { apartments: { where: { published: true, archived: false }, orderBy: { order: 'asc' }, include: { images: { orderBy: { order: 'asc' } } } } } },
      apartments: { where: { published: true, archived: false }, orderBy: { order: 'asc' }, include: { images: { orderBy: { order: 'asc' } }, building: true } },
      images: { orderBy: { order: 'asc' } }, amenities: { orderBy: { name: 'asc' } }, developer: true,
    } });
    if (!project || !project.published || project.archived) return withPublicCache(NextResponse.json({ error: 'Project not found' }, { status: 404 }));
    return withPublicCache(NextResponse.json(normalizeProject(project)));
  } catch (error) {
    console.error('[API /projects/[slug]] Failed to fetch project:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 }));
  }
}
