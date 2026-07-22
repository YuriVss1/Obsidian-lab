/* ==========================================================================
   OBSIDIAN — Laboratório (JS puro, sem build, sem framework)
   ========================================================================== */

/* ------------------------------- CONFIG ---------------------------------- */

const CFG = window.OBSIDIAN_CONFIG || {};
if (!CFG.SUPABASE_URL || CFG.SUPABASE_URL.includes("COLE_AQUI") || !CFG.SUPABASE_ANON_KEY || CFG.SUPABASE_ANON_KEY.includes("COLE_AQUI")) {
  document.getElementById("app").innerHTML =
    '<div style="padding:60px 24px;font-family:sans-serif;color:#F2F1ED;background:#0B0B0D;min-height:100vh;">' +
    '<h2>Falta configurar o config.js</h2>' +
    '<p style="color:#8b8d91;max-width:480px;">Abre o arquivo <code>config.js</code> e cola a URL e a chave (publishable key) do teu projeto Supabase antes de usar.</p>' +
    "</div>";
  throw new Error("OBSIDIAN_CONFIG não preenchido");
}

const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);

/* -------------------------------- DADOS ----------------------------------- */

const CATEGORIES = [
  { key: "quimico", label: "Químico" },
  { key: "oleo_essencial", label: "Óleo Essencial" },
  { key: "absoluto", label: "Absoluto" },
];
const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

const FAMILIES = [
  { key: "citrico", label: "Cítrico", color: "#D9A441" },
  { key: "floral", label: "Floral", color: "#C97B9B" },
  { key: "verde", label: "Verde", color: "#7A9B76" },
  { key: "aquatico", label: "Aquático", color: "#6B8CAE" },
  { key: "amadeirado", label: "Amadeirado", color: "#8B6B4A" },
  { key: "especiado", label: "Especiado", color: "#B5542B" },
  { key: "ambar", label: "Âmbar / Oriental", color: "#C9A227" },
  { key: "almiscarado", label: "Almiscarado", color: "#9B8F8C" },
  { key: "aldeidico", label: "Aldeídico", color: "#C7C9CC" },
  { key: "gourmand", label: "Gourmand", color: "#A67C52" },
  { key: "animalico", label: "Animálico", color: "#6E5A4E" },
  { key: "chipre", label: "Chipre / Musgo", color: "#5C6B5C" },
];
const famMap = Object.fromEntries(FAMILIES.map((f) => [f.key, f]));

const CONCENTRATIONS = [100, 50, 10, 1];

const POSITIONS = [
  { key: "topo", label: "Topo", color: "#E8C468" },
  { key: "coracao", label: "Coração", color: "#C9A227" },
  { key: "fundo", label: "Fundo", color: "#8A5A22" },
];
const posMap = Object.fromEntries(POSITIONS.map((p) => [p.key, p]));

const CONC_PRESETS = [
  { label: "Extrait de Parfum", pct: 30 },
  { label: "Eau de Parfum", pct: 18 },
  { label: "Eau de Toilette", pct: 10 },
  { label: "Eau de Cologne", pct: 4 },
  { label: "Personalizado", pct: null },
];

// Dicionário pra sugerir a família olfativa a partir do nome digitado.
const AROMA_FAMILY_MAP = {
  "bergamota": "citrico", "bergamot": "citrico", "limoneno": "citrico", "limonene": "citrico",
  "limao": "citrico", "lima": "citrico", "laranja": "citrico", "orange": "citrico",
  "tangerina": "citrico", "mandarina": "citrico", "grapefruit": "citrico", "toranja": "citrico",
  "litsea cubeba": "citrico", "citral": "citrico", "verbena": "citrico", "yuzu": "citrico",
  "petitgrain": "citrico", "neroli": "citrico", "citronela": "citrico",
  "linalol": "floral", "linalool": "floral", "geraniol": "floral", "feniletanol": "floral",
  "phenylethyl": "floral", "fenetil": "floral", "hedione": "floral", "rosa": "floral", "rose": "floral",
  "jasmim": "floral", "jasmine": "floral", "ylang": "floral", "ionona": "floral", "ionone": "floral",
  "lirial": "floral", "lyral": "floral", "muguet": "floral", "lily": "floral", "violeta": "floral",
  "peonia": "floral", "peony": "floral", "magnolia": "floral", "freesia": "floral",
  "antranilato": "floral", "anthranilate": "floral", "cyclamen": "floral", "gardenia": "floral",
  "orquidea": "floral", "orchid": "floral",
  "folha": "verde", "leaf": "verde", "galbanum": "verde", "hexenol": "verde",
  "violet leaf": "verde", "grama": "verde", "tomate": "verde", "tomato": "verde", "triplal": "verde",
  "cortica": "verde", "green": "verde",
  "calone": "aquatico", "helional": "aquatico", "melao": "aquatico", "melon": "aquatico",
  "marinho": "aquatico", "aquatico": "aquatico", "ozonico": "aquatico", "ozone": "aquatico", "sea": "aquatico",
  "iso e super": "amadeirado", "isoesuper": "amadeirado", "cedro": "amadeirado", "cedar": "amadeirado",
  "cedrol": "amadeirado", "sandalo": "amadeirado", "sandalwood": "amadeirado", "vetiver": "amadeirado",
  "amyris": "amadeirado", "guaiac": "amadeirado", "madeira": "amadeirado", "wood": "amadeirado",
  "javanol": "amadeirado", "ebanol": "amadeirado", "akigalawood": "amadeirado", "clearwood": "amadeirado",
  "eugenol": "especiado", "cravo": "especiado", "clove": "especiado", "canela": "especiado",
  "cinnamaldehyde": "especiado", "pimenta": "especiado", "pepper": "especiado",
  "cardamomo": "especiado", "cardamom": "especiado", "gengibre": "especiado", "ginger": "especiado",
  "noz moscada": "especiado", "nutmeg": "especiado", "cominho": "especiado", "cumin": "especiado",
  "ambroxan": "ambar", "ambrox": "ambar", "labdanum": "ambar", "benjoim": "ambar",
  "benzoin": "ambar", "tonka": "ambar", "tonca": "ambar", "olibanum": "ambar",
  "incenso": "ambar", "frankincense": "ambar", "mirra": "ambar", "myrrh": "ambar",
  "amber": "ambar", "ambar": "ambar", "cistus": "ambar", "laudano": "ambar",
  "almiscar": "almiscarado", "musk": "almiscarado", "galaxolide": "almiscarado",
  "exaltolide": "almiscarado", "muscone": "almiscarado", "habanolide": "almiscarado",
  "helvetolide": "almiscarado", "romandolide": "almiscarado",
  "aldeido": "aldeidico", "aldehyde": "aldeidico", "undecanal": "aldeidico",
  "decanal": "aldeidico", "dodecanal": "aldeidico",
  "baunilha": "gourmand", "vanillin": "gourmand", "vanilla": "gourmand",
  "maltol": "gourmand", "cumarina": "gourmand", "coumarin": "gourmand",
  "caramelo": "gourmand", "chocolate": "gourmand", "cafe": "gourmand", "coffee": "gourmand",
  "mel": "gourmand", "honey": "gourmand", "amendoa": "gourmand", "heliotropina": "gourmand",
  "heliotropine": "gourmand", "praline": "gourmand",
  "civeta": "animalico", "civet": "animalico", "castoreo": "animalico", "castoreum": "animalico",
  "indol": "animalico", "indole": "animalico", "couro": "animalico", "leather": "animalico",
  "suederal": "animalico",
  "musgo de carvalho": "chipre", "oakmoss": "chipre", "chipre": "chipre", "evernyl": "chipre",
  "patchouli": "chipre", "patchuli": "chipre",
};
const normalizeStr = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const SORTED_AROMA_KEYS = Object.keys(AROMA_FAMILY_MAP).sort((a, b) => b.length - a.length);
function guessFamily(rawName) {
  const norm = normalizeStr(rawName);
  if (!norm) return null;
  for (const key of SORTED_AROMA_KEYS) {
    if (norm.includes(normalizeStr(key))) return AROMA_FAMILY_MAP[key];
  }
  return null;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => (Number.isFinite(n) ? (Math.round(n * 100) / 100).toString() : "0");
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ----------------------------- DB <-> JS ---------------------------------- */

const mapMaterialFromDb = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category || "quimico",
  family: row.family,
  typicalPosition: row.typical_position || null,
  concentration: Number(row.concentration),
  unit: row.unit,
  quantity: Number(row.quantity),
  minStock: row.min_stock != null ? Number(row.min_stock) : null,
  solvent: row.solvent || "",
  cas: row.cas || "",
  supplier: row.supplier || "",
  notes: row.notes || "",
});

const toMaterialRow = (it) => ({
  name: it.name,
  category: it.category,
  family: it.family,
  typical_position: it.typicalPosition || null,
  concentration: it.concentration,
  unit: it.unit,
  quantity: it.quantity,
  min_stock: it.minStock,
  solvent: it.solvent,
  cas: it.cas,
  supplier: it.supplier,
  notes: it.notes,
});

const mapFormulaFromDb = (row) => ({
  id: row.id,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  name: row.name,
  concept: row.concept || "",
  concentrationType: row.concentration_type,
  concentrationPct: Number(row.concentration_pct),
  materials: Array.isArray(row.materials) ? row.materials : [],
  notes: row.notes || "",
});

