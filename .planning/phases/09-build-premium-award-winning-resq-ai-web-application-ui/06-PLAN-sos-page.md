---
wave: 4
depends_on: [01-PLAN-design-system, 02-PLAN-global-components, 03-PLAN-mock-data-store]
files_modified:
  - src/pages/SOS.tsx
  - src/components/sos/SOSHero.tsx
  - src/components/sos/StepIndicator.tsx
  - src/components/sos/Step1IncidentType.tsx
  - src/components/sos/Step2Location.tsx
  - src/components/sos/Step3Contact.tsx
  - src/components/sos/SOSSuccess.tsx
autonomous: true
requirements_addressed: [UI-03]
---

# Plan 06: SOS Report Page — 3-Step Emergency Form

## Objective
Build the `/sos` page: a 3-step emergency report form with animated progress bar, geolocation, offline detection, and a cinematic success screen. Every interaction is optimized for high-stress emergency conditions.

## must_haves
- [ ] 3-step form with animated `--accent-red` progress bar and gold step dots
- [ ] Step transitions: slide left (next) / right (back) with Framer Motion
- [ ] Step 1: 3×2 incident type icon grid + 4 severity pills
- [ ] Step 2: Geolocation button writes lat/lng in JetBrains Mono with green ✓
- [ ] Step 3: Photo drag-and-drop upload zone with preview + submit
- [ ] Submit shows loading spinner then triggers success screen
- [ ] Success screen: animated SVG checkmark, report ID `#RSQ-2024-XXXXX`, countdown
- [ ] Offline banner shown if not online

## Tasks

### Task 1: SOS Page Hero + Step Indicator

<read_first>
- src/index.css (check btn-sos, label-caps, glass-card)
</read_first>

<action>
Create `src/components/sos/SOSHero.tsx`:
```tsx
export function SOSHero() {
  return (
    <div style={{ paddingTop: 100, paddingBottom: 20, paddingLeft: 'clamp(24px, 8vw, 96px)', background: 'var(--bg)' }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(56px,8vw,100px)', color: 'var(--accent-red)', margin: 0, lineHeight: 1 }}>emergency</h1>
      <p style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 'clamp(36px,5vw,80px)', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>report</p>
    </div>
  );
}
```

Create `src/components/sos/StepIndicator.tsx`:
```tsx
interface Props { currentStep: number; totalSteps: number; }
const STEP_LABELS = ['Incident Type', 'Location & Details', 'Contact & Submit'];

export function StepIndicator({ currentStep, totalSteps }: Props) {
  return (
    <div style={{ padding: '24px clamp(24px,8vw,96px)', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, maxWidth: 600 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < totalSteps - 1 ? 1 : 0 }}>
            {/* Step dot */}
            <div style={{
              width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
              background: i <= currentStep ? 'var(--accent-gold)' : 'var(--text-dim)',
              boxShadow: i <= currentStep ? '0 0 12px rgba(200,169,110,0.5)' : 'none',
              transition: 'all 0.3s ease',
            }} />
            {i < totalSteps - 1 && (
              <div style={{ flex: 1, height: 2, background: 'var(--text-dim)', marginLeft: 0, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--accent-red)',
                  transform: `scaleX(${i < currentStep ? 1 : 0})`,
                  transformOrigin: 'left',
                  transition: 'transform 0.4s ease',
                }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{ marginTop: 12, fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-muted)' }}>
        Step {currentStep + 1} of {totalSteps} — {STEP_LABELS[currentStep]}
      </p>
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/sos/SOSHero.tsx` contains Playfair "emergency" in `--accent-red`
- `src/components/sos/StepIndicator.tsx` contains progress bar with `scaleX` transform
- `StepIndicator` uses `--accent-gold` for completed dots
- `StepIndicator` uses `--accent-red` for progress bar fill
</acceptance_criteria>

---

### Task 2: Step 1 — Incident Type Selection

<read_first>
- src/index.css (glass-card)
</read_first>

<action>
Create `src/components/sos/Step1IncidentType.tsx`:
- 3×2 glass card grid of incident types: Flood 🌊, Earthquake 🏚️, Fire 🔥, Medical 🏥, Landslide ⛰️, Cyclone 🌀
- Selected card: scale(1.05), `--accent-gold` border (1px solid), bg changes to `rgba(200,169,110,0.08)`
- Below grid: row of 4 severity pill toggles: Critical / High / Medium / Low
  - Critical: red, High: orange, Medium: amber, Low: gray
  - Selected pill: filled background, border matching color
- "Next →" button at bottom (only enabled when both type AND severity selected)

Props: `onNext: (type: string, severity: string) => void`
</action>

<acceptance_criteria>
- `src/components/sos/Step1IncidentType.tsx` contains all 6 incident type cards
- File contains severity pill selection (Critical/High/Medium/Low)
- Next button only enabled when both `selectedType` and `selectedSeverity` are set
- Selected card has `scale(1.05)` and gold border
</acceptance_criteria>

---

### Task 3: Step 2 — Location & Details

<read_first>
- src/index.css (input-underline, font-mono-data classes)
</read_first>

<action>
Create `src/components/sos/Step2Location.tsx`:
- "📍 Auto-Detect Location" button: `btn-outline-cyan`, on click calls `navigator.geolocation.getCurrentPosition`:
  - On success: show lat/lng in JetBrains Mono inside a glass card with green ✓ badge
  - On error: show "Location unavailable — enter manually"
