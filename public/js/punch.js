/* ════════════════════════════════════════════
   js/punch.js
   Clock-in / clock-out punch logic
   + stepper UI sync
   ════════════════════════════════════════════ */

const PUNCH_FIELDS = ["amIn", "lunchOut", "lunchIn", "pmOut"];
const PUNCH_LABELS = {
  amIn: "AM In",
  lunchOut: "Lunch Out",
  lunchIn: "Lunch In",
  pmOut: "PM Out",
};

/**
 * Records a punch for today.
 * Called by onclick handlers in index.html.
 */
async function punch(type) {
  const t = getNow();
  const key = getTodayKey();
  const all = await storageGetAll();
  const rec = all[key] || {};

  rec[type] = t;
  await storageSave(key, rec);

  showToast(`✓ ${PUNCH_LABELS[type]} at ${fmtTime(t)}`);
  await syncPunchUI();
  await renderTable();
}

/**
 * Updates stepper dots and enables/disables buttons
 * based on what has been punched today.
 */
async function syncPunchUI() {
  const key = getTodayKey();
  const all = await storageGetAll();
  const rec = all[key] || {};

  PUNCH_FIELDS.forEach((field, i) => {
    const stepEl = document.getElementById(`step-${i}`);
    const timeEl = document.getElementById(`st-${i}`);
    if (!stepEl) return;

    stepEl.className = "step";

    if (rec[field]) {
      stepEl.classList.add("done");
      timeEl.textContent = fmtTime(rec[field]);
    } else {
      timeEl.textContent = "–";
      // Active = first unfilled where the previous is filled (or i===0)
      const prevFilled = i === 0 || !!rec[PUNCH_FIELDS[i - 1]];
      if (prevFilled) stepEl.classList.add("active");
    }
  });

  // Enable/disable punch buttons in sequence
  const b = (id, disabled) => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  };
  b("btn-am-in", !!rec.amIn);
  b("btn-lunch-out", !rec.amIn || !!rec.lunchOut);
  b("btn-lunch-in", !rec.lunchOut || !!rec.lunchIn);
  b("btn-pm-out", !rec.lunchIn || !!rec.pmOut);
}

// ── Calculation helpers (used by records.js & dtr-report.js) ──

/** Total worked minutes (excluding lunch break) */
function calcWork(rec) {
  let m = 0;
  if (rec.amIn && rec.lunchOut)
    m += Math.max(0, toMins(rec.lunchOut) - toMins(rec.amIn));
  if (rec.lunchIn && rec.pmOut)
    m += Math.max(0, toMins(rec.pmOut) - toMins(rec.lunchIn));
  return m;
}

/** Late minutes vs scheduled shift start */
function calcLate(rec, shiftStart) {
  if (!rec.amIn) return 0;
  return Math.max(0, toMins(rec.amIn) - toMins(shiftStart));
}

/** Overtime minutes vs scheduled shift end */
function calcOT(rec, shiftEnd) {
  if (!rec.pmOut) return 0;
  return Math.max(0, toMins(rec.pmOut) - toMins(shiftEnd));
}
