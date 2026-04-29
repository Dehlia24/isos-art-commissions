# Admin & Client Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin and client dashboards so users are routed after login based on their role, with commission management, art delivery, and two-way messaging.

**Architecture:** Multi-page static site — `index.html` (login), `admin.html` (admin dashboard), `client.html` (client dashboard). After login, `auth.js` writes a user record to Firestore, checks the `admins` collection, and redirects. Each dashboard guards its own auth on load.

**Tech Stack:** Vanilla JS ES modules, Firebase 10.12.0 CDN (Auth + Firestore + Storage), GitHub Pages

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `.gitignore` | Create | Exclude `.superpowers/` |
| `css/style.css` | Modify | Add dashboard layout, commission cards, detail panel, modal, message thread styles |
| `index.html` | Modify | Add Firestore import; remove welcome panel |
| `js/auth.js` | Modify | Write `users/{uid}` on login; check `admins/{uid}`; redirect to correct dashboard |
| `admin.html` | Create | Admin dashboard HTML (header, tabs, commission list, detail panel, modals) |
| `js/admin.js` | Create | Auth guard, real-time commission list, detail panel, art upload, messaging, admin management |
| `client.html` | Create | Client dashboard HTML (header, commission cards, request form) |
| `js/client.js` | Create | Auth guard, real-time own commissions, messaging, commission request form |
| `firestore.rules` | Create | Firestore security rules (reference file — paste into Firebase console) |
| `storage.rules` | Create | Storage security rules (reference file — paste into Firebase console) |

---

## Task 0: Firebase Console Setup (manual — do this before writing code)

No code changes. Manual steps in the Firebase console.

