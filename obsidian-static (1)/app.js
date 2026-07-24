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

const ICONS = {
  search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  edit: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg>`,
  trash: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2"/></svg>`,
  close: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  flask: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6.5L4 18a2 2 0 002 3h12a2 2 0 002-3l-5-9.5V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/><line x1="7" y1="14" x2="17" y2="14"/></svg>`,
};

/* ---------------------------- MATCH DE COMPATIBILIDADE ---------------------- */
// Motor baseado em pareamentos clássicos de perfumaria (teoria de acordes/famílias).
// É um modelo heurístico, não uma verdade absoluta — serve como bússola, não veredito.

const FAMILY_PAIRS = [
  // cítrico
  ["citrico", "amadeirado", 1.0], ["citrico", "aquatico", 1.0], ["citrico", "chipre", 1.0],
  ["citrico", "floral", 0.7], ["citrico", "verde", 0.7], ["citrico", "aldeidico", 0.6],
  ["citrico", "especiado", 0.6], ["citrico", "almiscarado", 0.5], ["citrico", "ambar", 0.3],
  ["citrico", "gourmand", 0.0], ["citrico", "animalico", -0.2],
  // floral
  ["floral", "almiscarado", 1.0], ["floral", "verde", 0.8], ["floral", "amadeirado", 0.8],
  ["floral", "aldeidico", 0.8], ["floral", "chipre", 0.7], ["floral", "ambar", 0.6],
  ["floral", "aquatico", 0.6], ["floral", "especiado", 0.5], ["floral", "gourmand", 0.5],
  ["floral", "animalico", 0.5],
  // amadeirado
  ["amadeirado", "ambar", 1.0], ["amadeirado", "especiado", 0.8], ["amadeirado", "chipre", 0.8],
  ["amadeirado", "almiscarado", 0.8], ["amadeirado", "aquatico", 0.6], ["amadeirado", "gourmand", 0.6],
  ["amadeirado", "verde", 0.6], ["amadeirado", "animalico", 0.5], ["amadeirado", "aldeidico", 0.2],
  // âmbar
  ["ambar", "especiado", 1.0], ["ambar", "gourmand", 0.8], ["ambar", "almiscarado", 0.8],
  ["ambar", "animalico", 0.6], ["ambar", "chipre", 0.6], ["ambar", "aldeidico", 0.1],
  ["ambar", "verde", -0.2], ["ambar", "aquatico", -0.3],
  // especiado
  ["especiado", "gourmand", 0.6], ["especiado", "almiscarado", 0.5], ["especiado", "chipre", 0.5],
  ["especiado", "animalico", 0.4], ["especiado", "verde", 0.3], ["especiado", "aldeidico", 0.1],
  ["especiado", "aquatico", -0.3],
  // almiscarado
  ["almiscarado", "gourmand", 0.7], ["almiscarado", "aquatico", 0.6], ["almiscarado", "chipre", 0.5],
  ["almiscarado", "animalico", 0.5], ["almiscarado", "verde", 0.4], ["almiscarado", "aldeidico", 0.3],
  // aquático
  ["aquatico", "verde", 0.8], ["aquatico", "aldeidico", 0.5], ["aquatico", "chipre", 0.0],
  ["aquatico", "gourmand", -0.4], ["aquatico", "animalico", -0.5],
  // verde
  ["verde", "chipre", 0.6], ["verde", "aldeidico", 0.4], ["verde", "gourmand", -0.3], ["verde", "animalico", -0.3],
  // chipre
  ["chipre", "animalico", 0.5], ["chipre", "aldeidico", 0.5], ["chipre", "gourmand", 0.1],
  // gourmand
  ["gourmand", "aldeidico", 0.1], ["gourmand", "animalico", -0.1],
  // aldeídico
  ["aldeidico", "animalico", 0.3],
];

const AFFINITY_MAP = {};
FAMILY_PAIRS.forEach(([a, b, score]) => {
  AFFINITY_MAP[a] = AFFINITY_MAP[a] || {};
  AFFINITY_MAP[b] = AFFINITY_MAP[b] || {};
  AFFINITY_MAP[a][b] = score;
  AFFINITY_MAP[b][a] = score;
});

function familyAffinity(famA, famB) {
  if (!famA || !famB) return 0;
  if (famA === famB) return 0.6;
  if (AFFINITY_MAP[famA] && AFFINITY_MAP[famA][famB] != null) return AFFINITY_MAP[famA][famB];
  return 0; // par não catalogado — neutro por padrão, nunca inventa julgamento
}

// materials: [{ family, percentage, position }] — position pode ser null (desconhecida)
function computeCompatibility(materials) {
  const valid = materials.filter((m) => m.family && m.percentage > 0);
  if (valid.length < 2) return null;

  let weightedSum = 0;
  let weightTotal = 0;
  let bestPair = null;
  let worstPair = null;

  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const a = valid[i], b = valid[j];
      const score = familyAffinity(a.family, b.family);
      const weight = (a.percentage / 100) * (b.percentage / 100);
      weightedSum += score * weight;
      weightTotal += weight;
      if (a.family !== b.family) {
        if (!bestPair || score > bestPair.score) bestPair = { a: a.family, b: b.family, score };
        if (!worstPair || score < worstPair.score) worstPair = { a: a.family, b: b.family, score };
      }
    }
  }

  const finalScore = weightTotal > 0 ? weightedSum / weightTotal : 0;

  let label, colorVar;
  if (finalScore >= 0.6) { label = "Excelente combinação"; colorVar = "var(--ok)"; }
  else if (finalScore >= 0.3) { label = "Boa combinação"; colorVar = "var(--ok)"; }
  else if (finalScore >= -0.1) { label = "Combinação neutra — funciona com ajuste fino"; colorVar = "var(--gold)"; }
  else if (finalScore >= -0.4) { label = "Atenção — pode conflitar"; colorVar = "var(--danger)"; }
  else { label = "Risco de conflito — famílias muito opostas"; colorVar = "var(--danger)"; }

  // equilíbrio da pirâmide, só considerando materiais com posição conhecida
  const withPos = materials.filter((m) => m.position && m.percentage > 0);
  let positionNote = null;
  if (withPos.length > 0) {
    const sums = { topo: 0, coracao: 0, fundo: 0 };
    let total = 0;
    withPos.forEach((m) => { sums[m.position] += m.percentage; total += m.percentage; });
    const missing = POSITIONS.filter((p) => sums[p.key] === 0).map((p) => p.label);
    const dominant = POSITIONS.find((p) => total > 0 && sums[p.key] / total > 0.75);
    if (missing.length === POSITIONS.length - 1 && missing.length > 0) {
      // só uma nota está representada
      positionNote = `Praticamente só tem nota de ${POSITIONS.find((p) => !missing.includes(p.label)).label.toLowerCase()} — considera adicionar outras camadas.`;
    } else if (dominant) {
      positionNote = `Mais de 75% do acorde está em ${dominant.label.toLowerCase()} — pode evaporar/mudar rápido demais.` ;
    } else if (missing.length > 0) {
      positionNote = `Sem nenhum material de ${missing.join(" e ").toLowerCase()} classificado ainda.`;
    }
  }

  return { score: finalScore, label, colorVar, bestPair, worstPair, positionNote, materialsConsidered: valid.length };
}

function compatibilityPanelHtml(result) {
  if (!result) return `<div class="compat-box"><div class="log-empty">Adiciona pelo menos 2 materiais com família e % preenchidos pra ver o match.</div></div>`;
  const pct = Math.round(((result.score + 1) / 2) * 100); // normaliza -1..1 pra 0..100%
  const bestTxt = result.bestPair && result.bestPair.score > 0.3
    ? `<div class="compat-note" style="color:var(--ok);">✓ ${esc(famMap[result.bestPair.a]?.label || result.bestPair.a)} + ${esc(famMap[result.bestPair.b]?.label || result.bestPair.b)} têm boa afinidade</div>`
    : "";
  const worstTxt = result.worstPair && result.worstPair.score < -0.1
    ? `<div class="compat-note" style="color:var(--danger);">⚠ ${esc(famMap[result.worstPair.a]?.label || result.worstPair.a)} e ${esc(famMap[result.worstPair.b]?.label || result.worstPair.b)} tendem a competir</div>`
    : "";
  const posTxt = result.positionNote ? `<div class="compat-note" style="color:var(--ash-dim);">${esc(result.positionNote)}</div>` : "";
  return `
    <div class="compat-box">
      <div class="maturity-row">
        <div class="maturity-bar"><div class="maturity-fill" style="width:${pct}%;background:${result.colorVar}"></div></div>
        <span class="maturity-label" style="color:${result.colorVar}">${esc(result.label)}</span>
      </div>
      ${bestTxt}${worstTxt}${posTxt}
      <div class="compat-disclaimer">baseado em pareamentos clássicos de família olfativa — usa como referência, não como regra fixa</div>
    </div>`;
}

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
  pricePaid: row.price_paid != null ? Number(row.price_paid) : null,
  purchaseQuantity: row.purchase_quantity != null ? Number(row.purchase_quantity) : null,
  purchaseDate: row.purchase_date || null,
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
  price_paid: it.pricePaid != null ? it.pricePaid : null,
  purchase_quantity: it.purchaseQuantity != null ? it.purchaseQuantity : null,
  purchase_date: it.purchaseDate || null,
});

function unitCost(material) {
  if (!material || material.pricePaid == null || !material.purchaseQuantity || material.purchaseQuantity <= 0) return null;
  return material.pricePaid / material.purchaseQuantity;
}

function formulaCostInfo(formula) {
  let costPerCompoundUnit = 0;
  let missingCount = 0;
  formula.materials.forEach((m) => {
    const inv = m.inventoryId ? state.items.find((it) => it.id === m.inventoryId) : null;
    const uc = inv ? unitCost(inv) : null;
    if (uc == null) { missingCount += 1; return; }
    costPerCompoundUnit += (m.percentage / 100) * uc;
  });
  const costPerFinishedMl = costPerCompoundUnit * (formula.concentrationPct / 100);
  return { costPerFinishedMl, missingCount, totalMaterials: formula.materials.length };
}

function brl(n) {
  if (!Number.isFinite(n)) return "—";
  return "R$ " + n.toFixed(2).replace(".", ",");
}

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

const mapLoteFromDb = (row) => ({
  id: row.id,
  formulaId: row.formula_id || null,
  formulaName: row.formula_name,
  code: row.code,
  volumeMl: Number(row.volume_ml),
  type: row.type,
  maturationDays: Number(row.maturation_days),
  notes: row.notes || "",
  consumed: Array.isArray(row.consumed) ? row.consumed : [],
  log: Array.isArray(row.log) ? row.log : [],
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
});
const toLoteRow = (l) => ({
  formula_id: l.formulaId || null,
  formula_name: l.formulaName,
  code: l.code,
  volume_ml: l.volumeMl,
  type: l.type,
  maturation_days: l.maturationDays,
  notes: l.notes,
  consumed: l.consumed || [],
  log: l.log || [],
});

const mapMovementFromDb = (row) => ({
  id: row.id,
  materialId: row.material_id || null,
  materialName: row.material_name,
  type: row.type,
  quantity: Number(row.quantity),
  unit: row.unit || "",
  origin: row.origin || "",
  notes: row.notes || "",
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
});
const toMovementRow = (m) => ({
  material_id: m.materialId || null,
  material_name: m.materialName,
  type: m.type,
  quantity: m.quantity,
  unit: m.unit,
  origin: m.origin,
  notes: m.notes,
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
  lotes: [],
  movements: [],
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

  const { data: lts, error: e5 } = await sb.from("lotes").select("*").order("created_at", { ascending: true });
  if (e5) showToast("Não consegui carregar os lotes do banco.");
  else state.lotes = (lts || []).map(mapLoteFromDb);

  const { data: movs, error: e6 } = await sb.from("stock_movements").select("*").order("created_at", { ascending: false });
  if (e6) showToast("Não consegui carregar as movimentações do banco.");
  else state.movements = (movs || []).map(mapMovementFromDb);

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

async function addLote(record) {
  const { data, error } = await sb.from("lotes").insert(toLoteRow(record)).select().single();
  if (error || !data) { showToast("Não consegui salvar o lote no banco."); return null; }
  const mapped = mapLoteFromDb(data);
  state.lotes.push(mapped);
  return mapped;
}
async function updateLote(id, record) {
  const { error } = await sb.from("lotes").update(toLoteRow(record)).eq("id", id);
  if (error) { showToast("Não consegui atualizar o lote no banco."); return false; }
  const idx = state.lotes.findIndex((l) => l.id === id);
  if (idx >= 0) state.lotes[idx] = { ...record, id, createdAt: state.lotes[idx].createdAt };
  return true;
}
async function deleteLote(id) {
  const { error } = await sb.from("lotes").delete().eq("id", id);
  if (error) { showToast("Não consegui remover o lote do banco."); return false; }
  state.lotes = state.lotes.filter((l) => l.id !== id);
  return true;
}

async function addMovement(record) {
  const { data, error } = await sb.from("stock_movements").insert(toMovementRow(record)).select().single();
  if (error || !data) { showToast("Não consegui registrar a movimentação no banco."); return null; }
  const mapped = mapMovementFromDb(data);
  state.movements.unshift(mapped);
  return mapped;
}

/* ------------------------------ PRODUÇÃO DE LOTE ---------------------------- */
// Núcleo dos Módulos 1-5 do briefing: cálculo automático, validação de estoque,
// desconto automático e histórico de movimentação, tudo em uma transação lógica.

function generateLoteCode(formulaName) {
  const stopwords = new Set(["de", "da", "do", "das", "dos", "e", "a", "o"]);
  const initials = formulaName
    .split(/\s+/)
    .filter((w) => w && !stopwords.has(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join("");
  const prefix = initials || "LT";
  const existing = state.lotes.filter((l) => l.code.startsWith(prefix + "-"));
  const nextNum = existing.length + 1;
  return `${prefix}-${String(nextNum).padStart(3, "0")}`;
}

// Calcula quanto de cada material (ligado ao estoque) é necessário pra um volume de lote.
// Reaproveita a mesma matemática da calculadora de lote das Fórmulas.
function computeLoteRequirements(formula, volumeMl) {
  const compoundTotal = (volumeMl * formula.concentrationPct) / 100;
  const rows = formula.materials.map((m) => {
    const inv = m.inventoryId ? state.items.find((it) => it.id === m.inventoryId) : null;
    const needed = (compoundTotal * m.percentage) / 100;
    return {
      materialId: m.inventoryId || null,
      name: m.name,
      needed,
      unit: inv ? inv.unit : "g",
      available: inv ? inv.quantity : null,
      linked: !!inv,
      ok: inv ? inv.quantity >= needed : false,
    };
  });
  return { compoundTotal, rows };
}

// Executa a produção: valida, desconta estoque, registra movimentações e cria o lote.
// Retorna { ok: true, lote } ou { ok: false, rows } com o motivo da falha pra exibir.
async function produceLote({ formula, volumeMl, type, maturationDays, notes }) {
  const { rows } = computeLoteRequirements(formula, volumeMl);

  const unlinked = rows.filter((r) => !r.linked);
  if (unlinked.length > 0) {
    return { ok: false, reason: "unlinked", rows };
  }
  const insufficient = rows.filter((r) => !r.ok);
  if (insufficient.length > 0) {
    return { ok: false, reason: "insufficient", rows };
  }

  const code = generateLoteCode(formula.name);
  const consumed = [];

  // desconta estoque + registra movimentação de saída, material por material
  for (const r of rows) {
    const inv = state.items.find((it) => it.id === r.materialId);
    const newQty = inv.quantity - r.needed;
    const ok = await updateItem(inv.id, { ...inv, quantity: newQty });
    if (!ok) return { ok: false, reason: "update-failed", rows };
    await addMovement({
      materialId: inv.id,
      materialName: inv.name,
      type: "saida",
      quantity: r.needed,
      unit: r.unit,
      origin: `Lote ${code}`,
      notes: "",
    });
    consumed.push({ materialId: inv.id, name: inv.name, quantity: r.needed, unit: r.unit });
  }

  const lote = await addLote({
    formulaId: formula.id,
    formulaName: formula.name,
    code,
    volumeMl,
    type,
    maturationDays,
    notes,
    consumed,
    log: [],
  });
  if (!lote) return { ok: false, reason: "lote-failed", rows };
  return { ok: true, lote };
}

async function registerManualMovement({ materialId, type, quantity, origin, notes }) {
  const inv = state.items.find((it) => it.id === materialId);
  if (!inv) return { ok: false, reason: "not-found" };
  let newQty;
  if (type === "entrada") newQty = inv.quantity + quantity;
  else if (type === "saida") {
    if (inv.quantity < quantity) return { ok: false, reason: "insufficient", available: inv.quantity };
    newQty = inv.quantity - quantity;
  } else newQty = inv.quantity + quantity; // ajuste: quantity é o delta (pode ser negativo)

  const ok = await updateItem(inv.id, { ...inv, quantity: newQty });
  if (!ok) return { ok: false, reason: "update-failed" };
  await addMovement({ materialId: inv.id, materialName: inv.name, type, quantity, unit: inv.unit, origin: origin || "Manual", notes: notes || "" });
  return { ok: true };
}

/* --------------------------------- RENDER --------------------------------- */

const TABS = [
  { key: "estoque", label: "Estoque" },
  { key: "formulas", label: "Fórmulas" },
  { key: "acordes", label: "Acordes" },
  { key: "perfumes", label: "Perfumes" },
  { key: "lotes", label: "Lotes" },
];

function render() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="shell">
      <div class="topbar">
        <div class="mark">
          <svg class="mark-icon" width="30" height="30" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="#131317"/>
            <path d="M16 5 L26 16 L16 27 L6 16 Z" stroke="#C9A227" stroke-width="1.6"/>
            <circle cx="16" cy="16" r="3" fill="#C9A227"/>
          </svg>
          <div class="mark-text">
            <span class="mark-word">Obsidian</span>
            <span class="mark-sub">Laboratório</span>
          </div>
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
    el.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>Carregando laboratório...</span></div>`;
    return;
  }
  if (state.tab === "estoque") { el.innerHTML = estoqueShellHtml(); wireEstoqueShell(); }
  else if (state.tab === "formulas") { el.innerHTML = formulasShellHtml(); wireFormulasShell(); }
  else if (state.tab === "acordes") { el.innerHTML = acordesShellHtml(); wireAcordesShell(); }
  else if (state.tab === "perfumes") { el.innerHTML = perfumesShellHtml(); wirePerfumesShell(); }
  else if (state.tab === "lotes") { el.innerHTML = lotesShellHtml(); wireLotesShell(); }
}

