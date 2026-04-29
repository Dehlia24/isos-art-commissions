# Admin & Client Dashboard Design

**Date:** 2026-04-29  
**Project:** Iso's Art Commissions (GitHub Pages + Firebase)

---

## Overview

After a user logs in on `index.html`, they are routed to one of two dashboards based on whether their UID exists in the Firestore `admins` collection. Admins (Iso and any co-admins she adds) go to `admin.html`; all other authenticated users go to `client.html`.

---

## Architecture

### File Structure

```
index.html              ← login page (existing, minor routing update)
admin.html              ← new: admin dashboard
client.html             ← new: client dashboard
css/style.css           ← shared styles (existing, brand colors #9d9ce7 / #f64691)
js/firebase-config.js   ← unchanged
js/auth.js              ← updated: post-login admin check + redirect
js/admin.js             ← new: admin dashboard logic
js/client.js            ← new: client dashboard logic
```

### Login Flow

1. User authenticates on `index.html` (email/password or Google)
2. `auth.js` queries Firestore: does a document exist at `admins/{uid}`?
3. **Yes →** redirect to `admin.html`
4. **No →** redirect to `client.html`
5. `admin.html` and `client.html` each guard on load: if no authenticated user, redirect to `index.html`; if wrong role (non-admin on admin page), redirect to `client.html`

### Firebase Services

| Service | Purpose |
|---------|---------|
| Auth | Login (already configured) |
| Firestore | Admin list, commissions, messages |
| Storage | Art file uploads |

---

## Data Model (Firestore)

### `admins/{uid}`
| Field | Type | Notes |
|-------|------|-------|
| `email` | string | For display in admin list UI |

### `commissions/{commissionId}`
| Field | Type | Notes |
|-------|------|-------|
| `clientUID` | string | Owner's Firebase Auth UID |
| `clientEmail` | string | For display in admin view |
| `title` | string | Short name of the commission |
| `description` | string | What was requested |
| `status` | string | `"pending"` \| `"in_progress"` \| `"done"` |
| `artUrls` | string[] | Firebase Storage URLs or external links |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | Updated on any status/art/message change |

### `users/{uid}`
| Field | Type | Notes |
|-------|------|-------|
| `email` | string | Written on every login; used by admin to look up UID by email |

Written by `auth.js` on every successful login using `setDoc` with `merge: true`. This is how the "Add admin by email" feature resolves an email to a UID without a server.

### `commissions/{commissionId}/messages/{messageId}`
| Field | Type | Notes |
|-------|------|-------|
| `authorUID` | string | |
| `authorEmail` | string | For display |
| `isAdmin` | boolean | True if sent by an admin |
| `text` | string | Message body |
| `createdAt` | timestamp | |

---

## Firestore Security Rules

```
users/
  - Read own: authenticated user where uid == their own uid
  - Write own: authenticated user (written on login)
  - Read all: admins only (for email lookup when adding new admins)

admins/
  - Read own document: any authenticated user (needed so auth.js can check if the current user is an admin)
  - Read all + write: admins only

commissions/
  - Read all: admins only
  - Read own: authenticated user where clientUID == request.auth.uid
  - Create: any authenticated user (client submitting a request)
  - Update/delete: admins only

commissions/{id}/messages/
  - Read all on commission: admins + the commission's client
  - Create: admins + the commission's client
  - Update/delete: admins only
```

---

## Admin Dashboard (`admin.html` + `js/admin.js`)

### Layout
- **Header:** "Iso's Art Commissions — Admin" | logged-in email | Sign Out
- **Tabs:** All Commissions | Manage Admins
- **All Commissions tab:**
  - Status filter buttons: All / Pending / In Progress / Done
  - "+ New Commission" button
  - List of commission rows: title, client email, status badge, last updated, "View →" link
  - Clicking "View →" opens a commission detail panel (inline or modal):
    - Title, description, client email
    - Status dropdown (Pending / In Progress / Done) — saves on change
    - Art section: upload file button + paste URL field; displays thumbnails/links for existing art
    - Message thread: chronological, Iso's messages styled differently from client's; text input + send
- **Manage Admins tab:**
  - List of current admins (email + remove button)
  - "Add admin by email" input + Add button: queries `users` collection for a document where `email == input`, gets that document's ID (the UID), writes `{email}` to `admins/{uid}`

### Behaviors
- Commission list updates in real time (Firestore `onSnapshot`)
- Status changes save immediately to Firestore
- Art upload goes to Firebase Storage at `commissions/{id}/{filename}`; URL written to `artUrls`
- Pasted URLs appended to `artUrls` directly
- New commission form: client email (required), title (required), description, initial status defaults to "pending"

---

## Client Dashboard (`client.html` + `js/client.js`)

### Layout
- **Header:** "Iso's Art Commissions" | logged-in email | Sign Out
- **Toolbar:** "My Commissions" heading | "+ Request Commission" button
- **Commission cards** (one per commission, sorted by updatedAt desc):
  - Title + status badge
  - Requested date + last updated date
  - If `artUrls` non-empty: thumbnail grid; clicking opens full image in new tab
  - Message thread: Iso's messages (lavender) vs. client's own (pink); text input + send button
- **Request Commission form** (shown on button click, or as a modal):
  - Title (required), description; submits → creates Firestore document with `clientUID`, `clientEmail`, status `"pending"`

### Behaviors
- Client only sees commissions where `clientUID == their UID` (enforced by security rules + query)
- Commission cards update in real time
- Message send appends to `messages` subcollection with `isAdmin: false`

---

## Out of Scope

- Email notifications (can be added later via Firebase Functions or EmailJS)
- Payment tracking
- Commission queue / waitlist
- File deletion (art URLs are append-only for now)
