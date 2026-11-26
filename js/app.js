/* EcoOils Demo Hub - front door: tiles, language, tours, idle/attract mode. */
const VERSION = "v1.7";
/* STAFF mode: live-app links are hidden by default so visitors only reach sample-data demos.
   Open index.html?staff=1 once on a device to show them (e.g. for Iggy); ?staff=0 hides them again. */
const _q = new URLSearchParams(location.search).get("staff");
if (_q === "1") localStorage.setItem("demohub.staff", "1"); if (_q === "0") localStorage.removeItem("demohub.staff");
const STAFF = localStorage.getItem("demohub.staff") === "1";
const DEMOS = ["uauc", "gate", "walk", "track", "driver"]; /* apps with an interactive sample-data demo (demo.html) */

/* Live app URLs: pattern https://iggifernandes.github.io/EcoOils-Project-<repo>/ . The apps open on Iggy's own login.
   Edit here only; this is the one place URLs live. */
const BASE = "https://iggifernandes.github.io/EcoOils-Project-";
const URLS = {
  uauc:   BASE + "UAUC-Report/",
  gate:   BASE + "Material-Gate-Pass/",
  walk:   BASE + "Site-Walkthrough-Close-Out/",
  track:  BASE + "HSSE-tracker/",
  disc:   BASE + "Disciplinary-Record/",
  evr:    BASE + "Equipment-Vehicle-Register/",
  driver: BASE + "Driver-Log/",
  induct: BASE + "Site-Induction-Sei-Mangkei/",
  simops: BASE + "SIMOPS/"
};

const ICONS = {
  uauc: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
  gate: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  walk: '<path d="M4 7h16v12H4z"/><circle cx="9" cy="12" r="2"/><path d="M20 16l-5-4-7 7"/><path d="M8 7l2-3h4l2 3"/>',
  track: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  disc: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  evr: '<path d="M3 16V8h11v8M14 11h4l3 3v2h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  driver: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 9.5V3M9.8 13.2L4 16M14.2 13.2L20 16"/>',
  induct: '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5"/>',
  simops: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5M8 13h3M8 16h6"/>',
  patroli: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'
};

const APPS = [
  { id: "uauc", name: ["UA/UC Reporting", "Pelaporan UA/UC", "Pelaporan UA/UC"], purpose: ["Report unsafe acts and conditions in seconds, with a photo.", "Laporkan tindakan dan kondisi tidak aman dalam hitungan detik, dengan foto.", "Laporkan tindakan dan keadaan tidak selamat dalam beberapa saat, dengan gambar."] },
  { id: "gate", name: ["Gate Pass", "Gate Pass", "Pas Pintu Masuk"], purpose: ["Approve material leaving site and check it with a QR scan.", "Setujui material keluar tapak dan periksa dengan pindai QR.", "Luluskan bahan keluar tapak dan semak dengan imbasan QR."] },
  { id: "walk", name: ["Walkthrough", "Walkthrough", "Walkthrough"], purpose: ["Close site findings with before and after photos.", "Tutup temuan lapangan dengan foto sebelum dan sesudah.", "Tutup penemuan tapak dengan gambar sebelum dan selepas."] },
  { id: "track", name: ["HSSE Tracker", "HSSE Tracker", "HSSE Tracker"], purpose: ["Monthly HSSE performance: hours, TRCF, LTIF and trends.", "Kinerja HSSE bulanan: jam kerja, TRCF, LTIF dan tren.", "Prestasi HSSE bulanan: jam kerja, TRCF, LTIF dan aliran."] },
  { id: "disc", name: ["Disciplinary Record", "Catatan Disiplin", "Rekod Disiplin"], purpose: ["Fair, consistent SP1/SP2/SP3 safety warnings.", "Surat peringatan keselamatan SP1/SP2/SP3 yang adil dan konsisten.", "Amaran keselamatan SP1/SP2/SP3 yang adil dan konsisten."] },
  { id: "evr", name: ["Heavy Equipment & Vehicle Register", "Register Alat Berat & Kendaraan", "Daftar Peralatan Berat & Kenderaan"], purpose: ["Every machine and vehicle, with documents and expiry alerts.", "Setiap alat dan kendaraan, lengkap dengan dokumen dan peringatan kedaluwarsa.", "Setiap jentera dan kenderaan, lengkap dengan dokumen dan amaran tamat tempoh."] },
  { id: "driver", name: ["Driver's Log & Pre-Use Checklist", "Log Pengemudi & Cek Pra-Pakai", "Log Pemandu & Senarai Semak Pra-Guna"], purpose: ["Check the vehicle, log the day, no paper.", "Periksa kendaraan, catat harian, tanpa kertas.", "Semak kenderaan, rekod harian, tanpa kertas."] },
  { id: "induct", name: ["Site Induction", "Induksi Tapak", "Induksi Tapak"], purpose: ["Learn, get assessed and receive a QR induction ID.", "Belajar, dinilai dan dapatkan ID induksi QR.", "Belajar, dinilai dan terima ID induksi QR."] },
  { id: "simops", name: ["SIMOPS Meeting Record", "Catatan Rapat SIMOPS", "Rekod Mesyuarat SIMOPS"], purpose: ["Plan simultaneous operations and sign minutes on screen.", "Rencanakan operasi bersamaan dan tanda tangani notulen di layar.", "Rancang operasi serentak dan tandatangan minit di skrin."] }
];
/* THE REGISTER: all 30 digital HSSE processes, exactly as in Iggy's register.
   status: "live" | "testing" | "soon". repo -> https://iggifernandes.github.io/<repo>/ (no repo = "link to come" or no link).
   note: optional chip key. demo:true shows the optional Patroli demo link. show:false hides an entry. One-line edits only. */
