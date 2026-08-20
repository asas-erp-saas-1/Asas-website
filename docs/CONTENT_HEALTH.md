# CONTENT HEALTH — ASAS Real Estate CMS

> How the system surfaces missing data and helps admins complete content before publishing.

## 1. Content Completeness Scoring

Per directive §12, every project and apartment receives a completion score computed from a set of checks.

### Project Completeness (7 checks)
| # | Check | Description |
|---|---|---|
| 1 | Nom | Project name is present |
| 2 | Localisation | District + city are present |
| 3 | Statut | Status is set (AVAILABLE / COMING_SOON / SOLD_OUT / DRAFT) |
| 4 | Appartements | At least 1 apartment exists in the project (apartmentCount > 0) |
| 5 | Prix de départ | startingPrice is set OR priceOnRequest=true |
| 6 | Image hero | At least 1 hero image exists |
| 7 | Publié | published=true |

Score = (passed / 7) × 100, rounded.

### Apartment Completeness (9 checks)
| # | Check | Description |
|---|---|---|
| 1 | Type | apartmentType is set (F2/F3/F4/F5/Duplex/Studio/Villa) |
| 2 | Nom du type | typeName is set (e.g., "F3 Familial") |
| 3 | Surface | surface > 0 |
| 4 | Étage | floor is not null |
| 5 | Chambres | bedrooms > 0 |
| 6 | Prix | price is set OR priceOnRequest=true |
| 7 | Orientation | orientation is set (Nord/Sud/Est/Ouest/...) |
| 8 | Image hero | heroImage is present |
| 9 | Publié | published=true |

Score = (passed / 9) × 100, rounded.

## 2. Dashboard "Needs Attention" Cards

The admin dashboard (CATALOGUE > Dashboard) shows 2 amber cards when items have completion < 100%:

### "Projets nécessitant attention"
- Shows up to 5 projects with score < 100%
- For each project:
  - Project name
  - Location (district, city)
  - List of missing fields (e.g., "Manquant: Image hero, Description SEO")
  - Completion score (color-coded: green ≥80%, amber 50-79%, red <50%)
- "Voir tout →" link to navigate to full project list

### "Appartements nécessitant attention"
- Shows up to 5 apartments with score < 100%
- For each apartment:
  - Type name (e.g., "F3 Familial")
  - Project name + surface
  - List of missing fields
  - Completion score (color-coded)
- "Voir tout →" link to navigate to full apartment list

## 3. Pre-publish Validation Checklist (in Edit Dialog)

The Publication tab in both edit forms shows a real-time validation checklist:
- ✓ (green) = field is filled
- ⚠ (amber) = field is recommended but empty
- ✕ (red) = required field is empty

The system shows:
- "⚠ Des champs requis manquent. La publication est déconseillée." if any required field is missing
- "✓ Prêt pour publication." if all required fields are present

The system does NOT block publishing when fields are missing — it warns. This respects directive §12: "Do not block publishing unnecessarily. Instead classify: REQUIRED / RECOMMENDED / OPTIONAL."

## 4. Audit Log Traceability

Every mutation is logged in the AuditLog table (24 action types tracked). The dashboard provides:
- Audit tab (SYSTÈME > Journal d'audit) with filter by action + limit dropdown
- Table with Action / Acteur / Entité / Avant / Après / Date columns
- Special action `PRICE_CHANGE` when price field changes (with before/after diff)

## 5. Implementation Details

The completeness functions are in the `DashboardTab` component (`src/components/pages/AdminPage.tsx`):

```typescript
function projectCompleteness(p: AdminProject): { score: number; missing: string[] } {
  const checks = [
    { label: 'Nom', ok: !!p.name },
    { label: 'Localisation', ok: !!p.district && !!p.city },
    // ... 5 more checks
  ];
  const passed = checks.filter(c => c.ok).length;
  const missing = checks.filter(c => !c.ok).map(c => c.label);
  return { score: Math.round((passed / checks.length) * 100), missing };
}
```

The "needs attention" cards use `useMemo` to filter + sort by score:

```typescript
const projectsNeedingAttention = useMemo(() => {
  return projects
    .map(p => ({ project: p, ...projectCompleteness(p) }))
    .filter(item => item.score < 100 || item.missing.length > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
}, [projects]);
```

## 6. Color-coded Scores

| Score Range | Color | Meaning |
|---|---|---|
| ≥ 80% | Green (`text-emerald-600`) | Mostly complete, ready for publish |
| 50-79% | Amber (`text-amber-600`) | Needs work before publish |
| < 50% | Red (`text-red-600`) | Major fields missing, do not publish |

## 7. Content Health Dashboard Section (future work)

Per directive §12 example:
```
Projects        92% complete
Apartments      87% complete
SEO             76% complete
Media           94% complete

Missing hero images       3
Missing floor plans       7
Missing prices            4
Draft content             8
```

The current implementation shows per-item scores (in the "needs attention" cards). A future version could aggregate these into the dashboard header as 4 overall percentages + count of missing items.

## 8. How to Use

### As an admin
1. Open the Dashboard (CATALOGUE > Dashboard)
2. Scroll to "Projets nécessitant attention" + "Appartements nécessitant attention" cards
3. Click the project/apartment name or "Voir tout →" to navigate to the list
4. Click "Modifier" to open the edit dialog
5. Fill the missing fields (listed in the card)
6. Save
7. The item disappears from the "needs attention" card

### Before publishing
1. Open the entity edit dialog
2. Go to **Publication** tab
3. Review the checklist at the top
4. If any ✕ (red) items appear, fix them in the corresponding tab
5. Toggle the "Publié" switch to publish
