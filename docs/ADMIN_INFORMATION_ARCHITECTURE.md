# ADMIN_INFORMATION_ARCHITECTURE.md — ASAS Real Estate CMS

> **Phase 2 Blueprint — Admin Information Architecture + Screen Inventory**
> Defines the sidebar structure, dashboard design, and complete screen inventory.

## 1. Sidebar Architecture

### Current State (verified)
5 groups:
- (top): Tableau de Bord
- CATALOGUE: Projets, Appartements, Bâtiments
- MÉDIAS: Médiathèque
- VENTES: Leads
- SYSTÈME: Utilisateurs, Journal d'audit, Paramètres

### Target State (blueprint)

The employee's most frequent tasks are:
1. **Manage apartments** (prices, status, media) — most frequent
2. **Manage projects** (create, edit, publish)
3. **Upload media** (images, plans, videos)
4. **Handle leads** (status change, notes, follow-up)
5. **Check dashboard** (what needs attention)
6. **Review audit log** (occasional, ADMIN)
7. **Manage users** (rare, ADMIN)

**Optimized sidebar** (preserves current structure, minor reordering):

```
DASHBOARD
  Tableau de Bord

CATALOGUE
  Projets
  Appartements
  Bâtiments

MÉDIAS
  Médiathèque (images + videos + plans)

VENTES
  Leads
  (future: Pipeline view)

SYSTÈME
  Utilisateurs (ADMIN-only)
  Journal d'audit
  Paramètres
```

**Mobile behavior**: Sidebar collapses to icon-only (w-16). Group labels hidden. Items show tooltip on hover. Sidebar scrolls vertically.

**Rationale**: Group items by domain (Catalogue = real estate content, Médias = assets, Ventes = sales, Système = admin). This matches the employee's mental model: "I'm managing a property" (Catalogue) vs "I'm handling a lead" (Ventes) vs "I'm uploading media" (Médias).

## 2. Dashboard Design

### Purpose
Answer immediately:
- How many projects? How many published? How many draft?
- How many apartments? How many available? How many reserved? How many sold?
- How many new leads? How many visits requested?
- Which projects need attention? Which apartments have missing data?
- Which media assets are missing? Which pages have SEO problems?

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ ASAS Admin                                    [Actualiser]│
├──────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│ │   4  │ │  22  │ │   4  │ │ 0/1  │  Stat Cards         │
│ │Projets│ │Dispo │ │Réserv│ │Leads │                     │
│ └──────┘ └──────┘ └──────┘ └──────┘                     │
│                                                            │
│ ┌────────────────────┐ ┌────────────────────┐             │
│ │ Apartment Distrib.│ │ Lead Intent Break. │  Charts     │
│ │ ● 22 Available    │ │ ████████ Info       │             │
│ │ ● 4  Reserved     │ │ ██ WhatsApp         │             │
│ │ ● 0  Sold         │ │ █ Call              │             │
│ │ ● 28 Total        │ │                     │             │
│ └────────────────────┘ └────────────────────┘             │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Quick Actions                                          │ │
│ │ [+ Nouveau Projet] [+ Nouvel Apt] [Upload] [Voir Leads]│ │
│ └──────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ⚠ Projets nécessitant attention                       │ │
│ │ ┌──────────────────────────────────────────────────┐ │ │
│ │ │ Résidence X — Missing: Hero image, SEO desc     │ │ │
│ │ │                                          85%    │ │ │
│ │ └──────────────────────────────────────────────────┘ │ │
│ │ ┌──────────────────────────────────────────────────┐ │ │
│ │ │ Résidence Y — Missing: Brochure                │ │ │
│ │ │                                          92%    │ │ │
│ │ └──────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌────────────────────┐ ┌────────────────────┐             │
│ │ Leads Récents      │ │ Appartements Récents│  Lists     │
│ │ • Test User        │ │ • F4 Prestige      │             │
│ │   0500... VISIT    │ │   120m² Dispo      │             │
│ │ • ...              │ │ • ...              │             │
│ │ [Voir tout →]      │ │ [Voir tout →]      │             │
│ └────────────────────┘ └────────────────────┘             │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Projets Récents                                       │ │
│ │ ┌────────┐ ┌────────┐ ┌────────┐                     │ │
│ │ │Rés. X  │ │Rés. Y  │ │Rés. Z  │  3-col grid        │ │
│ │ │Chéraga │ │Dar El  │ │Bordj   │                     │ │
│ │ │12 lots │ │5 lots  │ │6 lots  │                     │ │
│ │ └────────┘ └────────┘ └────────┘                     │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Content Health Section