- [ ] **Step 1: Enable Firestore**

  1. Go to [Firebase Console](https://console.firebase.google.com) → your project
  2. Left sidebar → **Firestore Database** → **Create database**
  3. Choose **Start in test mode** (you'll add real rules at the end of this plan)
  4. Pick any region → **Done**

- [ ] **Step 2: Enable Storage**

  1. Left sidebar → **Storage** → **Get started**
  2. Choose **Start in test mode** → **Next** → **Done**

- [ ] **Step 3: Bootstrap the first admin (Iso's account)**

  Iso must sign in through the site first so her UID is created in Firebase Auth, then you add her to Firestore manually.

  1. Open the live site and sign in with Iso's account
  2. Go to Firebase Console → **Authentication** → **Users** tab
  3. Find Iso's row — copy the **User UID** (long string like `abc123xyz...`)
  4. Go to **Firestore Database** → **Start collection**
  5. Collection ID: `admins`
  6. Document ID: paste Iso's UID
  7. Add a field: `email` (string) = Iso's email address → **Save**

  Iso can now log in and reach the admin dashboard. She can add other admins from within the dashboard.

---

## Task 1: Add .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

---

## Task 2: Add Dashboard CSS

**Files:**
- Modify: `css/style.css` (append — do not change existing rules)

- [ ] **Step 1: Append dashboard styles to css/style.css**

Add the following to the end of `css/style.css`:

```css
/* ── Ensure hidden attribute is respected ─────────────────── */
[hidden] { display: none !important; }

/* ── Dashboard Layout ─────────────────────────────────────── */
body.dashboard {
  display: block;
  background: #f0effc;
}

header {
  background: #9d9ce7;
  color: #fff;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-title { font-weight: 700; font-size: 1rem; }

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
}

.header-right button {
  background: #f64691;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  cursor: pointer;
  font-size: 0.8rem;
}

/* ── Tabs ─────────────────────────────────────────────────── */
.tab-bar {
  background: #fff;
  border-bottom: 2px solid #9d9ce7;
  padding: 0 24px;
  display: flex;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #9d9ce7;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.tab-btn.active {
  color: #2a2a3d;
  border-bottom-color: #9d9ce7;
  font-weight: 600;
}

.tab-content {
  padding: 20px 24px;
  max-width: 900px;
}

/* ── Toolbar ──────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-btns { display: flex; gap: 6px; flex-wrap: wrap; }

.filter-btn {
  background: #fff;
  border: 1px solid #9d9ce7;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.8rem;
  color: #9d9ce7;
  cursor: pointer;
}

.filter-btn.active { background: #9d9ce7; color: #fff; }

/* ── Commission Rows (admin list) ─────────────────────────── */
.commission-row {
  background: #fff;
  border: 1px solid #d8d8f0;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 12px;
}

.commission-row-title { font-weight: 600; font-size: 0.9rem; color: #2a2a3d; }
.commission-row-meta  { font-size: 0.75rem; color: #888; margin-top: 3px; }

.commission-row-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-view {
  background: none;
  border: none;
  color: #9d9ce7;
  cursor: pointer;
  font-size: 0.85rem;
}

/* ── Status Badges ────────────────────────────────────────── */
.status-badge {
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending     { background: #f3e5f5; color: #7b1fa2; }
.status-in_progress { background: #fff3e0; color: #e67e22; }
.status-done        { background: #e8f5e9; color: #2e7d32; }

/* ── Detail Panel ─────────────────────────────────────────── */
.detail-panel {
  position: fixed;
  top: 0; right: 0;
  width: 420px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  border-left: 2px solid #9d9ce7;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 100;
}

.detail-panel h2 { font-size: 1.1rem; color: #2a2a3d; }
.detail-panel h3 { font-size: 0.9rem; color: #9d9ce7; margin-bottom: 6px; }
.detail-panel p  { font-size: 0.85rem; color: #555; }

#btn-close-detail {
  background: none;
  border: none;
  color: #9d9ce7;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  align-self: flex-start;
}

.detail-panel select {
  border: 1px solid #9d9ce7;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 0.9rem;
  color: #2a2a3d;
}

.field-label {
  font-size: 0.75rem;
  color: #9d9ce7;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.art-section,
.messages-section {
  border-top: 1px solid #e8e8f5;
  padding-top: 12px;
}

.paste-url-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.paste-url-row input {
  flex: 1;
  border: 1px solid #9d9ce7;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 0.85rem;
  outline: none;
}

/* ── Art Gallery ──────────────────────────────────────────── */
.art-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.art-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #d8d8f0;
}

/* ── Message Thread ───────────────────────────────────────── */
.message-thread {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  padding: 4px 0;
}

.message-bubble {
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  max-width: 90%;
}

.message-bubble.admin { background: #f0effc; align-self: flex-start; }
.message-bubble.client { background: #fff0f6; border: 1px solid #fdd; align-self: flex-end; }

.message-author {
  font-weight: 600;
  display: block;
  font-size: 0.72rem;
  margin-bottom: 2px;
}

.message-bubble.admin  .message-author { color: #9d9ce7; }
.message-bubble.client .message-author { color: #f64691; }

.message-input-row {
  display: flex;
  gap: 6px;
}

.message-input-row input,
.input-message {
  flex: 1;
  border: 1px solid #9d9ce7;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 0.85rem;
  outline: none;
}

/* ── Shared action buttons ────────────────────────────────── */
.btn-primary {
  background: #f64691;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.btn-secondary {
  background: #f0effc;
  color: #9d9ce7;
  border: 1px solid #9d9ce7;
  border-radius: 4px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 0.85rem;
}

/* ── Modal ────────────────────────────────────────────────── */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 2px solid #9d9ce7;
}

.modal-box h2 { font-size: 1.1rem; color: #9d9ce7; }

.modal-box input,
.modal-box textarea {
  border: 1px solid #9d9ce7;
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 0.9rem;
  width: 100%;
  outline: none;
  font-family: inherit;
}

.modal-box textarea { min-height: 80px; resize: vertical; }

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* ── Admin management ─────────────────────────────────────── */
.admin-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #d8d8f0;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.btn-remove-admin {
  background: none;
  border: 1px solid #f64691;
  color: #f64691;
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
  font-size: 0.8rem;
}

.you-label { font-size: 0.75rem; color: #888; }

.add-admin-form {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.add-admin-form input {
  flex: 1;
  border: 1px solid #9d9ce7;
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 0.9rem;
  outline: none;
}

/* ── Commission Cards (client view) ───────────────────────── */
.commission-card {
  background: #fff;
  border: 1px solid #d8d8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.card-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0effc;
  gap: 12px;
}

.card-title { font-weight: 600; font-size: 0.9rem; color: #2a2a3d; }
.card-meta  { font-size: 0.75rem; color: #888; margin-top: 3px; }

.commission-card .art-gallery {
  padding: 10px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0effc;
}

.commission-card .messages-section {
  padding: 12px 16px;
  border-top: none;
}

/* ── Client toolbar ───────────────────────────────────────── */
.client-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.client-toolbar h2 { font-size: 1rem; color: #2a2a3d; }

/* ── Request form ─────────────────────────────────────────── */
#request-form {
  background: #fff;
  border: 2px solid #9d9ce7;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

#request-form h3 { color: #9d9ce7; font-size: 1rem; }

#request-form input,
#request-form textarea {
  border: 1px solid #9d9ce7;
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 0.9rem;
  width: 100%;
  outline: none;
  font-family: inherit;
}

#request-form textarea { min-height: 80px; resize: vertical; }

.form-actions { display: flex; gap: 8px; justify-content: flex-end; }

/* ── Utilities ────────────────────────────────────────────── */
.empty-state {
  color: #999;
  font-size: 0.85rem;
  text-align: center;
  padding: 20px 0;
}

/* Shift list content when detail panel is open */
.panel-open { margin-right: 440px; }
```

- [ ] **Step 2: Verify — open index.html in a browser, confirm existing auth panel still looks correct (no style regressions)**

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add dashboard CSS styles"
```

---

## Task 3: Update index.html and auth.js for Post-Login Routing

**Files:**
- Modify: `index.html`
- Modify: `js/auth.js`

- [ ] **Step 1: Replace the script block in index.html**

Find and replace the entire `<script type="module">` block at the bottom of `index.html` with:

```html
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
    import { firebaseConfig } from "./js/firebase-config.js";
    import { setupAuth } from "./js/auth.js";

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    setupAuth(app, db);
  </script>
```

- [ ] **Step 2: Remove the welcome panel from index.html**

Delete these lines from `index.html`:

```html
  <!-- WELCOME PANEL: shown when logged in -->
  <div id="welcome-panel" hidden>
    <h1>Iso's Art Commissions</h1>
    <p id="welcome-msg">Welcome!</p>
    <button id="btn-signout">Sign Out</button>
  </div>
```

- [ ] **Step 3: Replace the entire contents of js/auth.js**

```javascript
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export function setupAuth(app, db) {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const authPanel     = document.getElementById("auth-panel");
  const authForm      = document.getElementById("auth-form");
  const inputEmail    = document.getElementById("input-email");
  const inputPassword = document.getElementById("input-password");
  const btnSubmit     = document.getElementById("btn-submit");
  const btnGoogle     = document.getElementById("btn-google");
  const btnShowSignin = document.getElementById("btn-show-signin");
  const btnShowSignup = document.getElementById("btn-show-signup");
  const authError     = document.getElementById("auth-error");

  let mode = "signin";

  btnShowSignin.addEventListener("click", () => {
    mode = "signin";
    btnSubmit.textContent = "Sign In";
    btnShowSignin.classList.add("active");
    btnShowSignup.classList.remove("active");
    authError.textContent = "";
  });

  btnShowSignup.addEventListener("click", () => {
    mode = "signup";
    btnSubmit.textContent = "Sign Up";
    btnShowSignup.classList.add("active");
    btnShowSignin.classList.remove("active");
    authError.textContent = "";
  });

  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authError.textContent = "";
    const email = inputEmail.value.trim();
    const password = inputPassword.value;
    btnSubmit.disabled = true;
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      authError.textContent = friendlyError(err.code);
    } finally {
      btnSubmit.disabled = false;
    }
  });

  btnGoogle.addEventListener("click", async () => {
    authError.textContent = "";
    btnGoogle.disabled = true;
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        authError.textContent = friendlyError(err.code);
      }
    } finally {
      btnGoogle.disabled = false;
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      authPanel.hidden = false;
      authForm.reset();
      authError.textContent = "";
      return;
    }

    authPanel.hidden = true;

    // Write user record so admins can look up UID by email
    await setDoc(doc(db, "users", user.uid), { email: user.email }, { merge: true });

    // Route based on admin status
    const adminSnap = await getDoc(doc(db, "admins", user.uid));
    window.location.href = adminSnap.exists() ? "admin.html" : "client.html";
  });
}

