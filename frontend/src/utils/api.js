// utils/api.js — Centralized API client
const BASE = '/api';

const getToken = () => localStorage.getItem('es_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  // Auth
  login: (body) => fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  register: (body) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  me: () => fetch(`${BASE}/auth/me`, { headers: headers() }).then(handle),

  // Events
  getEvents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/events${q ? `?${q}` : ''}`, { headers: headers() }).then(handle);
  },
  getAllEvents: () => fetch(`${BASE}/events/all`, { headers: headers() }).then(handle),
  getEvent: (id) => fetch(`${BASE}/events/${id}`, { headers: headers() }).then(handle),
  getMyEvents: () => fetch(`${BASE}/events/organizer/mine`, { headers: headers() }).then(handle),
  createEvent: (body) => fetch(`${BASE}/events`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  updateEvent: (id, body) => fetch(`${BASE}/events/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
  deleteEvent: (id) => fetch(`${BASE}/events/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
  updateEventStatus: (id, status) => fetch(`${BASE}/events/${id}/status`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status }) }).then(handle),

  // Tickets
  purchaseTicket: (body) => fetch(`${BASE}/tickets/purchase`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  getMyTickets: () => fetch(`${BASE}/tickets/my`, { headers: headers() }).then(handle),
  getTicket: (id) => fetch(`${BASE}/tickets/${id}`, { headers: headers() }).then(handle),

  // Sponsors
  sendSponsorRequest: (body) => fetch(`${BASE}/sponsors/request`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  getMySponsorRequests: () => fetch(`${BASE}/sponsors/my`, { headers: headers() }).then(handle),
  getIncomingRequests: () => fetch(`${BASE}/sponsors/incoming`, { headers: headers() }).then(handle),
  respondToRequest: (id, body) => fetch(`${BASE}/sponsors/${id}/respond`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) }).then(handle),
  getAllSponsorRequests: () => fetch(`${BASE}/sponsors/all`, { headers: headers() }).then(handle),

  // Admin / Users
  getUsers: () => fetch(`${BASE}/users`, { headers: headers() }).then(handle),
  getStats: () => fetch(`${BASE}/users/stats`, { headers: headers() }).then(handle),
  banUser: (id) => fetch(`${BASE}/users/${id}/ban`, { method: 'PATCH', headers: headers() }).then(handle),
  changeRole: (id, role) => fetch(`${BASE}/users/${id}/role`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ role }) }).then(handle),
  deleteUser: (id) => fetch(`${BASE}/users/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
};
