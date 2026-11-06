/* NutriTrack core: saved data, nutrition math, points, USDA lookups,
   leaderboard sync and the AI helper (online or built-in). */
(function () {
  "use strict";
  const CFG = window.NT_CONFIG || {};
  const FOODS = window.NT_FOODS || [];
  const RECIPES = window.NT_RECIPES || [];
  const KEY = "nutritrack.v1";
  const NUTS = ["kcal", "p", "c", "f", "fiber", "sugar", "satfat", "na", "k", "ca", "fe"];
  const WHOLE = ["oats", "oatmeal", "quinoa", "bulgur", "rice_brown", "bread_ww", "popcorn", "corn_tortilla"];

  /* ---------------- helpers ---------------- */
  const pad = (x) => String(x).padStart(2, "0");
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function weekKey(d = new Date()) {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = (t.getDay() + 6) % 7; // Monday = 0
    t.setDate(t.getDate() - dow);
    return dayKey(t);
  }
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2));
  const round = (x, d = 0) => { const m = Math.pow(10, d); return Math.round((+x || 0) * m) / m; };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const titleCase = (s) => String(s || "").toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());

  /* ---------------- saved state ---------------- */
  const DEFAULT_REMINDERS = [
    { id: "r-water-am", type: "water", title: "Drink Water", time: "09:00", pts: 5, on: true, done: [] },
    { id: "r-walk", type: "walk", title: "Go for a Walk", time: "12:30", pts: 10, on: true, done: [] },
    { id: "r-break", type: "break", title: "Take a Break", time: "15:00", pts: 5, on: true, done: [] },
    { id: "r-water-pm", type: "water", title: "Drink Water", time: "17:00", pts: 5, on: true, done: [] }
  ];
  function fresh() {
    return {
      v: 1, deviceId: uid(), accepted: false, week: "medium", logo: "",
      profile: { name: "", heightCm: "", weightKg: "", age: "", sex: "", activity: "moderate", goal: "maintain", units: "us" },
      restrictions: [], log: [], water: {}, bonus: [],
      reminders: JSON.parse(JSON.stringify(DEFAULT_REMINDERS)),
      chat: [], greet: null
    };
  }
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = fresh(); }
  const listeners = [];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ }
    listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
  }

  /* ---------------- nutrition ---------------- */
  const foodById = (id) => FOODS.find((f) => f.id === id);
  function scale(n100, grams) {
    const out = {}; NUTS.forEach((k) => { out[k] = ((n100 && n100[k]) || 0) * grams / 100; }); return out;
  }
  function addN(a, b) { const out = {}; NUTS.forEach((k) => { out[k] = (a[k] || 0) + (b[k] || 0); }); return out; }
  const zeroN = () => scale({}, 0);

  function recipeNutrition(r) {
    let n = zeroN(), produce = 0, whole = 0, grams = 0;
    r.ing.forEach(([id, g]) => {
      const f = foodById(id); if (!f) return;
      n = addN(n, scale(f.n, g)); grams += g;
      if (f.g === "fruit" || f.g === "veg") produce += g;
      if (f.g === "legume" || WHOLE.includes(id)) whole += g;
    });
    return { n, produce, whole, grams };
  }

  /* Points: rewards protein, fiber, fruits/vegetables, whole grains and legumes;
     takes points away for added-sugar-heavy, high-saturated-fat and very salty choices.
     Based on the Dietary Guidelines for Americans 2020–2025 and FDA Daily Values. */
  function points({ n, produce = 0, whole = 0, group = "", fromRecipe = false, meal = "" }, week = S.week) {
    let p = 5;
    p += Math.min(n.p * 0.6, 20);
    p += Math.min(n.fiber * 2, 16);
    p += Math.min(produce / 80 * 8, 16);
    if (whole >= 30) p += 5;
    const naturalSugar = group === "fruit" || group === "dairy" || group === "veg" || produce > 100;
    if (!naturalSugar) p -= Math.min(n.sugar * 0.4, 15);
    p -= Math.min(n.satfat, 10);
    p -= Math.min(n.na / 150, 10);
    if (week === "busy") p += 3;                       // any logging counts on a busy week
    if (week === "light" && fromRecipe) p *= 1.2;      // reward cooking at home on light weeks
    if (week === "ramadan") {
      if ((meal === "suhoor" || meal === "iftar") && (n.p >= 10 || n.fiber >= 4)) p += 5;
      if (group === "drink" && n.kcal < 5) p += 3;     // hydrate between iftar and suhoor
    }
    return Math.round(clamp(p, 1, 60));
  }

  function itemFromFood(f, grams, meal, source) {
    const n = scale(f.n, grams);
    const produce = (f.g === "fruit" || f.g === "veg") ? grams : 0;
    const whole = (f.g === "legume" || WHOLE.includes(f.id)) ? grams : 0;
    return {
      id: uid(), date: dayKey(), at: Date.now(), meal, name: f.name, grams: round(grams, 1),
      src: source || (f.fdcId ? "USDA FoodData Central #" + f.fdcId : "USDA FoodData Central (SR Legacy)"),
      fdcId: f.fdcId || null, n, pts: points({ n, produce, whole, group: f.g, meal })
    };
  }
  function itemFromRecipe(r, servings, meal) {
    const rn = recipeNutrition(r);
    const n = scale(rn.n, servings * 100);
    return {
      id: uid(), date: dayKey(), at: Date.now(), meal, name: r.name + (servings !== 1 ? ` ×${servings}` : ""), grams: round(rn.grams * servings),
      src: "NutriTrack recipe · USDA values", recipe: r.id, n,
      pts: Math.round(points({ n: rn.n, produce: rn.produce, whole: rn.whole, group: "mixed", fromRecipe: true, meal }) * servings)
    };
  }

  function dayTotals(d = dayKey()) {
    let n = zeroN(), pts = 0;
    const items = S.log.filter((x) => x.date === d);
    items.forEach((x) => { n = addN(n, x.n); pts += x.pts; });
    pts += bonusFor(d);
    return { n, pts, items };
  }
  function bonusFor(d) {
    let b = 0;
    S.bonus.filter((x) => x.date === d).forEach((x) => { b += x.pts; });
    const meals = new Set(S.log.filter((x) => x.date === d && x.meal !== "snack").map((x) => x.meal));
    if (meals.size >= 3) b += 10;                             // three meals logged
    const cups = S.water[d] || 0; b += Math.min(cups, waterTarget()) * 2; // water
    return b;
  }
  function totalPoints() {
    const days = new Set(S.log.map((x) => x.date).concat(S.bonus.map((x) => x.date), Object.keys(S.water)));
    let t = 0; days.forEach((d) => { t += S.log.filter((x) => x.date === d).reduce((a, x) => a + x.pts, 0) + bonusFor(d); });
    return t;
  }
  function weekPoints() {
    const wk = weekKey();
    const days = new Set(S.log.map((x) => x.date).concat(S.bonus.map((x) => x.date), Object.keys(S.water)));
    let t = 0; days.forEach((d) => {
      const [y, m, dd] = d.split("-").map(Number);
      if (weekKey(new Date(y, m - 1, dd)) === wk) t += S.log.filter((x) => x.date === d).reduce((a, x) => a + x.pts, 0) + bonusFor(d);
    });
    return t;
  }

  /* ---------------- personal targets ---------------- */
  const ACT = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
  function targets() {
    const p = S.profile, w = +p.weightKg, h = +p.heightCm, a = +p.age;
    if (!(w > 0 && h > 0 && a > 0)) return null;
    let bmr = 10 * w + 6.25 * h - 5 * a + (p.sex === "male" ? 5 : p.sex === "female" ? -161 : -78);
    let kcal = bmr * (ACT[p.activity] || 1.55);
    const minor = a < 18;
    if (!minor && p.goal === "lose") kcal -= 300;
    if (p.goal === "gain") kcal += 250;
    kcal = Math.round(kcal / 10) * 10;
    return {
      kcal, minor,
      p: Math.round(w * (p.goal === "gain" ? 1.2 : 0.8)),
      c: Math.round(kcal * 0.5 / 4),
      f: Math.round(kcal * 0.3 / 9),
      fiber: Math.round(kcal / 1000 * 14),
      bmi: round(w / Math.pow(h / 100, 2), 1)
    };
  }
  function waterTarget() {
    const p = S.profile;
    if (+p.weightKg > 0) return clamp(Math.round(+p.weightKg * 33 / 237), 6, 14); // ~33 ml per kg, 8-oz cups
    return p.sex === "male" ? 13 : p.sex === "female" ? 9 : 8;
  }

  /* ---------------- restrictions & recipes ---------------- */
  const RESTRICT = {
    "Vegetarian": "vegetarian", "Vegan": "vegan", "Gluten-Free": "gluten-free", "Dairy-Free": "dairy-free",
    "Nut Allergy": "nut", "Halal": "halal", "Kosher": "kosher", "Low-Sodium": "low-sodium",
    "Shellfish Allergy": "shellfish", "Egg-Free": "egg-free", "Soy-Free": "soy-free", "Keto": "keto"
  };
  function recipeAllowed(r) {
    const rn = recipeNutrition(r);
    for (const rs of S.restrictions) {
      const tag = RESTRICT[rs];
      if (tag === "low-sodium") { if (rn.n.na > 600) return false; continue; }
      if (tag === "keto") { if (rn.n.c - rn.n.fiber > 20) return false; continue; }
      if (tag) { if (!r.free.includes(tag)) return false; continue; }
      const word = norm(rs);
      if (word && r.ing.some(([id]) => norm((foodById(id) || {}).name + " " + id).includes(word))) return false;
      if (word && norm(r.name).includes(word)) return false;
    }
    return true;
  }
  function suggestRecipes({ meal = "any", goal = "balanced", have = [], limit = 6, week = S.week } = {}) {
    const haveN = have.map(norm).filter(Boolean);
    let list = RECIPES.filter(recipeAllowed).map((r) => {
      const rn = recipeNutrition(r);
      let score = 0;
      if (meal !== "any") score += r.meals.includes(meal) ? 30 : -40;
      if (week === "busy") score += r.mins <= 15 ? 20 : -15;
      if (week === "light") score += r.mins >= 20 ? 10 : 0;
      if (week === "ramadan") score += (r.meals.includes("suhoor") || r.meals.includes("iftar")) ? 20 : 0;
      if (goal === "protein") score += rn.n.p;
      if (goal === "fiber") score += rn.n.fiber * 2;
      if (goal === "light") score += (700 - rn.n.kcal) / 25;
      if (goal === "energy") score += rn.n.c / 4;
      if (goal === "balanced") score += rn.produce / 20 + rn.n.fiber;
      let matched = [], missing = [];
      if (haveN.length) {
        r.ing.forEach(([id]) => {
          const f = foodById(id); if (!f || id === "water" || id === "olive_oil") return;
          const nm = norm(f.name + " " + id.replace(/_/g, " "));
          (haveN.some((h) => nm.includes(h) || h.includes(norm(f.name).split(" ")[0])) ? matched : missing).push(f.name);
        });
        score += matched.length * 25 - missing.length * 6;
      }
      return { r, rn, score, matched, missing };
    });
    if (haveN.length) list = list.filter((x) => x.matched.length > 0);
    return list.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  function matchFood(name) {
    const q = norm(name); if (!q) return null;
    let best = null, bestScore = 0;
    FOODS.forEach((f) => {
      const nm = norm(f.name + " " + f.id.replace(/_/g, " "));
      let s = 0;
      if (nm === q) s = 100;
      else if (nm.includes(q)) s = 60 - (nm.length - q.length) / 4;
      else q.split(" ").forEach((w) => { if (w.length > 2 && nm.includes(w)) s += 18; });
      if (s > bestScore) { bestScore = s; best = f; }
    });
    return bestScore >= 18 ? best : null;
  }
  function searchLocal(q) {
    const t = norm(q); if (!t) return [];
    return FOODS.map((f) => {
      const nm = norm(f.name + " " + f.id.replace(/_/g, " ") + " " + f.desc);
      let s = 0; if (norm(f.name).startsWith(t)) s += 50; if (nm.includes(t)) s += 30;
      t.split(" ").forEach((w) => { if (w && nm.includes(w)) s += 10; });
      return { f, s };
    }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 12).map((x) => x.f);
  }

  /* ---------------- USDA FoodData Central ---------------- */
  const FDC = "https://api.nal.usda.gov/fdc/v1";
  const NID = { 1008: "kcal", 2047: "kcal2", 2048: "kcal3", 1003: "p", 1005: "c", 1004: "f", 1079: "fiber", 2000: "sugar", 1063: "sugar2", 1258: "satfat", 1093: "na", 1092: "k", 1087: "ca", 1089: "fe" };
  function groupOf(cat) {
    const c = norm(cat);
    if (/fruit/.test(c)) return "fruit"; if (/vegetable/.test(c)) return "veg"; if (/legume|bean/.test(c)) return "legume";
    if (/cereal|grain|pasta|bread|baked|rice/.test(c)) return "grain"; if (/dairy|milk|cheese|yogurt/.test(c)) return "dairy";
    if (/poultry|beef|pork|fish|seafood|egg|meat|lamb/.test(c)) return "protein"; if (/beverage|drink|water|juice/.test(c)) return "drink";
    if (/sweet|candy|snack|dessert|chocolate|cookie|chip/.test(c)) return "sweet"; if (/nut|seed/.test(c)) return "nut";
    return "mixed";
  }
  function parseFdc(f) {
    const n = {}, raw = {};
    (f.foodNutrients || []).forEach((x) => { const k = NID[x.nutrientId]; if (k && x.value != null) raw[k] = x.value; });
    NUTS.forEach((k) => { n[k] = raw[k] || 0; });
    if (!n.kcal) n.kcal = raw.kcal2 || raw.kcal3 || 0;
    if (!n.sugar) n.sugar = raw.sugar2 || 0;
    let sv = "100 g", sg = 100;
    if (f.servingSize && /^(g|grm|ml|mlt)$/i.test(f.servingSizeUnit || "")) {
      sg = +f.servingSize; sv = f.householdServingFullText ? `${f.householdServingFullText} (${round(sg)} g)` : `${round(sg)} g`;
    } else if (f.foodMeasures && f.foodMeasures.length) {
      const m = f.foodMeasures.find((x) => x.gramWeight > 0 && x.disseminationText && !/quantity not specified/i.test(x.disseminationText));
      if (m) { sg = m.gramWeight; sv = m.disseminationText; }
    }
    const brand = f.brandName || f.brandOwner;
    return {
      id: "fdc-" + f.fdcId, fdcId: f.fdcId, name: titleCase(f.description) + (brand ? " · " + titleCase(brand) : ""),
      desc: f.description, g: groupOf(f.foodCategory || f.brandedFoodCategory || ""), sv, sg, n,
      dataType: f.dataType, gtin: f.gtinUpc || null
    };
  }
  async function fdcSearch(query, { branded = true, size = 15 } = {}) {
    const types = branded ? "Foundation,SR Legacy,Survey (FNDDS),Branded" : "Foundation,SR Legacy,Survey (FNDDS)";
    const url = `${FDC}/foods/search?api_key=${encodeURIComponent(CFG.USDA_API_KEY || "DEMO_KEY")}&query=${encodeURIComponent(query)}&pageSize=${size}&dataType=${encodeURIComponent(types)}`;
    const res = await fetch(url);
    if (res.status === 429) throw new Error("USDA search limit reached for now. Add a free USDA key in config.js, or use the foods below.");
    if (!res.ok) throw new Error("USDA search is unavailable right now (" + res.status + ").");
    const j = await res.json();
    return (j.foods || []).map(parseFdc).filter((f) => f.n.kcal > 0 || f.n.p > 0 || f.n.c > 0);
  }
  async function barcodeLookup(code) {
    const digits = String(code).replace(/\D/g, "");
    const strip = (s) => String(s || "").replace(/^0+/, "");
    try {
      const hits = await fdcSearch(digits, { branded: true, size: 10 });
      const exact = hits.find((h) => h.gtin && strip(h.gtin) === strip(digits));
      if (exact) return Object.assign(exact, { source: "USDA FoodData Central (Branded) #" + exact.fdcId });
    } catch (e) { /* fall through to label database */ }
    try {
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${digits}.json?fields=product_name,brands,nutriments,serving_quantity,serving_size,categories`);
      const j = await r.json();
      if (j && j.status === 1 && j.product) {
        const p = j.product, nu = p.nutriments || {};
        const n = {
          kcal: nu["energy-kcal_100g"] || (nu["energy_100g"] ? nu["energy_100g"] / 4.184 : 0), p: nu.proteins_100g || 0,
          c: nu.carbohydrates_100g || 0, f: nu.fat_100g || 0, fiber: nu.fiber_100g || 0, sugar: nu.sugars_100g || 0,
          satfat: nu["saturated-fat_100g"] || 0, na: (nu.sodium_100g || 0) * 1000, k: (nu.potassium_100g || 0) * 1000,
          ca: (nu.calcium_100g || 0) * 1000, fe: (nu.iron_100g || 0) * 1000
        };
        const sg = +p.serving_quantity || 100;
        return {
          id: "off-" + digits, name: (p.product_name || "Scanned product") + (p.brands ? " · " + p.brands.split(",")[0] : ""),
          g: groupOf(p.categories || ""), sv: p.serving_size || sg + " g", sg, n, fdcId: null,
          source: "Nutrition Facts label (Open Food Facts) — not found in USDA"
        };
      }
    } catch (e) { /* offline */ }
    return null;
  }

  /* ---------------- leaderboard (Supabase) ---------------- */
  const sbOn = () => !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY);
  function sbHeaders(extra) {
    const h = Object.assign({ apikey: CFG.SUPABASE_KEY, "Content-Type": "application/json" }, extra || {});
    if (/^eyJ/.test(CFG.SUPABASE_KEY)) h.Authorization = "Bearer " + CFG.SUPABASE_KEY;
    return h;
  }
  let syncTimer = null;
  function syncScore() {
    if (!sbOn() || !S.profile.name) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      try {
        await fetch(`${CFG.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/leaderboard?on_conflict=id`, {
          method: "POST", headers: sbHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
          body: JSON.stringify({ id: S.deviceId, name: S.profile.name.slice(0, 30), points: totalPoints(), week_points: weekPoints(), week_key: weekKey(), week_type: S.week, updated_at: new Date().toISOString() })
        });
      } catch (e) { /* offline: try again on next change */ }
    }, 1500);
  }
  async function fetchBoard() {
    const r = await fetch(`${CFG.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/leaderboard?select=id,name,points,week_points,week_key,week_type&order=points.desc&limit=200`, { headers: sbHeaders() });
    if (!r.ok) throw new Error("Leaderboard unavailable (" + r.status + ")");
    return r.json();
  }

  /* ---------------- AI ---------------- */
  const aiOn = () => !!CFG.AI_ENDPOINT;
  const WEEK = {
    light: { name: "Light Week", sub: "Relaxed schedule, more time for cooking" },
    medium: { name: "Medium Week", sub: "Balanced schedule" },
    busy: { name: "Busy Week", sub: "Tight schedule, quick meals" },
    ramadan: { name: "Ramadan", sub: "Fasting-aware recommendations" }
  };
  function context() {
    const t = targets(), d = dayTotals(), p = S.profile;
    return [
      `User: ${p.name || "friend"}${p.age ? ", age " + p.age : ""}${p.sex ? ", " + p.sex : ""}${p.heightCm ? ", " + p.heightCm + " cm" : ""}${p.weightKg ? ", " + p.weightKg + " kg" : ""}, activity ${p.activity}, goal ${p.goal}.`,
      `Week type: ${WEEK[S.week].name} (${WEEK[S.week].sub}).`,
      `Food restrictions (always respect): ${S.restrictions.length ? S.restrictions.join(", ") : "none"}.`,
      t ? `Estimated daily needs: ${t.kcal} kcal, protein ${t.p} g, fiber ${t.fiber} g.` : "No stats entered yet.",
      `Logged today: ${round(d.n.kcal)} kcal, protein ${round(d.n.p)} g, carbs ${round(d.n.c)} g, fat ${round(d.n.f)} g, fiber ${round(d.n.fiber)} g; water ${S.water[dayKey()] || 0} cups. Foods: ${d.items.map((x) => x.name).join(", ") || "none yet"}.`
    ].join("\n");
  }
  const SYSTEM = () => `You are NutriTrack's friendly nutrition coach inside an educational app.
Rules: base facts on USDA FoodData Central, the Dietary Guidelines for Americans, MyPlate and FDA guidance, and name the source when you give a number.
Respect every food restriction listed. Tailor advice to the user's week type: Busy = quick, minimal-prep ideas; Light = home cooking; Medium = balanced; Ramadan = suhoor/iftar timing, hydration between iftar and suhoor, slow-release foods, no daytime eating suggestions.
This is not medical advice. Do not diagnose or give treatment, medication or rapid weight-loss plans. If the user is under 18, never suggest calorie restriction. If someone mentions disordered eating, respond with care and suggest talking to a doctor or the National Alliance for Eating Disorders helpline (1-866-662-1235).
Keep replies short and practical (under 170 words), use short paragraphs or a few bullet points, and plain text (you may use **bold**).

${context()}`;

  async function callAI(messages, { image = null, json = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (CFG.SUPABASE_KEY) { headers.apikey = CFG.SUPABASE_KEY; if (/^eyJ/.test(CFG.SUPABASE_KEY)) headers.Authorization = "Bearer " + CFG.SUPABASE_KEY; }
    const r = await fetch(CFG.AI_ENDPOINT, { method: "POST", headers, body: JSON.stringify({ system: SYSTEM(), messages, image, json }) });
    if (!r.ok) throw new Error("AI is unavailable right now (" + r.status + ").");
    const j = await r.json();
    if (!j.text) throw new Error(j.error || "AI returned nothing.");
    return j.text;
  }
  function parseJSON(text) {
    const m = String(text).match(/[\[{][\s\S]*[\]}]/);
    return JSON.parse(m ? m[0] : text);
  }

  /* Built-in coach used when no AI is connected (or it is unavailable). */
  const TIPS = {
    light: ["You've got time this week, so batch-cook a pot of lentil soup or roast a tray of vegetables to set up the days ahead.", "Try one new vegetable this week. MyPlate suggests making half your plate fruits and vegetables."],
    medium: ["Aim to make half your plate fruits and vegetables at each meal (MyPlate).", "Pair a protein with a fiber-rich carb at breakfast to stay full until lunch."],
    busy: ["Keep it simple: Greek yogurt, fruit, nuts, hummus and pre-cut veggies make 5-minute meals.", "Prep once, eat twice: cook extra rice or quinoa tonight for tomorrow's lunch bowl."],
    ramadan: ["At suhoor, choose slow-release foods like oats, eggs, yogurt and whole grains, plus plenty of water.", "Break your fast gently with water and dates, then eat a balanced iftar. Spread fluids between iftar and suhoor."]
  };
  function offlineGreeting() {
    const h = new Date().getHours();
    const hi = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const name = S.profile.name ? ", " + S.profile.name.split(" ")[0] : "";
    const d = dayTotals(), t = targets();
    const tips = TIPS[S.week];
    const tip = tips[new Date().getDate() % tips.length];
    let progress = "";
    if (d.items.length && t) progress = ` You've logged ${round(d.n.kcal)} of about ${t.kcal} kcal and ${round(d.n.p)} g protein so far.`;
    else if (!d.items.length) progress = S.week === "ramadan" ? " Log your suhoor and iftar to earn points." : " Log your first meal to start earning points.";
    const wk = { light: "Enjoy your lighter week!", medium: "Here's to a balanced week.", busy: "I know this week is busy, so let's keep things quick and easy.", ramadan: "Ramadan Mubarak! I'll keep my suggestions fasting-friendly." }[S.week];
    return `${hi}${name}! ${wk}${progress} Tip: ${tip}`;
  }
  function fmtRecipe(x) { return `• **${x.r.name}** (${x.r.mins} min, ${round(x.rn.n.kcal)} kcal, ${round(x.rn.n.p)} g protein)`; }
  function offlineReply(text) {
    const q = norm(text), t = targets(), rk = S.week;
    const has = (...w) => w.some((x) => q.includes(x));
    if (has("eating disorder", "anorexi", "bulimi", "binge", "purge", "starv")) return "Thank you for sharing that. This app isn't the right tool for that, and you deserve real support. Please talk to a doctor or someone you trust. The National Alliance for Eating Disorders helpline is **1-866-662-1235**.";
    const mealWord = ["breakfast", "lunch", "dinner", "snack", "suhoor", "iftar"].find((m) => q.includes(m)) || "any";
    if (has("water", "hydrat", "drink")) {
      const cups = waterTarget();
      return `A good daily goal for you is about **${cups} cups (8 oz)** of water. The National Academies suggest about 2.7 L (women) to 3.7 L (men) of total water a day from all drinks and food.` + (rk === "ramadan" ? "\n\nDuring Ramadan, spread it out: 2 cups at iftar, 2–3 through the evening and 2 at suhoor. Limit salty foods and caffeine." : "\n\nTip: turn on the water reminders. Each glass earns you points.");
    }
    if (has("ramadan", "fast", "suhoor", "sehri", "iftar")) {
      const s = suggestRecipes({ meal: "suhoor", limit: 2, week: "ramadan" }), i = suggestRecipes({ meal: "iftar", limit: 2, week: "ramadan" });
      return `**Suhoor:** slow-release carbs, protein and fluids, such as oats, eggs, yogurt and fruit.\n${s.map(fmtRecipe).join("\n")}\n\n**Iftar:** start with water and dates, then a balanced plate with vegetables, a lean protein and whole grains. Go easy on fried foods.\n${i.map(fmtRecipe).join("\n")}`;
    }
    if (has("protein")) {
      const top = window.NT_FOODS.slice().sort((a, b) => (b.n.p / Math.max(b.n.kcal, 1)) - (a.n.p / Math.max(a.n.kcal, 1))).slice(0, 5).map((f) => f.name.toLowerCase());
      const s = suggestRecipes({ goal: "protein", meal: mealWord, limit: 3 });
      return (t ? `Your protein goal is about **${t.p} g/day** (USDA RDA is 0.8 g per kg of body weight). ` : "The USDA RDA for protein is 0.8 g per kg of body weight. ") + `Great sources: ${top.join(", ")}, lentils and beans.\n\nTry:\n${s.map(fmtRecipe).join("\n")}`;
    }
    if (has("calorie", "how much should i eat", "kcal", "bmr", "tdee")) {
      if (!t) return "Add your height, weight, age and activity on the **My Stats** page and I'll estimate your daily needs (Mifflin-St Jeor equation).";
      return `Your estimated needs: about **${t.kcal} kcal/day**, ${t.p} g protein, ${t.fiber} g fiber.` + (t.minor ? "\n\nBecause you're under 18, focus on balanced meals and energy for growth rather than cutting calories." : "") + "\n\nThis is an estimate. A registered dietitian can personalize it.";
    }
    if (has("sugar")) return "The FDA Daily Value for added sugars is **50 g**, and the Dietary Guidelines say to keep added sugars under 10% of calories. Swap soda for water or sparkling water, and choose fruit for sweetness.";
    if (has("sodium", "salt")) return "The FDA Daily Value for sodium is **2,300 mg**. Cook at home more often, rinse canned beans, and season with herbs, garlic, lemon and spices.";
    if (has("fiber", "fibre")) return `Aim for about **${t ? t.fiber : 28} g of fiber** a day (14 g per 1,000 kcal, Dietary Guidelines). Easy wins: raspberries (6.5 g per 100 g), lentils (7.9 g), chickpeas (7.6 g), oats and popcorn.`;
    if (has("lose weight", "weight loss", "diet", "cut")) return (t && t.minor) ? "At your age, the healthiest approach is balanced meals, regular activity and good sleep, not cutting calories. Talk with your doctor if you have weight concerns." : "Slow and steady works best: balanced plates, plenty of vegetables and protein, fewer sugary drinks, and daily walks. For a personal plan, check with a doctor or registered dietitian.";
    const ingr = q.match(/(?:i have|ingredients?|with|using)\s+(.+)/);
    if (ingr || has("recipe", "meal", "cook", "eat", "breakfast", "lunch", "dinner", "snack", "quick", "idea")) {
      const have = ingr ? ingr[1].split(/,| and /).map((s) => s.trim()).filter(Boolean) : [];
      const s = suggestRecipes({ meal: mealWord, have, limit: 3, week: has("quick", "busy", "fast") ? "busy" : rk });
      if (!s.length) return "I couldn't find a matching recipe that fits your restrictions. Try the **Recipes** page and choose **By Ingredients**.";
      return `Here are some ideas${have.length ? " using what you have" : ""}${S.restrictions.length ? " (respecting " + S.restrictions.join(", ") + ")" : ""}:\n${s.map(fmtRecipe).join("\n")}\n\nOpen **Recipes** for steps and to log one for points.`;
    }
    if (has("hi", "hello", "hey", "salam", "assalam")) return offlineGreeting();
    return "I can help with recipes, protein, fiber, water, Ramadan meals, and your calorie estimate. Try: \"quick dinner ideas\" or \"I have eggs, spinach and tomato.\"\n\n(Full AI answers turn on once the AI connection is set up.)";
  }

  async function greeting(force) {
    const key = dayKey() + "|" + S.week + "|" + (S.profile.name || "");
    if (!aiOn()) return offlineGreeting();
    if (!force && S.greet && S.greet.key === key) return S.greet.text;
    let text = offlineGreeting();
    {
      try { text = await callAI([{ role: "user", content: "Write a warm 2–3 sentence greeting for opening the app right now (" + new Date().toLocaleString() + "), with one specific, actionable tip for today that fits my week type." }]); } catch (e) { /* keep offline greeting */ }
    }
    S.greet = { key, text }; save();
    return text;
  }
  async function chat(text) {
    const history = S.chat.slice(-10).map((m) => ({ role: m.role, content: m.text }));
    if (aiOn()) {
      try { return { text: await callAI(history.concat([{ role: "user", content: text }])), ai: true }; } catch (e) { return { text: offlineReply(text) + "\n\n(AI is unavailable right now, so this is the built-in coach.)", ai: false }; }
    }
    return { text: offlineReply(text), ai: false };
  }
  async function aiRecipes({ meal, goal, have }) {
    const prompt = `Create 3 recipes${have && have.length ? " using mainly these ingredients: " + have.join(", ") : ""}. Meal: ${meal}. Goal: ${goal}. Return ONLY JSON: {"recipes":[{"name":"","mins":15,"meals":["${meal === "any" ? "lunch" : meal}"],"ingredients":[{"food":"plain food name like 'chicken breast' or 'brown rice cooked'","grams":100}],"steps":["",""],"why":"one sentence"}]}`;
    const data = parseJSON(await callAI([{ role: "user", content: prompt }], { json: true }));
    return (data.recipes || []).slice(0, 3).map((x) => {
      const ing = [], unmatched = [];
      (x.ingredients || []).forEach((i) => { const f = matchFood(i.food); if (f) ing.push([f.id, +i.grams || 50]); else unmatched.push(i.food); });
      return { id: "ai-" + uid(), name: x.name, mins: +x.mins || 20, meals: x.meals || [], free: [], ing, steps: x.steps || [], why: x.why, unmatched, ai: true, all: (x.ingredients || []).map((i) => `${i.food} (${i.grams} g)`) };
    });
  }
  async function aiPhoto(imageB64) {
    const text = await callAI([{ role: "user", content: 'Identify the foods in this photo and estimate each portion in grams. Return ONLY JSON: {"items":[{"name":"simple food name","grams":120}],"note":"short note"}. If it is not food, return {"items":[],"note":"No food found"}.' }], { image: imageB64, json: true });
    return parseJSON(text);
  }

  window.NT = {
    S, save, onChange: (fn) => listeners.push(fn), CFG, FOODS, RECIPES, NUTS, WEEK, RESTRICT, DEFAULT_REMINDERS,
    dayKey, weekKey, uid, round, norm, titleCase, foodById, scale, recipeNutrition, points, itemFromFood, itemFromRecipe,
    dayTotals, totalPoints, weekPoints, targets, waterTarget, suggestRecipes, recipeAllowed, matchFood, searchLocal,
    fdcSearch, barcodeLookup, sbOn, syncScore, fetchBoard, aiOn, greeting, chat, aiRecipes, aiPhoto, offlineReply,
    reset: () => { const keep = S.deviceId; Object.keys(S).forEach((k) => delete S[k]); Object.assign(S, fresh(), { deviceId: keep }); save(); }
  };
})();
