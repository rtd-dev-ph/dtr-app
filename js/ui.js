/* ════════════════════════════════════════════
   js/ui.js
   Shared UI helpers: toast, password toggle,
   modal keyboard trap, etc.
   ════════════════════════════════════════════ */

// ── Toast notification ───────────────────────
let _toastTimer;

function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

// ── Password visibility toggle ───────────────
function togglePw() {
  const input = document.getElementById("login-password");
  const icon  = document.getElementById("eye-icon");
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    // Strikethrough eye icon when visible
    icon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>`;
  } else {
    input.type = "password";
    icon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>`;
  }
}

// ── Close modal on Escape key ─────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const modal = document.getElementById("modal");
    if (modal?.classList.contains("open")) closeModal();
  }
});

// ── Close modal when clicking overlay backdrop ─
document.addEventListener("click", e => {
  const overlay = document.getElementById("modal");
  if (e.target === overlay) closeModal();
});

// ── Allow Enter key on login form ─────────────
document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const loginScreen = document.getElementById("login-screen");
    if (loginScreen && loginScreen.style.display !== "none") {
      handleLogin();
    }
  }
});
