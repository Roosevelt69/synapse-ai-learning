-- Profiles (extends auth.users, auto-created on signup via trigger)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text default 'Learner',
  has_onboarded boolean default false,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can manage own profile"
  on public.profiles for all
  using (auth.uid() = id);

-- Aggregate progress stats (XP, streak, activity date)
create table if not exists public.user_progress (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  total_xp integer default 0 not null,
  current_streak integer default 0 not null,
  longest_streak integer default 0 not null,
  last_activity_date text,
  updated_at timestamptz default now() not null
);

alter table public.user_progress enable row level security;

create policy "Users can manage own progress"
  on public.user_progress for all
  using (auth.uid() = user_id);

-- One row per completed lesson per user
create table if not exists public.lesson_completions (
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id text not null,
  course_id text not null,
  completed_at timestamptz default now() not null,
  primary key (user_id, lesson_id)
);

alter table public.lesson_completions enable row level security;

create policy "Users can manage own completions"
  on public.lesson_completions for all
  using (auth.uid() = user_id);

-- Best quiz score per lesson per user (upserted on each attempt)
create table if not exists public.quiz_scores (
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id text not null,
  course_id text not null,
  score integer not null,
  total integer not null,
  xp_earned integer not null,
  completed_at timestamptz default now() not null,
  primary key (user_id, lesson_id)
);

alter table public.quiz_scores enable row level security;

create policy "Users can manage own quiz scores"
  on public.quiz_scores for all
  using (auth.uid() = user_id);

-- Trigger: auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Learner')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
