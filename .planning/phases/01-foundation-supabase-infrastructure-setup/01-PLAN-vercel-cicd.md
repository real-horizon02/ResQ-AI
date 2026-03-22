---
plan: 01-vercel-cicd
phase: 1
wave: 2
depends_on: [01-supabase-init]
files_modified:
  - .gitignore (modify)
  - vercel.json (new)
  - README.md (new)
requirements_addressed:
  - INFRA-08
autonomous: true
---

# Plan 1.4: Vercel CI/CD + Repo Setup

## Objective

Set up the GitHub repository with proper `.gitignore`, create `vercel.json` configuration for the Vite React app, create a project `README.md`, connect the Vercel project (or document the manual steps), and ensure environment variables are documented for Vercel deployment. This plan runs in Wave 2 parallel to Plan 1.3.

## read_first

- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Environment variables section
- `e:\ResQ AI\.env.example` — From Plan 1.1, already created

## Tasks

<task id="1.4.1">
<title>Create comprehensive .gitignore</title>
<action>
Update/create `e:\ResQ AI\.gitignore` with the following complete content (overwrite what Plan 1.1 created with a more complete version):

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment files (NEVER commit these)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
dist-ssr/
build/
*.local

# Editor / OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
.vscode/settings.json
*.suo
*.user
*.swp
*.swo

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log
logs/

# Test coverage
coverage/
.nyc_output/

# Misc
.cache/
.temp/
*.tgz
```
</action>
<read_first>
- `e:\ResQ AI\.gitignore` — Current state (from Plan 1.1)
</read_first>
<acceptance_criteria>
- `e:\ResQ AI\.gitignore` exists and contains `.env.local`
- File contains `node_modules/`
- File contains `dist/`
- File contains `.vscode/settings.json`
</acceptance_criteria>
</task>

<task id="1.4.2">
<title>Create vercel.json configuration</title>
<action>
Create `e:\ResQ AI\vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "VITE_APP_ENV": "production"
  }
}
```

The `rewrites` rule ensures all routes serve `index.html` (required for React Router SPA). The `sw.js` header ensures the service worker is always fresh (critical for disaster apps — never serve a stale service worker). The security headers add basic XSS/clickjacking protection.
</action>
<read_first>
- Nothing — this is a new file with standard Vite + Vercel config
</read_first>
<acceptance_criteria>
- `e:\ResQ AI\vercel.json` exists
- File is valid JSON (can be parsed without error)
- File contains `"outputDirectory": "dist"`
- File contains `rewrites` array with SPA fallback to `/index.html`
- File contains `sw.js` header with `max-age=0, must-revalidate`
</acceptance_criteria>
</task>

<task id="1.4.3">
<title>Create project README.md</title>
<action>
Create `e:\ResQ AI\README.md`:

```markdown
# ResQ AI — AI-Powered Disaster Management Platform

> Saving lives through AI-driven early warnings and frictionless emergency access

