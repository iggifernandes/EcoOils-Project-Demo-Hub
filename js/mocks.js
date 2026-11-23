/* Mock screens + tour steps for the 9 apps. ALL data below is fictional sample data.
   Each mock is plain HTML; elements with data-t="..." can be spotlighted by a tour step.
   Step texts are [en, id, ms]. */

/* ---------- tiny SVG chart helpers (no library) ---------- */
const G = "#44a276", Y = "#ffc600", R = "#e0584f", GR = "#c9c9c9", TX = "#6e6b6c";
function lineChart(series, labels, h = 150) {
  const w = 420, p = 26, all = series.flatMap(s => s.d), max = Math.max(...all) * 1.15 || 1;
  const n = labels.length, x = k => p + k * (w - p * 2) / (n - 1), y = v => h - 22 - v / max * (h - 40);
  const lines = series.map(s => `<polyline fill="none" stroke="${s.c}" stroke-width="2.5" points="${s.d.map((v, k) => x(k) + "," + y(v)).join(" ")}"/>` +
    s.d.map((v, k) => `<circle cx="${x(k)}" cy="${y(v)}" r="3" fill="${s.c}"/>`).join("")).join("");
  const grid = [0, .5, 1].map(f => `<line x1="${p}" x2="${w - p}" y1="${y(max * f / 1.15 * 1.15 * .87)}" y2="${y(max * f / 1.15 * 1.15 * .87)}" stroke="#eee"/>`).join("");
  const lab = labels.map((l, k) => `<text x="${x(k)}" y="${h - 6}" font-size="10" fill="${TX}" text-anchor="middle">${l}</text>`).join("");
  return `<svg class="ch" viewBox="0 0 ${w} ${h}" role="img">${grid}${lines}${lab}</svg>`;
}
function barChart(vals, labels, color = G, h = 140, hi = -1) {
  const w = 420, p = 20, n = vals.length, bw = (w - p * 2) / n * .6, max = Math.max(...vals) * 1.15;
  return `<svg class="ch" viewBox="0 0 ${w} ${h}" role="img">` + vals.map((v, k) => {
    const bh = v / max * (h - 36), bx = p + k * (w - p * 2) / n + ((w - p * 2) / n - bw) / 2;
    return `<rect x="${bx}" y="${h - 20 - bh}" width="${bw}" height="${bh}" rx="3" fill="${k === hi ? Y : color}"/>
      <text x="${bx + bw / 2}" y="${h - 22 - bh}" font-size="10" fill="${TX}" text-anchor="middle">${v}</text>
      <text x="${bx + bw / 2}" y="${h - 6}" font-size="10" fill="${TX}" text-anchor="middle">${labels[k]}</text>`;
  }).join("") + `</svg>`;
}
function donut(pct, label, color = G, size = 130) {
  const r = 48, c = 2 * Math.PI * r;
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" role="img"><circle cx="60" cy="60" r="${r}" fill="none" stroke="#e6e6e6" stroke-width="14"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-dasharray="${c * pct / 100} ${c}" transform="rotate(-90 60 60)" stroke-linecap="round"/>
    <text x="60" y="64" text-anchor="middle" font-size="22" fill="#231f20" font-family="Jost,sans-serif">${pct}%</text>
    <text x="60" y="80" text-anchor="middle" font-size="8" fill="${TX}">${label}</text></svg>`;
}
const bar = (t, tag = "SAMPLE") => `<div class="bar"><b>${t}</b><span class="pill y">${tag}</span></div>`;
const sceneSvg = (tidy) => `<svg class="ph" viewBox="0 0 240 120" role="img" aria-label="${tidy ? "after" : "before"} sample illustration">
  <rect width="240" height="120" fill="${tidy ? "#e8f3ed" : "#f1e9e6"}"/><rect y="88" width="240" height="32" fill="#cfcfcf"/>
  ${tidy
    ? `<rect x="30" y="52" width="180" height="8" fill="#8a8a8a"/><rect x="40" y="60" width="6" height="28" fill="#8a8a8a"/><rect x="194" y="60" width="6" height="28" fill="#8a8a8a"/><rect x="60" y="72" width="40" height="16" fill="${G}"/><rect x="110" y="72" width="40" height="16" fill="${G}"/><path d="M200 24l8 8 14-16" stroke="${G}" stroke-width="5" fill="none"/>`
    : `<rect x="30" y="56" width="180" height="8" fill="#8a8a8a" transform="rotate(-6 120 60)"/><rect x="50" y="78" width="30" height="10" fill="#b5651d" transform="rotate(14 60 80)"/><rect x="100" y="84" width="50" height="5" fill="#777" transform="rotate(-20 120 86)"/><circle cx="170" cy="82" r="8" fill="#555"/><path d="M196 18l24 24M220 18l-24 24" stroke="${R}" stroke-width="5"/>`}</svg>`;
function qrSvg(text) {
  try { const q = qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }
  catch (e) { return "<div style='width:140px;height:140px;background:#ddd'></div>"; }
}
const S = (sel, title, text) => ({ sel, title, text });

/* ---------- the 9 tours ---------- */
const TOURS = {
  uauc: {
    title: ["UA/UC Reporting", "Pelaporan UA/UC", "Pelaporan UA/UC"],
    mock: () => `${bar("UA / UC Reporting")}
      <div class="row"><div class="card"><h5>New report</h5>
        <div class="field" data-t="type"><label>Type</label><div class="opts"><span class="opt warn on">Unsafe Act</span><span class="opt">Unsafe Condition</span><span class="opt">Good Catch</span></div></div>
        <div class="field"><label>Location</label><div class="inp">Area 3 · Pipe rack (sample)</div></div>
        <div class="field" data-t="photo"><label>Photo</label><div class="photo">+ Add photo</div></div>
        <div class="go" data-t="submit">Submit report</div></div>
      <div class="card" data-t="trend"><h5>Reports per week</h5>
        ${lineChart([{ d: [12, 15, 11, 18, 22, 19, 25, 21], c: G }, { d: [6, 9, 8, 12, 16, 15, 20, 19], c: Y }], ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"])}
        <div class="chart-t"><span style="color:${G}">●</span> raised &nbsp; <span style="color:#b88d00">●</span> closed</div></div></div>
      <div class="card" data-t="closed"><h5>Latest reports</h5><table><tr><th>ID</th><th>Type</th><th>Area</th><th>Status</th></tr>
        <tr><td>UA-0142</td><td>Unsafe Act</td><td>Area 3</td><td><span class="pill g">Closed</span></td></tr>
        <tr><td>UC-0141</td><td>Unsafe Condition</td><td>Laydown 2</td><td><span class="pill y">In progress</span></td></tr>
        <tr><td>UC-0140</td><td>Unsafe Condition</td><td>Road B</td><td><span class="pill r">Open</span></td></tr></table></div>`,
    steps: [
      S("type", ["Pick what you saw", "Pilih yang Anda lihat", "Pilih apa yang anda nampak"], ["One tap: unsafe act, unsafe condition or good catch.", "Satu sentuhan: tindakan tidak aman, kondisi tidak aman, atau good catch.", "Satu sentuhan: tindakan tidak selamat, keadaan tidak selamat atau good catch."]),
      S("photo", ["Snap a photo", "Ambil foto", "Ambil gambar"], ["Add evidence from the phone camera. No typing needed.", "Tambahkan bukti dari kamera ponsel. Tanpa mengetik.", "Tambah bukti dari kamera telefon. Tanpa menaip."]),
      S("submit", ["Report a hazard in 20 seconds", "Laporkan bahaya dalam 20 detik", "Laporkan bahaya dalam 20 saat"], ["Submit and HSSE is notified straight away.", "Kirim dan HSSE langsung diberi tahu.", "Hantar dan HSSE terus dimaklumkan."]),
      S("trend", ["Trends, not guesses", "Tren, bukan tebakan", "Aliran, bukan tekaan"], ["The dashboard shows raised versus closed reports every week.", "Dasbor menampilkan laporan masuk dan selesai tiap minggu.", "Papan pemuka menunjukkan laporan dibangkitkan dan ditutup setiap minggu."]),
      S("closed", ["Close the loop", "Tutup sampai tuntas", "Selesaikan hingga tuntas"], ["Every report has an owner and a status until it is closed.", "Setiap laporan punya penanggung jawab dan status sampai ditutup.", "Setiap laporan ada pemilik dan status sehingga ditutup."])]
  },
  gate: {
    title: ["Gate Pass", "Gate Pass", "Pas Pintu Masuk"],
    mock: () => `${bar("Material Gate Pass")}
      <div class="row"><div class="card" data-t="items"><h5>Request</h5><table><tr><th>Item</th><th>Qty</th><th>Reason</th></tr>
        <tr><td>Scaffold tubes</td><td>40</td><td>Return to vendor</td></tr><tr><td>Spare pump (sample)</td><td>1</td><td>Repair off-site</td></tr></table>
        <div class="go" style="margin-top:10px">Send for approval</div></div>
      <div class="card" data-t="approve"><h5>Approval</h5><p>Requested by: <b>User A</b></p><p style="margin:6px 0 10px">Approver: <b>HSSE Officer (sample)</b></p>
        <div class="opts"><span class="opt on">Approve</span><span class="opt">Reject</span></div></div></div>
      <div class="row"><div class="card"><h5>Pass issued</h5><div class="qrbox" data-t="qr">${qrSvg("DEMO-GATEPASS-0001")}</div><p style="text-align:center">GP-0001 · valid today</p></div>
      <div class="card"><div data-t="guard"><h5>Security gate</h5><div class="opts" style="margin-bottom:8px"><span class="opt on">Scan QR</span></div><p><span class="pill g">VALID</span> &nbsp;2 items · exit 14:32</p></div>
        <div data-t="log" style="margin-top:14px"><h5>Gate log</h5><table><tr><td>14:32</td><td>GP-0001</td><td><span class="pill g">Out</span></td></tr><tr><td>11:05</td><td>GP-0000</td><td><span class="pill g">Out</span></td></tr></table></div></div></div>`,
    steps: [
      S("items", ["List what leaves site", "Daftar barang keluar", "Senaraikan barang keluar tapak"], ["Add items, quantity and reason in a simple form.", "Isi barang, jumlah dan alasan dalam formulir sederhana.", "Isi barang, kuantiti dan sebab dalam borang mudah."]),
      S("approve", ["One tap approval", "Persetujuan satu sentuhan", "Kelulusan satu sentuhan"], ["The approver gets it on the phone and approves or rejects.", "Penyetuju menerimanya di ponsel lalu menyetujui atau menolak.", "Pelulus menerimanya di telefon dan meluluskan atau menolak."]),
      S("qr", ["A QR pass, not paper", "Pas QR, bukan kertas", "Pas QR, bukan kertas"], ["Approved requests become a QR code on the driver's phone.", "Permintaan yang disetujui menjadi kode QR di ponsel pengemudi.", "Permintaan yang diluluskan menjadi kod QR di telefon pemandu."]),
      S("guard", ["Guard scans, instantly", "Satpam memindai", "Pengawal mengimbas"], ["Security scans and sees valid or not valid in a second.", "Keamanan memindai dan melihat sah atau tidak dalam sedetik.", "Keselamatan mengimbas dan lihat sah atau tidak dalam sesaat."]),
      S("log", ["Everything logged", "Semua tercatat", "Semua direkodkan"], ["Every movement is recorded with time. Audit-ready.", "Setiap pergerakan tercatat dengan waktu. Siap audit.", "Setiap pergerakan direkod dengan masa. Sedia audit."])]
  },
  walk: {
    title: ["Walkthrough", "Walkthrough", "Walkthrough"],
    mock: () => `${bar("Site Walkthrough Close-Out")}
      <div class="row"><div class="card" data-t="before"><h5>Before · HSSE</h5>${sceneSvg(false)}<p style="margin-top:6px">Loose materials blocking walkway</p></div>
      <div class="card" data-t="send"><h5>Send to contractor</h5><div class="field"><label>Contractor</label><div class="inp">Contractor B (sample)</div></div><div class="field"><label>Due</label><div class="inp">in 2 days</div></div><div class="go y">Send observation</div></div></div>
      <div class="row"><div class="card" data-t="after"><h5>After · Contractor</h5>${sceneSvg(true)}<p style="margin-top:6px">Walkway cleared and materials racked</p></div>
      <div class="card" data-t="status"><h5>Close-out status</h5><div class="kpis"><div class="kpi"><b>18</b><span>Closed</span></div><div class="kpi y"><b>4</b><span>Open</span></div></div><div class="prog"><i style="width:82%"></i></div></div></div>
      <div class="card" data-t="report"><h5>Pictorial report</h5><div class="row"><div>${sceneSvg(false)}</div><div>${sceneSvg(true)}</div></div><div class="go" style="margin-top:8px">Export report</div></div>`,
    steps: [
      S("before", ["Photograph the finding", "Foto temuannya", "Ambil gambar penemuan"], ["HSSE records the observation with a photo on the walk.", "HSSE mencatat temuan dengan foto saat berkeliling.", "HSSE merekod penemuan dengan gambar semasa meronda."]),
      S("send", ["Send it to the owner", "Kirim ke pemiliknya", "Hantar kepada pemiliknya"], ["The right contractor gets it with a due date.", "Kontraktor yang tepat menerimanya dengan tenggat.", "Kontraktor yang betul menerimanya dengan tarikh akhir."]),
      S("after", ["They send the fix", "Mereka kirim perbaikannya", "Mereka hantar pembetulan"], ["The contractor uploads an after photo when done.", "Kontraktor mengunggah foto sesudah saat selesai.", "Kontraktor memuat naik gambar selepas apabila siap."]),
      S("status", ["Open or closed, clear", "Terbuka atau tutup, jelas", "Terbuka atau tutup, jelas"], ["Everyone sees what is still open at a glance.", "Semua orang melihat yang masih terbuka sekilas.", "Semua orang nampak yang masih terbuka sekali pandang."]),
      S("report", ["Before and after report", "Laporan sebelum dan sesudah", "Laporan sebelum dan selepas"], ["A ready pictorial report for the weekly review.", "Laporan bergambar siap untuk tinjauan mingguan.", "Laporan bergambar siap untuk semakan mingguan."])]
  },
  track: {
    title: ["HSSE Tracker", "HSSE Tracker", "HSSE Tracker"],
    mock: () => `${bar("HSSE Performance Tracker")}
      <div class="kpis" data-t="kpis"><div class="kpi"><b>3.6M+</b><span>Work hours</span></div><div class="kpi"><b>0.00</b><span>TRCF</span></div><div class="kpi"><b>0.00</b><span>LTIF</span></div><div class="kpi y"><b>96%</b><span>Inspections on time</span></div></div>
      <div class="row"><div class="card" data-t="hours"><h5>Work hours per month (k)</h5>${barChart([310, 335, 352, 368, 390, 412], ["Apr", "May", "Jun", "Jul", "Aug", "Sep"], G, 140, 5)}</div>
      <div class="card" data-t="uauc"><h5>UA/UC raised</h5>${lineChart([{ d: [42, 51, 47, 63, 70, 66], c: Y }], ["Apr", "May", "Jun", "Jul", "Aug", "Sep"])}</div></div>
      <div class="row"><div class="card" data-t="lead"><h5>Leading indicators</h5><table><tr><td>Toolbox talks</td><td><span class="pill g">98%</span></td></tr><tr><td>Permit audits</td><td><span class="pill g">94%</span></td></tr><tr><td>Training compliance</td><td><span class="pill y">89%</span></td></tr></table></div>
      <div class="card" data-t="month"><h5>Month record</h5><p>September (sample)</p><p style="margin:6px 0"><span class="pill g">Verified by HSSE</span></p><div class="go">Lock month</div></div></div>`,
    steps: [
      S("kpis", ["The numbers that matter", "Angka yang penting", "Angka yang penting"], ["Work hours, TRCF and LTIF in one glance: 3.6M+ hours, 0.00 recordable and lost-time rates (sample).", "Jam kerja, TRCF dan LTIF sekilas: 3,6 juta+ jam, 0,00 (contoh).", "Jam kerja, TRCF dan LTIF sekali pandang: 3.6 juta+ jam, 0.00 (sampel)."]),
      S("hours", ["Hours keep climbing safely", "Jam terus naik dengan aman", "Jam terus meningkat dengan selamat"], ["Monthly work hours without losing a day.", "Jam kerja bulanan tanpa kehilangan hari kerja.", "Jam kerja bulanan tanpa kehilangan hari."]),
      S("uauc", ["Reporting culture", "Budaya melapor", "Budaya melapor"], ["More UA/UC reports means more eyes on safety.", "Lebih banyak laporan UA/UC berarti lebih banyak mata menjaga keselamatan.", "Lebih banyak laporan UA/UC bermakna lebih banyak mata menjaga keselamatan."]),
      S("lead", ["Lead, don't just lag", "Pimpin, bukan hanya mencatat", "Pimpin, bukan hanya merekod"], ["Leading indicators show problems before an incident.", "Indikator awal menunjukkan masalah sebelum insiden.", "Penunjuk awal menunjukkan masalah sebelum insiden."]),
      S("month", ["One trusted monthly record", "Satu catatan bulanan tepercaya", "Satu rekod bulanan dipercayai"], ["HSSE verifies and locks each month.", "HSSE memverifikasi dan mengunci tiap bulan.", "HSSE mengesahkan dan mengunci setiap bulan."])]
  },
  disc: {
    title: ["Disciplinary Record", "Catatan Disiplin", "Rekod Disiplin"],
    mock: () => `${bar("Site Safety Warning Record")}
      <div class="row"><div class="card" data-t="pick"><h5>Person</h5><div class="field"><label>Crew member</label><div class="inp">Worker A-014 (sample)</div></div><div class="field"><label>Contractor</label><div class="inp">Contractor C (sample)</div></div></div>
      <div class="card" data-t="viol"><h5>Violation</h5><div class="field"><label>Rule broken</label><div class="inp">Working at height without harness</div></div><div class="photo" style="height:70px">Evidence photo</div></div></div>
      <div class="card" data-t="ladder"><h5>Warning ladder</h5><div class="ladder"><div class="rung" style="background:#fff0b3;color:#7a5d00"><b>SP1</b>This warning</div><div class="rung"><b>SP2</b>Next</div><div class="rung"><b>SP3</b>Final</div></div></div>
      <div class="row"><div class="card" data-t="sign"><h5>Sign-off</h5><div class="chk"><span>Issued by HSSE</span><span class="pill g">Signed</span></div><div class="chk"><span>Contractor manager</span><span class="pill g">Signed</span></div><div class="chk"><span>Crew member</span><span class="pill y">Pending</span></div></div>
      <div class="card" data-t="hist"><h5>Record</h5><table><tr><th>Date</th><th>Level</th><th>Status</th></tr><tr><td>12 Oct</td><td>SP1</td><td><span class="pill y">Active</span></td></tr><tr><td>03 Mar</td><td>SP1</td><td><span class="pill">Expired</span></td></tr></table></div></div>`,
    steps: [
      S("pick", ["Find the person", "Cari orangnya", "Cari individu"], ["Select the crew member and contractor from the register.", "Pilih pekerja dan kontraktor dari daftar.", "Pilih pekerja dan kontraktor daripada daftar."]),
      S("viol", ["Record the facts", "Catat faktanya", "Rekod fakta"], ["Rule broken, evidence and photo, all in one place.", "Aturan yang dilanggar, bukti dan foto di satu tempat.", "Peraturan dilanggar, bukti dan gambar di satu tempat."]),
      S("ladder", ["SP1, SP2, SP3 automatically", "SP1, SP2, SP3 otomatis", "SP1, SP2, SP3 automatik"], ["The app knows the history and picks the right level.", "Aplikasi tahu riwayatnya dan memilih tingkat yang tepat.", "Aplikasi tahu sejarahnya dan memilih tahap yang betul."]),
      S("sign", ["Signed, not chased", "Ditandatangani, tanpa mengejar", "Ditandatangani, tanpa dikejar"], ["Each signature is tracked until complete.", "Setiap tanda tangan dipantau sampai lengkap.", "Setiap tandatangan dijejak sehingga lengkap."]),
      S("hist", ["Fair and consistent", "Adil dan konsisten", "Adil dan konsisten"], ["A full history keeps decisions consistent for everyone.", "Riwayat lengkap menjaga keputusan konsisten untuk semua.", "Sejarah penuh memastikan keputusan konsisten untuk semua."])]
  },
  evr: {
    title: ["Equipment & Vehicle Register", "Register Alat Berat & Kendaraan", "Daftar Peralatan Berat & Kenderaan"],
    mock: () => `${bar("Heavy Equipment & Vehicle Register")}
      <div class="row"><div class="card" data-t="donut" style="text-align:center"><h5>Documents valid</h5>${donut(92, "compliant")}</div>
      <div class="card" data-t="alert"><h5>Expiring soon</h5><table><tr><td>VEH-017 · Pickup</td><td><span class="pill r">Insurance · 3 days</span></td></tr><tr><td>EQ-004 · Crane</td><td><span class="pill y">Cert · 21 days</span></td></tr><tr><td>EQ-009 · Excavator</td><td><span class="pill y">KIR · 28 days</span></td></tr></table></div></div>
      <div class="card" data-t="table"><h5>Register</h5><table><tr><th>ID</th><th>Type</th><th>Contractor</th><th>Operator cert</th><th>Status</th></tr>
        <tr><td>EQ-004</td><td>Crane</td><td>Contractor A</td><td>Valid</td><td><span class="pill y">Check</span></td></tr>
        <tr><td>EQ-009</td><td>Excavator</td><td>Contractor B</td><td>Valid</td><td><span class="pill g">OK</span></td></tr>
        <tr><td>VEH-017</td><td>Pickup</td><td>Contractor D</td><td>n/a</td><td><span class="pill r">Blocked</span></td></tr></table></div>
      <div class="row"><div class="card" data-t="add"><h5>Add a unit</h5><div class="field"><label>Documents</label><div class="photo" style="height:60px">+ Upload</div></div><div class="go">Submit for HSSE check</div></div>
      <div class="card" data-t="rule"><h5>Site entry rule</h5><p>No valid insurance and no pass. The register enforces it.</p></div></div>`,
    steps: [
      S("donut", ["Compliance at a glance", "Kepatuhan sekilas", "Pematuhan sekali pandang"], ["The share of equipment with valid documents.", "Persentase alat dengan dokumen yang berlaku.", "Peratusan peralatan dengan dokumen sah."]),
      S("alert", ["Expiry alerts", "Peringatan kedaluwarsa", "Amaran tamat tempoh"], ["See what expires next before it becomes a stop-work.", "Lihat yang segera kedaluwarsa sebelum jadi penghentian kerja.", "Lihat yang akan tamat sebelum jadi henti kerja."]),
      S("table", ["One register for all", "Satu register untuk semua", "Satu daftar untuk semua"], ["Cranes, excavators and vehicles with status.", "Crane, ekskavator dan kendaraan beserta status.", "Kren, jengkaut dan kenderaan beserta status."]),
      S("add", ["Contractors upload their own", "Kontraktor unggah sendiri", "Kontraktor muat naik sendiri"], ["Documents come from the contractor, HSSE verifies.", "Dokumen dari kontraktor, HSSE memverifikasi.", "Dokumen daripada kontraktor, HSSE mengesahkan."]),
      S("rule", ["Rules built in", "Aturan tertanam", "Peraturan terbina"], ["Entry is blocked until documents are valid.", "Masuk diblokir sampai dokumen berlaku.", "Kemasukan disekat sehingga dokumen sah."])]
  },
  driver: {
    title: ["Driver's Log & Pre-Use Checklist", "Log Pengemudi & Cek Pra-Pakai", "Log Pemandu & Senarai Semak Pra-Guna"],
    mock: () => `${bar("Driver's Log & Pre-Use Checklist")}
      <div class="row"><div class="card" data-t="pre"><h5>Pre-use checklist · VEH-021 (sample)</h5>
        <div class="chk"><span>Tyres and wheel nuts</span><span class="tg on"></span></div><div class="chk"><span>Lights and indicators</span><span class="tg on"></span></div>
        <div class="chk"><span>Brakes</span><span class="tg on"></span></div><div class="chk" data-t="defect"><span>Seatbelts</span><span class="tg bad"></span></div></div>
      <div class="card"><div data-t="odo"><h5>Odometer</h5><div class="row"><div class="field"><label>Start</label><div class="inp">48,210 km</div></div><div class="field"><label>End</label><div class="inp">48,266 km</div></div></div></div>
        <div data-t="trip" style="margin-top:8px"><h5>Today's trips</h5><table><tr><td>07:10</td><td>Gate → Area 3</td><td>12 km</td></tr><tr><td>09:40</td><td>Area 3 → Store</td><td>9 km</td></tr></table></div></div></div>
      <div class="card"><div class="go y" data-t="submit">Sign and submit log</div></div>`,
    steps: [
      S("pre", ["Check before you drive", "Periksa sebelum mengemudi", "Semak sebelum memandu"], ["A quick checklist on the phone, one tap per item.", "Daftar periksa cepat di ponsel, satu sentuhan per item.", "Senarai semak pantas di telefon, satu sentuhan setiap item."]),
      S("defect", ["Defect? Flagged at once", "Cacat? Langsung ditandai", "Kecacatan? Terus ditandakan"], ["A failed item alerts the supervisor and blocks use.", "Item gagal memberi tahu penyelia dan menahan pemakaian.", "Item gagal memaklumkan penyelia dan menyekat penggunaan."]),
      S("odo", ["Odometer in, odometer out", "Odometer awal dan akhir", "Odometer mula dan akhir"], ["Start and end readings keep distance honest.", "Angka awal dan akhir menjaga jarak tetap jujur.", "Bacaan mula dan akhir menjaga jarak tepat."]),
      S("trip", ["The daily log writes itself", "Log harian tertulis sendiri", "Log harian tertulis sendiri"], ["Trips are listed with time and distance.", "Perjalanan dicatat dengan waktu dan jarak.", "Perjalanan disenaraikan dengan masa dan jarak."]),
      S("submit", ["Sign and done", "Tanda tangan, selesai", "Tandatangan, selesai"], ["One signature closes the day, no paper.", "Satu tanda tangan menutup hari, tanpa kertas.", "Satu tandatangan menutup hari, tanpa kertas."])]
  },
  induct: {
    title: ["Site Induction", "Induksi Tapak", "Induksi Tapak"],
    mock: () => `${bar("Site Induction & Assessment")}
      <div class="row"><div class="card" data-t="modules"><h5>Modules</h5>
        <div class="chk"><span>1 · Site rules</span><span class="pill g">Done</span></div><div class="chk"><span>2 · Emergency response</span><span class="pill g">Done</span></div><div class="chk"><span>3 · Permit to work</span><span class="pill y">In progress</span></div><div class="chk"><span>4 · Lessons learned</span><span class="pill">To do</span></div></div>
      <div class="card" data-t="quiz"><h5>Question 7 of 20</h5><p style="margin-bottom:10px">What do you do on hearing the site alarm?</p><div class="opts" style="flex-direction:column"><span class="opt">Finish the job first</span><span class="opt on">Stop work, go to the assembly point</span><span class="opt">Call a friend</span></div></div></div>
      <div class="row"><div class="card" data-t="score" style="text-align:center"><h5>Result</h5>${donut(92, "passed")}</div>
      <div class="card" data-t="badge" style="text-align:center"><h5>Induction ID</h5><div class="qrbox">${qrSvg("DEMO-INDUCTION-0007")}</div><p>ID-0007 (sample)</p></div></div>
      <div class="card" data-t="counts"><h5>Inductions per week</h5>${barChart([86, 112, 97, 134, 121], ["W1", "W2", "W3", "W4", "W5"], G, 140, 3)}</div>`,
    steps: [
      S("modules", ["Learn at your own pace", "Belajar sesuai kecepatan Anda", "Belajar mengikut kadar anda"], ["Short modules in your language: EN, ID or MS.", "Modul singkat dalam bahasa Anda: EN, ID atau MS.", "Modul ringkas dalam bahasa anda: EN, ID atau MS."]),
      S("quiz", ["Prove you understood", "Buktikan Anda paham", "Buktikan anda faham"], ["A final assessment confirms the key messages.", "Penilaian akhir memastikan pesan kunci dipahami.", "Penilaian akhir mengesahkan mesej utama difahami."]),
      S("score", ["Pass mark enforced", "Nilai lulus ditegakkan", "Markah lulus dikuatkuasakan"], ["Below the pass mark, retake before site access.", "Di bawah nilai lulus, ulangi sebelum akses tapak.", "Di bawah markah lulus, ulang sebelum akses tapak."]),
      S("badge", ["A QR induction ID", "ID induksi QR", "ID induksi QR"], ["Passing creates a unique ID for the badge.", "Lulus membuat ID unik untuk lencana.", "Lulus mencipta ID unik untuk lencana."]),
      S("counts", ["Counts for management", "Angka untuk manajemen", "Angka untuk pengurusan"], ["Weekly induction numbers, ready for the report.", "Jumlah induksi mingguan, siap untuk laporan.", "Bilangan induksi mingguan, sedia untuk laporan."])]
  },
  simops: {
    title: ["SIMOPS Meeting Record", "Catatan Rapat SIMOPS", "Rekod Mesyuarat SIMOPS"],
    mock: () => `${bar("SIMOPS Meeting Record")}
      <div class="card" data-t="acts"><h5>Activities this week</h5><table><tr><th>Contractor</th><th>Activity</th><th>Area</th><th>Risk</th></tr>
        <tr><td>Contractor A</td><td>Lifting operations</td><td>Area 3</td><td><span class="pill r">High</span></td></tr>
        <tr><td>Contractor B</td><td>Hot work</td><td>Area 3</td><td><span class="pill r">High</span></td></tr>
        <tr><td>Contractor C</td><td>Pipe testing</td><td>Area 5</td><td><span class="pill y">Med</span></td></tr>
        <tr><td>Contractor D</td><td>Civil works</td><td>Road B</td><td><span class="pill g">Low</span></td></tr></table></div>
      <div class="row"><div class="card" data-t="matrix"><h5>Conflicts</h5><table><tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th></tr>
        <tr><td>A</td><td>·</td><td><span class="pill r">✕</span></td><td><span class="pill g">✓</span></td><td><span class="pill g">✓</span></td></tr>
        <tr><td>B</td><td><span class="pill r">✕</span></td><td>·</td><td><span class="pill y">!</span></td><td><span class="pill g">✓</span></td></tr></table></div>
      <div class="card" data-t="constraint"><h5>Agreed controls</h5><div class="chk"><span>Hot work moves to Tuesday</span><span class="pill g">Agreed</span></div><div class="chk"><span>Barricade Area 3 north</span><span class="pill g">Agreed</span></div></div></div>
      <div class="row"><div class="card" data-t="sign"><h5>Sign-off</h5><div class="chk"><span>Contractor A</span><span class="pill g">✓</span></div><div class="chk"><span>Contractor B</span><span class="pill g">✓</span></div></div>
      <div class="card" data-t="print"><h5>Minutes</h5><div class="go">Print one-page minutes</div></div></div>`,
    steps: [
      S("acts", ["Everyone's work in one view", "Semua pekerjaan dalam satu tampilan", "Semua kerja dalam satu paparan"], ["Activities by contractor, area and risk.", "Aktivitas per kontraktor, area dan risiko.", "Aktiviti mengikut kontraktor, kawasan dan risiko."]),
      S("matrix", ["Spot clashes early", "Temukan benturan lebih awal", "Kesan percanggahan awal"], ["The matrix shows which jobs cannot run together.", "Matriks menunjukkan pekerjaan yang tak boleh bersamaan.", "Matriks menunjukkan kerja yang tidak boleh serentak."]),
      S("constraint", ["Agree the controls", "Sepakati pengendalian", "Persetujui kawalan"], ["Decisions are written down in the meeting.", "Keputusan dicatat langsung dalam rapat.", "Keputusan ditulis terus dalam mesyuarat."]),
      S("sign", ["Sign on the screen", "Tanda tangan di layar", "Tandatangan di skrin"], ["Each contractor confirms on the spot.", "Setiap kontraktor mengonfirmasi di tempat.", "Setiap kontraktor mengesahkan di tempat."]),
      S("print", ["One-page minutes", "Notulen satu halaman", "Minit satu muka surat"], ["Print or share the minutes straight away.", "Cetak atau bagikan notulen langsung.", "Cetak atau kongsi minit serta-merta."])]
  }
};
