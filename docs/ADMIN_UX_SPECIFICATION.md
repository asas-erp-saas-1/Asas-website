# ADMIN_UX_SPECIFICATION.md — ASAS Real Estate CMS

> **Phase 2 Blueprint — UX Principles + Design System + Mobile Strategy + Component Inventory**

## 1. UX Design Principles

1. **Progressive disclosure**: Show essential info first; reveal details on demand (tabs, expandable sections)
2. **Contextual actions**: Action buttons appear where the user is (inline table actions, not a separate toolbar)
3. **Inline validation**: Validate as user types — show errors before submit
4. **Autosave where appropriate**: Drafts save automatically (future — currently manual)
5. **Undo where safe**: Soft-delete (archive) instead of hard-delete
6. **Confirmation only when necessary**: Don't confirm every action — only destructive ones (delete, archive, price change)
7. **Clear destructive actions**: Red color + explicit wording ("Supprimer définitivement")
8. **Consistent terminology**: Same word for same action everywhere ("Publier" not "Activer")
9. **Persistent navigation**: Sidebar always visible (desktop) or accessible (mobile)
10. **Keyboard accessibility**: All actions reachable via Tab + Enter
11. **Touch-friendly controls**: Min 44×44px tap targets
12. **Never expose database IDs**: Use project names, apartment references, building names — not cuid strings

## 2. Design System

### Color Palette
| Color | Tailwind Class | Hex | Usage |
|---|---|---|---|
| Forest Green | `forest` / `bg-forest` | #2d5a3d | Primary actions, active states, brand |
| Charcoal | `charcoal` / `bg-charcoal` | #111111 | Sidebar, footer, dark surfaces |
| Ivory | `ivory` / `bg-ivory` | #faf9f6 | Page background |
| Sand | `sand` / `text-sand` | #e8e2d5 | Muted text, borders |
| Gold | (accent) | #c5a055 | Price highlights, premium accents |
| Emerald | `emerald-500` | #10b981 | Success, available status |
| Amber | `amber-500` | #f59e0b | Warning, reserved status, attention |
| Red | `red-500` | #ef4444 | Error, sold status, destructive actions |
| Sky | `sky-500` | #0ea5e9 | Info, contacted status |
| Violet | `violet-500` | #8b5cf6 | Visit status |
| Orange | `orange-500` | #f97316 | Negotiation status |

### Typography
- **Font**: Geist Sans (Next.js default) + Geist Mono for code/data
- **Sizes**: text-xs (10px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px), text-3xl (30px)
- **Weights**: font-medium (500), font-semibold (600), font-bold (700)
- **Arabic**: dir="rtl" on input/textarea fields for Arabic content

### Spacing
- **Page padding**: p-4 (mobile) / p-6 (desktop) / p-8 (large desktop)
- **Card padding**: p-4 (compact) / p-6 (default)
- **Gap**: gap-2 (8px) for tight, gap-4 (16px) for default, gap-6 (24px) for sections

### Border Radius
- `rounded-md` (6px) for inputs, badges
- `rounded-lg` (8px) for cards, buttons
- `rounded-xl` (12px) for dialogs, hero sections
- `rounded-full` for pills, status dots

### Shadows
- `shadow-sm` for cards
- `shadow-lg` for dialogs, sticky elements
- `shadow-forest/20` for active sidebar items

### Admin vs Public Design
| Aspect | Public Website | Admin |
|---|---|---|
| Tone | Premium, emotional, luxury | Clear, fast, operational |
| Density | Low (lots of whitespace) | High (tables, cards) |
| Colors | Forest + Gold accents | Forest + status colors |
| Typography | Large headlines | Small, scannable text |
| Images | Full-bleed hero | Thumbnails, grid |
| Animation | Subtle Framer Motion | Minimal (functional only) |

## 3. Component Inventory

### Existing Components (verified in codebase)

