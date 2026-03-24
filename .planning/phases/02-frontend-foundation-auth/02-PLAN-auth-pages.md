---
plan: 02-auth-pages
phase: 2
wave: 2
depends_on: [02-design-system]
files_modified:
  - src/pages/Auth.tsx
  - src/pages/ProfileSetup.tsx
  - src/components/auth/AuthForm.tsx
requirements_addressed:
  - AUTH-01
  - AUTH-02
  - AUTH-04
autonomous: true
---

# Plan 2.3: Auth Pages

Implement the authentication flows using Supabase: Phone OTP (primary) and Magic Link (secondary).

## read_first
- `.planning/phases/01-foundation-supabase-infrastructure-setup/AUTH-CONFIG.md` — Supabase Auth config.
- `.planning/phases/02-frontend-foundation-auth/02-RESEARCH.md` — Auth strategy.

## Tasks
1. Create `src/pages/Auth.tsx` with a clean, emergency-themed login screen.
2. Build `src/components/auth/AuthForm.tsx` to handle Phone and Email inputs.
3. Integrate Supabase `auth.signInWithOtp` for both channels.
4. Create `src/pages/ProfileSetup.tsx` for new users to enter their Full Name.
5. Implement `src/hooks/useAuth.ts` using Zustand to manage global user state.
