create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  description text not null default '',
  tech_stack text not null default '',
  goals text not null default '',
  blockers text not null default '',
  target_user text not null default '',
  message_count integer not null default 0,
  last_active timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists projects_user_id_last_active_idx
  on public.projects (user_id, last_active desc);

create index if not exists messages_project_id_created_at_idx
  on public.messages (project_id, created_at asc);

alter table public.projects enable row level security;
alter table public.messages enable row level security;

create policy "Users can read their own projects"
  on public.projects
  for select
  using ((auth.jwt() ->> 'sub') = user_id);

create policy "Users can insert their own projects"
  on public.projects
  for insert
  with check ((auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own projects"
  on public.projects
  for update
  using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their own projects"
  on public.projects
  for delete
  using ((auth.jwt() ->> 'sub') = user_id);

create policy "Users can read messages for their own projects"
  on public.messages
  for select
  using (
    exists (
      select 1
      from public.projects
      where projects.id = messages.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

create policy "Users can insert messages for their own projects"
  on public.messages
  for insert
  with check (
    exists (
      select 1
      from public.projects
      where projects.id = messages.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );
