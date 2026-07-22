/* ==========================================================================
   OBSIDIAN — Serviço Transacional de Lotes e Movimentações de Estoque
   ========================================================================== */

import { sb } from './app.js';
import { CostsService } from './costsService.js';

export async function produceBatch({ formula, batchSizeMl, type, maturationDays, notes, materialsList }) {
  const concPct = formula.concentrationPct || formula.concentration_pct || 100;
  const compoundTotalMl = (batchSizeMl * concPct) / 100;
  
  // MÓDULO 3: Validação estrita de disponibilidade de todos os materiais
  const missingItems = [];
  const itemsToDeduct = [];

  formula.materials.forEach((m) => {
    const needed = (compoundTotalMl * m.percentage) / 100;
    const inv = materialsList.find((it) => it.id === m.inventoryId);
    
    const available = inv ? Number(inv.quantity) : 0;
    if (!inv || available < needed) {
      missingItems.push({
        name: m.name || inv?.name || 'Material desconhecido',
        needed: needed.toFixed(2),
        available: available.toFixed(2),
        unit: inv ? inv.unit : 'g'
      });
    } else {
      itemsToDeduct.push({
        materialId: inv.id,
        currentQty: available,
        deductQty: needed,
        newQty: available - needed,
        unit: inv.unit,
        name: inv.name
      });
    }
  });

  // Não permite produção parcial
  if (missingItems.length > 0) {
    return { success: false, missingItems };
  }

  // MÓDULO 16: Cálculo dos Custos Financeiros do Lote
  const totalCost = CostsService.calcFormulaCostForVolume(formula, materialsList, batchSizeMl);
  const costPerMl = batchSizeMl > 0 ? totalCost / batchSizeMl : 0;
  const batchNumber = `DJ-${Math.floor(1000 + Math.random() * 9000)}`;

  // MÓDULO 4 e 5: Desconto Automático + Histórico de Movimentações
  for (const item of itemsToDeduct) {
    const { error: updateErr } = await sb.from('materials')
      .update({ quantity: item.newQty })
      .eq('id', item.materialId);

    if (updateErr) throw new Error(`Falha ao descontar estoque do ingrediente ${item.name}`);

    await sb.from('stock_movements').insert({
      material_id: item.materialId,
      type: 'saida',
      quantity: item.deductQty,
      unit: item.unit,
      origin: `Lote ${batchNumber}`,
      notes: `Produção de ${batchSizeMl}ml do produto (${formula.name})`
    });
  }

  // MÓDULO 1 e 9: Gravação do Lote com Maturação
  const { data: newBatch, error: batchErr } = await sb.from('batches').insert({
    batch_number: batchNumber,
    formula_id: formula.id,
    formula_name: formula.name,
    size_ml: batchSizeMl,
    type,
    maturation_days: maturationDays,
    total_cost: totalCost,
    cost_per_ml: costPerMl,
    materials_snapshot: formula.materials,
    notes,
    log: [{ date: new Date().toISOString(), note: `Lote ${batchNumber} iniciado em maceração (${maturationDays} dias).` }]
  }).select().single();

  if (batchErr) throw new Error("Erro ao registrar o novo lote no banco de dados.");

  return { success: true, batch: newBatch, batchNumber };
        }
    
