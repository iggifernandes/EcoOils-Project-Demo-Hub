/* Patroli demo: guard view + supervisor dashboard. State lives in localStorage only. All data is sample data. */
const PV = "v1.3";
const KEY = "patroli.state.v1";
const IDLE_MS = 60000;
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

function scan(n) {
  if (S.ended) return toast(tr("end") + " ✔", true);
  if (scannedSet().has(n)) return toast(tr("dup") + ": " + n, true);
  const expected = nextCp().n;
  S.scans.push({ cp: n, ts: Date.now(), ooo: n !== expected });
  save(); render();
  toast(`${tr("ok")} ${n} · ${I18N.pick(CPS[n - 1].name)}` + (n !== expected ? ` (${tr("ooo")})` : ""), n !== expected);
}
function endRound() { S.ended = true; save(); render(); }
function newRound() { S.hist.push(pct()); if (S.hist.length > 8) S.hist.shift(); S.scans = []; S.ended = false; save(); render(); }
function resetDemo(auto) { stopCam(); S = fresh(); save(); render(); if (auto) toast(tr("idle")); }

/* ---------- camera QR scan (BarcodeDetector + getUserMedia; hidden/disabled if unsupported) ---------- */
let stream = null, camTimer = null;
const camSupported = () => "BarcodeDetector" in window && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
async function startCam() {
  if (!camSupported()) { $("#cam").classList.add("on"); $("#camMsg").textContent = tr("noCam"); return; }
  try {
    const det = new BarcodeDetector({ formats: ["qr_code"] });
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    const v = $("#video"); v.srcObject = stream; await v.play();
    $("#cam").classList.add("on"); $("#camMsg").textContent = tr("camHelp");
    camTimer = setInterval(async () => {
      try {
        const codes = await det.detect(v);
        for (const c of codes) { const m = /^EOP-DEMO-CP(\d)$/.exec(c.rawValue); if (m && CPS[m[1] - 1]) { scan(+m[1]); } }
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
  $("#tl").innerHTML = S.scans.length ? S.scans.slice().reverse().map(s => `<li><span class="d ${s.ooo ? "warn" : ""}">${s.cp}</span><span class="t">${fmt(s.ts)}</span><span>${I18N.pick(CPS[s.cp - 1].name)}${s.ooo ? `<br><small>${tr("ooo")}</small>` : ""}</span></li>`).join("") : `<li class="empty">${tr("none")}</li>`;
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
  bump(); render();
  window.addEventListener("storage", e => { if (e.key === KEY) { try { S = JSON.parse(e.newValue) || fresh(); } catch (x) {} render(); } });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
});
