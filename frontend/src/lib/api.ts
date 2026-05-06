const API_BASE_URL = '/api';

export const api = {
  // Student Applications
  submitApplication: async (payload: { scholarship_type: string; form_data: any; attachments: string[] }) => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to submit application');
    return response.json();
  },

  getApplicationStatus: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`);
    if (!response.ok) throw new Error('Failed to fetch status');
    return response.json();
  },

  studentReply: async (id: string, payload: { attachments: string[] }) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to submit reply');
    return response.json();
  },

  // Admin Queue
  getAdminQueue: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/queue`);
    if (!response.ok) throw new Error('Failed to fetch admin queue');
    return response.json();
  },

  getApplicationDetail: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}`);
    if (!response.ok) throw new Error('Failed to fetch application detail');
    return response.json();
  },

  overrideDecision: async (id: string, payload: { decision: 'approved' | 'rejected'; reason: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to override decision');
    return response.json();
  },

  // Agent Traces
  getRunEvents: async (runId: string) => {
    const response = await fetch(`${API_BASE_URL}/runs/${runId}/events`);
    if (!response.ok) throw new Error('Failed to fetch run events');
    return response.json();
  },

  getRunState: async (runId: string) => {
    const response = await fetch(`${API_BASE_URL}/runs/${runId}/state`);
    if (!response.ok) throw new Error('Failed to fetch run state');
    return response.json();
  }
};
