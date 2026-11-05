-- Diário do Bebê — cole este arquivo inteiro no SQL Editor do Supabase e rode.

create table public.babies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  birth_date date not null,
  created_at timestamptz not null default now()
);

create type public.event_type as enum ('feed', 'sleep', 'diaper');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  type public.event_type not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,                 -- soneca (e duração da mamada, se informada)
  feed_kind text check (feed_kind in ('breast_left','breast_right','bottle')),
  amount_ml integer check (amount_ml > 0),
  diaper_kind text check (diaper_kind in ('pee','poop','both')),
  notes text,
  created_at timestamptz not null default now(),
  constraint events_ended_after_started check (ended_at is null or ended_at >= started_at)
);

create index events_baby_started_idx on public.events (baby_id, started_at desc);

-- Row Level Security (obrigatório)
alter table public.babies enable row level security;
alter table public.events enable row level security;

create policy "babies: dono acessa" on public.babies
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "events: dono do bebê acessa" on public.events
  for all
  using (exists (select 1 from public.babies b where b.id = events.baby_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.babies b where b.id = events.baby_id and b.owner_id = auth.uid()));
