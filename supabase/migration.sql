-- ============================================================
-- TAM Visualizer — Supabase Migration
-- Creates the populations table with RLS policies
-- ============================================================

-- Create populations table
create table if not exists public.populations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  total_population bigint not null,
  segments jsonb not null default '[]'::jsonb,
  share_id text unique default null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.populations enable row level security;

-- RLS Policies: users can only access their own rows
create policy "Users can view own populations"
  on public.populations for select
  using (auth.uid() = user_id);

create policy "Users can insert own populations"
  on public.populations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own populations"
  on public.populations for update
  using (auth.uid() = user_id);

create policy "Users can delete own populations"
  on public.populations for delete
  using (auth.uid() = user_id);

-- Public access for shared populations
create policy "Anyone can view shared populations"
  on public.populations for select
  using (is_public = true);

-- Index for faster user lookups
create index if not exists populations_user_id_idx
  on public.populations(user_id);

-- Index for share_id lookups
create index if not exists populations_share_id_idx
  on public.populations(share_id)
  where share_id is not null;

-- Auto-update updated_at on row modification
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_populations_updated
  before update on public.populations
  for each row execute function public.handle_updated_at();
