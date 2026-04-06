import { createClient } from "@supabase/supabase-js";

window.supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

const scripts = [
  "config/auth.js",
  "js/storage.js",
  "js/clock.js",
  "js/punch.js",
  "js/records.js",
  "js/dtr-report.js",
  "js/ui.js",
  "js/app.js",
];

for (const src of scripts) {
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}
