/* EcoOils Demo Hub – interactive sample-data demos (UA/UC, Gate Pass, Driver's Log, Tracker, Walkthrough).
   Everything is fictional sample data. State lives in localStorage on this device only. Reset: button or 60 s idle. */
const DV = "v1.5";
const IDLE_MS = 60000;
const L = (a, b, c) => [a, b, c];
const tr = x => I18N.pick(x);
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const APP = new URLSearchParams(location.search).get("app") || "uauc";
const KEY = "demohub.demo." + APP;
const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const num = n => Number(n).toLocaleString("en-US");

const C = {
  ribbon: L("DEMO – sample data", "DEMO – data contoh", "DEMO – data sampel"),
  back: L("← Demo Hub", "← Demo Hub", "← Demo Hub"),
  reset: L("Reset demo", "Reset demo", "Reset demo"),
  foot: L("Sample data only. Stored on this device only. No real people, photos or records.", "Hanya data contoh. Disimpan di perangkat ini saja. Tanpa orang, foto atau catatan sebenarnya.", "Data sampel sahaja. Disimpan pada peranti ini sahaja. Tiada orang, foto atau rekod sebenar."),
  idle: L("Demo reset after 60 s idle", "Demo direset setelah 60 dtk tanpa aktivitas", "Demo ditetapkan semula selepas 60 saat tanpa aktiviti"),
  done: L("Done", "Selesai", "Selesai")
};
const LOCS = [
  ["gate", L("Main Gate", "Gerbang Utama", "Pintu Utama")], ["tank", L("Tank Farm", "Area Tangki", "Kawasan Tangki")],
  ["boil", L("Boiler House", "Rumah Boiler", "Rumah Dandang")], ["proc", L("Process Unit", "Unit Proses", "Unit Proses")],
  ["ware", L("Warehouse", "Gudang", "Gudang")], ["sub", L("Substation", "Gardu Listrik", "Pencawang")]
];
const lab = (list, id) => { const x = list.find(a => a[0] === id); return x ? tr(x[1]) : ""; };
const chips = (f, list, sel, cls = "") => `<div class="chips">${list.map(([id, l]) => `<button class="chip ${cls} ${sel === id ? "on" : ""}" data-act="set" data-f="${f}" data-v="${id}">${esc(tr(l))}</button>`).join("")}</div>`;
const card = (n, title, body) => `<div class="pcard"><h2>${n ? `<span class="n">${n}</span>` : ""}${tr(title)}</h2>${body}</div>`;
const qrSvg = t => { const q = qrcode(0, "M"); q.addData(t); q.make(); return q.createSvgTag({ cellSize: 5, margin: 2, scalable: true }); };
const CONTR = [["kks", L("KKS", "KKS", "KKS")], ["pbs", L("PBS", "PBS", "PBS")], ["wen", L("WEN", "WEN", "WEN")], ["gsb", L("GSB", "GSB", "GSB")]];

/* ================= UA/UC REPORTING ================= */
const UA_TYPES = [["ua", L("Unsafe act", "Tindakan tidak aman", "Tindakan tidak selamat")], ["uc", L("Unsafe condition", "Kondisi tidak aman", "Keadaan tidak selamat")]];
const UA_CATS = [["ppe", L("PPE", "APD", "PPE")], ["hk", L("Housekeeping", "Kebersihan area", "Kekemasan")], ["wah", L("Work at height", "Kerja di ketinggian", "Kerja di tempat tinggi")],
  ["lift", L("Lifting", "Pengangkatan", "Pengangkatan")], ["elec", L("Electrical", "Kelistrikan", "Elektrik")], ["veh", L("Vehicles & traffic", "Kendaraan & lalu lintas", "Kenderaan & trafik")]];