const toFormulaRow = (f) => ({
  name: f.name,
  concept: f.concept,
  concentration_type: f.concentrationType,
  concentration_pct: f.concentrationPct,
  materials: f.materials,
  notes: f.notes,
});

const mapAccordFromDb = (row) => ({
  id: row.id,
  name: row.name,
  materials: Array.isArray(row.materials) ? row.materials : [],
  maturationDays: Number(row.maturation_days),
  notes: row.notes || "",
  log: Array.isArray(row.log) ? row.log : [],
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
});
const toAccordRow = (a) => ({
  name: a.name,
  materials: a.materials,
  maturation_days: a.maturationDays,
  notes: a.notes,
  log: a.log || [],
});

const mapPerfumeFromDb = (row) => ({
  id: row.id,
  name: row.name,
  briefing: row.briefing || "",
  formulaId: row.formula_id || null,
  maturationDays: Number(row.maturation_days),
  notes: row.notes || "",
  log: Array.isArray(row.log) ? row.log : [],
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
});
const toPerfumeRow = (p) => ({
  name: p.name,
  briefing: p.briefing,
  formula_id: p.formulaId || null,
  maturation_days: p.maturationDays,
  notes: p.notes,
  log: p.log || [],
});

/* ------------------------------- MATURAÇÃO --------------------------------- */

const DAY_MS = 24 * 60 * 60 * 1000;

function maturityInfo(createdAt, maturationDays) {
  const elapsedDays = (Date.now() - createdAt) / DAY_MS;
  const ratio = Math.max(0, Math.min(1, elapsedDays / (maturationDays || 1)));
  // interpola de vermelho (hue 4) até verde-dourado (hue 90) conforme a maturação avança
  const hue = 4 + ratio * 86;
  const color = `hsl(${hue.toFixed(0)}, 58%, 52%)`;
  const daysLeft = Math.max(0, Math.ceil(maturationDays - elapsedDays));
  const mature = elapsedDays >= maturationDays;
  return {
    ratio,
    color,
    daysElapsed: Math.floor(elapsedDays),
    daysLeft,
    mature,
    label: mature ? "maduro" : `faltam ${daysLeft} dia${daysLeft === 1 ? "" : "s"}`,
  };
}

/* --------------------------------- STATE ---------------------------------- */

const state = {
  tab: "estoque",
  items: [],
  formulas: [],
  accords: [],
  perfumes: [],
  loaded: false,
  search: "",
  familyFilter: "all",
  categoryFilter: "all",
  positionFilter: "all",
  collapsed: {},
};

const calcState = {}; // por fórmula: { open, batchSize, concPct }

let toastTimer = null;
function showToast(msg, ok) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "toast" + (ok ? " toast-ok" : "");
  el.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.style.display = "none"), 3200);
}

/* ------------------------------- SUPABASE --------------------------------- */

async function reload() {
  const { data: mats, error: e1 } = await sb.from("materials").select("*").order("name", { ascending: true });
  if (e1) showToast("Não consegui carregar o estoque do banco.");
  else state.items = (mats || []).map(mapMaterialFromDb);

  const { data: forms, error: e2 } = await sb.from("formulas").select("*").order("created_at", { ascending: true });
  if (e2) showToast("Não consegui carregar as fórmulas do banco.");
  else state.formulas = (forms || []).map(mapFormulaFromDb);

  const { data: accs, error: e3 } = await sb.from("accords").select("*").order("created_at", { ascending: true });
  if (e3) showToast("Não consegui carregar os acordes do banco.");
  else state.accords = (accs || []).map(mapAccordFromDb);

  const { data: perfs, error: e4 } = await sb.from("perfumes").select("*").order("created_at", { ascending: true });
  if (e4) showToast("Não consegui carregar os perfumes do banco.");
  else state.perfumes = (perfs || []).map(mapPerfumeFromDb);

  state.loaded = true;
}

async function addItem(record) {
  const { data, error } = await sb.from("materials").insert(toMaterialRow(record)).select().single();
  if (error || !data) { showToast("Não consegui salvar o material no banco."); return false; }
  state.items.push(mapMaterialFromDb(data));
  return true;
}
async function updateItem(id, record) {
  const { error } = await sb.from("materials").update(toMaterialRow(record)).eq("id", id);
  if (error) { showToast("Não consegui atualizar o material no banco."); return false; }
  const idx = state.items.findIndex((it) => it.id === id);
  if (idx >= 0) state.items[idx] = { ...record, id };
  return true;
}
async function deleteItem(id) {
  const { error } = await sb.from("materials").delete().eq("id", id);
  if (error) { showToast("Não consegui remover o material do banco."); return false; }
  state.items = state.items.filter((it) => it.id !== id);
  return true;
}

async function addFormula(record) {
  const { data, error } = await sb.from("formulas").insert(toFormulaRow(record)).select().single();
  if (error || !data) { showToast("Não consegui salvar a fórmula no banco."); return false; }
  state.formulas.push(mapFormulaFromDb(data));
  return true;
}
async function updateFormula(id, record) {
  const { error } = await sb.from("formulas").update(toFormulaRow(record)).eq("id", id);
  if (error) { showToast("Não consegui atualizar a fórmula no banco."); return false; }
  const idx = state.formulas.findIndex((f) => f.id === id);
  if (idx >= 0) state.formulas[idx] = { ...record, id, createdAt: state.formulas[idx].createdAt };
  return true;
}
async function deleteFormula(id) {
  const { error } = await sb.from("formulas").delete().eq("id", id);
  if (error) { showToast("Não consegui remover a fórmula do banco."); return false; }
  state.formulas = state.formulas.filter((f) => f.id !== id);
  return true;
}

async function addAccord(record) {
  const { data, error } = await sb.from("accords").insert(toAccordRow(record)).select().single();
  if (error || !data) { showToast("Não consegui salvar o acorde no banco."); return false; }
  state.accords.push(mapAccordFromDb(data));
  return true;
}
async function updateAccord(id, record) {
  const { error } = await sb.from("accords").update(toAccordRow(record)).eq("id", id);
  if (error) { showToast("Não consegui atualizar o acorde no banco."); return false; }
  const idx = state.accords.findIndex((a) => a.id === id);
  if (idx >= 0) state.accords[idx] = { ...record, id, createdAt: state.accords[idx].createdAt };
  return true;
}
async function deleteAccord(id) {
  const { error } = await sb.from("accords").delete().eq("id", id);
  if (error) { showToast("Não consegui remover o acorde do banco."); return false; }
  state.accords = state.accords.filter((a) => a.id !== id);
  return true;
}

async function addPerfume(record) {
  const { data, error } = await sb.from("perfumes").insert(toPerfumeRow(record)).select().single();
  if (error || !data) { showToast("Não consegui salvar o perfume no banco."); return false; }
  state.perfumes.push(mapPerfumeFromDb(data));
  return true;
}
async function updatePerfume(id, record) {
  const { error } = await sb.from("perfumes").update(toPerfumeRow(record)).eq("id", id);
  if (error) { showToast("Não consegui atualizar o perfume no banco."); return false; }
  const idx = state.perfumes.findIndex((p) => p.id === id);
  if (idx >= 0) state.perfumes[idx] = { ...record, id, createdAt: state.perfumes[idx].createdAt };
  return true;
}
async function deletePerfume(id) {
  const { error } = await sb.from("perfumes").delete().eq("id", id);
  if (error) { showToast("Não consegui remover o perfume do banco."); return false; }
  state.perfumes = state.perfumes.filter((p) => p.id !== id);
  return true;
}

/* --------------------------------- RENDER --------------------------------- */

const TABS = [
  { key: "estoque", label: "Estoque" },
  { key: "formulas", label: "Fórmulas" },
  { key: "acordes", label: "Acordes" },
  { key: "perfumes", label: "Perfumes" },
];

