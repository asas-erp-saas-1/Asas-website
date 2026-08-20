# ADMIN WORKFLOW — ASAS Real Estate CMS

> Daily operations guide for non-technical ASAS employees.

## 1. Login

1. Go to `https://votre-domaine.dz/#/admin`
2. Enter your email + password.
3. Click "Se connecter".
4. Session valid for 8 hours.

**Forgot password?** Contact an administrator — passwords are bcrypt-hashed in DB, not recoverable.

## 2. Sidebar Navigation (NEW: grouped by domain)

The sidebar is organized into 5 groups:

- **(top)**: Tableau de Bord
- **CATALOGUE**: Projets, Appartements, Bâtiments
- **MÉDIAS**: Médiathèque (includes Videos manager)
- **VENTES**: Leads
- **SYSTÈME**: Utilisateurs, Journal d'audit, Paramètres

Click any item to navigate.

## 3. Dashboard (Tableau de Bord)

The dashboard shows:
- **4 stat cards**: Projets, Disponibles, Réservés, Leads
- **Distribution charts**: Apartment statuses + Lead intent breakdown
- **Quick Actions**: Nouveau Projet, Nouvel Appartement, Téléverser un média, Voir Leads
- **Recent items**: Recent Leads + Apartments + Projects
- **⚠ Projets nécessitant attention**: Projects with completion score < 100% + missing fields list
- **⚠ Appartements nécessitant attention**: Apartments with completion score < 100% + missing fields list

Click any "Voir tout →" link to navigate to the full list.

## 4. Managing Projects (CATALOGUE > Projets)

### 4.1 List view
- Filter by status (Published/Draft badges)
- Sort
- Click the eye icon to preview on public site (opens new tab)
- Click the chevron to edit
- Click the trash icon to archive (with confirmation)

### 4.2 Create new project
1. Click "+ Nouveau"
2. Fill the create form (name, city, district)
3. Project is created as **Brouillon** (Draft) by default — invisible publicly
4. Click the badge to **Publier** when ready

### 4.3 Edit project (5-tab form)
The edit dialog has 5 tabs:
- **Infos**: Nom (FR/AR), Slogan (FR/AR), Description (FR/AR), Statut, Type, Types d'appartements (pills)
- **Localisation**: Ville, Quartier, Adresse, Latitude, Longitude (for map)
- **Commercial**: Surface min/max, Année de livraison, Trimestre, Prix de départ, Prix sur demande, Ordre
- **Équipements**: 6 toggle switches (Parking, Ascenseur, Espaces verts, Piscine, Sécurité, Climatisation)
- **Publication**: Publié/Brouillon switch, Mettre en avant switch, Aperçu sur le site button

Click "Sauvegarder" to persist. Changes immediately reflect on the public site (1-minute cache).

## 5. Managing Apartments (CATALOGUE > Appartements)

### 5.1 List view
- Filter by project, status, type
- Same actions as projects (preview, edit, archive)

### 5.2 Create new apartment
1. Click "+ Nouvel Appartement"
2. Select project parent
3. Fill type name + surface + bedrooms
4. Apartment is created as Draft by default

### 5.3 Edit apartment (6-tab form)
- **Identité**: Numéro/Référence, Type (F2/F3/F4/F5/Duplex/Studio/Villa), Nom du type (FR/AR), Statut, Surface, Ordre
- **Spec**: Étage, Total étages, Orientation (8 options), Balcons, Surface balcon, Parking, Terrasse, Jardin
- **Pièces**: Chambres, Salles de bain, 15 features pills (Climatisation, Double vitrage, Cuisine équipée, etc.)
- **Prix**: Prix (DA) with auto-calculated Prix/m² preview, Prix sur demande, Plan de paiement (FR/AR)
- **Description**: Description (FR/AR)
- **Publication**: Publié/Brouillon + Aperçu button

## 6. Media Library (MÉDIAS > Médiathèque)

### 6.1 Upload an image
1. In the left card "Téléverser un média":
   - Pick Cible (Projet or Appartement)
   - Pick the specific entity
   - Pick the media type (hero, gallery, floor-plan, 3d-plan, render, interior, exterior, amenity)
   - Add Alt text + Caption (optional but recommended)
2. Drag-drop an image into the drop zone OR click to choose.
3. Click "Téléverser" — progress bar shows upload %.
4. Image appears in the grid on the right.

**Accepted formats**: JPEG, PNG, WebP, AVIF, GIF (8 MB max, magic-bytes verified).

### 6.2 Manage existing media
- **Filter**: by entity (project/apartment), by type, by search query (matches alt/caption)
- **Edit**: click "Modifier" on a card — opens dialog to edit type, alt, caption
- **Delete**: click the trash icon — confirmation dialog warns about permanent deletion

