/* Patroli demo: guard view + supervisor dashboard. State lives in localStorage only. All data is sample data. */
const PV = "v1.7";
const KEY = "patroli.state.v1";
const IDLE_MS = 60000;
const SELFIE_CP = 2; /* guard takes a selfie at this checkpoint as proof of presence */
const MON = new URLSearchParams(location.search).get("view") === "monitor"; /* supervisor monitor: read-only, live from the guard device */
const CPS = [ // fictional plant layout; x,y are positions on the schematic (viewBox 600x360)
  { n: 1, name: ["Main Gate", "Gerbang Utama", "Pintu Utama"], x: 70, y: 300 },
  { n: 2, name: ["Tank Farm", "Area Tangki", "Kawasan Tangki"], x: 150, y: 90 },
  { n: 3, name: ["Boiler House", "Rumah Boiler", "Rumah Dandang"], x: 330, y: 60 },
  { n: 4, name: ["Process Unit", "Unit Proses", "Unit Proses"], x: 505, y: 140 },
  { n: 5, name: ["Warehouse", "Gudang", "Gudang"], x: 470, y: 295 },
  { n: 6, name: ["Substation", "Gardu Listrik", "Pencawang"], x: 280, y: 200 }
];
const T = {
  ribbon: ["DEMO – sample data", "DEMO – data contoh", "DEMO – data sampel"],
  back: ["← Demo Hub", "← Demo Hub", "← Demo Hub"],
  guard: ["Guard", "Satpam", "Pengawal"], sup: ["Supervisor", "Penyelia", "Penyelia"],
  round: ["Round", "Ronde", "Rondaan"], progress: ["Round progress", "Progres ronde", "Kemajuan rondaan"],
  tapHint: ["Tap a checkpoint to simulate a QR scan", "Sentuh titik untuk mensimulasikan pindai QR", "Sentuh titik untuk simulasi imbasan QR"],
  next: ["Next checkpoint", "Titik berikutnya", "Titik seterusnya"], allDone: ["All checkpoints scanned", "Semua titik terpindai", "Semua titik diimbas"],
  cam: ["Scan with camera", "Pindai dengan kamera", "Imbas dengan kamera"], stopCam: ["Stop camera", "Matikan kamera", "Matikan kamera"],
  camHelp: ["Point at a printed checkpoint QR code (see QR page).", "Arahkan ke kode QR titik yang dicetak (lihat halaman QR).", "Halakan ke kod QR titik yang dicetak (lihat halaman QR)."],
  noCam: ["Camera scan is not available on this device. Use the numbered buttons.", "Pindai kamera tidak tersedia di perangkat ini. Gunakan tombol bernomor.", "Imbasan kamera tidak tersedia pada peranti ini. Guna butang bernombor."],
  end: ["End round", "Akhiri ronde", "Tamatkan rondaan"], newRound: ["Start new round", "Mulai ronde baru", "Mula rondaan baru"],
  reset: ["Reset demo", "Reset demo", "Reset demo"], qr: ["Print QR codes", "Cetak kode QR", "Cetak kod QR"],
  scanned: ["Scanned", "Terpindai", "Diimbas"], missed: ["Missed", "Terlewat", "Terlepas"], pending: ["Pending", "Menunggu", "Menunggu"],
  compliance: ["Round compliance", "Kepatuhan ronde", "Pematuhan rondaan"], shift: ["Shift average", "Rata-rata shift", "Purata syif"],
  avg: ["Avg. gap (min)", "Jeda rata-rata (mnt)", "Sela purata (min)"], map: ["Plant schematic (sample)", "Skema pabrik (contoh)", "Skema loji (sampel)"],
  timeline: ["Scan timeline", "Lini masa pindai", "Garis masa imbasan"], none: ["No scans yet. Try the Guard tab.", "Belum ada pindai. Coba tab Satpam.", "Belum ada imbasan. Cuba tab Pengawal."],
  prev: ["Earlier rounds (sample)", "Ronde sebelumnya (contoh)", "Rondaan terdahulu (sampel)"],
  ooo: ["out of sequence", "tidak berurutan", "tidak mengikut turutan"], dup: ["Already scanned", "Sudah dipindai", "Sudah diimbas"],
  ok: ["Checkpoint scanned", "Titik terpindai", "Titik diimbas"], idle: ["Demo reset after 60 s idle", "Demo direset setelah 60 dtk tanpa aktivitas", "Demo ditetapkan semula selepas 60 saat tanpa aktiviti"],
  selfieT: ["Checkpoint 2 – take a selfie", "Titik 2 – ambil selfie", "Titik 2 – ambil swafoto"],
  selfieHelp: ["Proof you were at this point. Look at the camera.", "Bukti Anda berada di titik ini. Lihat ke kamera.", "Bukti anda berada di titik ini. Lihat ke kamera."],
  snap: ["Take selfie", "Ambil selfie", "Ambil swafoto"], skip: ["Skip", "Lewati", "Langkau"], selfieNo: ["Front camera not available. Skipping selfie.", "Kamera depan tidak tersedia. Selfie dilewati.", "Kamera depan tidak tersedia. Swafoto dilangkau."],
  noticeT: ["Demo only – selfie feature", "Hanya demo – fitur selfie", "Demo sahaja – ciri swafoto"],
  noticeTx: ["At checkpoint 2 the app can ask the guard for a selfie as proof of presence. This is a demonstration for staff only. Guests and VVIPs are never photographed: tap Skip.", "Di titik 2 aplikasi dapat meminta selfie satpam sebagai bukti kehadiran. Ini hanya demonstrasi untuk staf. Tamu dan VVIP tidak pernah difoto: sentuh Lewati.", "Di titik 2 aplikasi boleh meminta swafoto pengawal sebagai bukti kehadiran. Ini demonstrasi untuk staf sahaja. Tetamu dan VVIP tidak akan difoto: sentuh Langkau."],
  ok2: ["OK, got it", "OK, mengerti", "OK, faham"], openCam: ["Staff: open camera", "Staf: buka kamera", "Staf: buka kamera"], skipG: ["Skip (guests / VVIP)", "Lewati (tamu / VVIP)", "Langkau (tetamu / VVIP)"],
  footer: ["Sample data only. Stored on this device only. No tracking.", "Hanya data contoh. Disimpan di perangkat ini saja. Tanpa pelacakan.", "Data sampel sahaja. Disimpan pada peranti ini sahaja. Tiada penjejakan."]
};
const tr = k => I18N.pick(T[k]);
const $ = (s, r = document) => r.querySelector(s);

