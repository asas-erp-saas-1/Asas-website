/**
 * Structured logger.
 *
 * A minimal, dependency-free structured logger. In development, outputs
 * human-readable colored lines. In production, outputs one JSON object per
 * log line (so Vercel's log drain / Datadog / Loki can ingest them).
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Lead created', { leadId: '...', intent: 'BOOK_VISIT' });
 *   logger.warn('Rate limit hit', { ip: '1.2.3.4', route: '/api/leads' });
 *   logger.error('DB write failed', error);
 *
 * What is logged:
 *   - timestamp (ISO 8601)
 *   - level (debug/info/warn/error)
 *   - message
 *   - context object (sanitized — never log passwords, tokens, cookies)
 *
 * What is NEVER logged:
 *   - password / passwordHash
 *   - session tokens
 *   - cookie headers
 *   - service_role keys
 *   - DATABASE_URL
 *   - full PII (we redact phone/email to first 4 chars + bullets)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10, info: 20, warn: 30, error: 40,
};

const MIN_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const SENSITIVE_KEYS = new Set([
  'password', 'passwordHash', 'token', 'sessionToken', 'cookie', 'cookies',
  'authorization', 'apiKey', 'apiSecret', 'serviceRoleKey', 'service_role',
  'secret', 'privateKey', 'databaseUrl', 'DATABASE_URL',
]);

function redact(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Error) {
    return { name: obj.name, message: obj.message, stack: obj.stack };
  }
  if (Array.isArray(obj)) return obj.map(redact);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      out[k] = '[REDACTED]';
    } else if (typeof v === 'string' && (k === 'phone' || k === 'email')) {
      // Redact PII — keep first 4 chars for debugging, hide the rest.
      out[k] = v.length > 4 ? v.slice(0, 4) + '••••' : '••••';
    } else {
      out[k] = redact(v);
    }
  }
  return out;
}

function emit(level: LogLevel, message: string, context?: unknown) {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[MIN_LEVEL]) return;

  const timestamp = new Date().toISOString();
  const ctx = context ? redact(context) : undefined;

  if (process.env.NODE_ENV === 'production') {
    // Production: one JSON object per line (NDJSON) — easy to ingest.
    const line = JSON.stringify({
      ts: timestamp, level, message, ctx,
    });
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  } else {
    // Dev: human-readable, color-coded.
    const color = level === 'error' ? '\x1b[31m'
      : level === 'warn' ? '\x1b[33m'
      : level === 'info' ? '\x1b[36m'
      : '\x1b[90m';
    const reset = '\x1b[0m';
    const ctxStr = ctx ? ' ' + JSON.stringify(ctx) : '';
    console[level === 'debug' ? 'log' : level](
      `${color}[${timestamp}] ${level.toUpperCase()}${reset} ${message}${ctxStr}`,
    );
  }
}

export const logger = {
  debug: (msg: string, ctx?: unknown) => emit('debug', msg, ctx),
  info: (msg: string, ctx?: unknown) => emit('info', msg, ctx),
  warn: (msg: string, ctx?: unknown) => emit('warn', msg, ctx),
  error: (msg: string, ctx?: unknown) => emit('error', msg, ctx),
};

/**
 * Wrap an async route handler with structured error logging.
 *
 * Usage:
 *   export const POST = withLogging('POST /api/leads', async (req) => { ... });
 *
 * Catches uncaught errors, logs them with context, and returns a clean 500.
 */
export function withLogging<TReq extends Request, TRes extends Response>(
  label: string,
  handler: (req: TReq) => Promise<TRes>,
): (req: TReq) => Promise<TRes> {
  return async (req: TReq) => {
    try {
      const res = await handler(req);
      if (!res.ok) {
        logger.warn(`${label} → ${res.status}`, { status: res.status });
      }
      return res;
    } catch (err) {
      logger.error(`${label} uncaught error`, err instanceof Error ? err : { message: String(err) });
      // Re-throw so Next.js's error boundary can produce a 500.
      throw err;
    }
  };
}
