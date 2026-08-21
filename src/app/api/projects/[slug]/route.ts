import { NextRequest, NextResponse } from 'next/server';
import { withPublicCache } from '@/lib/with-security-headers';
import { getPublicProject } from '@/lib/catalog-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 });

    const project = await getPublicProject(slug);
    if (!project) {
      return withPublicCache(NextResponse.json({ error: 'Project not found' }, { status: 404 }));
    }

    return withPublicCache(NextResponse.json(project));
  } catch (error) {
    console.error('[API /projects/[slug]] Failed to fetch project:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 }));
  }
}
