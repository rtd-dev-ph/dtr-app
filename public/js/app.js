/* ════════════════════════════════════════════
   js/app.js
   ──────────────────────────────────────────
   Main entry point.
   - Handles login / logout screen switching
   - Initialises the app after login
   - Persists shift settings to localStorage
   - Login lockout after failed attempts
   - Auto logout on inactivity
   ════════════════════════════════════════════ */

// ── Inactivity Timer ─────────────────────────
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(
    () => {
      destroySession();
      location.reload();
    },
    2 * 60 * 60 * 1000,
  ); // 8 hours
}

function startInactivityTimer() {
  ["click", "keypress", "mousemove", "touchstart"].forEach((event) => {
    document.addEventListener(event, resetInactivityTimer);
  });
  resetInactivityTimer();
}

// ── Login ────────────────────────────────────

function handleLogin() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");
  const btnEl = document.getElementById("btn-login");
  const labelEl = document.getElementById("login-label");

  btnEl.classList.add("loading");
  labelEl.textContent = "Signing in…";
  errorEl.style.display = "none";

  setTimeout(async () => {
    // Check lockout first
    if (isLockedOut()) {
      errorEl.textContent =
        "Too many failed attempts. Try again in 15 minutes.";
      errorEl.style.display = "block";
      btnEl.classList.remove("loading");
      labelEl.textContent = "Sign In";
      return;
    }

    // Clear old session BEFORE validating
    destroySession();

    const valid = await validateCredentials(username, password);

    if (valid === true) {
      createSession();
      startInactivityTimer();
      await showApp();
    } else {
      const attempts = recordFailedAttempt();
      const remaining = 5 - attempts;

      if (isLockedOut()) {
        errorEl.textContent =
          "Too many failed attempts. Locked for 15 minutes.";
      } else {
        errorEl.textContent = `Incorrect email or password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`;
      }

      errorEl.style.display = "block";
      btnEl.classList.remove("loading");
      labelEl.textContent = "Sign In";

      const card = document.querySelector(".login-card");
      card.style.animation = "none";
      card.offsetHeight;
      card.style.animation = "shake 0.4s ease";
    }
  }, 400);
}

function handleLogout() {
  if (confirm("Log out of DTR System?")) {
    destroySession();
    location.reload();
  }
}

// Add shake animation to stylesheet dynamically
(function addShakeAnim() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px); }
      40%      { transform: translateX(8px); }
      60%      { transform: translateX(-6px); }
      80%      { transform: translateX(6px); }
    }`;
  document.head.appendChild(style);
})();

// ── Screen switching ─────────────────────────

async function showApp() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("app-screen").style.display = "block";
  await initApp();
}

function showLogin() {
  document.getElementById("login-screen").style.display = "block";
  document.getElementById("app-screen").style.display = "none";
}

// ── App initialisation ───────────────────────

async function initApp() {
  // Start live clock
  startClock();

  // Set month filter to current month
  const now = new Date();
  const ym = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const filterEl = document.getElementById("filter-month");
  if (filterEl) filterEl.value = ym;

  // Set default report period to current month
  const firstDay = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const lastDay = toKey(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const rsEl = document.getElementById("report-start");
  const reEl = document.getElementById("report-end");
  if (rsEl) rsEl.value = firstDay;
  if (reEl) reEl.value = lastDay;

  // Restore saved employee name
  const savedName = localStorage.getItem("dtr_emp_name");
  const nameEl = document.getElementById("emp-name");
  if (nameEl) {
    if (savedName) nameEl.value = savedName;
    nameEl.addEventListener("input", (e) =>
      localStorage.setItem("dtr_emp_name", e.target.value),
    );
  }

  // Restore saved shift settings
  const shiftIds = [
    "shift-start",
    "lunch-out-sched",
    "lunch-in-sched",
    "shift-end",
  ];
  shiftIds.forEach((id) => {
    const el = document.getElementById(id);
    const saved = localStorage.getItem("dtr_setting_" + id);
    if (el) {
      if (saved) el.value = saved;
      el.addEventListener("change", (e) => {
        localStorage.setItem("dtr_setting_" + id, e.target.value);
      });
    }
  });

  // Initial table render
  await renderTable();
}

// ── Bootstrap ────────────────────────────────

(async function bootstrap() {
  if (await hasValidSession()) {
    startInactivityTimer();
    await showApp();
  } else {
    showLogin();
    setTimeout(() => document.getElementById("login-username")?.focus(), 100);
  }
})();
