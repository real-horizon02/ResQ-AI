# Vercel CI/CD Configuration (Manual Steps Required)

Connect your GitHub repository to Vercel and configure the following:

## Environment Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

- `VITE_SUPABASE_URL`: `https://lblcmzzwddpkynitugkc.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `sb_publishable_jBFqUnVDEEtOwBKBwy_mjA_9Qf0tAv6`
- `VITE_APP_ENV`: `production`

## Framework Preset
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
