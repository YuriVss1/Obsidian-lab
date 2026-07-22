-- OBSIDIAN Laboratório — schema Supabase (projeto novo)
-- Roda isso no SQL Editor do teu NOVO projeto Supabase (Dashboard > SQL Editor > New query > Run)

create extension if not exists "pgcrypto";

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'quimico' check (category in ('quimico','oleo_essencial','absoluto')),
  family text not null,
  typical_position text check (typical_position in ('topo','coracao','fundo') or typical_position is null),
  concentration numeric not null default 100,
  unit text not null default 'g',
  quantity numeric not null default 0,
  min_stock numeric,
  solvent text,
  cas text,
  supplier text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists formulas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  concept text,
  concentration_type text not null default 'Eau de Parfum',
  concentration_pct numeric not null default 18,
  materials jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

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

alter table materials enable row level security;
alter table formulas enable row level security;
alter table accords enable row level security;
alter table perfumes enable row level security;

-- Política aberta: a chave publishable (anon) do teu site consegue ler/escrever.
-- Isso é esperado — a chave é feita pra ficar no navegador. A proteção real
-- de quem acessa é o link do site não ser divulgado. Se quiser travar mais no futuro,
-- dá pra trocar "using (true)" por uma checagem de autenticação.
create policy "public read materials" on materials for select using (true);
create policy "public write materials" on materials for insert with check (true);
create policy "public update materials" on materials for update using (true);
create policy "public delete materials" on materials for delete using (true);

create policy "public read formulas" on formulas for select using (true);
create policy "public write formulas" on formulas for insert with check (true);
create policy "public update formulas" on formulas for update using (true);
create policy "public delete formulas" on formulas for delete using (true);

create policy "public read accords" on accords for select using (true);
create policy "public write accords" on accords for insert with check (true);
create policy "public update accords" on accords for update using (true);
create policy "public delete accords" on accords for delete using (true);

create policy "public read perfumes" on perfumes for select using (true);
create policy "public write perfumes" on perfumes for insert with check (true);
create policy "public update perfumes" on perfumes for update using (true);
create policy "public delete perfumes" on perfumes for delete using (true);
