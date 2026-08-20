# Security Posture — ASAS Real Estate Platform

This document supersedes all prior `docs/SECURITY*.md` files. It reflects the Phase 2
state of the code (DB-backed sessions, Supabase Storage abstraction, honeypot-protected
lead capture, structured logger with PII redaction, committed migrations).

Cross-references:
- [`ENVIRONMENT.md`](ENVIRONMENT.md) — full env var reference + validation behavior.
- [`DATABASE.md`](DATABASE.md) — schema, indexes, AdminSession table.
- [`PRODUCTION_RUNBOOK.md`](PRODUCTION_RUNBOOK.md) — incident playbook.

---

## 1. Authentication

### 1.1 Password storage
- Algorithm: **bcrypt** (cost factor 10). Hashed at seed time in `prisma/seed.ts`
  via `bcrypt.hash(password, 10)` (bcryptjs, pure-JS — runtime-agnostic on Vercel
  serverless).
- Verified at login in `src/lib/admin-auth.ts:209` via `bcrypt.compare()`.
- Plaintext passwords are NEVER stored, NEVER logged, NEVER returned by any API.
- The legacy hardcoded `ADMIN_PASSWORD || 'asas2024'` fallback is **removed** —
  auth goes through the DB exclusively.

### 1.2 Session management (DB-backed)
- Token format: UUID v4 via `crypto.randomUUID()`.
- Storage: `AdminSession` table (see [`DATABASE.md`](DATABASE.md) §3). Selected by
  `ADMIN_SESSION_DRIVER` env var → defaults to `db` in production, `memory` in dev.
- TTL: 8 hours (`ADMIN_SESSION_TTL=28800000`).
- Pruning: opportunistic `db.adminSession.deleteMany({ where: { expiresAt: { lt: now } } })`
  on every `verifyAdminAuth` call. Failures are swallowed (best-effort).
- Revocation: `revokeAdminSession(token)` sets `revokedAt = now`; the verifier returns
  null for any revoked row. Used by `/api/admin/logout`.
- Cookie attributes (`src/app/api/admin/login/route.ts`):
  - `httpOnly: true` — not readable by JavaScript (XSS mitigation).
  - `secure: true` in production (HTTPS only).
  - `sameSite: 'lax'` — CSRF mitigation for top-level navigation.
  - `path: '/'`, `maxAge: 8h`.
- Multi-instance safe: any Vercel lambda can verify any session because the table is
  shared. P2-A's critical blocker (in-memory Map) is RESOLVED.

### 1.3 Login hardening (`src/app/api/admin/login/route.ts`)
- Returns 401 with the same error message whether the email exists or not (no
  enumeration).
- 200ms artificial delay on every failed attempt (slows brute-force).
- Rate limit: **5 attempts per IP per minute**, **10 failed attempts → 15-min lockout**
  (`LOCKOUT_DURATION_MS = 15 * 60 * 1000`). Returns 429 with `Retry-After`.
- Every login outcome (success, failure, lockout) is recorded in `AuditLog`.

### 1.4 Bootstrap password
- The first seed reads `ADMIN_BOOTSTRAP_PASSWORD` once. If unset, a 24-char random
  password is generated, the admin user is created with it (bcrypt-hashed), and the
  plaintext is printed to stdout exactly once.
- See [`ENVIRONMENT.md`](ENVIRONMENT.md) §AUTH.

---

## 2. Authorization (RBAC)

### 2.1 Roles
- **ADMIN** — full CRUD on projects, apartments, media, videos, leads, users, settings.
- **EDITOR** — create/edit projects, apartments, media, videos; cannot delete or
  manage users.
- **VIEWER** — read-only access to all admin data.

### 2.2 Server-side enforcement
Every `/api/admin/*` route calls `verifyAdminAuth(request)` first; mutations additionally
call `sessionHasRole(session, ['ADMIN','EDITOR'])` or `['ADMIN']` as appropriate. Routes
verified as enforcing RBAC + audit log:

