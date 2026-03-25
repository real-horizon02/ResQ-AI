---
wave: 5
depends_on: [01-PLAN-design-system, 02-PLAN-global-components]
files_modified:
  - src/pages/Auth.tsx
  - src/pages/Profile.tsx
  - src/components/auth/AuthHero.tsx
  - src/components/auth/SignInForm.tsx
  - src/components/auth/RegisterForm.tsx
  - src/components/profile/ProfileStep1.tsx
  - src/components/profile/ProfileStep2.tsx
  - src/components/profile/ProfileStep3.tsx
autonomous: true
requirements_addressed: [UI-06, UI-07]
---

# Plan 09: Auth & Profile Pages

## Objective
Build the `/auth` (split-screen sign in / register) and `/profile` (3-step onboarding) pages. Auth stores in localStorage via the `useAuthStore`, redirects on success with a toast.

## must_haves
- [ ] Auth page: full-viewport split (50% brand panel, 50% form panel)
- [ ] Brand panel: animated SVG radar sweep, logo, Playfair tagline
- [ ] Sign In tab / Register tab with sliding pill indicator
- [ ] All inputs: underline-only, floating label, cyan center-outward underline on focus
- [ ] Register: 3-pill role selector (Citizen/Volunteer/Admin) with cyan glow on select
- [ ] Auth stores in localStorage (useAuthStore), redirects to `/`, shows toast
- [ ] Profile: 3-step form with same progress bar as SOS, circular avatar upload, Indian state select, skill chips toggle (gold), availability pill switch
- [ ] Step 3 review + red→green morphing submit button

## Tasks

### Task 1: Auth page — brand panel + form toggle

<read_first>
- src/store/useAuthStore.ts
- src/index.css (input-underline, glass-card)
- src/components/ui/Toast.tsx (toast import)
</read_first>

<action>
Create `src/pages/Auth.tsx` as a split-screen layout:

Left panel (50%, `--bg`):
- Centered content column
- Logo: flex row — "ResQ" DM Sans Bold 32px + "AI" Playfair Italic `--accent-red` 32px + SVG shield icon
- Tagline: "Coordinating response." Playfair Italic 48px `--text-primary`
- Sub: "Every second counts." DM Sans 18px `--text-muted`
- Animated SVG radar: 200px container, concentric circles (opacity 0.1-0.3), rotating sweep arm (accent-red, `animate-radar`)
- Bottom: "By Antigravity AI & Team" label-caps

Right panel (50%, `--bg-surface`):
- Vertically centered glass card (560px max-width)
- Toggle tabs: "Sign In" / "Register" — with absolute sliding pill indicator
  - Pill: 2px height bar at bottom of active tab, `--accent-cyan`, transitions left/right
- `<AnimatePresence>` switching between `<SignInForm>` and `<RegisterForm>`

Create `src/components/auth/SignInForm.tsx`:
- Email + Password underline inputs with floating labels
  - Floating label: absolute positioned, transitions from inside the input to above it on focus/typed
  - `--accent-cyan` underline animates from center outward: `scaleX(0 → 1)` from center, `transform-origin: center`
- Full-width `[Sign In →]` button (btn-sos style but with DM Sans)
- Divider: "or" text
- Magic Link toggle: text link "Use Magic Link →", click reveals email-only input + `[Send Magic Link]` button
- On submit: call `useAuthStore.login(name, email, role)`, show `toast.success('Welcome back!')`, navigate to `/`

Create `src/components/auth/RegisterForm.tsx`:
- Name / Email / Phone / Password underline inputs with floating labels
- Role selector: 3 pill cards in a row
  - `Citizen` (cyan icon: user) / `Volunteer` (orange icon: shield) / `Admin` (red icon: settings)
  - Selected card: `border: 1px solid var(--accent-cyan)`, `box-shadow: 0 0 16px rgba(0,212,255,0.2)`, scale(1.03)
- Full-width `[Create Account →]` button
- On submit: `useAuthStore.login`, `toast.success('Account created!')`, navigate to `/`

Floating label implementation:
```css
/* Add to index.css */
.input-floating-wrapper { position: relative; padding-top: 20px; }
.input-floating-label { position: absolute; top: 20px; left: 0; font-family: 'DM Sans'; font-size: 16px; color: var(--text-muted); pointer-events: none; transition: all 0.2s ease; }
.input-floating-wrapper:focus-within .input-floating-label,
.input-floating-wrapper.has-value .input-floating-label { top: 0; font-size: 11px; letter-spacing: 0.1em; color: var(--accent-cyan); }
.input-underline-focus { position: absolute; bottom: 0; left: 50%; right: 50%; height: 1px; background: var(--accent-cyan); transition: left 0.3s ease, right 0.3s ease; }
.input-underline-wrapper:focus-within .input-underline-focus { left: 0; right: 0; }
```
</action>