const UA_SEED = [
  { id: "UC-0143", type: "uc", cat: "hk", loc: "ware", t: "08:12", st: "closed" },
  { id: "UA-0142", type: "ua", cat: "ppe", loc: "proc", t: "07:40", st: "open" },
  { id: "UC-0141", type: "uc", cat: "elec", loc: "sub", t: "07:05", st: "closed" }
];
const photoArt = () => `<svg viewBox="0 0 240 150"><rect width="240" height="150" fill="#2b2b31"/><rect y="105" width="240" height="45" fill="#3a3a41"/><rect x="40" y="70" width="60" height="35" fill="#a8672a"/><rect x="110" y="82" width="70" height="8" fill="#a8672a" transform="rotate(-8 110 82)"/><rect x="120" y="96" width="60" height="8" fill="#c4813e" transform="rotate(6 120 96)"/><path d="M190 30l22 38h-44z" fill="#ffc600"/><path d="M190 42v14M190 61v2" stroke="#231f20" stroke-width="4" stroke-linecap="round"/></svg>`;
const uauc = {
  title: L("UA/UC Reporting", "Pelaporan UA/UC", "Pelaporan UA/UC"),
  fresh: () => ({ type: null, cat: null, loc: null, photo: false, txt: "", sent: null, log: [] }),
  view(S) {
    const all = [...S.log, ...UA_SEED], n = S.log.length;
    const kpis = `<div class="kpis"><div class="kpi"><b>${num(7312 + n)}</b><span>${tr(L("Hazards reported (sample)", "Bahaya dilaporkan (contoh)", "Bahaya dilaporkan (sampel)"))}</span></div>
      <div class="kpi"><b>${3 + n}</b><span>${tr(L("Reported today", "Dilaporkan hari ini", "Dilaporkan hari ini"))}</span></div>
      <div class="kpi y"><b>${1 + S.log.filter(r => r.st === "open").length}</b><span>${tr(L("Open", "Terbuka", "Terbuka"))}</span></div></div>`;
    const list = card(0, L("Latest reports", "Laporan terbaru", "Laporan terkini"), `<ul class="rows">${all.slice(0, 6).map(r => `<li><span class="id">${r.id}</span><span class="grow">${lab(UA_CATS, r.cat)} · ${lab(LOCS, r.loc)}<br><small>${r.t} · ${lab(UA_TYPES, r.type)}</small></span><span class="tag ${r.st}">${tr(r.st === "open" ? L("Open", "Terbuka", "Terbuka") : L("Closed", "Selesai", "Selesai"))}</span></li>`).join("")}</ul>`);
    if (S.sent) return kpis + `<div class="res"><b>✔ ${tr(L("Report sent", "Laporan terkirim", "Laporan dihantar"))} · ${S.sent}</b><p>${tr(L("Routed to the responsible contractor and HSSE, with your photo and location. The crew sees it closed after the fix.", "Diteruskan ke kontraktor terkait dan HSSE, dengan foto dan lokasi. Kru melihatnya selesai setelah diperbaiki.", "Dihantar kepada kontraktor berkaitan dan HSSE, dengan gambar dan lokasi. Kru melihatnya selesai selepas dibaiki."))}</p></div>
      <div class="actions" style="margin:0 0 14px"><button class="btn yellow big" data-act="again">${tr(L("Report another", "Laporkan lagi", "Laporkan lagi"))}</button></div>` + list;
    const ok = S.type && S.cat && S.loc;
    return kpis + `<div class="formgrid two">` +
      card(1, L("What did you see?", "Apa yang Anda lihat?", "Apa yang anda lihat?"), chips("type", UA_TYPES, S.type, "warn")) +
      card(2, L("Category", "Kategori", "Kategori"), chips("cat", UA_CATS, S.cat)) +
      card(3, L("Where?", "Di mana?", "Di mana?"), chips("loc", LOCS, S.loc)) +
      card(4, L("Photo (optional)", "Foto (opsional)", "Gambar (pilihan)"), `<div class="sample"><button class="btn ghost" data-act="photo">${tr(S.photo ? L("Remove photo", "Hapus foto", "Buang gambar") : L("Add sample photo", "Tambah foto contoh", "Tambah gambar sampel"))}</button>${S.photo ? photoArt() : ""}</div>
        <textarea class="txt" data-in="txt" placeholder="${tr(L("What is happening? (optional)", "Apa yang terjadi? (opsional)", "Apa yang berlaku? (pilihan)"))}" style="margin-top:12px">${esc(S.txt)}</textarea>`) +
      `</div><div class="actions" style="margin:0 0 16px"><button class="btn yellow big" data-act="submit" ${ok ? "" : "disabled"}>${tr(L("Send report", "Kirim laporan", "Hantar laporan"))}</button></div>` + list;
  },
  acts: {
    photo: S => { S.photo = !S.photo; },
    again: S => { S.sent = null; },
    submit: S => {
      if (!(S.type && S.cat && S.loc)) return;
      const id = (S.type === "ua" ? "UA-" : "UC-") + String(144 + S.log.length).padStart(4, "0");
      S.log.unshift({ id, type: S.type, cat: S.cat, loc: S.loc, t: now(), st: "open" });
      S.sent = id; S.type = S.cat = S.loc = null; S.photo = false; S.txt = "";
    }
  }
};

