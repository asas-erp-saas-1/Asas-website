# ASAS ADMIN DEVICE EXPERIENCE MATRIX

**Status:** Target contract derived from the 2026-09-04 forensic audit.  
**This document is not a claim of completed visual verification.**

## Device Philosophy

- Mobile: **Hybrid operational subset**
- Tablet: **Hybrid adaptive workspace**
- Desktop: **Full operational workspace**
- Ultra-wide: **bounded dense workspace**

## Mobile

### 360×800

Show:
- compact admin header;
- current workspace;
- primary action;
- search;
- priority filters;
- primary entity data;
- essential row/card actions.

Transform:
- sidebar → drawer;
- tables → cards;
- long editors → full-screen;
- advanced filters → collapsible/sheet;
- secondary metadata → detail view.

Rules:
- no horizontal page overflow;
- 44px operational hit areas;
- no hover-only actions;
- sticky UI must not obscure focus.

### 375×812

Same functional model as 360×800.

Use the additional width for spacing, not additional mandatory columns.

### 390×844

Same mobile model.

Allow:
- slightly richer cards;
- two-column micro-layouts for compact metadata;
- full-width primary actions.

### 414×896

Same mobile model.

Allow:
- richer entity summaries;
- secondary action row where it remains touch-safe.

### 430×932

Same mobile model.

Do not revert to desktop tables merely because width is larger.

## Tablet

### 768×1024

- hybrid sidebar/drawer;
- touch-first controls;
- cards for dense operational entities where necessary;
- selective table use;
- two-column form groups only when labels and inputs remain clear.

### 820×1180

- hybrid;
- wider filter rows;
- table/card decision by workspace;
- persistent contextual header.

### 834×1194

- hybrid;
- more metadata may be visible;
- maintain touch target contract.

### 1024×1366

- desktop-like hybrid;
- dense tables become appropriate;
- dialogs can become centered panels;
- navigation can remain persistent;
- touch targets remain touch-safe.

## Desktop

### 1280×720

Primary concern: vertical efficiency.

- compact header;
- dense table;
- restrained card padding;
- avoid large dashboard blocks;
- preserve visible primary action.

### 1366×768

Primary operational desktop baseline.

- sidebar;
- bounded content;
- dense tables;
- multi-column filters;
- contextual row actions.

### 1440×900

Reference desktop.

- balanced density;
- 1200–1500px bounded workspace where appropriate;
- two-column dashboard sections;
- readable table rows.

### 1536×864

Do not expand every component.

Use additional width for:
- table columns;
- contextual detail;
- side panels.

### 1920×1080

Use bounded workspace.

Do not create:
- oversized empty margins;
- stretched cards;
- extremely long text lines.

### 2560×1440

Ultra-wide mode:

- hard content max-width;
- optional split detail panel;
- dense table remains centered;
- no uncontrolled stretching.

## Orientation

### Phone portrait

Default operational mode.

### Phone landscape

Preserve functionality; do not force reorientation.

Use:
- compact header;
- horizontal content where semantically required;
- no destructive action placement near accidental touch zones.

### Tablet portrait

Hybrid mobile/tablet.

### Tablet landscape

Hybrid desktop/tablet.

## Input Contract

### Mouse

- hover may reveal secondary affordances;
- hover must never be the only access path;
- row actions remain keyboard reachable.

### Trackpad

- preserve scrolling;
- avoid hover-only menus that disappear during pointer movement;
- generous targets.

### Touch

- 44px operational hit areas;
- no hover dependency;
- no drag-only critical actions;
- obvious press states.

### Keyboard

Primary workflows must be completable through:

Tab → Enter/Space → Escape → arrow/select semantics.

### Screen reader

Required:

- meaningful landmarks;
- labelled controls;
- dialog name;
- status/error announcements;
- current navigation item;
- table headers;
- form errors.

## Workspace Device Rules

| Workspace | Mobile | Tablet | Desktop |
|---|---|---|---|
| Dashboard | KPI stack + attention queue | 2-column adaptive | bounded multi-section dashboard |
| Projects | cards | hybrid cards/table | dense table |
| Apartments | cards | hybrid | dense table |
| Buildings | cards | hybrid | table |
| Leads | triage cards | hybrid | pipeline table |
| Media | media grid + upload sheet | grid + detail | grid + metadata panel |
| Users | cards/list | hybrid | table |
| Audit | prioritized rows / horizontal audit table | table | dense table |
| Settings | stacked sections | stacked/two-column | bounded settings panel |

## Device Failure Tests

Every device contract must be checked for:

- slow network;
- API error;
- session expiry;
- double tap;
- duplicate submit;
- refresh during mutation;
- back during mutation;
- long names;
- long French text;
- Arabic text;
- mixed RTL/LTR;
- empty dataset;
- large dataset;
- no search results;
- no filter results.

## Device Certification Rule

A viewport is **CERTIFIED** only when:

1. build is green;
2. runtime loads;
3. primary workflow works;
4. no page-level horizontal overflow;
5. keyboard/focus behavior is acceptable where applicable;
6. mutation/recovery behavior is verified;
7. screenshot/evidence is retained.

Until then, status is **UNVERIFIED**.