| Route                                       | RBAC check                | Audit log |
| ------------------------------------------- | ------------------------- | --------- |
| `POST /api/admin/media/upload`              | `['ADMIN','EDITOR']`       | ✓         |
| `PATCH/DELETE /api/admin/media/[id]`        | `['ADMIN','EDITOR']`       | ✓         |
| `POST /api/admin/media/[id]/replace`        | `['ADMIN','EDITOR']`       | ✓         |
| `POST/PATCH/DELETE /api/admin/videos/[id]`  | `['ADMIN','EDITOR']`       | ✓         |
| `POST/PATCH /api/admin/buildings`            | `['ADMIN','EDITOR']`       | ✓         |
| `PUT /api/admin/apartments/[slug]/status`   | `['ADMIN','EDITOR']`       | ✓         |
| `POST/PATCH /api/admin/apartments`           | `['ADMIN','EDITOR']`       | ✓         |
| `POST/PATCH /api/admin/projects`             | `['ADMIN','EDITOR']`       | ✓         |
| `POST/PATCH /api/admin/users/[id]`           | `['ADMIN']`                | ✓         |
| `PATCH /api/admin/leads/[id]/status`         | `['ADMIN','EDITOR']`       | ✓         |
| `POST /api/admin/leads/[id]/notes`           | `['ADMIN','EDITOR']`       | ✓         |

VIEWER attempting a mutation receives 403 `Privilèges insuffisants`. Every 403 is also
logged to `AuditLog` for forensics.

---

## 3. Rate limiting (per-endpoint, per-IP, in-memory Map)

| Endpoint                         | Limit          | Lockout?             | File                                              |
| -------------------------------- | -------------- | -------------------- | ------------------------------------------------- |
| `POST /api/admin/login`          | 5 / min / IP   | 10 fails → 15 min    | `src/app/api/admin/login/route.ts`                |
| `POST /api/leads`                | 10 / min / IP  | —                    | `src/app/api/leads/route.ts`                       |
| `POST /api/newsletter/subscribe` | 5 / min / IP   | —                    | `src/app/api/newsletter/subscribe/route.ts`      |
| `POST /api/ai-search`            | 5 / min / IP   | —                    | `src/app/api/ai-search/route.ts`                  |

Excess returns 429 with a localized error message. Honeypot hits and rate-limit hits
are logged via `logger.warn` for observability.

> **Multi-instance caveat (HIGH):** all four limiters are in-process `Map`s. On Vercel
> multi-instance serverless the *effective* limit is `declared × N` where N is the
> concurrent lambda count. This weakens brute-force protection on `/admin/login`.
> **Fix:** wire Upstash Redis REST (`@upstash/ratelimit`) — single library, ~30 lines
> per route. See §10 below.

---

## 4. Honeypot (anti-bot)

Both public-facing forms include a hidden `website` field rendered off-screen via CSS.
Real users never see it; bots that auto-fill all form fields submit a non-empty value.

- `POST /api/leads` → if `website` is non-empty, log a `logger.warn` and return a
  **fake 201 success** so the bot doesn't retry with a different payload.
- `POST /api/newsletter/subscribe` → same pattern (fake 201, `console.warn` log).

Schema: both Zod schemas accept an optional `website: z.string().optional()`.

No reCAPTCHA / Turnstile is wired — honeypot is the sole anti-bot mechanism, paired
with the per-IP rate limit. This is intentional: no third-party script, no PII leak to
Google, no UX friction for real users. For higher assurance on high-traffic sites,
add Cloudflare Turnstile (free) on the lead form.

---

## 5. Duplicate detection (leads)

`src/app/api/leads/route.ts:121` — before insert, runs:
```ts
db.lead.findFirst({
  where: { phone: validated.phone, createdAt: { gte: new Date(now - 5*60*1000) } },
  orderBy: { createdAt: 'desc' },
})
```
If a match exists, returns `200 { success: true, id: existing, duplicate: true }`
(idempotent — client retries don't create duplicate rows). Window: **5 minutes**.

Phone is normalized client-side (`/[\s.-]/g` removed) before submission; server
re-applies the Algerian phone regex `/^(\+213|0)[5-7]\d{8}$/` server-side
(`src/app/api/leads/route.ts:50`) — parity with the client, no trust.

---

## 6. Upload validation chain (`src/app/api/admin/media/upload/route.ts`)

Eight-layer defense in depth:

1. **Auth** — `verifyAdminAuth(request)` → 401 if no valid session.
2. **RBAC** — `sessionHasRole(session, ['ADMIN','EDITOR'])` → 403 if VIEWER.
3. **MIME allowlist** — declared `file.type` must be in `{jpeg, png, webp, avif, gif}`.
   SVG is intentionally excluded (XSS risk via inline scripts). 415 otherwise.
4. **Size cap** — `file.size <= 8 MB`. 413 otherwise.
5. **Magic bytes** — `verifyMagicBytes(bytes, declaredMime)` reads the first 12 bytes
   and confirms they match the file's declared MIME. Mismatch = 415. (Prevents a
   `.exe` renamed to `.jpg` from passing step 3.)
