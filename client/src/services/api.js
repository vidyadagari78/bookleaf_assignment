const API_BASE = '/api/v1';

function getAuthHeader() {
  const token = localStorage.getItem('bookleaf_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.code = data?.error?.code;
    err.details = data?.error?.details;
    err.status = response.status;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),

  // Books
  getBooks: (authorId = null, status = null) => {
    const params = new URLSearchParams();
    if (authorId) params.append('authorId', authorId);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/books${query}`);
  },
  getBookById: (id) => request(`/books/${id}`),

  // Tickets
  getTickets: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/tickets${query}`);
  },
  getTicketById: (id) => request(`/tickets/${id}`),
  createTicket: (payload) => request('/tickets', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  addMessage: (ticketId, message, updateStatusTo = null) => request(`/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, update_status_to: updateStatusTo })
  }),
  updateTicket: (ticketId, updates) => request(`/tickets/${ticketId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  addInternalNote: (ticketId, note) => request(`/tickets/${ticketId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),
  generateAiDraft: (ticketId, toneStyle = 'Empathetic & Professional') => request(`/tickets/${ticketId}/ai-draft`, {
    method: 'POST',
    body: JSON.stringify({ toneStyle })
  }),

  // Admin
  getDashboardStats: () => request('/admin/stats'),
  getAuthors: () => request('/admin/authors'),
  getKnowledgeBase: () => request('/admin/knowledge-base'),
  resetSeed: () => request('/admin/reset-seed', { method: 'POST' }),

  // System
  getHealth: () => request('/system/health')
};
