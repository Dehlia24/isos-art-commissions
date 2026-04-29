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

let currentUser   = null;
let messageUnsubs = {};

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