| Component | File | Purpose | Reusable? |
|---|---|---|---|
| Navbar | `src/components/shared/Navbar.tsx` | Public site navigation | ✅ |
| Footer | `src/components/shared/Footer.tsx` | Public site footer | ✅ |
| StickyMobileCTA | `src/components/layout/StickyMobileCTA.tsx` | Mobile conversion bar | ✅ |
| ProjectCard | `src/components/shared/ProjectCard.tsx` | Project display card | ✅ |
| ApartmentCard | `src/components/shared/ApartmentCard.tsx` | Apartment display card | ✅ |
| LeadForm | `src/components/shared/LeadForm.tsx` | Contact form | ✅ |
| FloorPlanViewer | `src/components/shared/FloorPlanViewer.tsx` | Zoomable plan viewer | ✅ |
| ProjectGallery | `src/components/shared/ProjectGallery.tsx` | Image gallery | ✅ |
| VideoPlayer | `src/components/shared/VideoPlayer.tsx` | YouTube/Vimeo/uplaoded | ✅ |
| StatusBadge | `src/components/pages/AdminPage.tsx` (inline) | Status display | ⚠ should extract |
| IntentLabel | `src/components/pages/AdminPage.tsx` (inline) | Lead intent label | ⚠ should extract |
| AdminLoginGate | `src/components/pages/AdminPage.tsx` (inline) | Login form | ⚠ should extract |
| ProjectEditForm | `src/components/pages/AdminPage.tsx` (inline) | 6-tab project editor | ⚠ should extract |
| ApartmentEditForm | `src/components/pages/AdminPage.tsx` (inline) | 7-tab apartment editor | ⚠ should extract |
| MediaUploadCard | `src/components/pages/AdminPage.tsx` (inline) | Upload form | ⚠ should extract |
| MediaGrid | `src/components/pages/AdminPage.tsx` (inline) | Media grid | ⚠ should extract |
| VideoManager | `src/components/pages/AdminPage.tsx` (inline) | Video URL manager | ⚠ should extract |
| UsersTab | `src/components/pages/AdminPage.tsx` (inline) | User management | ⚠ should extract |
| AuditLogTab | `src/components/pages/AdminPage.tsx` (inline) | Audit log viewer | ⚠ should extract |
| DashboardTab | `src/components/pages/AdminPage.tsx` (inline) | Dashboard | ⚠ should extract |

### Future Components (to be built in Phase 3+)

| Component | Purpose | Props | Priority |
|---|---|---|---|
| ProjectCreationWizard | Multi-step project creation | `onComplete`, `onCancel` | HIGH |
| ApartmentCreationWizard | Multi-step apartment creation | `projectId`, `onComplete` | HIGH |
| ApartmentQuickEdit | Inline price/status/featured edit | `apartment`, `onSave` | HIGH |
| ContentHealthBadge | Show completion score + missing fields | `entity`, `score`, `missing` | MEDIUM |
| PublishButton | Smart publish with validation | `entity`, `onPublish`, `validation` | MEDIUM |
| ConfirmationDialog | Reusable confirmation | `title`, `message`, `onConfirm`, `onCancel`, `destructive` | MEDIUM |
| UnsavedChangesDialog | Warn before leaving with unsaved changes | `hasChanges`, `onSave`, `onDiscard`, `onCancel` | MEDIUM |
| WizardStepper | Progress indicator for multi-step wizards | `steps`, `currentStep`, `onStepClick` | HIGH |
| FormSection | Reusable form section with label + content | `title`, `children`, `required` | MEDIUM |
| ValidationSummary | Show field/entity/publication validation | `checks`, `level` | MEDIUM |
| SEOEditor | SEO fields with auto-gen preview | `entity`, `onChange` | MEDIUM |
| PriceEditor | Price input with confirmation + audit | `currentPrice`, `onChange`, `onConfirm` | HIGH |
| BulkActionBar | Bulk select + action bar | `selectedIds`, `actions` | LOW |
| FilterBar | Combinable filters | `filters`, `onChange` | MEDIUM |
| SearchInput | Global admin search | `onSearch`, `placeholder` | MEDIUM |

## 4. Screen Inventory (detailed in ADMIN_INFORMATION_ARCHITECTURE.md)

| # | Screen | Purpose | Entry Point |
|---|---|---|---|
| 1 | Dashboard | Operational overview | Sidebar → Tableau de Bord |
| 2 | Projects List | Manage projects | Sidebar → CATALOGUE → Projets |
| 3 | Project Edit Dialog | Edit project fields | Projects List → chevron |
| 4 | Apartments List | Manage apartments | Sidebar → CATALOGUE → Appartements |
| 5 | Apartment Edit Dialog | Edit apartment fields | Apartments List → chevron |
| 6 | Buildings List | Manage buildings | Sidebar → CATALOGUE → Bâtiments |
| 7 | Media Library | Upload + manage media | Sidebar → MÉDIAS → Médiathèque |
| 8 | Leads List | Manage leads pipeline | Sidebar → VENTES → Leads |
| 9 | Users List | Manage admin accounts | Sidebar → SYSTÈME → Utilisateurs |
| 10 | Audit Log | View mutation history | Sidebar → SYSTÈME → Journal d'audit |
| 11 | Settings | Account + security info | Sidebar → SYSTÈME → Paramètres |