function render() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="shell">
      <div class="topbar">
        <div class="mark">
          <span class="mark-word">Obsidian</span>
          <span class="mark-sub">Laboratório</span>
        </div>
        <div class="tabs">
          ${TABS.map((t) => `<button class="tab-btn ${state.tab === t.key ? "active" : ""}" data-action="tab" data-tab="${t.key}">${esc(t.label)}</button>`).join("")}
        </div>
        <div class="backup-actions">
          <input type="file" accept="application/json" id="importFile" style="display:none" />
          <button class="btn-ghost small" data-action="import">Importar backup</button>
          <button class="btn-ghost small" data-action="export">Exportar backup</button>
        </div>
      </div>
      <div id="tabContent"></div>
    </div>
    <div id="toast" class="toast" style="display:none"></div>
    <div id="modalRoot"></div>
  `;
  renderTabContent();
  wireTopbar();
}

function renderTabContent() {
  const el = document.getElementById("tabContent");
  if (!state.loaded) {
    el.innerHTML = `<div class="empty">Carregando laboratório...</div>`;
    return;
  }
  if (state.tab === "estoque") { el.innerHTML = estoqueShellHtml(); wireEstoqueShell(); }
  else if (state.tab === "formulas") { el.innerHTML = formulasShellHtml(); wireFormulasShell(); }
  else if (state.tab === "acordes") { el.innerHTML = acordesShellHtml(); wireAcordesShell(); }
  else if (state.tab === "perfumes") { el.innerHTML = perfumesShellHtml(); wirePerfumesShell(); }
}

/* ------------------------------ ESTOQUE TAB -------------------------------- */

function estoqueShellHtml() {
  return `
    <div class="spectrum" id="spectrum"></div>
    <div class="controls">
      <div class="controls-row">
        <input class="search" id="searchInput" placeholder="Buscar por nome ou CAS..." value="${esc(state.search)}" />
        <button class="btn-primary" data-action="new-material">+ Novo material</button>
      </div>
      <div class="chips scroll" id="categoryChips"></div>
      <div class="chips scroll" id="familyChips"></div>
      <div class="chips scroll" id="positionChips"></div>
    </div>
    <div id="materialsGroups"></div>
  `;
}

function wireEstoqueShell() {
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.search = e.target.value;
    updateMaterialsList();
  });
  document.getElementById("tabContent").addEventListener("click", delegatedEstoqueClicks);
  renderCategoryChips();
  renderFamilyChips();
  renderPositionChips();
  renderSpectrum();
  updateMaterialsList();
}

function delegatedEstoqueClicks(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "new-material") openMaterialModal(null, btn.dataset.family || null);
  else if (action === "edit-material") openMaterialModal(btn.dataset.id);
  else if (action === "delete-material") handleDeleteMaterial(btn.dataset.id);
  else if (action === "toggle-family") {
    state.collapsed[btn.dataset.family] = !state.collapsed[btn.dataset.family];
    updateMaterialsList();
  } else if (action === "cat-filter") {
    state.categoryFilter = btn.dataset.cat;
    renderCategoryChips();
    updateMaterialsList();
  } else if (action === "fam-filter") {
    state.familyFilter = btn.dataset.fam;
    renderFamilyChips();
    updateMaterialsList();
  } else if (action === "pos-filter") {
    state.positionFilter = btn.dataset.pos;
    renderPositionChips();
    updateMaterialsList();
  }
}

function renderCategoryChips() {
  const el = document.getElementById("categoryChips");
  const chips = [{ key: "all", label: "Todas as categorias" }, ...CATEGORIES.map((c) => ({ key: c.key, label: c.label }))];
  el.innerHTML = chips
    .map(
      (c) => `<button class="chip ${state.categoryFilter === c.key ? "active" : ""}" data-action="cat-filter" data-cat="${c.key}">${esc(c.label)}</button>`
    )
    .join("");
}

function renderFamilyChips() {
  const el = document.getElementById("familyChips");
  el.innerHTML =
    `<button class="chip ${state.familyFilter === "all" ? "active" : ""}" data-action="fam-filter" data-fam="all">Todas as famílias</button>` +
    FAMILIES.map(
      (f) =>
        `<button class="chip ${state.familyFilter === f.key ? "active" : ""}" data-action="fam-filter" data-fam="${f.key}"><span class="dot" style="background:${f.color}"></span>${esc(f.label)}</button>`
    ).join("");
}

function renderSpectrum() {
  const el = document.getElementById("spectrum");
  if (!el) return;
  const counts = {};
  let total = 0;
  FAMILIES.forEach((f) => (counts[f.key] = 0));
  state.items.forEach((it) => { counts[it.family] = (counts[it.family] || 0) + 1; total += 1; });
  const lowCount = state.items.filter((it) => it.minStock != null && it.quantity <= it.minStock).length;
  const bar =
    total === 0
      ? `<div class="spectrum-seg" style="width:100%;background:var(--charcoal2)"></div>`
      : FAMILIES.filter((f) => counts[f.key] > 0)
          .map((f) => `<div class="spectrum-seg" style="width:${(counts[f.key] / total) * 100}%;background:${f.color}" title="${esc(f.label)}: ${counts[f.key]}"></div>`)
          .join("");
  el.innerHTML = `
    <div class="spectrum-bar">${bar}</div>
    <div class="spectrum-meta">
      <span>${total} materiais cadastrados</span>
      ${lowCount > 0 ? `<span class="low-tag">${lowCount} em estoque baixo</span>` : ""}
    </div>
  `;
}

function renderPositionChips() {
  const el = document.getElementById("positionChips");
  el.innerHTML =
    `<button class="chip ${state.positionFilter === "all" ? "active" : ""}" data-action="pos-filter" data-pos="all">Todas as notas</button>` +
    POSITIONS.map(
      (p) =>
        `<button class="chip ${state.positionFilter === p.key ? "active" : ""}" data-action="pos-filter" data-pos="${p.key}"><span class="dot" style="background:${p.color}"></span>${esc(p.label)}</button>`
    ).join("") +
    `<button class="chip ${state.positionFilter === "none" ? "active" : ""}" data-action="pos-filter" data-pos="none">Sem nota definida</button>`;
}

function getFilteredMaterials() {
  const q = state.search.trim().toLowerCase();
  return state.items.filter((it) => {
    const matchFam = state.familyFilter === "all" || it.family === state.familyFilter;
    const matchCat = state.categoryFilter === "all" || it.category === state.categoryFilter;
    const matchPos =
      state.positionFilter === "all" ||
      (state.positionFilter === "none" ? !it.typicalPosition : it.typicalPosition === state.positionFilter);
    const matchSearch = !q || it.name.toLowerCase().includes(q) || (it.cas || "").toLowerCase().includes(q);
    return matchFam && matchCat && matchPos && matchSearch;
  });
}

function updateMaterialsList() {
  renderSpectrum();
  const el = document.getElementById("materialsGroups");
  if (!el) return;
  const filtered = getFilteredMaterials();
  if (state.items.length === 0) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty-title">Estoque vazio</div>
        <div class="empty-sub">Cadastre teu primeiro material — químico, óleo essencial ou absoluto — pra organizar por família olfativa e diluição.</div>
        <button class="btn-primary" data-action="new-material">+ Novo material</button>
      </div>`;
    return;
  }
  const grouped = {};
  FAMILIES.forEach((f) => (grouped[f.key] = []));
  filtered.forEach((it) => { (grouped[it.family] = grouped[it.family] || []).push(it); });
  Object.keys(grouped).forEach((k) => grouped[k].sort((a, b) => a.name.localeCompare(b.name) || b.concentration - a.concentration));

  let html = "";
  FAMILIES.forEach((f) => {
    const list = grouped[f.key] || [];
    if (list.length === 0) return;
    const isCollapsed = state.collapsed[f.key];
    html += `
      <section class="fam-section">
        <button class="fam-header" data-action="toggle-family" data-family="${f.key}">
          <span style="display:flex;align-items:center;">
            <span class="dot" style="background:${f.color};width:9px;height:9px;"></span>
            <span class="fam-title" style="margin-left:10px;">${esc(f.label)}</span>
            <span class="fam-count">${list.length}</span>
          </span>
          <span style="color:var(--ash);font-size:12px;">${isCollapsed ? "mostrar" : "ocultar"}</span>
        </button>
        ${isCollapsed ? "" : `<div class="grid">${list.map((it) => materialCardHtml(it, f)).join("")}<button class="add-card" data-action="new-material" data-family="${f.key}">+ adicionar em ${esc(f.label.toLowerCase())}</button></div>`}
      </section>`;
  });
  el.innerHTML = html || `<div class="empty"><div class="empty-sub">Nenhum material bate com esse filtro.</div></div>`;
}

function materialCardHtml(it, f) {
  const low = it.minStock != null && it.quantity <= it.minStock;
  const catLabel = catMap[it.category] ? catMap[it.category].label : "";
  const posInfo = it.typicalPosition ? posMap[it.typicalPosition] : null;
  return `
    <div class="card ${low ? "card-low" : ""}">
      <div class="card-bar" style="background:${f.color}"></div>
      <div class="card-body">
        <div class="card-top">
          <div class="card-name">${esc(it.name)}</div>
          <div class="badge">${it.concentration === 100 ? "Puro" : it.concentration + "%"}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:10.5px;color:var(--ash-dim);">${esc(catLabel)}</span>
          ${posInfo ? `<span class="badge" style="color:${posInfo.color};border-color:${posInfo.color}55;">${esc(posInfo.label)}</span>` : ""}
        </div>
        <div class="card-qty">${fmt(it.quantity)} <span style="color:var(--ash);font-size:12px;">${esc(it.unit)}</span></div>
        ${it.minStock != null ? `<div class="card-min ${low ? "low" : ""}">mínimo: ${fmt(it.minStock)} ${esc(it.unit)}</div>` : ""}
        <div class="card-meta">
          ${it.solvent ? `<span>Diluente: ${esc(it.solvent)}</span>` : ""}
          ${it.cas ? `<span style="font-family:'JetBrains Mono',monospace">CAS ${esc(it.cas)}</span>` : ""}
          ${it.supplier ? `<span>${esc(it.supplier)}</span>` : ""}
        </div>
        ${it.notes ? `<div class="card-notes">${esc(it.notes)}</div>` : ""}
        <div class="card-actions">
          <button class="btn-text" data-action="edit-material" data-id="${it.id}">editar</button>
          <button class="btn-text danger" data-action="delete-material" data-id="${it.id}">remover</button>
        </div>
      </div>
    </div>`;
}

async function handleDeleteMaterial(id) {
  if (!confirm("Remover esse material do estoque?")) return;
  await deleteItem(id);
  updateMaterialsList();
}

/* --------------------------- MODAL: MATERIAL ------------------------------ */

