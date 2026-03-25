---
wave: 5
depends_on: [01-PLAN-design-system, 02-PLAN-global-components, 03-PLAN-mock-data-store]
files_modified:
  - src/pages/Admin.tsx
  - src/components/admin/KPICard.tsx
  - src/components/admin/IncidentTable.tsx
  - src/components/admin/LiveFeed.tsx
  - src/components/admin/DonutChart.tsx
  - src/components/admin/ResourceCharts.tsx
autonomous: true
requirements_addressed: [UI-05]
---

# Plan 08: Admin Dashboard Page

## Objective
Build the `/admin` command center with 4 KPI cards (number counters), incident management table (10 rows, status transitions), live activity feed (auto-prepends every 5s), and two animated SVG donut charts.

## must_haves
- [ ] 20vh hero strip: "command" Playfair + "center" DM Sans + green `SYSTEM OPERATIONAL` status bar
- [ ] 4 KPI glass cards with Playfair 56px numbers, number counter animation, trend arrows
- [ ] Incident table: 10 rows, Verify/Dispatch/Resolve buttons transition status badges with color-morph
- [ ] Live feed: new item prepends every 5s via setInterval, max 8 items, slide-in animation
- [ ] Two SVG donut charts: Volunteers (Deployed/Available/Offline) + Relief Camps — draw on mount

## Tasks

### Task 1: KPI cards with number counter

<read_first>
- src/hooks/useNumberCounter.ts
- src/store/useAppStore.ts
- src/index.css (glass-card, label-caps)
</read_first>

<action>
Create `src/components/admin/KPICard.tsx`:
```tsx
import { useNumberCounter } from '../../hooks/useNumberCounter';

interface Props { label: string; value: number; unit?: string; trend: '+' | '-'; trendValue: string; color?: string; }

export function KPICard({ label, value, unit = '', trend, trendValue, color = 'var(--text-primary)' }: Props) {
  const { value: count, ref } = useNumberCounter(value);
  return (
    <div className="glass-card" style={{ padding: '24px', flex: 1 }}>
      <p className="label-caps" style={{ marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <span ref={ref as any} style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(32px, 4vw, 56px)', color, lineHeight: 1 }}>
          {count}{unit}
        </span>
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: trend === '+' ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 14, fontWeight: 700 }}>
          {trend === '+' ? '↑' : '↓'} {trendValue}
        </span>
        <span style={{ fontSize: 12, fontFamily: 'DM Sans', color: 'var(--text-dim)' }}>vs yesterday</span>
      </div>
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/admin/KPICard.tsx` uses `useNumberCounter` hook
- File contains Playfair 56px number display
- File contains trend arrow (↑ green / ↓ red)
- Number animates from 0 to target on scroll into view
</acceptance_criteria>

---

### Task 2: Incident table with status transitions

<read_first>
- src/data/mockData.ts (INCIDENTS, IncidentStatus type)
- src/store/useAppStore.ts (updateIncidentStatus)
- src/index.css (badge classes)
</read_first>

<action>
Create `src/components/admin/IncidentTable.tsx`:
- Glassmorphic table surface (glass-card, overflow hidden, rounded-glass)
- Table header: `[ INCIDENT QUEUE ]` label-caps + filter tabs (All/Pending/Critical/Resolved)
- Active filter tab: `--accent-gold` underline
- Table columns: ID (JetBrains Mono) / Type / Location / Severity / Status / Reported / Actions
- Severity cells: use badge classes (badge-critical, badge-high, badge-medium, badge-low)
- Status cells: animated badge — Pending (amber/yellow), Verified (cyan), Dispatched (orange), Resolved (green)
  - Status badge transitions: when status changes, badge color morphs via CSS transition on background/color
- Row actions (3 buttons):
  - `[Verify]` → calls `updateIncidentStatus(id, 'verified')` — only shown when status is 'pending'
  - `[Dispatch]` → calls `updateIncidentStatus(id, 'dispatched')` — only shown when status is 'verified'
  - `[Resolve]` → calls `updateIncidentStatus(id, 'resolved')` — shown for dispatched
