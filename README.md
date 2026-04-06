# DTR System — Daily Time Record

A personal attendance tracker with 4-punch clock-in/out, DTR report generation, and login protection.

---

## 📁 File Structure

```
dtr-app/
│
├── index.html              ← App structure (HTML only, no logic)
│
├── css/
│   └── styles.css          ← All styling in one place
│
├── config/
│   └── auth.js             ← Login credentials (change here!)
│
└── js/
    ├── storage.js          ← Data layer (swap this for Supabase later)
    ├── clock.js            ← Live clock + date/time helpers
    ├── punch.js            ← Clock-in/out logic + stepper sync
    ├── records.js          ← Attendance table + edit modal
    ├── dtr-report.js       ← DTR report generation + copy
    ├── ui.js               ← Toast, modal keyboard, password toggle
    └── app.js              ← Entry point: login, init, settings
```

---

## 🚀 How to Use

1. Open `index.html` in any browser (double-click it)
2. Log in with your credentials (default below)
3. Use the 4 punch buttons daily: **AM In → Lunch Out → Lunch In → PM Out**
4. At payroll time, go to **Generate DTR Report**, set the period, click Generate

---

## 🔐 Changing Your Password

Open `config/auth.js` and update:

```js
const AUTH_CONFIG = {
  USERNAME: "your_username",   // ← change this
  PASSWORD: "your_password",   // ← change this
  ...
};
```

Default credentials: `admin` / `dtr2024`

---

## 🗄️ Adding a Database (Supabase)

When you're ready to move data off localStorage:

### Step 1 — Create Supabase project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. In the SQL editor, run:

```sql
CREATE TABLE dtr_records (
  date       TEXT PRIMARY KEY,
  am_in      TEXT,
  lunch_out  TEXT,
  lunch_in   TEXT,
  pm_out     TEXT,
  flag       TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### Step 2 — Create `config/supabase.js`

```js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL  = 'https://your-project.supabase.co'
const SUPABASE_KEY  = 'your-anon-key'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
```

### Step 3 — Replace `js/storage.js` functions

Each function in `storage.js` has a comment showing the exact Supabase replacement.
**Nothing else in the app needs to change.**

### Step 4 — Replace auth in `config/auth.js`

The `validateCredentials()` function has a comment showing the Supabase auth replacement.

---

## ⚙️ Settings (auto-saved)

| Setting | Default | Where |
|---|---|---|
| Shift Start | 08:00 AM | Clock card |
| Lunch Out schedule | 12:00 PM | Clock card |
| Lunch In schedule | 1:00 PM | Clock card |
| Shift End | 5:00 PM | Clock card |
| Employee Name | (blank) | DTR Report section |

---

## 📋 DTR Report Format

```
L- LATE  A - ABSENT  OT - OVERTIME  HD - HALF DAY

                    L    A   OT   HD
03/02/2026           0    0    2    0
03/03/2026           9    0    3    0
...

ABSENT: 1   OTHER: 0   Half Day: 0   TOTAL OT : 12 hrs   TOTAL LATE: 18 mins
Working days: 11   TOTAL: 12 Days
```

---

## 🛠️ Adding Features

| Feature | File to edit |
|---|---|
| Change colors/fonts | `css/styles.css` |
| Add a new punch type | `js/punch.js` + `index.html` |
| Change report format | `js/dtr-report.js` |
| Add overtime rules | `js/punch.js` → `calcOT()` |
| Add new columns to table | `js/records.js` → `renderTable()` |
| Connect to database | `js/storage.js` |
| Change login method | `config/auth.js` |