/* ------------------------------ ESTOQUE TAB -------------------------------- */

function estoqueShellHtml() {
  return `
    <div class="spectrum" id="spectrum"></div>
    <div class="controls">
      <div class="controls-row">
        <div class="search-wrap">
          <span class="search-icon">${ICONS.search}</span>
          <input class="search" id="searchInput" placeholder="Buscar por nome ou CAS..." value="${esc(state.search)}" />
        </div>
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
        <div class="empty-icon">${ICONS.flask}</div><div class="empty-title">Estoque vazio</div>
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
        ${unitCost(it) != null ? `<div style="font-size:11px;color:var(--gold);font-family:'JetBrains Mono',monospace;">${brl(unitCost(it))}/${esc(it.unit)}</div>` : ""}
        <div class="card-meta">
          ${it.solvent ? `<span>Diluente: ${esc(it.solvent)}</span>` : ""}
          ${it.cas ? `<span style="font-family:'JetBrains Mono',monospace">CAS ${esc(it.cas)}</span>` : ""}
          ${it.supplier ? `<span>${esc(it.supplier)}</span>` : ""}
        </div>
        ${it.notes ? `<div class="card-notes">${esc(it.notes)}</div>` : ""}
        <div class="card-actions">
          <button class="btn-text" data-action="edit-material" data-id="${it.id}"><span class="btn-icon">${ICONS.edit}</span>editar</button>
          <button class="btn-text danger" data-action="delete-material" data-id="${it.id}"><span class="btn-icon">${ICONS.trash}</span>remover</button>
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
        <div class="modal-header"><div class="modal-title">${editing ? "Editar material" : "Novo material"}</div><button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${ICONS.close}</button></div>

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

        <label class="label" style="margin-top:16px;">Custo (opcional)</label>
        <div class="row2">
          <div>
            <label class="label" style="margin-top:0;">Preço pago (R$)</label>
            <input class="input" id="f-pricePaid" type="number" step="0.01" value="${editing && editing.pricePaid != null ? editing.pricePaid : ""}" placeholder="Ex: 120,00" />
          </div>
          <div>
            <label class="label" style="margin-top:0;">Quantidade comprada</label>
            <input class="input" id="f-purchaseQty" type="number" step="0.01" value="${editing && editing.purchaseQuantity != null ? editing.purchaseQuantity : ""}" placeholder="Ex: 250" />
          </div>
        </div>
        <label class="label">Data da compra</label>
        <input class="input" id="f-purchaseDate" type="date" value="${editing && editing.purchaseDate ? editing.purchaseDate : ""}" />
        <div id="unitCostPreview" style="font-size:12px;color:var(--gold);margin-top:6px;"></div>

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
  root.querySelectorAll('[data-action="close-modal"]').forEach((el) => el.addEventListener("click", closeModal));

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

  const updateCostPreview = () => {
    const price = parseFloat(document.getElementById("f-pricePaid").value);
    const qty = parseFloat(document.getElementById("f-purchaseQty").value);
    const preview = document.getElementById("unitCostPreview");
    if (Number.isFinite(price) && Number.isFinite(qty) && qty > 0) {
      const unit = document.getElementById("f-unit").value;
      preview.textContent = `Custo unitário calculado: ${brl(price / qty)}/${unit}`;
    } else {
      preview.textContent = "";
    }
  };
  document.getElementById("f-pricePaid").addEventListener("input", updateCostPreview);
  document.getElementById("f-purchaseQty").addEventListener("input", updateCostPreview);
  document.getElementById("f-unit").addEventListener("change", updateCostPreview);
  updateCostPreview();

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
      pricePaid: document.getElementById("f-pricePaid").value === "" ? null : parseFloat(document.getElementById("f-pricePaid").value),
      purchaseQuantity: document.getElementById("f-purchaseQty").value === "" ? null : parseFloat(document.getElementById("f-purchaseQty").value),
      purchaseDate: document.getElementById("f-purchaseDate").value || null,
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
  } else if (action === "produce-lote") {
    const formula = state.formulas.find((f) => f.id === btn.dataset.id);
    if (formula) openLoteModal(formula);
  }
}

function renderFormulasGrid() {
  const el = document.getElementById("formulasGrid");
  if (!el) return;
  const sorted = [...state.formulas].sort((a, b) => a.createdAt - b.createdAt);
  if (sorted.length === 0) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${ICONS.flask}</div><div class="empty-title">Nenhuma criação registrada</div>
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
      ${costTableHtml(formula)}
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
          <button class="btn-text" data-action="edit-formula" data-id="${formula.id}"><span class="btn-icon">${ICONS.edit}</span>editar</button>
          <button class="btn-text danger" data-action="delete-formula" data-id="${formula.id}"><span class="btn-icon">${ICONS.trash}</span>remover</button>
        </div>
        <button class="btn-ghost small" data-action="produce-lote" data-id="${formula.id}">Produzir lote</button>
      </div>
    </div>`;
}

