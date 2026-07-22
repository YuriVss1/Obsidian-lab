/* ==========================================================================
   OBSIDIAN — Laboratório (Módulos de Produção, Lotes e Custos Financeiros)
   ========================================================================== */

import { CostService } from './costService.js';
import { produceBatch } from './batchesService.js';

/* ------------------------------- CONFIG ---------------------------------- */

const CFG = window.OBSIDIAN_CONFIG || {};
if (!CFG.SUPABASE_URL || CFG.SUPABASE_URL.includes("COLE_AQUI") || !CFG.SUPABASE_ANON_KEY || CFG.SUPABASE_ANON_KEY.includes("COLE_AQUI")) {
  document.getElementById("app").innerHTML =
    '<div style="padding:60px 24px;font-family:sans-serif;color:#F2F1ED;background:#0B0B0D;min-height:100vh;">' +
    '<h2>Falta configurar o config.js</h2>' +
    '</div>';
  throw new Error("OBSIDIAN_CONFIG não preenchido");
}

export const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);

/* -------------------------------- DADOS & ESTADO -------------------------- */

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

const POSITIONS = [
  { key: "topo", label: "Topo", color: "#E8C468" },
  { key: "coracao", label: "Coração", color: "#C9A227" },
  { key: "fundo", label: "Fundo", color: "#8A5A22" },
];
const posMap = Object.fromEntries(POSITIONS.map((p) => [p.key, p]));

const TABS = [
  { key: "estoque", label: "Estoque" },
  { key: "formulas", label: "Fórmulas" },
  { key: "acordes", label: "Acordes" },
  { key: "perfumes", label: "Perfumes" },
  { key: "lotes", label: "Lotes" },
  { key: "financeiro", label: "Financeiro" }
];

const state = {
  tab: "estoque",
  items: [],
  formulas: [],
  accords: [],
  perfumes: [],
  batches: [],
  movements: [],
  packaging: [],
  loaded: false,
  search: "",
  familyFilter: "all",
  categoryFilter: "all",
  positionFilter: "all",
  collapsed: {},
};

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => (Number.isFinite(n) ? (Math.round(n * 100) / 100).toString() : "0");

/* ------------------------------- BANCO ------------------------------------ */

async function reload() {
  const { data: mats } = await sb.from("materials").select("*").order("name", { ascending: true });
  state.items = mats || [];

  const { data: forms } = await sb.from("formulas").select("*").order("created_at", { ascending: true });
  state.formulas = forms || [];

  const { data: accs } = await sb.from("accords").select("*").order("created_at", { ascending: true });
  state.accords = accs || [];

  const { data: perfs } = await sb.from("perfumes").select("*").order("created_at", { ascending: true });
  state.perfumes = perfs || [];

  const { data: bts } = await sb.from("batches").select("*").order("created_at", { ascending: false });
  state.batches = bts || [];

  const { data: pkg } = await sb.from("packaging").select("*").order("name", { ascending: true });
  state.packaging = pkg || [];

  state.loaded = true;
}

/* --------------------------------- RENDER --------------------------------- */

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
  else if (state.tab === "acordes") { el.innerHTML = acordesShellHtml(); }
  else if (state.tab === "perfumes") { el.innerHTML = perfumesShellHtml(); }
  else if (state.tab === "lotes") { el.innerHTML = lotesShellHtml(); }
  else if (state.tab === "financeiro") { el.innerHTML = financeiroShellHtml(); }
}

/* ------------------------------ SHELLS DAS ABAS --------------------------- */

function estoqueShellHtml() {
  return `<div class="empty"><div class="empty-title">Estoque de Materiais</div><div class="empty-sub">${state.items.length} materiais cadastrados no sistema.</div></div>`;
}

function formulasShellHtml() {
  if (state.formulas.length === 0) {
    return `<div class="empty"><div class="empty-title">Nenhuma fórmula encontrada</div></div>`;
  }
  return `<div class="forms-grid">${state.formulas.map((f, i) => formulaCardHtml(f, i + 1)).join("")}</div>`;
}

function formulaCardHtml(formula, number) {
  const maxProdMl = CostsService.calcMaxProduction(formula, state.items);
  const cost100ml = CostsService.calcFormulaCostForVolume(formula, state.items, 100);

  return `
    <div class="fcard" data-formula-id="${formula.id}">
      <div class="fcard-eyebrow">
        <span class="fcard-num">Fórmula N° ${String(number).padStart(3, "0")}</span>
        <span class="max-production-badge">Max: ${maxProdMl} ml</span>
      </div>
      <div class="fcard-name">${esc(formula.name)}</div>
      <div class="fcard-concept">${esc(formula.concept || "")}</div>
      <div style="font-size:12px;color:var(--gold);margin-top:6px;font-family:'JetBrains Mono',monospace;">
        Custo p/ 100ml: R$ ${cost100ml.toFixed(2)}
      </div>
      <div class="fcard-actions" style="margin-top:14px;display:flex;gap:10px;">
        <button class="btn-primary" data-action="produce-batch" data-id="${formula.id}">+ Produzir Lote</button>
      </div>
    </div>`;
}