function openMaterialModal(editId, presetFamily) {
  const editing = editId ? state.items.find((it) => it.id === editId) : null;
  const isCustomConc = editing && !CONCENTRATIONS.includes(editing.concentration);

  const root = document.getElementById("modalRoot");
  root.innerHTML = `
    <div class="overlay" id="overlay">
      <form class="modal" id="materialForm">
        <div class="modal-title">${editing ? "Editar material" : "Novo material"}</div>

        <label class="label">Nome</label>
        <input class="input" id="f-name" value="${editing ? esc(editing.name) : ""}" placeholder="Ex: Iso E Super" />
        <div class="family-hint" id="familyHint" style="display:none;"></div>

        <div class="row2">
          <div>
            <label class="label">Categoria</label>
            <select class="input" id="f-category">
              ${CATEGORIES.map((c) => `<option value="${c.key}" ${editing && editing.category === c.key ? "selected" : ""}>${esc(c.label)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="label">Família olfativa</label>
            <select class="input" id="f-family">
              ${FAMILIES.map((f) => `<option value="${f.key}" ${(editing ? editing.family : presetFamily) === f.key ? "selected" : ""}>${esc(f.label)}</option>`).join("")}
            </select>
          </div>
        </div>

        <label class="label">Nota característica (método Jean Carles)</label>
        <select class="input" id="f-typicalPosition">
          <option value="">— não definida —</option>
          ${POSITIONS.map((p) => `<option value="${p.key}" ${editing && editing.typicalPosition === p.key ? "selected" : ""}>${esc(p.label)}</option>`).join("")}
        </select>

        <div class="row2">
          <div>
            <label class="label">Concentração</label>
            <select class="input" id="f-concentration">
              <option value="100" ${!isCustomConc && (!editing || editing.concentration === 100) ? "selected" : ""}>Puro (100%)</option>
              <option value="50" ${editing && editing.concentration === 50 ? "selected" : ""}>Diluído 50%</option>
              <option value="10" ${editing && editing.concentration === 10 ? "selected" : ""}>Diluído 10%</option>
              <option value="1" ${editing && editing.concentration === 1 ? "selected" : ""}>Diluído 1%</option>
              <option value="custom" ${isCustomConc ? "selected" : ""}>Outra %</option>
            </select>
          </div>
          <div id="customConcWrap" style="${isCustomConc ? "" : "display:none;"}">
            <label class="label">Qual %?</label>
            <input class="input" id="f-customConc" type="number" step="0.1" value="${isCustomConc ? editing.concentration : ""}" />
          </div>
        </div>

        <div class="row2">
          <div>
            <label class="label">Quantidade</label>
            <input class="input" id="f-quantity" type="number" step="0.01" value="${editing ? editing.quantity : ""}" />
          </div>
          <div>
            <label class="label">Unidade</label>
            <select class="input" id="f-unit">
              <option value="g" ${!editing || editing.unit === "g" ? "selected" : ""}>gramas (g)</option>
              <option value="ml" ${editing && editing.unit === "ml" ? "selected" : ""}>mililitros (ml)</option>
            </select>
          </div>
        </div>

        <label class="label">Estoque mínimo (opcional)</label>
        <input class="input" id="f-minStock" type="number" step="0.01" value="${editing && editing.minStock != null ? editing.minStock : ""}" placeholder="Alerta quando abaixo deste valor" />

        <div class="row2">
          <div>
            <label class="label">Diluente (se aplicável)</label>
            <input class="input" id="f-solvent" value="${editing ? esc(editing.solvent) : ""}" placeholder="Ex: DPG, IPM, álcool" />
          </div>
          <div>
            <label class="label">CAS (opcional)</label>
            <input class="input" id="f-cas" value="${editing ? esc(editing.cas) : ""}" />
          </div>
        </div>

        <label class="label">Fornecedor</label>
        <input class="input" id="f-supplier" value="${editing ? esc(editing.supplier) : ""}" placeholder="Ex: euperfumista, Perfumoteca, Laszlo" />

        <label class="label">Notas</label>
        <textarea class="input" id="f-notes" style="min-height:60px;resize:vertical;">${editing ? esc(editing.notes) : ""}</textarea>

        <div class="form-error" id="formError" style="display:none;"></div>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" data-action="close-modal">Cancelar</button>
          <button type="submit" class="btn-primary">${editing ? "Salvar alterações" : "Adicionar material"}</button>
        </div>
      </form>
    </div>
  `;

  let familyTouched = !!editing || !!presetFamily;

  document.getElementById("overlay").addEventListener("click", (e) => {
    if (e.target.id === "overlay") closeModal();
  });
  document.getElementById("materialForm").addEventListener("click", (e) => e.stopPropagation());
  root.querySelector('[data-action="close-modal"]').addEventListener("click", closeModal);

  document.getElementById("f-name").addEventListener("input", (e) => {
    if (familyTouched) return;
    const guess = guessFamily(e.target.value);
    const hint = document.getElementById("familyHint");
    if (guess) {
      document.getElementById("f-family").value = guess;
      hint.style.display = "block";
      hint.innerHTML = `família detectada: <strong>${esc(famMap[guess].label)}</strong> · pode trocar abaixo se quiser`;
    } else {
      hint.style.display = "none";
    }
  });
  document.getElementById("f-family").addEventListener("change", () => {
    familyTouched = true;
    document.getElementById("familyHint").style.display = "none";
  });
  document.getElementById("f-concentration").addEventListener("change", (e) => {
    document.getElementById("customConcWrap").style.display = e.target.value === "custom" ? "" : "none";
  });

  document.getElementById("materialForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("f-name").value.trim();
    const quantityRaw = document.getElementById("f-quantity").value;
    const errEl = document.getElementById("formError");
    if (!name) { errEl.textContent = "Dá um nome pro material antes de salvar."; errEl.style.display = "block"; return; }
    if (quantityRaw === "" || isNaN(parseFloat(quantityRaw))) { errEl.textContent = "Preenche a quantidade (pode ser 0 se ainda não tiver)."; errEl.style.display = "block"; return; }
    errEl.style.display = "none";

    const concSel = document.getElementById("f-concentration").value;
    const conc = concSel === "custom" ? parseFloat(document.getElementById("f-customConc").value) || 0 : parseFloat(concSel);
    const minStockRaw = document.getElementById("f-minStock").value;

    const record = {
      name,
      category: document.getElementById("f-category").value,
      family: document.getElementById("f-family").value,
      typicalPosition: document.getElementById("f-typicalPosition").value || null,
      concentration: conc,
      unit: document.getElementById("f-unit").value,
      quantity: parseFloat(quantityRaw) || 0,
      minStock: minStockRaw === "" ? null : parseFloat(minStockRaw),
      solvent: document.getElementById("f-solvent").value.trim(),
      cas: document.getElementById("f-cas").value.trim(),
      supplier: document.getElementById("f-supplier").value.trim(),
      notes: document.getElementById("f-notes").value.trim(),
    };

    const ok = editing ? await updateItem(editing.id, record) : await addItem(record);
    if (ok) { closeModal(); updateMaterialsList(); }
  });
}

function closeModal() {
  document.getElementById("modalRoot").innerHTML = "";
}

/* ------------------------------- FORMULAS TAB ------------------------------ */

function formulasShellHtml() {
  return `
    <div class="form-header">
      <span class="form-count">${state.formulas.length} fórmula${state.formulas.length === 1 ? "" : "s"} registrada${state.formulas.length === 1 ? "" : "s"}</span>
      <button class="btn-primary" data-action="new-formula">+ Nova fórmula</button>
    </div>
    <div id="formulasGrid"></div>
  `;
}

function wireFormulasShell() {
  document.getElementById("tabContent").addEventListener("click", delegatedFormulasClicks);
  renderFormulasGrid();
}

function delegatedFormulasClicks(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "new-formula") openFormulaModal(null);
  else if (action === "edit-formula") openFormulaModal(btn.dataset.id);
  else if (action === "delete-formula") handleDeleteFormula(btn.dataset.id);
  else if (action === "toggle-calc") {
    const id = btn.dataset.id;
    calcState[id] = calcState[id] || { open: false, batchSize: "10", concPct: btn.dataset.defaultpct };
    calcState[id].open = !calcState[id].open;
    renderFormulasGrid();
  }
}

function renderFormulasGrid() {
  const el = document.getElementById("formulasGrid");
  if (!el) return;
  const sorted = [...state.formulas].sort((a, b) => a.createdAt - b.createdAt);
  if (sorted.length === 0) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty-title">Nenhuma criação registrada</div>
        <div class="empty-sub">Cadastre a fórmula de uma criação: os materiais, a posição de cada um na pirâmide olfativa e a concentração final do frasco.</div>
        <button class="btn-primary" data-action="new-formula">+ Nova fórmula</button>
      </div>`;
    return;
  }
  el.innerHTML = `<div class="forms-grid">${sorted.map((f, i) => formulaCardHtml(f, i + 1)).join("")}</div>`;
  sorted.forEach((f) => wireCalculator(f));
}

