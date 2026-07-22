-- OBSIDIAN Laboratório — migração: produção de lotes, estoque, custos e embalagens
-- Roda isso no SQL Editor do teu projeto Supabase (não apaga nada existente,
-- só acrescenta colunas/tabelas novas).

create extension if not exists "pgcrypto";

-- 1) Custos nos materiais (MÓDULO 13) -----------------------------------
alter table materials add column if not exists price_paid numeric;
alter table materials add column if not exists quantity_purchased numeric;
alter table materials add column if not exists purchase_date date;

-- 2) Lotes de produção (MÓDULOS 1, 2, 9, 10, 12, 16) ---------------------
create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  formula_id uuid references formulas(id) on delete set null,
  code text not null,
  batch_type text not null default 'teste' check (batch_type in ('teste','producao')),
  quantity_ml numeric not null,
  maturation_days numeric not null default 30,
  status text not null default 'macerando' check (status in ('macerando','pronto','entregue')),
  ingredients jsonb not null default '[]'::jsonb,
  total_cost numeric not null default 0,
  cost_per_ml numeric not null default 0,
  notes text,
  log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table batches enable row level security;
drop policy if exists "public read batches" on batches;
drop policy if exists "public write batches" on batches;
drop policy if exists "public update batches" on batches;
drop policy if exists "public delete batches" on batches;
create policy "public read batches" on batches for select using (true);
create policy "public write batches" on batches for insert with check (true);
create policy "public update batches" on batches for update using (true);
create policy "public delete batches" on batches for delete using (true);

-- 3) Histórico de movimentação de estoque (MÓDULO 5) ---------------------
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  material_id uuid references materials(id) on delete cascade,
  movement_type text not null check (movement_type in ('entrada','saida','ajuste')),
  quantity numeric not null,
  origin text,
  notes text,
  created_at timestamptz not null default now()
);
alter table stock_movements enable row level security;
drop policy if exists "public read movements" on stock_movements;
drop policy if exists "public write movements" on stock_movements;
drop policy if exists "public update movements" on stock_movements;
drop policy if exists "public delete movements" on stock_movements;
create policy "public read movements" on stock_movements for select using (true);
create policy "public write movements" on stock_movements for insert with check (true);
create policy "public update movements" on stock_movements for update using (true);
create policy "public delete movements" on stock_movements for delete using (true);

-- 4) Insumos de embalagem (MÓDULO 17) -------------------------------------
create table if not exists packaging_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'frasco' check (category in ('frasco','valvula','tampa','caixa','etiqueta','outro')),
  price numeric not null default 0,
  quantity numeric not null default 1,
  supplier text,
  created_at timestamptz not null default now()
);
alter table packaging_items enable row level security;
drop policy if exists "public read packaging" on packaging_items;
drop policy if exists "public write packaging" on packaging_items;
drop policy if exists "public update packaging" on packaging_items;
drop policy if exists "public delete packaging" on packaging_items;
create policy "public read packaging" on packaging_items for select using (true);
create policy "public write packaging" on packaging_items for insert with check (true);
create policy "public update packaging" on packaging_items for update using (true);
create policy "public delete packaging" on packaging_items for delete using (true);

-- 5) Custo final do perfume (MÓDULOS 18, 19) ------------------------------
alter table perfumes add column if not exists packaging jsonb not null default '[]'::jsonb;
alter table perfumes add column if not exists fill_ml numeric not null default 50;
alter table perfumes add column if not exists markup numeric not null default 4;
