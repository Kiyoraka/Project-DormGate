# DSMS — Dormitory Student Movement System

Software Version: 0.4 (prototype)

## Description

DSMS records student movement in and out of a dormitory using a QR code at the
guardhouse, and enforces a nightly curfew.

The guard displays a **gate QR that expires every 5 minutes**. A student scans it with
their phone, and a popup records the movement:

- **Going out** — the student picks a movement type (Outing or Going Home) and a place.
- **Coming back** — the system already knows they are outside, so it just confirms the
  return. Returning after the **10:00 PM** curfew is recorded as a **Late Return**.

Late Return is only ever a record in history and in the dashboard counts — a student's
current status is always one of **Inside**, **Outside**, or **Going Home**.

## Roles

| Role | Entry | What they do |
|------|-------|--------------|
| **Student** | `student.html` | Scan the gate QR, record movement, view QR-less pass confirmation, history, alerts and profile |
| **Security Guard** | `guard.html` | Display the rotating gate QR, watch live scan activity and counts, search students |
| **Warden** | `warden.html` | Dashboard, students currently outing, late-return list, full movement history, reports |

Everyone signs in from `index.html` — a single login where the ID decides which
dashboard you land on. Demo quick-fill buttons are provided.

## Running it

It is a static site — no build step and no backend.

```bash
python -m http.server 8777
# then open http://127.0.0.1:8777/index.html
```

## Structure

```
index.html          single login (ID routes to the right dashboard)
student.html        student app (mobile-responsive)
guard.html          guard console + gate QR display
warden.html         warden portal
assets/css/         tokens.css (design system) + per-app styles
assets/js/          data.js (all hardcoded data), qr.js, auth.js + per-app logic
```

## Status

Hardcoded prototype for demos. Data lives in `assets/js/data.js`; there is no database,
no real camera, and notifications and time-based triggers are represented in the UI but
not wired to a backend. Every source file is kept under 1,000 lines.
