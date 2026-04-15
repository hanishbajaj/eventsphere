// utils/api.js — Centralized API client
const API_URL = import.meta.env.VITE_API_URL || "https://eventsphere-production-9244.up.railway.app";
const BASE = `${API_URL}/api`;

const getToken = () => localStorage.getItem('es_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handle = async (res) => {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { message: text };
  }
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
  createPaymentIntent: (body) => fetch(`${BASE}/payments/create-intent`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  getMyTickets: () => fetch(`${BASE}/tickets/my`, { headers: headers() }).then(handle),
  checkUserTicket: (eventId) => fetch(`${BASE}/tickets/user/${eventId}`, { headers: headers() }).then(handle),
  getTicket: (id) => fetch(`${BASE}/tickets/${id}`, { headers: headers() }).then(handle),

  // Reviews
  getEventReviews: (eventId) => fetch(`${BASE}/reviews/event/${eventId}`, { headers: headers() }).then(handle),
  addReview: (body) => fetch(`${BASE}/reviews`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),

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