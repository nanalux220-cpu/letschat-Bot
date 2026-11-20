-- LetsChat database. Run once in Supabase: SQL Editor > New query > paste > Run.

create table if not exists public.bots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'My Business',
  logo_url text,
  color text not null default '#1d4ed8',
  welcome text not null default 'Hi! How can we help you today?',
  business_info text not null default '',
  whatsapp text,
  lead_email text,
  allowed_domains text[] not null default '{}',
  plan text not null default 'none' check (plan in ('none','starter','pro')),
  status text not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage (
  bot_id uuid not null references public.bots(id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  count integer not null default 0,
  primary key (bot_id, month)
);

create table if not exists public.leads (
  id bigint generated always as identity primary key,
  bot_id uuid not null references public.bots(id) on delete cascade,
  name text,
  contact text not null,
  message text,
  page text,
  created_at timestamptz not null default now()
);
create index if not exists leads_bot_idx on public.leads(bot_id, created_at desc);

-- Atomically add one message to this month's count and return the new total.
create or replace function public.increment_usage(p_bot uuid, p_month text)
returns integer language sql security definer set search_path = public as $$
  insert into usage(bot_id, month, count) values (p_bot, p_month, 1)
  on conflict (bot_id, month) do update set count = usage.count + 1
  returning count;
$$;
revoke all on function public.increment_usage(uuid, text) from public, anon, authenticated;

-- All reads and writes go through the server with the service role key.
-- RLS is on with no policies, so the public anon key can't read anything.
alter table public.bots enable row level security;
alter table public.usage enable row level security;
alter table public.leads enable row level security;

-- Public bucket for business logos (uploaded by the server only).
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
on conflict (id) do nothing;