/* ---------- state ---------- */
const SEED_HIST = [100, 83, 100, 67, 100]; // sample earlier rounds
function fresh() { return { hist: SEED_HIST.slice(), scans: [], ended: false }; }
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); }
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const fmt = ts => new Date(ts).toLocaleTimeString("en-GB");
const scannedSet = () => new Set(S.scans.map(s => s.cp));
const pct = () => Math.round(scannedSet().size / CPS.length * 100);
const nextCp = () => CPS.find(c => !scannedSet().has(c.n));

function toast(msg, warn) {
  const el = $("#toast"); el.textContent = msg; el.className = "toast on" + (warn ? " warn" : "");
  clearTimeout(toast.t); toast.t = setTimeout(() => el.className = "toast", 2200);
}

/* random SAMPLE coordinates near the plant (not real GPS, nothing is read from the device) */
const fakeGeo = () => (3.0 + Math.random() * 0.02).toFixed(5) + ", " + (99.2 + Math.random() * 0.02).toFixed(5);
function scan(n) {
  if (S.ended) return toast(tr("end") + " ✔", true);
  if (scannedSet().has(n)) return toast(tr("dup") + ": " + n, true);
  const expected = nextCp().n;
  const rec = { cp: n, ts: Date.now(), ooo: n !== expected, geo: fakeGeo() };
  S.scans.push(rec);
  save(); render(); if (!MON) Sync.publish({ t: "scan", ...rec });
  if (n === SELFIE_CP && !MON) askSelfie(rec);
  toast(`${tr("ok")} ${n} · ${I18N.pick(CPS[n - 1].name)}` + (n !== expected ? ` (${tr("ooo")})` : ""), n !== expected);
}
function endRound() { S.ended = true; save(); render(); if (!MON) Sync.publish({ t: "end" }); }
function newRound() { S.hist.push(pct()); if (S.hist.length > 8) S.hist.shift(); S.scans = []; S.ended = false; save(); render(); if (!MON) Sync.publish({ t: "new" }); }
function resetDemo(auto) { stopCam(); S = fresh(); save(); render(); if (!MON) Sync.publish({ t: "reset" }); if (auto) toast(tr("idle")); }

