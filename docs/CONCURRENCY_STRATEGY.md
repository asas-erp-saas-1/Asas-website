# CONCURRENCY_STRATEGY.md — Optimistic Locking

> **Phase 3 Step 16 — Preventing Silent Overwrites**

## 1. Problem

Two admins editing the same apartment simultaneously:

```
Admin A: opens apartment A-101 (price=12,000,000)
Admin B: opens apartment A-101 (price=12,000,000)
Admin A: changes price to 12,500,000 → saves
Admin B: changes status to SOLD → saves (overwrites price back to 12,000,000!)
```

Admin A's price change is silently lost.

## 2. Solution: Optimistic Concurrency Control

### Add `version` field to Project + Apartment:

```prisma
model Project {
  // ... existing fields
  version Int @default(0)
}

model Apartment {
  // ... existing fields
  version Int @default(0)
}
```

### Update flow:

```sql
UPDATE apartments
SET price = $1, status = $2, version = version + 1, updated_at = NOW()
WHERE id = $3 AND version = $4
RETURNING *;
-- If 0 rows returned → concurrent modification detected
```

### Application-level implementation:

```typescript
// In PUT /api/admin/apartments/[slug]
const updated = await db.apartment.updateMany({
  where: { slug, version: body._version },
  data: { ...updateData, version: { increment: 1 } },
});
if (updated.count === 0) {
  return NextResponse.json(
    { error: 'Cet appartement a été modifié par un autre utilisateur. Veuillez recharger et réessayer.' },
    { status: 409 }
  );
}
```

### Client-side handling:

```typescript
// In ApartmentEditForm save()
const res = await fetch(`/api/admin/apartments/${apartment.slug}`, {
  method: 'PUT',
  body: JSON.stringify({ ...payload, _version: form.version }),
});
if (res.status === 409) {
  setError('Cet appartement a été modifié par un autre utilisateur. Veuillez recharger.');
  // Show "Reload" button → refetch data
}
```

## 3. Conflict Resolution UX

When conflict detected:

```
┌──────────────────────────────────────────────────────┐
│ ⚠ Conflit de modification                              │
│                                                        │
│ Cet appartement a été modifié par un autre             │
│ utilisateur pendant que vous l'éditiez.               │
│                                                        │
│ Vos modifications n'ont pas été sauvegardées.          │
│                                                        │
│ [Recharger] [Voir les différences] [Forcer ma version] │
└──────────────────────────────────────────────────────┘
```

- **Recharger**: Discard local changes, refetch from server
- **Voir les différences**: Show diff between local and server (future — needs fetch + compare)
- **Forcer ma version**: Override server version (ADMIN only — uses service role)

## 4. Transaction Strategy (Step 17)

### Operations requiring atomicity:

| Operation | Entities | Why transaction |
|---|---|---|
| Create project + buildings | Project + Building | Building needs project FK |
| Publish project + validate | Project (read + update) | Read-validate-then-write |
| Change price + audit log + (price history) | Apartment + AuditLog + PriceHistory | All must succeed or none |
| Delete media + remove file | Media DB row + file on disk | Best-effort (file deletion may fail) |
| User role change + audit log | AdminUser + AuditLog | Atomic |

### Implementation:

```typescript
import { db } from '@/lib/db';

// Price change with audit log (atomic)
await db.$transaction(async (tx) => {
  const updated = await tx.apartment.update({
    where: { slug, version: body._version },
    data: { price: newPrice, version: { increment: 1 } },
  });

  await tx.auditLog.create({
    data: {
      actorEmail: session.email,
      actorRole: session.role,
      action: 'PRICE_CHANGE',
      entityType: 'Apartment',
      entityId: updated.id,
      before: JSON.stringify({ price: oldPrice }),
      after: JSON.stringify({ price: newPrice }),
    },
  });

  // If PriceHistory table exists:
  await tx.priceHistory.create({
    data: { apartmentId: updated.id, oldPrice, newPrice, changedBy: session.email },
  });
});
```

## 5. Sandbox Status

**Current**: No `version` field on Project/Apartment. No optimistic locking.
**Target**: Add `version` field when migrating to PostgreSQL + implement in PUT handlers.
**Current risk**: Low (single admin user typically active at once in dev).
**Production risk**: MEDIUM (multiple ASAS employees may edit simultaneously).

**Decision**: Document the strategy. Implement `version` field + 409 conflict response when migrating to PostgreSQL.
