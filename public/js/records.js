/* ════════════════════════════════════════════
   js/records.js
   Attendance records table + edit modal logic
   ════════════════════════════════════════════ */

/** Renders the attendance table filtered by selected month */
async function renderTable() {
  const filterMonth = document.getElementById("filter-month")?.value || "";
  const tbody = document.getElementById("records-body");
  if (!tbody) return;

  const shiftStart = document.getElementById("shift-start")?.value || "08:00";
  const shiftEnd = document.getElementById("shift-end")?.value || "17:00";

  const all = await storageGetAll();

  // console.log("RAW DATA FROM SUPABASE:", JSON.stringify(all, null, 2));

  let keys = Object.keys(all).sort();
  if (filterMonth) keys = keys.filter((k) => k.startsWith(filterMonth));

  tbody.innerHTML = "";

  if (!keys.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;color:var(--muted);padding:32px;">
          No records found for this period
        </td>
      </tr>`;
    return;
  }

  keys.forEach((key) => {
    const rec = all[key];
    const flag = rec.flag || "";
    let late = 0,
      ot = 0,
      work = 0,
      statusHtml = "";

    if (flag === "ABSENT") {
      statusHtml = '<span class="tag tag-absent">ABSENT</span>';
    } else if (flag === "HD") {
      statusHtml = '<span class="tag tag-hd">HALF DAY</span>';
    } else {
      late = calcLate(rec, shiftStart);
      ot = calcOT(rec, shiftEnd);
      work = calcWork(rec);

      if (late > 0)
        statusHtml += `<span class="tag tag-late">LATE ${late}m</span>`;
      if (ot > 0)
        statusHtml += `<span class="tag tag-ot">OT ${toHM(ot)}</span>`;
      if (!late && !ot && rec.amIn && rec.pmOut)
        statusHtml = '<span class="tag tag-ok">ON TIME</span>';
      if (rec.amIn && !rec.pmOut)
        statusHtml += '<span class="tag tag-prog">IN PROGRESS</span>';
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-family:var(--font-mono);font-size:0.77rem;">${key}</td>
      <td style="font-family:var(--font-mono);color:var(--accent);">${fmtTime(rec.amIn)}</td>
      <td style="font-family:var(--font-mono);color:var(--yellow);">${fmtTime(rec.lunchOut)}</td>
      <td style="font-family:var(--font-mono);color:var(--purple);">${fmtTime(rec.lunchIn)}</td>
      <td style="font-family:var(--font-mono);color:var(--accent2);">${fmtTime(rec.pmOut)}</td>
      <td style="font-family:var(--font-mono);">${work ? toHM(work) : "–"}</td>
      <td style="font-family:var(--font-mono);color:${late ? "var(--yellow)" : "var(--muted)"};">${late ? late + "m" : "–"}</td>
      <td style="font-family:var(--font-mono);color:${ot ? "var(--accent)" : "var(--muted)"};">${ot ? toHM(ot) : "–"}</td>
      <td>${statusHtml || "–"}</td>
      <td><button class="edit-btn" onclick="openEdit('${key}')">edit</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Edit Modal ───────────────────────────────

async function openEdit(key) {
  const all = await storageGetAll();
  const rec = all[key] || {};

  document.getElementById("edit-key-orig").value = key;
  document.getElementById("edit-date-val").value = key;
  document.getElementById("edit-am-in").value = rec.amIn || "";
  document.getElementById("edit-lunch-out").value = rec.lunchOut || "";
  document.getElementById("edit-lunch-in").value = rec.lunchIn || "";
  document.getElementById("edit-pm-out").value = rec.pmOut || "";
  document.getElementById("edit-flag").value = rec.flag || "";

  document.getElementById("modal").classList.add("open");
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

async function saveEdit() {
  const newKey = document.getElementById("edit-date-val").value;
  const origKey = document.getElementById("edit-key-orig").value;

  // If date was changed, remove the old key first
  if (origKey && origKey !== newKey) {
    await storageDelete(origKey);
  }

  await storageSave(newKey, {
    amIn: document.getElementById("edit-am-in").value,
    lunchOut: document.getElementById("edit-lunch-out").value,
    lunchIn: document.getElementById("edit-lunch-in").value,
    pmOut: document.getElementById("edit-pm-out").value,
    flag: document.getElementById("edit-flag").value,
  });

  await renderTable();
  closeModal();
  showToast("Record saved ✓");
}

async function deleteRecord() {
  const key = document.getElementById("edit-key-orig").value;
  if (confirm(`Delete record for ${key}?`)) {
    await storageDelete(key);
    await renderTable();
    closeModal();
    showToast("Record deleted");
  }
}

async function clearAllConfirm() {
  if (confirm("Clear ALL attendance records? This cannot be undone.")) {
    await storageClearAll();
    await renderTable();
    showToast("All records cleared");
  }
}