/* ================= MATERIAL GATE PASS ================= */
const GP_ITEMS = [["pipe", L("Scaffold pipes", "Pipa scaffolding", "Paip perancah")], ["drum", L("Used oil drums", "Drum oli bekas", "Dram minyak terpakai")], ["gen", L("Generator set", "Genset", "Set penjana")], ["tool", L("Tool boxes", "Kotak perkakas", "Kotak alat")]];
const GP_QTY = [["1", L("1", "1", "1")], ["2", L("2", "2", "2")], ["5", L("5", "5", "5")], ["10", L("10", "10", "10")]];
const GP_CO = [["gsb", L("PT. GSB", "PT. GSB", "PT. GSB")], ["kks", L("PT. KKS", "PT. KKS", "PT. KKS")], ["wen", L("PT. WEN", "PT. WEN", "PT. WEN")], ["pbs", L("PT. PBS", "PT. PBS", "PT. PBS")]];
const GP_VEH = [["a", L("Truck BB 1234 XX", "Truk BB 1234 XX", "Lori BB 1234 XX")], ["b", L("Pickup BK 5678 XX", "Pickup BK 5678 XX", "Pikap BK 5678 XX")]];
const GP_SEED = [{ id: "GP-0457", item: "pipe", co: "kks", t: "09:02", st: "closed" }, { id: "GP-0456", item: "drum", co: "wen", t: "08:15", st: "closed" }, { id: "GP-0455", item: "tool", co: "gsb", t: "07:48", st: "closed" }];
const gate = {
  title: L("Material Gate Pass", "Gate Pass Material", "Pas Pintu Bahan"),
  fresh: () => ({ item: null, qty: "1", co: null, veh: null, step: 0, no: null, ts: {}, log: [] }),
  view(S) {
    const stp = [L("Request", "Permintaan", "Permintaan"), L("HSSE approval", "Persetujuan HSSE", "Kelulusan HSSE"), L("Gate QR", "QR Gerbang", "QR Pintu"), L("Cleared", "Diizinkan", "Dibenarkan")];
    const stepper = `<div class="stepper">${stp.map((s, i) => `<div class="${i < S.step ? "done" : i === S.step ? "now" : ""}"><b>${i < S.step ? "✔" : i + 1}</b>${tr(s)}</div>`).join("")}</div>`;
    const summary = `<div class="kv"><span>${tr(L("Pass", "Pas", "Pas"))}</span><b>${S.no}</b><span>${tr(L("Material", "Material", "Bahan"))}</span><b>${lab(GP_ITEMS, S.item)} × ${S.qty}</b><span>${tr(L("Contractor", "Kontraktor", "Kontraktor"))}</span><b>${lab(GP_CO, S.co)}</b><span>${tr(L("Vehicle", "Kendaraan", "Kenderaan"))}</span><b>${lab(GP_VEH, S.veh)}</b></div>`;
    const all = [...S.log, ...GP_SEED];
    const list = card(0, L("Recent passes", "Pas terbaru", "Pas terkini"), `<ul class="rows">${all.slice(0, 5).map(r => `<li><span class="id">${r.id}</span><span class="grow">${lab(GP_ITEMS, r.item)} · ${lab(GP_CO, r.co)}<br><small>${r.t}</small></span><span class="tag closed">${tr(L("Left site", "Keluar tapak", "Keluar tapak"))}</span></li>`).join("")}</ul>`);
    let body;
    if (S.step === 0) {
      const ok = S.item && S.co && S.veh;
      body = `<div class="formgrid two">` + card(1, L("Material", "Material", "Bahan"), chips("item", GP_ITEMS, S.item)) + card(2, L("Quantity", "Jumlah", "Kuantiti"), chips("qty", GP_QTY, S.qty)) +
        card(3, L("Contractor", "Kontraktor", "Kontraktor"), chips("co", GP_CO, S.co)) + card(4, L("Vehicle", "Kendaraan", "Kenderaan"), chips("veh", GP_VEH, S.veh)) +
        `</div><div class="actions" style="margin:0 0 16px"><button class="btn yellow big" data-act="request" ${ok ? "" : "disabled"}>${tr(L("Request pass", "Ajukan pas", "Mohon pas"))}</button></div>`;
    } else if (S.step === 1) {
      body = card(0, L("Waiting for HSSE approval", "Menunggu persetujuan HSSE", "Menunggu kelulusan HSSE"), summary + `<div class="actions"><button class="btn yellow big" data-act="approve">${tr(L("Approve (as HSSE)", "Setujui (sebagai HSSE)", "Luluskan (sebagai HSSE)"))}</button></div>`);
    } else if (S.step === 2) {
      body = card(0, L("Approved · show this QR at the gate", "Disetujui · tunjukkan QR ini di gerbang", "Diluluskan · tunjuk QR ini di pintu"), `<div class="passgrid"><div class="qrbox">${qrSvg("EOP-DEMO-" + S.no)}</div><div>${summary}<div class="actions"><button class="btn yellow big" data-act="scan">${tr(L("Scan at the gate (as security)", "Pindai di gerbang (sebagai satpam)", "Imbas di pintu (sebagai pengawal)"))}</button></div></div></div>`);
    } else {
      body = `<div class="res"><b>✔ ${tr(L("Verified at gate", "Terverifikasi di gerbang", "Disahkan di pintu"))} · ${S.ts.out}</b><p>${tr(L("Material left site with an approved, traceable pass. No paper, no phone calls.", "Material keluar tapak dengan pas yang disetujui dan dapat dilacak. Tanpa kertas, tanpa telepon.", "Bahan keluar tapak dengan pas diluluskan dan boleh dijejak. Tanpa kertas, tanpa panggilan telefon."))}</p></div>` + card(0, L("Pass", "Pas", "Pas"), summary + `<div class="actions"><button class="btn yellow big" data-act="newpass">${tr(L("New pass", "Pas baru", "Pas baharu"))}</button></div>`);
    }
    return stepper + body + list;
  },
  acts: {
    request: S => { if (!(S.item && S.co && S.veh)) return; S.no = "GP-" + String(458 + S.log.length).padStart(4, "0"); S.ts.req = now(); S.step = 1; },
    approve: S => { S.ts.app = now(); S.step = 2; },
    scan: S => { S.ts.out = now(); S.step = 3; S.log.unshift({ id: S.no, item: S.item, co: S.co, t: S.ts.out }); },
    newpass: S => { Object.assign(S, { item: null, qty: "1", co: null, veh: null, step: 0, no: null, ts: {} }); }
  }
};

