const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const password = localStorage.getItem('edugrant_admin_auth_password');
  return password ? { 'Authorization': `Bearer ${password}` } : {};
};

export const api = {
  // Student Applications
  uploadFile: async (file: File) => {

    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
  },

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
    const response = await fetch(`${API_BASE_URL}/admin/queue`, {
      headers: getAuthHeaders()
    });
    if (response.status === 401) {
        localStorage.removeItem('edugrant_admin_auth');
        window.location.href = '/admin';
    }
    if (!response.ok) throw new Error('Failed to fetch admin queue');
    return response.json();
  },

  getApplicationDetail: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch application detail');
    return response.json();
  },

  overrideDecision: async (id: string, payload: { decision: 'approved' | 'rejected'; reason: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}/override`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to override decision');
    return response.json();
  },

  reanalyzeApplication: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}/reanalyze`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to reanalyze');
    return response.json();
  },

  recordManualDecision: async (id: string, decision: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}/decision`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(decision),
    });
    if (!response.ok) throw new Error('Failed to record decision');
    return response.json();
  },

  deleteApplication: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete application');
    return response.json();
  },

  // Agent Traces

  getRunEvents: async (runId: string) => {
    const response = await fetch(`${API_BASE_URL}/runs/${runId}/events`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch run events');
    return response.json();
  },

  getRunState: async (runId: string) => {
    const response = await fetch(`${API_BASE_URL}/runs/${runId}/state`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch run state');
    return response.json();
  },

  verifyAdminAuth: async (password: string) => {
    // We use getAdminQueue as a way to verify the password
    const response = await fetch(`${API_BASE_URL}/admin/queue`, {
      headers: { 'Authorization': `Bearer ${password}` }
    });
    return response.ok;
  },

  getRubric: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/settings/rubric`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch rubric');
    return response.json();
  },

  updateRubric: async (rubric: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/settings/rubric`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(rubric),
    });
    if (!response.ok) throw new Error('Failed to update rubric');
    return response.json();
  }
};
