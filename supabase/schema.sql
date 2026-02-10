-- Table des trajets à vélo
create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  distance_km numeric(6, 2) not null check (distance_km >= 0),
  duration_minutes integer check (duration_minutes >= 0),
  note text,
  created_at timestamptz not null default now()
);

-- Index pour les requêtes par utilisateur et date
create index if not exists rides_user_id_date_idx on public.rides (user_id, date desc);

-- RLS : chaque utilisateur ne voit que ses trajets
alter table public.rides enable row level security;

create policy "Users can read own rides"
  on public.rides for select
  using (auth.uid() = user_id);

create policy "Users can insert own rides"
  on public.rides for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rides"
  on public.rides for update
  using (auth.uid() = user_id);

create policy "Users can delete own rides"
  on public.rides for delete
  using (auth.uid() = user_id);
