-- OBSIDIAN Laboratório — migração: Custos + Lotes de produção + Movimentações
-- Roda no SQL Editor do Supabase. Só acrescenta colunas/tabelas, não mexe no que já existe.

-- 1) Custos nos materiais
alter table materials add column if not exists price_paid numeric;
alter table materials add column if not exists purchase_quantity numeric;
alter table materials add column if not exists purchase_date date;

-- 2) Lotes de produção
create table if not exists lotes (
  id uuid primary key default gen_random_uuid(),
  formula_id uuid references formulas(id) on delete set null,
  formula_name text not null,
  code text not null,
  volume_ml numeric not null,
  type text not null check (type in ('teste', 'producao')),
  maturation_days numeric not null default 15,
  notes text,
  consumed jsonb not null default '[]'::jsonb,
  log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table lotes enable row level security;
create policy "public read lotes" on lotes for select using (true);
create policy "public write lotes" on lotes for insert with check (true);
create policy "public update lotes" on lotes for update using (true);
create policy "public delete lotes" on lotes for delete using (true);

-- 3) Histórico de movimentação de estoque
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  material_id uuid references materials(id) on delete set null,
  material_name text not null,
  type text not null check (type in ('entrada', 'saida', 'ajuste')),
  quantity numeric not null,
  unit text,
  origin text,
  notes text,
  created_at timestamptz not null default now()
);

alter table stock_movements enable row level security;
create policy "public read stock_movements" on stock_movements for select using (true);
create policy "public write stock_movements" on stock_movements for insert with check (true);
create policy "public update stock_movements" on stock_movements for update using (true);
create policy "public delete stock_movements" on stock_movements for delete using (true);