function acordesShellHtml() {
  return `<div class="empty"><div class="empty-title">Acordes em Teste</div></div>`;
}

function perfumesShellHtml() {
  return `<div class="empty"><div class="empty-title">Perfumes e Propostas</div></div>`;
}

function lotesShellHtml() {
  if (state.batches.length === 0) {
    return `<div class="empty"><div class="empty-title">Nenhum lote produzido ainda</div><div class="empty-sub">Vá para a aba Fórmulas e clique em "+ Produzir Lote".</div></div>`;
  }
  return `<div class="forms-grid">${state.batches.map((b) => `
    <div class="fcard">
      <div class="fcard-eyebrow">
        <span class="fcard-num">${esc(b.batch_number)}</span>
        <span class="fcard-type">${esc(b.type)}</span>
      </div>
      <div class="fcard-name">${esc(b.formula_name)}</div>
      <div style="font-size:13px;color:var(--ash);margin-top:4px;">Volume: ${b.size_ml} ml</div>
      <div style="font-size:12px;color:var(--gold);margin-top:4px;font-family:'JetBrains Mono',monospace;">
        Custo Total: R$ ${Number(b.total_cost || 0).toFixed(2)}
      </div>
    </div>
  `).join("")}</div>`;
}

function financeiroShellHtml() {
  const totalStockValue = state.items.reduce((acc, item) => {
    return acc + (CostsService.getUnitCost(item) * Number(item.quantity || 0));
  }, 0);

  return `
    <div class="empty" style="text-align:left;">
      <div class="empty-title">Dashboard Financeiro</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px,1fr));gap:14px;margin-top:20px;">
        <div style="background:var(--onyx);border:1px solid var(--hair);padding:16px;border-radius:10px;">
          <div style="font-size:11px;color:var(--ash);text-transform:uppercase;">Valor Total do Estoque</div>
          <div style="font-size:22px;font-weight:700;color:var(--gold);margin-top:6px;font-family:'JetBrains Mono',monospace;">R$ ${totalStockValue.toFixed(2)}</div>
        </div>
        <div style="background:var(--onyx);border:1px solid var(--hair);padding:16px;border-radius:10px;">
          <div style="font-size:11px;color:var(--ash);text-transform:uppercase;">Total de Insumos</div>
          <div style="font-size:22px;font-weight:700;color:var(--white);margin-top:6px;">${state.items.length} itens</div>
        </div>
      </div>
    </div>`;
}

/* ------------------------------ EVENTOS & TOPBAR --------------------------- */

function wireTopbar() {
  document.querySelectorAll('[data-action="tab"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      state.tab = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === state.tab));
      renderTabContent();
    });
  });
}

function wireFormulasShell() {
  const container = document.getElementById("tabContent");
  if (!container) return;
  
  container.onclick = async (e) => {
    const btn = e.target.closest('[data-action="produce-batch"]');
    if (!btn) return;

    const formulaId = btn.dataset.id;
    const formula = state.formulas.find((f) => f.id === formulaId);
    if (!formula) return;

    const volumeStr = prompt(`[Produzir Lote da Fórmula: ${formula.name}]\nInforme a quantidade desejada em ml:`, "100");
    if (!volumeStr) return;

    const volumeMl = parseFloat(volumeStr);
    if (isNaN(volumeMl) || volumeMl <= 0) {
      alert("Quantidade inválida.");
      return;
    }

    try {
      const res = await produceBatch({
        formula,
        batchSizeMl: volumeMl,
        type: "producao",
        maturationDays: 30,
        notes: "Lote gerado via interface",
        materialsList: state.items
      });

      if (!res.success) {
        let msg = "Estoque insuficiente para produzir este lote:\n\n";
        res.missingItems.forEach((it) => {
          msg += `• ${it.name}: Necessário ${it.needed}${it.unit}, disponível ${it.available}${it.unit}\n`;
        });
        alert(msg);
      } else {
        alert(`✅ Lote ${res.batchNumber} criado com sucesso!\nEstoque atualizado.`);
        await reload();
        renderTabContent();
      }
    } catch (err) {
      alert("Erro ao processar produção: " + err.message);
    }
  };
}

function wireEstoqueShell() {}

/* --------------------------------- INÍCIO ---------------------------------- */

(async function start() {
  render();
  await reload();
  renderTabContent();
})();
   
