/**
 * Fix broken image URLs in the database.
 * Remaps non-existent image files to premium AI-generated images.
 *
 * Strategy:
 *  - Project hero images  → keep their dedicated hero file (already exists)
 *  - Project gallery      → rotate through 4 new gallery images (exterior, garden, lobby, night)
 *  - Apartment floor-plan → plan-f2.jpg | plan-f3.jpg | plan-f4.jpg (by type)
 *  - Apartment 3d-plan    → interiors/living-1.jpg
 *  - Apartment hero        → project's hero image
 *  - Apartment gallery    → interiors/{living-1, kitchen-1}.jpg (rotate)
 *
 * Verifies each URL corresponds to a real file on disk before writing.
 */
import { db } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

const fileExists = (url: string) => {
  if (!url.startsWith('/images/')) return false;
  return fs.existsSync(path.join(PUBLIC_DIR, url));
};

const GALLERY_IMAGES = [
  '/images/projects/gallery/exterior-1.jpg',
  '/images/projects/gallery/garden-1.jpg',
  '/images/projects/gallery/lobby-1.jpg',
  '/images/projects/gallery/night-1.jpg',
];

const INTERIOR_IMAGES = [
  '/images/apartments/interiors/living-1.jpg',
  '/images/apartments/interiors/kitchen-1.jpg',
  '/images/apartments/interior-living.jpg',
  '/images/apartments/interior-kitchen.jpg',
];

const PROJECT_HERO_BY_SLUG: Record<string, string> = {
  'residence-les-oliviers': '/images/projects/les-oliviers-hero.jpg',
  'residence-el-borj': '/images/projects/el-borj-hero.jpg',
  'residence-dar-saida': '/images/projects/dar-saida-hero.jpg',
  'residence-les-pins': '/images/projects/les-pins-hero.jpg',
};

function planForType(type: string): string {
  if (type.startsWith('F2')) return '/images/apartments/plan-f2.jpg';
  if (type.startsWith('F4') || type === 'Duplex') return '/images/apartments/plan-f4.jpg';
  return '/images/apartments/plan-f3.jpg';
}

async function fixProjectImages() {
  const projects = await db.project.findMany({ select: { id: true, slug: true } });
  let updated = 0;

  for (const project of projects) {
    const heroUrl = PROJECT_HERO_BY_SLUG[project.slug] || '/images/projects/les-oliviers-hero.jpg';

    const projectImages = await db.projectImage.findMany({
      where: { projectId: project.id },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < projectImages.length; i++) {
      const img = projectImages[i];
      if (fileExists(img.url)) continue;

      let newUrl = img.url;
      if (img.type === 'hero') {
        newUrl = heroUrl;
      } else if (img.type === 'gallery' || img.type === 'exterior' || img.type === 'interior' || img.type === 'amenity') {
        newUrl = GALLERY_IMAGES[i % GALLERY_IMAGES.length];
      } else {
        newUrl = GALLERY_IMAGES[i % GALLERY_IMAGES.length];
      }

      if (newUrl !== img.url && fileExists(newUrl)) {
        await db.projectImage.update({ where: { id: img.id }, data: { url: newUrl } });
        updated++;
      }
    }
  }
  console.log(`✓ Project images: ${updated} URLs remapped`);
  return updated;
}

async function fixApartmentImages() {
  const apartments = await db.apartment.findMany({
    select: { id: true, apartmentType: true, projectId: true, project: { select: { slug: true } } },
  });
  let updated = 0;

  for (const apt of apartments) {
    const heroUrl = PROJECT_HERO_BY_SLUG[apt.project.slug] || '/images/projects/les-oliviers-hero.jpg';
    const planUrl = planForType(apt.apartmentType);

    const aptImages = await db.apartmentImage.findMany({
      where: { apartmentId: apt.id },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < aptImages.length; i++) {
      const img = aptImages[i];
      if (fileExists(img.url)) continue;

      let newUrl = img.url;
      if (img.type === 'floor-plan') {
        newUrl = planUrl;
      } else if (img.type === '3d-plan') {
        newUrl = '/images/apartments/interiors/living-1.jpg';
      } else if (img.type === 'hero') {
        newUrl = heroUrl;
      } else if (img.type === 'render' || img.type === 'interior' || img.type === 'exterior') {
        newUrl = INTERIOR_IMAGES[i % INTERIOR_IMAGES.length];
      } else if (img.type === 'gallery') {
        newUrl = INTERIOR_IMAGES[i % INTERIOR_IMAGES.length];
      } else {
        newUrl = INTERIOR_IMAGES[i % INTERIOR_IMAGES.length];
      }

      if (newUrl !== img.url && fileExists(newUrl)) {
        await db.apartmentImage.update({ where: { id: img.id }, data: { url: newUrl } });
        updated++;
      }
    }
  }
  console.log(`✓ Apartment images: ${updated} URLs remapped`);
  return updated;
}

async function verifyAllUrlsExist() {
  const projectImages = await db.projectImage.findMany();
  const aptImages = await db.apartmentImage.findMany();

  const missing: { table: string; id: string; url: string }[] = [];
  for (const img of projectImages) {
    if (!fileExists(img.url)) missing.push({ table: 'ProjectImage', id: img.id, url: img.url });
  }
  for (const img of aptImages) {
    if (!fileExists(img.url)) missing.push({ table: 'ApartmentImage', id: img.id, url: img.url });
  }

  if (missing.length === 0) {
    console.log(`✅ All ${projectImages.length + aptImages.length} image URLs verified — files exist on disk`);
  } else {
    console.log(`⚠️  ${missing.length} URLs still point to non-existent files:`);
    for (const m of missing.slice(0, 10)) console.log(`   - ${m.table} ${m.id}: ${m.url}`);
  }
  return missing.length;
}

async function main() {
  console.log('🔧 Fixing broken image URLs in database...');
  await fixProjectImages();
  await fixApartmentImages();
  await verifyAllUrlsExist();
  console.log('✓ Done.');
}

main()
  .catch((e) => {
    console.error('Fix failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
