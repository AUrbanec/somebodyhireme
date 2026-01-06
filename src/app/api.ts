// In production (Netlify), API is at same origin. In dev, use localhost:3001
const API_BASE = import.meta.env.VITE_API_URL || '';

// Auth helpers
export const getToken = () => localStorage.getItem('admin_token');
export const setToken = (token: string) => localStorage.setItem('admin_token', token);
export const removeToken = () => localStorage.removeItem('admin_token');
export const isAuthenticated = () => !!getToken();

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Public API
export const fetchSiteData = async () => {
  const res = await fetch(`${API_BASE}/api/site-data`);
  if (!res.ok) throw new Error('Failed to fetch site data');
  return res.json();
};

export const submitContactForm = async (data: {
  name: string;
  email: string;
  company?: string;
  preferredDate?: string;
  preferredTime?: string;
  interviewDuration?: string;
  timezone?: string;
  message?: string;
}) => {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit form');
  return res.json();
};

// Auth API
export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Login failed');
  }
  const data = await res.json();
  setToken(data.token);
  return data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const res = await fetch(`${API_BASE}/api/auth/change-password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to change password');
  }
  return res.json();
};

// Admin API - Settings
export const fetchSettings = async () => {
  const res = await fetch(`${API_BASE}/api/admin/settings`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export const updateSettings = async (settings: Record<string, string>) => {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
};

// Admin API - Personal Overview
export const fetchPersonalOverview = async () => {
  const res = await fetch(`${API_BASE}/api/admin/personal-overview`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch personal overview');
  return res.json();
};

export const updatePersonalOverview = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/personal-overview`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update personal overview');
  return res.json();
};

// Admin API - Experience
export const fetchExperience = async () => {
  const res = await fetch(`${API_BASE}/api/admin/experience`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch experience');
  return res.json();
};

export const createExperience = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/experience`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create experience');
  return res.json();
};

export const updateExperience = async (id: number, data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/experience/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update experience');
  return res.json();
};

export const deleteExperience = async (id: number) => {
  const res = await fetch(`${API_BASE}/api/admin/experience/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete experience');
  return res.json();
};

// Admin API - Testimonials
export const fetchTestimonials = async () => {
  const res = await fetch(`${API_BASE}/api/admin/testimonials`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch testimonials');
  return res.json();
};

export const createTestimonial = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/testimonials`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create testimonial');
  return res.json();
};

export const updateTestimonial = async (id: number, data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/testimonials/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update testimonial');
  return res.json();
};

export const deleteTestimonial = async (id: number) => {
  const res = await fetch(`${API_BASE}/api/admin/testimonials/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete testimonial');
  return res.json();
};

// Admin API - Skills
export const fetchSkills = async () => {
  const res = await fetch(`${API_BASE}/api/admin/skills`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch skills');
  return res.json();
};

export const createSkill = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/skills`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create skill');
  return res.json();
};

export const updateSkill = async (id: number, data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/skills/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update skill');
  return res.json();
};

export const deleteSkill = async (id: number) => {
  const res = await fetch(`${API_BASE}/api/admin/skills/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete skill');
  return res.json();
};

// Admin API - Hobbies
export const fetchHobbies = async () => {
  const res = await fetch(`${API_BASE}/api/admin/hobbies`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch hobbies');
  return res.json();
};

export const createHobby = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/hobbies`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create hobby');
  return res.json();
};

export const updateHobby = async (id: number, data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/hobbies/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update hobby');
  return res.json();
};

export const deleteHobby = async (id: number) => {
  const res = await fetch(`${API_BASE}/api/admin/hobbies/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete hobby');
  return res.json();
};

// Admin API - Contact Info
export const fetchContactInfo = async () => {
  const res = await fetch(`${API_BASE}/api/admin/contact-info`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch contact info');
  return res.json();
};

export const updateContactInfo = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/admin/contact-info`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update contact info');
  return res.json();
};

// Admin API - Submissions
export const fetchSubmissions = async () => {
  const res = await fetch(`${API_BASE}/api/admin/submissions`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
};

export const markSubmissionRead = async (id: number) => {
  const res = await fetch(`${API_BASE}/api/admin/submissions/${id}/read`, {
    method: 'PUT',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to mark as read');
  return res.json();
};

export const deleteSubmission = async (id: number) => {
  const res = await fetch(`${API_BASE}/api/admin/submissions/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete submission');
  return res.json();
};

// Admin API - Google Integration
export const getGoogleAuthUrl = async () => {
  const res = await fetch(`${API_BASE}/api/admin/google/auth-url`, { headers: authHeaders() });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to get Google auth URL');
  }
  return res.json();
};

export const getGoogleStatus = async () => {
  const res = await fetch(`${API_BASE}/api/admin/google/status`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to get Google status');
  return res.json();
};

export const disconnectGoogle = async () => {
  const res = await fetch(`${API_BASE}/api/admin/google/disconnect`, {
    method: 'POST',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to disconnect Google');
  return res.json();
};
