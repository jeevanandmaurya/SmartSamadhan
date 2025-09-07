-- Supabase schema for SmartSamadhan
-- Simplified version to avoid type conflicts
-- Execute sections in SQL Editor. Adjust as needed.

-----------------------------
-- EXTENSIONS
-----------------------------
create extension if not exists "uuid-ossp";

-----------------------------
-- TABLES
-----------------------------
-- Users table (profile) mapped to auth.users.id
create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    username text,
    full_name text,
    email text,
    phone text,
    address text,
    created_at timestamptz default now()
);

-- Admins table (profile) mapped to auth.users.id
create table if not exists public.admins (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique,
    full_name text,
    email text,
    role text,
    level text,
    access_level int,
    department text,
    location text,
    permissions text[] default '{}',
    created_at timestamptz default now()
);

-- Complaints table
create table if not exists public.complaints (
    id text primary key,
    user_id uuid references public.users(id) on delete cascade,
    reg_number text unique,
    title text,
    description text,
    status text,
    priority text,
    category text,
    main_category text,
    sub_category1 text,
    specific_issue text,
    department text,
    city text,
    location text,
    latitude double precision,
    longitude double precision,
    assigned_to text,
    submitted_at timestamptz,
    date_submitted date,
    last_updated date,
    updates jsonb default '[]'::jsonb,
    -- New attachment support (run ALTER TABLE to add if existing db)
    attachments jsonb default '[]'::jsonb,
    attachments_count int default 0
);

-----------------------------
-- INDEXES
-----------------------------
create index if not exists complaints_user_idx on public.complaints(user_id);
create index if not exists complaints_status_idx on public.complaints(status);
create index if not exists complaints_department_idx on public.complaints(department);

-----------------------------
-- RLS ENABLE
-----------------------------
alter table public.users enable row level security;
alter table public.admins enable row level security;
alter table public.complaints enable row level security;

-----------------------------
-- POLICIES: USERS
-----------------------------
-- Drop existing policies if they exist, then create new ones
drop policy if exists "Users: owner select" on public.users;
create policy "Users: owner select" on public.users
    for select using (auth.uid() = id);

drop policy if exists "Users: owner update" on public.users;
create policy "Users: owner update" on public.users
    for update using (auth.uid() = id);

drop policy if exists "Users: insert self" on public.users;
create policy "Users: insert self" on public.users
    for insert with check (auth.uid() = id);

-----------------------------
-- POLICIES: COMPLAINTS
-----------------------------
-- Owner can select/update/delete own complaints
drop policy if exists "Complaints: owner select" on public.complaints;
create policy "Complaints: owner select" on public.complaints
    for select using (auth.uid() = user_id);

drop policy if exists "Complaints: owner modify" on public.complaints;
create policy "Complaints: owner modify" on public.complaints
    for all using (auth.uid() = user_id);

-----------------------------
-- POLICIES: ADMINS
-----------------------------
-- Simple open read; tighten later with JWT custom claims
drop policy if exists "Admins: read all" on public.admins;
create policy "Admins: read all" on public.admins
    for select using (true);

-----------------------------
-- TRIGGER: AUTO PROFILE
-----------------------------
-- Inserts a row into public.users or public.admins when a new auth user registers
create or replace function public.handle_new_user()
returns trigger as $$
declare
    meta jsonb;
    is_admin boolean;
begin
    -- In newer Supabase versions the column is raw_user_meta_data (NOT user_metadata)
    meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
    is_admin := (meta->>'is_admin')::boolean;

    if is_admin then
        insert into public.admins (id, email, username, full_name, role)
        values (
            new.id,
            new.email,
            meta->>'username',
            meta->>'full_name',
            'admin'
        );
    else
        insert into public.users (id, email, username, full_name, phone, address)
        values (
            new.id,
            new.email,
            meta->>'username',
            meta->>'full_name',
            meta->>'phone',
            meta->>'address'
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-----------------------------
-- SAMPLE SEED DATA
-----------------------------
-- Uncomment and modify as needed for testing
-- insert into public.admins (id, username, password, full_name, role, level, access_level, department, location, email)
-- values ('admin001','admin','admin123','State Administrator','State Admin','state',3,'State Administration','State HQ','admin@example.com')
-- on conflict (id) do nothing;
