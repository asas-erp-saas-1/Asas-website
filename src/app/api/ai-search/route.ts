import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';

/* ─── Rate Limiter (5 requests per minute per IP) ─── */
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Evict expired entries periodically
  if (rateLimiter.size > 500) {
    for (const [key, val] of rateLimiter) {
      if (val.resetAt <= now) rateLimiter.delete(key);
    }
  }
  const entry = rateLimiter.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

/* ─── Zod schema for LLM response validation ─── */
const searchFiltersSchema = z.object({
  apartmentType: z.array(z.string()).nullable().optional(),
  district: z.array(z.string()).nullable().optional(),
  minBedrooms: z.number().int().min(0).max(10).nullable().optional(),
  maxPrice: z.number().min(0).nullable().optional(),
  minSurface: z.number().min(0).nullable().optional(),
  parking: z.boolean().nullable().optional(),
  balcony: z.boolean().nullable().optional(),
  explanation: z.string().optional(),
});

interface SearchFilters {
  apartmentType?: string[] | null;
  district?: string[] | null;
  minBedrooms?: number | null;
  maxPrice?: number | null;
  minSurface?: number | null;
  parking?: boolean | null;
  balcony?: boolean | null;
  explanation?: string;
}

/**
 * Normalize common French variants of districts to the canonical
 * spelling used in the database.
 */
function normalizeDistrict(value: string): string {
  const v = value.trim().toLowerCase();
  const map: Record<string, string> = {
    'cheraga': 'Chéraga',
    'chéraga': 'Chéraga',
    'dar el beida': 'Dar El Beïda',
    'dar-el-beida': 'Dar El Beïda',
    'dar el beïda': 'Dar El Beïda',
    'bordj el bahri': 'Bordj El Bahri',
    'hussein dey': 'Hussein Dey',
    'bordj el kiffan': 'Bordj El Kiffan',
    'bordj el kifan': 'Bordj El Kiffan',
    'bab el oued': 'Bab El Oued',
    'el biar': 'El Biar',
    'bir mourad rais': 'Bir Mourad Raïs',
    'bir mourad raïs': 'Bir Mourad Raïs',
    'draria': 'Draria',
    'birkhadem': 'Birkhadem',
    'mohammadia': 'Mohammadia',
    'oued smar': 'Oued Smar',
    'reghaia': 'Reghaia',
    'réghaia': 'Reghaia',
    'rouiba': 'Rouiba',
    'ain taya': 'Ain Taya',
    'aïn taya': 'Ain Taya',
    'el harrach': 'El Harrach',
    'kouba': 'Kouba',
    'bachdjerrah': 'Bachdjerrah',
  };
  return map[v] || value.trim();
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Trop de requêtes. Veuillez patienter avant de réessayer.' },
        { status: 429 }
      ));
    }

    const body = await req.json().catch(() => ({} as { query?: string }));
    const query = body?.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      ));
    }

    // Use z-ai-web-dev-sdk to parse the natural language query (server-side only)
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const systemPrompt = `Tu es un assistant qui aide à rechercher des appartements en Algérie.
Analyse la requête de l'utilisateur en français et extrais les critères de recherche.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire, sans markdown, sans backticks.

Format de réponse attendu:
{
  "apartmentType": ["F2"] | ["F3"] | ["F4"] | ["Duplex"] | ["F3","F4"] | null,
  "district": ["Chéraga"] | ["Dar El Beïda"] | ["Bordj El Bahri"] | ["Hussein Dey"] | null,
  "minBedrooms": number | null,
  "maxPrice": number | null,
  "minSurface": number | null,
  "parking": true | false | null,
  "balcony": true | false | null,
  "explanation": "Brève phrase en français qui résume ce que tu as compris"
}

Règles importantes:
- F2 = 1 chambre, F3 = 2 chambres, F4 = 3 chambres, Duplex = type séparé
- Prix en DZD: si l'utilisateur dit "millions" ou "M", multiplie par 1000000; "milliards" par 1000000000
- Si l'utilisateur dit "familial", "grand", "spacieux" -> privilégier ["F3","F4"]
- Si "parking" ou "garage" est mentionné -> parking = true
- Si "balcon", "terrasse" ou "loggia" est mentionné -> balcony = true
- Si l'utilisateur précise un nombre de chambres ("2 chambres") -> utiliser minBedrooms
- Ne JAMAIS deviner de valeurs non mentionnées, utiliser null
- Districts valides: Chéraga, Dar El Beïda, Bordj El Bahri, Hussein Dey, Bab El Oued, El Biar, Bordj El Kiffan, El Harrach
- Pour un district mentionné, renvoie toujours le tableau avec l'orthographe canonique exacte`;

    let filters: SearchFilters = {};

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.1,
        thinking: { type: 'disabled' },
      });

      const content = completion.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const rawParsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      const validated = searchFiltersSchema.safeParse(rawParsed);
      filters = validated.success ? validated.data : {};
    } catch (aiError) {
      console.error('[AI /ai-search] LLM parsing failed:', aiError);
      filters = {
        explanation:
          "Nous n'avons pas pu analyser votre demande avec l'IA. Voici tous les appartements disponibles.",
      };
    }

    let normalizedDistrict: string[] | null = null;
    if (Array.isArray(filters.district) && filters.district.length > 0) {
      normalizedDistrict = filters.district
        .map((d) => normalizeDistrict(String(d)))
        .filter(Boolean);
      if (normalizedDistrict.length === 0) normalizedDistrict = null;
    }

    const conditions: Record<string, unknown>[] = [];

    if (Array.isArray(filters.apartmentType) && filters.apartmentType.length > 0) {
      conditions.push({ apartmentType: { in: filters.apartmentType } });
    }
    if (typeof filters.minBedrooms === 'number' && !Number.isNaN(filters.minBedrooms)) {
      conditions.push({ bedrooms: { gte: filters.minBedrooms } });
    }
    if (typeof filters.maxPrice === 'number' && !Number.isNaN(filters.maxPrice)) {
      conditions.push({ price: { lte: filters.maxPrice } });
    }
    if (typeof filters.minSurface === 'number' && !Number.isNaN(filters.minSurface)) {
      conditions.push({ surface: { gte: filters.minSurface } });
    }
    if (filters.parking === true) {
      conditions.push({ hasParking: true });
    }
    if (filters.balcony === true) {
      conditions.push({ balconies: { gte: 1 } });
    }

    // Public AI search must only expose inventory that is both published and available.
    conditions.push({
      status: { in: ['AVAILABLE', 'RESERVED'] },
      published: true,
      archived: false,
      project: {
        published: true,
        archived: false,
        ...(normalizedDistrict && normalizedDistrict.length > 0
          ? { district: { in: normalizedDistrict } }
          : {}),
      },
    });

    const apartments = await db.apartment.findMany({
      where: {
        AND: conditions,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            district: true,
            city: true,
          },
        },
      },
      orderBy: { price: 'asc' },
      take: 20,
    });

    return withSecurityHeaders(NextResponse.json({
      filters: { ...filters, district: normalizedDistrict ?? filters.district },
      apartments,
      count: apartments.length,
      query,
    }));
  } catch (error) {
    console.error('[API /ai-search] Error:', error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Erreur lors de la recherche. Veuillez réessayer.' },
      { status: 500 }
    ));
  }
}