function costTableHtml(formula) {
  const info = formulaCostInfo(formula);
  const volumes = [4, 10, 30, 50, 100];
  const rows = volumes.map((v) => `<div class="calc-result-row"><span style="color:var(--ash)">${v}ml</span><span>${brl(info.costPerFinishedMl * v)}</span></div>`).join("");
  return `
    <div class="cost-box">
      <div class="label" style="margin-top:0;display:flex;justify-content:space-between;">
        <span>Custo estimado</span>
        ${info.missingCount > 0 ? `<span style="color:var(--ash-dim);font-weight:400;">parcial · ${info.missingCount} sem preço</span>` : ""}
      </div>
      ${rows}
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
        <div class="modal-header"><div class="modal-title">${editing ? "Editar fórmula" : "Nova fórmula"}</div><button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${ICONS.close}</button></div>

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
        <div id="formulaCompatBox" style="margin-top:12px;"></div>

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
  root.querySelectorAll('[data-action="close-modal"]').forEach((el) => el.addEventListener("click", closeModal));

  document.getElementById("ff-concType").addEventListener("change", (e) => {
    const preset = CONC_PRESETS.find((p) => p.label === e.target.value);
    if (preset && preset.pct != null) document.getElementById("ff-concPct").value = preset.pct;
  });

  renderFormulaRows();
  document.getElementById("addRowBtn").addEventListener("click", () => {
    syncFormulaRowsFromDom();
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

function syncFormulaRowsFromDom() {
  formulaRows.forEach((row) => {
    const invSelect = document.getElementById("row-inv-" + row.rowId);
    const nameInput = document.getElementById("row-name-" + row.rowId);
    const famSelect = document.getElementById("row-fam-" + row.rowId);
    const posSelect = document.getElementById("row-pos-" + row.rowId);
    const pctInput = document.getElementById("row-pct-" + row.rowId);
    if (invSelect) row.inventoryId = invSelect.value;
    if (nameInput) row.name = nameInput.value;
    if (famSelect) row.family = famSelect.value;
    if (posSelect) row.position = posSelect.value;
    if (pctInput) row.percentage = pctInput.value;
  });
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
      updateFormulaCompatibility();
    });
    const removeBtn = container.querySelector(`[data-remove="${row.rowId}"]`);
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        syncFormulaRowsFromDom();
        formulaRows = formulaRows.filter((r) => r.rowId !== row.rowId);
        renderFormulaRows();
      });
    }
    const nameInput = document.getElementById("row-name-" + row.rowId);
    if (nameInput) {
      nameInput.addEventListener("input", (e) => {
        const guess = guessFamily(e.target.value);
        if (guess) document.getElementById("row-fam-" + row.rowId).value = guess;
        updateFormulaCompatibility();
      });
    }
    const famSelect = document.getElementById("row-fam-" + row.rowId);
    if (famSelect) famSelect.addEventListener("change", updateFormulaCompatibility);
    const posSelect = document.getElementById("row-pos-" + row.rowId);
    if (posSelect) posSelect.addEventListener("change", updateFormulaCompatibility);
    const pctInput = document.getElementById("row-pct-" + row.rowId);
    if (pctInput) pctInput.addEventListener("input", updateFormulaCompatibility);
  });

  updateFormulaCompatibility();
}

function updateFormulaCompatibility() {
  const box = document.getElementById("formulaCompatBox");
  if (!box) return;
  const materials = formulaRows.map((row) => {
    const invSelect = document.getElementById("row-inv-" + row.rowId);
    const pctInput = document.getElementById("row-pct-" + row.rowId);
    const posSelect = document.getElementById("row-pos-" + row.rowId);
    let family;
    if (invSelect && invSelect.value) {
      const inv = state.items.find((it) => it.id === invSelect.value);
      family = inv ? inv.family : null;
    } else {
      const famSelect = document.getElementById("row-fam-" + row.rowId);
      family = famSelect ? famSelect.value : null;
    }
    return { family, position: posSelect ? posSelect.value : null, percentage: parseFloat(pctInput ? pctInput.value : 0) || 0 };
  });
  box.innerHTML = compatibilityPanelHtml(computeCompatibility(materials));
}

/* -------------------------------- LOTES TAB --------------------------------- */

function lotesShellHtml() {
  return `
    <div class="form-header">
      <span class="form-count">${state.lotes.length} lote${state.lotes.length === 1 ? "" : "s"} produzido${state.lotes.length === 1 ? "" : "s"}</span>
    </div>
    <div id="lotesGrid"></div>
    <section class="fam-section">
      <button class="fam-header" data-action="toggle-movements">
        <span class="fam-title">Movimentações de estoque</span>
        <span style="color:var(--ash);font-size:12px;">${state.collapsed.movements ? "mostrar" : "ocultar"}</span>
      </button>
      <div id="movementsSection"></div>
    </section>
  `;
}

function wireLotesShell() {
  document.getElementById("tabContent").addEventListener("click", delegatedLotesClicks);
  document.getElementById("tabContent").addEventListener("submit", (e) => e.preventDefault());
  renderLotesGrid();
  renderMovementsSection();
}

function delegatedLotesClicks(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "delete-lote") handleDeleteLote(btn.dataset.id);
  else if (action === "add-lote-log") handleAddLog("lote", btn.dataset.id);
  else if (action === "toggle-movements") {
    state.collapsed.movements = !state.collapsed.movements;
    renderTabContent();
  } else if (action === "new-movement") openMovementModal();
}

function renderLotesGrid() {
  const el = document.getElementById("lotesGrid");
  if (!el) return;
  const sorted = [...state.lotes].sort((a, b) => b.createdAt - a.createdAt);
  if (sorted.length === 0) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${ICONS.flask}</div><div class="empty-title">Nenhum lote produzido ainda</div>
        <div class="empty-sub">Vai na aba Fórmulas e clica em "Produzir lote" numa criação — o sistema calcula os ingredientes, valida o estoque e desconta automaticamente.</div>
      </div>`;
    return;
  }
  el.innerHTML = `<div class="forms-grid">${sorted.map((l) => loteCardHtml(l)).join("")}</div>`;
}

