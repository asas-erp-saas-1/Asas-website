# APARTMENT WORKFLOW — ASAS Real Estate CMS

> End-to-end workflow for creating, populating, and publishing an apartment.

## Overview

An "Apartment" in ASAS is a complete digital sales fiche — not just "type + surface + price". It includes reference, rooms, features, plans, renders, video, payment plan, and SEO-relevant content.

## Apartment Creation Workflow

### Step 1: Create the apartment shell
1. Dashboard → Quick Action "+ Nouvel Appartement" OR CATALOGUE > Appartements → "+ Nouveau"
2. Fill: Project (required), Type name, Surface, Bedrooms, Apartment type (F2/F3/F4/F5/Duplex/Studio/Villa)
3. Click "Créer"
4. Apartment is created as **DRAFT** — invisible publicly

### Step 2: Edit apartment (6-tab form)

#### Tab 1: IDENTITÉ
- **Numéro/Référence**: e.g. "A-101", "B-205" — required for inventory tracking
- **Type**: F2, F3, F4, F5, Duplex, Studio, Villa
- **Nom du type (FR)**: e.g. "F3 Familial", "F2 Compact", "F4 Standing"
- **Nom du type (AR)**: Arabic version (RTL)
- **Statut**: AVAILABLE (default), RESERVED, SOLD, COMING_SOON, OFF_MARKET, DRAFT
- **Surface (m²)** *: required
- **Ordre**: display order (lower = first)

#### Tab 2: SPEC (Specifications)
- **Étage**: floor number (e.g. 1, 2, 5)
- **Total étages (bâtiment)**: total floors in the building
- **Orientation**: 8 options (Nord, Sud, Est, Ouest, Nord-Est, Nord-Ouest, Sud-Est, Sud-Ouest)
- **Balcons**: count
- **Surface balcon (m²)**: balcony area
- **Places de parking**: count
- **Parking** (toggle)
- **Surface terrasse (m²)** + Terrasse toggle
- **Surface jardin (m²)** + Jardin toggle

#### Tab 3: PIÈCES (Rooms)
- **Chambres**: bedrooms count
- **Salles de bain**: bathrooms count
- **Caractéristiques** (15 preset pills — click to toggle):
  - Climatisation
  - Double vitrage
  - Chauffage central
  - Volets roulants électriques
  - Cuisine équipée
  - Porte blindée
  - Vidéophone
  - Jardin privé
  - Débarras
  - Cellier
  - Dressing
  - Cheminée
  - Alarme
  - Fibre optique
  - Domotique

#### Tab 4: PRIX (Price)
- **Prix (DA)**: sale price in Algerian Dinars
- **Auto-calculated Prix/m²**: shows in real-time as you type (price / surface)
- **Prix sur demande** (toggle): hides price on public site
- **Plan de paiement (FR)**: e.g. "30% à la signature, solde sur 24 mois sans intérêts"
- **Plan de paiement (AR)**: Arabic version (RTL)

#### Tab 5: DESCRIPTION
- **Description (FR)**: long-form description of the apartment
- **Description (AR)**: Arabic version (RTL)

#### Tab 6: PUBLICATION
- **Publié/Brouillon** toggle
- **Aperçu sur le site** button — opens `/#/projects/[project-slug]/apartments/[apartment-slug]` in new tab

### Step 3: Upload apartment media
1. MÉDIAS > Médiathèque
2. Pick Cible = Appartement, select the apartment
3. Upload (in this order):
   - **floor-plan** (required) — architectural floor plan
   - **3d-plan** (recommended) — 3D plan visualization
   - **render** (recommended) — interior/exterior renders (3-5 images)
   - **gallery** (recommended) — additional photos
   - **hero** (optional) — main image (defaults to first render if missing)

### Step 4: Add apartment video (optional)
1. In the same Médiathèque page, "Gestion des vidéos" card
2. Pick Cible = Appartement, select the apartment
3. Add YouTube/Vimeo URL with Title + Type (WALKTHROUGH recommended for apartment tours)
4. Toggle Featured if it's the main apartment video

