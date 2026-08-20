# CONTENT_VALIDATION.md — ASAS Real Estate CMS

> **Phase 2 Blueprint — 3-Level Validation Engine**
> Defines validation at FIELD, ENTITY, and PUBLICATION levels.

## 1. Validation Levels

```
FIELD VALIDATION      (per-input)
  ↓
ENTITY VALIDATION    (cross-field within an entity)
  ↓
PUBLICATION VALIDATION (pre-publish gate)
```

## 2. Field-Level Validation

Validates individual field values before save.

### Project Fields

| Field | Validation | Error Message (FR) |
|---|---|---|
| name | non-empty, 1-200 chars | "Le nom du projet est requis" |
| slug | kebab-case, unique | "Le slug doit être unique et au format kebab-case" |
| city | non-empty | "La ville est requise" |
| district | non-empty | "Le quartier est requis" |
| projectType | enum: RESIDENTIAL, MIXED_USE, COMMERCIAL | "Type de projet invalide" |
| status | enum: AVAILABLE, COMING_SOON, SOLD_OUT, DRAFT | "Statut invalide" |
| startingPrice | Int > 0 OR null | "Le prix doit être un nombre positif" |
| deliveryYear | Int > 2000 OR null | "L'année doit être valide" |
| deliveryQuarter | enum: Q1, Q2, Q3, Q4 OR null | "Trimestre invalide" |
| latitude | Float -90 to 90 OR null | "Latitude invalide (-90 à 90)" |
| longitude | Float -180 to 180 OR null | "Longitude invalide (-180 à 180)" |
| apartmentTypes | JSON array of valid types | "Types d'appartements invalides" |
| seoTitle | 0-200 chars OR null | "Le titre SEO ne doit pas dépasser 200 caractères" |
| seoDescription | 0-500 chars OR null | "La description SEO ne doit pas dépasser 500 caractères" |
| canonicalUrl | URL format OR null | "L'URL canonique doit être une URL valide" |
| ogImage | URL or relative path OR null | "L'image OG doit être une URL valide" |

### Apartment Fields

| Field | Validation | Error Message (FR) |
|---|---|---|
| slug | kebab-case, unique | "Le slug doit être unique" |
| projectId | non-empty, exists in DB | "Le projet est requis et doit exister" |
| buildingId | exists in DB OR null | "Le bâtiment doit exister" |
| apartmentType | enum: F2, F3, F4, F5, Duplex, Studio, Villa | "Type d'appartement invalide" |
| typeName | non-empty | "Le nom du type est requis" |
| surface | Int > 0 | "La surface doit être un nombre positif" |
| floor | Int >= 0 OR null | "L'étage doit être un nombre positif ou nul" |
| bedrooms | Int >= 0 | "Le nombre de chambres doit être positif" |
| bathrooms | Int >= 0 OR null | "Le nombre de salles de bain doit être positif" |
| price | Int > 0 OR null | "Le prix doit être un nombre positif" |
| orientation | enum (8 values) OR null | "Orientation invalide" |
| status | enum: AVAILABLE, RESERVED, SOLD, COMING_SOON, OFF_MARKET, DRAFT | "Statut invalide" |
| seoTitle | 0-200 chars OR null | "Le titre SEO ne doit pas dépasser 200 caractères" |

### Media Fields

| Field | Validation | Error Message (FR) |
|---|---|---|
| file | present, instanceof File | "Fichier manquant" |
| declared MIME | ∈ {image/jpeg, image/png, image/webp, image/avif, image/gif} | "Type MIME non supporté: {x}. Formats acceptés: JPEG, PNG, WebP, AVIF, GIF." |
| file size | ≤ 8MB (8*1024*1024) | "Fichier trop volumineux: {x} MB. Maximum: 8 MB." |
| magic bytes | matches declared MIME | "Le contenu du fichier ne correspond pas à son type déclaré (MIME mismatch)." |
| entityType | enum: project, apartment | "Type d'entité invalide" |
| entityId | exists in DB | "{Entity} introuvable" |
| alt | 0-500 chars OR null | "Le texte alt ne doit pas dépasser 500 caractères" |

### Lead Fields

