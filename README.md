# KV Medak BSG Portal — OYMS 4.0 (2026)

School-level Bharat Scouts & Guides unit management application for **PM SHRI Kendriya Vidyalaya Ordnance Factory Medak, Eddumailaram**, KVS Hyderabad Division.

## Stack
- React + Vite
- Supabase Auth + PostgreSQL + Row Level Security (production mode)
- Local demo mode when Supabase environment variables are not configured

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Add your Supabase project URL and anon/publishable key (leave both blank to explore demo mode).
4. Run `npm install`, then `npm run dev`.

## Configure the production backend
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub Actions repository secrets.
4. Create staff users in Supabase Authentication. Insert matching rows into `public.profiles` with approved roles. The browser must never receive the service-role key.
5. For new user onboarding, use an admin-controlled invitation process. Public self-registration only creates a pending request; it cannot choose its own role or gain an authenticated account.
6. Configure the Supabase Auth site URL and redirect URLs for the deployed domain.

## Roles
- `super_admin`
- `school_admin`
- `unit_leader`
- `patrol_leader`
- `member`

The application checks roles in the UI; PostgreSQL Row Level Security is the actual data boundary. Review policies before storing real student information. The initial SQL policies are a practical starting point and should be security-reviewed before production use.

## Deployment
The GitHub Actions workflow builds the Vite application and deploys `dist/` to GitHub Pages. Configure the two Supabase secrets to activate shared authentication and database storage. Without them, the portal explicitly runs in local demo mode and stores demo records in that browser only.

## Institution identity
- PM SHRI Kendriya Vidyalaya Ordnance Factory Medak, Eddumailaram
- Bharat Scouts & Guides (B.S.&G.)
- KVS Hyderabad Division
- Patrols: Panther, Eagle, Fox, Tiger, Lion

This is an independent school-level unit portal, not the official KVS SAMAGAM or national BSG website.