### 6.3 Add a video (left panel below upload)
1. In "Gestion des vidéos":
   - Pick Cible + entity
   - Enter the video URL (YouTube or Vimeo)
   - Add a Title (required)
   - Add Description (optional)
   - Pick Type (HERO/GALLERY/WALKTHROUGH/INTERVIEW)
   - Optional: Thumbnail URL
2. Click "Ajouter la vidéo"
3. Video appears in the list with toggle Featured + toggle Published + Delete buttons

## 7. Lead Management (VENTES > Leads)

### 7.1 List view
- Filter by status (NEW/CONTACTED/QUALIFIED/VISIT/NEGOTIATION/SOLD/LOST)
- Each row has: Name + email, Phone, Intention (Info/Prix/Plan/Visite/WhatsApp/Appel/Réservation), Property, Status (inline dropdown for quick change), Date, Notes button

### 7.2 Change lead status (inline)
Click the status dropdown on any row → select new status from the 7-stage pipeline → click to save.
Audit log records the change.

### 7.3 Add a follow-up note
1. Click "Notes" button on a row
2. Dialog opens showing all existing notes (with author + timestamp)
3. Type your note in the input at the bottom
4. Press Enter or click "Ajouter"
5. The note is saved with your email as author + timestamp

## 8. User Management (SYSTÈME > Utilisateurs)

**ADMIN-only**: cannot change own role or deactivate own account.

### 8.1 List users
- Table shows: name + email, role badge (Administrateur=green, Éditeur=blue, Lecteur=gray), status (Actif/Désactivé), created date
- 4 users visible in seed: admin@asas.dz (ADMIN), editor@asas.dz (EDITOR), viewer@asas.dz (VIEWER), neweditor@asas.dz (EDITOR)

### 8.2 Create new user
1. Click "+ Nouvel utilisateur"
2. Fill: Email, Nom complet, Rôle (ADMIN/EDITOR/VIEWER), Mot de passe (min 8 chars)
3. Click "Créer"

### 8.3 Edit user
1. Click "Modifier" on a row
2. Edit Name, Role (cannot change own role), or set new password
3. Click "Enregistrer"

### 8.4 Deactivate user
- Click the eye icon to toggle Active/Inactive
- Account is soft-deleted (active=false) — preserves audit log referential integrity

## 9. Audit Log (SYSTÈME > Journal d'audit)

- Filter by action type (LOGIN, PRICE_CHANGE, CREATE_USER, etc. — 24 action types)
- Set limit (25/50/100/200 entries)
- Table shows: Action (translated label), Acteur (email + role), Entité (type + slug), Avant (diff before), Après (diff after), Date (timestamp + IP address)

Every admin action since login is traceable.

## 10. Settings (SYSTÈME > Paramètres)

Shows:
- Your account info (name, email, role)
- Role description
- Security summary (bcrypt, httpOnly cookie, server-side checks, magic-bytes upload validation)

## 11. Logout

Click "Déconnexion" at the bottom of the sidebar — revokes session server-side + clears cookie.

## 12. Common Workflows

### 12.1 Add a new apartment to an existing project
1. Dashboard → Quick Action "+ Nouvel Appartement" (or CATALOGUE > Appartements → "+ Nouveau")
2. Select the project
3. Fill the type name + surface + bedrooms
4. Click "Créer"
5. Click "Modifier" on the new apartment row
6. Fill all 6 tabs (Identité → Spec → Pièces → Prix → Description → Publication)
7. Click "Sauvegarder"
8. Click the "Publication" tab → toggle Publié → Save again
9. Upload media (plans + renders + gallery) via MÉDIAS > Médiathèque
10. Preview via the eye icon

### 12.2 Change a price
1. CATALOGUE > Appartements → click "Modifier" on the apartment
2. Go to "Prix" tab
3. The current price is shown — change it
4. The Prix/m² auto-calculates in real time
5. Click "Sauvegarder"
6. Audit log records the change with `action: PRICE_CHANGE` + before/after values
7. New price immediately appears on: apartment page, project inventory, apartment cards, search, filters, SEO, structured data

### 12.3 Handle a new lead
1. VENTES > Leads — find the lead with status "NEW"
2. Change status to "CONTACTED" via inline dropdown
3. Click "Notes" → add a note like "Called client at 14h, interested in F3"
4. Schedule a visit → change status to "VISIT"
5. After visit, status → "NEGOTIATION"
6. If sold → status "SOLD"; if not → "LOST"
7. All status changes are audit-logged with your email + timestamp

## 13. Common Mistakes (and how to avoid them)

| Mistake | How to avoid |
|---|---|
| Publishing an empty project | Check Dashboard "Projets nécessitant attention" before publishing |
| Deleting media used elsewhere | System shows confirmation; review before confirming |
| Forgetting Alt text on images | Always fill Alt for accessibility + SEO |
| Wrong orientation on apartment | Use the 8-direction dropdown |
| Cannot change own role | Ask another ADMIN to change it for you |
| Lost unsaved changes | Click "Sauvegarder" before closing dialog (or use Save Draft) |