/* ================= DRIVER'S LOG ================= */
const DR_VEH = [["a", L("Hilux DEMO-01", "Hilux DEMO-01", "Hilux DEMO-01")], ["b", L("Dump truck DEMO-02", "Dump truck DEMO-02", "Lori tong DEMO-02")], ["c", L("Bus DEMO-03", "Bus DEMO-03", "Bas DEMO-03")]];
const DR_CHK = [
  L("Tyres and wheel nuts", "Ban dan mur roda", "Tayar dan nat roda"), L("Brakes and handbrake", "Rem dan rem tangan", "Brek dan brek tangan"),
  L("Lights and indicators", "Lampu dan sein", "Lampu dan isyarat"), L("Horn and wipers", "Klakson dan wiper", "Hon dan pengelap"),
  L("Mirrors and windscreen", "Spion dan kaca depan", "Cermin dan cermin depan"), L("Seat belts", "Sabuk pengaman", "Tali pinggang keledar"),
  L("No fluid leaks", "Tidak ada kebocoran cairan", "Tiada kebocoran cecair"), L("Fire extinguisher and first aid", "APAR dan P3K", "Pemadam api dan pertolongan cemas")
];
const DR_TRIPS = [[L("Main Gate", "Gerbang Utama", "Pintu Utama"), L("Process Unit", "Unit Proses", "Unit Proses"), "4.2"], [L("Process Unit", "Unit Proses", "Unit Proses"), L("Warehouse", "Gudang", "Gudang"), "2.8"], [L("Warehouse", "Gudang", "Gudang"), L("Main Gate", "Gerbang Utama", "Pintu Utama"), "3.5"]];
const DR_SEED = [{ f: DR_TRIPS[1][0], to: DR_TRIPS[1][1], km: "2.8", t: "07:55" }, { f: DR_TRIPS[0][0], to: DR_TRIPS[0][1], km: "4.2", t: "07:30" }];
const driver = {
  title: L("Driver's Log & Pre-Use Checklist", "Log Pengemudi & Cek Pra-Pakai", "Log Pemandu & Senarai Semak Pra-Guna"),
  fresh: () => ({ veh: null, ans: Array(8).fill(null), res: null, trips: [] }),
  view(S) {
    const list = r => `<li><span class="id">${r.t}</span><span class="grow">${tr(r.f)} → ${tr(r.to)}<br><small>${r.km} km</small></span></li>`;
    if (S.res) {
      const r = S.res, trips = [...S.trips, ...DR_SEED];
      return (r.fails.length ? `<div class="res bad"><b>✖ ${tr(L("Vehicle NOT cleared", "Kendaraan TIDAK diizinkan", "Kenderaan TIDAK dibenarkan"))}</b><p>${tr(L("HSSE and the workshop were notified (sample). The vehicle stays parked until the defect is fixed.", "HSSE dan bengkel diberi tahu (contoh). Kendaraan tetap parkir sampai cacat diperbaiki.", "HSSE dan bengkel dimaklumkan (sampel). Kenderaan kekal diparkir sehingga kecacatan dibaiki."))}</p><ul>${r.fails.map(f => `<li>${tr(f)}</li>`).join("")}</ul></div>`
        : `<div class="res"><b>✔ ${tr(L("Cleared to drive", "Diizinkan berkendara", "Dibenarkan memandu"))} · ${lab(DR_VEH, r.veh)}</b><p>${tr(L("Pre-use check saved at", "Cek pra-pakai tersimpan pukul", "Semakan pra-guna disimpan pada"))} ${r.t}. ${tr(L("Log today's trips below.", "Catat perjalanan hari ini di bawah.", "Rekod perjalanan hari ini di bawah."))}</p></div>`) +
        (r.fails.length ? "" : card(0, L("Today's trips", "Perjalanan hari ini", "Perjalanan hari ini"), `<ul class="rows">${trips.slice(0, 5).map(list).join("")}</ul><div class="actions"><button class="btn big" data-act="trip">${tr(L("Add a trip", "Tambah perjalanan", "Tambah perjalanan"))}</button></div>`)) +
        `<div class="actions" style="margin:0"><button class="btn yellow big" data-act="again">${tr(L("New check", "Cek baru", "Semakan baharu"))}</button></div>`;
    }
    const done = S.ans.filter(a => a).length, ok = S.veh && done === 8;
    const rows = DR_CHK.map((q, i) => `<div class="chk"><span class="q">${tr(q)}</span><span class="a"><button class="chip ${S.ans[i] === "ok" ? "on" : ""}" data-act="ans" data-i="${i}" data-v="ok">✔ ${tr(L("OK", "OK", "OK"))}</button><button class="chip bad ${S.ans[i] === "bad" ? "on" : ""}" data-act="ans" data-i="${i}" data-v="bad">✖ ${tr(L("Defect", "Cacat", "Kecacatan"))}</button></span></div>`).join("");
    return card(1, L("Vehicle", "Kendaraan", "Kenderaan"), chips("veh", DR_VEH, S.veh)) +
      card(2, L("Pre-use checklist", "Cek pra-pakai", "Senarai semak pra-guna"), `<div class="sbar"><button class="btn ghost" data-act="allok">${tr(L("Mark all OK", "Tandai semua OK", "Tandakan semua OK"))}</button><span style="color:var(--muted)">${done} / 8</span></div>${rows}`) +
      `<div class="actions" style="margin:0"><button class="btn yellow big" data-act="submit" ${ok ? "" : "disabled"}>${tr(L("Submit check", "Kirim cek", "Hantar semakan"))}</button></div>`;
  },
  acts: {
    ans: (S, el) => { S.ans[+el.dataset.i] = el.dataset.v; },
    allok: S => { S.ans = Array(8).fill("ok"); },
    submit: S => { if (!(S.veh && S.ans.every(a => a))) return; S.res = { veh: S.veh, t: now(), fails: DR_CHK.filter((q, i) => S.ans[i] === "bad") }; },
    trip: S => { const k = DR_TRIPS[S.trips.length % 3]; S.trips.unshift({ f: k[0], to: k[1], km: k[2], t: now() }); },
    again: S => { S.veh = null; S.ans = Array(8).fill(null); S.res = null; }
  }
};

