-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TYPE public.permission_level AS ENUM (
  'user',
  'admin_level_1',
  'admin_level_2',
  'admin_level_3'
);

CREATE TABLE public.users (
  id uuid NOT NULL,
  username text,
  full_name text,
  email text,
  phone text,
  address text,
  permission_level public.permission_level DEFAULT 'user'::public.permission_level,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_username_key UNIQUE (username),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.admins (
  id uuid NOT NULL,
  username text UNIQUE,
  full_name text,
  email text,
  department text,
  location text,
  permission_level public.permission_level DEFAULT 'admin_level_1'::public.permission_level,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.complaints (
  id text NOT NULL,
  user_id uuid,
  reg_number text UNIQUE,
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
  assigned_to uuid,
  submitted_at timestamp with time zone,
  date_submitted date,
  last_updated date,
  updates jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  attachments_count integer DEFAULT 0,
  CONSTRAINT complaints_pkey PRIMARY KEY (id),
  CONSTRAINT complaints_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT complaints_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.admins(id)
);