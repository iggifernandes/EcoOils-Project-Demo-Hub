/* EcoOils Demo Hub - language handling. Languages: en, id (Bahasa Indonesia), ms (Bahasa Melayu).
   Texts are stored as arrays [en, id, ms] to keep translations side by side. */
const LANGS = ["en", "id", "ms"];
const I18N = {
  lang: localStorage.getItem("demohub.lang") || "en",
  idx() { return Math.max(0, LANGS.indexOf(this.lang)); },
  set(l) { this.lang = l; localStorage.setItem("demohub.lang", l); document.documentElement.lang = l; },
  pick(arr) { return Array.isArray(arr) ? (arr[this.idx()] || arr[0]) : arr; },
  t(key) { return this.pick(UI[key]) || key; }
};
const UI = {
  ribbon: ["DEMO – sample data", "DEMO – data contoh", "DEMO – data sampel"],
  site: ["Sei Mangkei", "Sei Mangkei", "Sei Mangkei"],
  heroTitle: ["Safety, <b>digital</b> and in your hands", "Keselamatan, <b>digital</b> dan di tangan Anda", "Keselamatan, <b>digital</b> dan di tangan anda"],
  heroText: [
    "Try our digital HSSE processes in 10 minutes. Open an app, or take a guided tour. Tours use sample data only.",
    "Coba proses HSSE digital kami dalam 10 menit. Buka aplikasi, atau ikuti tur terpandu. Tur hanya memakai data contoh.",
    "Cuba proses HSSE digital kami dalam 10 minit. Buka aplikasi, atau ikuti lawatan berpandu. Lawatan hanya guna data sampel."],
  statHours: ["Work hours (sample)", "Jam kerja (contoh)", "Jam kerja (sampel)"],
  statApps: ["Digital HSSE processes", "Proses HSSE digital", "Proses HSSE digital"],
  statPaper: ["Paper forms needed", "Formulir kertas", "Borang kertas diperlukan"],
  secApps: ["Take a guided tour", "Ikuti tur terpandu", "Ikuti lawatan berpandu"],
  secPatroli: ["Try it yourself", "Coba sendiri", "Cuba sendiri"],
  secSoon: ["Coming online", "Segera online", "Akan datang dalam talian"],
  sec_live: ["Live", "Aktif", "Aktif"], sec_testing: ["Testing phase", "Fase pengujian", "Fasa ujian"], sec_soon: ["Coming soon", "Segera hadir", "Akan datang"],
  hsseOnly: ["HSSE only", "Hanya HSSE", "HSSE sahaja"], liveTesting: ["Live, testing phase", "Aktif, fase pengujian", "Aktif, fasa ujian"],
  tryDemo: ["Try the demo", "Coba demo", "Cuba demo"], demoTag: ["Demo", "Demo", "Demo"], secTours: ["Take a tour", "Ikuti tur", "Ikuti lawatan"],
  st_soon: ["Coming soon", "Segera hadir", "Akan datang"],
  secAll: ["All digital HSSE processes", "Semua proses HSSE digital", "Semua proses HSSE digital"],
  st_live: ["Live", "Aktif", "Aktif"], st_testing: ["Testing", "Pengujian", "Ujian"], st_making: ["In the making", "Sedang dibuat", "Sedang dibangunkan"],
  linkSoon: ["link to come", "tautan menyusul", "pautan menyusul"],
  tour: ["Take a tour", "Ikuti tur", "Ikuti lawatan"],
  open: ["Open live app", "Buka aplikasi", "Buka aplikasi"],
  openPatroli: ["Play with the demo", "Coba demo", "Cuba demo"],
  printQr: ["Print QR codes", "Cetak kode QR", "Cetak kod QR"],
  testing: ["Testing", "Pengujian", "Ujian"],
  making: ["In the making", "Sedang dibuat", "Sedang dibangunkan"],
  next: ["Next", "Lanjut", "Seterusnya"],
  back: ["Back", "Kembali", "Kembali"],
  skip: ["Skip tour", "Lewati tur", "Langkau lawatan"],
  done: ["Finish", "Selesai", "Tamat"],
  step: ["Step", "Langkah", "Langkah"],
  of: ["of", "dari", "daripada"],
  tapStart: ["Tap to start", "Sentuh untuk mulai", "Sentuh untuk mula"],
  attractSub: ["EcoOils Demo Hub", "EcoOils Demo Hub", "EcoOils Demo Hub"],
  mockBar: ["Guided tour · sample screens", "Tur terpandu · layar contoh", "Lawatan berpandu · skrin sampel"],
  footer: ["Sample data only. No real people, photos or records. No tracking.", "Hanya data contoh. Tidak ada orang, foto atau catatan sebenarnya. Tanpa pelacakan.", "Data sampel sahaja. Tiada orang, foto atau rekod sebenar. Tiada penjejakan."]
};