function formulaCardHtml(formula, number) {
  const sums = { topo: 0, coracao: 0, fundo: 0 };
  formula.materials.forEach((m) => { sums[m.position] = (sums[m.position] || 0) + m.percentage; });
  const totalPct = formula.materials.reduce((a, m) => a + m.percentage, 0);
  const totalOk = totalPct >= 99 && totalPct <= 101;
  const cs = calcState[formula.id] || { open: false, batchSize: "10", concPct: String(formula.concentrationPct) };
  calcState[formula.id] = cs;

  const pyramidHtml = POSITIONS.map((p) =>
    sums[p.key] > 0
      ? `<div class="pyramid-seg" style="width:${(sums[p.key] / (totalPct || 1)) * 100}%;background:${p.color}">${Math.round(sums[p.key])}%</div>`
      : ""
  ).join("");

  const matListHtml = formula.materials
    .map(
      (m) => `
      <div class="mat-row">
        <span class="dot" style="background:${famMap[m.family] ? famMap[m.family].color : "#888"}"></span>
        <span class="mat-name">${esc(m.name)}${m.concLabel ? " · " + esc(m.concLabel) : ""}</span>
        <span class="mat-pct">${fmt(m.percentage)}%</span>
      </div>`
    )
    .join("");

  const batch = parseFloat(cs.batchSize) || 0;
  const conc = parseFloat(cs.concPct) || 0;
  const compoundTotal = (batch * conc) / 100;
  const diluent = batch - compoundTotal;
  const calcRows = formula.materials
    .map((m) => {
      const needed = (compoundTotal * m.percentage) / 100;
      const inv = m.inventoryId ? state.items.find((it) => it.id === m.inventoryId) : null;
      const insufficient = inv && inv.quantity < needed;
      return `<div class="calc-result-row"><span style="color:var(--ash)">${esc(m.name)}</span><span class="${insufficient ? "insufficient" : ""}">${fmt(needed)}${inv ? esc(inv.unit) : "g"}${insufficient ? " · tem só " + fmt(inv.quantity) + esc(inv.unit) : ""}</span></div>`;
    })
    .join("");

  return `
    <div class="fcard" data-formula-id="${formula.id}">
      <div class="fcard-eyebrow">
        <span class="fcard-num">Fórmula N° ${String(number).padStart(3, "0")}</span>
        <span class="fcard-type">${esc(formula.concentrationType)} · ${fmt(formula.concentrationPct)}%</span>
      </div>
      <div>
        <div class="fcard-name">${esc(formula.name)}</div>
        ${formula.concept ? `<div class="fcard-concept">${esc(formula.concept)}</div>` : ""}
      </div>
      <div>
        <div class="pyramid-label"><span>Topo</span><span>Coração</span><span>Fundo</span></div>
        <div class="pyramid-bar">${pyramidHtml}</div>
      </div>
      <div class="fcard-total">
        <span>${formula.materials.length} material${formula.materials.length === 1 ? "" : "es"}</span>
        <span class="${totalOk ? "total-ok" : "total-warn"}">total ${fmt(totalPct)}% ${!totalOk ? "· ajustar p/ 100%" : ""}</span>
      </div>
      <div class="mat-list">${matListHtml}</div>
      <button class="calc-toggle" data-action="toggle-calc" data-id="${formula.id}" data-defaultpct="${formula.concentrationPct}">${cs.open ? "▾" : "▸"} calculadora de lote</button>
      <div class="calc-box ${cs.open ? "" : "hidden"}" id="calcBox-${formula.id}">
        <div class="calc-inputs">
          <div><label>tamanho do frasco (ml)</label><input type="number" step="0.1" id="batchSize-${formula.id}" value="${esc(cs.batchSize)}" /></div>
          <div><label>concentração (%)</label><input type="number" step="0.1" id="concPct-${formula.id}" value="${esc(cs.concPct)}" /></div>
        </div>
        <div class="calc-result-row"><span>composto (óleo)</span><span>${fmt(compoundTotal)} ml</span></div>
        <div class="calc-result-row"><span>álcool / diluente</span><span>${fmt(diluent)} ml</span></div>
        <div style="border-top:1px solid var(--hair-soft);padding-top:8px;display:flex;flex-direction:column;gap:6px;">${calcRows}</div>
        <div class="calc-note">cálculo assume densidade ≈ 1 (1ml ≈ 1g)</div>
      </div>
      <div class="fcard-actions">
        <div class="fcard-actions-left">
          <button class="btn-text" data-action="edit-formula" data-id="${formula.id}">editar</button>
          <button class="btn-text danger" data-action="delete-formula" data-id="${formula.id}">remover</button>
        </div>
      </div>
    </div>`;
}

function wireCalculator(formula) {
  const batchInput = document.getElementById("batchSize-" + formula.id);
  const concInput = document.getElementById("concPct-" + formula.id);
  if (!batchInput || !concInput) return;
  const update = () => {
    calcState[formula.id].batchSize = batchInput.value;
    calcState[formula.id].concPct = concInput.value;
    updateCalcResultsOnly(formula);
  };
  batchInput.addEventListener("input", update);
  concInput.addEventListener("input", update);
}

function updateCalcResultsOnly(formula) {
  const box = document.getElementById("calcBox-" + formula.id);
  if (!box) return;
  const cs = calcState[formula.id];
  const batch = parseFloat(cs.batchSize) || 0;
  const conc = parseFloat(cs.concPct) || 0;
  const compoundTotal = (batch * conc) / 100;
  const diluent = batch - compoundTotal;
  const rows = box.querySelectorAll(".calc-result-row");
  // rows[0] = composto, rows[1] = álcool, rows[2..] = materiais
  if (rows[0]) rows[0].querySelector("span:last-child").textContent = fmt(compoundTotal) + " ml";
  if (rows[1]) rows[1].querySelector("span:last-child").textContent = fmt(diluent) + " ml";
  formula.materials.forEach((m, i) => {
    const row = rows[2 + i];
    if (!row) return;
    const needed = (compoundTotal * m.percentage) / 100;
    const inv = m.inventoryId ? state.items.find((it) => it.id === m.inventoryId) : null;
    const insufficient = inv && inv.quantity < needed;
    const span = row.querySelector("span:last-child");
    span.textContent = fmt(needed) + (inv ? inv.unit : "g") + (insufficient ? " · tem só " + fmt(inv.quantity) + inv.unit : "");
    span.className = insufficient ? "insufficient" : "";
  });
}

async function handleDeleteFormula(id) {
  if (!confirm("Remover essa fórmula?")) return;
  await deleteFormula(id);
  renderFormulasGrid();
}

/* --------------------------- MODAL: FORMULA -------------------------------- */

let formulaRows = [];

function openFormulaModal(editId) {
  const editing = editId ? state.formulas.find((f) => f.id === editId) : null;
  formulaRows = editing
    ? editing.materials.map((m) => ({ rowId: uid(), inventoryId: m.inventoryId || "", name: m.name, family: m.family, concLabel: m.concLabel || "", position: m.position, percentage: String(m.percentage) }))
    : [{ rowId: uid(), inventoryId: "", name: "", family: "citrico", concLabel: "", position: "coracao", percentage: "" }];

  const root = document.getElementById("modalRoot");
  root.innerHTML = `
    <div class="overlay" id="overlay">
      <form class="modal modal-wide" id="formulaForm">
        <div class="modal-title">${editing ? "Editar fórmula" : "Nova fórmula"}</div>

        <label class="label">Nome da criação</label>
        <input class="input" id="ff-name" value="${editing ? esc(editing.name) : ""}" placeholder="Ex: Brasa de Mel" />

        <label class="label">Conceito / inspiração</label>
        <input class="input" id="ff-concept" value="${editing ? esc(editing.concept) : ""}" placeholder="Uma linha sobre a ideia por trás da fragrância" />

        <div class="row2">
          <div>
            <label class="label">Tipo / concentração final</label>
            <select class="input" id="ff-concType">
              ${CONC_PRESETS.map((p) => `<option value="${esc(p.label)}" ${(editing ? editing.concentrationType : "Eau de Parfum") === p.label ? "selected" : ""}>${esc(p.label)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="label">% do óleo no frasco final</label>
            <input class="input" id="ff-concPct" type="number" step="0.1" value="${editing ? editing.concentrationPct : "18"}" />
          </div>
        </div>

        <label class="label" style="margin-top:16px;">Materiais da fórmula (% do composto, soma ideal = 100%)</label>
        <div id="rowsContainer"></div>
        <button type="button" class="add-row-btn" id="addRowBtn">+ adicionar material</button>

        <label class="label">Notas</label>
        <textarea class="input" id="ff-notes" style="min-height:60px;resize:vertical;">${editing ? esc(editing.notes) : ""}</textarea>

        <div class="form-error" id="formulaFormError" style="display:none;"></div>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" data-action="close-modal">Cancelar</button>
          <button type="submit" class="btn-primary">${editing ? "Salvar alterações" : "Adicionar fórmula"}</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeModal(); });
  document.getElementById("formulaForm").addEventListener("click", (e) => e.stopPropagation());
  root.querySelector('[data-action="close-modal"]').addEventListener("click", closeModal);

  document.getElementById("ff-concType").addEventListener("change", (e) => {
    const preset = CONC_PRESETS.find((p) => p.label === e.target.value);
    if (preset && preset.pct != null) document.getElementById("ff-concPct").value = preset.pct;
  });

  renderFormulaRows();
  document.getElementById("addRowBtn").addEventListener("click", () => {
    formulaRows.push({ rowId: uid(), inventoryId: "", name: "", family: "citrico", concLabel: "", position: "coracao", percentage: "" });
    renderFormulaRows();
  });

  document.getElementById("formulaForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("ff-name").value.trim();
    const errEl = document.getElementById("formulaFormError");
    const validRows = formulaRows.filter((r) => (document.getElementById("row-name-" + r.rowId) ? document.getElementById("row-name-" + r.rowId).value.trim() : r.name.trim()));
    if (!name) { errEl.textContent = "Dá um nome pra criação antes de salvar."; errEl.style.display = "block"; return; }
    if (validRows.length === 0) { errEl.textContent = "Adiciona pelo menos um material com nome preenchido."; errEl.style.display = "block"; return; }
    errEl.style.display = "none";

    const materials = formulaRows
      .map((r) => {
        const invSelect = document.getElementById("row-inv-" + r.rowId);
        const nameInput = document.getElementById("row-name-" + r.rowId);
        const famSelect = document.getElementById("row-fam-" + r.rowId);
        const posSelect = document.getElementById("row-pos-" + r.rowId);
        const pctInput = document.getElementById("row-pct-" + r.rowId);
        const inventoryId = invSelect ? invSelect.value : "";
        let rname, rfamily, rconcLabel;
        if (inventoryId) {
          const inv = state.items.find((it) => it.id === inventoryId);
          rname = inv ? inv.name : "";
          rfamily = inv ? inv.family : "citrico";
          rconcLabel = inv ? (inv.concentration === 100 ? "Puro" : inv.concentration + "%") : "";
        } else {
          rname = nameInput ? nameInput.value.trim() : "";
          rfamily = famSelect ? famSelect.value : "citrico";
          rconcLabel = "";
        }
        return {
          id: uid(),
          inventoryId: inventoryId || null,
          name: rname,
          family: rfamily,
          concLabel: rconcLabel,
          position: posSelect ? posSelect.value : "coracao",
          percentage: parseFloat(pctInput ? pctInput.value : 0) || 0,
        };
      })
      .filter((m) => m.name);

    const record = {
      name,
      concept: document.getElementById("ff-concept").value.trim(),
      concentrationType: document.getElementById("ff-concType").value,
      concentrationPct: parseFloat(document.getElementById("ff-concPct").value) || 0,
      materials,
      notes: document.getElementById("ff-notes").value.trim(),
    };

    const ok = editing ? await updateFormula(editing.id, record) : await addFormula(record);
    if (ok) { closeModal(); renderFormulasGrid(); }
  });
}