/* ---------- camera QR scan (BarcodeDetector + getUserMedia; hidden/disabled if unsupported) ---------- */
let stream = null, camTimer = null;
const camSupported = () => navigator.mediaDevices && navigator.mediaDevices.getUserMedia && ("BarcodeDetector" in window || typeof jsQR === "function");
const cpOf = t => { const m = /^EOP-DEMO-CP(\d)$/.exec(t) || /patroli\.html\?scan=(\d)/.exec(t); return m && CPS[m[1] - 1] ? +m[1] : 0; };
async function startCam() {
  if (!camSupported()) { $("#cam").classList.add("on"); $("#camMsg").textContent = tr("noCam"); return; }
  try {
    const det = "BarcodeDetector" in window ? new BarcodeDetector({ formats: ["qr_code"] }) : null;
    const cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    const v = $("#video"); v.srcObject = stream; await v.play();
    $("#cam").classList.add("on"); $("#camMsg").textContent = tr("camHelp");
    camTimer = setInterval(async () => {
      try {
        let texts = [];
        if (det) texts = (await det.detect(v)).map(c => c.rawValue);
        else if (v.videoWidth) {
          const w = Math.min(640, v.videoWidth), h = Math.round(w * v.videoHeight / v.videoWidth);
          cv.width = w; cv.height = h; cx.drawImage(v, 0, 0, w, h);
          const r = jsQR(cx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "attemptBoth" }); if (r) texts = [r.data];
        }
        for (const t of texts) { const n = cpOf(t); if (n) scan(n); }
      } catch (e) { /* ignore frame errors */ }
    }, 600);
  } catch (e) { $("#cam").classList.add("on"); $("#camMsg").textContent = tr("noCam"); }
}
function stopCam() {
  clearInterval(camTimer); camTimer = null;
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  $("#cam").classList.remove("on");
}

/* ---------- render ---------- */
function cpState(c) {
  if (scannedSet().has(c.n)) return "done";
  if (S.ended) return "miss";
  return nextCp() && nextCp().n === c.n ? "next" : "";
}
function render() {
  document.documentElement.lang = I18N.lang;
  $("#ribbon").textContent = tr("ribbon");
  document.querySelectorAll("[data-k]").forEach(el => el.textContent = tr(el.dataset.k));
  document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === I18N.lang));
  const done = scannedSet().size, p = pct(), nx = nextCp();
  $("#roundNo").textContent = tr("round") + " " + (S.hist.length + 1);
  $("#pbar").style.width = p + "%"; $("#pnum").textContent = done + " / " + CPS.length;
  $("#nexthint").innerHTML = S.ended ? "" : nx ? `${tr("next")}: <b>${nx.n} · ${I18N.pick(nx.name)}</b>` : tr("allDone");
  $("#cps").innerHTML = CPS.map(c => {
    const st = cpState(c), sc = S.scans.find(s => s.cp === c.n);
    const sub = st === "done" ? `${tr("scanned")} ${fmt(sc.ts)}` : st === "miss" ? tr("missed") : tr("pending");
    return `<button class="cp ${st}" data-cp="${c.n}" aria-label="Checkpoint ${c.n}"><span class="num">${c.n}</span><span><span class="nm">${I18N.pick(c.name)}</span><small>${sub}</small></span></button>`;
  }).join("");
  $("#bEnd").hidden = S.ended; $("#bNew").hidden = !S.ended && done < CPS.length;
  $("#bCam").disabled = false;

  /* supervisor */
  const missed = S.ended ? CPS.length - done : 0;
  const gaps = S.scans.slice(1).map((s, i) => (s.ts - S.scans[i].ts) / 60000);
  const avg = gaps.length ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1) : "–";
  const shift = Math.round([...S.hist, ...(done ? [p] : [])].reduce((a, b) => a + b, 0) / (S.hist.length + (done ? 1 : 0)));
  $("#kpis").innerHTML = `<div class="kpi ${p === 100 ? "" : "y"}"><b>${p}%</b><span>${tr("compliance")}</span></div>
    <div class="kpi"><b>${shift}%</b><span>${tr("shift")}</span></div>
    <div class="kpi"><b>${done}/${CPS.length}</b><span>${tr("scanned")}</span></div>
    <div class="kpi ${missed ? "r" : ""}"><b>${missed}</b><span>${tr("missed")}</span></div>
    <div class="kpi"><b>${avg}</b><span>${tr("avg")}</span></div>`;
  $("#map").innerHTML = mapSvg(nx);
  $("#tl").innerHTML = S.scans.length ? S.scans.slice().reverse().map(s => `<li><span class="d ${s.ooo ? "warn" : ""}">${s.cp}</span>${s.selfie ? `<img class="sf" src="${s.selfie}" alt="">` : ""}<span class="t">${fmt(s.ts)}</span><span>${I18N.pick(CPS[s.cp - 1].name)}${s.geo ? `<br><small class="geo">📍 ${s.geo} · sample</small>` : ""}${s.ooo ? `<br><small>${tr("ooo")}</small>` : ""}</span></li>`).join("") : `<li class="empty">${tr("none")}</li>`;
  $("#hist").innerHTML = [...S.hist.map(v => [v, v >= 90 ? "ok" : v < 75 ? "lo" : ""]), [p, "live"]].map(([v, c]) => `<div class="${c}" style="height:${Math.max(v, 4)}%"><span>${v}%</span></div>`).join("");
  $("#bCamWrap").hidden = false;
}

