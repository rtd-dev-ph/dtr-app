// ── Lockout config ───────────────────────────
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const ATTEMPT_KEY = "dtr_login_attempts";

function isLockedOut() {
  try {
    const raw = localStorage.getItem(ATTEMPT_KEY);
    if (!raw) return false;
    const { lockedUntil } = JSON.parse(raw);
    if (lockedUntil && Date.now() < lockedUntil) return true;
    // Lockout expired — clear it
    localStorage.removeItem(ATTEMPT_KEY);
    return false;
  } catch {
    return false;
  }
}

function recordFailedAttempt() {
  try {
    const raw = localStorage.getItem(ATTEMPT_KEY);
    const data = raw ? JSON.parse(raw) : { attempts: 0 };
    data.attempts = (data.attempts || 0) + 1;
    if (data.attempts >= MAX_ATTEMPTS) {
      data.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      data.attempts = 0;
    }
    localStorage.setItem(ATTEMPT_KEY, JSON.stringify(data));
    return data.attempts;
  } catch {
    return 0;
  }
}

function clearAttempts() {
  localStorage.removeItem(ATTEMPT_KEY);
}

// ── Auth config ──────────────────────────────
const AUTH_CONFIG = {
  SESSION_HOURS: 2,
  SESSION_KEY: "dtr_session",
};

async function validateCredentials(username, password) {
  const { data, error } = await window.supabase.auth.signInWithPassword({
    email: username,
    password: password,
  });

  if (error) {
    console.log("Auth error:", error.message);
    return false;
  }

  clearAttempts();
  createSession();
  return true;
}

function createSession() {
  const expiry = Date.now() + AUTH_CONFIG.SESSION_HOURS * 60 * 60 * 1000;
  localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify({ expiry }));
}

async function hasValidSession() {
  try {
    const raw = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
    if (!raw) return false;
    const { expiry } = JSON.parse(raw);
    if (Date.now() > expiry) return false;
    const {
      data: { session },
    } = await window.supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
}

function destroySession() {
  localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
  window.supabase.auth.signOut();
}
