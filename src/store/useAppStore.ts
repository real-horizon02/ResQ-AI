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
  updateIncidentStatus: (id, status) =>
    set((s) => ({ incidents: s.incidents.map(i => i.id === id ? { ...i, status } : i) })),
  updateVolunteerStatus: (id, status) =>
    set((s) => ({ volunteers: s.volunteers.map(v => v.id === id ? { ...v, status } : v) })),
  prependActivity: (entry) =>
    set((s) => ({ activityFeed: [entry, ...s.activityFeed].slice(0, 10) })),
}));
