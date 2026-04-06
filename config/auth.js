/* ════════════════════════════════════════════
   config/auth.js
   ──────────────────────────────────────────
   LOGIN CREDENTIALS — Change these!

   To update your password:
     1. Open this file
     2. Change USERNAME and PASSWORD below
     3. Save and reload the app

   FUTURE UPGRADE PATH:
     When adding Supabase auth, replace the
     validateCredentials() function below with
     a Supabase signInWithPassword() call.
     Everything else stays the same.
   ════════════════════════════════════════════ */

const AUTH_CONFIG = {
  // ── CHANGE THESE TO YOUR OWN CREDENTIALS ──
  USERNAME: "den",
  PASSWORD: "randall",

  // Session expires after this many hours of inactivity
  SESSION_HOURS: 8,

  // Storage key for session token
  SESSION_KEY: "dtr_session",
};

/**
 * Validates login credentials.
 *
 * CURRENT: Checks against hardcoded values above (local only).
 *
 * FUTURE SUPABASE UPGRADE — replace this function body with:
 *   const { data, error } = await supabase.auth.signInWithPassword({
 *     email: username,
 *     password: password,
 *   });
 *   return !error;
 */
function validateCredentials(username, password) {
  return (
    username.trim() === AUTH_CONFIG.USERNAME &&
    password === AUTH_CONFIG.PASSWORD
  );

  //  username.trim() === AUTH_CONFIG.USERNAME && password === AUTH_CONFIG.PASSWORD;

  // const { data, error } = await supabase.auth.signInWithPassword({
  //   email: username,
  //   password: password,
  // });
  // return !error;
}

/**
 * Creates a session after successful login.
 * Stores expiry timestamp in localStorage.
 */
function createSession() {
  const expiry = Date.now() + AUTH_CONFIG.SESSION_HOURS * 60 * 60 * 1000;
  localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify({ expiry }));
}

/**
 * Checks whether a valid session exists.
 * Returns true if logged in and not expired.
 */
function hasValidSession() {
  try {
    const raw = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
    if (!raw) return false;
    const { expiry } = JSON.parse(raw);
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

/**
 * Destroys the current session (logout).
 */
function destroySession() {
  localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
}