6. **Entity existence** — `db.project.findUnique` / `db.apartment.findUnique` for the
   target `entityId`. 404 if missing.
7. **Storage write** — `saveBlob(bytes, relativePath, mime)` via `src/lib/storage.ts`.
   In production without Supabase, throws → 503. Path traversal blocked: relative
   path may not contain `..`, and the resolved path must be inside the uploads jail.
8. **Audit** — `logAudit({ action: 'UPLOAD_MEDIA', ... })` records the upload.

---

## 7. Audit log

`AuditLog` table (see [`DATABASE.md`](DATABASE.md) §3). 24 action types per the
schema comment in `prisma/schema.prisma:436-441`:

```
LOGIN, LOGOUT, LOGIN_FAILED,
CREATE_PROJECT, UPDATE_PROJECT, ARCHIVE_PROJECT,
CREATE_APARTMENT, UPDATE_APARTMENT, ARCHIVE_APARTMENT, UPDATE_APARTMENT_STATUS,
CREATE_BUILDING,
UPLOAD_MEDIA, DELETE_MEDIA, UPDATE_MEDIA,
CREATE_VIDEO, UPDATE_VIDEO, DELETE_VIDEO,
UPDATE_LEAD_STATUS, CREATE_LEAD_NOTE,
CREATE_USER, UPDATE_USER, DEACTIVATE_USER,
PRICE_CHANGE
```

Each row records: `actorEmail`, `actorRole`, `action`, `entityType`, `entityId`,
`entitySlug`, `before` (JSON, capped at 8KB), `after` (JSON), `ipAddress`, `userAgent`,
`createdAt`. The `logAudit()` helper in `src/lib/audit.ts` is **best-effort** — failures
are caught + logged, never block the mutation.

Indexes: `(actorEmail)`, `(action)`, `(entityType, entityId)` composite, `(createdAt)`.

Forensic query examples:
```ts
db.auditLog.findMany({ where: { actorEmail: 'x@y' }, orderBy: { createdAt: 'desc' }});
db.auditLog.findMany({ where: { entityType: 'Apartment', entityId: '<cuid>' }});
db.auditLog.findMany({ where: { action: 'UPDATE_APARTMENT_STATUS' }, take: 50, orderBy: { createdAt: 'desc' }});
```

---

## 8. Security headers (`next.config.ts:26-39` + `src/lib/with-security-headers.ts`)

Every response from `next.config.ts` `headers()`:

| Header                     | Value                                                       |
| -------------------------- | ----------------------------------------------------------- |
| `X-Frame-Options`          | `DENY`                                                      |
| `X-Content-Type-Options`   | `nosniff`                                                   |
| `Referrer-Policy`          | `strict-origin-when-cross-origin`                            |
| `Permissions-Policy`       | `camera=(), microphone=(), geolocation=(self)`              |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (2-yr HSTS)  |

Per-response HOF in `src/lib/with-security-headers.ts`:
- `withSecurityHeaders(res)` — admin / mutation routes: adds `nosniff` + `Cache-Control: no-store`.
- `withPublicCache(res, maxAge=60, swr=300)` — public read endpoints: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. Used on `/api/projects`, `/api/apartments`, `/api/stats`, `/api/videos` so availability changes (admin flips apartment to SOLD) propagate within ~60s without making every read uncached.

`poweredByHeader: false` in `next.config.ts` suppresses the `X-Powered-By: Next.js` header.

---

## 9. Cookie hygiene + PII redaction