<acceptance_criteria>
- `src/pages/Auth.tsx` is a 50/50 split-screen viewport layout
- File contains animated SVG radar with `animate-radar` class
- `src/components/auth/SignInForm.tsx` contains floating label logic
- `src/components/auth/SignInForm.tsx` calls `useAuthStore` on submit
- `src/components/auth/RegisterForm.tsx` contains 3-pill role selector
- Role selector selected state has `--accent-cyan` glow border
- Underline input focus triggers center-outward animation
</acceptance_criteria>

---

### Task 2: Profile page — 3-step onboarding

<read_first>
- src/components/sos/StepIndicator.tsx (reuse same component)
- src/index.css
- src/components/ui/Toast.tsx
</read_first>

<action>
Create `src/pages/Profile.tsx`:
- Hero strip: `"your"` DM Sans 300 `clamp(40px,5vw,80px)` + `"profile"` Playfair Italic `clamp(40px,5vw,80px)` on same line
- Reuse `<StepIndicator currentStep={step} totalSteps={3} />`
- step 0 → `<ProfileStep1>`, step 1 → `<ProfileStep2>`, step 2 → `<ProfileStep3>`
- `AnimatePresence` with slide transitions (same as SOS form)

Create `src/components/profile/ProfileStep1.tsx`:
- Avatar upload: circular dashed border 100px, clicking opens file input, shows preview image
- Name / Age / Phone inputs (input-underline with floating label)
- City + State: two stylized select elements
  - Custom styled `<select>` matching dark theme (bg: var(--bg-surface), color: var(--text-primary), border: none, border-bottom: 1px solid var(--glass-border))
  - State options: all 28 Indian states + 8 UTs (Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal, Delhi, J&K, Ladakh, Puducherry, Chandigarh)
- "Next →" button enabled when name + state filled

Create `src/components/profile/ProfileStep2.tsx`:
- Skill chips grid (3 per row): `['First Aid', 'Firefighting', 'Search & Rescue', 'Swimming', 'Medical', 'HAM Radio', 'Logistics', 'Counseling', 'Driving']`
  - Selected chip: `background: rgba(200,169,110,0.15)`, border: `1px solid var(--accent-gold)`, color: `var(--accent-gold)`
  - Multi-select allowed
- Certification upload: card with dashed `--glass-border`, `<input type="file">`, shows filename on upload
- Availability toggle: large pill switch 80px wide
  - Track: 80px×32px, border-radius 999px
  - Available=green (`--accent-green`), Unavailable=gray (`--text-dim`)
  - Sliding thumb: 26px circle, transitions left/right 0.3s ease
- "← Back" + "Next →" buttons

Create `src/components/profile/ProfileStep3.tsx`:
- Summary glass card showing all entered info from steps 1+2
- Full-width submit button:
  - Initial: `--accent-red` background, "Complete Profile →" text
  - On click: loading spinner 1.5s then morphs: background transitions to `--accent-green`, text changes to "✓ Profile Complete!"
  - Use `useState: 'idle' | 'loading' | 'success'`
  - On success: `toast.success('Profile saved!')` + navigate to `/`
- "← Back" button
</action>

<acceptance_criteria>
- `src/pages/Profile.tsx` renders 3 steps with `AnimatePresence` and `StepIndicator`
- `src/components/profile/ProfileStep1.tsx` has circular avatar upload with preview
- `src/components/profile/ProfileStep1.tsx` has all Indian states in `<select>`
- `src/components/profile/ProfileStep2.tsx` has 9 skill chip options with gold selected state
- `src/components/profile/ProfileStep2.tsx` has availability pill switch with sliding thumb
- `src/components/profile/ProfileStep3.tsx` submit button morphs red→green on success
</acceptance_criteria>

## Verification

```bash
ls src/components/auth/
ls src/components/profile/
grep "useAuthStore" src/components/auth/SignInForm.tsx
grep "Playfair Display\|font-playfair" src/pages/Auth.tsx
grep "Andhra Pradesh" src/components/profile/ProfileStep1.tsx
grep "idle.*loading.*success\|morphs" src/components/profile/ProfileStep3.tsx
```