## 5. Mobile Strategy

Per directive §29-30:

### Breakpoints
| Viewport | Tailwind | Layout |
|---|---|---|
| 360px | (default) | Single column, stacked cards, full-screen dialogs |
| 390px | `sm` | Same as 360 + slightly more padding |
| 430px | — | Same |
| 768px | `md` | 2-column grids, sidebar visible |
| 1024px | `lg` | Full desktop layout |
| 1280px | `xl` | Wider content area |
| 1440px | `2xl` | Max-width container |

### Mobile-specific Interactions

| Component | Desktop | Mobile |
|---|---|---|
| Sidebar | Fixed w-56 | Collapsed w-16 OR hamburger drawer |
| Tables | Full table | Cards (each row → card) |
| Edit dialogs | max-w-2xl centered | Full-screen |
| Filters | Inline filter bar | Bottom sheet OR collapsible |
| Status dropdown | Inline Select | Bottom sheet |
| Notes drawer | Dialog | Bottom sheet |
| Tab navigation | Horizontal tabs | Horizontal scrollable tabs |
| Delete confirmation | Dialog | Bottom sheet |

### No Horizontal Overflow
- All screens fit within 360px
- Tables convert to cards on <768px
- Audit log table: horizontally scrollable (6 columns too wide)
- Dialogs: full-screen on <640px

### Touch Targets
- Minimum 44×44px (WCAG 2.2 enhanced)
- Buttons: `h-7` (28px) on tables, `h-9` (36px) on forms, `h-10` (40px) primary
- Switches: standard shadcn Switch (44px tap target)

## 6. Accessibility (WCAG 2.2 AA Target)

### Implemented
- Skip-to-content link (`sr-only focus:not-sr-only`)
- Semantic HTML (`main`, `header`, `nav`, `section`, `article`)
- ARIA labels on interactive elements
- Keyboard navigation (Tab + Enter)
- Alt text on all images (with "manquant" warning in admin)
- `prefers-reduced-motion` support

### Future Work
- Form error announcements (`aria-live="polite"`)
- Modal focus trap (focus stays within dialog)
- Color contrast audit (verify AA compliance)
- Screen reader testing (NVDA/VoiceOver)
- Table semantics (`<th scope="col">`, `caption`)

### Do Not Use Color Alone
- Status badges have text labels (not just colors)
- Validation checklist uses ✓/⚠/✕ symbols (not just colors)
- Toggle switches have text labels next to them

## 7. Empty States

Every list/screen must have a clear empty state:

| Screen | Empty State Message |
|---|---|
| Projects | "Aucun projet. Créez votre premier projet." + [Create button] |
| Apartments | "Aucun appartement. Créez votre premier appartement." |
| Media Library | "Aucun média. Téléversez votre première image." |
| Leads | "Aucun lead pour le moment." |
| Users | "Aucun utilisateur." |
| Audit Log | "Aucune entrée dans le journal." |
| Dashboard alerts | (hidden — no empty state needed) |

## 8. Loading States

| Component | Loading State |
|---|---|
| Tables | `<Loader2 className="animate-spin" />` centered |
| Media grid | Skeleton grid |
| Edit dialog | Spinner while fetching full entity data |
| Save button | `<Loader2 className="animate-spin" />` + "Enregistrement..." |
| Upload | Progress bar (XHR `upload.onprogress`) |
| Dashboard | Per-card spinner |

**Rule**: Never leave a skeleton loading forever. Set a timeout + error state.

## 9. Error States

| Error | Display |
|---|---|
| API 401 | Redirect to login |
| API 403 | Red banner: "Privilèges insuffisants" |
| API 404 | "Introuvable" |
| API 500 | "Erreur serveur. [Actualiser]" |
| Network error | "Échec de connexion. Vérifiez votre réseau." |
| Validation error | Inline red text below field |
| Upload error | Red banner with reason (MIME/size/magic-bytes) |

**Rule**: Errors must be actionable. Not "Error occurred" but "Fichier trop volumineux: 15MB. Maximum: 8MB."
