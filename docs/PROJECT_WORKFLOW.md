# PROJECT WORKFLOW — ASAS Real Estate CMS

> End-to-end workflow for creating, populating, and publishing a project.

## Overview

A "Project" in ASAS is a complete commercial real estate development (e.g. "Résidence Les Oliviers"). It contains buildings, apartments, prices, media, videos, and SEO information.

## Project Creation Wizard (current implementation = 5-tab edit form)

The current implementation uses a tabbed edit form (not a strict multi-step wizard), but covers all required fields.

### Tab 1: INFOS (Basic Information)
- Nom (FR) * — required
- Nom (AR) — optional, RTL
- Slogan (FR/AR) — short tagline
- Description (FR/AR) — long form
- Statut — AVAILABLE / COMING_SOON / SOLD_OUT / DRAFT
- Type de projet — RESIDENTIAL / MIXED_USE / COMMERCIAL
- Types d'appartements — multi-select pills (F2, F3, F4, F5, Duplex, Studio, Villa)

### Tab 2: LOCALISATION
- Ville (FR/AR)
- Quartier (FR/AR)
- Adresse (FR/AR)
- Latitude — for Leaflet map
- Longitude — for Leaflet map

### Tab 3: COMMERCIAL
- Surface min (m²)
- Surface max (m²)
- Année de livraison
- Trimestre — Q1/Q2/Q3/Q4
- Prix de départ (DA)
- Prix sur demande (toggle — hides price publicly if true)
- Ordre d'affichage

### Tab 4: ÉQUIPEMENTS
Toggle switches for 6 standard amenities:
- Parking souterrain
- Ascenseur
- Espaces verts
- Piscine
- Sécurité 24h/24
- Climatisation

### Tab 5: PUBLICATION
- Publié/Brouillon toggle
- Mettre en avant toggle (shows on homepage)
- Aperçu sur le site button (opens public URL in new tab)

## Full Project Creation Workflow

### Step 1: Create the project shell
1. Dashboard → Quick Action "+ Nouveau Projet" OR CATALOGUE > Projets → "+ Nouveau"
2. Fill: name, city, district
3. Click "Créer"
4. Project is created as **Brouillon** (DRAFT) — invisible publicly

### Step 2: Edit full project info
1. Click the chevron icon on the project row
2. Edit dialog opens with 5 tabs
3. Fill all tabs:
   - INFOS: name, tagline, description (FR + AR)
   - LOCALISATION: full address, lat/lng
   - COMMERCIAL: surfaces, delivery, starting price
   - ÉQUIPEMENTS: toggle amenities
4. Click "Sauvegarder"

### Step 3: Upload hero image + gallery
1. MÉDIAS > Médiathèque
2. Pick Cible = Projet, select the project
3. Upload hero image (type=hero, alt="Façade principale")
4. Upload 4-8 gallery images (type=gallery, alt="[view description]")
5. Optionally upload amenity photos (type=amenity)

### Step 4: Add project video (optional)
1. In the same Médiathèque page, "Gestion des vidéos" card
2. Pick the project, paste YouTube/Vimeo URL
3. Add Title + Description + Type (WALKTHROUGH recommended)
4. Click "Ajouter la vidéo"
5. Toggle Featured if it's the main project video

### Step 5: Create buildings (optional)
1. CATALOGUE > Bâtiments → "+ Nouveau" (if exists)
2. Add Building A, Building B, etc. with floor count + elevator flag

### Step 6: Create apartments
1. CATALOGUE > Appartements → "+ Nouvel Appartement"
2. Select the project + building
3. Fill: type name + surface + bedrooms
4. Click "Créer" — apartment is created as DRAFT
5. Repeat for each apartment (F2, F3, F4 variants)
6. For each apartment, click "Modifier" to fill the 6-tab form (see APARTMENT_WORKFLOW.md)
7. Upload apartment-specific media (floor plan, furnished plan, renders)

### Step 7: Set prices + statuses
For each apartment:
1. Edit apartment → Prix tab
2. Set the price (auto-calculates Prix/m²)
3. Set status (AVAILABLE/RESERVED/SOLD/COMING_SOON/OFF_MARKET/DRAFT)

### Step 8: Verify on dashboard
1. Dashboard → check "Projets nécessitant attention" + "Appartements nécessitant attention"
2. All items should show 100% completion (or list missing fields)
3. Fix any missing fields before publishing

### Step 9: Preview
1. CATALOGUE > Projets → click the eye icon on the project row
2. New tab opens with the public URL `/#/projects/[slug]`
3. Verify: hero, gallery, video, apartments list, amenities, location map, lead form

### Step 10: Publish
1. CATALOGUE > Projets → click the "Brouillon" badge to toggle to "Publié"
2. Project is now visible on the public site
3. Verify on the public Projects list (`/#/projects`)
4. Verify on the sitemap.xml (should include the project URL)

## Content Completeness Scoring

The dashboard computes a project completion score from 7 checks:
1. ✅ Nom (name present)
2. ✅ Localisation (district + city present)
3. ✅ Statut (status set)
4. ✅ Appartements (apartmentCount > 0)
5. ✅ Prix de départ (startingPrice set OR priceOnRequest=true)
6. ✅ Image hero (heroImage present)
7. ✅ Publié (published=true)

Maximum score: 100%. The dashboard highlights items < 100% with the missing fields list.

## Publishing Rules

- **Draft** (published=false): invisible on public site, filtered from public API (404 on direct slug access)
- **Published** (published=true): visible on public site + sitemap + structured data
- **Archived** (archived=true + published=false): invisible everywhere, preserved in DB for historical leads
- The DELETE button = soft-archive (sets archived=true + published=false), not hard-delete

## Audit Trail

Every mutation is logged in the AuditLog table with:
- actorEmail + actorRole (who)
- action (CREATE_PROJECT, UPDATE_PROJECT, ARCHIVE_PROJECT, PRICE_CHANGE)
- entityType + entityId + entitySlug (what)
- before + after payload (diff)
- ipAddress + userAgent (where from)
- timestamp (when)

View in SYSTÈME > Journal d'audit.

## Common Mistakes

| Mistake | How to avoid |
|---|---|
| Publishing before adding apartments | Check dashboard "needs attention" cards |
| Forgetting hero image | Tab 5 Publication → Preview button reveals missing hero |
| Wrong lat/lng (map shows wrong location) | Use Google Maps to find coordinates |
| Forgetting Arabic translations (nameAr, taglineAr) | Fill both FR and AR fields |
| Setting status to SOLD_OUT while apartments still AVAILABLE | Set apartment statuses first |
| Wrong apartment types pills (e.g. selecting F5 when project has only F2/F3/F4) | Check actual apartment inventory |
