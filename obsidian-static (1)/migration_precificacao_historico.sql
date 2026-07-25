-- OBSIDIAN Laboratório — migração: precificação + histórico de versões da fórmula
-- Roda no SQL Editor do Supabase. Só acrescenta colunas, não mexe no que já existe.

alter table formulas add column if not exists selling_price numeric;
alter table formulas add column if not exists selling_volume_ml numeric;
alter table formulas add column if not exists history jsonb not null default '[]'::jsonb;
