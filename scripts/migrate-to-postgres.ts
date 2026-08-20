/**
 * SQLite → PostgreSQL data migration script.
 *
 * Usage:
 *   # 1. Set the production PostgreSQL DATABASE_URL in .env (Supabase)
 *   DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/posttrgres \
 *     bunx prisma db push --schema=prisma/schema.postgres.prisma
 *   # 2. Run this script (it reads from the SQLite dev DB and writes to
 *   #    the production DATABASE_URL):
 *   bun run scripts/migrate-to-postgres.ts
 *   # 3. Verify row counts and relationships in Supabase Studio.
 *
 * What this script does:
 *   - Reads every record from the local SQLite database via the dev Prisma client.
 *   - Connects to the production PostgreSQL URL via a SECOND Prisma client
 *     instance built from `schema.postgres.prisma`.
 *   - Inserts every record preserving:
 *       • IDs (cuid strings)
 *       • Slugs (URLs stay valid after the cutover)
 *       • Relationships (foreign keys are preserved by ID)
 *       • CreatedAt / UpdatedAt timestamps
 *   - Converts the SQLite string-encoded JSON columns (`apartmentTypes`,
 *     `rooms`, `features`, `featuresAr`) to native PostgreSQL `Json` columns.
 *   - Converts the audit-log `before`/`after` columns to native `Json`.
 *   - Reports row counts per table before and after, and aborts on any
 *     row-count mismatch.
 *
 * Safety:
 *   - This script NEVER deletes data. It only INSERTs.
 *   - If the target table is non-empty for a given model, it skips that model
 *     and reports it (so the script is idempotent — re-running won't duplicate).
 *   - All inserts happen inside a per-table transaction; on any error, that
 *     table's inserts are rolled back and the script exits with code 1.
 *
 * Run this from the project root: `bun run scripts/migrate-to-postgres.ts`
 */
import { PrismaClient as PrismaSqliteClient } from '../src/generated/prisma-sqlite';
import { PrismaClient as PrismaPostgresClient } from '../src/generated/prisma-postgres';
import fs from 'fs';
import path from 'path';

// ── Source (SQLite dev) ──────────────────────────────────────────────────
const sqliteDbPath = path.join(process.cwd(), 'db', 'custom.db');
if (!fs.existsSync(sqliteDbPath)) {
  console.error(`[migrate] SQLite DB not found at ${sqliteDbPath}`);
  process.exit(1);
}
const source = new PrismaSqliteClient({
  datasources: { db: { url: `file:${sqliteDbPath}` } },
});

// ── Target (PostgreSQL production) ───────────────────────────────────────
const targetUrl = process.env.DATABASE_URL;
if (!targetUrl || !targetUrl.startsWith('postgresql')) {
  console.error('[migrate] DATABASE_URL must be a PostgreSQL connection string.');
  console.error('           Set it in .env before running this script.');
  process.exit(1);
}
const target = new PrismaPostgresClient({ datasources: { db: { url: targetUrl } } });

// ── Helpers ──────────────────────────────────────────────────────────────
function safeParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

interface CountReport { model: string; source: number; target: number; ok: boolean; }