[![Built with Supabase](https://img.shields.io/badge/Built%20with-Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)

ResQ AI is a production-ready, AI-powered disaster prediction and response platform for India — serving citizens, government authorities, NGOs, and volunteers with real-time alerts, live disaster maps, SOS coordination, and community-driven incident reporting.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Maps | Leaflet.js + OpenStreetMap |
| Backend | Supabase (PostgreSQL + PostGIS + Realtime + Auth + Storage) |
| AI/ML | FastAPI + XGBoost + Prophet (Docker) |
| Notifications | Twilio WhatsApp + SMS |
| Deployment | Vercel (frontend) + Railway (ML service) |

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Twilio account (for notifications)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in your Supabase URL and anon key in `.env.local`
5. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
e:\ResQ AI\
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route-level page components
│   ├── lib/             # Utilities (supabase client, etc.)
│   ├── stores/          # Zustand state stores
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── public/              # Static assets + PWA manifest
├── .planning/           # GSD project planning documents
└── vercel.json          # Vercel deployment config
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_APP_ENV` | `development` or `production` |

## Deployment

Frontend deploys automatically to Vercel on push to `main` branch.

Set environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

## License

MIT
```
</action>
<read_first>
- Nothing — this is a new file
</read_first>
<acceptance_criteria>
- `e:\ResQ AI\README.md` exists
- File contains `# ResQ AI`
- File contains `VITE_SUPABASE_URL`
- File contains `npm run dev`
</acceptance_criteria>
</task>

<task id="1.4.4">
<title>Document Vercel deployment steps</title>
<action>
Create `.planning/phases/01-foundation-supabase-infrastructure-setup/VERCEL-SETUP.md` with step-by-step Vercel setup instructions (manual steps the developer must perform):

```markdown
# Vercel Setup Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Push this repo to GitHub first

## Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "chore: initial project setup"
git remote add origin https://github.com/YOUR_USERNAME/resq-ai.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `resq-ai` repo
4. Framework preset: **Vite** (auto-detected)
5. Root directory: `./` (leave default)
6. Build command: `npm run build` (auto from vercel.json)
7. Output directory: `dist` (auto from vercel.json)

### 3. Set Environment Variables in Vercel
In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-ref.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` | Production, Preview, Development |
| `VITE_APP_ENV` | `production` | Production only |

### 4. Deploy
Click "Deploy". Vercel will build and deploy automatically.

### Preview Deployments
Every pull request gets an automatic preview URL — useful for testing before merging.

### Custom Domain (Optional)
Vercel Dashboard → Project → Settings → Domains → Add domain.

## CI/CD Flow
main branch push → Vercel auto-deploy → Production URL

## Notes
- `VITE_` prefix is REQUIRED for Vite to expose variables to client code
- Never commit `.env.local` — it's in .gitignore
- Service worker (`sw.js`) has `max-age=0` cache header — forced fresh on every deploy
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Vercel section
</read_first>
<acceptance_criteria>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/VERCEL-SETUP.md` exists
- File contains `VITE_SUPABASE_URL`
- File contains `VITE_SUPABASE_ANON_KEY`
- File contains step-by-step numbered instructions
</acceptance_criteria>
</task>

<task id="1.4.5">
<title>Initial git commit of all Phase 1 files</title>
<action>
Stage and commit all new files created in Phase 1:

```bash
# Stage all new files
git -C "e:\ResQ AI" add .gitignore vercel.json README.md .env.example src/ .planning/

# Commit
git -C "e:\ResQ AI" commit -m "feat(setup): foundation infrastructure - supabase schema, vercel config, env setup"
```

Note: `.env.local` must NOT be staged (it's gitignored). Verify with `git status` before committing.
</action>
<read_first>
- `e:\ResQ AI\.gitignore` — confirm .env.local is listed
</read_first>
<acceptance_criteria>
- `git -C "e:\ResQ AI" log --oneline -3` shows at least 3 commits (init, docs, this feat commit)
- `git -C "e:\ResQ AI" status` shows clean working tree (no untracked non-gitignored files)
- `git -C "e:\ResQ AI" show --stat HEAD` includes vercel.json, README.md in commit
- `.env.local` does NOT appear in `git show --stat HEAD` (it must not be committed)
</acceptance_criteria>
</task>

## Verification

```bash
# 1. vercel.json is valid JSON
node -e "require('./vercel.json'); console.log('valid')"

# 2. README exists
# type e:\ResQ AI\README.md  → shows content

# 3. .gitignore excludes .env.local
# git -C "e:\ResQ AI" check-ignore .env.local → should print .env.local (means it IS ignored)

# 4. Vercel CLI test (optional, if vercel CLI installed)
# npx vercel --prebuilt --prod (requires vercel login)
```

## must_haves

- `vercel.json` exists with SPA rewrites rule (`"destination": "/index.html"`)
- `vercel.json` has `sw.js` cache header (`max-age=0, must-revalidate`)
- `README.md` exists with valid setup instructions
- `.gitignore` correctly excludes `.env.local` and `node_modules/`
- All Phase 1 files committed to git
- `VERCEL-SETUP.md` documents manual Vercel connection steps
