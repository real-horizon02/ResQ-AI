import { create } from 'zustand';
import { INCIDENTS, VOLUNTEERS, ACTIVITY_FEED_TEMPLATES, Incident, Volunteer, ActivityEntry } from '../data/mockData';

export interface RescueApplication {
  id: string;
  incidentId: string;
  volunteerId: string;
  volunteerName: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DispatchedTask {
  id: string;
  incidentId: string;
  volunteerId: string;
  assignedAt: string;
}

interface AppStore {
  incidents: Incident[];
  volunteers: Volunteer[];
  activityFeed: ActivityEntry[];
  rescueApplications: RescueApplication[];
  dispatchedTasks: DispatchedTask[];
  updateIncidentStatus: (id: string, status: Incident['status']) => void;
  updateVolunteerStatus: (id: string, status: Volunteer['status']) => void;
  prependActivity: (entry: ActivityEntry) => void;
  applyForRescue: (incidentId: string, volunteerId: string, volunteerName: string) => void;
  approveRescue: (applicationId: string) => void;
  rejectRescue: (applicationId: string) => void;
  dispatchVolunteer: (incidentId: string, volunteerId: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  incidents: INCIDENTS,
  volunteers: VOLUNTEERS,
  activityFeed: ACTIVITY_FEED_TEMPLATES,
  rescueApplications: [
    { id: 'app_1', incidentId: 'RSQ-001', volunteerId: 'VOL-001', volunteerName: 'Rajan Mehta', status: 'pending' },
    { id: 'app_2', incidentId: 'RSQ-002', volunteerId: 'VOL-002', volunteerName: 'Priya Sharma', status: 'pending' }
  ],
  dispatchedTasks: [],
  updateIncidentStatus: (id, status) =>
    set((s) => ({ incidents: s.incidents.map(i => i.id === id ? { ...i, status } : i) })),
  updateVolunteerStatus: (id, status) =>
    set((s) => ({ volunteers: s.volunteers.map(v => v.id === id ? { ...v, status } : v) })),
  prependActivity: (entry) =>
    set((s) => ({ activityFeed: [entry, ...s.activityFeed].slice(0, 10) })),
  applyForRescue: (incidentId, volunteerId, volunteerName) =>
    set((s) => ({
      rescueApplications: [
        { id: `app_${Date.now()}`, incidentId, volunteerId, volunteerName, status: 'pending' },
        ...s.rescueApplications
      ]
    })),
  approveRescue: (applicationId) =>
    set((s) => ({
      rescueApplications: s.rescueApplications.map(app => app.id === applicationId ? { ...app, status: 'approved' } : app)
    })),
  rejectRescue: (applicationId) =>
    set((s) => ({
      rescueApplications: s.rescueApplications.map(app => app.id === applicationId ? { ...app, status: 'rejected' } : app)
    })),
  dispatchVolunteer: (incidentId, volunteerId) =>
    set((s) => ({
      dispatchedTasks: [
        { id: `disp_${Date.now()}`, incidentId, volunteerId, assignedAt: new Date().toISOString() },
        ...s.dispatchedTasks
      ]
    }))
}));
