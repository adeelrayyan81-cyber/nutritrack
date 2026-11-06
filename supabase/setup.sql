-- NutriTrack leaderboard. Paste this whole file into Supabase → SQL Editor → Run.
create table if not exists public.leaderboard (
  id          text primary key,
  name        text not null check (char_length(name) between 1 and 30),
  points      integer not null default 0 check (points between 0 and 10000000),
  week_points integer not null default 0 check (week_points between 0 and 10000000),
  week_key    text,
  week_type   text,
  updated_at  timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

drop policy if exists "anyone can read the leaderboard" on public.leaderboard;
create policy "anyone can read the leaderboard" on public.leaderboard for select using (true);

drop policy if exists "app can add scores" on public.leaderboard;
create policy "app can add scores" on public.leaderboard for insert with check (true);

drop policy if exists "app can update scores" on public.leaderboard;
create policy "app can update scores" on public.leaderboard for update using (true) with check (true);

grant select, insert, update on public.leaderboard to anon, authenticated;
