---
wave: 4
depends_on: [01-PLAN-design-system, 02-PLAN-global-components, 03-PLAN-mock-data-store]
files_modified:
  - src/pages/Volunteer.tsx
  - src/components/volunteer/VolunteerTaskCard.tsx
  - src/components/volunteer/VolunteerProfile.tsx
  - src/components/volunteer/VolunteerFilter.tsx
  - src/components/volunteer/MiniMap.tsx
autonomous: true
requirements_addressed: [UI-04]
---

# Plan 07: Volunteer Hub Page

## Objective
Build the `/volunteer` page: a two-column layout with a task feed (65%) and volunteer profile panel (35%). All task cards are interactive — Accept / Complete / Escalate update card state.

## must_haves
- [ ] 25vh hero strip: "volunteer" Playfair + "hub" DM Sans 300
- [ ] Filter tabs: Nearby / My Skills / Critical Only / All — gold underline on active
- [ ] 6 task cards referencing mock incidents, staggered reveal on scroll
- [ ] Task card: severity badge, type icon, location mono, skill chips, 3 action buttons
- [ ] Accept → card gets green left border + status badge changes
- [ ] Complete → card marked resolved (reduced opacity, line through)
- [ ] Escalate → badge changes to orange "Escalated"
- [ ] Profile panel: avatar, name, availability toggle, skill badges, stats, mini Leaflet map

## Tasks

### Task 1: Volunteer task cards

<read_first>
- src/data/mockData.ts (INCIDENTS, VOLUNTEERS, Incident, VolunteerSkill types)
- src/store/useAppStore.ts
- src/index.css (glass-card, badge classes)
</read_first>

<action>
Create `src/components/volunteer/VolunteerTaskCard.tsx`:

Task card state: `idle | accepted | completed | escalated`

Card structure:
- Left: 4px border by severity color
- Header: incident title + severity badge (right)
- Sub-line: type emoji + location in JetBrains Mono 12px
- Distance: "~X km away" JetBrains Mono 11px `--text-muted`
- Skills row: small pill tags, `--accent-gold` bg at 15% opacity
- Time ago: DM Sans 12px `--text-dim`
- 3 buttons row:
  - `[Accept →]` — `--accent-cyan` outline → on click → fill `--accent-cyan`, card left border turns green
  - `[Complete ✓]` — `--accent-green` outline → on click → fills, marks card done
  - `[Escalate ↑]` — `--accent-orange` outline → on click → fills orange, badge changes

Each button: small, padding 6px 14px, border-radius 6px, DM Sans 12px fontWeight 600
Animation on state change: Framer Motion `layout` prop on card, `AnimatePresence` on status badges

Props needed: `incident: Incident`, `volunteer: Volunteer` (for skill matching), `distance: string`
</action>

<acceptance_criteria>
- `src/components/volunteer/VolunteerTaskCard.tsx` contains 3 action button state handlers
- File contains `accepted | completed | escalated | idle` state type
- Accept button changes left border to `--accent-green`
- Completed card has visual differentiation (opacity or strikethrough)
- Escalated state changes badge to orange
- File contains JetBrains Mono for location display
</acceptance_criteria>

---

### Task 2: Volunteer profile panel

<read_first>
- src/data/mockData.ts (VOLUNTEERS array, first volunteer as current user)
- src/store/useAppStore.ts
</read_first>

<action>
Create `src/components/volunteer/VolunteerProfile.tsx`:

Use `VOLUNTEERS[0]` as the current logged-in volunteer profile.

Profile card structure (glass-card-elevated, padding 24px):
- Avatar: circular 80px div with initials, `--accent-cyan` background
- Name DM Sans 500 18px + city/state DM Sans 14px `--text-muted`
- Availability toggle: pill switch (green=Available, gray=Unavailable)
  - Left half: green dot + "Available", right half: gray + "Unavailable"
  - CSS sliding thumb transition 0.3s, clicking toggles state
- Stats row: 3 metrics in small glass cards
  - Tasks: volunteer.tasksCompleted
  - Rate: `${volunteer.responseRate}%`
  - Rating: `${volunteer.rating}★`
  - Numbers in Playfair 28px, labels in label-caps 10px
- Skills: small `--accent-gold` badge pills (bg 15% opacity)

Below profile card: "Nearby Incidents" label-caps + count badge

Mini map placeholder (lazy load Leaflet):
- 200px height glass-card
- If Leaflet loads: MapContainer center=volunteer city coords, zoom=11, dark tiles, Circle 5km radius
- If not: just a dark placeholder with coordinates text
</action>

<acceptance_criteria>
- `src/components/volunteer/VolunteerProfile.tsx` renders stats from `VOLUNTEERS[0]`
- File contains availability toggle with green/gray states and sliding thumb
- File contains skill badge pills
- Profile renders without crashing when `VOLUNTEERS[0]` is the data source
</acceptance_criteria>

---

### Task 3: Filter tabs

<read_first>
- src/index.css (label-caps, accent-gold)
</read_first>

<action>
Create `src/components/volunteer/VolunteerFilter.tsx`:
```tsx
interface Props { active: string; onChange: (tab: string) => void; }
const TABS = ['Nearby (5km)', 'My Skills', 'Critical Only', 'All'];

export function VolunteerFilter({ active, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
      {TABS.map(tab => (
        <button key={tab} onClick={() => onChange(tab)}
          style={{
            padding: '10px 20px', background: 'none', border: 'none', cursor: 'none',
            fontFamily: 'DM Sans', fontSize: 13, fontWeight: active === tab ? 600 : 400,
            color: active === tab ? 'var(--text-primary)' : 'var(--text-muted)',
            position: 'relative',
          }}
        >
          {tab}
          {active === tab && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
              background: 'var(--accent-gold)',
              animation: 'line-draw 0.3s ease forwards',
            }} />
          )}
        </button>
      ))}
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/volunteer/VolunteerFilter.tsx` contains `TABS` array with all 4 options
- Active tab shows `--accent-gold` underline bar
- Tab click calls `onChange` with new tab value
</acceptance_criteria>

---

### Task 4: Assemble Volunteer page

<read_first>
- All volunteer components just created
- src/data/mockData.ts
- src/hooks/useStaggeredReveal.ts
</read_first>

<action>
Create/replace `src/pages/Volunteer.tsx`:
- 25vh hero strip: `"volunteer"` Playfair Italic `clamp(48px,7vw,100px)` + `"hub"` DM Sans 300 `clamp(36px,5vw,80px)` below it
- Two-column flex layout below hero: 65% left (task feed) + 35% right (profile, sticky)
- Left column:
  - `<VolunteerFilter>` with active tab state
  - Staggered task cards (`useStaggeredReveal`) — map 6 incidents with mock distances
  - When "Critical Only" tab active: filter to severity === 'critical' incidents
  - When "Nearby (5km)" tab: show first 3 incidents (simulates nearby)
- Right column (position: sticky, top: 100px):
  - `<VolunteerProfile />`
</action>

<acceptance_criteria>
- `src/pages/Volunteer.tsx` renders hero strip with Playfair "volunteer"
- File renders `<VolunteerFilter>` and `<VolunteerProfile>`
- File renders task cards using `useStaggeredReveal`
- Filter tabs correctly change which incidents are shown
- Right column is sticky
</acceptance_criteria>

## Verification

```bash
ls src/components/volunteer/
grep "accepted\|completed\|escalated" src/components/volunteer/VolunteerTaskCard.tsx
grep "useStaggeredReveal" src/pages/Volunteer.tsx
grep "sticky" src/pages/Volunteer.tsx
```
