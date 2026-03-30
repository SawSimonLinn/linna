# Linna

## Supabase setup

1. Copy `.env.example` to `.env` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. In Supabase SQL Editor, run [`supabase/schema.sql`](/Users/sawsimon/simonlinn/se_projects/linna/supabase/schema.sql).
3. In Supabase, add the native Clerk third-party auth integration for your Clerk domain.
4. In Clerk, enable the Supabase integration so Clerk session tokens include the `role: authenticated` claim.
5. If you cannot use the native integration, set `SUPABASE_JWT_TEMPLATE` and create a Clerk JWT template named `supabase` as a fallback.
6. Start the app with `npm run dev`.

The app now stores projects and chat messages in Supabase through authenticated API routes under [`src/app/api/projects`](/Users/sawsimon/simonlinn/se_projects/linna/src/app/api/projects).