| Field | Validation | Error Message (FR) |
|---|---|---|
| name | non-empty, 1-200 chars | "Le nom est requis" |
| phone | non-empty, 1-50 chars | "Le téléphone est requis" |
| email | email format OR null | "L'email doit être une adresse valide" |
| intent | enum (7 values) | "Intention invalide" |
| message | 0-5000 chars OR null | "Le message ne doit pas dépasser 5000 caractères" |

### User Fields

| Field | Validation | Error Message (FR) |
|---|---|---|
| email | email format, unique, case-insensitive | "Email invalide ou déjà utilisé" |
| name | non-empty, 1-200 chars | "Le nom est requis" |
| password | min 8 chars | "Le mot de passe doit faire au moins 8 caractères" |
| role | enum: ADMIN, EDITOR, VIEWER | "Rôle invalide" |

## 3. Entity-Level Validation

Cross-field validation within an entity.

### Project Entity

| Rule | Error Message (FR) | Level |
|---|---|---|
| If `priceOnRequest=true`, `startingPrice` should be null | "Le prix de départ doit être null si 'prix sur demande' est activé" | WARNING |
| If `status=SOLD_OUT`, all apartments should be SOLD or OFF_MARKET | "Le projet est marqué 'Épuisé' mais certains appartements sont encore disponibles" | WARNING |
| `minSurface` <= `maxSurface` | "La surface minimum ne peut pas être supérieure à la surface maximum" | ERROR |
| `deliveryQuarter` requires `deliveryYear` | "Le trimestre de livraison nécessite une année" | WARNING |
| `latitude` + `longitude` must both be set or both null | "Les coordonnées GPS doivent être complètes (latitude + longitude)" | WARNING |
| `slug` must not conflict with existing project slugs | "Un projet avec ce slug existe déjà" | ERROR (409) |

### Apartment Entity

| Rule | Error Message (FR) | Level |
|---|---|---|
| `projectId` must reference a non-archived project | "Le projet parent est archivé — l'appartement ne peut pas être publié" | ERROR |
| If `status=SOLD`, `price` should be set | "Un appartement vendu devrait avoir un prix" | WARNING |
| If `status=AVAILABLE`, `published=true` should be true | "Un appartement disponible n'est pas publié" | WARNING |
| If `hasParking=true`, `parkingSpots` should be > 0 | "Le parking est activé mais le nombre de places est 0" | WARNING |
| If `hasTerrace=true`, `terraceSurface` should be > 0 | "La terrasse est activée mais la surface est 0" | WARNING |
| If `hasGarden=true`, `gardenSurface` should be > 0 | "Le jardin est activé mais la surface est 0" | WARNING |
| `slug` must not conflict with existing apartment slugs | "Un appartement avec ce slug existe déjà" | ERROR (409) |
| `buildingId` (if set) must belong to the same project | "Le bâtiment ne appartient pas au projet sélectionné" | ERROR |

### Media Entity

| Rule | Error Message (FR) | Level |
|---|---|---|
| Either `projectId` OR `apartmentId` must be set (not both, not neither) | "Le média doit être associé à un projet OU un appartement" | ERROR |
| `url` OR `storagePath` must be set (for Video) | "L'URL ou le chemin de stockage est requis" | ERROR |

## 4. Publication-Level Validation

The pre-publish gate. Prevents publishing incomplete content.

### Project Pre-Publish Checklist

| Check | Required? | Level if Missing |
|---|---|---|
| Name | ✅ REQUIRED | BLOCKING |
| Slug | ✅ REQUIRED | BLOCKING |
| City + District | ✅ REQUIRED | BLOCKING |
| Status | ✅ REQUIRED | BLOCKING |
| Starting price (or priceOnRequest) | ✅ REQUIRED | BLOCKING |
| Hero image | ✅ REQUIRED | BLOCKING |
| Description | ⚠ RECOMMENDED | WARNING |
| Gallery (≥1 image) | ⚠ RECOMMENDED | WARNING |
| At least 1 apartment | ⚠ RECOMMENDED | WARNING |
| SEO title | ⚠ RECOMMENDED | WARNING |
| SEO description | ⚠ RECOMMENDED | WARNING |
| OG image | ⚠ OPTIONAL | WARNING |
| Video | ⚡ OPTIONAL | (no warning) |
| Brochure | ⚡ OPTIONAL | (no warning) |