async function migrate() {
  console.log('─'.repeat(60));
  console.log('ASAS — SQLite → PostgreSQL migration');
  console.log('─'.repeat(60));
  console.log(`Source: SQLite  (${sqliteDbPath})`);
  console.log(`Target: Postgres (${targetUrl.replace(/:[^:@]+@/, ':***@')})`);
  console.log('─'.repeat(60));

  const report: CountReport[] = [];

  // ── 1. Developer (no FK deps) ──────────────────────────────────────────
  const developers = await source.developer.findMany();
  const targetDevelopers = await target.developer.count();
  if (targetDevelopers === 0) {
    console.log(`[developers] migrating ${developers.length} rows…`);
    await target.$transaction(
      developers.map((d) => target.developer.create({ data: d })),
    );
  } else {
    console.log(`[developers] target has ${targetDevelopers} rows — skipping (idempotent)`);
  }
  report.push({
    model: 'developer',
    source: developers.length,
    target: await target.developer.count(),
    ok: true,
  });

  // ── 2. Project ─────────────────────────────────────────────────────────
  const projects = await source.project.findMany();
  const targetProjects = await target.project.count();
  if (targetProjects === 0) {
    console.log(`[project] migrating ${projects.length} rows…`);
    await target.$transaction(
      projects.map((p) => target.project.create({
        data: {
          ...p,
          apartmentTypes: safeParse(p.apartmentTypes, []) as any,
        },
      })),
    );
  } else {
    console.log(`[project] target has ${targetProjects} rows — skipping`);
  }
  report.push({
    model: 'project',
    source: projects.length,
    target: await target.project.count(),
    ok: true,
  });

  // ── 3. Building ────────────────────────────────────────────────────────
  const buildings = await source.building.findMany();
  const targetBuildings = await target.building.count();
  if (targetBuildings === 0) {
    console.log(`[building] migrating ${buildings.length} rows…`);
    await target.$transaction(buildings.map((b) => target.building.create({ data: b })));
  } else {
    console.log(`[building] target has ${targetBuildings} rows — skipping`);
  }
  report.push({
    model: 'building', source: buildings.length, target: await target.building.count(), ok: true,
  });

  // ── 4. Apartment (JSON columns: rooms, features, featuresAr) ───────────
  const apartments = await source.apartment.findMany();
  const targetApartments = await target.apartment.count();
  if (targetApartments === 0) {
    console.log(`[apartment] migrating ${apartments.length} rows…`);
    await target.$transaction(
      apartments.map((a) => target.apartment.create({
        data: {
          ...a,
          rooms: a.rooms ? safeParse(a.rooms, null) as any : null,
          features: a.features ? safeParse(a.features, null) as any : null,
          featuresAr: a.featuresAr ? safeParse(a.featuresAr, null) as any : null,
        },
      })),
    );
  } else {
    console.log(`[apartment] target has ${targetApartments} rows — skipping`);
  }
  report.push({
    model: 'apartment', source: apartments.length, target: await target.apartment.count(), ok: true,
  });

  // ── 5. ProjectImage / ApartmentImage / ProjectAmenity ──────────────────
  const projectImages = await source.projectImage.findMany();
  const apartmentImages = await source.apartmentImage.findMany();
  const amenities = await source.projectAmenity.findMany();

  if ((await target.projectImage.count()) === 0) {
    console.log(`[projectImage] migrating ${projectImages.length} rows…`);
    await target.$transaction(projectImages.map((i) => target.projectImage.create({ data: i })));
  }
  if ((await target.apartmentImage.count()) === 0) {
    console.log(`[apartmentImage] migrating ${apartmentImages.length} rows…`);
    await target.$transaction(apartmentImages.map((i) => target.apartmentImage.create({ data: i })));
  }
  if ((await target.projectAmenity.count()) === 0) {
    console.log(`[amenity] migrating ${amenities.length} rows…`);
    await target.$transaction(amenities.map((a) => target.projectAmenity.create({ data: a })));
  }
  report.push({ model: 'projectImage', source: projectImages.length, target: await target.projectImage.count(), ok: true });
  report.push({ model: 'apartmentImage', source: apartmentImages.length, target: await target.apartmentImage.count(), ok: true });
  report.push({ model: 'projectAmenity', source: amenities.length, target: await target.projectAmenity.count(), ok: true });

  // ── 6. Lead + LeadNote ─────────────────────────────────────────────────
  const leads = await source.lead.findMany();
  const leadNotes = await source.leadNote.findMany();
  if ((await target.lead.count()) === 0) {
    console.log(`[lead] migrating ${leads.length} rows…`);
    await target.$transaction(leads.map((l) => target.lead.create({ data: l })));
  }
  if ((await target.leadNote.count()) === 0) {
    console.log(`[leadNote] migrating ${leadNotes.length} rows…`);
    await target.$transaction(leadNotes.map((n) => target.leadNote.create({ data: n })));
  }
  report.push({ model: 'lead', source: leads.length, target: await target.lead.count(), ok: true });
  report.push({ model: 'leadNote', source: leadNotes.length, target: await target.leadNote.count(), ok: true });

  // ── 7. AdminUser ───────────────────────────────────────────────────────
  const adminUsers = await source.adminUser.findMany();
  if ((await target.adminUser.count()) === 0) {
    console.log(`[adminUser] migrating ${adminUsers.length} rows…`);
    await target.$transaction(adminUsers.map((u) => target.adminUser.create({ data: u })));
  }
  report.push({ model: 'adminUser', source: adminUsers.length, target: await target.adminUser.count(), ok: true });

  // ── 8. AuditLog (JSON before/after) ────────────────────────────────────
  const auditLogs = await source.auditLog.findMany();
  if ((await target.auditLog.count()) === 0) {
    console.log(`[auditLog] migrating ${auditLogs.length} rows…`);
    await target.$transaction(
      auditLogs.map((a) => target.auditLog.create({
        data: {
          ...a,
          before: a.before ? safeParse(a.before, null) as any : null,
          after: a.after ? safeParse(a.after, null) as any : null,
        },
      })),
    );
  }
  report.push({ model: 'auditLog', source: auditLogs.length, target: await target.auditLog.count(), ok: true });

  // ── 9. SiteContent, NewsletterSubscription, Video ──────────────────────
  const siteContent = await source.siteContent.findMany();
  const newsletter = await source.newsletterSubscription.findMany();
  const videos = await source.video.findMany();
  if ((await target.siteContent.count()) === 0) {
    console.log(`[siteContent] migrating ${siteContent.length} rows…`);
    await target.$transaction(siteContent.map((s) => target.siteContent.create({ data: s })));
  }
  if ((await target.newsletterSubscription.count()) === 0) {
    console.log(`[newsletter] migrating ${newsletter.length} rows…`);
    await target.$transaction(newsletter.map((n) => target.newsletterSubscription.create({ data: n })));
  }
  if ((await target.video.count()) === 0) {
    console.log(`[video] migrating ${videos.length} rows…`);
    await target.$transaction(videos.map((v) => target.video.create({ data: v })));
  }
  report.push({ model: 'siteContent', source: siteContent.length, target: await target.siteContent.count(), ok: true });
  report.push({ model: 'newsletter', source: newsletter.length, target: await target.newsletterSubscription.count(), ok: true });
  report.push({ model: 'video', source: videos.length, target: await target.video.count(), ok: true });

  // ── Final report ───────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log('Migration report:');
  console.log('─'.repeat(60));
  console.table(report);
  const mismatches = report.filter((r) => r.source !== r.target);
  if (mismatches.length > 0) {
    console.error(`[migrate] FAILED — ${mismatches.length} model(s) have row count mismatches:`);
    for (const m of mismatches) console.error(`  - ${m.model}: source=${m.source} target=${m.target}`);
    process.exit(1);
  }
  console.log('✓ Migration OK — all row counts match.');
  console.log('─'.repeat(60));
  console.log('Next steps:');
  console.log('  1. Verify in Supabase Studio that all rows are present.');
  console.log('  2. Run the production build against the new DATABASE_URL.');
  console.log('  3. After verifying, you can decommission the SQLite dev DB.');

  await source.$disconnect();
  await target.$disconnect();
}

migrate().catch(async (err) => {
  console.error('[migrate] FATAL:', err);
  await source.$disconnect();
  await target.$disconnect();
  process.exit(1);
});
