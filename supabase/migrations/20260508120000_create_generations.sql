-- Phase 0: shared AI generation log used by all Suite modules
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  prompt text not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_module_idx
  on public.generations (user_id, module, created_at desc);

alter table public.generations enable row level security;

create policy "users select own generations"
  on public.generations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users insert own generations"
  on public.generations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users delete own generations"
  on public.generations for delete
  to authenticated
  using (auth.uid() = user_id);
