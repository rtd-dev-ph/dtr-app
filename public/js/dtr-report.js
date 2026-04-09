/* ════════════════════════════════════════════
   js/dtr-report.js
   DTR report generation + clipboard copy
   ════════════════════════════════════════════ */

/** Generates the formatted DTR report and renders it */
async function generateDTR() {
  const start = document.getElementById("report-start").value;
  const end = document.getElementById("report-end").value;
  const shiftStart = document.getElementById("shift-start").value;
  const shiftEnd = document.getElementById("shift-end").value;

  if (!start || !end) {
    showToast("⚠ Please set a start and end date");
    return;
  }

  // Build list of working days (Mon–Sat, skip Sunday)
  const startD = new Date(start + "T00:00:00");
  const endD = new Date(end + "T00:00:00");
  const allKeys = [];
  const cur = new Date(startD);
  while (cur <= endD) {
    if (cur.getDay() !== 0) allKeys.push(toKey(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const all = await storageGetAll();
  let totalLateMins = 0,
    totalOTMins = 0,
    totalAbsent = 0,
    totalHD = 0;
  let workingDays = 0;

  const rows = allKeys.map((key) => {
    const rec = all[key];
    const d = new Date(key + "T00:00:00");
    const label = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
    const flag = rec ? rec.flag || "" : "";
    let late = 0,
      otHrs = 0;

    if (flag === "ABSENT") {
      totalAbsent++;
    } else if (flag === "HD") {
      totalHD++;
      workingDays += 0.5;
    } else if (rec && rec.amIn) {
      workingDays++;
      late = calcLate(rec, shiftStart);
      const otM = calcOT(rec, shiftEnd);
      otHrs = Math.floor(otM / 60);
      totalLateMins += late;
      totalOTMins += otM;
    }

    return {
      label,
      late,
      otHrs,
      absent: flag === "ABSENT" ? 1 : 0,
      hd: flag === "HD" ? 1 : 0,
    };
  });

  const totalOTHrs = Math.floor(totalOTMins / 60);

  // Format the report text
  const header = `L- LATE  A - ABSENT  OT - OVERTIME  HD - HALF DAY\n\n`;
  const colHeader = `                    L    A   OT   HD\n`;
  const lines = rows
    .map(
      (r) =>
        `${r.label.padEnd(14)}${String(r.late).padStart(4)} ${String(r.absent).padStart(4)}  ${String(r.otHrs).padStart(4)}  ${String(r.hd).padStart(4)}`,
    )
    .join("\n");
  const footer = [
    "",
    `ABSENT: ${totalAbsent}   OTHER: 0   Half Day: ${totalHD}   TOTAL OT : ${totalOTHrs} hrs   TOTAL LATE: ${totalLateMins} mins`,
    `Working days: ${workingDays}   TOTAL: ${workingDays + totalAbsent} Days`,
  ].join("\n");

  document.getElementById("dtr-output").textContent =
    header + colHeader + lines + footer;

  // Render summary boxes
  document.getElementById("dtr-summary").innerHTML = `
    <div class="summary-box">
      <div class="val">${workingDays}</div>
      <div class="lbl">Working Days</div>
    </div>
    <div class="summary-box">
      <div class="val" style="color:var(--red)">${totalAbsent}</div>
      <div class="lbl">Absents</div>
    </div>
    <div class="summary-box">
      <div class="val" style="color:var(--yellow)">${totalLateMins}m</div>
      <div class="lbl">Total Late</div>
    </div>
    <div class="summary-box">
      <div class="val" style="color:var(--accent)">${totalOTHrs}h</div>
      <div class="lbl">Total OT</div>
    </div>
    <div class="summary-box">
      <div class="val" style="color:var(--accent2)">${totalHD}</div>
      <div class="lbl">Half Days</div>
    </div>
  `;
}

/** Copies the DTR report text to clipboard */
function copyDTR() {
  const text = document.getElementById("dtr-output").textContent;
  if (text.startsWith("←")) {
    showToast("Generate a report first");
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => showToast("DTR copied to clipboard! ✓"));
}
