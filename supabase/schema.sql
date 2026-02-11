-- Table des vélos
create table if not exists public.bikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text not null,
  acquisition_date date not null,
  sale_date date,
  created_at timestamptz not null default now()
);

create index if not exists bikes_user_id_idx on public.bikes (user_id);

alter table public.bikes enable row level security;

create policy "Users can read own bikes"
  on public.bikes for select
  using (auth.uid() = user_id);

create policy "Users can insert own bikes"
  on public.bikes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bikes"
  on public.bikes for update
  using (auth.uid() = user_id);

create policy "Users can delete own bikes"
  on public.bikes for delete
  using (auth.uid() = user_id);

-- Table des trajets à vélo
create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bike_id uuid references public.bikes(id) on delete set null,
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

-- Pour une base existante : ajouter bike_id à rides si absent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rides' AND column_name = 'bike_id'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN bike_id uuid REFERENCES public.bikes(id) ON DELETE SET NULL;
  END IF;
END $$;
