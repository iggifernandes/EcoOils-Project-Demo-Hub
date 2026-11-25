# EcoOils Demo Hub

Booth demo (v1.5) for the 2 Dec 2026 visit: a launcher for the digital HSSE processes (each app opens on Iggy's own login), with a take-a-tour fallback using mock screens, and a working **Patroli demo** (optional mini-tour of the live Security Patrol). Plain HTML/CSS/JS, no backend, no API, no tracking, no passwords. **All data is fictional sample data.**

## Publish it (steps for Iggy)
1. On GitHub create a new **public** repo named `EcoOils-Project-Demo-Hub` (empty, no README).
2. Give Claude push access to that repo, then ask Claude to push `main` from `/home/claude/work/demo_hub`. (Or add the remote yourself and `git push -u origin main`.)
3. Repo Settings > Pages > Source: **Deploy from a branch** > Branch `main`, folder `/ (root)` > Save.
4. After about a minute open: https://iggifernandes.github.io/EcoOils-Project-Demo-Hub/
5. Open it once online on each booth device; it then works offline.

Locally: run `python3 -m http.server` in this folder and browse to http://localhost:8000/ (the service worker and camera need https or localhost).

## v1.5: interactive sample-data demos (no login, no real data)
* `demo.html?app=uauc|gate|driver|track|walk` (`js/demos.js`, `css/demos.css`): UA/UC report, Material Gate Pass (request, HSSE approve, QR, gate scan), Driver's pre-use checklist and trip log, HSSE Tracker dashboard, Walkthrough before/after close-out and pictorial report. Each takes about 1 minute.
* Reset: **Reset demo** button, or automatic after 60 s idle (returns to the Hub attract screen). Everything is stored in the browser only.
* **Live-app links are hidden by default** so visitors cannot reach real data. Open `index.html?staff=1` once on a device to show them; `?staff=0` hides them again.

## What is inside
* `index.html` – home: 9 app tiles (Take a tour / Open live app), Live / Testing / Coming soon register with summary, EN / ID / MS toggle, version top right above the toggle, "DEMO – sample data" ribbon.
* `js/mocks.js` – the 9 tours (mock screens + 5 steps each, charts in inline SVG). `js/tour.js` – the tiny tour engine (spotlight, next/back/skip, arrow keys, Esc).
* `patroli.html` – Patroli: Guard tab (6 checkpoint buttons simulate a QR scan, optional camera scan), Supervisor tab (plant schematic, timeline, compliance %). `patroli-qr.html` – printable QR codes for the 6 checkpoints (`EOP-DEMO-CP1` to `CP6`).
* `vendor/qrcode.js` (MIT, qrcode-generator) and Jost (OFL, embedded as base64 in `css/style.css`) are vendored, so nothing loads from a CDN.
* `sw.js` – offline cache. **When you change any file, bump `CACHE` in `sw.js`** (and `VERSION` in `js/app.js` / `PV` in `js/patroli.js`; now v1.3).

## Reset
* Hub: after 60 s without touch it closes any tour, returns to the top and shows the "Tap to start" animation. Tap to continue. Add `#attract` to the URL to preview it.
* Patroli: **Reset demo** button, or automatic reset after 60 s idle. State is kept in the browser's localStorage only. Clear site data to wipe everything.

## The register (30 digital HSSE processes)
The page groups Iggy's register into Live (18, 60%), Testing phase (4, 13.3%) and Coming soon (8, 26.7%). It is the `REGISTER` array in `js/app.js`: edit `status` ("live" / "testing" / "soon"), set or remove `repo`, or add `show:false` to hide an entry. Counts and percentages update automatically. Coming soon entries never get a link. Contractor Go/No-Go shows "link to come". Security Patrol is Live and also offers an optional, clearly labelled Demo mini-tour (`patroli.html`).

## Swap tile URLs
Edit the `URLS` object at the top of `js/app.js`. Links follow `https://iggifernandes.github.io/EcoOils-Project-<repo>/`. Test every link (and your login) before the demo. Tour captions and tile texts live in `js/app.js` and `js/mocks.js` as `[en, id, ms]` arrays.

## Camera scan (Patroli)
Uses `BarcodeDetector` + `getUserMedia` (Chrome / Edge on Android and desktop; needs https or localhost). Not available on iOS Safari: the numbered buttons are the fallback. Print `patroli-qr.html` and place the codes near the tablet.

## Booth checklist
* Open the Pages URL once on every device while online; confirm it loads again in airplane mode.
* Browser full-screen / kiosk mode (Chrome: `--kiosk`; tablets: pinned/guided access).
* Disable sleep and auto-lock; screen brightness high; charger connected.
* Test every "Open live app" link; if one is not ready, point it elsewhere in `URLS`.
* Print `patroli-qr.html` (6 codes) and test one camera scan.
* Language toggle set to the audience (EN / ID / MS); tap Reset demo before the first visitor.
