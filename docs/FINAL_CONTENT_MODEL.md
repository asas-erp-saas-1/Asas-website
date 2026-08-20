# FINAL_CONTENT_MODEL.md — ASAS Real Estate Platform

> **Final Content Model — All Entities + Fields + Relationships**

## 14 Models (verified)

1. **Developer** — slug, name, nameAr, description, descriptionAr, logo, website
2. **Project** — slug, name, nameAr, tagline, description, city, district, address, lat/lng, projectType, status, startingPrice, published, archived, featured, 6 SEO fields, version (designed)
3. **Building** — slug, projectId, name, code, floors, hasElevator
4. **Apartment** — slug, projectId, buildingId, unitNumber, apartmentType, typeName, surface, floor, orientation, bedrooms, bathrooms, balconies, price, status, published, archived, 6 SEO fields, version (designed)
5. **ProjectImage** — projectId, url, alt, caption, type, order, width, height
6. **ApartmentImage** — apartmentId, url, alt, caption, type, order, width, height
7. **Video** — projectId?, apartmentId?, url?, storagePath?, thumbnailUrl?, title, description?, type, featured, published, order
8. **ProjectAmenity** — projectId, name, nameAr, icon, description
9. **Lead** — name, phone, email, intent, message, projectId, apartmentId, status (7-stage), assignedTo, followUpDate, UTM fields
10. **LeadNote** — leadId, authorEmail, body, createdAt (append-only)
11. **AdminUser** — email, name, passwordHash (bcrypt), role (ADMIN/EDITOR/VIEWER), active
12. **AuditLog** — actorEmail, actorRole, action (24 types), entityType, entityId, entitySlug, before, after, ipAddress, userAgent
13. **SiteContent** — key, value, valueAr
14. **NewsletterSubscription** — email, source, locale, status

## New Models Designed (for production)
- **PriceHistory** — apartmentId, oldPrice, newPrice, currency, changedBy, reason, createdAt
- **AnalyticsEvent** — eventName, projectId, apartmentId, sessionId, source, campaign, metadata (JSONB), createdAt

## Relationships
- Developer 1→∞ Project 1→∞ Building 1→∞ Apartment
- Project 1→∞ ProjectImage, ProjectAmenity, Video
- Apartment 1→∞ ApartmentImage, Video
- Lead 1→∞ LeadNote
- AdminUser (standalone, referenced by AuditLog.actorEmail)

## Single Source of Truth
- Price: Apartment.price (never hardcoded)
- Surface: Apartment.surface
- Status: Apartment.status
- Project name: Project.name
- Location: Project.city + district (apartment inherits)
- Hero image: ProjectImage/ApartmentImage type=hero
- SEO title: Project.seoTitle / Apartment.seoTitle (auto-gen if null)