function friendlyError(code) {
  const messages = {
    "auth/invalid-email":          "That doesn't look like a valid email address.",
    "auth/user-not-found":         "No account found with that email.",
    "auth/wrong-password":         "Incorrect password. Please try again.",
    "auth/email-already-in-use":   "An account with that email already exists. Try signing in.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/too-many-requests":      "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/invalid-credential":     "Incorrect email or password. Please try again.",
  };
  return messages[code] || "Something went wrong. Please try again.";
}
```

- [ ] **Step 4: Verify**

  1. Open the live site in a browser
  2. Sign in with any account
  3. The browser should redirect to `client.html` (which doesn't exist yet — a 404 is expected at this stage)
  4. Open DevTools → Console: confirm no JS errors during login

- [ ] **Step 5: Commit**

```bash
git add index.html js/auth.js
git commit -m "feat: add Firestore routing on login"
```

---

## Task 4: Create admin.html

**Files:**
- Create: `admin.html`

- [ ] **Step 1: Create admin.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin — Iso's Art Commissions</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="dashboard">

  <header>
    <span class="site-title">Iso's Art Commissions — Admin</span>
    <div class="header-right">
      <span id="admin-email"></span>
      <button id="btn-signout">Sign Out</button>
    </div>
  </header>

  <nav class="tab-bar">
    <button class="tab-btn active" data-tab="commissions">All Commissions</button>
    <button class="tab-btn" data-tab="admins">Manage Admins</button>
  </nav>

  <!-- Commissions Tab -->
  <div id="tab-commissions" class="tab-content">
    <div class="toolbar">
      <div class="filter-btns">
        <button class="filter-btn active" data-status="all">All</button>
        <button class="filter-btn" data-status="pending">Pending</button>
        <button class="filter-btn" data-status="in_progress">In Progress</button>
        <button class="filter-btn" data-status="done">Done</button>
      </div>
      <button id="btn-new-commission" class="btn-primary">+ New Commission</button>
    </div>
    <div id="commission-list"></div>
  </div>

  <!-- Manage Admins Tab -->
  <div id="tab-admins" class="tab-content" hidden>
    <h3 style="margin-bottom:12px;color:#9d9ce7;">Current Admins</h3>
    <div id="admin-list"></div>
    <div class="add-admin-form">
      <input type="email" id="input-admin-email" placeholder="Email address" />
      <button id="btn-add-admin" class="btn-primary">Add Admin</button>
    </div>
    <p id="admin-error" class="error-msg"></p>
  </div>

  <!-- Commission Detail Panel (fixed right side) -->
  <div id="detail-panel" class="detail-panel" hidden>
    <button id="btn-close-detail">← Back to list</button>
    <h2 id="detail-title"></h2>
    <p id="detail-client"></p>
    <p id="detail-description"></p>

    <div>
      <div class="field-label">Status</div>
      <select id="detail-status">
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>

    <div class="art-section">
      <h3>Art</h3>
      <div class="art-gallery" id="art-gallery"></div>
      <input type="file" id="input-art-upload" accept="image/*" multiple style="font-size:0.8rem;margin-bottom:6px;" />
      <div class="paste-url-row">
        <input type="url" id="input-art-url" placeholder="Or paste an image URL" />
        <button id="btn-add-url" class="btn-primary" style="padding:5px 12px;">Add</button>
      </div>
    </div>

    <div class="messages-section">
      <h3>Messages</h3>
      <div class="message-thread" id="detail-messages"></div>
      <div class="message-input-row">
        <input type="text" id="input-message" placeholder="Write a message…" />
        <button id="btn-send-message" class="btn-primary" style="padding:6px 12px;">Send</button>
      </div>
    </div>
  </div>

  <!-- New Commission Modal -->
  <div id="modal-new-commission" class="modal" hidden>
    <div class="modal-box">
      <h2>New Commission</h2>
      <input type="email" id="nc-client-email" placeholder="Client email (required)" />
      <input type="text"  id="nc-title"        placeholder="Title (required)" />
      <textarea           id="nc-description"  placeholder="Description (optional)"></textarea>
      <div class="modal-actions">
        <button id="btn-nc-cancel" class="btn-secondary">Cancel</button>
        <button id="btn-nc-submit" class="btn-primary">Create</button>
      </div>
      <p id="nc-error" class="error-msg"></p>
    </div>
  </div>

  <script type="module" src="js/admin.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add admin.html
git commit -m "feat: add admin dashboard HTML"
```

