# Iso's Art Commissions

A website template with user login, hosted on GitHub Pages using Firebase Authentication.

---

## How to set up your own copy

You'll do everything in a web browser — no technical skills required. Follow each step in order.

---

### Step 1: Fork this repo

1. Make sure you're signed in to GitHub
2. Click the **Fork** button near the top-right of this page
3. Click **Create fork**

You now have your own copy of this repo.

---

### Step 2: Enable GitHub Pages

1. In your forked repo, click **Settings** (top menu)
2. In the left sidebar, click **Pages**
3. Under "Branch", select **main** from the dropdown, then click **Save**
4. Wait about 1 minute, then refresh the page
5. You'll see a message: *"Your site is live at https://YOUR-USERNAME.github.io/isos-art-commissions/"*

Keep that URL — that's your website address.

---

### Step 3: Create a Firebase project

1. Go to [https://firebase.google.com](https://firebase.google.com) and sign in with a Google account
2. Click **Go to console** (top right)
3. Click **Add project**
4. Enter a project name (e.g. `isos-art-commissions`) and click **Continue**
5. You can turn off Google Analytics — click the toggle, then **Create project**
6. Wait for it to finish, then click **Continue**

---

### Step 4: Register your website with Firebase

1. In your Firebase project, click the **web icon** (`</>`) to add a web app
2. Enter a nickname (e.g. `my-site`) — you don't need to check "Firebase Hosting"
3. Click **Register app**
4. You'll see a block of code containing your config values — **keep this page open**, you'll need it in Step 6

---

### Step 5: Enable login methods

1. In the left sidebar of Firebase console, click **Authentication**
2. Click **Get started**
3. Click **Email/Password**, toggle it on, and click **Save**
4. Go back and click **Google**, toggle it on, add your email as support email, and click **Save**

---

### Step 6: Add your Firebase config to the repo

1. Go back to your forked GitHub repo
2. Click on the file `js/firebase-config.js`
3. Click the **pencil icon** (Edit this file) near the top right
4. Replace each placeholder value with the matching value from your Firebase config:

   | Placeholder | Replace with |
   |-------------|-------------|
   | `PASTE-YOUR-API-KEY-HERE` | your `apiKey` value |
   | `PASTE-YOUR-AUTH-DOMAIN-HERE` | your `authDomain` value |
   | `PASTE-YOUR-PROJECT-ID-HERE` | your `projectId` value |
   | `PASTE-YOUR-STORAGE-BUCKET-HERE` | your `storageBucket` value |
   | `PASTE-YOUR-MESSAGING-SENDER-ID-HERE` | your `messagingSenderId` value |
   | `PASTE-YOUR-APP-ID-HERE` | your `appId` value |

5. Click **Commit changes**, then **Commit changes** again

---

### Step 7: Set up Security Rules

This step protects your users' data so only they can access it.

1. In Firebase console, click **Authentication** → **Settings** → scroll to **Authorized domains**
2. Click **Add domain** and enter your GitHub Pages URL (e.g. `YOUR-USERNAME.github.io`) — just the domain, no `https://`
3. Click **Add**

---

### Step 8: Verify it works

1. Visit your GitHub Pages URL (from Step 2)
2. Try creating an account with **Sign Up**
3. Try signing in with **Google**
4. You should see a welcome message when logged in

If anything isn't working, double-check that all 6 values in `firebase-config.js` were replaced correctly (no leftover `PASTE-YOUR-...` text).

---

## Need help?

Contact the repo owner for support.