function inventoryOptionsHtml(selectedId) {
  let html = `<option value="">— digitar manualmente —</option>`;
  FAMILIES.forEach((fam) => {
    const opts = state.items.filter((it) => it.family === fam.key);
    if (opts.length === 0) return;
    html += `<optgroup label="${esc(fam.label)}">`;
    opts.forEach((it) => {
      const posLabel = it.typicalPosition && posMap[it.typicalPosition] ? ` · ${posMap[it.typicalPosition].label}` : "";
      html += `<option value="${it.id}" ${selectedId === it.id ? "selected" : ""}>${esc(it.name)} — ${it.concentration === 100 ? "puro" : it.concentration + "%"}${posLabel} (${fmt(it.quantity)}${esc(it.unit)} em estoque)</option>`;
    });
    html += `</optgroup>`;
  });
  return html;
}

function renderFormulaRows() {
  const container = document.getElementById("rowsContainer");
  container.innerHTML = formulaRows
    .map(
      (row, i) => `
      <div class="mat-editor" data-row="${row.rowId}">
        <div class="mat-editor-top">
          <span class="mat-editor-idx">material ${String(i + 1).padStart(2, "0")}</span>
          ${formulaRows.length > 1 ? `<button type="button" class="remove-row" data-remove="${row.rowId}">remover</button>` : ""}
        </div>
        <select class="input" id="row-inv-${row.rowId}">${inventoryOptionsHtml(row.inventoryId)}</select>
        <div class="manual-fields-${row.rowId}" style="${row.inventoryId ? "display:none;" : ""}">
          <div class="row2">
            <input class="input" id="row-name-${row.rowId}" placeholder="Nome do material" value="${esc(row.name)}" />
            <select class="input" id="row-fam-${row.rowId}">
              ${FAMILIES.map((fam) => `<option value="${fam.key}" ${row.family === fam.key ? "selected" : ""}>${esc(fam.label)}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="row2">
          <div>
            <label class="label" style="margin-top:0;">Posição</label>
            <select class="input" id="row-pos-${row.rowId}">
              ${POSITIONS.map((p) => `<option value="${p.key}" ${row.position === p.key ? "selected" : ""}>${esc(p.label)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="label" style="margin-top:0;">% na fórmula</label>
            <input class="input" id="row-pct-${row.rowId}" type="number" step="0.01" value="${esc(row.percentage)}" />
          </div>
        </div>
      </div>`
    )
    .join("");

  formulaRows.forEach((row) => {
    const invSelect = document.getElementById("row-inv-" + row.rowId);
    invSelect.addEventListener("change", () => {
      const wrap = container.querySelector(".manual-fields-" + row.rowId);
      wrap.style.display = invSelect.value ? "none" : "";
      if (invSelect.value) {
        const inv = state.items.find((it) => it.id === invSelect.value);
        if (inv && inv.typicalPosition) {
          const posSelect = document.getElementById("row-pos-" + row.rowId);
          if (posSelect) posSelect.value = inv.typicalPosition;
        }
      }
    });
    const removeBtn = container.querySelector(`[data-remove="${row.rowId}"]`);
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        formulaRows = formulaRows.filter((r) => r.rowId !== row.rowId);
        renderFormulaRows();
      });
    }
    const nameInput = document.getElementById("row-name-" + row.rowId);
    if (nameInput) {
      nameInput.addEventListener("input", (e) => {
        const guess = guessFamily(e.target.value);
        if (guess) document.getElementById("row-fam-" + row.rowId).value = guess;
      });
    }
  });
}

/* -------------------------------- MATURAÇÃO UI ------------------------------ */

function maturityBarHtml(info) {
  return `
    <div class="maturity-row">
      <div class="maturity-bar"><div class="maturity-fill" style="width:${(info.ratio * 100).toFixed(0)}%;background:${info.color}"></div></div>
      <span class="maturity-label" style="color:${info.color}">${esc(info.label)}</span>
    </div>`;
}

function logListHtml(log) {
  if (!log || log.length === 0) return `<div class="log-empty">Nenhum registro de evolução ainda.</div>`;
  const sorted = [...log].sort((a, b) => new Date(a.date) - new Date(b.date));
  return `<div class="log-list">${sorted
    .map((entry) => `<div class="log-entry"><span class="log-date">${esc(formatDateBR(entry.date))}</span><span class="log-note">${esc(entry.note)}</span></div>`)
    .join("")}</div>`;
}

function formatDateBR(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

/* -------------------------------- ACORDES TAB ------------------------------- */

function acordesShellHtml() {
  return `
    <div class="form-header">
      <span class="form-count">${state.accords.length} acorde${state.accords.length === 1 ? "" : "s"} em teste</span>
      <button class="btn-primary" data-action="new-accord">+ Novo acorde</button>
    </div>
    <div id="accordsGrid"></div>
  `;
}

function wireAcordesShell() {
  document.getElementById("tabContent").addEventListener("click", delegatedAcordesClicks);
  document.getElementById("tabContent").addEventListener("submit", (e) => e.preventDefault());
  renderAccordsGrid();
}

function delegatedAcordesClicks(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "new-accord") openAccordModal(null);
  else if (action === "edit-accord") openAccordModal(btn.dataset.id);
  else if (action === "delete-accord") handleDeleteAccord(btn.dataset.id);
  else if (action === "add-accord-log") handleAddLog("accord", btn.dataset.id);
}

