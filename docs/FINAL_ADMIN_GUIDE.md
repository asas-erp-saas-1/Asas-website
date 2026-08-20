# FINAL_ADMIN_GUIDE.md — ASAS Real Estate CMS

> **Final Admin Guide — for non-technical ASAS employees**

## Quick Start
1. Go to `/#/admin`
2. Login: `admin@asas.dz` / `admin123`
3. Session valid 8 hours

## Sidebar Navigation
- **Tableau de Bord** — stats + content health + recent items
- **CATALOGUE > Projets** — create/edit/publish/archive projects
- **CATALOGUE > Appartements** — create/edit/publish/archive apartments
- **CATALOGUE > Bâtiments** — manage buildings
- **MÉDIAS > Médiathèque** — upload/edit/delete/replace images + manage videos
- **VENTES > Leads** — 7-stage pipeline + inline status + notes
- **SYSTÈME > Utilisateurs** — manage admin accounts (ADMIN-only)
- **SYSTÈME > Journal d'audit** — view all mutations
- **SYSTÈME > Paramètres** — account info + security summary

## Common Tasks
- **Create project**: Dashboard → + Nouveau Projet → fill → Create (starts as DRAFT)
- **Edit project**: Projets → Modifier → 6 tabs → Sauvegarder
- **Upload image**: Médiathèque → pick entity + type → drag file → Téléverser
- **Change price**: Appartements → Modifier → Prix tab → change → Sauvegarder → Confirm dialog
- **Publish**: Edit → Publication tab → check pre-publish checklist → toggle Publié → Save
- **Preview**: Edit → Publication tab → Aperçu sur le site
- **Handle lead**: Leads → change status inline → Notes → add follow-up

## Rate Limiting
- 5 login attempts per minute (6th = 429 error)
- 10 failed attempts → 15-minute lockout
