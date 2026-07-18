-- OBSIDIAN Laboratório — migração: Acordes + Perfumes (controle de maturação)
-- Roda isso no SQL Editor do teu projeto Supabase (o mesmo que já tem materials/formulas).
-- Não apaga nem altera nada que já existe — só cria as duas tabelas novas.

create extension if not exists "pgcrypto";

create table if not exists accords (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  materials jsonb not null default '[]'::jsonb,
  maturation_days numeric not null default 18,
  notes text,
  log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists perfumes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  briefing text,
  formula_id uuid references formulas(id) on delete set null,
  maturation_days numeric not null default 18,
  notes text,
  log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table accords enable row level security;
alter table perfumes enable row level security;

create policy "public read accords" on accords for select using (true);
create policy "public write accords" on accords for insert with check (true);
create policy "public update accords" on accords for update using (true);
create policy "public delete accords" on accords for delete using (true);

create policy "public read perfumes" on perfumes for select using (true);
create policy "public write perfumes" on perfumes for insert with check (true);
create policy "public update perfumes" on perfumes for update using (true);
create policy "public delete perfumes" on perfumes for delete using (true);