function renderAccordsGrid() {
  const el = document.getElementById("accordsGrid");
  if (!el) return;
  const sorted = [...state.accords].sort((a, b) => a.createdAt - b.createdAt);
  if (sorted.length === 0) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty-title">Nenhum acorde em teste</div>
        <div class="empty-sub">Cadastre um acorde pra acompanhar a maceração — a cor muda de vermelho pra maduro conforme os dias passam.</div>
        <button class="btn-primary" data-action="new-accord">+ Novo acorde</button>
      </div>`;
    return;
  }
  el.innerHTML = `<div class="forms-grid">${sorted.map((a) => accordCardHtml(a)).join("")}</div>`;
}

function accordCardHtml(a) {
  const info = maturityInfo(a.createdAt, a.maturationDays);
  const totalPct = a.materials.reduce((s, m) => s + m.percentage, 0);
  const matListHtml = a.materials.map((m) => `<div class="mat-row"><span class="mat-name">${esc(m.name)}</span><span class="mat-pct">${fmt(m.percentage)}%</span></div>`).join("");
  return `
    <div class="fcard">
      <div class="fcard-eyebrow">
        <span class="fcard-num">criado em ${esc(formatDateBR(new Date(a.createdAt).toISOString()))}</span>
        <span class="fcard-type">${a.maturationDays}d de maceração</span>
      </div>
      <div class="fcard-name">${esc(a.name)}</div>
      ${maturityBarHtml(info)}
      <div class="fcard-total"><span>${a.materials.length} material${a.materials.length === 1 ? "" : "es"}</span><span>total ${fmt(totalPct)}%</span></div>
      <div class="mat-list">${matListHtml}</div>
      ${a.notes ? `<div class="card-notes">${esc(a.notes)}</div>` : ""}
      <div class="log-section">
        <div class="label" style="margin-top:0;">Evolução</div>
        ${logListHtml(a.log)}
        <form class="log-form" data-log-form="accord-${a.id}">
          <input type="text" class="input" placeholder="Como tá hoje?" id="logNote-accord-${a.id}" />
          <button type="submit" class="btn-ghost small" data-action="add-accord-log" data-id="${a.id}">+ registrar</button>
        </form>
      </div>
      <div class="fcard-actions">
        <div class="fcard-actions-left">
          <button class="btn-text" data-action="edit-accord" data-id="${a.id}">editar</button>
          <button class="btn-text danger" data-action="delete-accord" data-id="${a.id}">remover</button>
        </div>
      </div>
    </div>`;
}

async function handleDeleteAccord(id) {
  if (!confirm("Remover esse acorde?")) return;
  await deleteAccord(id);
  renderAccordsGrid();
}

async function handleAddLog(type, id) {
  const input = document.getElementById(`logNote-${type}-${id}`);
  const note = input ? input.value.trim() : "";
  if (!note) return;
  const entry = { date: new Date().toISOString(), note };
  if (type === "accord") {
    const item = state.accords.find((a) => a.id === id);
    if (!item) return;
    const record = { ...item, log: [...item.log, entry] };
    await updateAccord(id, record);
    renderAccordsGrid();
  } else {
    const item = state.perfumes.find((p) => p.id === id);
    if (!item) return;
    const record = { ...item, log: [...item.log, entry] };
    await updatePerfume(id, record);
    renderPerfumesGrid();
  }
}

let accordRows = [];

function openAccordModal(editId) {
  const editing = editId ? state.accords.find((a) => a.id === editId) : null;
  accordRows = editing
    ? editing.materials.map((m) => ({ rowId: uid(), inventoryId: m.inventoryId || "", name: m.name, percentage: String(m.percentage) }))
    : [{ rowId: uid(), inventoryId: "", name: "", percentage: "" }];

  const root = document.getElementById("modalRoot");
  root.innerHTML = `
    <div class="overlay" id="overlay">
      <form class="modal modal-wide" id="accordForm">
        <div class="modal-title">${editing ? "Editar acorde" : "Novo acorde"}</div>

        <label class="label">Nome do acorde</label>
        <input class="input" id="ac-name" value="${editing ? esc(editing.name) : ""}" placeholder="Ex: Acorde âmbar modificado" />

        <label class="label">Prazo estimado de maceração (dias)</label>
        <input class="input" id="ac-maturation" type="number" step="1" value="${editing ? editing.maturationDays : "18"}" />
        <div style="font-size:11px;color:var(--ash-dim);margin-top:4px;">Referência: leve/cítrico ~7-10d · equilibrado ~15-20d · pesado/resinoso ~25-35d</div>

        <label class="label" style="margin-top:16px;">Materiais do acorde (%)</label>
        <div id="accordRowsContainer"></div>
        <button type="button" class="add-row-btn" id="addAccordRowBtn">+ adicionar material</button>

        <label class="label">Notas</label>
        <textarea class="input" id="ac-notes" style="min-height:60px;resize:vertical;">${editing ? esc(editing.notes) : ""}</textarea>

        <div class="form-error" id="accordFormError" style="display:none;"></div>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" data-action="close-modal">Cancelar</button>
          <button type="submit" class="btn-primary">${editing ? "Salvar alterações" : "Adicionar acorde"}</button>
        </div>
      </form>
    </div>`;

  document.getElementById("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeModal(); });
  document.getElementById("accordForm").addEventListener("click", (e) => e.stopPropagation());
  root.querySelector('[data-action="close-modal"]').addEventListener("click", closeModal);

  renderAccordRows();
  document.getElementById("addAccordRowBtn").addEventListener("click", () => {
    accordRows.push({ rowId: uid(), inventoryId: "", name: "", percentage: "" });
    renderAccordRows();
  });

  document.getElementById("accordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("ac-name").value.trim();
    const errEl = document.getElementById("accordFormError");
    const materials = accordRows
      .map((r) => {
        const invSelect = document.getElementById("acrow-inv-" + r.rowId);
        const nameInput = document.getElementById("acrow-name-" + r.rowId);
        const pctInput = document.getElementById("acrow-pct-" + r.rowId);
        const inventoryId = invSelect ? invSelect.value : "";
        let rname;
        if (inventoryId) {
          const inv = state.items.find((it) => it.id === inventoryId);
          rname = inv ? inv.name : "";
        } else {
          rname = nameInput ? nameInput.value.trim() : "";
        }
        return { id: uid(), inventoryId: inventoryId || null, name: rname, percentage: parseFloat(pctInput ? pctInput.value : 0) || 0 };
      })
      .filter((m) => m.name);

    if (!name) { errEl.textContent = "Dá um nome pro acorde antes de salvar."; errEl.style.display = "block"; return; }
    if (materials.length === 0) { errEl.textContent = "Adiciona pelo menos um material com nome preenchido."; errEl.style.display = "block"; return; }
    errEl.style.display = "none";

    const record = {
      name,
      materials,
      maturationDays: parseFloat(document.getElementById("ac-maturation").value) || 18,
      notes: document.getElementById("ac-notes").value.trim(),
      log: editing ? editing.log : [],
    };

    const ok = editing ? await updateAccord(editing.id, record) : await addAccord(record);
    if (ok) { closeModal(); renderAccordsGrid(); }
  });
}

function renderAccordRows() {
  const container = document.getElementById("accordRowsContainer");
  container.innerHTML = accordRows
    .map(
      (row, i) => `
      <div class="mat-editor" data-row="${row.rowId}">
        <div class="mat-editor-top">
          <span class="mat-editor-idx">material ${String(i + 1).padStart(2, "0")}</span>
          ${accordRows.length > 1 ? `<button type="button" class="remove-row" data-remove="${row.rowId}">remover</button>` : ""}
        </div>
        <select class="input" id="acrow-inv-${row.rowId}">${inventoryOptionsHtml(row.inventoryId)}</select>
        <div class="manual-fields-${row.rowId}" style="${row.inventoryId ? "display:none;" : ""}">
          <input class="input" id="acrow-name-${row.rowId}" placeholder="Nome do material" value="${esc(row.name)}" />
        </div>
        <label class="label" style="margin-top:0;">% no acorde</label>
        <input class="input" id="acrow-pct-${row.rowId}" type="number" step="0.01" value="${esc(row.percentage)}" />
      </div>`
    )
    .join("");

  accordRows.forEach((row) => {
    const invSelect = document.getElementById("acrow-inv-" + row.rowId);
    invSelect.addEventListener("change", () => {
      const wrap = container.querySelector(".manual-fields-" + row.rowId);
      if (wrap) wrap.style.display = invSelect.value ? "none" : "";
    });
    const removeBtn = container.querySelector(`[data-remove="${row.rowId}"]`);
    if (removeBtn) removeBtn.addEventListener("click", () => { accordRows = accordRows.filter((r) => r.rowId !== row.rowId); renderAccordRows(); });
  });
}

/* -------------------------------- PERFUMES TAB ------------------------------ */

function perfumesShellHtml() {
  return `
    <div class="form-header">
      <span class="form-count">${state.perfumes.length} cria${state.perfumes.length === 1 ? "ção" : "ções"} em acompanhamento</span>
      <button class="btn-primary" data-action="new-perfume">+ Nova criação</button>
    </div>
    <div id="perfumesGrid"></div>
  `;
}

function wirePerfumesShell() {
  document.getElementById("tabContent").addEventListener("click", delegatedPerfumesClicks);
  document.getElementById("tabContent").addEventListener("submit", (e) => e.preventDefault());
  renderPerfumesGrid();
}

function delegatedPerfumesClicks(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "new-perfume") openPerfumeModal(null);
  else if (action === "edit-perfume") openPerfumeModal(btn.dataset.id);
  else if (action === "delete-perfume") handleDeletePerfume(btn.dataset.id);
  else if (action === "add-perfume-log") handleAddLog("perfume", btn.dataset.id);
}

function renderPerfumesGrid() {
  const el = document.getElementById("perfumesGrid");
  if (!el) return;
  const sorted = [...state.perfumes].sort((a, b) => a.createdAt - b.createdAt);
  if (sorted.length === 0) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty-title">Nenhuma criação em acompanhamento</div>
        <div class="empty-sub">Registra o briefing de um perfume — nome, proposta e prazo de maceração — e acompanha a maturação até ficar pronto pra avaliar de verdade.</div>
        <button class="btn-primary" data-action="new-perfume">+ Nova criação</button>
      </div>`;
    return;
  }
  el.innerHTML = `<div class="forms-grid">${sorted.map((p) => perfumeCardHtml(p)).join("")}</div>`;
}