/* ================= HSSE TRACKER (read-only dashboard) ================= */
const SHARE = { kks: .38, pbs: .27, wen: .22, gsb: .13 };
const HRS = [318000, 331000, 342000, 355000, 362000, 371000], UAM = [980, 1010, 1100, 1150, 1190, 1260];
const MONTHS = [L("Jun", "Jun", "Jun"), L("Jul", "Jul", "Jul"), L("Aug", "Agu", "Ogo"), L("Sep", "Sep", "Sep"), L("Oct", "Okt", "Okt"), L("Nov", "Nov", "Nov")];
const TOT = { all: [3700000, 2600, 7300], kks: [1400000, 1000, 2900], pbs: [1000000, 700, 2000], wen: [800000, 550, 1500], gsb: [500000, 350, 900] };
const track = {
  title: L("HSSE Tracker", "HSSE Tracker", "HSSE Tracker"),
  fresh: () => ({ c: "all", m: 5 }),
  view(S) {
    const sh = S.c === "all" ? 1 : SHARE[S.c], hrs = HRS.map(v => Math.round(v * sh / 1000) * 1000), max = Math.max(...hrs);
    const t = TOT[S.c];
    const cf = [["all", L("All", "Semua", "Semua")], ...CONTR];
    const bars = hrs.map((v, i) => { const h = v / max * 170, x = 40 + i * 78; return `<g data-act="month" data-v="${i}" style="cursor:pointer"><rect x="${x}" y="${200 - h}" width="56" height="${h}" rx="6" fill="${i === S.m ? "#ffc600" : "#44a276"}"/><text x="${x + 28}" y="${194 - h}" text-anchor="middle" font-size="13" fill="#c9c9cc">${Math.round(v / 1000)}k</text><text x="${x + 28}" y="222" text-anchor="middle" font-size="14" fill="#a8a8ad">${tr(MONTHS[i])}</text></g>`; }).join("");
    return `<div class="sbar">${chips("c", cf, S.c, "sm")}</div>
      <div class="kpis"><div class="kpi"><b>${t[0] >= 1e6 ? (t[0] / 1e6).toFixed(1) + "M+" : num(t[0])}</b><span>${tr(L("Work hours (sample)", "Jam kerja (contoh)", "Jam kerja (sampel)"))}</span></div>
      <div class="kpi"><b>0</b><span>${tr(L("Lost-time injuries", "Cedera hilang waktu kerja", "Kecederaan masa hilang"))}</span></div>
      <div class="kpi"><b>${num(t[1])}+</b><span>${tr(L("Inducted", "Terinduksi", "Diinduksi"))}</span></div>
      <div class="kpi y"><b>${num(t[2])}+</b><span>${tr(L("Hazards reported", "Bahaya dilaporkan", "Bahaya dilaporkan"))}</span></div></div>
      ${card(0, L("Monthly work hours (tap a month)", "Jam kerja bulanan (sentuh bulan)", "Jam kerja bulanan (sentuh bulan)"), `<div class="chart"><svg viewBox="0 0 520 232" role="img">${bars}</svg></div>`)}
      ${card(0, L("Selected month", "Bulan terpilih", "Bulan dipilih"), `<div class="kpis" style="margin:0"><div class="kpi"><b>${tr(MONTHS[S.m])}</b><span>${tr(L("Month", "Bulan", "Bulan"))}</span></div><div class="kpi"><b>${num(hrs[S.m])}</b><span>${tr(L("Work hours", "Jam kerja", "Jam kerja"))}</span></div><div class="kpi"><b>${num(Math.round(UAM[S.m] * sh))}</b><span>UA/UC</span></div><div class="kpi"><b>0</b><span>${tr(L("Lost-time injuries", "Cedera hilang waktu kerja", "Kecederaan masa hilang"))}</span></div></div>`)}`;
  },
  acts: { month: (S, el) => { S.m = +el.dataset.v; } }
};