function loteCardHtml(l) {
  const info = maturityInfo(l.createdAt, l.maturationDays);
  const consumedHtml = l.consumed.map((c) => `<div class="mat-row"><span class="mat-name">${esc(c.name)}</span><span class="mat-pct">${fmt(c.quantity)}${esc(c.unit)}</span></div>`).join("");
  return `
    <div class="fcard">
      <div class="fcard-eyebrow">
        <span class="fcard-num">${esc(l.code)}</span>
        <span class="fcard-type">${l.type === "producao" ? "Produção" : "Teste"} · ${fmt(l.volumeMl)}ml</span>
      </div>
      <div class="fcard-name">${esc(l.formulaName)}</div>
      <div style="font-size:11px;color:var(--ash-dim);">criado em ${esc(formatDateBR(new Date(l.createdAt).toISOString()))} · ${l.maturationDays}d de maceração</div>
      ${maturityBarHtml(info)}
      <div class="label" style="margin-top:0;">Materiais consumidos</div>
      <div class="mat-list">${consumedHtml}</div>
      ${l.notes ? `<div class="card-notes">${esc(l.notes)}</div>` : ""}
      <div class="log-section">
        <div class="label" style="margin-top:0;">Evolução do lote</div>
        ${logListHtml(l.log)}
        <form class="log-form">
          <input type="text" class="input" placeholder="Como tá hoje?" id="logNote-lote-${l.id}" />
          <button type="button" class="btn-ghost small" data-action="add-lote-log" data-id="${l.id}">+ registrar</button>
        </form>
      </div>
      <div class="fcard-actions">
        <div class="fcard-actions-left">
          <button class="btn-text danger" data-action="delete-lote" data-id="${l.id}"><span class="btn-icon">${ICONS.trash}</span>remover</button>
        </div>
      </div>
    </div>`;
}

