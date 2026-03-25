---
wave: 2
depends_on: [01-PLAN-design-system]
files_modified:
  - src/data/mockData.ts
  - src/store/useAppStore.ts
  - src/store/useAuthStore.ts
autonomous: true
requirements_addressed: [UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07]
---

# Plan 03: Mock Data & Zustand Store

## Objective
Create all hardcoded mock data (10 India incidents, 6 volunteers, 10 admin log entries) and configure the Zustand stores so every page can consume them.

## must_haves
- [ ] 10 hardcoded India incidents with correct coordinates, severity, type, title, description
- [ ] 6 volunteers with names, skills, cities, status
- [ ] 10 admin activity feed entries
- [ ] `useAppStore` holds incidents, volunteers, admin feed state
- [ ] `useAuthStore` holds mock auth (localStorage persist) with role (citizen/volunteer/admin)

## Tasks

### Task 1: Create src/data/mockData.ts

<read_first>
- src/data/ (check if directory exists)
- .planning/phases/09-build-premium-award-winning-resq-ai-web-application-ui/09-CONTEXT.md (see mock data section for exact incidents)
</read_first>

<action>
Create `src/data/mockData.ts` with this exact content:

```ts
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentType = 'flood' | 'earthquake' | 'fire' | 'medical' | 'landslide' | 'cyclone' | 'collapse' | 'gas-leak' | 'heatwave';
export type IncidentStatus = 'pending' | 'verified' | 'dispatched' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  location: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
  reportedAt: string;
  peopleAffected: number;
}

export const INCIDENTS: Incident[] = [
  { id: 'RSQ-001', title: 'Flash Flood — Brahmaputra Basin', type: 'flood', severity: 'critical', status: 'dispatched', location: 'Guwahati, Assam', state: 'Assam', lat: 26.14, lng: 91.74, description: 'Major flash flooding in Brahmaputra basin. 200+ families displaced. Roads cut off.', reportedAt: '2024-07-14T06:32:00Z', peopleAffected: 1200 },
  { id: 'RSQ-002', title: 'Landslide — Chamoli District', type: 'landslide', severity: 'high', status: 'verified', location: 'Chamoli, Uttarakhand', state: 'Uttarakhand', lat: 30.06, lng: 79.01, description: 'Multiple landslides blocking NH-7. Village of Joshimath partially isolated.', reportedAt: '2024-07-14T08:15:00Z', peopleAffected: 340 },
  { id: 'RSQ-003', title: 'Building Collapse — Dharavi', type: 'collapse', severity: 'critical', status: 'dispatched', location: 'Dharavi, Mumbai', state: 'Maharashtra', lat: 19.07, lng: 72.87, description: '4-storey residential building collapsed. Rescue operation ongoing. 12 trapped.', reportedAt: '2024-07-14T09:45:00Z', peopleAffected: 48 },
  { id: 'RSQ-004', title: 'Cyclone Warning — Coromandel Coast', type: 'cyclone', severity: 'high', status: 'pending', location: 'Marina Beach, Chennai', state: 'Tamil Nadu', lat: 13.08, lng: 80.27, description: 'Cyclone Dana approaching with 120 km/h winds. Evacuation advisory for coastal areas.', reportedAt: '2024-07-14T10:00:00Z', peopleAffected: 85000 },
  { id: 'RSQ-005', title: 'Industrial Gas Leak — Okhla', type: 'gas-leak', severity: 'medium', status: 'resolved', location: 'Okhla Industrial Area, Delhi', state: 'Delhi', lat: 28.61, lng: 77.20, description: 'Chlorine gas leak from industrial unit. 500m exclusion zone established. Contained.', reportedAt: '2024-07-14T07:20:00Z', peopleAffected: 150 },
  { id: 'RSQ-006', title: 'Coastal Flooding — Puri', type: 'flood', severity: 'critical', status: 'dispatched', location: 'Puri, Odisha', state: 'Odisha', lat: 20.29, lng: 85.82, description: 'High-tide coastal flooding. Temple town partially submerged. NDRF deployed.', reportedAt: '2024-07-14T05:10:00Z', peopleAffected: 3200 },
  { id: 'RSQ-007', title: 'Forest Fire — Wayanad Reserve', type: 'fire', severity: 'high', status: 'verified', location: 'Wayanad, Kerala', state: 'Kerala', lat: 10.85, lng: 76.27, description: 'Forest fire spreading in Wayanad Wildlife Sanctuary. 800 hectares affected.', reportedAt: '2024-07-14T11:30:00Z', peopleAffected: 80 },
  { id: 'RSQ-008', title: 'Severe Heatwave — Barmer', type: 'heatwave', severity: 'medium', status: 'verified', location: 'Barmer, Rajasthan', state: 'Rajasthan', lat: 27.02, lng: 74.21, description: 'Temperatures exceeding 48°C. 6 heatstroke fatalities reported. ORS distribution active.', reportedAt: '2024-07-14T12:00:00Z', peopleAffected: 22000 },
  { id: 'RSQ-009', title: 'River Overflow — Ganga Plains', type: 'flood', severity: 'high', status: 'pending', location: 'Patna, Bihar', state: 'Bihar', lat: 25.09, lng: 85.31, description: 'Ganga overflow threatening low-lying areas of Patna. Embankment breach reported.', reportedAt: '2024-07-14T13:45:00Z', peopleAffected: 9000 },
  { id: 'RSQ-010', title: 'Earthquake Aftershock — Gangtok', type: 'earthquake', severity: 'critical', status: 'pending', location: 'Gangtok, Sikkim', state: 'Sikkim', lat: 27.53, lng: 88.51, description: 'M5.4 aftershock following main event. Multiple buildings damaged. Landslide risk elevated.', reportedAt: '2024-07-14T14:22:00Z', peopleAffected: 1800 },
];

export type VolunteerSkill = 'First Aid' | 'Firefighting' | 'Search & Rescue' | 'Swimming' | 'Medical' | 'HAM Radio' | 'Logistics' | 'Counseling' | 'Driving';
export type VolunteerStatus = 'available' | 'deployed' | 'offline';

export interface Volunteer {
  id: string;
  name: string;
  city: string;
  state: string;
  skills: VolunteerSkill[];
  status: VolunteerStatus;
  tasksCompleted: number;
  rating: number;
  responseRate: number;
}

export const VOLUNTEERS: Volunteer[] = [
  { id: 'VOL-001', name: 'Rajan Mehta', city: 'Mumbai', state: 'Maharashtra', skills: ['First Aid', 'Search & Rescue', 'Swimming'], status: 'available', tasksCompleted: 24, rating: 4.9, responseRate: 97 },
  { id: 'VOL-002', name: 'Priya Sharma', city: 'Bengaluru', state: 'Karnataka', skills: ['Medical', 'First Aid', 'Counseling'], status: 'deployed', tasksCompleted: 18, rating: 4.8, responseRate: 95 },
  { id: 'VOL-003', name: 'Arjun Singh', city: 'Delhi', state: 'Delhi', skills: ['HAM Radio', 'Logistics', 'Driving'], status: 'available', tasksCompleted: 31, rating: 4.7, responseRate: 92 },
  { id: 'VOL-004', name: 'Kavitha Nair', city: 'Kochi', state: 'Kerala', skills: ['Swimming', 'Search & Rescue', 'First Aid'], status: 'available', tasksCompleted: 12, rating: 4.6, responseRate: 88 },
  { id: 'VOL-005', name: 'Suresh Babu', city: 'Hyderabad', state: 'Telangana', skills: ['Firefighting', 'Logistics', 'Driving'], status: 'offline', tasksCompleted: 7, rating: 4.4, responseRate: 78 },
  { id: 'VOL-006', name: 'Ankita Roy', city: 'Kolkata', state: 'West Bengal', skills: ['Medical', 'Counseling', 'First Aid'], status: 'available', tasksCompleted: 15, rating: 4.8, responseRate: 94 },
];

export interface ActivityEntry {
  id: string;
  type: 'sos' | 'volunteer' | 'data' | 'escalation' | 'resolved';
  message: string;
  timestamp: string;
}

export const ACTIVITY_FEED_TEMPLATES: ActivityEntry[] = [
  { id: 'A-001', type: 'sos', message: '🔴 New SOS — Assam Flash Flood, Critical', timestamp: '14:32' },
  { id: 'A-002', type: 'volunteer', message: '✅ Volunteer Rajan Mehta accepted task #RSQ-001', timestamp: '14:30' },
  { id: 'A-003', type: 'data', message: '📡 USGS data updated — M4.1 detected near Sikkim', timestamp: '14:28' },
  { id: 'A-004', type: 'escalation', message: '🟡 Task #RSQ-009 escalated to admin review', timestamp: '14:25' },
  { id: 'A-005', type: 'resolved', message: '✅ Incident RSQ-005 resolved — Delhi gas leak contained', timestamp: '14:20' },
  { id: 'A-006', type: 'sos', message: '🔴 New SOS — Mumbai Building Collapse, Critical', timestamp: '14:15' },
  { id: 'A-007', type: 'volunteer', message: '✅ Volunteer Priya Sharma deployed to RSQ-003', timestamp: '14:10' },
  { id: 'A-008', type: 'data', message: '📡 IMD issued cyclone warning — Category 2, ETA 18hrs', timestamp: '14:05' },
  { id: 'A-009', type: 'volunteer', message: '✅ Volunteer Kavitha Nair marked task #RSQ-006 in progress', timestamp: '14:00' },
  { id: 'A-010', type: 'data', message: '📡 NDMA alert broadcast — Odisha coastal districts', timestamp: '13:55' },
];
```
</action>