**Behavior**:
- BLOCKING items: system shows "⚠ Des champs requis manquent. La publication est déconseillée."
- WARNING items: system shows "⚠ Informations recommandées manquantes."
- All checks pass: "✓ Prêt pour publication."
- **Does NOT hard-block publishing** — admin can publish anyway (per directive §12: "Do not block publishing unnecessarily")
- The Publication tab shows the checklist in real-time so admin knows what's missing before toggling publish

### Apartment Pre-Publish Checklist

| Check | Required? | Level if Missing |
|---|---|---|
| Type (apartmentType) | ✅ REQUIRED | BLOCKING |
| Type name (typeName) | ✅ REQUIRED | BLOCKING |
| Surface (>0) | ✅ REQUIRED | BLOCKING |
| Floor | ✅ REQUIRED | BLOCKING |
| Bedrooms (>0) | ✅ REQUIRED | BLOCKING |
| Price (or priceOnRequest) | ✅ REQUIRED | BLOCKING |
| Reference/unitNumber | ⚠ RECOMMENDED | WARNING |
| Orientation | ⚠ RECOMMENDED | WARNING |
| Description | ⚠ RECOMMENDED | WARNING |
| Floor plan image | ⚠ RECOMMENDED | WARNING |
| Hero image | ⚠ RECOMMENDED | WARNING |
| Gallery (≥1 image) | ⚠ RECOMMENDED | WARNING |
| SEO title | ⚠ RECOMMENDED | WARNING |
| SEO description | ⚠ RECOMMENDED | WARNING |
| 3D plan | ⚡ OPTIONAL | (no warning) |
| Video | ⚡ OPTIONAL | (no warning) |

### Publication Rules

| Rule | Behavior |
|---|---|
| Published project can contain unpublished apartments | ✅ Allowed — apartments are filtered individually by published flag |
| Unpublished project's apartments are all inaccessible | ✅ Correct — public API filters by project.published first |
| Archived project's apartments are all inaccessible | ✅ Correct — cascade filter |
| Apartment can be published independently of project | ✅ Allowed — but won't appear if project is unpublished |
| Price change requires confirmation | ✅ Dialog shows old/new/diff before save |
| Status change to SOLD requires price to be set | ⚠ WARNING (not blocking) |
| Deleting media used by published content | ⚠ WARNING dialog shows usage context |

## 5. Validation Implementation

### Server-side (API routes)
- **Zod schemas** for request body validation
- Returns 400 with specific error message on validation failure
- All mutations use Prisma parameterized queries (SQL injection prevention)

### Client-side (admin UI)
- **Real-time field validation**: inline error messages below inputs
- **Pre-submit entity validation**: form checks all required fields before enabling Save button
- **Pre-publish checklist**: Publication tab shows ✓/⚠/✕ indicators in real-time
- **Price change confirmation**: detects price change before save, shows dialog with diff

### Error Message Standards
- **Localized**: all messages in French (with Arabic support for RTL fields)
- **Actionable**: "Prix manquant — ajoutez le prix de vente avant de publier." (not "Validation failed")
- **Specific**: "La surface doit être un nombre positif" (not "Invalid value")
- **Recoverable**: error message tells user what to do to fix it

## 6. Content Completeness Score

Per entity, compute a score:

```
Score = (passed checks / total checks) × 100
```

**Classification**:
- **BLOCKING** missing → score reduced + red indicator
- **WARNING** missing → score reduced + amber indicator
- **OPTIONAL** missing → no score reduction

**Dashboard display**:
- "Projets nécessitant attention" card shows top 5 projects with score < 100%
- "Appartements nécessitant attention" card shows top 5 apartments with score < 100%
- Click item → navigate to edit dialog

## 7. Future Validation (not implemented)

- **Cross-entity consistency**: Project startingPrice should match `MIN(Apartment.price WHERE available)` — flag inconsistency if they diverge
- **Slug change warning**: changing slug breaks SEO + bookmarks — warn before allowing
- **Bulk validation**: validate all entities at once (e.g., "Find all apartments with missing floor plans")
- **Scheduled validation**: run daily check + email admin if BLOCKING items found