function mapSvg(nx) {
  const pts = CPS.map(c => `${c.x},${c.y}`).join(" ");
  const sc = scannedSet();
  const nodes = CPS.map(c => {
    const st = sc.has(c.n) ? "#44a276" : S.ended ? "#e0584f" : nx && nx.n === c.n ? "#ffc600" : "#55555c";
    const txt = st === "#ffc600" ? "#231f20" : "#fff";
    return `<g ${nx && nx.n === c.n && !S.ended ? 'class="pulse"' : ""}><circle cx="${c.x}" cy="${c.y}" r="20" fill="${st}"/><text x="${c.x}" y="${c.y + 7}" text-anchor="middle" font-size="20" fill="${txt}" font-family="Jost,sans-serif">${c.n}</text>
      <text x="${c.x}" y="${c.y + 38}" text-anchor="middle" font-size="16" fill="#c9c9cc" font-family="Jost,sans-serif">${I18N.pick(c.name)}</text></g>`;
  }).join("");
  const blocks = CPS.map(c => [c.x - 48, c.y - 30, 96, 60])
    .map(b => `<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" rx="6" fill="#2b2b31" stroke="#3c3c42"/>`).join("");
  return `<svg viewBox="0 0 600 360" role="img" aria-label="Plant schematic"><rect x="8" y="8" width="584" height="344" rx="12" fill="none" stroke="#3c3c42" stroke-dasharray="6 6"/>
    ${blocks}<polyline points="${pts}" fill="none" stroke="#44a276" stroke-opacity=".35" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round"/>${nodes}</svg>`;
}

/* ---------- selfie at checkpoint 2 (front camera, small thumbnail only, never leaves the demo except to the monitor) ---------- */
function askSelfie(rec) {
  if (new URLSearchParams(location.search).get("selfie") === "0") return;
  stopCam();
  const ov = document.createElement("div"); ov.className = "selfie";
  ov.innerHTML = `<div class="sbox"><h3>${tr("selfieT")}</h3><p class="demonote"><b>${tr("noticeT")}.</b> ${tr("noticeTx")}</p><video playsinline muted hidden></video><div class="actions"><button class="btn yellow" data-s="skip">${tr("skipG")}</button><button class="btn ghost" data-s="open">${tr("openCam")}</button><button class="btn" data-s="snap" hidden>${tr("snap")}</button></div></div>`;
  document.body.appendChild(ov);
  const v = ov.querySelector("video"); let st = null;
  const done = () => { if (st) st.getTracks().forEach(t => t.stop()); ov.remove(); };
  ov.onclick = async e => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    if (b.dataset.s === "open") { /* the camera starts only after a deliberate tap by staff */
      try { st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }); v.srcObject = st; await v.play(); }
      catch (x) { done(); return toast(tr("selfieNo"), true); }
      v.hidden = false; b.hidden = true; ov.querySelector("[data-s=snap]").hidden = false; return;
    }
    if (b.dataset.s === "snap" && v.videoWidth) {
      const c = document.createElement("canvas"), N = 160, side = Math.min(v.videoWidth, v.videoHeight);
      c.width = c.height = N; c.getContext("2d").drawImage(v, (v.videoWidth - side) / 2, (v.videoHeight - side) / 2, side, side, 0, 0, N, N);
      const img = c.toDataURL("image/jpeg", 0.6);
      const r = S.scans.find(x => x.cp === rec.cp); if (r) { r.selfie = img; save(); render(); }
      Sync.publish({ t: "selfie", cp: rec.cp, img });
    }
    done();
  };
}