- Row hover: `background: rgba(255,255,255,0.02)`
- Table head: `--text-muted` label-caps 10px
- Render all 10 incidents, filtered by activeFilter tab
- New rows that appear (status change) animate in with `slide-up` class: `animation: slide-up 0.3s ease`
</action>

<acceptance_criteria>
- `src/components/admin/IncidentTable.tsx` calls `updateIncidentStatus` from store on button click
- File contains `badge-critical badge-high badge-medium badge-low` badge classes
- File contains filter tabs (All/Pending/Critical/Resolved)
- File renders IDs in JetBrains Mono font
- Status badge color changes are CSS-transitioned
- Verify button only shows on `pending` status
- Dispatch button only shows on `verified` status
- Resolve button only shows on `dispatched` status
</acceptance_criteria>

---

### Task 3: Live activity feed

<read_first>
- src/store/useAppStore.ts (prependActivity, activityFeed)
- src/data/mockData.ts (ACTIVITY_FEED_TEMPLATES)
</read_first>

<action>
Create `src/components/admin/LiveFeed.tsx`:
- Header: `[ LIVE FEED ]` label-caps + blinking `● LIVE` badge (animate-pulse-dot)
- Scrollable list, max 8 items visible
- Display `activityFeed` from useAppStore
- Each item: JetBrains Mono 13px, `--text-primary`, timestamp right-aligned in `--text-dim`
- Item slides in from top with Framer Motion `AnimatePresence` + `y: -20 → 0`
- `useEffect` with `setInterval(5000)`: on each tick, pick a random template from `ACTIVITY_FEED_TEMPLATES` and call `prependActivity` with a new item
- Stop adding when feed already has 8+ items (to prevent infinite growth), OR reset and continue

```tsx
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { ACTIVITY_FEED_TEMPLATES } from '../../data/mockData';

export function LiveFeed() {
  const { activityFeed, prependActivity } = useAppStore();
  
  useEffect(() => {
    let idx = 0;
    const t = setInterval(() => {
      const template = ACTIVITY_FEED_TEMPLATES[idx % ACTIVITY_FEED_TEMPLATES.length];
      prependActivity({ ...template, id: `feed-${Date.now()}`, timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) });
      idx++;
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="label-caps">[ LIVE FEED ]</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--accent-red)' }}>
          <span className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)', display: 'inline-block' }} />
          LIVE
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
        <AnimatePresence initial={false}>
          {activityFeed.map(item => (
            <motion.div key={item.id} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.message}</span>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{item.timestamp}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/admin/LiveFeed.tsx` contains `setInterval` with 5000ms
- File calls `prependActivity` to add new items
- File contains `AnimatePresence` with `y: -20` slide-in per item
- File contains `● LIVE` badge with pulse animation
- File contains `maxHeight: 280` overflow scroll
</acceptance_criteria>

---

### Task 4: SVG donut charts

<read_first>
- src/store/useAppStore.ts (volunteers state)
- src/index.css
</read_first>

