/* EcoOils Demo Hub - "Scan to try": the tablet camera reads a printed QR (demo card, live-app QR, patrol checkpoint)
   and opens the matching sample-data demo. Nothing is sent anywhere; decoding happens on the device. */
const SV = "v1.6";
const $ = s => document.querySelector(s);
const T = {
  title: ["Scan to try", "Pindai untuk mencoba", "Imbas untuk cuba"],
  hint: ["Hold a printed QR card in front of the camera. The matching demo opens, with sample data only.", "Arahkan kartu QR cetak ke kamera. Demo yang sesuai akan terbuka, hanya dengan data contoh.", "Halakan kad QR bercetak ke kamera. Demo yang sepadan akan dibuka, dengan data sampel sahaja."],
  start: ["Start camera", "Mulai kamera", "Mula kamera"], stop: ["Stop camera", "Hentikan kamera", "Henti kamera"],
  look: ["Looking for a QR code…", "Mencari kode QR…", "Mencari kod QR…"],
  nocam: ["Camera not available here. Pick a demo on the right.", "Kamera tidak tersedia. Pilih demo di sebelah kanan.", "Kamera tidak tersedia. Pilih demo di sebelah kanan."],
  unknown: ["That QR is not part of the demo. Try another card.", "QR itu bukan bagian dari demo. Coba kartu lain.", "QR itu bukan sebahagian demo. Cuba kad lain."],
  pick: ["Can't scan? Pick a demo", "Tidak bisa memindai? Pilih demo", "Tidak boleh imbas? Pilih demo"],
  opening: ["Opening", "Membuka", "Membuka"]
};
const tr = k => I18N.pick(T[k]);

/* live-app repo -> where the sample-data demo lives */
const REPO = {
  "UAUC-Report": "demo.html?app=uauc", "Material-Gate-Pass": "demo.html?app=gate",
  "Site-Walkthrough-Close-Out": "demo.html?app=walk", "HSSE-tracker": "demo.html?app=track", "Driver-Log": "demo.html?app=driver",
  "Security-Patrol": "patroli.html", "Equipment-Vehicle-Register": "index.html?tour=evr",
  "Site-Induction-Sei-Mangkei": "index.html?tour=induct", "SIMOPS": "index.html?tour=simops",
  "Disciplinary-Record": "index.html?tour=disc", "Demo-Hub": "index.html"
};
const PICKS = [
  ["Security Patrol", "patroli.html"], ["UA/UC", "demo.html?app=uauc"], ["Gate Pass", "demo.html?app=gate"],
  ["Driver's Log", "demo.html?app=driver"], ["HSSE Tracker", "demo.html?app=track"], ["Walkthrough", "demo.html?app=walk"],
  ["Vehicle Register", "index.html?tour=evr"], ["Site Induction", "index.html?tour=induct"], ["SIMOPS", "index.html?tour=simops"]
];

/* text read from a QR -> relative page to open, or null */
function route(raw) {
  const s = String(raw || "").trim();
  let m = /^EOP-DEMO-CP(\d)$/.exec(s);
  if (m) return "patroli.html?scan=" + m[1];
  m = /demo\.html\?app=(uauc|gate|driver|track|walk)\b/.exec(s);
  if (m) return "demo.html?app=" + m[1];
  m = /EcoOils-Project-([A-Za-z-]+?)\/?(?:[?#].*)?$/.exec(s);
  if (m && REPO[m[1]]) return REPO[m[1]];
  if (/EcoOils-Project-Demo-Hub/.test(s)) return "index.html";
  return null;
}
window.__route = route;

let stream = null, timer = 0, busy = false;
const msg = t => $("#msg").textContent = t;
function go(rel) { msg(tr("opening") + "…"); stopCam(); location.href = rel; }

async function startCam() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return msg(tr("nocam"));
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
  } catch (e) { return msg(tr("nocam")); }
  const v = $("#v"); v.srcObject = stream; await v.play().catch(() => {});
  $("#bCam").textContent = tr("stop"); msg(tr("look"));
  const cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
  let lastBad = 0;
  timer = setInterval(() => {
    if (busy || !v.videoWidth) return;
    const w = Math.min(640, v.videoWidth), h = Math.round(w * v.videoHeight / v.videoWidth);
    cv.width = w; cv.height = h; cx.drawImage(v, 0, 0, w, h);
    const r = jsQR(cx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "attemptBoth" });
    if (!r) return;
    const rel = route(r.data);
    if (rel) { busy = true; go(rel); } else if (Date.now() - lastBad > 2500) { lastBad = Date.now(); msg(tr("unknown")); }
  }, 250);
}
function stopCam() {
  clearInterval(timer); timer = 0;
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null; $("#v").srcObject = null; $("#bCam").textContent = tr("start");
}

function render() {
  document.documentElement.lang = I18N.lang;
  $("#title").textContent = tr("title"); $("#hint").textContent = tr("hint"); $("#pickT").textContent = tr("pick");
  $("#bCam").textContent = stream ? tr("stop") : tr("start"); if (!stream) msg(tr("look"));
  $("#picks").innerHTML = PICKS.map(p => `<a class="btn ghost" href="${p[1]}">${p[0]}</a>`).join("");
  document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === I18N.lang));
}
document.addEventListener("DOMContentLoaded", () => {
  I18N.set(I18N.lang); $("#ver").textContent = SV; render();
  $("#bCam").onclick = () => stream ? stopCam() : startCam();
  document.addEventListener("click", e => { const l = e.target.closest(".lang button"); if (l) { I18N.set(l.dataset.l); render(); } });
  /* 60 s without a scan: back to the hub attract screen */
  let idle; const bump = () => { clearTimeout(idle); idle = setTimeout(() => { stopCam(); location.href = "index.html#attract"; }, 60000); };
  ["pointerdown", "keydown", "touchstart"].forEach(ev => document.addEventListener(ev, bump, { passive: true })); bump();
  startCam();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
});
