import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export function setupAuth(app) {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  // DOM elements
  const authPanel    = document.getElementById("auth-panel");
  const welcomePanel = document.getElementById("welcome-panel");
  const welcomeMsg   = document.getElementById("welcome-msg");
  const authForm     = document.getElementById("auth-form");
  const inputEmail   = document.getElementById("input-email");
  const inputPassword = document.getElementById("input-password");
  const btnSubmit    = document.getElementById("btn-submit");
  const btnGoogle    = document.getElementById("btn-google");
  const btnSignout   = document.getElementById("btn-signout");
  const btnShowSignin = document.getElementById("btn-show-signin");
  const btnShowSignup = document.getElementById("btn-show-signup");
  const authError    = document.getElementById("auth-error");

  // Track current mode: "signin" or "signup"
  let mode = "signin";

  // Toggle between sign-in and sign-up
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

  // Email/password form submit
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

  // Google sign-in
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

  // Sign out
  btnSignout.addEventListener("click", () => signOut(auth));

  // Auth state listener — switches between panels
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authPanel.hidden = true;
      welcomePanel.hidden = false;
      const name = user.displayName || user.email || "friend";
      welcomeMsg.textContent = `Welcome, ${name}!`;
    } else {
      authPanel.hidden = false;
      welcomePanel.hidden = true;
      authForm.reset();
      authError.textContent = "";
    }
  });
}

// Converts Firebase error codes to readable messages
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