async function handleDeleteLote(id) {
  if (!confirm("Remover esse lote? Isso NÃO devolve o estoque consumido automaticamente.")) return;
  await deleteLote(id);
  renderLotesGrid();
}

function renderMovementsSection() {
  const el = document.getElementById("movementsSection");
  if (!el) return;
  if (state.collapsed.movements) { el.innerHTML = ""; return; }
  const rows = state.movements
    .slice(0, 100)
    .map((m) => {
      const typeLabel = { entrada: "Entrada", saida: "Saída", ajuste: "Ajuste" }[m.type] || m.type;
      const sign = m.type === "saida" ? "-" : m.type === "entrada" ? "+" : m.quantity >= 0 ? "+" : "";
      return `
        <div class="mov-row">
          <span class="mov-date">${esc(formatDateBR(new Date(m.createdAt).toISOString()))}</span>
          <span class="mov-material">${esc(m.materialName)}</span>
          <span class="mov-type mov-type-${m.type}">${esc(typeLabel)}</span>
          <span class="mov-qty">${sign}${fmt(Math.abs(m.quantity))}${esc(m.unit)}</span>
          <span class="mov-origin">${esc(m.origin)}</span>
        </div>`;
    })
    .join("");
  el.innerHTML = `
    <div style="margin-top:14px;">
      <button class="btn-ghost small" data-action="new-movement">+ Registrar movimentação manual</button>
      <div class="mov-list">
        ${rows || '<div class="log-empty">Nenhuma movimentação registrada ainda.</div>'}
      </div>
    </div>`;
}