Per directive §15-16, the dashboard should show actionable content health diagnostics:

```
CONTENT HEALTH
Projects       92% complete
Apartments     87% complete
SEO            76% complete
Media          94% complete

Missing hero images       3
Missing floor plans       7
Missing prices            4
Draft content             8
```

**Implementation**: Each metric is a clickable link that opens the filtered list (e.g., "Missing floor plans" → Apartments tab filtered by `hasFloorPlan=false`).

**Classification** (per directive §16):
- **WARNING** (amber): Missing caption, missing SEO description, missing OG image
- **BLOCKING** (red): Missing price, missing hero, missing surface, missing type
- Display score as percentage, but classify items as WARNING or BLOCKING (not just percentage)

## 3. Screen Inventory

### Screen 1: Dashboard
- **Purpose**: Operational overview
- **Entry**: Sidebar → Tableau de Bord
- **User role**: All (ADMIN, EDITOR, VIEWER)
- **Data**: Stats, distribution charts, lead intent breakdown, recent items, content health alerts
- **Primary action**: Quick Actions buttons
- **Secondary actions**: Click "Voir tout" on any card → navigate to list
- **Empty state**: "Aucun projet. Créez votre premier projet."
- **Loading state**: Spinner + "Chargement..."
- **Error state**: "Échec du chargement des données. [Actualiser]"
- **Mobile behavior**: Cards stack vertically, charts hidden on <640px

### Screen 2: Projects List
- **Purpose**: Manage all projects
- **Entry**: Sidebar → CATALOGUE → Projets
- **User role**: All (VIEWER cannot create/edit)
- **Data**: Table with name, slug, location, status, published badge, featured star, apartment count, starting price
- **Primary action**: "+ Nouveau" (create project)
- **Secondary actions**: Preview (eye), Edit (chevron), Archive (trash)
- **Filters**: Status, Published/Draft, Featured, Developer (future)
- **Search**: By name, slug, district (future)
- **Empty state**: "Aucun projet. Créez votre premier projet."
- **Mobile behavior**: Table converts to cards on <768px

### Screen 3: Project Edit Dialog
- **Purpose**: Edit all project fields
- **Entry**: Projects List → click chevron icon
- **User role**: ADMIN, EDITOR (VIEWER read-only)
- **Data**: 6 tabs (Infos, Localisation, Commercial, Équipements, SEO, Publication)
- **Primary action**: "Sauvegarder"
- **Secondary actions**: "Annuler", tab navigation, "Aperçu sur le site"
- **Validation**: Pre-publish checklist in Publication tab (✓/⚠/✕ indicators)
- **Empty state**: N/A (dialog always has data)
- **Loading state**: Spinner while fetching full project data
- **Error state**: Red banner with error message
- **Mobile behavior**: Dialog fills screen, tabs horizontally scrollable

### Screen 4: Apartments List
- **Purpose**: Manage all apartments
- **Entry**: Sidebar → CATALOGUE → Appartements
- **User role**: All (VIEWER cannot create/edit)
- **Data**: Table with reference, type, surface, floor, bedrooms, price, status, published badge
- **Primary action**: "+ Nouvel Appartement"
- **Secondary actions**: Preview, Edit, Archive
- **Filters**: Project, Status, Type
- **Search**: By reference, type name (future)
- **Empty state**: "Aucun appartement."
- **Mobile behavior**: Table converts to cards

### Screen 5: Apartment Edit Dialog
- **Purpose**: Edit all apartment fields
- **Entry**: Apartments List → click chevron
- **User role**: ADMIN, EDITOR
- **Data**: 7 tabs (Identité, Spec, Pièces, Prix, Description, SEO, Publication)
- **Primary action**: "Sauvegarder"
- **Validation**: Pre-publish checklist + price change confirmation dialog
- **Price change**: If price changed, confirmation dialog shows old/new/diff
- **Mobile behavior**: Same as project edit

### Screen 6: Buildings List
- **Purpose**: Manage buildings
- **Entry**: Sidebar → CATALOGUE → Bâtiments
- **Data**: Table with name, code, project, floors, elevator, apartment count
- **Primary action**: "+ Nouveau" (future)
- **Mobile behavior**: Cards on mobile