<action>
Create `src/components/admin/DonutChart.tsx`:
```tsx
import { useEffect, useRef } from 'react';

interface Segment { label: string; value: number; color: string; }
interface Props { title: string; segments: Segment[]; size?: number; }

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start <= 180 ? '0' : '1';
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function DonutChart({ title, segments, size = 120 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2, cy = size / 2, r = size / 2 - 8, strokeW = 16;
  
  let currentAngle = 0;
  const arcs = segments.map(seg => {
    const angle = (seg.value / total) * 360;
    const path = describeArc(cx, cy, r, currentAngle, currentAngle + angle - 1);
    currentAngle += angle;
    return { ...seg, path };
  });

  useEffect(() => {
    const paths = svgRef.current?.querySelectorAll<SVGPathElement>('path[data-animate]');
    paths?.forEach((path, i) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      path.style.transition = `stroke-dashoffset 1.2s ease ${i * 0.15}s`;
      requestAnimationFrame(() => { path.style.strokeDashoffset = '0'; });
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <p className="label-caps" style={{ textAlign: 'center', marginBottom: 4 }}>{title}</p>
      <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <path key={i} d={arc.path} fill="none" stroke={arc.color} strokeWidth={strokeW} strokeLinecap="butt" data-animate="1" />
        ))}
        <circle cx={cx} cy={cy} r={r - strokeW / 2 - 4} fill="var(--bg-surface)" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontFamily: 'DM Sans', color: 'var(--text-muted)' }}>{seg.label}</span>
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', marginLeft: 'auto' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Create `src/components/admin/ResourceCharts.tsx`:
```tsx
import { DonutChart } from './DonutChart';
import { useAppStore } from '../../store/useAppStore';

export function ResourceCharts() {
  const { volunteers } = useAppStore();
  const deployed = volunteers.filter(v => v.status === 'deployed').length;
  const available = volunteers.filter(v => v.status === 'available').length;
  const offline = volunteers.filter(v => v.status === 'offline').length;

  return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', gap: 32, justifyContent: 'center' }}>
      <DonutChart title="VOLUNTEERS" segments={[
        { label: 'Deployed', value: deployed, color: 'var(--accent-red)' },
        { label: 'Available', value: available, color: 'var(--accent-cyan)' },
        { label: 'Offline', value: offline, color: 'var(--text-dim)' },
      ]} />
      <DonutChart title="RELIEF CAMPS" segments={[
        { label: 'Occupied', value: 8, color: 'var(--accent-orange)' },
        { label: 'Available', value: 14, color: 'var(--accent-green)' },
        { label: 'Full', value: 3, color: 'var(--accent-red)' },
      ]} />
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/admin/DonutChart.tsx` contains `getTotalLength` + `strokeDashoffset` animation
- File uses `polarToCartesian` for SVG arc calculation
- `src/components/admin/ResourceCharts.tsx` passes volunteer status counts to DonutChart
- Both charts render with correct segment colors
</acceptance_criteria>

---

### Task 5: Assemble Admin page

<read_first>
- All admin components just created
- src/store/useAppStore.ts
</read_first>

<action>
Create/replace `src/pages/Admin.tsx`:
- Hero strip (20vh with padding-top 80px):
  - "command" Playfair Italic `clamp(48px,6vw,80px)`
  - "center" DM Sans 300 `clamp(32px,4vw,60px)`
  - Status bar: green dot (animate-pulse-dot) + "SYSTEM OPERATIONAL" JetBrains Mono `--accent-green`
- 4 KPI cards in a horizontal row (flex, gap 16px):
  - Total Active Incidents — derived from `incidents.filter(i => i.status !== 'resolved').length`
  - Resolved Today — hardcode 6, trend +3
  - Volunteers Deployed — derived from volunteers
  - Avg Response Time — value 4.2, unit " min"
- Main grid: 58% left / 42% right (flex)
  - Left: `<IncidentTable />`
  - Right column (flex-direction: column, gap 16px): `<LiveFeed />` then `<ResourceCharts />`
</action>

<acceptance_criteria>
- `src/pages/Admin.tsx` renders all 4 KPI cards
- File renders `<IncidentTable />` in 58% column
- File renders `<LiveFeed />` and `<ResourceCharts />` in 42% column
- Hero strip contains "SYSTEM OPERATIONAL" text in `--accent-green`
- KPI card values sourced from `useAppStore`
</acceptance_criteria>

## Verification

```bash
ls src/components/admin/
grep "setInterval" src/components/admin/LiveFeed.tsx
grep "getTotalLength" src/components/admin/DonutChart.tsx
grep "updateIncidentStatus" src/components/admin/IncidentTable.tsx
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```