- Cookie: `admin-session`, `httpOnly + secure(prod) + sameSite=lax + path=/ + maxAge=8h`.
  Set only by `/api/admin/login`; cleared by `/api/admin/logout`.
- Structured logger (`src/lib/logger.ts`):
  - Production output: NDJSON (`{ts, level, message, ctx}`) — Vercel log-drain friendly.
  - Dev output: color-coded single line.
  - `SENSITIVE_KEYS = {password, passwordHash, token, sessionToken, cookie, cookies, authorization, apiKey, apiSecret, serviceRoleKey, service_role, secret, privateKey, databaseUrl, DATABASE_URL}` → all redacted to `[REDACTED]`.
  - `phone` and `email` fields → first 4 chars + `••••` (enough to debug, not enough to PII-leak).
  - `withLogging(label, handler)` HOF wraps routes; uncaught errors → `logger.error` + re-throw.
- Env validation (`src/lib/env.ts`): in production, missing required vars throw at
  cold start with a message naming the var and pointing to `.env.example`. No silent
  fallbacks. Public vars (`NEXT_PUBLIC_*`) are validated too.

---

## 10. Remaining risks (honest)

### 10.1 Per-instance rate limiters (HIGH on multi-instance)
All four rate limiters are module-scope `new Map()`. On Vercel multi-instance serverless,
the effective limit is `declared × N`. The login brute-force lockout (15 min) is
weakened — an attacker hitting the deployed endpoint may end up round-robining across
lambdas and never trigger the per-IP lockout counter on any single instance.

**Fix:** add `@upstash/ratelimit` + `@upstash/redis` (REST, edge-friendly) and replace
each in-process Map with a single `Ratelimiter.slidingWindow(limit, window)`. Effort:
~30 lines per route × 4 routes = ~120 lines total + 2 deps. No schema change.

Until that lands, the operational mitigation is: keep the project in a single Vercel
region (`vercel.json: regions: ["cdg1"]`) so concurrent instances are bounded; the
login lockout still triggers within ~N×5 attempts at worst, and the 200ms delay per
failed attempt still slows brute-force.

### 10.2 No CAPTCHA on lead form (LOW)
Honeypot + Algerian phone regex + rate limit + duplicate detection together block most
script-kiddie bots. A determined adversary with headless Chrome + a real phone SIM can
still get through. Acceptable for a real-estate lead form (low fraud value per lead).
Revisit if spam rate exceeds 5% of inbound leads.

### 10.3 No notification layer on lead submission (OPERATIONAL, not security)
Per Phase 2 directive §26, lead persistence is decoupled from notification. The
`db.lead.create` succeeds regardless of any downstream email/Slack/webhook failure.
Trade-off: the sales team is not auto-notified. Recommended: add a fire-and-forget
Slack webhook AFTER `db.lead.create` succeeds, wrapped in `try/catch` so a flaky
Slack never blocks persistence.

### 10.4 No `src/middleware.ts` (LOW)
No Next.js middleware exists; rate limiting + auth are per-route HOFs. This is
structurally fine, but means a `requestId` correlation ID is not propagated
automatically across routes. The `withLogging` HOF generates an ad-hoc label per
route; cross-route correlation relies on Vercel's `x-vercel-id` header.

### 10.5 Single Vercel region (LOW)
`vercel.json: regions: ["cdg1"]` (Paris). North-Africa/EU traffic gets low latency;
other regions pay cold-start. Acceptable for the target market (Algeria + France).

### 10.6 HSTS preload (LOW)
HSTS is set with `preload`. Submission to the HSTS preload list
(https://hstspreload.org) is an external manual step — not yet done. Do it once
the production domain is finalized and stable.

---

## 11. Verification commands

```bash
# Lint + types + build (CI gate)
bun run lint && bun run typecheck && bun run build

# Grep for secret leakage to client bundle
rg "NEXT_PUBLIC_.*(SECRET|PASSWORD|SERVICE_ROLE|PRIVATE)" src/   # must return nothing

# Grep for any forbidden fs write outside the storage abstraction
rg "fs\.write|fs\.mkdir" src/   # only src/lib/storage.ts should match

# Confirm only one Prisma client instantiation
rg "new PrismaClient" src/      # only src/lib/db.ts should match
```