/* notice shown every time the guard demo opens */
function openNotice() {
  const n = document.createElement("div"); n.className = "selfie";
  n.innerHTML = `<div class="sbox"><h3>${tr("noticeT")}</h3><p class="demonote">${tr("noticeTx")}</p><div class="actions"><button class="btn yellow">${tr("ok2")}</button></div></div>`;
  n.onclick = e => { if (e.target.closest("button")) n.remove(); };
  document.body.appendChild(n);
}

/* ---------- supervisor monitor (patroli.html?view=monitor): read-only, follows the guard device live ---------- */
function applyRemote(ev) {
  if (ev.t === "scan") { if (!scannedSet().has(ev.cp) && !S.ended) S.scans.push({ cp: ev.cp, ts: ev.ts, ooo: !!ev.ooo, geo: ev.geo }); }
  else if (ev.t === "selfie") { const r = S.scans.find(x => x.cp === ev.cp); if (r) r.selfie = ev.img; }
  else if (ev.t === "end") S.ended = true;
  else if (ev.t === "new") { S.hist.push(pct()); if (S.hist.length > 8) S.hist.shift(); S.scans = []; S.ended = false; }
  else if (ev.t === "reset") S = fresh();
  else return;
  save(); render();
}
function startMonitor() {
  document.body.classList.add("mon");
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("on", p.id === "pSup"));
  S = fresh(); save();
  const badge = document.createElement("span"); badge.className = "livebadge"; badge.id = "live";
  $(".ptitle").appendChild(badge);
  const label = { connecting: "CONNECTING…", live: "LIVE", offline: "OFFLINE – retrying" };
  Sync.listen(applyRemote, st => { badge.className = "livebadge " + st; badge.textContent = label[st]; });
  window.addEventListener("storage", () => {}); /* same-browser fallback is handled by the existing storage listener */
}

/* ---------- idle auto-reset (60 s) ---------- */
let idleT;
function bump() { clearTimeout(idleT); idleT = setTimeout(() => { if (S.scans.length || S.ended || S.hist.length !== SEED_HIST.length) resetDemo(true); bump(); }, IDLE_MS); }

document.addEventListener("DOMContentLoaded", () => {
  I18N.set(I18N.lang);
  $("#ver").textContent = PV;
  document.addEventListener("click", e => {
    const c = e.target.closest("[data-cp]"); if (c) scan(+c.dataset.cp);
    const l = e.target.closest(".lang button"); if (l) { I18N.set(l.dataset.l); render(); }
    const tb = e.target.closest("[data-tab]"); if (tb) {
      document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-selected", b === tb));
      document.querySelectorAll(".panel").forEach(p => p.classList.toggle("on", p.id === tb.dataset.tab));
    }
  });
  $("#bEnd").onclick = endRound; $("#bNew").onclick = newRound; $("#bReset").onclick = () => resetDemo(false);
  $("#bCam").onclick = () => stream ? stopCam() : startCam();
  $("#bStop").onclick = stopCam;
  ["pointerdown", "keydown", "touchstart"].forEach(ev => document.addEventListener(ev, bump, { passive: true }));
  if (MON) startMonitor(); else { bump(); if (new URLSearchParams(location.search).get("selfie") !== "0") openNotice(); }
  render();
  const _sc = new URLSearchParams(location.search).get("scan"); if (_sc && CPS[_sc - 1]) { scan(+_sc); history.replaceState(null, "", "patroli.html"); }
  window.addEventListener("storage", e => { if (e.key === KEY) { try { S = JSON.parse(e.newValue) || fresh(); } catch (x) {} render(); } });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
});
