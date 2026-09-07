# ASAS Admin — Operational Action Registry

## Purpose

This document defines the canonical action identifiers used to connect the
operational-unit definitions with transition catalogs and workspace actions.
The registry is intentionally narrower than the product vision: an action is
listed as executable only when the current application exposes a corresponding
server capability.

## Site operations

### Project

| Canonical action ID | Operational meaning | Current transition support |
|---|---|---|
| `create` | Create project | Supported |
| `complete-information` | Complete project information | Supported |
| `add-buildings` | Add buildings to a project | Supported as contextual operation |
| `add-apartments` | Add apartments to a project | Supported as contextual operation |
| `manage-inventory` | Manage project inventory | Supported as contextual operation |
| `manage-pricing` | Manage pricing | Supported where current server field/mutation exists |
| `manage-media` | Manage project media | Supported where current media endpoint exists |
| `manage-publication` | Manage publication state | Supported through current publication mutation |
| `monitor-completeness` | Monitor available completeness signals | Read-only |

### Building

| Canonical action ID | Operational meaning | Current transition support |
|---|---|---|
| `create` | Create building | Supported |
| `associate-project` | Associate building with a project | Supported |
| `define-structure` | Define structural data | Supported where current fields exist |
| `manage-apartments` | Manage building apartments | Supported as contextual operation |
| `monitor-inventory` | Monitor building inventory | Read-only |

### Apartment

| Canonical action ID | Operational meaning | Current transition support |
|---|---|---|
| `create` | Create apartment | Supported |
| `assign-project` | Assign project | Supported |
| `assign-building` | Assign building | Supported |
| `define-physical-specs` | Define physical specifications | Supported |
| `define-commercial-data` | Define commercial data | Supported |
| `define-availability` | Define availability | Supported through supported apartment status |
| `upload-plans-media` | Upload plans/media | Supported where current media endpoint exists |
| `publish` | Publish apartment | Supported |
| `track-lifecycle` | Observe lifecycle state | Read-only |
| `unpublish` | Remove publication | Supported where `published=false` is supported |
| `archive` | Archive apartment | Supported through current delete/archive endpoint |
| `status-change` | Change operational status | Supported through current status endpoint |
| `price-change` | Change price | Supported where current price mutation exists |

## Customer operations

### Lead

| Canonical action ID | Operational meaning | Current transition support |
|---|---|---|
| `intake` | Register inbound lead | Supported |
| `qualification` | Qualify lead | Supported where current lead model exposes qualification state |
| `assignment` | Assign owner | Supported where current server mutation exists |
| `follow-up` | Schedule/manage follow-up | Supported where current server mutation exists |
| `activity-notes` | Record activities and notes | Supported where current server mutation exists |
| `property-interest` | Record project/apartment interest | Supported where current relation exists |
| `negotiation` | Negotiation stage | Only executable when current status/backend supports it |
| `reservation` | Reservation | **Not executable until confirmed reservation backend exists** |
| `conversion-loss` | Convert or mark lost | Supported where current status/backend supports it |

## Unsupported capabilities

The following remain intentionally non-executable until a real backend
contract is verified:

- reservation create/confirm/cancel/expire/convert
- contract generation/signing
- payment creation/collection
- invented availability or publication readiness states

## Contract rule

The canonical action ID must be identical across:

`Operational Unit Definition → Operational Transition → Journey Context → Workspace Action`

No adapter should silently rename an action at runtime. If a backend
capability is missing, the action must remain unavailable rather than being
represented as a UI-only success state.