/* ================= SITE WALKTHROUGH CLOSE-OUT ================= */
const WK = [
  { id: "WT-211", k: "debris", loc: "ware", t: L("Loose material blocking walkway", "Material berserakan menghalangi jalur", "Bahan bersepah menghalang laluan") },
  { id: "WT-212", k: "spill", loc: "tank", t: L("Oil drip near pump", "Tetesan oli dekat pompa", "Titisan minyak berhampiran pam") },
  { id: "WT-213", k: "cable", loc: "proc", t: L("Cable across walkway", "Kabel melintang di jalur", "Kabel merentas laluan") },
  { id: "WT-214", k: "guard", loc: "boil", t: L("Open guard on rotating part", "Pelindung bagian berputar terbuka", "Pengadang bahagian berputar terbuka") }
];
function art(k, after) {
  const bg = `<rect width="240" height="150" fill="#2b2b31"/><rect y="104" width="240" height="46" fill="#3a3a41"/>`;
  const warn = `<path d="M205 24l20 34h-40z" fill="#ffc600"/><path d="M205 35v12M205 52v2" stroke="#231f20" stroke-width="3.5" stroke-linecap="round"/>`;
  const ok = `<circle cx="205" cy="42" r="19" fill="#44a276"/><path d="M196 42l7 7 13-14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  let b = "";
  if (k === "debris") b = after ? `<rect x="14" y="78" width="70" height="26" fill="#a8672a"/><rect x="14" y="62" width="70" height="14" fill="#c4813e"/>` : `<rect x="40" y="88" width="90" height="9" fill="#a8672a" transform="rotate(-12 40 88)"/><rect x="90" y="96" width="80" height="9" fill="#c4813e" transform="rotate(8 90 96)"/><rect x="60" y="102" width="60" height="9" fill="#a8672a" transform="rotate(-4 60 102)"/><rect x="130" y="82" width="40" height="9" fill="#c4813e" transform="rotate(22 130 82)"/>`;
  if (k === "spill") b = `<rect x="30" y="50" width="50" height="54" fill="#55555c"/><rect x="38" y="40" width="34" height="12" fill="#6b6b73"/>` + (after ? `<rect x="22" y="100" width="66" height="9" rx="3" fill="#44a276"/>` : `<ellipse cx="85" cy="122" rx="52" ry="12" fill="#14141a"/><ellipse cx="85" cy="120" rx="30" ry="6" fill="#2a2a32"/>`);
  if (k === "cable") b = after ? `<path d="M0 100h240" stroke="#ffc600" stroke-width="5"/><rect x="0" y="97" width="240" height="6" fill="#44a276" opacity=".0"/>` : `<path d="M0 118 C60 80 120 140 240 100" stroke="#ffc600" stroke-width="6" fill="none"/><path d="M0 128 C70 100 130 150 240 120" stroke="#e0584f" stroke-width="5" fill="none"/>`;
  if (k === "guard") b = `<rect x="50" y="52" width="110" height="52" fill="#55555c"/><circle cx="105" cy="78" r="18" fill="#6b6b73"/>` + (after ? `<rect x="44" y="46" width="122" height="64" rx="6" fill="none" stroke="#44a276" stroke-width="5"/>` : `<path d="M44 46h122v10H44z" fill="#e0584f" opacity=".0"/><path d="M168 50l16-16" stroke="#e0584f" stroke-width="5"/>`);
  return `<svg viewBox="0 0 240 150" role="img">${bg}${b}${after ? ok : warn}</svg>`;
}
const walk = {
  title: L("Site Walkthrough Close-Out", "Close-Out Walkthrough Lapangan", "Close-Out Walkthrough Tapak"),
  fresh: () => ({ sel: "WT-211", st: { "WT-211": "open", "WT-212": "open", "WT-213": "open", "WT-214": "open" }, report: false }),
  view(S) {
    const st = id => S.st[id], cnt = k => WK.filter(w => st(w.id) === k).length;
    const kpis = `<div class="kpis"><div class="kpi y"><b>${cnt("open")}</b><span>${tr(L("Open", "Terbuka", "Terbuka"))}</span></div><div class="kpi"><b>${cnt("review")}</b><span>${tr(L("In review", "Ditinjau", "Dalam semakan"))}</span></div><div class="kpi"><b>${cnt("closed")}</b><span>${tr(L("Closed", "Selesai", "Selesai"))}</span></div></div>`;
    const tabs = `<div class="sbar"><button class="chip sm ${S.report ? "" : "on"}" data-act="view" data-v="f">${tr(L("Findings", "Temuan", "Penemuan"))}</button><button class="chip sm ${S.report ? "on" : ""}" data-act="view" data-v="r">${tr(L("Pictorial report", "Laporan bergambar", "Laporan bergambar"))}</button></div>`;
    if (S.report) {
      const cl = WK.filter(w => st(w.id) === "closed");
      return kpis + tabs + (cl.length ? `<div class="rep">${cl.map(w => card(0, L(w.id + " · " + lab(LOCS, w.loc), w.id + " · " + lab(LOCS, w.loc), w.id + " · " + lab(LOCS, w.loc)), `<p style="margin-bottom:10px">${tr(w.t)}</p><div class="art"><figure>${art(w.k, false)}<figcaption>${tr(L("Before", "Sebelum", "Sebelum"))}</figcaption></figure><figure>${art(w.k, true)}<figcaption>${tr(L("After", "Sesudah", "Selepas"))}</figcaption></figure></div>`)).join("")}</div>`
        : card(0, L("Pictorial report", "Laporan bergambar", "Laporan bergambar"), `<p class="empty">${tr(L("Close at least one finding to see the before / after report.", "Selesaikan minimal satu temuan untuk melihat laporan sebelum / sesudah.", "Selesaikan sekurang-kurangnya satu penemuan untuk melihat laporan sebelum / selepas."))}</p>`));
    }
    const w = WK.find(x => x.id === S.sel) || WK[0], s = st(w.id);
    const list = `<div class="finds">${WK.map(x => `<button class="find ${x.id === w.id ? "sel" : ""}" data-act="sel" data-v="${x.id}"><span><b>${tr(x.t)}</b><small>${x.id} · ${lab(LOCS, x.loc)}</small></span><span class="tag ${st(x.id)}">${tr(st(x.id) === "open" ? L("Open", "Terbuka", "Terbuka") : st(x.id) === "review" ? L("In review", "Ditinjau", "Dalam semakan") : L("Closed", "Selesai", "Selesai"))}</span></button>`).join("")}</div>`;
    const detail = `<div class="art"><figure>${art(w.k, false)}<figcaption>${tr(L("Before · HSSE walkthrough", "Sebelum · walkthrough HSSE", "Sebelum · walkthrough HSSE"))}</figcaption></figure>
      <figure>${s === "open" ? `<div class="empty">${tr(L("Waiting for the contractor's after photo", "Menunggu foto sesudah dari kontraktor", "Menunggu gambar selepas daripada kontraktor"))}</div>` : art(w.k, true)}<figcaption>${tr(L("After · contractor", "Sesudah · kontraktor", "Selepas · kontraktor"))}</figcaption></figure></div>
      <div class="actions" style="margin-top:14px">${s === "open" ? `<div style="width:100%"><div class="role">${tr(L("As the contractor (IC)", "Sebagai kontraktor (IC)", "Sebagai kontraktor (IC)"))}</div><button class="btn yellow big" data-act="after">${tr(L("Add after photo and close", "Tambah foto sesudah dan tutup", "Tambah gambar selepas dan tutup"))}</button></div>`
        : s === "review" ? `<div style="width:100%"><div class="role">${tr(L("As HSSE", "Sebagai HSSE", "Sebagai HSSE"))}</div><button class="btn yellow big" data-act="accept">${tr(L("Accept close-out", "Terima close-out", "Terima close-out"))}</button></div>`
        : `<div class="res" style="margin:0;width:100%"><b>✔ ${tr(L("Closed", "Selesai", "Selesai"))}</b><p>${tr(L("Added to the pictorial report.", "Ditambahkan ke laporan bergambar.", "Ditambah ke laporan bergambar."))}</p></div>`}</div>`;
    return kpis + tabs + `<div class="wk">${card(0, L("Findings", "Temuan", "Penemuan"), list)}${card(0, L("Close-out", "Close-out", "Close-out"), detail)}</div>`;
  },
  acts: {
    view: (S, el) => { S.report = el.dataset.v === "r"; },
    sel: (S, el) => { S.sel = el.dataset.v; },
    after: S => { S.st[S.sel] = "review"; },
    accept: S => { S.st[S.sel] = "closed"; const nx = WK.find(w => S.st[w.id] === "open"); if (nx) S.sel = nx.id; }
  }
};

/* ================= engine ================= */
const MODS = { uauc, gate, driver, track, walk };
const M = MODS[APP] || uauc;
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || M.fresh(); } catch (e) { S = M.fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

function toast(msg) { const el = $("#toast"); el.textContent = msg; el.className = "toast on"; clearTimeout(toast.t); toast.t = setTimeout(() => el.className = "toast", 2200); }
function render() {
  document.documentElement.lang = I18N.lang;
  document.title = tr(M.title) + " – EcoOils Demo Hub";
  $("#ribbon").textContent = tr(C.ribbon); $("#back").textContent = tr(C.back); $("#bReset").textContent = tr(C.reset);
  $("#title").textContent = tr(M.title); $("#foot").textContent = tr(C.foot); $("#ver").textContent = DV;
  document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === I18N.lang));
  $("#stage").innerHTML = M.view(S);
}
function reset(auto) { S = M.fresh(); save(); render(); window.scrollTo(0, 0); if (auto) toast(tr(C.idle)); }

let idleT;
function bump() { clearTimeout(idleT); idleT = setTimeout(() => { try { localStorage.removeItem(KEY); } catch (e) {} location.href = "index.html#attract"; }, IDLE_MS); }

document.addEventListener("DOMContentLoaded", () => {
  I18N.set(I18N.lang);
  document.addEventListener("click", e => {
    const l = e.target.closest(".lang button"); if (l) { I18N.set(l.dataset.l); render(); return; }
    const a = e.target.closest("[data-act]"); if (!a) return;
    const act = a.dataset.act;
    if (act === "set") S[a.dataset.f] = a.dataset.v;
    else if (M.acts[act]) M.acts[act](S, a);
    save(); render();
  });
  document.addEventListener("input", e => { const f = e.target.dataset && e.target.dataset.in; if (f) { S[f] = e.target.value; save(); } });
  $("#bReset").onclick = () => reset(false);
  ["pointerdown", "keydown", "touchstart"].forEach(ev => document.addEventListener(ev, bump, { passive: true }));
  bump(); render();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
});