<acceptance_criteria>
- `src/data/mockData.ts` exists
- File contains `INCIDENTS` array with 10 entries
- File contains `RSQ-001` through `RSQ-010`
- File contains `VOLUNTEERS` array with 6 entries
- File contains `ACTIVITY_FEED_TEMPLATES` array with 10 entries
- File contains correct lat/lng for Assam: `lat: 26.14, lng: 91.74`
</acceptance_criteria>

---

### Task 2: Update Zustand stores

<read_first>
- src/store/ (check existing store files)
- src/data/mockData.ts
</read_first>

<action>
Create or update `src/store/useAppStore.ts`:
```ts
import { create } from 'zustand';
import { INCIDENTS, VOLUNTEERS, ACTIVITY_FEED_TEMPLATES, Incident, Volunteer, ActivityEntry } from '../data/mockData';

interface AppStore {
  incidents: Incident[];
  volunteers: Volunteer[];
  activityFeed: ActivityEntry[];
  updateIncidentStatus: (id: string, status: Incident['status']) => void;
  updateVolunteerStatus: (id: string, status: Volunteer['status']) => void;
  prependActivity: (entry: ActivityEntry) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  incidents: INCIDENTS,
  volunteers: VOLUNTEERS,
  activityFeed: ACTIVITY_FEED_TEMPLATES,
  updateIncidentStatus: (id, status) => set((s) => ({ incidents: s.incidents.map(i => i.id === id ? { ...i, status } : i) })),
  updateVolunteerStatus: (id, status) => set((s) => ({ volunteers: s.volunteers.map(v => v.id === id ? { ...v, status } : v) })),
  prependActivity: (entry) => set((s) => ({ activityFeed: [entry, ...s.activityFeed].slice(0, 8) })),
}));
```

Create or update `src/store/useAuthStore.ts`:
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'citizen' | 'volunteer' | 'admin';

interface User { name: string; email: string; role: Role; }
interface AuthStore {
  user: User | null;
  login: (name: string, email: string, role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (name, email, role) => set({ user: { name, email, role } }),
      logout: () => set({ user: null }),
    }),
    { name: 'resq-auth' }
  )
);
```
</action>

<acceptance_criteria>
- `src/store/useAppStore.ts` contains `useAppStore`
- `src/store/useAppStore.ts` imports from `../data/mockData`
- `src/store/useAppStore.ts` contains `updateIncidentStatus`
- `src/store/useAuthStore.ts` contains `persist` middleware
- `src/store/useAuthStore.ts` contains `name: 'resq-auth'` for localStorage key
</acceptance_criteria>

## Verification

```bash
ls src/data/mockData.ts
grep -c "RSQ-" src/data/mockData.ts
grep "useAppStore" src/store/useAppStore.ts
grep "persist" src/store/useAuthStore.ts
```
