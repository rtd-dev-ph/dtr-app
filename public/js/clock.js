/* ════════════════════════════════════════════
   js/clock.js
   Live clock display + date helpers
   ════════════════════════════════════════════ */

/** Zero-pad a number to 2 digits */
function pad(n) {
  return String(n).padStart(2, "0");
}

/** Convert a Date to "YYYY-MM-DD" key */
function toKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Get current time as "HH:MM" */
function getNow() {
  const n = new Date();
  return `${pad(n.getHours())}:${pad(n.getMinutes())}`;
}

/** Format "HH:MM" → "HH:MM AM/PM" */
function fmtTime(s) {
  if (!s) return "–";
  const [h, m] = s.split(":").map(Number);
  return `${pad(h % 12 || 12)}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
}

/** Convert "HH:MM" to total minutes */
function toMins(s) {
  if (!s) return 0;
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

/** Convert minutes to "Xh Ym" string */
function toHM(m) {
  if (!m || m <= 0) return "0h 0m";
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// ── Live Clock ──────────────────────────────
let _todayKey = "";

async function _tickClock() {
  const now = new Date();
  const el = document.getElementById("live-clock");
  const del = document.getElementById("live-date");
  // if (el)
  //   el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const h12 = now.getHours() % 12 || 12;
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  if (el)
    el.textContent = `${pad(h12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;
  if (del)
    del.textContent = now.toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const newKey = toKey(now);
  if (newKey !== _todayKey) {
    _todayKey = newKey;
  }

  // refresh punch stepper every tick (handles midnight rollover)
  if (typeof (await syncPunchUI) === "function") await syncPunchUI();
}

function getTodayKey() {
  return _todayKey || toKey(new Date());
}

async function startClock() {
  await _tickClock();
  setInterval(_tickClock, 1000);
}
