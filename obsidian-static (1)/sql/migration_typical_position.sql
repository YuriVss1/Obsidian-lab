-- OBSIDIAN Laboratório — migração: nota característica do material (Jean Carles)
-- Roda no SQL Editor do teu projeto Supabase. Só acrescenta uma coluna, não mexe em nada existente.

alter table materials
  add column if not exists typical_position text
  check (typical_position in ('topo', 'coracao', 'fundo') or typical_position is null);