### Screen 7: Media Library (Médiathèque)
- **Purpose**: Upload + manage images + videos
- **Entry**: Sidebar → MÉDIAS → Médiathèque
- **Data**: Grid of media items with thumbnail, entity badge, type badge, alt text
- **Primary action**: Upload (drag-drop + file picker)
- **Secondary actions**: Edit metadata, Delete (with "used in N locations" warning), Set as Hero/Featured (future), Reorder (future)
- **Filters**: Entity type, Media type, Search (alt/caption)
- **Video management**: Separate card below upload for video URL management
- **Empty state**: "Aucun média. Téléversez votre première image."
- **Loading state**: Skeleton grid
- **Mobile behavior**: Grid 2 cols, upload card full-width

### Screen 8: Leads List
- **Purpose**: Manage leads through the sales pipeline
- **Entry**: Sidebar → VENTES → Leads
- **Data**: Table with name, phone, email, intention, property, status (inline dropdown), date, Notes button
- **Primary action**: Inline status change (7-stage pipeline dropdown)
- **Secondary actions**: Notes drawer (view + add notes), filter by status, refresh
- **Filters**: Status (NEW, CONTACTED, QUALIFIED, VISIT, NEGOTIATION, SOLD, LOST)
- **Empty state**: "Aucun lead."
- **Mobile behavior**: Table converts to cards

### Screen 9: Users List
- **Purpose**: Manage admin accounts (ADMIN-only)
- **Entry**: Sidebar → SYSTÈME → Utilisateurs
- **User role**: ADMIN-only (VIEWER/EDITOR see read-only)
- **Data**: Table with name, email, role badge, status, created date
- **Primary action**: "+ Nouvel utilisateur"
- **Secondary actions**: Edit (name, role, password reset), Toggle active
- **Self-protection**: Cannot change own role, cannot deactivate own account
- **Empty state**: "Aucun utilisateur."
- **Mobile behavior**: Cards

### Screen 10: Audit Log
- **Purpose**: View mutation history
- **Entry**: Sidebar → SYSTÈME → Journal d'audit
- **User role**: All (read-only)
- **Data**: Table with Action, Acteur, Entité, Avant, Après, Date + IP
- **Filters**: Action type (24 options), limit (25/50/100/200)
- **Empty state**: "Aucune entrée dans le journal."
- **Mobile behavior**: Table horizontally scrollable

### Screen 11: Settings
- **Purpose**: View account info + security summary
- **Entry**: Sidebar → SYSTÈME → Paramètres
- **Data**: Current user info (name, email, role), security summary
- **No mutations** (read-only display)
- **Future**: Editable site settings (contact info, social links, brand colors)

## 4. Navigation Principles

1. **Persistent sidebar**: Always visible on desktop (w-56 expanded, w-16 collapsed). Mobile: hamburger menu.
2. **Breadcrumb**: On detail pages, show "Accueil > Projets > Résidence Les Oliviers"
3. **Back button**: Admin uses browser back; no custom back navigation needed (SPA hash router)
4. **Quick Actions**: Dashboard has 4 primary action buttons for the most common tasks
5. **Contextual actions**: Table rows have inline action buttons (preview, edit, archive) — no need to open a detail page

## 5. Mobile Admin Strategy

Per directive §29-30:

### What becomes a drawer
- Lead Notes (currently a Dialog — should be a Drawer on mobile)
- Media edit metadata (currently a Dialog — should be a Drawer on mobile)

### What becomes a modal
- Price change confirmation (already a Dialog)
- Delete confirmation (already a Dialog)
- User create/edit (already a Dialog)

### What becomes a full page
- Project Edit (currently a Dialog with max-w-2xl — on mobile <640px, should become full-screen)
- Apartment Edit (same)

### What becomes a bottom sheet
- Status change dropdown (currently inline Select — on mobile, should become a bottom sheet for better touch UX)

### What becomes horizontally scrollable
- Audit Log table (6 columns — too wide for mobile)
- Projects/Apartments tables (convert to cards on mobile instead)

### No horizontal overflow
- All screens must fit within 360px viewport without horizontal scroll
- Tables convert to cards on <768px
- Dialogs become full-screen on <640px

## 6. Component Inventory (for future implementation)

See `ADMIN_UX_SPECIFICATION.md` for the complete component inventory with responsibilities.
