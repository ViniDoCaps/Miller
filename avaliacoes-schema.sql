-- Execute este script no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 60),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 10 and 500),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.reviews enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews are publicly readable') then
    create policy "reviews are publicly readable" on public.reviews for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'visitors can submit reviews') then
    create policy "visitors can submit reviews" on public.reviews for insert to anon, authenticated with check (true);
  end if;
end
$$;

grant select, insert on table public.reviews to anon, authenticated;
