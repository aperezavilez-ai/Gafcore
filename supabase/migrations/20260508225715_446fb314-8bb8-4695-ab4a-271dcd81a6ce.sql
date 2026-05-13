create table if not exists public.commercials (id uuid primary key default gen_random_uuid(), user_id uuid not null, user_prompt text not null, brief jsonb not null default '{}'::jsonb, status text not null default 'brief_ready', duration_seconds integer not null default 20, photo_path text, voice_path text, final_video_path text, thumbnail_path text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.release_tracks (id uuid primary key default gen_random_uuid(), user_id uuid not null, release_id uuid not null references public.releases(id) on delete cascade, name text not null, audio_path text, duration_seconds integer not null default 0, position integer not null default 1, isrc text, preview_start integer not null default 0, preview_duration integer not null default 30, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.release_validations (id uuid primary key default gen_random_uuid(), user_id uuid not null, release_id uuid not null, passed boolean not null default false, errors jsonb not null default '[]'::jsonb, warnings jsonb not null default '[]'::jsonb, ddex_payload jsonb, validated_at timestamptz not null default now());
create table if not exists public.release_store_status (id uuid primary key default gen_random_uuid(), user_id uuid not null, release_id uuid not null, store text not null, status text not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.ai_tracks (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, audio_path text, vocals_path text, instrumental_path text, duration_seconds integer not null default 0, prompt text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.cover_arts (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text, image_path text not null, prompt text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.gafsync_clips (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, video_path text not null, style text, bpm integer, duration_seconds integer not null default 20, is_premium_unlocked boolean not null default false, watermark boolean not null default true, audio_source text, format text, created_at timestamptz not null default now());
create table if not exists public.lyrics_drafts (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text, prompt text, lyrics text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.gafads_campaigns (id uuid primary key default gen_random_uuid(), user_id uuid, code text unique, title text not null default 'Campaña', destination_url text, clicks integer not null default 0, impressions integer not null default 0, is_active boolean not null default true, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.gafads_events (id uuid primary key default gen_random_uuid(), campaign_id uuid, event_type text not null, user_agent text, ip_hash text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.gafsites (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, slug text, content jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.gafsite_publications (id uuid primary key default gen_random_uuid(), user_id uuid not null, gafsite_id uuid, url text, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.social_connections (id uuid primary key default gen_random_uuid(), user_id uuid not null, provider text not null, access_token text, refresh_token text, expires_at timestamptz, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.social_distributions (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text, status text not null default 'draft', metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.social_distribution_targets (id uuid primary key default gen_random_uuid(), user_id uuid not null, distribution_id uuid, provider text not null, status text not null default 'pending', scheduled_at timestamptz, published_at timestamptz, error text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.payout_accounts (id uuid primary key default gen_random_uuid(), user_id uuid not null, type text not null default 'bank', holder_name text, details jsonb not null default '{}'::jsonb, is_default boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.youtube_connections (id uuid primary key default gen_random_uuid(), user_id uuid not null, channel_id text, access_token text, refresh_token text, expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.oauth_states (id uuid primary key default gen_random_uuid(), user_id uuid not null, nonce text not null unique, provider text not null, redirect_path text, created_at timestamptz not null default now());
create table if not exists public.licenses (id uuid primary key default gen_random_uuid(), user_id uuid not null, folio text unique not null, status text not null default 'active', metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.artist_followers (id uuid primary key default gen_random_uuid(), user_id uuid not null, artist_user_id uuid not null, created_at timestamptz not null default now(), unique(user_id, artist_user_id));
create table if not exists public.release_likes (id uuid primary key default gen_random_uuid(), user_id uuid not null, release_id uuid not null, created_at timestamptz not null default now(), unique(user_id, release_id));
create table if not exists public.track_streams (id uuid primary key default gen_random_uuid(), user_id uuid, track_id uuid, release_id uuid, store text, country text, amount numeric not null default 0, streamed_at timestamptz not null default now());
create table if not exists public.coupons (id uuid primary key default gen_random_uuid(), code text unique not null, credits integer not null default 0, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.coupon_redemptions (id uuid primary key default gen_random_uuid(), user_id uuid not null, coupon_id uuid not null, created_at timestamptz not null default now(), unique(user_id, coupon_id));

alter table public.commercials enable row level security;
alter table public.release_tracks enable row level security;
alter table public.release_validations enable row level security;
alter table public.release_store_status enable row level security;
alter table public.ai_tracks enable row level security;
alter table public.cover_arts enable row level security;
alter table public.gafsync_clips enable row level security;
alter table public.lyrics_drafts enable row level security;
alter table public.gafads_campaigns enable row level security;
alter table public.gafads_events enable row level security;
alter table public.gafsites enable row level security;
alter table public.gafsite_publications enable row level security;
alter table public.social_connections enable row level security;
alter table public.social_distributions enable row level security;
alter table public.social_distribution_targets enable row level security;
alter table public.youtube_connections enable row level security;
alter table public.oauth_states enable row level security;
alter table public.licenses enable row level security;
alter table public.artist_followers enable row level security;
alter table public.release_likes enable row level security;
alter table public.track_streams enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['commercials','release_tracks','release_validations','release_store_status','ai_tracks','cover_arts','gafsync_clips','lyrics_drafts','gafsites','gafsite_publications','social_connections','social_distributions','social_distribution_targets','youtube_connections','oauth_states','licenses','artist_followers','release_likes','coupon_redemptions'] loop
    execute format('drop policy if exists "owner manage %1$s" on public.%1$I', t);
    execute format('create policy "owner manage %1$s" on public.%1$I for all to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), ''admin'')) with check (auth.uid() = user_id or public.has_role(auth.uid(), ''admin''))', t);
  end loop;
end $$;

drop policy if exists "users read public ads" on public.gafads_campaigns;
create policy "users read public ads" on public.gafads_campaigns for select using (is_active = true or auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "owners manage ads" on public.gafads_campaigns;
create policy "owners manage ads" on public.gafads_campaigns for all to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin')) with check (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "public insert ad events" on public.gafads_events;
create policy "public insert ad events" on public.gafads_events for insert with check (true);
drop policy if exists "owners read ad events" on public.gafads_events;
create policy "owners read ad events" on public.gafads_events for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "public read active coupons" on public.coupons;
create policy "public read active coupons" on public.coupons for select to authenticated using (active = true or public.has_role(auth.uid(), 'admin'));
drop policy if exists "owners read streams" on public.track_streams;
create policy "owners read streams" on public.track_streams for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create or replace function public.assign_isrc_to_track(_track_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_isrc text;
begin
  v_isrc := 'MXGAF' || to_char(now(), 'YY') || lpad((floor(random() * 100000)::int)::text, 5, '0');
  update public.release_tracks set isrc = v_isrc, updated_at = now() where id = _track_id;
  return v_isrc;
end;
$$;