const SITE = "https://iggifernandes.github.io/";
const REGISTER = [
  { name: "Site Induction", status: "live", repo: "EcoOils-Project-Site-Induction-Sei-Mangkei" },
  { name: "HSSE Tracker", status: "live", repo: "EcoOils-Project-HSSE-tracker" },
  { name: "Blood Pressure Monitoring", status: "live", repo: "EcoOils-Project-blood-pressure-monitoring" },
  { name: "Drug & Alcohol Test Record", status: "live", repo: "EcoOils-Project-drug---alcohol-test-record" },
  { name: "HSSE Database", status: "live", repo: "EcoOils-project-hsse-database" }, /* lowercase 'project' is correct */
  { name: "Heavy Equipment & Vehicle Register", status: "live", repo: "EcoOils-Project-Equipment-Vehicle-Register" },
  { name: "Driver's Log & Pre-Use Checklist", status: "live", repo: "EcoOils-Project-Driver-Log" },
  { name: "PPE Database", status: "live", repo: "EcoOils-Project-PPE-Database" },
  { name: "Disciplinary Record", status: "live", repo: "EcoOils-Project-Disciplinary-Record" },
  { name: "Stand-down Meeting MoM", status: "live", repo: "EcoOils-Project-Stand-Down-MOM", note: "hsseOnly" },
  { name: "UA/UC Reporting", status: "live", repo: "EcoOils-Project-UAUC-Report" },
  { name: "Reward & Recognition", status: "live", repo: "EcoOils-Project-HSSE-Recognition" },
  { name: "Site Walkthrough Close-Out", status: "live", repo: "EcoOils-Project-Site-Walkthrough-Close-Out" },
  { name: "SIMOPS Meeting Record", status: "live", repo: "EcoOils-Project-SIMOPS" },
  { name: "Security Database", status: "live", repo: "EcoOils-Project-Security" },
  { name: "Security Patrol", status: "live", repo: "EcoOils-Project-Security-Patrol", demo: true },
  { name: "Material Gate Pass", status: "live", repo: "EcoOils-Project-Material-Gate-Pass" },
  { name: "Contractor Go/No-Go", status: "testing" }, /* no URL yet: shows "link to come" */
  { name: "Office Care", status: "testing", repo: "Ecooils-SM-Housekeeping-portal" },
  { name: "Scaffold Compliance Hub", status: "testing", repo: "EcoOils-Project-Scaffold-Database", note: "liveTesting" },
  { name: "PTW Registry", status: "testing", repo: "EcoOils-Project-PTW-Registry" },
  { name: "PTW Training", status: "soon" }, /* EcoOils-PTW-LMS exists, but status is Coming soon: no link */
  { name: "Training Hub", status: "soon" }, { name: "Operator Competency", status: "soon" }, { name: "Training Matrix", status: "soon" },
  { name: "Toolbox Talk Record", status: "soon" }, { name: "Site Inspection Report", status: "soon" },
  { name: "Weekly HSSE Report", status: "soon" }, { name: "Quarterly HSSE Bulletin", status: "soon" }
];

