# SmartSamadhan

Citizen grievance reporting platform built with React + Vite. Supports pluggable data backends (localStorage, Supabase) via a database abstraction layer and optional Supabase authentication.

## Getting Started

Install dependencies:

```
npm install
```

Run dev server:

```
npm run dev
```

Build:

```
npm run build
```

## Supabase Integration

To enable Supabase (auth + database):

1. Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
```
2. Install the client library (if not already):
```
npm install @supabase/supabase-js
```
3. Restart `npm run dev`.

The app auto-detects Supabase via env vars; otherwise it falls back to localStorage. `AuthContext` listens to Supabase auth state changes.

### Recommended Tables (simplified)

Create tables in Supabase (see `supabase-schema.sql` if present or design your own):
- users (id uuid primary key default auth.uid(), username text, full_name text, phone text, address text, created_at timestamptz)
- admins (id text primary key, username text, level text, access_level int, ...)
- complaints (id text primary key, user_id uuid references users(id), reg_number text, title text, description text, status text, priority text, department text, category text, submitted_at timestamptz, updates jsonb, ...)

Enable Row Level Security and add policies permitting owners to CRUD their own rows and read public data as required.

## Database Abstraction

The app uses `EnvironmentDatabaseFactory` to choose backend:
- Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` are set
- Otherwise localStorage

## Auth

`AuthContext` now supports:
- Supabase email/password sign up & sign in
- Legacy local username/password when Supabase disabled

## License

MIT
