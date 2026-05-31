const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SOSRequest {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  status?: string;
  created_at?: string;
}

export const api = {
  // SOS Requests
  getSOS: async () => {
    const response = await fetch(`${API_BASE_URL}/sos`);
    if (!response.ok) throw new Error('Failed to fetch SOS requests');
    return response.json();
  },

  createSOS: async (data: Omit<SOSRequest, 'id' | 'created_at'>) => {
    const response = await fetch(`${API_BASE_URL}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create SOS request');
    return response.json();
  },

  updateSOS: async (id: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/sos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update SOS request');
    return response.json();
  },

  approveSOS: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/sos/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error('Failed to approve SOS request');
    return response.json();
  },

  deleteSOS: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/sos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete SOS request');
    return response.json();
  },
};