/* ----------------------------- MODAL: PRODUZIR LOTE ------------------------- */

function openLoteModal(formula) {
  const root = document.getElementById("modalRoot");
  root.innerHTML = `
    <div class="overlay" id="overlay">
      <form class="modal" id="loteForm">
        <div class="modal-header"><div class="modal-title">Produzir lote de ${esc(formula.name)}</div><button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${ICONS.close}</button></div>

        <label class="label">Quantidade desejada (ml)</label>
        <input class="input" id="lt-volume" type="number" step="0.1" value="100" />

        <label class="label">Tipo</label>
        <div class="row2">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;"><input type="radio" name="lt-type" value="teste" checked /> Teste</label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;"><input type="radio" name="lt-type" value="producao" /> Produção</label>
        </div>

        <label class="label">Maceração</label>
        <select class="input" id="lt-maturation">
          <option value="15">15 dias</option>
          <option value="30">30 dias</option>
          <option value="45">45 dias</option>
          <option value="60">60 dias</option>
          <option value="custom">Outro prazo</option>
        </select>
        <div id="lt-customWrap" style="display:none;margin-top:8px;">
          <input class="input" id="lt-customDays" type="number" step="1" placeholder="Dias" />
        </div>

        <label class="label">Observações</label>
        <textarea class="input" id="lt-notes" style="min-height:50px;resize:vertical;"></textarea>

        <div id="ltPreview" style="margin-top:14px;"></div>
        <div class="form-error" id="loteFormError" style="display:none;"></div>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" data-action="close-modal">Cancelar</button>
          <button type="submit" class="btn-primary" id="loteConfirmBtn">Confirmar produção</button>
        </div>
      </form>
    </div>`;

  document.getElementById("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeModal(); });
  document.getElementById("loteForm").addEventListener("click", (e) => e.stopPropagation());
  root.querySelectorAll('[data-action="close-modal"]').forEach((el) => el.addEventListener("click", closeModal));

  document.getElementById("lt-maturation").addEventListener("change", (e) => {
    document.getElementById("lt-customWrap").style.display = e.target.value === "custom" ? "" : "none";
    updateLotePreview();
  });
  document.getElementById("lt-volume").addEventListener("input", updateLotePreview);

  function currentMaturationDays() {
    const sel = document.getElementById("lt-maturation").value;
    if (sel === "custom") return parseFloat(document.getElementById("lt-customDays").value) || 15;
    return parseFloat(sel);
  }

  function updateLotePreview() {
    const volume = parseFloat(document.getElementById("lt-volume").value) || 0;
    const { rows } = computeLoteRequirements(formula, volume);
    const unlinked = rows.filter((r) => !r.linked);
    const insufficient = rows.filter((r) => r.linked && !r.ok);
    const allOk = unlinked.length === 0 && insufficient.length === 0;

    const rowsHtml = rows
      .map((r) => {
        const status = !r.linked ? "não vinculado ao estoque" : r.ok ? "ok" : "insuficiente";
        const statusColor = !r.linked ? "var(--danger)" : r.ok ? "var(--ok)" : "var(--danger)";
        return `
          <div class="calc-result-row">
            <span style="color:var(--ash)">${esc(r.name)}</span>
            <span>necessário ${fmt(r.needed)}${esc(r.unit)} · disponível ${r.linked ? fmt(r.available) + esc(r.unit) : "—"}</span>
          </div>
          <div style="font-size:10.5px;color:${statusColor};margin-top:-4px;margin-bottom:2px;">${status}</div>`;
      })
      .join("");

    document.getElementById("ltPreview").innerHTML = `
      <div class="calc-box">
        <div class="label" style="margin-top:0;">Ingredientes necessários</div>
        ${rowsHtml}
      </div>
      ${!allOk ? `<div class="form-error" style="margin-top:10px;">${unlinked.length > 0 ? "Estoque insuficiente: há material(is) da fórmula sem vínculo com o estoque — edita a fórmula e liga ao estoque antes de produzir. " : ""}${insufficient.length > 0 ? "Estoque insuficiente para um ou mais materiais — não é possível produzir parcialmente." : ""}</div>` : ""}
    `;
    document.getElementById("loteConfirmBtn").disabled = !allOk;
    document.getElementById("loteConfirmBtn").style.opacity = allOk ? "1" : "0.5";
  }
  updateLotePreview();

  document.getElementById("loteForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const volume = parseFloat(document.getElementById("lt-volume").value) || 0;
    const type = document.querySelector('input[name="lt-type"]:checked').value;
    const errEl = document.getElementById("loteFormError");
    if (volume <= 0) { errEl.textContent = "Informa uma quantidade válida."; errEl.style.display = "block"; return; }
    errEl.style.display = "none";

    const result = await produceLote({
      formula,
      volumeMl: volume,
      type,
      maturationDays: currentMaturationDays(),
      notes: document.getElementById("lt-notes").value.trim(),
    });

    if (!result.ok) {
      updateLotePreview();
      errEl.textContent = "Não foi possível produzir — confere o estoque acima.";
      errEl.style.display = "block";
      return;
    }
    closeModal();
    showToast(`Lote ${result.lote.code} produzido e estoque atualizado.`, true);
    if (state.tab === "lotes") renderLotesGrid();
    if (state.tab === "estoque") updateMaterialsList();
  });
}