- Manual address textarea: `input-underline` style, floating label pattern, resizes auto
- Description textarea: same style, min-height 80px
- People affected: numeric input with + and - buttons on sides, min 1, max 10000
- "← Back" + "Next →" buttons

`Props: onNext: (data: LocationData) => void; onBack: () => void`
</action>

<acceptance_criteria>
- `src/components/sos/Step2Location.tsx` contains `navigator.geolocation.getCurrentPosition`
- File contains JetBrains Mono display of coordinates
- File contains green ✓ confirmation badge after location success
- File contains +/- people affected counter
- File contains floating label on address input
</acceptance_criteria>

---

### Task 4: Step 3 — Contact & Submit

<read_first>
- src/index.css
</read_first>

<action>
Create `src/components/sos/Step3Contact.tsx`:
- Name + phone: `input-underline` with floating labels
- Photo upload drag-drop zone:
  - Dashed `var(--glass-border)` border, 2px, border-radius 12px, padding 32px
  - On drag hover: border changes to `--accent-cyan`
  - After drop: show thumbnail preview + remove ✕ button
  - Uses `ondragover`, `ondrop` events + `<input type="file" accept="image/*">`
- Full-width submit button: `btn-sos` style, "🚨 SEND EMERGENCY REPORT"
  - On click: shows loading spinner (inline SVG rotating circle) for 2s
  - After 2s: calls `onSuccess()`
- "← Back" button

`Props: onSuccess: () => void; onBack: () => void`
</action>

<acceptance_criteria>
- `src/components/sos/Step3Contact.tsx` contains drag-drop upload zone
- File contains `ondragover` and `ondrop` event handlers
- File contains thumbnail preview after file drop
- File contains 2s loading spinner before `onSuccess`
- File contains "SEND EMERGENCY REPORT" button text
</acceptance_criteria>

---

### Task 5: Success screen

<read_first>
- src/index.css (checkmark-draw keyframe)
</read_first>

<action>
Create `src/components/sos/SOSSuccess.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function generateReportId() {
  return `RSQ-2024-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function SOSSuccess() {
  const [countdown, setCountdown] = useState(8);
  const [reportId] = useState(generateReportId);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      {/* Animated checkmark SVG */}
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent-green)" strokeWidth="4"
          style={{ strokeDasharray: 290, strokeDashoffset: 290, animation: 'checkmark-draw 0.8s ease forwards' }} />
        <polyline points="28,52 44,68 72,36" fill="none" stroke="var(--accent-green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 80, strokeDashoffset: 80, animation: 'checkmark-draw 0.6s ease 0.6s forwards' }} />
      </svg>
      <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(40px,6vw,64px)', color: 'var(--text-primary)', margin: 0, textAlign: 'center' }}>Report Received</h1>
      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 16, color: 'var(--accent-cyan)' }}>{reportId}</p>
      <p style={{ fontFamily: 'DM Sans', fontSize: 18, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 400 }}>Emergency services have been notified. Stay safe.</p>
      <div className="glass-card" style={{ padding: '16px 32px', textAlign: 'center' }}>
        <p className="label-caps">Estimated First Response</p>
        <p style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 36, color: 'var(--accent-red)', margin: '4px 0 0' }}>
          {countdown > 0 ? `${countdown} min` : '< 1 min'}
        </p>
      </div>
      <button onClick={() => navigate('/')} style={{ marginTop: 16, fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Return to Home
      </button>
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/sos/SOSSuccess.tsx` contains SVG animated checkmark with `checkmark-draw` animation
- File contains `generateReportId` function starting with `RSQ-2024-`
- File contains countdown timer with `setInterval`
- File contains `navigate('/')` return home button
</acceptance_criteria>

---

### Task 6: Assemble SOS page

<read_first>
- All SOS components just created
</read_first>

<action>
Create/replace `src/pages/SOS.tsx`:
```tsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { SOSHero } from '../components/sos/SOSHero';
import { StepIndicator } from '../components/sos/StepIndicator';
import { Step1IncidentType } from '../components/sos/Step1IncidentType';
import { Step2Location } from '../components/sos/Step2Location';
import { Step3Contact } from '../components/sos/Step3Contact';
import { SOSSuccess } from '../components/sos/SOSSuccess';

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2 } }),
};

export default function SOSPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const goNext = (data: any) => { setDirection(1); setFormData((d: any) => ({ ...d, ...data })); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  if (success) return <SOSSuccess />;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <SOSHero />
      <StepIndicator currentStep={step} totalSteps={3} />
      <div style={{ padding: '32px clamp(24px,8vw,96px)', maxWidth: 720 }}>
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <Step1IncidentType onNext={(type, severity) => goNext({ type, severity })} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <Step2Location onNext={(data) => goNext(data)} onBack={goBack} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <Step3Contact onSuccess={() => setSuccess(true)} onBack={goBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/pages/SOS.tsx` contains 3 step components in `AnimatePresence`
- File contains `slideVariants` with directional x offset
- File contains `direction` state (1 or -1) for slide direction
- File shows `SOSSuccess` when `success === true`
- `StepIndicator` is passed `currentStep={step}`
</acceptance_criteria>

## Verification

```bash
ls src/components/sos/
grep "navigator.geolocation" src/components/sos/Step2Location.tsx
grep "RSQ-2024-" src/components/sos/SOSSuccess.tsx
grep "ondrop\|onDrop" src/components/sos/Step3Contact.tsx
```