---

## Task 5: Create js/admin.js

**Files:**
- Create: `js/admin.js`

- [ ] **Step 1: Create js/admin.js with the complete implementation**

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc, updateDoc,
  onSnapshot, query, where, orderBy, serverTimestamp, arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const storage = getStorage(app);

let currentUser       = null;
let currentCommissionId = null;
let allCommissions    = [];
let activeFilter      = "all";
let unsubMessages     = null;

// ── Auth guard ──────────────────────────────────────────────────────────────

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "index.html"; return; }
  const adminDoc = await getDoc(doc(db, "admins", user.uid));
  if (!adminDoc.exists()) { window.location.href = "client.html"; return; }
  currentUser = user;
  document.getElementById("admin-email").textContent = user.email;
  initPage();
});

// ── Page initialization ─────────────────────────────────────────────────────

function initPage() {
  document.getElementById("btn-signout").addEventListener("click", () => signOut(auth));

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(t => { t.hidden = true; });
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).hidden = false;
    });
  });

  // Status filters
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.status;
      renderCommissions();
    });
  });

  // Detail panel controls
  document.getElementById("btn-close-detail").addEventListener("click", closeDetail);

  document.getElementById("detail-status").addEventListener("change", async () => {
    if (!currentCommissionId) return;
    await updateDoc(doc(db, "commissions", currentCommissionId), {
      status: document.getElementById("detail-status").value,
      updatedAt: serverTimestamp()
    });
  });

  document.getElementById("input-art-upload").addEventListener("change", async (e) => {
    if (!currentCommissionId) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      const storageRef = ref(storage, `commissions/${currentCommissionId}/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url  = await getDownloadURL(snap.ref);
      await updateDoc(doc(db, "commissions", currentCommissionId), {
        artUrls: arrayUnion(url),
        updatedAt: serverTimestamp()
      });
    }
    e.target.value = "";
  });

  document.getElementById("btn-add-url").addEventListener("click", async () => {
    if (!currentCommissionId) return;
    const input = document.getElementById("input-art-url");
    const url = input.value.trim();
    if (!url) return;
    await updateDoc(doc(db, "commissions", currentCommissionId), {
      artUrls: arrayUnion(url),
      updatedAt: serverTimestamp()
    });
    input.value = "";
  });

  document.getElementById("btn-send-message").addEventListener("click", sendAdminMessage);
  document.getElementById("input-message").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendAdminMessage();
  });

  initNewCommissionModal();
  initManageAdmins();
  subscribeCommissions();
}

// ── Commission list ─────────────────────────────────────────────────────────

function subscribeCommissions() {
  onSnapshot(collection(db, "commissions"), (snap) => {
    allCommissions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    allCommissions.sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
    renderCommissions();
    // Keep detail panel art fresh when commission data changes
    if (currentCommissionId) {
      const c = allCommissions.find(c => c.id === currentCommissionId);
      if (c) renderArtGallery(c.artUrls || []);
    }
  });
}

function renderCommissions() {
  const list = document.getElementById("commission-list");
  const visible = activeFilter === "all"
    ? allCommissions
    : allCommissions.filter(c => c.status === activeFilter);

  if (visible.length === 0) {
    list.innerHTML = '<p class="empty-state">No commissions found.</p>';
    return;
  }

  list.innerHTML = visible.map(c => `
    <div class="commission-row">
      <div class="commission-row-info">
        <div class="commission-row-title">${esc(c.title)}</div>
        <div class="commission-row-meta">${esc(c.clientEmail)} · ${fmtDate(c.updatedAt)}</div>
      </div>
      <div class="commission-row-right">
        <span class="status-badge status-${c.status}">${statusLabel(c.status)}</span>
        <button class="btn-view" data-id="${c.id}">View →</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".btn-view").forEach(btn => {
    btn.addEventListener("click", () => openDetail(btn.dataset.id));
  });
}

// ── Commission detail panel ─────────────────────────────────────────────────

function openDetail(id) {
  const c = allCommissions.find(c => c.id === id);
  if (!c) return;
  currentCommissionId = id;

  document.getElementById("detail-title").textContent       = c.title;
  document.getElementById("detail-client").textContent      = "Client: " + c.clientEmail;
  document.getElementById("detail-description").textContent = c.description || "";
  document.getElementById("detail-status").value            = c.status;
  renderArtGallery(c.artUrls || []);

  if (unsubMessages) unsubMessages();
  unsubMessages = onSnapshot(
    query(collection(db, "commissions", id, "messages"), orderBy("createdAt", "asc")),
    (snap) => renderMessages(snap.docs.map(d => d.data()))
  );

  document.getElementById("detail-panel").hidden = false;
  document.getElementById("tab-commissions").classList.add("panel-open");
}

function closeDetail() {
  if (unsubMessages) { unsubMessages(); unsubMessages = null; }
  currentCommissionId = null;
  document.getElementById("detail-panel").hidden = true;
  document.getElementById("tab-commissions").classList.remove("panel-open");
}

function renderArtGallery(urls) {
  const gallery = document.getElementById("art-gallery");
  gallery.innerHTML = urls.length
    ? urls.map(url => `
        <a href="${esc(url)}" target="_blank" rel="noopener">
          <img src="${esc(url)}" alt="Commission art" class="art-thumb"
               onerror="this.parentElement.style.display='none'" />
        </a>`).join("")
    : '<p class="empty-state">No art yet.</p>';
}

function renderMessages(msgs) {
  const el = document.getElementById("detail-messages");
  el.innerHTML = msgs.length
    ? msgs.map(m => `
        <div class="message-bubble ${m.isAdmin ? "admin" : "client"}">
          <span class="message-author">${m.isAdmin ? "Iso" : esc(m.authorEmail)}</span>
          ${esc(m.text)}
        </div>`).join("")
    : '<p class="empty-state">No messages yet.</p>';
  el.scrollTop = el.scrollHeight;
}

async function sendAdminMessage() {
  if (!currentCommissionId) return;
  const input = document.getElementById("input-message");
  const text  = input.value.trim();
  if (!text) return;
  input.value = "";
  await addDoc(collection(db, "commissions", currentCommissionId, "messages"), {
    authorUID:   currentUser.uid,
    authorEmail: currentUser.email,
    isAdmin:     true,
    text,
    createdAt:   serverTimestamp()
  });
  await updateDoc(doc(db, "commissions", currentCommissionId), { updatedAt: serverTimestamp() });
}

// ── New Commission Modal ────────────────────────────────────────────────────

function initNewCommissionModal() {
  const modal   = document.getElementById("modal-new-commission");
  const errorEl = document.getElementById("nc-error");

  document.getElementById("btn-new-commission").addEventListener("click", () => {
    modal.hidden = false;
  });

  document.getElementById("btn-nc-cancel").addEventListener("click", () => {
    modal.hidden = true;
    errorEl.textContent = "";
  });

  document.getElementById("btn-nc-submit").addEventListener("click", async () => {
    const email       = document.getElementById("nc-client-email").value.trim();
    const title       = document.getElementById("nc-title").value.trim();
    const description = document.getElementById("nc-description").value.trim();
    errorEl.textContent = "";

    if (!email || !title) {
      errorEl.textContent = "Client email and title are required.";
      return;
    }

    const usersSnap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
    if (usersSnap.empty) {
      errorEl.textContent = "No account found for this email. Ask the client to sign up first.";
      return;
    }

    const clientUID = usersSnap.docs[0].id;
    await addDoc(collection(db, "commissions"), {
      clientUID,
      clientEmail: email,
      title,
      description,
      status:    "pending",
      artUrls:   [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    modal.hidden = true;
    document.getElementById("nc-client-email").value = "";
    document.getElementById("nc-title").value        = "";
    document.getElementById("nc-description").value  = "";
  });
}

// ── Manage Admins ───────────────────────────────────────────────────────────

function initManageAdmins() {
  onSnapshot(collection(db, "admins"), (snap) => {
    const list   = document.getElementById("admin-list");
    const admins = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    list.innerHTML = admins.length
      ? admins.map(a => `
          <div class="admin-row">
            <span>${esc(a.email)}</span>
            ${a.uid === currentUser.uid
              ? '<span class="you-label">(you)</span>'
              : `<button class="btn-remove-admin" data-uid="${a.uid}">Remove</button>`}
          </div>`).join("")
      : '<p class="empty-state">No admins found.</p>';

    list.querySelectorAll(".btn-remove-admin").forEach(btn => {
      btn.addEventListener("click", () => deleteDoc(doc(db, "admins", btn.dataset.uid)));
    });
  });

  const errorEl = document.getElementById("admin-error");

  document.getElementById("btn-add-admin").addEventListener("click", async () => {
    const email = document.getElementById("input-admin-email").value.trim();
    errorEl.textContent = "";
    if (!email) return;

    const usersSnap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
    if (usersSnap.empty) {
      errorEl.textContent = "No account found for this email. They need to sign up first.";
      return;
    }

    const uid = usersSnap.docs[0].id;
    await setDoc(doc(db, "admins", uid), { email });
    document.getElementById("input-admin-email").value = "";
  });
}

// ── Utilities ───────────────────────────────────────────────────────────────

function esc(str) {
  if (!str) return "";
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function statusLabel(s) {
  return { pending: "Pending", in_progress: "In Progress", done: "Done" }[s] || s;
}

function fmtDate(ts) {
  if (!ts) return "—";
  return (ts.toDate ? ts.toDate() : new Date(ts))
    .toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
```

- [ ] **Step 2: Verify**

  1. Push to GitHub, open the live site, sign in as the admin (Iso's account)
  2. Confirm redirect to `admin.html`
  3. Confirm commission list renders (empty state is fine)
  4. Confirm status filter buttons work
  5. Click "+ New Commission" — modal should open
  6. Create a test commission using a client email that has signed up
  7. Click "View →" on the commission — detail panel should open on the right
  8. Change the status dropdown — verify it saves in Firestore (check Firebase Console)
  9. Send a message — verify it appears in the thread
  10. Open DevTools → Console: confirm no JS errors

- [ ] **Step 3: Commit**

```bash
git add js/admin.js
git commit -m "feat: add admin dashboard logic"
```

---

## Task 6: Create client.html

**Files:**
- Create: `client.html`

- [ ] **Step 1: Create client.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Iso's Art Commissions</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="dashboard">

  <header>
    <span class="site-title">Iso's Art Commissions</span>
    <div class="header-right">
      <span id="client-email"></span>
      <button id="btn-signout">Sign Out</button>
    </div>
  </header>

  <div style="padding:20px 24px;max-width:760px;">
    <div class="client-toolbar">
      <h2>My Commissions</h2>
      <button id="btn-request" class="btn-primary">+ Request Commission</button>
    </div>

    <!-- Request Commission Form -->
    <div id="request-form" hidden>
      <h3>New Commission Request</h3>
      <input type="text" id="rf-title"
             placeholder="What would you like? (required)" />
      <textarea id="rf-description"
                placeholder="Tell Iso more — character description, style, references, etc."></textarea>
      <div class="form-actions">
        <button id="btn-rf-cancel" class="btn-secondary">Cancel</button>
        <button id="btn-rf-submit" class="btn-primary">Submit Request</button>
      </div>
      <p id="rf-error" class="error-msg"></p>
    </div>

    <div id="commission-list"></div>
  </div>

  <script type="module" src="js/client.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add client.html
git commit -m "feat: add client dashboard HTML"
```

---

## Task 7: Create js/client.js

**Files:**
- Create: `js/client.js`

- [ ] **Step 1: Create js/client.js with the complete implementation**

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, doc, addDoc, setDoc,
  onSnapshot, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

let currentUser     = null;
let messageUnsubs   = {};

// ── Auth guard ──────────────────────────────────────────────────────────────

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "index.html"; return; }
  currentUser = user;
  // Keep user record fresh in case client arrives via direct link
  await setDoc(doc(db, "users", user.uid), { email: user.email }, { merge: true });
  document.getElementById("client-email").textContent = user.email;
  initPage();
});

// ── Page initialization ─────────────────────────────────────────────────────

function initPage() {
  document.getElementById("btn-signout").addEventListener("click", () => signOut(auth));
  initRequestForm();
  subscribeCommissions();
}

// ── Commission list ─────────────────────────────────────────────────────────

function subscribeCommissions() {
  const q = query(
    collection(db, "commissions"),
    where("clientUID", "==", currentUser.uid)
  );

  onSnapshot(q, (snap) => {
    const commissions = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
    renderCommissions(commissions);
  });
}

function renderCommissions(commissions) {
  const list = document.getElementById("commission-list");

  // Tear down old message listeners before re-render
  Object.values(messageUnsubs).forEach(unsub => unsub());
  messageUnsubs = {};

  if (commissions.length === 0) {
    list.innerHTML = '<p class="empty-state">No commissions yet. Click "+ Request Commission" to get started!</p>';
    return;
  }

  list.innerHTML = commissions.map(c => `
    <div class="commission-card" data-id="${c.id}">
      <div class="card-header">
        <div>
          <div class="card-title">${esc(c.title)}</div>
          <div class="card-meta">Requested ${fmtDate(c.createdAt)} · Updated ${fmtDate(c.updatedAt)}</div>
        </div>
        <span class="status-badge status-${c.status}">${statusLabel(c.status)}</span>
      </div>
      ${c.artUrls && c.artUrls.length ? `
        <div class="art-gallery" style="padding:10px 16px;background:#fafafa;border-bottom:1px solid #f0effc;">
          ${c.artUrls.map(url => `
            <a href="${esc(url)}" target="_blank" rel="noopener">
              <img src="${esc(url)}" alt="Commission art" class="art-thumb"
                   onerror="this.parentElement.style.display='none'" />
            </a>`).join("")}
        </div>` : ""}
      <div class="messages-section" style="padding:12px 16px;">
        <div class="message-thread" id="thread-${c.id}"></div>
        <div class="message-input-row" style="margin-top:8px;">
          <input class="input-message" data-id="${c.id}" type="text" placeholder="Write a message…" />
          <button class="btn-send btn-primary" data-id="${c.id}" style="padding:6px 12px;">Send</button>
        </div>
      </div>
    </div>
  `).join("");

  // Attach send handlers
  list.querySelectorAll(".btn-send").forEach(btn => {
    btn.addEventListener("click", () => sendMessage(btn.dataset.id));
  });
  list.querySelectorAll(".input-message").forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage(input.dataset.id);
    });
  });

  // Subscribe to messages for each commission
  commissions.forEach(c => {
    const q = query(
      collection(db, "commissions", c.id, "messages"),
      orderBy("createdAt", "asc")
    );
    messageUnsubs[c.id] = onSnapshot(q, (snap) => {
      const thread = document.getElementById("thread-" + c.id);
      if (!thread) return;
      const msgs = snap.docs.map(d => d.data());
      thread.innerHTML = msgs.length
        ? msgs.map(m => `
            <div class="message-bubble ${m.isAdmin ? "admin" : "client"}">
              <span class="message-author">${m.isAdmin ? "Iso" : "You"}</span>
              ${esc(m.text)}
            </div>`).join("")
        : '<p class="empty-state">No messages yet.</p>';
      thread.scrollTop = thread.scrollHeight;
    });
  });
}