/* ----------------------------- MODAL: MOVIMENTAÇÃO -------------------------- */

function openMovementModal() {
  const root = document.getElementById("modalRoot");
  root.innerHTML = `
    <div class="overlay" id="overlay">
      <form class="modal" id="movementForm">
        <div class="modal-header"><div class="modal-title">Registrar movimentação</div><button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${ICONS.close}</button></div>

        <label class="label">Material</label>
        <select class="input" id="mv-material">
          ${state.items.map((it) => `<option value="${it.id}">${esc(it.name)} — ${fmt(it.quantity)}${esc(it.unit)} em estoque</option>`).join("")}
        </select>

        <label class="label">Tipo</label>
        <select class="input" id="mv-type">
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
          <option value="ajuste">Ajuste (correção)</option>
        </select>

        <label class="label" id="mv-qtyLabel">Quantidade</label>
        <input class="input" id="mv-quantity" type="number" step="0.01" />
        <div style="font-size:10.5px;color:var(--ash-dim);margin-top:4px;" id="mv-qtyHint"></div>

        <label class="label">Origem</label>
        <input class="input" id="mv-origin" placeholder="Ex: Compra, correção de contagem" />

        <label class="label">Observação</label>
        <input class="input" id="mv-notes" />

        <div class="form-error" id="movementFormError" style="display:none;"></div>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" data-action="close-modal">Cancelar</button>
          <button type="submit" class="btn-primary">Registrar</button>
        </div>
      </form>
    </div>`;

  document.getElementById("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeModal(); });
  document.getElementById("movementForm").addEventListener("click", (e) => e.stopPropagation());
  root.querySelectorAll('[data-action="close-modal"]').forEach((el) => el.addEventListener("click", closeModal));

  document.getElementById("mv-type").addEventListener("change", (e) => {
    document.getElementById("mv-qtyHint").textContent =
      e.target.value === "ajuste" ? "Pode ser negativo (ex: -5 pra corrigir uma contagem menor)." : "";
  });

  document.getElementById("movementForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const materialId = document.getElementById("mv-material").value;
    const type = document.getElementById("mv-type").value;
    const quantity = parseFloat(document.getElementById("mv-quantity").value);
    const errEl = document.getElementById("movementFormError");
    if (!materialId) { errEl.textContent = "Escolhe um material."; errEl.style.display = "block"; return; }
    if (!Number.isFinite(quantity) || (type !== "ajuste" && quantity <= 0)) {
      errEl.textContent = "Informa uma quantidade válida.";
      errEl.style.display = "block";
      return;
    }
    const result = await registerManualMovement({
      materialId,
      type,
      quantity,
      origin: document.getElementById("mv-origin").value.trim(),
      notes: document.getElementById("mv-notes").value.trim(),
    });
    if (!result.ok) {
      errEl.textContent = result.reason === "insufficient" ? `Estoque insuficiente (disponível: ${fmt(result.available)}).` : "Não consegui registrar a movimentação.";
      errEl.style.display = "block";
      return;
    }
    closeModal();
    showToast("Movimentação registrada.", true);
    renderMovementsSection();
    if (state.tab === "estoque") updateMaterialsList();
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
        <div class="empty-icon">${ICONS.flask}</div><div class="empty-title">Nenhum acorde em teste</div>
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
          <button class="btn-text" data-action="edit-accord" data-id="${a.id}"><span class="btn-icon">${ICONS.edit}</span>editar</button>
          <button class="btn-text danger" data-action="delete-accord" data-id="${a.id}"><span class="btn-icon">${ICONS.trash}</span>remover</button>
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
  } else if (type === "perfume") {
    const item = state.perfumes.find((p) => p.id === id);
    if (!item) return;
    const record = { ...item, log: [...item.log, entry] };
    await updatePerfume(id, record);
    renderPerfumesGrid();
  } else if (type === "lote") {
    const item = state.lotes.find((l) => l.id === id);
    if (!item) return;
    const record = { ...item, log: [...item.log, entry] };
    await updateLote(id, record);
    renderLotesGrid();
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
        <div class="modal-header"><div class="modal-title">${editing ? "Editar acorde" : "Novo acorde"}</div><button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${ICONS.close}</button></div>

        <label class="label">Nome do acorde</label>
        <input class="input" id="ac-name" value="${editing ? esc(editing.name) : ""}" placeholder="Ex: Acorde âmbar modificado" />

        <label class="label">Prazo estimado de maceração (dias)</label>
        <input class="input" id="ac-maturation" type="number" step="1" value="${editing ? editing.maturationDays : "18"}" />
        <div style="font-size:11px;color:var(--ash-dim);margin-top:4px;">Referência: leve/cítrico ~7-10d · equilibrado ~15-20d · pesado/resinoso ~25-35d</div>

        <label class="label" style="margin-top:16px;">Materiais do acorde (%)</label>
        <div id="accordRowsContainer"></div>
        <button type="button" class="add-row-btn" id="addAccordRowBtn">+ adicionar material</button>
        <div id="accordCompatBox" style="margin-top:12px;"></div>

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
  root.querySelectorAll('[data-action="close-modal"]').forEach((el) => el.addEventListener("click", closeModal));

  renderAccordRows();
  document.getElementById("addAccordRowBtn").addEventListener("click", () => {
    syncAccordRowsFromDom();
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

function syncAccordRowsFromDom() {
  accordRows.forEach((row) => {
    const invSelect = document.getElementById("acrow-inv-" + row.rowId);
    const nameInput = document.getElementById("acrow-name-" + row.rowId);
    const pctInput = document.getElementById("acrow-pct-" + row.rowId);
    if (invSelect) row.inventoryId = invSelect.value;
    if (nameInput) row.name = nameInput.value;
    if (pctInput) row.percentage = pctInput.value;
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
      updateAccordCompatibility();
    });
    const removeBtn = container.querySelector(`[data-remove="${row.rowId}"]`);
    if (removeBtn) removeBtn.addEventListener("click", () => { syncAccordRowsFromDom(); accordRows = accordRows.filter((r) => r.rowId !== row.rowId); renderAccordRows(); });
    const nameInput = document.getElementById("acrow-name-" + row.rowId);
    if (nameInput) nameInput.addEventListener("input", updateAccordCompatibility);
    const pctInput = document.getElementById("acrow-pct-" + row.rowId);
    if (pctInput) pctInput.addEventListener("input", updateAccordCompatibility);
  });

  updateAccordCompatibility();
}

function accordRowFamilyAndPosition(row) {
  if (row.inventoryId) {
    const inv = state.items.find((it) => it.id === row.inventoryId);
    return { family: inv ? inv.family : null, position: inv ? inv.typicalPosition : null };
  }
  const nameInput = document.getElementById("acrow-name-" + row.rowId);
  const name = nameInput ? nameInput.value : row.name;
  return { family: guessFamily(name), position: null };
}

function updateAccordCompatibility() {
  const box = document.getElementById("accordCompatBox");
  if (!box) return;
  const materials = accordRows.map((row) => {
    const pctInput = document.getElementById("acrow-pct-" + row.rowId);
    const { family, position } = accordRowFamilyAndPosition(row);
    return { family, position, percentage: parseFloat(pctInput ? pctInput.value : 0) || 0 };
  });
  box.innerHTML = compatibilityPanelHtml(computeCompatibility(materials));
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
        <div class="empty-icon">${ICONS.flask}</div><div class="empty-title">Nenhuma criação em acompanhamento</div>
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
          <button class="btn-text" data-action="edit-perfume" data-id="${p.id}"><span class="btn-icon">${ICONS.edit}</span>editar</button>
          <button class="btn-text danger" data-action="delete-perfume" data-id="${p.id}"><span class="btn-icon">${ICONS.trash}</span>remover</button>
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
        <div class="modal-header"><div class="modal-title">${editing ? "Editar criação" : "Nova criação"}</div><button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${ICONS.close}</button></div>

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
  root.querySelectorAll('[data-action="close-modal"]').forEach((el) => el.addEventListener("click", closeModal));

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
    lotes: state.lotes,
    movements: state.movements,
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
      parsed.lotes = Array.isArray(parsed.lotes) ? parsed.lotes : [];
      parsed.movements = Array.isArray(parsed.movements) ? parsed.movements : [];
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
        <div class="modal-header"><div class="modal-title">Importar backup</div><button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${ICONS.close}</button></div>
        <p style="font-size:13px;color:var(--ash);line-height:1.6;">
          O arquivo tem ${parsed.items.length} material(is), ${parsed.formulas.length} fórmula(s), ${parsed.accords.length} acorde(s), ${parsed.perfumes.length} criação(ões), ${parsed.lotes.length} lote(s) e ${parsed.movements.length} movimentação(ões). Como tu quer aplicar?
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
  root.querySelectorAll('[data-action="close-modal"]').forEach((el) => el.addEventListener("click", closeModal));
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
      await sb.from("lotes").delete().gte("created_at", "1900-01-01");
      await sb.from("stock_movements").delete().gte("created_at", "1900-01-01");
      const matRows = parsed.items.map(toMaterialRow);
      const formRows = parsed.formulas.map(toFormulaRow);
      const accRows = parsed.accords.map(toAccordRow);
      const perfRows = parsed.perfumes.map(toPerfumeRow);
      const loteRows = parsed.lotes.map(toLoteRow);
      const movRows = parsed.movements.map(toMovementRow);
      if (matRows.length) await sb.from("materials").insert(matRows);
      if (formRows.length) await sb.from("formulas").insert(formRows);
      if (accRows.length) await sb.from("accords").insert(accRows);
      if (perfRows.length) await sb.from("perfumes").insert(perfRows);
      if (loteRows.length) await sb.from("lotes").insert(loteRows);
      if (movRows.length) await sb.from("stock_movements").insert(movRows);
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

      const existingLoteCodes = new Set(state.lotes.map((l) => l.code));
      const newLotes = parsed.lotes.filter((l) => !existingLoteCodes.has(l.code)).map(toLoteRow);
      if (newLotes.length) await sb.from("lotes").insert(newLotes);
      // Movimentações não são mescladas automaticamente (histórico transacional) —
      // só entram junto se for "Substituir tudo", pra não duplicar registros.
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
