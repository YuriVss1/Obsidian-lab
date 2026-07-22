/* ==========================================================================
   OBSIDIAN — Camada de Serviços de Custo, Precificação e Validação
   ========================================================================== */

export const CostsService = {
  // Custo unitário real por g ou ml (R$ / unidade)
  getUnitCost(material) {
    if (!material.price_paid || !material.qty_purchased || Number(material.qty_purchased) <= 0) {
      return 0;
    }
    return Number(material.price_paid) / Number(material.qty_purchased);
  },

  // Custo total das matérias-primas para um determinado volume (ml) de fórmula
  calcFormulaCostForVolume(formula, materialsList, volumeMl) {
    if (!formula || !formula.materials || formula.materials.length === 0) return 0;
    
    // Total de concentrado de fragrância necessário em ml/g
    const compoundVolumeMl = (volumeMl * (formula.concentrationPct || formula.concentration_pct || 100)) / 100;

    let totalCost = 0;
    formula.materials.forEach((m) => {
      const inv = materialsList.find((it) => it.id === m.inventoryId);
      if (inv) {
        const neededQty = (compoundVolumeMl * (m.percentage || 0)) / 100;
        const unitCost = this.getUnitCost(inv);
        totalCost += neededQty * unitCost;
      }
    });

    return totalCost;
  },

  // MÓDULO 12: Produção máxima possível baseada no ingrediente limitante
  calcMaxProduction(formula, materialsList) {
    if (!formula || !formula.materials || formula.materials.length === 0) return 0;

    let maxMl = Infinity;

    formula.materials.forEach((m) => {
      const inv = materialsList.find((it) => it.id === m.inventoryId);
      if (!inv || m.percentage <= 0) return;

      const available = Number(inv.quantity) || 0;
      // Proporção do ingrediente no produto final considerando a diluição
      const effPct = ((formula.concentrationPct || formula.concentration_pct || 100) / 100) * (m.percentage / 100);
      
      if (effPct > 0) {
        const possibleForThisMat = available / effPct;
        if (possibleForThisMat < maxMl) {
          maxMl = possibleForThisMat;
        }
      }
    });

    return maxMl === Infinity ? 0 : Math.floor(maxMl);
  },

  // MÓDULO 18 e 19: Custo final do Perfume + Embalagens + Precificação
  calcPerfumeTotalCost(perfume, formula, materialsList, packagingList, volumeMl = 50) {
    const rawMaterialCost = formula ? this.calcFormulaCostForVolume(formula, materialsList, volumeMl) : 0;
    
    let packagingCost = 0;
    if (perfume && Array.isArray(perfume.packaging_ids)) {
      perfume.packaging_ids.forEach((pkgId) => {
        const pkg = packagingList.find((p) => p.id === pkgId);
        if (pkg) packagingCost += Number(pkg.price || 0);
      });
    }

    const totalCost = rawMaterialCost + packagingCost;
    const markup = Number(perfume?.markup) || 4.0;
    const suggestedPrice = totalCost * markup;

    return {
      rawMaterialCost,
      packagingCost,
      totalCost,
      markup,
      suggestedPrice
    };
  }
};
           
