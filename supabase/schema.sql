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

-- Pinned messages
alter table public.messages
  add column if not exists pinned boolean not null default false;

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

create policy "Users can update messages for their own projects"
  on public.messages
  for update
  using (
    exists (
      select 1
      from public.projects
      where projects.id = messages.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- GitHub integration columns
alter table public.projects
  add column if not exists github_repo_url text,
  add column if not exists github_repo_name text,
  add column if not exists github_owner text,
  add column if not exists readme text,
  add column if not exists last_synced_at timestamptz;

-- Profiles table — stores GitHub token, plan, and Stripe billing info
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_token text,
  plan text not null default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists plan text not null default 'free',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Stripe webhook idempotency — service role only, no RLS needed
create table if not exists public.stripe_events (
  event_id text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

-- Launch content cache
alter table public.projects
  add column if not exists launch_content jsonb;

-- Task and progress columns on projects
alter table public.projects
  add column if not exists task_count integer not null default 0,
  add column if not exists completed_task_count integer not null default 0,
  add column if not exists mvp_scope text not null default '',
  add column if not exists next_action text not null default '';

-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  "order" integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.tasks enable row level security;

create policy "Users can read tasks for their own projects"
  on public.tasks for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

create policy "Users can insert tasks for their own projects"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

create policy "Users can update tasks for their own projects"
  on public.tasks for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

create policy "Users can delete tasks for their own projects"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Team collaboration: project members
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id text not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default timezone('utc', now()),
  unique(project_id, user_id)
);

create index if not exists project_members_project_id_idx on public.project_members (project_id);
create index if not exists project_members_user_id_idx on public.project_members (user_id);

alter table public.project_members enable row level security;

-- Members can see all members of projects they belong to (or own)
create policy "Members can read project members"
  on public.project_members for select
  using (
    (auth.jwt() ->> 'sub') = user_id
    or exists (
      select 1 from public.projects
      where projects.id = project_members.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Only project owners can add members
create policy "Owners can insert project members"
  on public.project_members for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_members.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Owners can remove members; members can remove themselves
create policy "Owners or self can delete project members"
  on public.project_members for delete
  using (
    (auth.jwt() ->> 'sub') = user_id
    or exists (
      select 1 from public.projects
      where projects.id = project_members.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Project invitations (token-based invite links)
create table if not exists public.project_invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  invited_email text not null,
  invited_by text not null,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists project_invitations_token_idx on public.project_invitations (token);

alter table public.project_invitations enable row level security;

-- Owners can manage all invitations for their projects
create policy "Owners can manage invitations"
  on public.project_invitations for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_invitations.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  )
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_invitations.project_id
        and projects.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Invited users can read their own invitation by token (needed for acceptance)
create policy "Anyone can read invitations by token"
  on public.project_invitations for select
  using (true);

-- Update project/message/task policies to allow team members read access

-- Allow team members to read projects they are members of
drop policy if exists "Users can read their own projects" on public.projects;
create policy "Users can read accessible projects"
  on public.projects for select
  using (
    (auth.jwt() ->> 'sub') = user_id
    or exists (
      select 1 from public.project_members
      where project_members.project_id = projects.id
        and project_members.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Allow team members to update projects (e.g. last_active when they chat)
drop policy if exists "Users can update their own projects" on public.projects;
create policy "Users can update accessible projects"
  on public.projects for update
  using (
    (auth.jwt() ->> 'sub') = user_id
    or exists (
      select 1 from public.project_members
      where project_members.project_id = projects.id
        and project_members.user_id = (auth.jwt() ->> 'sub')
    )
  )
  with check (
    (auth.jwt() ->> 'sub') = user_id
    or exists (
      select 1 from public.project_members
      where project_members.project_id = projects.id
        and project_members.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Allow team members to read messages
drop policy if exists "Users can read messages for their own projects" on public.messages;
create policy "Users can read messages for accessible projects"
  on public.messages for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = messages.project_id
        and (
          projects.user_id = (auth.jwt() ->> 'sub')
          or exists (
            select 1 from public.project_members
            where project_members.project_id = projects.id
              and project_members.user_id = (auth.jwt() ->> 'sub')
          )
        )
    )
  );

-- Allow team members to insert messages
drop policy if exists "Users can insert messages for their own projects" on public.messages;
create policy "Users can insert messages for accessible projects"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = messages.project_id
        and (
          projects.user_id = (auth.jwt() ->> 'sub')
          or exists (
            select 1 from public.project_members
            where project_members.project_id = projects.id
              and project_members.user_id = (auth.jwt() ->> 'sub')
          )
        )
    )
  );

-- Allow team members to update messages (e.g. pin)
drop policy if exists "Users can update messages for their own projects" on public.messages;
create policy "Users can update messages for accessible projects"
  on public.messages for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = messages.project_id
        and (
          projects.user_id = (auth.jwt() ->> 'sub')
          or exists (
            select 1 from public.project_members
            where project_members.project_id = projects.id
              and project_members.user_id = (auth.jwt() ->> 'sub')
          )
        )
    )
  );

-- Allow team members to read/write tasks
drop policy if exists "Users can read tasks for their own projects" on public.tasks;
create policy "Users can read tasks for accessible projects"
  on public.tasks for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
        and (
          projects.user_id = (auth.jwt() ->> 'sub')
          or exists (
            select 1 from public.project_members
            where project_members.project_id = projects.id
              and project_members.user_id = (auth.jwt() ->> 'sub')
          )
        )
    )
  );

drop policy if exists "Users can insert tasks for their own projects" on public.tasks;
create policy "Users can insert tasks for accessible projects"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
        and (
          projects.user_id = (auth.jwt() ->> 'sub')
          or exists (
            select 1 from public.project_members
            where project_members.project_id = projects.id
              and project_members.user_id = (auth.jwt() ->> 'sub')
          )
        )
    )
  );

drop policy if exists "Users can update tasks for their own projects" on public.tasks;
create policy "Users can update tasks for accessible projects"
  on public.tasks for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
        and (
          projects.user_id = (auth.jwt() ->> 'sub')
          or exists (
            select 1 from public.project_members
            where project_members.project_id = projects.id
              and project_members.user_id = (auth.jwt() ->> 'sub')
          )
        )
    )
  );

drop policy if exists "Users can delete tasks for their own projects" on public.tasks;
create policy "Users can delete tasks for accessible projects"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
        and (
          projects.user_id = (auth.jwt() ->> 'sub')
          or exists (
            select 1 from public.project_members
            where project_members.project_id = projects.id
              and project_members.user_id = (auth.jwt() ->> 'sub')
          )
        )
    )
  );
