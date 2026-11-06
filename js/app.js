/* NutriTrack UI */
(function () {
  "use strict";
  const N = window.NT, S = N.S, CFG = N.CFG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  const r0 = (x) => N.round(x), r1 = (x) => N.round(x, 1);

  /* ---------------- icons ---------------- */
  const P = {
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    grid: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    chef: '<path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.46.32-.85.74-1.03a4 4 0 0 0-2.17-7.58 5 5 0 0 0-9.14 0A4 4 0 0 0 5.26 13.6c.42.18.74.57.74 1.03V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/>',
    user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>',
    insta: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    sparkle: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    cup: '<path d="M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    beef: '<circle cx="12.5" cy="8.5" r="2.5"/><path d="M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z"/><path d="m18.5 6 2.19 4.5a6.48 6.48 0 0 1 .31 2 6.49 6.49 0 0 1-2.6 5.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5"/>',
    wheat: '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/>',
    drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    barcode: '<path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    walk: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4M12 16h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    star: '<path d="M11.5 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.17.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>'
  };
  const I = (n, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;

  /* ---------------- routes ---------------- */
  const ROUTES = [
    { id: "dashboard", label: "Dashboard", icon: "grid", short: "Home" },
    { id: "log", label: "Food Log", icon: "utensils", short: "Log" },
    { id: "scan", label: "Scan Food", icon: "camera", short: "Scan" },
    { id: "recipes", label: "Recipes", icon: "chef" },
    { id: "stats", label: "My Stats", icon: "user" },
    { id: "chat", label: "AI Chat", icon: "chat", short: "AI Chat" },
    { id: "leaderboard", label: "Leaderboard", icon: "trophy" },
    { id: "reminders", label: "Reminders", icon: "bell" },
    { id: "terms", label: "Terms", icon: "file" }
  ];
  const route = () => { const h = location.hash.replace(/^#\/?/, ""); return ROUTES.some((r) => r.id === h) ? h : "dashboard"; };
  const go = (id) => { location.hash = "#/" + id; };

  function chrome() {
    const cur = route();
    $("#nav").innerHTML = ROUTES.map((r) => `<a href="#/${r.id}" class="${r.id === cur ? "active" : ""}" ${r.id === cur ? 'aria-current="page"' : ""}>${I(r.icon)}${r.label}</a>`).join("");
    const tabs = ["dashboard", "log", "scan", "chat"];
    $("#tabbar").innerHTML = tabs.map((id) => {
      const r = ROUTES.find((x) => x.id === id);
      if (id === "scan") return `<a href="#/scan" class="scan-fab ${cur === id ? "active" : ""}"><span class="c">${I("camera")}</span>${r.short}</a>`;
      return `<a href="#/${id}" class="${cur === id ? "active" : ""}">${I(r.icon)}${r.short}</a>`;
    }).join("") + `<button id="moreBtn" class="${tabs.includes(cur) ? "" : "active"}" aria-haspopup="dialog">${I("more")}More</button>`;
    $("#sheetNav").innerHTML = ROUTES.filter((r) => !tabs.includes(r.id)).map((r) => `<a href="#/${r.id}">${I(r.icon)}${r.label}</a>`).join("") + `<a href="https://instagram.com/${esc(CFG.INSTAGRAM)}" target="_blank" rel="noopener">${I("insta")}Instagram</a>`;
    $("#moreBtn").onclick = () => $("#sheet").classList.add("open");
    $$("[data-insta]").forEach((a) => { a.href = "https://instagram.com/" + CFG.INSTAGRAM; a.innerHTML = a.classList.contains("icon-btn") ? I("insta") : I("insta") + "@" + esc(CFG.INSTAGRAM); });
    $$("[data-logo]").forEach((el) => { el.classList.toggle("has-img", !!S.logo); el.innerHTML = S.logo ? `<img src="${S.logo}" alt="NutriTrack logo">` : I("leaf"); });
    $("#topPts").textContent = N.totalPoints() + " pts";
  }
  $("#sheet").addEventListener("click", (e) => { if (e.target.id === "sheet" || e.target.closest("a")) $("#sheet").classList.remove("open"); });

  /* ---------------- toast / modal ---------------- */
  function toast(msg, icon = "check") {
    const t = document.createElement("div"); t.className = "toast"; t.innerHTML = I(icon) + `<span>${md(msg)}</span>`;
    const w = $("#toasts"); w.appendChild(t); while (w.children.length > 2) w.firstChild.remove(); setTimeout(() => t.remove(), 3000);
  }
  function modal(title, html, onMount, opts = {}) {
    const back = document.createElement("div"); back.className = "modal-back";
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Close">${I("x")}</button></div><div class="modal-body">${html}</div></div>`;
    const close = () => { back.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape" && !opts.locked) close(); };
    back.addEventListener("click", (e) => { if (!opts.locked && (e.target === back || e.target.closest("[data-close]"))) close(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(back);
    if (onMount) onMount(back, close);
    const f = back.querySelector("input,select,button:not([data-close])"); if (f && window.innerWidth > 860) f.focus();
    return close;
  }

  /* ---------------- meals ---------------- */
  function mealOptions() {
    return S.week === "ramadan" ? [["suhoor", "Suhoor"], ["iftar", "Iftar"], ["dinner", "Dinner"], ["snack", "Snack"]]
      : [["breakfast", "Breakfast"], ["lunch", "Lunch"], ["dinner", "Dinner"], ["snack", "Snack"]];
  }
  function defaultMeal() {
    const h = new Date().getHours();
    if (S.week === "ramadan") return h < 6 ? "suhoor" : h < 20 ? "iftar" : "dinner";
    return h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 21 ? "dinner" : "snack";
  }
  const MEAL_ICON = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎", suhoor: "🌌", iftar: "🌇" };

  function addItem(item) {
    S.log.push(item); N.save(); N.syncScore();
    toast(`Logged **${item.name}** · +${item.pts} pts`);
    render();
  }

  /* ---------------- Add food modal ---------------- */
  function openAddFood(prefill) {
    let chosen = null;
    const html = `
      <div class="field"><div class="row"><input class="input" id="fq" placeholder="Search foods (e.g. chicken, apple, Greek yogurt)" autocomplete="off"><button class="btn primary" id="fgo" aria-label="Search USDA">${I("search")}</button></div>
      <p class="src" style="margin-top:6px">Live results from USDA FoodData Central, plus offline basics.</p></div>
      <div id="fres" style="margin-top:12px"></div>
      <div id="fpick"></div>`;
    modal("Add Food", html, (m, close) => {
      const res = $("#fres", m), pick = $("#fpick", m), q = $("#fq", m);
      const showList = (foods, note) => {
        res.innerHTML = (note ? `<p class="muted" style="margin-bottom:8px">${note}</p>` : "") + (foods.length ? foods.map((f, i) => `<button class="result" data-i="${i}"><div class="grow"><b>${esc(f.name)}</b><small>${r0(f.n.kcal)} kcal / 100 g · P ${r1(f.n.p)} · C ${r1(f.n.c)} · F ${r1(f.n.f)}${f.fdcId ? " · USDA #" + f.fdcId : ""}</small></div>${I("plus")}</button>`).join("") : `<p class="muted">No matches. Try a simpler word.</p>`);
        $$(".result", res).forEach((b) => b.onclick = () => choose(foods[+b.dataset.i]));
      };
      const choose = (f) => {
        chosen = f; res.innerHTML = "";
        const opts = mealOptions().map(([v, l]) => `<option value="${v}" ${v === defaultMeal() ? "selected" : ""}>${l}</option>`).join("");
        pick.innerHTML = `
          <div class="card" style="box-shadow:none">
            <div class="spread"><div><h3>${esc(f.name)}</h3><p class="src">${esc(f.source || (f.fdcId ? "USDA FoodData Central #" + f.fdcId : "USDA FoodData Central (SR Legacy)"))}</p></div><button class="btn sm ghost" id="fback">Change</button></div>
            <div class="grid g2" style="margin-top:14px">
              <div><label class="f" for="fqty">Amount</label><div class="row"><input class="input" id="fqty" type="number" inputmode="decimal" min="0.1" step="0.25" value="1"><select class="input" id="funit"><option value="sv">${esc(f.sv)} (${r0(f.sg)} g)</option><option value="g">grams</option><option value="oz">ounces</option></select></div></div>
              <div><label class="f" for="fmeal">Meal</label><select class="input" id="fmeal">${opts}</select></div>
            </div>
            <div class="nutri-preview" id="fprev"></div>
            <div class="spread"><span class="pts" id="fpts"></span><button class="btn primary" id="fadd">${I("plus")}Add to log</button></div>
          </div>`;
        const grams = () => { const v = +$("#fqty", m).value || 0, u = $("#funit", m).value; return u === "sv" ? v * f.sg : u === "oz" ? v * 28.35 : v; };
        const upd = () => {
          const it = N.itemFromFood(f, grams(), $("#fmeal", m).value, f.source);
          $("#fprev", m).innerHTML = `<div><b>${r0(it.n.kcal)}</b><small>kcal</small></div><div><b>${r1(it.n.p)}g</b><small>protein</small></div><div><b>${r1(it.n.c)}g</b><small>carbs</small></div><div><b>${r1(it.n.f)}g</b><small>fat</small></div>`;
          $("#fpts", m).textContent = "+" + it.pts + " nutrition pts";
          return it;
        };
        ["#fqty", "#funit", "#fmeal"].forEach((s) => $(s, m).addEventListener("input", upd));
        upd();
        $("#fadd", m).onclick = () => { if (grams() <= 0) return toast("Enter an amount", "alert"); addItem(upd()); close(); };
        $("#fback", m).onclick = () => { pick.innerHTML = ""; run(); };
      };
      let seq = 0;
      const run = async () => {
        const text = q.value.trim();
        const local = text ? N.searchLocal(text) : N.FOODS.slice(0, 10);
        showList(local, text ? "Searching USDA…" : "Popular foods");
        if (!text) return;
        const my = ++seq;
        try {
          const live = await N.fdcSearch(text);
          if (my !== seq || chosen) return;
          const ids = new Set(local.map((f) => f.fdcId).filter(Boolean));
          showList(live.filter((f) => !ids.has(f.fdcId)).concat(local).slice(0, 25), live.length ? "" : "Showing offline foods.");
        } catch (e) { if (my === seq && !chosen) showList(local, esc(e.message) + " Showing offline foods."); }
      };
      let tmr; q.addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(run, 450); });
      q.addEventListener("keydown", (e) => { if (e.key === "Enter") { clearTimeout(tmr); run(); } });
      $("#fgo", m).onclick = run;
      if (prefill && prefill.food) choose(prefill.food); else { if (prefill && prefill.q) q.value = prefill.q; run(); }
    });
  }

  function openLogRecipe(r) {
    const opts = mealOptions().map(([v, l]) => `<option value="${v}" ${v === defaultMeal() ? "selected" : ""}>${l}</option>`).join("");
    modal("Log recipe", `<h3>${esc(r.name)}</h3><div class="grid g2" style="margin-top:14px"><div><label class="f" for="rs">Servings</label><input class="input" id="rs" type="number" min="0.5" step="0.5" value="1" inputmode="decimal"></div><div><label class="f" for="rm">Meal</label><select class="input" id="rm">${opts}</select></div></div><div class="nutri-preview" id="rp"></div><div class="spread"><span class="pts" id="rpts"></span><button class="btn primary" id="radd">${I("plus")}Add to log</button></div>`, (m, close) => {
      const upd = () => { const it = N.itemFromRecipe(r, +$("#rs", m).value || 1, $("#rm", m).value); $("#rp", m).innerHTML = `<div><b>${r0(it.n.kcal)}</b><small>kcal</small></div><div><b>${r1(it.n.p)}g</b><small>protein</small></div><div><b>${r1(it.n.c)}g</b><small>carbs</small></div><div><b>${r1(it.n.f)}g</b><small>fat</small></div>`; $("#rpts", m).textContent = "+" + it.pts + " nutrition pts"; return it; };
      $("#rs", m).oninput = upd; $("#rm", m).oninput = upd; upd();
      $("#radd", m).onclick = () => { addItem(upd()); close(); };
    });
  }

  /* ================= PAGES ================= */
  const pages = {};

  pages.dashboard = function (el) {
    const t = N.targets(), d = N.dayTotals(), cups = S.water[N.dayKey()] || 0, wt = N.waterTarget();
    const h = new Date().getHours();
    const hi = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
    const recent = S.log.slice().sort((a, b) => b.at - a.at).slice(0, 5);
    const macro = (label, icon, color, val, unit, target) => `<div class="card macro"><div class="row"><div class="mi" style="background:${color}22;color:${color}">${I(icon)}</div><span class="muted" style="font-weight:600">${label}</span></div><div class="v">${val} <small>${unit}</small></div>${target ? `<div class="bar"><i style="width:${Math.min(100, val / target * 100)}%;background:${color}"></i></div><div class="muted" style="margin-top:4px">of ${target} ${unit}</div>` : ""}</div>`;
    const weekIcons = { light: "cup", medium: "calendar", busy: "zap", ramadan: "moon" };
    el.innerHTML = `
      <div class="page-head"><div><h1>${hi}${S.profile.name ? ", " + esc(S.profile.name.split(" ")[0]) : ""} 👋</h1><p>Here's your nutrition overview for today</p></div></div>
      <div class="card ai-card"><div class="badge">${I("sparkle")}</div><div class="ai-text" id="greet"><span class="typing"><i></i><i></i><i></i></span></div><button class="icon-btn" id="regreet" aria-label="New greeting">${I("refresh")}</button></div>
      <div class="eyebrow">Your week type</div>
      <div class="week-grid">${Object.entries(N.WEEK).map(([k, w]) => `<button class="week ${S.week === k ? "on" : ""}" data-week="${k}" aria-pressed="${S.week === k}"><span class="wi">${I(weekIcons[k])}</span><b>${w.name}</b><small>${w.sub}</small></button>`).join("")}</div>
      <div class="stat-row">
        <div class="card points-card"><div style="font-weight:600;opacity:.9">Nutrition Points</div><div class="big">${N.totalPoints()}</div><div style="opacity:.9">↗ +${d.pts} today · ${N.weekPoints()} this week</div><div class="trophy">${I("trophy")}</div></div>
        ${macro("Calories", "flame", "#e2703a", r0(d.n.kcal), "kcal", t && t.kcal)}
        ${macro("Protein", "beef", "#dc4b4b", r0(d.n.p), "g", t && t.p)}
        ${macro("Carbs", "wheat", "#d98a1c", r0(d.n.c), "g", t && t.c)}
        ${macro("Fat", "drop", "#2f7fe0", r0(d.n.f), "g", t && t.f)}
      </div>
      <div class="grid g2" style="margin-top:18px">
        <div class="card"><div class="spread"><div class="card-title" style="margin:0">${I("drop")}<h2>Water</h2></div><span class="pill blue">+2 pts / cup</span></div>
          <div class="spread" style="margin-top:14px"><button class="btn" id="wminus" aria-label="Remove a cup">${I("minus")}</button><div style="text-align:center"><div style="font-size:30px;font-weight:800">${cups} <span class="muted" style="font-size:15px">/ ${wt} cups</span></div><div class="muted">${S.week === "ramadan" ? "between iftar and suhoor" : "8-oz cups today"}</div></div><button class="btn blue" id="wplus" aria-label="Add a cup">${I("plus")}</button></div>
          <div class="bar"><i style="width:${Math.min(100, cups / wt * 100)}%;background:var(--blue)"></i></div></div>
        <div class="card"><div class="card-title">${I("sparkle")}<h2>Today's picks</h2></div><div id="picks"></div></div>
      </div>
      ${!t ? `<div class="card" style="margin-top:18px"><div class="spread wrap"><div><h3>Personalize your targets</h3><p class="muted">Add your height, weight and age to see daily goals.</p></div><a class="btn primary" href="#/stats">${I("user")}Add my stats</a></div></div>` : ""}
      <div class="card" style="margin-top:18px"><div class="spread"><div class="card-title" style="margin:0">${I("utensils")}<h2>Recent Meals</h2></div><button class="btn sm primary" id="dadd">${I("plus")}Add food</button></div>
        <div style="margin-top:14px">${recent.length ? recent.map((x) => `<div class="meal-row"><div><b>${esc(x.name)}</b><span class="muted">${MEAL_ICON[x.meal] || ""} ${esc(cap(x.meal))} · ${esc(x.date)}</span></div><div style="text-align:right"><b>${r0(x.n.kcal)} kcal</b><div class="pts">+${x.pts} pts</div></div></div>`).join("") : `<p class="muted">No meals yet. Tap <b>Add food</b> or <b>Scan</b> to log your first one.</p>`}</div></div>`;
    $$("[data-week]", el).forEach((b) => b.onclick = () => { S.week = b.dataset.week; N.save(); N.syncScore(); toast(`${N.WEEK[S.week].name} selected. Recommendations updated.`); render(); });
    $("#wplus", el).onclick = () => { const k = N.dayKey(); S.water[k] = (S.water[k] || 0) + 1; N.save(); N.syncScore(); if (S.water[k] <= wt) toast("+2 pts · keep it up! 💧", "drop"); render(); };
    $("#wminus", el).onclick = () => { const k = N.dayKey(); S.water[k] = Math.max(0, (S.water[k] || 0) - 1); N.save(); N.syncScore(); render(); };
    $("#dadd", el).onclick = () => openAddFood();
    const meal = defaultMeal();
    $("#picks", el).innerHTML = N.suggestRecipes({ meal, limit: 3 }).map((x) => `<div class="meal-row"><div><b>${esc(x.r.name)}</b><span class="muted">${x.r.mins} min · ${r0(x.rn.n.kcal)} kcal · ${r0(x.rn.n.p)} g protein</span></div><button class="btn sm" data-r="${x.r.id}">${I("plus")}Log</button></div>`).join("") || `<p class="muted">No recipes match your restrictions yet.</p>`;
    $$("[data-r]", el).forEach((b) => b.onclick = () => openLogRecipe(N.RECIPES.find((r) => r.id === b.dataset.r)));
    const g = $("#greet", el);
    N.greeting(false).then((txt) => { if (g.isConnected) g.innerHTML = md(txt); });
    $("#regreet", el).onclick = () => { g.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; N.greeting(true).then((txt) => { g.innerHTML = md(txt); }); };
  };
  const cap = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);

  pages.log = function (el) {
    const days = {}; S.log.slice().sort((a, b) => b.at - a.at).forEach((x) => { (days[x.date] = days[x.date] || []).push(x); });
    const keys = Object.keys(days).sort().reverse();
    el.innerHTML = `
      <div class="page-head"><div><h1>Food Log</h1><p>Track your meals and nutrition</p></div><div class="row wrap"><a class="btn" href="#/scan">${I("camera")}Scan</a><button class="btn primary" id="ladd">${I("plus")}Add Food</button></div></div>
      ${keys.length ? keys.map((k) => { const tot = days[k].reduce((a, x) => a + x.n.kcal, 0), pts = days[k].reduce((a, x) => a + x.pts, 0);
        return `<div class="day-head"><span>${k === N.dayKey() ? "Today" : esc(k)}</span><span class="muted">${r0(tot)} kcal · <span class="pts">+${pts} pts</span></span></div>` + days[k].map((x) => `
          <div class="card log-item"><div class="grow"><b>${esc(x.name)}</b><span class="muted">${esc(cap(x.meal))} · ${r0(x.grams)} g · ${esc(x.src)}</span></div>
          <div class="nums"><b>${r0(x.n.kcal)} kcal</b><br>P:${r1(x.n.p)}g C:${r1(x.n.c)}g F:${r1(x.n.f)}g</div><span class="pts">+${x.pts} pts</span>
          <button class="icon-btn del" data-del="${x.id}" aria-label="Delete ${esc(x.name)}">${I("trash")}</button></div>`).join(""); }).join("")
        : `<div class="card empty dashed"><div class="badge">${I("utensils")}</div><h3>No meals logged yet</h3><p class="muted" style="margin-top:6px">Search USDA foods, scan a barcode, or log a recipe.</p></div>`}`;
    $("#ladd", el).onclick = () => openAddFood();
    $$("[data-del]", el).forEach((b) => b.onclick = () => { const i = S.log.findIndex((x) => x.id === b.dataset.del); if (i > -1) { const [x] = S.log.splice(i, 1); N.save(); N.syncScore(); toast(`Removed ${x.name}`, "trash"); render(); } });
  };

  /* ---------- Scan ---------- */
  let scanner = null;
  async function stopScanner() { if (scanner) { try { await scanner.stop(); } catch (e) { } try { scanner.clear(); } catch (e) { } scanner = null; } }
  pages.scan = function (el) {
    el.innerHTML = `
      <div class="page-head"><div><h1>Scan Food</h1><p>Scan a barcode or snap a photo of your meal</p></div></div>
      <div class="tabs" role="tablist"><button class="on" data-t="barcode" role="tab">${I("barcode")}Barcode</button><button data-t="photo" role="tab">${I("image")}Food photo</button></div>
      <div id="scanBody"></div>`;
    const body = $("#scanBody", el);
    const tabs = $$("[data-t]", el);
    tabs.forEach((b) => b.onclick = () => { tabs.forEach((x) => x.classList.toggle("on", x === b)); stopScanner(); (b.dataset.t === "barcode" ? barcode : photo)(); });

    function barcode() {
      body.innerHTML = `
        <div class="card"><div id="reader"></div>
          <div class="row wrap" style="justify-content:center;margin-top:16px;gap:10px">
            <button class="btn primary" id="camStart">${I("camera")}Start camera</button>
            <label class="btn">${I("upload")}Scan from a photo<input type="file" accept="image/*" id="camFile" hidden></label>
          </div>
          <div class="row" style="justify-content:center;margin-top:14px;gap:8px;max-width:420px;margin-inline:auto"><input class="input" id="code" inputmode="numeric" placeholder="Or type the barcode number"><button class="btn" id="codeGo">Look up</button></div>
          <p class="src" style="text-align:center;margin-top:10px">Products are matched in USDA FoodData Central's branded foods database.</p>
          <div id="scanOut" style="margin-top:14px"></div></div>`;
      const out = $("#scanOut", body);
      const lookup = async (code) => {
        await stopScanner();
        out.innerHTML = `<p class="muted" style="text-align:center">Looking up <b>${esc(code)}</b>…</p>`;
        const f = await N.barcodeLookup(code);
        if (!f) { out.innerHTML = `<div class="notice amber"><p><b>Product ${esc(code)} wasn't found.</b> Search for it by name instead.</p><button class="btn primary" style="margin-top:10px" id="byName">${I("search")}Search by name</button></div>`; $("#byName", out).onclick = () => openAddFood(); return; }
        out.innerHTML = `<div class="result"><div class="grow"><b>${esc(f.name)}</b><small>${r0(f.n.kcal)} kcal / 100 g · ${esc(f.source)}</small></div><button class="btn primary sm" id="logIt">${I("plus")}Log it</button></div>`;
        $("#logIt", out).onclick = () => openAddFood({ food: f });
        openAddFood({ food: f });
      };
      const ensureLib = () => new Promise((res, rej) => { if (window.Html5Qrcode) return res(); let n = 0; const t = setInterval(() => { if (window.Html5Qrcode) { clearInterval(t); res(); } else if (++n > 40) { clearInterval(t); rej(new Error("Scanner failed to load")); } }, 100); });
      const formats = () => { const F = window.Html5QrcodeSupportedFormats; return F ? [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128, F.QR_CODE] : undefined; };
      $("#camStart", body).onclick = async () => {
        out.innerHTML = "";
        if (!window.isSecureContext) { out.innerHTML = `<div class="notice amber"><p>The camera only works on a secure (https) link. Open the app from its GitHub Pages address.</p></div>`; return; }
        try {
          await ensureLib(); await stopScanner();
          scanner = new Html5Qrcode("reader", { formatsToSupport: formats(), useBarCodeDetectorIfSupported: true, verbose: false });
          $("#camStart", body).textContent = "Point at a barcode…";
          await scanner.start({ facingMode: "environment" }, { fps: 12, qrbox: (w, h) => ({ width: Math.min(w * 0.85, 360), height: Math.min(h * 0.5, 180) }), aspectRatio: 1.333 }, (code) => lookup(code), () => { });
        } catch (e) {
          $("#camStart", body).innerHTML = I("camera") + "Start camera";
          const denied = /permission|notallowed|denied/i.test(String(e && (e.name || e.message || e)));
          out.innerHTML = `<div class="notice amber"><p><b>${denied ? "Camera permission was blocked." : "Couldn't open the camera."}</b> ${denied ? "Allow camera access for this site in your browser settings, then try again." : ""} You can also use <b>Scan from a photo</b> or type the barcode number.</p></div>`;
        }
      };
      $("#camFile", body).onchange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try { await ensureLib(); await stopScanner(); const h = new Html5Qrcode("reader", { formatsToSupport: formats(), verbose: false }); const code = await h.scanFile(file, false); try { h.clear(); } catch (x) { } lookup(code); }
        catch (err) { out.innerHTML = `<div class="notice amber"><p>No barcode found in that photo. Try a sharper, closer photo, or type the number.</p></div>`; }
        e.target.value = "";
      };
      const go2 = () => { const c = $("#code", body).value.replace(/\D/g, ""); if (c.length >= 6) lookup(c); else toast("Enter the full barcode number", "alert"); };
      $("#codeGo", body).onclick = go2; $("#code", body).onkeydown = (e) => { if (e.key === "Enter") go2(); };
    }

    function photo() {
      body.innerHTML = `
        <div class="card dashed" style="text-align:center;padding:36px 20px">
          <div class="badge" style="margin:0 auto 14px">${I("camera")}</div>
          <h3>Snap or upload a food photo</h3>
          <p class="muted" style="margin:4px 0 16px">${N.aiOn() ? "AI identifies the foods, then nutrition comes from USDA data." : "Take a photo, then pick what's in it. Nutrition comes from USDA data."}</p>
          <div class="row wrap" style="justify-content:center">
            <label class="btn primary">${I("camera")}Take photo<input type="file" accept="image/*" capture="environment" id="ph1" hidden></label>
            <label class="btn">${I("upload")}Choose image<input type="file" accept="image/*" id="ph2" hidden></label>
          </div>
        </div><div id="phOut" style="margin-top:18px"></div>`;
      const out = $("#phOut", body);
      const handle = async (file) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        out.innerHTML = `<div class="card"><img class="photo-preview" src="${url}" alt="Your food photo"><div id="phRes">${N.aiOn() ? '<p class="muted" style="text-align:center"><span class="typing"><i></i><i></i><i></i></span> Identifying foods…</p>' : ""}</div></div>`;
        const res = $("#phRes", out);
        if (!N.aiOn()) { manualPick(res); return; }
        try {
          const b64 = await shrink(file);
          const data = await N.aiPhoto(b64);
          const items = (data.items || []).map((it) => ({ it, f: N.matchFood(it.name) }));
          if (!items.length) { res.innerHTML = `<p class="muted">${esc(data.note || "No food found.")}</p>`; manualPick(res, true); return; }
          for (const x of items) {
            if (x.f) continue;
            // try the AI's name, then simpler versions of it (e.g. "grilled lamb chop" -> "lamb chop" -> "lamb")
            const words = N.norm(x.it.name).split(" ").filter((w) => w.length > 2);
            const tries = [x.it.name, words.slice(-2).join(" "), words[0]].filter((q, i, a) => q && a.indexOf(q) === i);
            for (const q of tries) {
              try { const live = await N.fdcSearch(q, { branded: false, size: 3 }); if (live[0]) { x.f = live[0]; break; } }
              catch (e) { x.err = e.message; break; }
            }
          }
          res.innerHTML = `<h3 style="margin-bottom:10px">Here's what I see</h3>` + items.map((x, i) => x.f ? `
            <div class="result" style="cursor:default"><input type="checkbox" checked data-c="${i}" aria-label="Include ${esc(x.f.name)}" style="width:20px;height:20px"><div class="grow"><b>${esc(x.f.name)}</b><small>AI saw "${esc(x.it.name)}" · USDA values</small></div><input class="input" style="width:90px" type="number" value="${r0(x.it.grams || x.f.sg)}" data-g="${i}" aria-label="Grams"> g</div>` : `<div class="result" style="cursor:default"><div class="grow"><b>${esc(N.titleCase(x.it.name))}</b><small>${x.err ? esc(x.err) : "No automatic USDA match. Search to pick the closest one."}</small></div><button class="btn sm primary" data-q="${esc(x.it.name)}">${I("search")}Search</button></div>`).join("") +
            `<div class="row" style="margin-top:12px;gap:10px"><select class="input" id="phMeal">${mealOptions().map(([v, l]) => `<option value="${v}" ${v === defaultMeal() ? "selected" : ""}>${l}</option>`).join("")}</select><button class="btn primary" id="phLog">${I("plus")}Log selected</button></div><p class="src" style="margin-top:8px">Portion sizes are AI estimates. Adjust the grams if needed.</p>`;
          $$("[data-q]", res).forEach((b) => b.onclick = () => openAddFood({ q: b.dataset.q }));
          if (!items.some((x) => x.f)) $("#phLog", res).disabled = true;
          $("#phLog", res).onclick = () => {
            const meal = $("#phMeal", res).value; let n = 0;
            items.forEach((x, i) => { const c = $(`[data-c="${i}"]`, res); if (x.f && c && c.checked) { S.log.push(N.itemFromFood(x.f, +$(`[data-g="${i}"]`, res).value || x.f.sg, meal, x.f.fdcId ? "USDA FoodData Central #" + x.f.fdcId + " · photo" : "USDA values · photo")); n++; } });
            if (n) { N.save(); N.syncScore(); toast(`Logged ${n} item${n > 1 ? "s" : ""} from your photo`); go("log"); }
          };
        } catch (e) { res.innerHTML = `<div class="notice amber"><p>${esc(e.message)} You can pick the foods yourself instead.</p></div>`; manualPick(res, true); }
      };
      $("#ph1", body).onchange = (e) => handle(e.target.files[0]);
      $("#ph2", body).onchange = (e) => handle(e.target.files[0]);
    }
    function manualPick(res, append) {
      const h = `<p style="margin:${append ? "14px" : "0"} 0 10px"><b>What's in your photo?</b></p><div class="row"><input class="input" id="mp" placeholder="e.g. rice, chicken, salad"><button class="btn primary" id="mpGo">${I("search")}Find</button></div>`;
      if (append) res.insertAdjacentHTML("beforeend", h); else res.innerHTML = h;
      const goSearch = () => openAddFood({ q: $("#mp", res).value });
      $("#mpGo", res).onclick = goSearch; $("#mp", res).onkeydown = (e) => { if (e.key === "Enter") goSearch(); };
    }
    barcode();
  };
  function shrink(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 1024 / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.82).split(",")[1]);
      };
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------- Recipes ---------- */
  let recipeTab = "goal";
  pages.recipes = function (el) {
    el.innerHTML = `
      <div class="page-head"><div><h1>Recipe Recommendations</h1><p>Tailored to your ${S.week === "ramadan" ? "Ramadan" : esc(N.WEEK[S.week].name.toLowerCase())}${S.restrictions.length ? " and your restrictions (" + esc(S.restrictions.join(", ")) + ")" : ""}</p></div></div>
      <div class="tabs" role="tablist"><button data-t="goal" class="${recipeTab === "goal" ? "on" : ""}">${I("sparkle")}By Goal</button><button data-t="ing" class="${recipeTab === "ing" ? "on" : ""}">${I("utensils")}By Ingredients</button></div>
      <div class="card" id="rform"></div><div id="rout" style="margin-top:18px"></div>`;
    $$("[data-t]", el).forEach((b) => b.onclick = () => { recipeTab = b.dataset.t; render(); });
    const meals = (S.week === "ramadan" ? [["any", "Any Meal"], ["suhoor", "Suhoor"], ["iftar", "Iftar"], ["snack", "Snack"]] : [["any", "Any Meal"], ["breakfast", "Breakfast"], ["lunch", "Lunch"], ["dinner", "Dinner"], ["snack", "Snack"]]).map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    const form = $("#rform", el);
    if (recipeTab === "goal") {
      form.innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));align-items:end">
        <div><label class="f" for="rg">Nutritional goal</label><select class="input" id="rg"><option value="balanced">Balanced Nutrition</option><option value="protein">High Protein</option><option value="fiber">High Fiber</option><option value="light">Lighter Meals</option><option value="energy">More Energy</option></select></div>
        <div><label class="f" for="rmt">Meal type</label><select class="input" id="rmt">${meals}</select></div>
        <button class="btn primary" id="rgen">${I("sparkle")}Generate Recipes</button></div>`;
    } else {
      form.innerHTML = `<label class="f" for="ri">What ingredients do you have?</label>
        <textarea class="input" id="ri" rows="2" placeholder="e.g. eggs, spinach, tomato, rice, chicken"></textarea>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));align-items:end;margin-top:12px">
        <div><label class="f" for="rmt">Meal type</label><select class="input" id="rmt">${meals}</select></div>
        <button class="btn primary" id="rgen">${I("sparkle")}Find Recipes</button></div>`;
    }
    const out = $("#rout", el);
    const show = (list, aiList) => {
      const card = (r, extra) => { const rn = N.recipeNutrition(r);
        return `<div class="card recipe"><div class="spread"><h3>${esc(r.name)}</h3>${r.ai ? '<span class="pill blue">AI</span>' : `<span class="pill green">${r.mins} min</span>`}</div>
        ${r.why ? `<p class="muted">${esc(r.why)}</p>` : ""}
        <div class="macros"><span><b>${r0(rn.n.kcal)}</b> kcal</span><span><b>${r0(rn.n.p)}</b>g protein</span><span><b>${r0(rn.n.fiber)}</b>g fiber</span><span class="pts">~+${N.points({ n: rn.n, produce: rn.produce, whole: rn.whole, group: "mixed", fromRecipe: true, meal: defaultMeal() })} pts</span></div>
        ${extra || ""}
        <details><summary>Ingredients & steps</summary><ul>${(r.all || r.ing.map(([id, g]) => `${(N.foodById(id) || {}).name} (${g} g)`)).map((s) => `<li>${esc(s)}</li>`).join("")}</ul><ol>${r.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>${r.note ? `<p class="muted">${esc(r.note)}</p>` : ""}${r.unmatched && r.unmatched.length ? `<p class="src">Nutrition excludes: ${esc(r.unmatched.join(", "))}</p>` : ""}</details>
        <button class="btn sm primary" data-log="${r.id}" style="align-self:flex-start">${I("plus")}Log this meal</button></div>`; };
      const all = (aiList || []).concat(list.map((x) => x.r));
      out.innerHTML = all.length ? `<div class="recipe-grid">${(aiList || []).map((r) => card(r)).join("")}${list.map((x) => card(x.r, x.matched && x.matched.length ? `<p class="muted">✅ You have: ${esc(x.matched.join(", "))}${x.missing.length ? `<br>🛒 Need: ${esc(x.missing.join(", "))}` : ""}</p>` : "")).join("")}</div>` : `<div class="card empty dashed"><div class="badge">${I("chef")}</div><h3>No matches yet</h3><p class="muted">Try other ingredients, or check your food restrictions on My Stats.</p></div>`;
      $$("[data-log]", out).forEach((b) => b.onclick = () => openLogRecipe(all.find((r) => r.id === b.dataset.log)));
    };
    out.innerHTML = `<div class="card empty dashed"><div class="badge">${I("chef")}</div><h3>Ready to cook something healthy?</h3><p class="muted">${recipeTab === "goal" ? "Select your goal and meal type, then generate recipes." : "List what's in your kitchen and we'll match recipes."}</p></div>`;
    $("#rgen", el).onclick = async () => {
      const meal = $("#rmt", el).value, goal = recipeTab === "goal" ? $("#rg", el).value : "balanced";
      const have = recipeTab === "ing" ? $("#ri", el).value.split(/,|\n| and /).map((s) => s.trim()).filter(Boolean) : [];
      if (recipeTab === "ing" && !have.length) return toast("Type at least one ingredient", "alert");
      const list = N.suggestRecipes({ meal, goal, have, limit: 6 });
      show(list);
      if (N.aiOn()) {
        out.insertAdjacentHTML("afterbegin", `<p class="muted" id="aiwait" style="margin-bottom:12px"><span class="typing"><i></i><i></i><i></i></span> AI is creating new recipes for you…</p>`);
        try { const ai = await N.aiRecipes({ meal, goal, have }); show(list, ai); } catch (e) { const w = $("#aiwait", out); if (w) w.textContent = "AI recipes unavailable right now; here are matches from the recipe library."; }
      }
    };
  };

  /* ---------- Stats ---------- */
  const COMMON = Object.keys(N.RESTRICT);
  pages.stats = function (el) {
    const p = S.profile, us = p.units !== "metric", t = N.targets();
    const ftIn = p.heightCm ? [Math.floor(p.heightCm / 30.48), Math.round((p.heightCm / 2.54) % 12)] : ["", ""];
    const lb = p.weightKg ? Math.round(p.weightKg * 2.20462) : "";
    el.innerHTML = `
      <div class="page-head"><div><h1>My Stats</h1><p>Enter your personal information for personalized recommendations</p></div></div>
      <div class="stack">
      <form class="card" id="sf"><div class="card-title">${I("user")}<h2>Personal Information</h2></div>
        <div class="field"><label class="f" for="sname">Display name</label><input class="input" id="sname" maxlength="30" placeholder="Your name for the leaderboard" value="${esc(p.name)}"></div>
        <div class="field"><span class="f">Units</span><div class="chips"><button type="button" class="chip ${us ? "on" : ""}" data-u="us">US (ft, lb)</button><button type="button" class="chip ${!us ? "on" : ""}" data-u="metric">Metric (cm, kg)</button></div></div>
        <div class="grid g2 field">
          ${us ? `<div><label class="f">Height</label><div class="row"><input class="input" id="sft" type="number" inputmode="numeric" placeholder="ft" value="${ftIn[0]}" aria-label="Feet"><input class="input" id="sin" type="number" inputmode="numeric" placeholder="in" value="${ftIn[1]}" aria-label="Inches"></div></div>
          <div><label class="f" for="slb">Weight (lb)</label><input class="input" id="slb" type="number" inputmode="decimal" placeholder="150" value="${lb}"></div>`
          : `<div><label class="f" for="scm">Height (cm)</label><input class="input" id="scm" type="number" inputmode="decimal" placeholder="170" value="${esc(p.heightCm)}"></div>
          <div><label class="f" for="skg">Weight (kg)</label><input class="input" id="skg" type="number" inputmode="decimal" placeholder="70" value="${esc(p.weightKg)}"></div>`}
          <div><label class="f" for="sage">Age</label><input class="input" id="sage" type="number" inputmode="numeric" min="5" max="110" placeholder="25" value="${esc(p.age)}"></div>
          <div><label class="f" for="ssex">Sex (for calorie estimate)</label><select class="input" id="ssex"><option value="">Prefer not to say</option><option value="female" ${p.sex === "female" ? "selected" : ""}>Female</option><option value="male" ${p.sex === "male" ? "selected" : ""}>Male</option></select></div>
        </div>
        <div class="grid g2 field">
          <div><label class="f" for="sact">Activity level</label><select class="input" id="sact">${[["sedentary", "Sedentary (little exercise)"], ["light", "Lightly active (1–3 days/week)"], ["moderate", "Moderately active (3–5 days/week)"], ["active", "Very active (6–7 days/week)"], ["very", "Extra active (athlete / physical job)"]].map(([v, l]) => `<option value="${v}" ${p.activity === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          <div><label class="f" for="sgoal">Goal</label><select class="input" id="sgoal"><option value="maintain" ${p.goal === "maintain" ? "selected" : ""}>Eat healthier / maintain</option><option value="lose" ${p.goal === "lose" ? "selected" : ""}>Gradual weight loss</option><option value="gain" ${p.goal === "gain" ? "selected" : ""}>Build muscle</option></select></div>
        </div>
        <button class="btn primary block" style="margin-top:18px" type="submit">${I("save")}Save Stats</button>
      </form>
      ${t ? `<div class="card"><div class="card-title">${I("flame")}<h2>Your daily estimates</h2></div>
        <div class="nutri-preview"><div><b>${t.kcal}</b><small>kcal</small></div><div><b>${t.p} g</b><small>protein</small></div><div><b>${t.fiber} g</b><small>fiber</small></div><div><b>${N.waterTarget()}</b><small>cups water</small></div></div>
        <p class="src">Calories: Mifflin-St Jeor equation × activity. Protein: USDA RDA (0.8 g/kg). Fiber: Dietary Guidelines (14 g per 1,000 kcal). BMI ${t.bmi}.${t.minor ? " Because you're under 18, NutriTrack never sets a calorie deficit." : ""} Estimates only, not medical advice.</p></div>` : ""}
      <div class="card"><div class="card-title">${I("shield")}<h2>Food Restrictions & Dietary Preferences</h2></div>
        <p class="muted">Applied to recipes, AI chat and recommendations.</p>
        <p class="f" style="margin-top:14px">Common restrictions (tap to add)</p>
        <div class="chips">${COMMON.map((c) => `<button class="chip ${S.restrictions.includes(c) ? "on" : ""}" data-rs="${esc(c)}" aria-pressed="${S.restrictions.includes(c)}">${S.restrictions.includes(c) ? I("check") : ""}${esc(c)}</button>`).join("")}</div>
        <label class="f" for="cr" style="margin-top:16px">Add a custom restriction</label>
        <div class="row"><input class="input" id="cr" placeholder="e.g. mushrooms, pork, sesame"><button class="btn" id="crAdd">${I("plus")}Add</button></div>
        ${S.restrictions.filter((r) => !COMMON.includes(r)).length ? `<div class="chips" style="margin-top:12px">${S.restrictions.filter((r) => !COMMON.includes(r)).map((r) => `<button class="chip on" data-rs="${esc(r)}">${esc(r)} ${I("x")}</button>`).join("")}</div>` : ""}
      </div>
      <div class="card"><div class="card-title">${I("image")}<h2>App logo</h2></div>
        <div class="row wrap" style="gap:16px"><div class="logo-slot ${S.logo ? "has-img" : ""}" style="width:72px;height:72px">${S.logo ? `<img src="${S.logo}" alt="Current logo">` : I("leaf")}</div>
        <div><p class="muted">Upload your NutriTrack logo (square PNG or JPG works best). It shows in the menu on this device.</p>
        <div class="row wrap" style="margin-top:10px"><label class="btn sm primary">${I("upload")}Upload logo<input type="file" accept="image/*" id="logoIn" hidden></label>${S.logo ? `<button class="btn sm danger" id="logoDel">Remove</button>` : ""}</div></div></div>
        <p class="src" style="margin-top:10px">To change it for everyone, replace the files in the <b>icons</b> folder on GitHub (see README).</p></div>
      <div class="card"><div class="card-title">${I("refresh")}<h2>App & data</h2></div>
        <p class="muted"><span class="status-dot ${N.sbOn() ? "ok" : ""}"></span> Leaderboard ${N.sbOn() ? "connected" : "not connected yet"} &nbsp; <span class="status-dot ${N.aiOn() ? "ok" : ""}"></span> AI ${N.aiOn() ? "connected" : "using built-in coach"}</p>
        <div class="row wrap" style="margin-top:12px"><button class="btn sm" id="exp">${I("download")}Export my data</button><label class="btn sm">${I("upload")}Import<input type="file" accept="application/json" id="imp" hidden></label><button class="btn sm danger" id="wipe">${I("trash")}Reset app</button></div>
        <p class="src" style="margin-top:10px">Your meals and stats are saved on this device. Only your display name and points are shared on the leaderboard.</p></div>
      </div>`;
    $$("[data-u]", el).forEach((b) => b.onclick = () => { readForm(); S.profile.units = b.dataset.u; N.save(); render(); });
    function readForm() {
      const v = (id) => { const e = $("#" + id, el); return e ? e.value.trim() : ""; };
      p.name = v("sname"); p.age = v("sage"); p.sex = v("ssex"); p.activity = v("sact"); p.goal = v("sgoal");
      if (S.profile.units !== "metric") {
        const ft = +v("sft"), inch = +v("sin"), lbs = +v("slb");
        p.heightCm = ft || inch ? N.round((ft * 12 + inch) * 2.54, 1) : ""; p.weightKg = lbs ? N.round(lbs / 2.20462, 1) : "";
      } else { p.heightCm = v("scm"); p.weightKg = v("skg"); }
    }
    $("#sf", el).onsubmit = (e) => {
      e.preventDefault(); readForm();
      if (p.age && (+p.age < 5 || +p.age > 110)) return toast("Please check your age", "alert");
      S.greet = null; N.save(); N.syncScore(); toast("Stats saved"); render();
    };
    $$("[data-rs]", el).forEach((b) => b.onclick = () => { const r = b.dataset.rs, i = S.restrictions.indexOf(r); if (i > -1) S.restrictions.splice(i, 1); else S.restrictions.push(r); N.save(); render(); });
    const addCr = () => { const r = $("#cr", el).value.trim(); if (r && !S.restrictions.includes(r)) { S.restrictions.push(r); N.save(); render(); } };
    $("#crAdd", el).onclick = addCr; $("#cr", el).onkeydown = (e) => { if (e.key === "Enter") addCr(); };
    $("#logoIn", el).onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 256; const s = Math.min(img.width, img.height); c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256); S.logo = c.toDataURL("image/png"); N.save(); toast("Logo updated"); render(); };
      img.src = URL.createObjectURL(f);
    };
    if ($("#logoDel", el)) $("#logoDel", el).onclick = () => { S.logo = ""; N.save(); render(); };
    $("#exp", el).onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: "application/json" })); a.download = "nutritrack-backup-" + N.dayKey() + ".json"; a.click(); };
    $("#imp", el).onchange = (e) => { const f = e.target.files[0]; if (!f) return; f.text().then((t) => { try { const d = JSON.parse(t); Object.assign(S, d); N.save(); toast("Data imported"); render(); } catch (x) { toast("That file isn't a NutriTrack backup", "alert"); } }); };
    $("#wipe", el).onclick = () => { if (confirm("Erase all meals, stats and points on this device?")) { N.reset(); toast("App reset"); go("dashboard"); render(); } };
  };

  /* ---------- Chat ---------- */
  let chatBusy = false;
  pages.chat = function (el) {
    const sugg = S.week === "ramadan" ? ["What should I eat for suhoor?", "Healthy iftar ideas", "How much water should I drink during Ramadan?", "I have eggs, dates and oats"]
      : S.week === "busy" ? ["Quick healthy meals for a busy week", "Give me a high-protein breakfast recipe", "How much water should I drink daily?", "I have chicken, rice and broccoli"]
      : ["Give me a high-protein breakfast recipe", "What should I eat during Ramadan?", "Quick healthy meals for a busy week", "How much water should I drink daily?"];
    el.innerHTML = `
      <div class="page-head"><div><h1>AI Nutrition Chat</h1><p>Get recipe recommendations and nutrition tips</p></div>${S.chat.length ? `<button class="btn sm" id="clr">${I("refresh")}New chat</button>` : ""}</div>
      <div class="card chat"><div class="chat-body" id="cb" aria-live="polite"></div>
      <form class="chat-form" id="cf"><input class="input" id="ci" placeholder="Ask about recipes, nutrition tips… or list ingredients you have" autocomplete="off"><button class="btn primary" aria-label="Send">${I("send")}</button></form></div>
      <p class="src" style="margin-top:8px">${N.aiOn() ? "AI answers can make mistakes. " : "Built-in coach (full AI turns on once connected). "}Educational only, not medical advice. Sources: USDA, FDA, Dietary Guidelines for Americans.</p>`;
    const cb = $("#cb", el);
    const draw = () => {
      cb.innerHTML = S.chat.length ? S.chat.map((m) => `<div class="msg ${m.role === "user" ? "user" : "bot"}">${md(m.text)}</div>`).join("") + (chatBusy ? '<div class="msg bot"><span class="typing"><i></i><i></i><i></i></span></div>' : "")
        : `<div style="margin:auto;text-align:center;padding:20px"><div class="badge" style="margin:0 auto 14px">${I("sparkle")}</div><h2>Ask me anything about nutrition!</h2><p class="muted">Powered by USDA & FDA nutrition data</p><div class="suggest">${sugg.map((s) => `<button data-s="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>`;
      $$("[data-s]", cb).forEach((b) => b.onclick = () => send(b.dataset.s));
      cb.scrollTop = cb.scrollHeight;
    };
    const send = async (text) => {
      text = (text || "").trim(); if (!text || chatBusy) return;
      S.chat.push({ role: "user", text }); chatBusy = true; N.save(); draw();
      const r = await N.chat(text);
      chatBusy = false; S.chat.push({ role: "assistant", text: r.text }); S.chat = S.chat.slice(-40); N.save();
      if (cb.isConnected) draw();
    };
    $("#cf", el).onsubmit = (e) => { e.preventDefault(); const i = $("#ci", el); send(i.value); i.value = ""; };
    if ($("#clr", el)) $("#clr", el).onclick = () => { S.chat = []; N.save(); render(); };
    draw();
  };

  /* ---------- Leaderboard ---------- */
  let boardTab = "all";
  pages.leaderboard = function (el) {
    const share = location.href.split("#")[0];
    el.innerHTML = `
      <div class="page-head"><div><h1>Leaderboard</h1><p>Compete with friends based on nutrition points</p></div><button class="btn" id="inv">${I("share")}Invite friends</button></div>
      <div class="tabs"><button data-b="all" class="${boardTab === "all" ? "on" : ""}">All time</button><button data-b="week" class="${boardTab === "week" ? "on" : ""}">This week</button></div>
      <div class="card"><h2 style="margin-bottom:10px">Rankings</h2><div id="lb"><p class="muted">Loading…</p></div></div>
      <div class="card"><h3>How to earn points</h3><ul class="muted" style="margin:8px 0 0;padding-left:18px">
        <li>Log meals: more points for protein, fiber, fruits, vegetables, whole grains and beans; fewer for sugary, very salty or high saturated-fat foods.</li>
        <li>Water: +2 per cup up to your daily goal. Reminders you complete: +5 to +10.</li>
        <li>Log 3 meals in a day: +10 bonus. Your week type adjusts points: busy weeks reward any logging, light weeks reward cooking at home, and Ramadan rewards balanced suhoor and iftar.</li></ul></div>`;
    $$("[data-b]", el).forEach((b) => b.onclick = () => { boardTab = b.dataset.b; render(); });
    $("#inv", el).onclick = async () => {
      const text = "Join me on NutriTrack and let's compete on nutrition points! 🥗";
      if (navigator.share) { try { await navigator.share({ title: "NutriTrack", text, url: share }); } catch (e) { } }
      else { try { await navigator.clipboard.writeText(text + " " + share); toast("Invite link copied"); } catch (e) { prompt("Copy this link:", share); } }
    };
    const lb = $("#lb", el);
    const me = { id: S.deviceId, name: S.profile.name || "You", points: N.totalPoints(), week_points: N.weekPoints(), week_key: N.weekKey() };
    const draw = (rows) => {
      const wk = N.weekKey();
      rows = rows.filter((r) => r.id !== me.id).concat([me]).map((r) => Object.assign({}, r, { score: boardTab === "week" ? (r.week_key === wk ? r.week_points : 0) : r.points }));
      rows.sort((a, b) => b.score - a.score);
      lb.innerHTML = rows.map((r, i) => `<div class="rank ${i < 3 ? "r" + (i + 1) : ""} ${r.id === me.id ? "me" : ""}"><div class="n">${i + 1}</div><div class="grow"><b>${esc(r.name)}${r.id === me.id ? " (you)" : ""}</b>${r.week_type && N.WEEK[r.week_type] ? `<div class="muted">${N.WEEK[r.week_type].name}</div>` : ""}</div><span class="pts">${r.score} pts</span></div>`).join("");
    };
    if (!S.profile.name) lb.insertAdjacentHTML("beforebegin", `<div class="notice amber" style="margin-bottom:12px"><p>Add a display name on <a href="#/stats">My Stats</a> to appear on the shared leaderboard.</p></div>`);
    if (!N.sbOn()) { draw([]); lb.insertAdjacentHTML("afterend", `<p class="src" style="margin-top:10px">The shared leaderboard turns on once it's connected (see README, step 3). Until then, your score is shown here.</p>`); return; }
    N.syncScore();
    N.fetchBoard().then(draw).catch((e) => { draw([]); lb.insertAdjacentHTML("afterend", `<p class="src">${esc(e.message)}</p>`); });
  };

  /* ---------- Reminders ---------- */
  const RT = { water: { icon: "drop", title: "Drink Water", pts: 5 }, walk: { icon: "walk", title: "Go for a Walk", pts: 10 }, break: { icon: "cup", title: "Take a Break", pts: 5 }, custom: { icon: "bell", title: "Reminder", pts: 5 } };
  function remPts(r) { let p = r.pts; if (S.week === "busy" && r.type === "break") p = Math.round(p * 1.5); if (S.week === "light" && r.type === "walk") p = Math.round(p * 1.5); if (S.week === "ramadan" && r.type === "water") { const h = new Date().getHours(); if (h >= 18 || h < 5) p += 3; } return p; }
  pages.reminders = function (el) {
    const today = N.dayKey();
    const notif = "Notification" in window ? Notification.permission : "unsupported";
    S.reminders.sort((a, b) => a.time.localeCompare(b.time));
    el.innerHTML = `
      <div class="page-head"><div><h1>Reminders</h1><p>Stay healthy with water, break & walk reminders</p></div><button class="btn primary" id="radd">${I("plus")}Add Reminder</button></div>
      ${notif === "default" ? `<div class="notice amber" style="margin-bottom:16px"><div class="spread wrap"><p>Turn on notifications so reminders can pop up.</p><button class="btn sm primary" id="nperm">${I("bell")}Enable notifications</button></div></div>` : ""}
      ${notif === "denied" ? `<div class="notice amber" style="margin-bottom:16px"><p>Notifications are blocked in your browser settings. Reminders will still show inside the app.</p></div>` : ""}
      ${S.week === "ramadan" ? `<div class="notice amber" style="margin-bottom:16px;background:var(--blue-50);border-color:var(--blue-100)"><div class="spread wrap"><p><b>Ramadan mode:</b> water reminders after sunset earn +3 bonus points.</p><button class="btn sm" id="ramSched">${I("moon")}Use Ramadan schedule</button></div></div>` : ""}
      ${S.reminders.length ? S.reminders.map((r) => { const done = r.done.includes(today), t = RT[r.type] || RT.custom; return `
        <div class="card rem"><div class="ri ${r.type}">${I(t.icon)}</div><div class="grow"><b>${esc(r.title)}</b><div class="muted">${fmtTime(r.time)} · ${remPts(r)} pts</div></div>
        <label class="toggle" title="On/off"><input type="checkbox" data-on="${r.id}" ${r.on ? "checked" : ""} aria-label="${esc(r.title)} on"><span></span></label>
        <button class="btn sm ${done ? "primary" : ""}" data-done="${r.id}" ${done ? "disabled" : ""}>${I("check")}${done ? "Completed" : "Done"}</button>
        <button class="icon-btn del" data-rdel="${r.id}" aria-label="Delete">${I("trash")}</button></div>`; }).join("")
        : `<div class="card empty dashed"><div class="badge">${I("bell")}</div><h3>No reminders</h3></div>`}
      <p class="src" style="margin-top:12px">Reminders pop up while NutriTrack is open or running in the background. On iPhone, add the app to your Home Screen first so notifications can work.</p>`;
    const nb = $("#nperm", el); if (nb) nb.onclick = async () => { await Notification.requestPermission(); render(); };
    const rs = $("#ramSched", el); if (rs) rs.onclick = () => {
      S.reminders = [
        { id: N.uid(), type: "water", title: "Suhoor water", time: "04:45", pts: 5, on: true, done: [] },
        { id: N.uid(), type: "water", title: "Iftar water", time: "19:15", pts: 5, on: true, done: [] },
        { id: N.uid(), type: "walk", title: "Gentle walk after iftar", time: "20:30", pts: 10, on: true, done: [] },
        { id: N.uid(), type: "water", title: "Evening water", time: "22:00", pts: 5, on: true, done: [] },
        { id: N.uid(), type: "break", title: "Rest break", time: "15:00", pts: 5, on: true, done: [] }
      ]; N.save(); toast("Ramadan schedule set. Adjust times to your local iftar."); render();
    };
    $$("[data-on]", el).forEach((c) => c.onchange = () => { const r = S.reminders.find((x) => x.id === c.dataset.on); r.on = c.checked; N.save(); });
    $$("[data-done]", el).forEach((b) => b.onclick = () => completeReminder(b.dataset.done));
    $$("[data-rdel]", el).forEach((b) => b.onclick = () => { S.reminders = S.reminders.filter((x) => x.id !== b.dataset.rdel); N.save(); render(); });
    $("#radd", el).onclick = () => modal("Add Reminder", `
      <div class="field"><label class="f" for="rt">Type</label><select class="input" id="rt"><option value="water">💧 Drink water</option><option value="walk">🚶 Go for a walk</option><option value="break">☕ Take a break</option><option value="custom">🔔 Custom</option></select></div>
      <div class="field"><label class="f" for="rti">Title</label><input class="input" id="rti" value="Drink Water" maxlength="40"></div>
      <div class="field"><label class="f" for="rtm">Time</label><input class="input" id="rtm" type="time" value="10:00"></div>
      <button class="btn primary block" style="margin-top:16px" id="rsave">${I("save")}Save reminder</button>`, (m, close) => {
      $("#rt", m).onchange = () => { $("#rti", m).value = RT[$("#rt", m).value].title; };
      $("#rsave", m).onclick = () => { const type = $("#rt", m).value; S.reminders.push({ id: N.uid(), type, title: $("#rti", m).value || RT[type].title, time: $("#rtm", m).value || "10:00", pts: RT[type].pts, on: true, done: [] }); N.save(); close(); render(); };
    });
  };
  function fmtTime(t) { const [h, m] = t.split(":").map(Number); const d = new Date(); d.setHours(h, m); return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
  function completeReminder(id) {
    const r = S.reminders.find((x) => x.id === id), today = N.dayKey(); if (!r || r.done.includes(today)) return;
    r.done.push(today); r.done = r.done.slice(-14);
    const pts = remPts(r);
    S.bonus.push({ date: today, reason: r.title, pts });
    N.save(); N.syncScore(); toast(`${r.title} done · +${pts} pts`); render();
  }
  // reminder checker
  function checkReminders() {
    const now = new Date(), hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, today = N.dayKey();
    S.reminders.forEach((r) => {
      const tag = today + "|" + r.time;
      if (!r.on || r.time !== hm || r.lastFired === tag || r.done.includes(today)) return;
      r.lastFired = tag; N.save();
      toast(`⏰ ${r.title}: tap Done on Reminders for +${remPts(r)} pts`, "bell");
      if ("Notification" in window && Notification.permission === "granted") {
        const opts = { body: `Earn +${remPts(r)} nutrition points`, icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: r.id, data: { url: "#/reminders" } };
        if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then((reg) => reg.showNotification(r.title, opts)).catch(() => { });
        else { try { new Notification(r.title, opts); } catch (e) { } }
      }
    });
  }

  /* ---------- Terms ---------- */
  function termsHTML() {
    return `
      <div class="notice amber"><h2>${I("alert")}Important Disclaimer</h2>
        <p><b>This app is for educational and informational purposes only.</b></p>
        <p>NutriTrack is designed to help users learn about nutrition and track their dietary intake. The information provided by this app should <b>NOT</b> be used as a substitute for professional medical advice, diagnosis, or treatment.</p>
        <p><b>Do not rely solely on this app for your nutritional or health decisions.</b> Always seek the advice of your physician, registered dietitian, or other qualified health provider with any questions you may have regarding your diet or a medical condition.</p></div>
      <div class="notice red"><h2>${I("heart")}Health Conditions Warning</h2>
        <p><b>If you have any health conditions, please consult your doctor before using this app.</b></p>
        <p>This app is <b>NOT</b> recommended for use if you:</p>
        <ul><li>Have or have had an eating disorder</li><li>Have diabetes or blood sugar management conditions</li><li>Have kidney disease or other conditions requiring specialized diets</li><li>Are pregnant or breastfeeding</li><li>Have food allergies that require medical supervision</li><li>Have any chronic health condition that affects your nutritional needs</li><li>Are under 18 years of age without parental/guardian supervision</li></ul>
        <p>If you experience any adverse effects from following information provided by this app, discontinue use immediately and consult a healthcare professional. If you are struggling with eating, you can reach the National Alliance for Eating Disorders helpline at 1-866-662-1235.</p></div>
      <div class="card terms"><h2>User Agreement</h2><p class="muted">Last updated: November 2026</p>
        <h3>1. Acceptance</h3><p>By using NutriTrack you agree to these terms. If you do not agree, please do not use the app.</p>
        <h3>2. Educational use only</h3><p>NutriTrack provides general nutrition information for learning purposes. Nothing in the app creates a doctor–patient or dietitian–client relationship.</p>
        <h3>3. Nutrition data sources</h3><p>Food values come from the U.S. Department of Agriculture's <a href="https://fdc.nal.usda.gov" target="_blank" rel="noopener">FoodData Central</a>. Daily values and guidance follow the <a href="https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels" target="_blank" rel="noopener">FDA</a>, the <a href="https://www.dietaryguidelines.gov" target="_blank" rel="noopener">Dietary Guidelines for Americans</a> and <a href="https://www.myplate.gov" target="_blank" rel="noopener">MyPlate</a>. If a scanned product isn't in USDA's database, the app may use its Nutrition Facts label from Open Food Facts and says so. Values are averages and actual foods vary.</p>
        <h3>4. AI features</h3><p>AI chat, greetings, recipe ideas and photo recognition are generated automatically and may contain mistakes, including portion estimates. Always double-check, especially for allergies. Never use AI output to manage a medical condition.</p>
        <h3>5. Allergies and restrictions</h3><p>Restriction filters are a convenience, not a guarantee. Always read ingredient labels and check with a professional if you have a serious allergy.</p>
        <h3>6. Points and leaderboard</h3><p>Nutrition points are a motivational game, not a health score. Do not restrict food, over-exercise, or change medication to earn points. Your display name and points are visible to other users; your meals and stats stay on your device.</p>
        <h3>7. Your data</h3><p>Meals, stats and chat history are stored on your device. Photos you scan are sent to the AI service only to identify foods. You can export or delete your data from My Stats at any time.</p>
        <h3>8. No warranty and limitation of liability</h3><p>The app is provided "as is" without warranties of any kind. To the fullest extent allowed by law, the creators of NutriTrack are not liable for any loss, injury or damage arising from use of the app or reliance on its information.</p>
        <h3>9. Changes</h3><p>These terms may be updated. Continued use after changes means you accept the new terms.</p>
        <h3>10. Contact</h3><p>Questions? Message us on Instagram <a href="https://instagram.com/${esc(CFG.INSTAGRAM)}" target="_blank" rel="noopener">@${esc(CFG.INSTAGRAM)}</a>.</p></div>`;
  }
  pages.terms = function (el) {
    el.innerHTML = `<div class="page-head"><div><h1>Terms & Conditions</h1><p>Disclaimers and user agreement</p></div></div>${termsHTML()}`;
  };
  function gate() {
    if (S.accepted) return;
    modal("Welcome to NutriTrack", `
      <p>Before you start, please read and accept the disclaimers.</p>
      <div style="max-height:45vh;overflow:auto;margin:14px 0;border:1px solid var(--line);border-radius:14px;padding:12px">${termsHTML()}</div>
      <label class="row" style="align-items:flex-start;gap:10px"><input type="checkbox" id="acc" style="width:20px;height:20px;margin-top:2px"><span>I understand NutriTrack is for educational purposes only, is not medical advice, and I agree to the User Agreement.</span></label>
      <button class="btn primary block" id="accGo" style="margin-top:16px" disabled>Get started</button>`, (m, close) => {
      $("[data-close]", m).remove();
      $("#acc", m).onchange = (e) => { $("#accGo", m).disabled = !e.target.checked; };
      $("#accGo", m).onclick = () => { S.accepted = true; N.save(); m.remove(); };
    }, { locked: true });
  }

  /* ---------------- render ---------------- */
  let lastRoute = null;
  function render() {
    const id = route();
    if (lastRoute === "scan" && id !== "scan") stopScanner();
    const main = $("#main");
    const keepScroll = lastRoute === id;
    const y = window.scrollY;
    chrome();
    pages[id](main);
    document.title = (ROUTES.find((r) => r.id === id) || {}).label + " · NutriTrack";
    if (keepScroll) window.scrollTo(0, y); else { window.scrollTo(0, 0); if (lastRoute) main.focus({ preventScroll: true }); }
    lastRoute = id;
  }
  window.addEventListener("hashchange", render);
  N.onChange(() => { $("#topPts").textContent = N.totalPoints() + " pts"; });

  /* ---------------- install (PWA) ---------------- */
  let deferred = null;
  const ib = $("#installBtn");
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; ib.hidden = false; ib.innerHTML = I("download") + "Install app"; });
  ib.onclick = async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; ib.hidden = true; return; }
    modal("Add NutriTrack to your phone", `<p><b>iPhone (Safari):</b> tap the Share button, then <b>Add to Home Screen</b>.</p><p style="margin-top:10px"><b>Android (Chrome):</b> tap ⋮ then <b>Install app</b>.</p>`);
  };
  if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) { ib.hidden = false; ib.innerHTML = I("download") + "Add to Home Screen"; }
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => { });
    navigator.serviceWorker.addEventListener("message", (e) => { if (e.data && e.data.url) location.hash = e.data.url; });
  }

  render();
  gate();
  N.syncScore();
  checkReminders(); setInterval(checkReminders, 20000);
})();