### Step 5: Verify on dashboard
1. Dashboard → check "Appartements nécessitant attention" card
2. The apartment should NOT appear (means 100% completion)
3. If it appears, fix the missing fields listed (e.g. "Image hero", "Orientation")

### Step 6: Preview
1. CATALOGUE > Appartements → click the eye icon on the apartment row
2. New tab opens with public URL
3. Verify:
   - Hero shows
   - Information bar (Surface, Étage, Chambres, SDB, Orientation, Balcon, Parking) correct
   - Gallery renders
   - Floor plan viewable
   - 3D plan viewable
   - Price + Prix/m² correct
   - Payment plan visible
   - Status badge correct (Disponible/Réservé/Vendu)
   - Lead form works (submit a test lead)
   - Mobile sticky conversion bar (WhatsApp + Appeler)

### Step 7: Publish
1. CATALOGUE > Appartements → click the "Brouillon" badge to toggle to "Publié"
2. Apartment is now visible on the public site
3. Verify on the parent project detail page (`/#/projects/[project-slug]`) — apartment should appear in the inventory list

## Content Completeness Scoring (Apartment)

The dashboard computes an apartment completion score from 9 checks:
1. ✅ Type
2. ✅ Nom du type
3. ✅ Surface (>0)
4. ✅ Étage
5. ✅ Chambres (>0)
6. ✅ Prix (or priceOnRequest)
7. ✅ Orientation
8. ✅ Image hero
9. ✅ Publié

Maximum score: 100%. Items < 100% appear in the "Appartements nécessitant attention" card.

## Price Change Workflow

Per directive §9: PRICE IS CRITICAL BUSINESS DATA.

### Single source of truth
- The `Apartment.price` field in the database is the ONLY source of truth.
- Public site fetches the price via `/api/apartments/[slug]` — no hardcoded prices in components.
- When admin changes the price, the new value propagates to:
  - Apartment detail page (hero price)
  - Project inventory (apartment cards)
  - Apartment cards on homepage featured section
  - Search + filter results
  - SEO structured data (Apartment schema `offers.price`)
  - Admin dashboard (if listed)

### Price change flow
1. CATALOGUE > Appartements → click "Modifier"
2. Go to Prix tab
3. Current price is shown — change to new value
4. Prix/m² auto-calculates in real time (preview)
5. Click "Sauvegarder"
6. Server logs `PRICE_CHANGE` audit entry with before + after values
7. Public site shows new price on next page load (1-minute React Query cache)

## Status Change Workflow

The `Apartment.status` field is also single source of truth. Allowed values:
- AVAILABLE — visible on public site, default
- RESERVED — visible with "Réservé" badge
- SOLD — visible with "Vendu" badge
- COMING_SOON — visible with "Bientôt" badge
- OFF_MARKET — hidden from public (filtered out)
- DRAFT — hidden (use Published toggle instead)

When admin changes status:
- Audit log records `UPDATE_APARTMENT_STATUS` with before + after
- Project inventory (count of "Disponibles") updates automatically

## Audit Trail

Every apartment mutation is logged:
- CREATE_APARTMENT — when created
- UPDATE_APARTMENT — when edited (general)
- UPDATE_APARTMENT_STATUS — when status changes
- PRICE_CHANGE — when price changes (special action)
- ARCHIVE_APARTMENT — when archived

View in SYSTÈME > Journal d'audit, filter by entityType=Apartment.

## Common Mistakes

| Mistake | How to avoid |
|---|---|
| Publishing without floor plan | Check "needs attention" before publishing |
| Wrong orientation | Use the 8-direction dropdown |
| Forget to set price (defaults to null = "Sur demande") | Always set price or toggle Prix sur demande |
| Forget Alt text on floor plan | Accessibility + SEO — fill Alt on every upload |
| Setting status to SOLD but forgetting to update Project inventory count | Inventory auto-updates — but verify on project page |
| Wrong project parent | Cannot change after creation — recreate if wrong |
| Surface = 0 (typo) | Surface field is required and >0 for completion score |