const $ = (s, r = document) => r.querySelector(s);
const svgIco = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

function render() {
  const p = I18N.pick.bind(I18N), t = I18N.t.bind(I18N);
  document.documentElement.lang = I18N.lang;
  $("#ribbon").textContent = t("ribbon");
  $("#ver").textContent = VERSION + (STAFF ? " · STAFF" : "");
  document.querySelectorAll("[data-i]").forEach(el => el.innerHTML = t(el.dataset.i));
  document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === I18N.lang));
  $("#apps").innerHTML = APPS.map(a => `<article class="tile">
    <div class="ico">${svgIco(a.id)}</div><h3>${esc(p(a.name))}</h3><p>${esc(p(a.purpose))}</p>
    <div class="btns">${DEMOS.includes(a.id) ? `<a class="btn yellow" href="demo.html?app=${a.id}">${t("tryDemo")}</a><button class="btn ghost" data-tour="${a.id}">${t("tour")}</button>` : `<button class="btn" data-tour="${a.id}">${t("tour")}</button>`}
    ${STAFF ? `<a class="btn ghost" href="${URLS[a.id]}" target="_blank" rel="noopener">${t("open")}</a>` : ""}</div></article>`).join("");
  const reg = REGISTER.filter(d => d.show !== false);
  const groups = { live: [], testing: [], soon: [] };
  reg.forEach(d => groups[d.status].push(d));
  const total = reg.length, pc = n => (Math.round(n / total * 1000) / 10).toString();
  $("#summary").innerHTML = ["live", "testing", "soon"].map(k => `<div class="sum s-${k}"><b>${groups[k].length}</b><span>${t("sec_" + k)}</span><em>${pc(groups[k].length)}%</em></div>`).join("") +
    `<div class="sumbar" aria-hidden="true">${["live", "testing", "soon"].map(k => `<i class="s-${k}" style="width:${groups[k].length / total * 100}%"></i>`).join("")}</div>`;
  const row = d => {
    const url = d.repo ? SITE + d.repo + "/" : null;
    const link = d.status === "soon" || !STAFF ? "" : url ? `<a class="dl" href="${url}" target="_blank" rel="noopener">${t("open")}</a>` : `<span class="dl soonlink">${t("linkSoon")}</span>`;
    const demo = d.demo ? `<a class="dl demolink" href="patroli.html">${t("tryDemo")} <i>${t("demoTag")}</i></a>` : "";
    return `<li><span class="dn">${esc(d.name)}</span>${d.note ? `<span class="note">${t(d.note)}</span>` : ""}<span class="chip s-${d.status}">${t("st_" + d.status)}</span>${link}${demo}</li>`;
  };
  $("#secs").innerHTML = ["live", "testing", "soon"].map(k => `<section class="sect"><h2>${t("sec_" + k)} <span class="cnt">${groups[k].length}</span></h2><ul class="dir">${groups[k].map(row).join("")}</ul></section>`).join("");
  if (Tour.active()) Tour.refresh();
}

/* ---------- idle / attract mode: 60 s without touch -> back to home + 'tap to start' ---------- */
const IDLE_MS = 60000;
let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(goAttract, IDLE_MS);
}
function goAttract() {
  Tour.end();
  window.scrollTo(0, 0);
  $("#attract").classList.add("on");
}
function wake() { $("#attract").classList.remove("on"); resetIdle(); }

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-tour]");
    if (b) Tour.start(Object.assign({ id: b.dataset.tour }, TOURS[b.dataset.tour]));
    const l = e.target.closest(".lang button");
    if (l) { I18N.set(l.dataset.l); render(); }
  });
  $("#attract").addEventListener("click", wake);
  ["pointerdown", "keydown", "touchstart", "mousemove", "scroll"].forEach(ev =>
    document.addEventListener(ev, () => { if (!$("#attract").classList.contains("on")) resetIdle(); }, { passive: true }));
  I18N.set(I18N.lang);
  render();
  resetIdle();
  if (location.hash === "#attract") goAttract();
  const _t = new URLSearchParams(location.search).get("tour"); if (_t && TOURS[_t]) { Tour.start(Object.assign({ id: _t }, TOURS[_t])); history.replaceState(null, "", "index.html"); }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
});