function perfumeCardHtml(p) {
  const info = maturityInfo(p.createdAt, p.maturationDays);
  const linkedFormula = p.formulaId ? state.formulas.find((f) => f.id === p.formulaId) : null;
  return `
    <div class="fcard">
      <div class="fcard-eyebrow">
        <span class="fcard-num">criado em ${esc(formatDateBR(new Date(p.createdAt).toISOString()))}</span>
        <span class="fcard-type">${p.maturationDays}d de maceração</span>
      </div>
      <div class="fcard-name">${esc(p.name)}</div>
      ${p.briefing ? `<div class="fcard-concept">${esc(p.briefing)}</div>` : ""}
      ${linkedFormula ? `<div style="font-size:11px;color:var(--gold);">fórmula vinculada: ${esc(linkedFormula.name)}</div>` : ""}
      ${maturityBarHtml(info)}
      ${p.notes ? `<div class="card-notes">${esc(p.notes)}</div>` : ""}
      <div class="log-section">
        <div class="label" style="margin-top:0;">Evolução</div>
        ${logListHtml(p.log)}
        <form class="log-form" data-log-form="perfume-${p.id}">
          <input type="text" class="input" placeholder="Como tá hoje?" id="logNote-perfume-${p.id}" />
          <button type="submit" class="btn-ghost small" data-action="add-perfume-log" data-id="${p.id}">+ registrar</button>
        </form>
      </div>
      <div class="fcard-actions">
        <div class="fcard-actions-left">
          <button class="btn-text" data-action="edit-perfume" data-id="${p.id}">editar</button>
          <button class="btn-text danger" data-action="delete-perfume" data-id="${p.id}">remover</button>
        </div>
      </div>
    </div>`;
}

async function handleDeletePerfume(id) {
  if (!confirm("Remover essa criação?")) return;
  await deletePerfume(id);
  renderPerfumesGrid();
}

function openPerfumeModal(editId) {
  const editing = editId ? state.perfumes.find((p) => p.id === editId) : null;
  const root = document.getElementById("modalRoot");
  root.innerHTML = `
    <div class="overlay" id="overlay">
      <form class="modal" id="perfumeForm">
        <div class="modal-title">${editing ? "Editar criação" : "Nova criação"}</div>

        <label class="label">Nome do perfume</label>
        <input class="input" id="pf-name" value="${editing ? esc(editing.name) : ""}" placeholder="Ex: Brasa de Mel" />

        <label class="label">Briefing / proposta</label>
        <textarea class="input" id="pf-briefing" style="min-height:70px;resize:vertical;" placeholder="O que esse perfume propõe, pra quem, a ideia por trás">${editing ? esc(editing.briefing) : ""}</textarea>

        <label class="label">Fórmula vinculada (opcional)</label>
        <select class="input" id="pf-formula">
          <option value="">— nenhuma —</option>
          ${state.formulas.map((f) => `<option value="${f.id}" ${editing && editing.formulaId === f.id ? "selected" : ""}>${esc(f.name)}</option>`).join("")}
        </select>

        <label class="label">Prazo estimado de maceração (dias)</label>
        <input class="input" id="pf-maturation" type="number" step="1" value="${editing ? editing.maturationDays : "18"}" />
        <div style="font-size:11px;color:var(--ash-dim);margin-top:4px;">Referência: leve/cítrico ~7-10d · equilibrado ~15-20d · pesado/resinoso ~25-35d</div>

        <label class="label">Notas</label>
        <textarea class="input" id="pf-notes" style="min-height:60px;resize:vertical;">${editing ? esc(editing.notes) : ""}</textarea>

        <div class="form-error" id="perfumeFormError" style="display:none;"></div>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" data-action="close-modal">Cancelar</button>
          <button type="submit" class="btn-primary">${editing ? "Salvar alterações" : "Adicionar criação"}</button>
        </div>
      </form>
    </div>`;

  document.getElementById("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeModal(); });
  document.getElementById("perfumeForm").addEventListener("click", (e) => e.stopPropagation());
  root.querySelector('[data-action="close-modal"]').addEventListener("click", closeModal);

  document.getElementById("perfumeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("pf-name").value.trim();
    const errEl = document.getElementById("perfumeFormError");
    if (!name) { errEl.textContent = "Dá um nome pro perfume antes de salvar."; errEl.style.display = "block"; return; }
    errEl.style.display = "none";

    const record = {
      name,
      briefing: document.getElementById("pf-briefing").value.trim(),
      formulaId: document.getElementById("pf-formula").value || null,
      maturationDays: parseFloat(document.getElementById("pf-maturation").value) || 18,
      notes: document.getElementById("pf-notes").value.trim(),
      log: editing ? editing.log : [],
    };

    const ok = editing ? await updatePerfume(editing.id, record) : await addPerfume(record);
    if (ok) { closeModal(); renderPerfumesGrid(); }
  });
}

/* -------------------------------- TOPBAR ----------------------------------- */

function wireTopbar() {
  document.querySelectorAll('[data-action="tab"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      state.tab = btn.dataset.tab;
      renderTabbarActive();
      renderTabContent();
    });
  });
  document.querySelector('[data-action="export"]').addEventListener("click", handleExport);
  document.querySelector('[data-action="import"]').addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", handleFileChosen);
}

function renderTabbarActive() {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === state.tab));
}

function handleExport() {
  const payload = {
    app: "obsidian-laboratorio",
    exportedAt: new Date().toISOString(),
    items: state.items,
    formulas: state.formulas,
    accords: state.accords,
    perfumes: state.perfumes,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `obsidian-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Backup exportado.", true);
}

function handleFileChosen(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.items) || !Array.isArray(parsed.formulas)) {
        showToast("Esse arquivo não parece um backup válido do laboratório.");
        return;
      }
      parsed.accords = Array.isArray(parsed.accords) ? parsed.accords : [];
      parsed.perfumes = Array.isArray(parsed.perfumes) ? parsed.perfumes : [];
      openImportConfirm(parsed);
    } catch (err) {
      showToast("Não consegui ler esse arquivo. Confere se é o JSON exportado daqui.");
    }
  };
  reader.readAsText(file);
}

function openImportConfirm(parsed) {
  const root = document.getElementById("modalRoot");
  root.innerHTML = `
    <div class="overlay" id="overlay">
      <div class="modal" id="importModal">
        <div class="modal-title">Importar backup</div>
        <p style="font-size:13px;color:var(--ash);line-height:1.6;">
          O arquivo tem ${parsed.items.length} material(is), ${parsed.formulas.length} fórmula(s), ${parsed.accords.length} acorde(s) e ${parsed.perfumes.length} criação(ões). Como tu quer aplicar?
        </p>
        <p style="font-size:12px;color:var(--ash-dim);line-height:1.6;">
          <strong style="color:var(--white-dim)">Mesclar</strong> mantém o que já existe e só acrescenta o que for novo.
          <strong style="color:var(--white-dim)">Substituir</strong> apaga o que está salvo agora e coloca só o do arquivo.
        </p>
        <div class="modal-actions">
          <button class="btn-ghost" data-action="close-modal">Cancelar</button>
          <button class="btn-ghost" data-mode="merge">Mesclar</button>
          <button class="btn-primary" data-mode="replace">Substituir tudo</button>
        </div>
      </div>
    </div>`;
  document.getElementById("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeModal(); });
  document.getElementById("importModal").addEventListener("click", (e) => e.stopPropagation());
  root.querySelector('[data-action="close-modal"]').addEventListener("click", closeModal);
  root.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => confirmImport(parsed, btn.dataset.mode));
  });
}

async function confirmImport(parsed, mode) {
  try {
    if (mode === "replace") {
      await sb.from("materials").delete().gte("created_at", "1900-01-01");
      await sb.from("formulas").delete().gte("created_at", "1900-01-01");
      await sb.from("accords").delete().gte("created_at", "1900-01-01");
      await sb.from("perfumes").delete().gte("created_at", "1900-01-01");
      const matRows = parsed.items.map(toMaterialRow);
      const formRows = parsed.formulas.map(toFormulaRow);
      const accRows = parsed.accords.map(toAccordRow);
      const perfRows = parsed.perfumes.map(toPerfumeRow);
      if (matRows.length) await sb.from("materials").insert(matRows);
      if (formRows.length) await sb.from("formulas").insert(formRows);
      if (accRows.length) await sb.from("accords").insert(accRows);
      if (perfRows.length) await sb.from("perfumes").insert(perfRows);
    } else {
      const dedupeKey = (it) => `${(it.name || "").toLowerCase()}|${it.family}|${it.concentration}`;
      const existingKeys = new Set(state.items.map(dedupeKey));
      const newMats = parsed.items.filter((it) => !existingKeys.has(dedupeKey(it))).map(toMaterialRow);
      if (newMats.length) await sb.from("materials").insert(newMats);

      const existingFormNames = new Set(state.formulas.map((f) => (f.name || "").toLowerCase()));
      const newForms = parsed.formulas.filter((f) => !existingFormNames.has((f.name || "").toLowerCase())).map(toFormulaRow);
      if (newForms.length) await sb.from("formulas").insert(newForms);

      const existingAccordNames = new Set(state.accords.map((a) => (a.name || "").toLowerCase()));
      const newAccords = parsed.accords.filter((a) => !existingAccordNames.has((a.name || "").toLowerCase())).map(toAccordRow);
      if (newAccords.length) await sb.from("accords").insert(newAccords);

      const existingPerfumeNames = new Set(state.perfumes.map((p) => (p.name || "").toLowerCase()));
      const newPerfumes = parsed.perfumes.filter((p) => !existingPerfumeNames.has((p.name || "").toLowerCase())).map(toPerfumeRow);
      if (newPerfumes.length) await sb.from("perfumes").insert(newPerfumes);
    }
    await reload();
    closeModal();
    render();
    showToast("Backup importado com sucesso.", true);
  } catch (e) {
    showToast("Não consegui importar o backup pro banco.");
  }
}

/* --------------------------------- START ------------------------------------ */

(async function start() {
  render();
  await reload();
  renderTabContent();
})();
