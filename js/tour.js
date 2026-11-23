/* Tiny guided-tour engine (no library). A tour = a mock screen + steps [{sel, title, text}].
   Spotlight = a fixed box whose huge box-shadow darkens everything else. */
const Tour = (() => {
  let root, frame, screen, spot, cap, cur = null, i = 0;

  function build() {
    root = document.createElement("div");
    root.className = "tour";
    root.innerHTML = `<div class="frame" role="dialog" aria-modal="true">
      <div class="frame-bar"><span class="fb-title"></span><b class="fb-rib"></b></div>
      <div class="screen m"></div></div>`;
    document.body.appendChild(root);
    spot = document.createElement("div"); spot.className = "spot"; spot.hidden = true;
    cap = document.createElement("div"); cap.className = "cap"; cap.hidden = true;
    document.body.append(spot, cap);
    frame = root.querySelector(".frame");
    screen = root.querySelector(".screen");
    const peek = document.createElement("div"); peek.className = "peek"; peek.innerHTML = "<div></div>"; document.body.appendChild(peek);
    peek.onclick = () => peek.classList.remove("on");
    screen.addEventListener("click", e => { const p = e.target.closest("svg.ph, .photo"); if (!p) return;
      peek.firstChild.innerHTML = p.tagName === "svg" ? p.outerHTML : "<p style='padding:60px;text-align:center;color:#666'>Sample photo placeholder</p>"; peek.classList.add("on"); });
    window.addEventListener("resize", () => cur && place());
    screen.addEventListener("scroll", () => cur && place());
    document.addEventListener("keydown", e => {
      if (!cur) return;
      if (e.key === "ArrowRight" || e.key === "Enter") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") end();
    });
  }

  function start(tour) {
    if (!root) build();
    cur = tour; i = 0;
    root.classList.add("on");
    root.querySelector(".fb-title").textContent = I18N.pick(tour.title) + " · " + I18N.t("mockBar");
    root.querySelector(".fb-rib").textContent = I18N.t("ribbon");
    screen.innerHTML = tour.mock();
    screen.scrollTop = 0;
    show();
  }

  function show() {
    const s = cur.steps[i];
    const el = screen.querySelector(`[data-t="${s.sel}"]`);
    if (el) el.scrollIntoView({ block: "center", behavior: "auto" });
    const n = cur.steps.length;
    cap.hidden = false; spot.hidden = false;
    cap.innerHTML = `<div class="n">${I18N.t("step")} ${i + 1} ${I18N.t("of")} ${n}</div>
      <h4>${I18N.pick(s.title)}</h4><p>${I18N.pick(s.text)}</p>
      <div class="nav"><button class="skip" data-a="skip">${I18N.t("skip")}</button><span class="sp"></span>
      <span class="dots">${cur.steps.map((_, k) => `<i class="${k === i ? "a" : ""}"></i>`).join("")}</span>
      ${i > 0 ? `<button class="btn ghost" data-a="back">${I18N.t("back")}</button>` : ""}
      <button class="btn yellow" data-a="next">${i === n - 1 ? I18N.t("done") : I18N.t("next")}</button></div>`;
    cap.querySelector('[data-a="skip"]').onclick = end;
    cap.querySelector('[data-a="next"]').onclick = () => go(1);
    const b = cap.querySelector('[data-a="back"]'); if (b) b.onclick = () => go(-1);
    requestAnimationFrame(place);
  }

  function place() {
    if (!cur) return;
    const s = cur.steps[i];
    const el = screen.querySelector(`[data-t="${s.sel}"]`);
    const vw = innerWidth, vh = innerHeight, pad = 6;
    if (!el) { spot.hidden = true; return; }
    const r = el.getBoundingClientRect();
    spot.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px`;
    if (vw <= 640) return; // phones: caption docked at bottom by CSS
    const cw = cap.offsetWidth, ch = cap.offsetHeight;
    let top = r.bottom + 16, left = r.left;
    if (top + ch > vh - 10) top = r.top - ch - 16;          // no room below -> above
    if (top < 40) { top = Math.min(vh - ch - 10, Math.max(40, r.top + 20)); left = r.right + 16; } // no room either -> beside/over
    if (left + cw > vw - 10) left = Math.max(10, Math.min(vw - cw - 10, r.right - cw));
    cap.style.top = Math.max(40, top) + "px"; cap.style.left = Math.max(10, left) + "px";
  }

  function go(d) {
    const j = i + d;
    if (j >= cur.steps.length) return end();
    if (j < 0) return;
    i = j; show();
  }

  function end() {
    cur = null;
    if (root) root.classList.remove("on");
    if (spot) spot.hidden = true;
    if (cap) cap.hidden = true;
  }
  return { start, end, active: () => !!cur, refresh() { if (cur) { const t = cur; const k = i; start(t); i = k; show(); } } };
})();
