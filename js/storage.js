/* ════════════════════════════════════════════
   js/storage.js
   ──────────────────────────────────────────
   DATA LAYER — All read/write operations live here.

   CURRENT:  Uses browser localStorage (works offline,
             data stays in this browser only).

   FUTURE SUPABASE UPGRADE:
     1. npm install @supabase/supabase-js
     2. Add your keys to config/supabase.js
     3. Replace each function body below with
        the Supabase version shown in comments.
        Everything else in the app stays the same.
   ════════════════════════════════════════════ */

const STORAGE_KEY = "dtr_records_v3";

/**
 * Load all records.
 * Returns an object keyed by date string "YYYY-MM-DD".
 * Each value: { amIn, lunchOut, lunchIn, pmOut, flag }
 *
 * FUTURE SUPABASE:
 *   const { data } = await supabase.from('dtr_records').select('*');
 *   return Object.fromEntries(data.map(r => [r.date, r]));
 */
async function storageGetAll() {
  try {
    // return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    const { data } = await supabase.from("dtr_records").select("*");
    return Object.fromEntries(data.map((r) => [r.date, r]));
  } catch {
    return {};
  }
}

/**
 * Save (upsert) a single day's record.
 * @param {string} dateKey  - "YYYY-MM-DD"
 * @param {object} data     - { amIn, lunchOut, lunchIn, pmOut, flag }
 *
 * FUTURE SUPABASE:
 *   await supabase.from('dtr_records').upsert({ date: dateKey, ...data });
 */
async function storageSave(dateKey, data) {
  const all = await storageGetAll();
  all[dateKey] = data;
  await supabase.from("dtr_records").upsert({ date: dateKey, ...data });
  // localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Delete a single day's record.
 * @param {string} dateKey - "YYYY-MM-DD"
 *
 * FUTURE SUPABASE:
 *   await supabase.from('dtr_records').delete().eq('date', dateKey);
 */
async function storageDelete(dateKey) {
  const all = await storageGetAll();
  delete all[dateKey];
  // localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  await supabase.from("dtr_records").delete().eq("date", dateKey);
}

/**
 * Save all records at once (used for bulk operations).
 * @param {object} allRecords
 *
 * FUTURE SUPABASE:
 *   const rows = Object.entries(allRecords).map(([date, data]) => ({ date, ...data }));
 *   await supabase.from('dtr_records').upsert(rows);
 */
async function storageSaveAll(allRecords) {
  // localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
  const rows = Object.entries(allRecords).map(([date, data]) => ({
    date,
    ...data,
  }));
  await supabase.from("dtr_records").upsert(rows);
}

/**
 * Clear all records.
 *
 * FUTURE SUPABASE:
 *   await supabase.from('dtr_records').delete().neq('date', '');
 */
async function storageClearAll() {
  // localStorage.removeItem(STORAGE_KEY);
  await supabase.from("dtr_records").delete().neq("date", "");
}
