---
plan: 01-supabase-init
phase: 1
wave: 1
depends_on: []
files_modified:
  - .env.local (new)
  - .env.example (new)
  - src/lib/supabase.ts (new)
requirements_addressed:
  - INFRA-01
  - INFRA-03
  - INFRA-04
  - INFRA-07
autonomous: true
---

# Plan 1.1: Supabase Project Init

## Objective

Create the Supabase project (via MCP), enable PostGIS, configure Auth providers (phone OTP + magic link), create the `incident-media` storage bucket, enable Realtime for the three core tables, and set up the Supabase client singleton for the React app.

## read_first

- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Auth config details, Realtime subscription pattern, env var names

## Tasks

<task id="1.1.1">
<title>Create Supabase project via MCP</title>
<action>
Use the `mcp_supabase-mcp-server_create_project` tool to create the Supabase project (if not already created). Use `mcp_supabase-mcp-server_list_projects` first to check if a project named "resq-ai" already exists.

Project config:
- name: "resq-ai"
- region: "ap-south-1" (Mumbai — closest to India)
- organization_id: (use mcp_supabase-mcp-server_list_organizations to get org ID)

After creation, use `mcp_supabase-mcp-server_get_project` to confirm the project is ACTIVE (status = "ACTIVE_HEALTHY"). Save/note the `project_ref` (project_id).
</action>
<read_first>
- Use mcp_supabase-mcp-server_list_organizations to get org ID first
- Use mcp_supabase-mcp-server_list_projects to check if project exists
</read_first>
<acceptance_criteria>
- mcp_supabase-mcp-server_get_project returns status = "ACTIVE_HEALTHY"
- project_ref is available and noted
</acceptance_criteria>
</task>

<task id="1.1.2">
<title>Enable PostGIS extension</title>
<action>
Run the following SQL via `mcp_supabase-mcp-server_apply_migration`:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

Migration name: `enable_postgis`
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — PostGIS SQL
</read_first>
<acceptance_criteria>
- SQL executes without error
- `mcp_supabase-mcp-server_execute_sql` with `SELECT PostGIS_Version();` returns a version string (e.g., "3.x...")
- `mcp_supabase-mcp-server_list_extensions` includes "postgis" with installed_version not null
</acceptance_criteria>
</task>

<task id="1.1.3">
<title>Configure Supabase Auth (phone OTP + magic link)</title>
<action>
Supabase Auth configuration is done via dashboard. Document the required settings in `.planning/phases/01-foundation-supabase-infrastructure-setup/AUTH-CONFIG.md`:

```markdown
# Auth Configuration (Manual Steps Required)

After Supabase project is created, configure in Supabase Dashboard:

## Phone OTP (Twilio)
Dashboard → Authentication → Providers → Phone
- Enable: Yes
- SMS Provider: Twilio
- Account SID: [ADD FROM TWILIO]
- Auth Token: [ADD FROM TWILIO]
- Message Service SID or From: [ADD FROM TWILIO]

## Email Magic Link
Dashboard → Authentication → Providers → Email
- Enable Email: Yes
- Confirm Email: Yes
- Magic Link: Yes
- Minimum password length: N/A (magic link only)

## Auth Trigger (auto-create profile)
Run migration "create_auth_trigger" (done in Plan 1.2)
```

Create the `AUTH-CONFIG.md` file in the phase directory.
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Auth config section
</read_first>
<acceptance_criteria>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/AUTH-CONFIG.md` file exists and contains sections for Phone OTP and Email Magic Link
</acceptance_criteria>
</task>

<task id="1.1.4">
<title>Create incident-media storage bucket</title>
<action>
Run the following SQL via `mcp_supabase-mcp-server_apply_migration` with migration name `create_storage_bucket`:

```sql
-- Insert the bucket via Supabase storage schema
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'incident-media',
  'incident-media',
  true,
  5242880,  -- 5MB in bytes
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "incident_media_authenticated_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'incident-media');

