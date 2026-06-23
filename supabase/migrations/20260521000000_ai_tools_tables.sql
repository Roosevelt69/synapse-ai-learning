-- AI Tools tables for Synapse app
-- Deploy alongside the claude-ai edge function

-- Sandbox conversation history
create table if not exists public.ai_sandbox_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  prompt      text not null,
  response    text not null,
  temperature float not null default 0.5,
  model       text not null default 'claude-sonnet-4-6',
  created_at  timestamptz default now() not null
);

alter table public.ai_sandbox_history enable row level security;
create policy "Users can manage own sandbox history"
  on public.ai_sandbox_history for all
  using (auth.uid() = user_id);

-- AI-generated project ideas
create table if not exists public.generated_projects (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade not null,
  title          text not null,
  emoji          text not null default '🔧',
  description    text not null,
  difficulty     text not null,
  skills         text[] not null default '{}',
  steps          text[] not null default '{}',
  estimated_time text not null,
  course_context text not null default '',
  created_at     timestamptz default now() not null
);

alter table public.generated_projects enable row level security;
create policy "Users can manage own generated projects"
  on public.generated_projects for all
  using (auth.uid() = user_id);

-- Coaching messages log
create table if not exists public.coaching_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  message    text not null,
  type       text not null,  -- active | at_risk | broken | new
  created_at timestamptz default now() not null
);

alter table public.coaching_messages enable row level security;
create policy "Users can manage own coaching messages"
  on public.coaching_messages for all
  using (auth.uid() = user_id);

-- Weekly/monthly AI reflections
create table if not exists public.reflections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  period     text not null,   -- 'weekly' | 'monthly'
  summary    text not null,
  insights   text[] not null default '{}',
  stats      jsonb not null default '{}',
  created_at timestamptz default now() not null
);

alter table public.reflections enable row level security;
create policy "Users can manage own reflections"
  on public.reflections for all
  using (auth.uid() = user_id);

-- Indexes for common query patterns
create index if not exists idx_sandbox_user_created
  on public.ai_sandbox_history (user_id, created_at desc);
create index if not exists idx_projects_user_created
  on public.generated_projects (user_id, created_at desc);
create index if not exists idx_reflections_user_period
  on public.reflections (user_id, period, created_at desc);