async function sendMessage(commissionId) {
  const input = document.querySelector(`.input-message[data-id="${commissionId}"]`);
  const text  = input.value.trim();
  if (!text) return;
  input.value = "";
  await addDoc(collection(db, "commissions", commissionId, "messages"), {
    authorUID:   currentUser.uid,
    authorEmail: currentUser.email,
    isAdmin:     false,
    text,
    createdAt:   serverTimestamp()
  });
  await setDoc(
    doc(db, "commissions", commissionId),
    { updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ── Request Commission Form ─────────────────────────────────────────────────

function initRequestForm() {
  const form    = document.getElementById("request-form");
  const errorEl = document.getElementById("rf-error");

  document.getElementById("btn-request").addEventListener("click", () => {
    form.hidden = false;
  });

  document.getElementById("btn-rf-cancel").addEventListener("click", () => {
    form.hidden = true;
    errorEl.textContent = "";
  });

  document.getElementById("btn-rf-submit").addEventListener("click", async () => {
    const title       = document.getElementById("rf-title").value.trim();
    const description = document.getElementById("rf-description").value.trim();
    errorEl.textContent = "";

    if (!title) {
      errorEl.textContent = "Please enter a title for your commission.";
      return;
    }

    await addDoc(collection(db, "commissions"), {
      clientUID:   currentUser.uid,
      clientEmail: currentUser.email,
      title,
      description,
      status:    "pending",
      artUrls:   [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    form.hidden = true;
    document.getElementById("rf-title").value       = "";
    document.getElementById("rf-description").value = "";
  });
}

// ── Utilities ───────────────────────────────────────────────────────────────

function esc(str) {
  if (!str) return "";
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function statusLabel(s) {
  return { pending: "Pending", in_progress: "In Progress", done: "Done" }[s] || s;
}

function fmtDate(ts) {
  if (!ts) return "—";
  return (ts.toDate ? ts.toDate() : new Date(ts))
    .toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
```

- [ ] **Step 2: Verify**

  1. Open the live site, sign in with a non-admin account
  2. Confirm redirect to `client.html`
  3. Confirm "My Commissions" heading and "+ Request Commission" button are visible
  4. Click "+ Request Commission", fill in a title, submit
  5. The new commission card should appear in the list with "Pending" badge
  6. Click into the message field and send a message — confirm it appears as a pink "You" bubble
  7. In another tab, sign in as admin, open that commission's detail panel — Iso's reply should appear in the client's thread in real time
  8. Open DevTools → Console: confirm no JS errors

- [ ] **Step 3: Commit**

```bash
git add js/client.js
git commit -m "feat: add client dashboard logic"
```

---

## Task 8: Write and Deploy Security Rules

**Files:**
- Create: `firestore.rules` (reference file — also paste into Firebase console)
- Create: `storage.rules` (reference file — also paste into Firebase console)

- [ ] **Step 1: Create firestore.rules**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // User records — written on every login
    match /users/{uid} {
      allow read:  if isSignedIn() && (request.auth.uid == uid || isAdmin());
      allow write: if isSignedIn() && request.auth.uid == uid;
    }

    // Admins collection
    match /admins/{uid} {
      // Any signed-in user can read their own doc (needed for post-login admin check)
      allow get:         if isSignedIn() && request.auth.uid == uid;
      // Only existing admins can list all admins or write
      allow list, write: if isAdmin();
    }

    // Commissions
    match /commissions/{commissionId} {
      allow read:          if isAdmin() ||
                              (isSignedIn() && resource.data.clientUID == request.auth.uid);
      allow create:        if isSignedIn();
      allow update, delete: if isAdmin();

      // Messages subcollection
      match /messages/{messageId} {
        allow read, create: if isAdmin() ||
          (isSignedIn() &&
            get(/databases/$(database)/documents/commissions/$(commissionId))
              .data.clientUID == request.auth.uid);
        allow update, delete: if isAdmin();
      }
    }
  }
}
```

- [ ] **Step 2: Create storage.rules**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /commissions/{commissionId}/{allPaths=**} {
      // Any authenticated user can view art (clients need to see their own art)
      allow read:  if request.auth != null;
      // Only admins can upload art
      allow write: if request.auth != null &&
        firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }
  }
}
```

- [ ] **Step 3: Deploy Firestore rules via Firebase console**

  1. Go to Firebase Console → **Firestore Database** → **Rules** tab
  2. Replace all existing content with the contents of `firestore.rules`
  3. Click **Publish**

- [ ] **Step 4: Deploy Storage rules via Firebase console**

  1. Go to Firebase Console → **Storage** → **Rules** tab
  2. Replace all existing content with the contents of `storage.rules`
  3. Click **Publish**

- [ ] **Step 5: Verify rules are working**

  a. Sign in as a client → confirm you can see your own commissions (not others')  
  b. Try navigating directly to `admin.html` while signed in as a client → should redirect to `client.html`  
  c. Sign in as admin → confirm you can see all commissions, upload art, manage admins  
  d. Open DevTools → Network tab → filter by "firestore" → confirm no permission-denied errors

- [ ] **Step 6: Commit**

```bash
git add firestore.rules storage.rules
git commit -m "feat: add Firestore and Storage security rules"
git push
```

---

## Done

After completing all tasks:

- Admin (Iso) logs in → `admin.html`: sees all commissions, can filter by status, open detail panel to update status, upload/link art, send messages, create commissions for clients, manage admin list
- Client logs in → `client.html`: sees only their own commissions with status, art thumbnails, two-way message thread; can submit new commission requests
- Security rules prevent clients from reading each other's commissions or accessing admin features