CREATE POLICY "incident_media_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'incident-media');
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Storage section
</read_first>
<acceptance_criteria>
- SQL executes without error
- `mcp_supabase-mcp-server_execute_sql` with `SELECT id, name, public FROM storage.buckets WHERE id = 'incident-media';` returns one row with public = true
</acceptance_criteria>
</task>

<task id="1.1.5">
<title>Enable Realtime for core tables</title>
<action>
Run the following SQL via `mcp_supabase-mcp-server_apply_migration` with migration name `enable_realtime`:

```sql
-- Enable Realtime publication for the 3 core tables
ALTER PUBLICATION supabase_realtime ADD TABLE disaster_events;
ALTER PUBLICATION supabase_realtime ADD TABLE user_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE sos_requests;
```

Note: This migration should run AFTER Plan 1.2 creates the tables. Mark this as depends_on: [1.1 schema].
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Realtime section
</read_first>
<acceptance_criteria>
- SQL executes without error
- `SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename IN ('disaster_events','user_reports','sos_requests');` returns 3 rows
</acceptance_criteria>
</task>

<task id="1.1.6">
<title>Get Supabase credentials and create .env files</title>
<action>
Use `mcp_supabase-mcp-server_get_project_url` and `mcp_supabase-mcp-server_get_publishable_keys` to get the project URL and anon key.

Create two files:

**`.env.local`** (gitignored — for local development):
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_APP_ENV=development
```

**`.env.example`** (committed — template for others):
```
# Copy this to .env.local and fill in your values
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_ENV=development
```

Also create `.gitignore` at project root:
```
node_modules/
.env.local
.env*.local
dist/
.DS_Store
*.log
```
</action>
<read_first>
- Use mcp_supabase-mcp-server_get_project_url for the URL
- Use mcp_supabase-mcp-server_get_publishable_keys for the anon key
</read_first>
<acceptance_criteria>
- `.env.local` file exists at `e:\ResQ AI\.env.local` and contains `VITE_SUPABASE_URL=https://` (not empty)
- `.env.example` file exists at `e:\ResQ AI\.env.example`
- `.gitignore` exists at `e:\ResQ AI\.gitignore` and contains `.env.local`
</acceptance_criteria>
</task>

<task id="1.1.7">
<title>Create Supabase client singleton (src/lib/supabase.ts)</title>
<action>
Create the file `src/lib/supabase.ts` (create the `src/lib/` directory first):

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = any // Will be replaced with generated types in a later phase
```

Note: `@supabase/supabase-js` will be installed in Phase 2 with the rest of npm packages.
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Realtime client pattern
</read_first>
<acceptance_criteria>
- `src/lib/supabase.ts` exists at `e:\ResQ AI\src\lib\supabase.ts`
- File contains `createClient(supabaseUrl, supabaseAnonKey`
- File contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` references
- File exports `supabase` named export
</acceptance_criteria>
</task>

## Verification

```bash
# 1. PostGIS enabled
# Run in Supabase SQL editor or via MCP:
# SELECT PostGIS_Version();
# — Should return version string

# 2. Storage bucket exists
# SELECT id, public FROM storage.buckets WHERE id = 'incident-media';
# — Returns 1 row

# 3. Env files
# ls e:\ResQ AI\.env.local  → exists
# ls e:\ResQ AI\.env.example → exists
# grep "VITE_SUPABASE_URL" e:\ResQ AI\.env.local → shows URL

# 4. Supabase client file
# ls e:\ResQ AI\src\lib\supabase.ts → exists
```

## must_haves

- PostGIS extension is active (SELECT PostGIS_Version() returns non-error)
- Supabase project is ACTIVE_HEALTHY
- `incident-media` storage bucket exists with public=true
- `.env.local` contains real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values
- `src/lib/supabase.ts` exports a configured `supabase` client singleton
