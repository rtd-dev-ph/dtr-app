const STORAGE_KEY = "dtr_records_v3";

async function storageGetAll() {
  try {
    // Wait for auth session to be restored
    const {
      data: { session },
    } = await window.supabase.auth.getSession();

    console.log("Session:", session);

    if (!session) {
      console.log("No session found");
      return {};
    }

    const { data, error } = await window.supabase
      .from("dtr_records")
      .select("*")
      .eq("user_id", session.user.id);

    console.log("Records:", data);
    console.log("Error:", error);

    if (error) throw error;
    return Object.fromEntries(
      data.map((r) => [
        r.date,
        {
          amIn: r.amIn,
          lunchOut: r.lunchOut,
          lunchIn: r.lunchIn,
          pmOut: r.pmOut,
          flag: r.flag,
        },
      ]),
    );
  } catch (e) {
    console.log("CATCH ERROR:", e);
    return {};
  }
}
// async function storageGetAll() {
//   try {
//     async function storageGetAll() {
//       try {
//         const {
//           data: { user },
//         } = await window.supabase.auth.getUser();

//         // ── TEMPORARY DEBUG ──
//         console.log("Current user:", user);
//         // ────────────────────

//         const { data, error } = await window.supabase
//           .from("dtr_records")
//           .select("*")
//           .eq("user_id", user.id);

//         // ── TEMPORARY DEBUG ──
//         console.log("Records from Supabase:", data);
//         console.log("Error:", error);
//         // ────────────────────

//         if (error) throw error;
//         return Object.fromEntries(
//           data.map((r) => [
//             r.date,
//             {
//               amIn: r.amIn,
//               lunchOut: r.lunchOut,
//               lunchIn: r.lunchIn,
//               pmOut: r.pmOut,
//               flag: r.flag,
//             },
//           ]),
//         );
//       } catch {
//         return {};
//       }
//     }

//     const {
//       data: { user },
//     } = await window.supabase.auth.getUser();
//     const { data, error } = await window.supabase
//       .from("dtr_records")
//       .select("*")
//       .eq("user_id", user.id);

//     if (error) throw error;
//     return Object.fromEntries(
//       data.map((r) => [
//         r.date,
//         {
//           amIn: r.amIn,
//           lunchOut: r.lunchOut,
//           lunchIn: r.lunchIn,
//           pmOut: r.pmOut,
//           flag: r.flag,
//         },
//       ]),
//     );
//   } catch {
//     return {};
//   }
// }

async function storageSave(dateKey, data) {
  const {
    data: { user },
  } = await window.supabase.auth.getUser();
  const { error } = await window.supabase.from("dtr_records").upsert({
    date: dateKey,
    user_id: user.id,
    amIn: data.amIn || null,
    lunchOut: data.lunchOut || null,
    lunchIn: data.lunchIn || null,
    pmOut: data.pmOut || null,
    flag: data.flag || null,
  });
  if (error) console.error("Save error:", error);
}

async function storageDelete(dateKey) {
  const {
    data: { user },
  } = await window.supabase.auth.getUser();
  const { error } = await window.supabase
    .from("dtr_records")
    .delete()
    .eq("date", dateKey)
    .eq("user_id", user.id);
  if (error) console.error("Delete error:", error);
}

async function storageSaveAll(allRecords) {
  const {
    data: { user },
  } = await window.supabase.auth.getUser();
  const rows = Object.entries(allRecords).map(([date, data]) => ({
    date,
    user_id: user.id,
    amIn: data.amIn || null,
    lunchOut: data.lunchOut || null,
    lunchIn: data.lunchIn || null,
    pmOut: data.pmOut || null,
    flag: data.flag || null,
  }));
  await window.supabase.from("dtr_records").upsert(rows);
}

async function storageClearAll() {
  const {
    data: { user },
  } = await window.supabase.auth.getUser();
  await window.supabase.from("dtr_records").delete().eq("user_id", user.id);
}
