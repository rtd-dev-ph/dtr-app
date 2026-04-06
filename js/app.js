/* ════════════════════════════════════════════
   js/app.js
   ──────────────────────────────────────────
   Main entry point.
   - Handles login / logout screen switching
   - Initialises the app after login
   - Persists shift settings to localStorage
   ════════════════════════════════════════════ */

// ── Login ────────────────────────────────────

function handleLogin() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");
  const btnEl = document.getElementById("btn-login");
  const labelEl = document.getElementById("login-label");

  // Loading state
  btnEl.classList.add("loading");
  labelEl.textContent = "Signing in…";
  errorEl.style.display = "none";

  // Small delay for UX (feels intentional, not instant)
  setTimeout(async () => {
    if (validateCredentials(username, password)) {
      createSession();
      await showApp();
    } else {
      errorEl.textContent = "Incorrect username or password. Please try again.";
      errorEl.style.display = "block";
      btnEl.classList.remove("loading");
      labelEl.textContent = "Sign In";

      // Shake the card for feedback
      const card = document.querySelector(".login-card");
      card.style.animation = "none";
      card.offsetHeight; // reflow
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
  await startClock();

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
  // Check for existing valid session
  if (hasValidSession()) {
    await showApp();
  } else {
    showLogin();
    // Focus username field
    setTimeout(() => document.getElementById("login-username")?.focus(), 100);
  }
})();
