/**
 * Storage abstraction layer — env-driven.
 *
 * Behavior:
 *   • If SUPABASE_STORAGE_CONFIGURED (NEXT_PUBLIC_SUPABASE_URL +
 *     SUPABASE_SERVICE_ROLE_KEY both present) → use Supabase Storage.
 *   • Else if NODE_ENV !== 'production' → use local filesystem under
 *     /public/uploads (dev convenience).
 *   • Else (production + no Supabase) → throw a clear configuration error.
 *
 * Why this design:
 *   On Vercel serverless, the filesystem is read-only except `/tmp` (which
 *   is per-invocation and ephemeral). Dynamic media uploads MUST go to
 *   object storage (Supabase Storage). Static assets in /public are fine
 *   because they are bundled at build time.
 *
 * The `saveBlob`, `deleteBlob`, and `resolveLocalPath` functions are the
 * ONLY storage interface used by the API routes. Swapping the underlying
 * implementation is therefore a one-file change — no route handlers need
 * to know which driver is active.
 */

import { env, isSupabaseStorageConfigured } from '@/lib/env';
import fs from 'fs';
import path from 'path';

const UPLOADS_BUCKET = 'media';
const UPLOADS_PUBLIC_ROOT = '/uploads';

/**
 * Save a blob to storage. Returns the public URL that can be stored in the
 * DB and rendered to <img src="...">.
 *
 * @param bytes          Validated file bytes.
 * @param relativePath   Path relative to the uploads root, e.g.
 *                       'projects/slug/img-123.jpg'. Must not contain '..'.
 * @param contentType     MIME type (e.g. 'image/jpeg').
 */
export async function saveBlob(
  bytes: Uint8Array,
  relativePath: string,
  contentType: string = 'image/octet-stream',
): Promise<string> {
  if (relativePath.includes('..')) {
    throw new Error('Path traversal blocked by storage layer');
  }

  if (isSupabaseStorageConfigured()) {
    return saveBlobSupabase(bytes, relativePath, contentType);
  }

  // Dev-only local filesystem fallback.
  if (env.isProduction) {
    throw new Error(
      '[storage] Production deployment requires Supabase Storage. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
      'in your Vercel environment. See .env.example.',
    );
  }

  return saveBlobLocal(bytes, relativePath);
}

/**
 * Delete a blob by its public URL. Best-effort (never throws — the DB row
 * is the source of truth).
 */
export async function deleteBlob(publicUrl: string): Promise<boolean> {
  try {
    if (isSupabaseStorageConfigured()) {
      return await deleteBlobSupabase(publicUrl);
    }
    if (env.isProduction) {
      // No-op in production without Supabase (shouldn't happen — saveBlob
      // would have thrown first).
      return false;
    }
    return deleteBlobLocal(publicUrl);
  } catch (err) {
    console.error('[storage] deleteBlob failed (best-effort):', err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Resolve a public URL to a local filesystem path. Returns null if the URL
 * is outside the uploads jail OR if we're on Supabase Storage (the file
 * is not on the local filesystem in that case).
 */
export function resolveLocalPath(publicUrl: string): string | null {
  if (isSupabaseStorageConfigured()) return null;
  if (!publicUrl.startsWith(UPLOADS_PUBLIC_ROOT + '/')) return null;
  const publicDir = path.join(process.cwd(), 'public');
  const target = path.join(publicDir, publicUrl);
  const resolved = path.resolve(target);
  const resolvedRoot = path.resolve(publicDir, UPLOADS_PUBLIC_ROOT);
  if (!resolved.startsWith(resolvedRoot + path.sep)) return null;
  return resolved;
}

// ─── Supabase Storage driver ─────────────────────────────────────────
//
// Lazy-imported so that the @supabase/supabase-js client is only loaded
// when Supabase is actually configured. This keeps the dev bundle small
// (no Supabase client in the browser, no Supabase init in dev API routes).

let _supabaseClient: any = null;
async function getSupabaseAdmin() {
  if (_supabaseClient) return _supabaseClient;
  const { createClient } = await import('@supabase/supabase-js');
  _supabaseClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return _supabaseClient;
}

function toStoragePath(publicUrl: string): string {
  // Strip the leading '/uploads/' prefix — the bucket holds files at the
  // path AFTER the bucket name. Also handle full Supabase URLs gracefully.
  if (publicUrl.startsWith('/uploads/')) return publicUrl.replace(/^\/uploads\//, '');
  // If it's a full Supabase URL, extract the path after /object/public/media/.
  const match = publicUrl.match(/\/object\/public\/media\/(.+)$/);
  if (match) return match[1];
  return '';
}

async function saveBlobSupabase(
  bytes: Uint8Array,
  relativePath: string,
  contentType: string,
): Promise<string> {
  const supabase = await getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .upload(relativePath, bytes, { contentType, upsert: true });
  if (error) {
    throw new Error(`[storage] Supabase upload failed: ${error.message}`);
  }
  const { data } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(relativePath);
  return data.publicUrl;
}

async function deleteBlobSupabase(publicUrl: string): Promise<boolean> {
  const supabase = await getSupabaseAdmin();
  const storagePath = toStoragePath(publicUrl);
  if (!storagePath || storagePath === publicUrl) return false;
  const { error } = await supabase.storage.from(UPLOADS_BUCKET).remove([storagePath]);
  return !error;
}

// ─── Local filesystem driver (dev only) ──────────────────────────────

function saveBlobLocal(bytes: Uint8Array, relativePath: string): string {
  const publicDir = path.join(process.cwd(), 'public');
  const uploadsDir = path.join(publicDir, UPLOADS_PUBLIC_ROOT);
  const target = path.join(uploadsDir, relativePath);
  const resolved = path.resolve(target);
  const resolvedRoot = path.resolve(uploadsDir);
  if (!resolved.startsWith(resolvedRoot + path.sep) && resolved !== resolvedRoot) {
    throw new Error('Path traversal blocked by storage layer');
  }
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, bytes);
  return `${UPLOADS_PUBLIC_ROOT}/${relativePath}`;
}

function deleteBlobLocal(publicUrl: string): boolean {
  if (!publicUrl.startsWith(UPLOADS_PUBLIC_ROOT + '/')) return false;
  const publicDir = path.join(process.cwd(), 'public');
  const target = path.join(publicDir, publicUrl);
  const resolved = path.resolve(target);
  const resolvedRoot = path.resolve(publicDir, UPLOADS_PUBLIC_ROOT);
  if (!resolved.startsWith(resolvedRoot + path.sep)) return false;
  try {
    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
      return true;
    }
  } catch {
    /* best-effort */
  }
  return false;
}

/**
 * Whether the storage layer is operating against a local filesystem.
 * (Useful for conditional behaviour in routes, e.g. streaming vs redirect.)
 */
export const isLocalStorage = !isSupabaseStorageConfigured() && !env.isProduction;
