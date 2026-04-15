// ============================================================
// src/api.js - Centralized API call helper
// All HTTP requests to the backend go through this module.
// It automatically attaches the JWT token from localStorage.
// ============================================================

const BASE_URL = '/api';

// Helper: read the stored JWT token
const getToken = () => localStorage.getItem('token');

// ------------------------------------------------------------
// apiFetch - Core fetch wrapper
// Automatically sets Content-Type and Authorization headers.
// Returns parsed JSON on success, throws an error on failure.
// ------------------------------------------------------------
async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await res.json();

  // If the server returned an error status, throw so callers can catch it
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
}

// ============================================================
// AUTH
// ============================================================
export const register = (body)   => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) });
export const login    = (body)   => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) });
export const getMe    = ()       => apiFetch('/auth/me');

// ============================================================
// GROUPS
// ============================================================
export const getGroups   = (params = {}) => {
  // Build query string from the params object (e.g. { search: 'math' })
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/groups${qs ? '?' + qs : ''}`);
};
export const getMyGroups  = ()           => apiFetch('/groups/user/my');
export const getGroup     = (id)         => apiFetch(`/groups/${id}`);
export const createGroup  = (body)       => apiFetch('/groups',          { method: 'POST',   body: JSON.stringify(body) });
export const updateGroup  = (id, body)   => apiFetch(`/groups/${id}`,    { method: 'PUT',    body: JSON.stringify(body) });
export const joinGroup    = (id)         => apiFetch(`/groups/${id}/join`,  { method: 'POST' });
export const leaveGroup   = (id)         => apiFetch(`/groups/${id}/leave`, { method: 'DELETE' });
export const removeMember = (gId, uId)   => apiFetch(`/groups/${gId}/members/${uId}`, { method: 'DELETE' });

// ============================================================
// SESSIONS
// ============================================================
export const createSession   = (body)   => apiFetch('/sessions',                { method: 'POST', body: JSON.stringify(body) });
export const getGroupSessions = (gId)  => apiFetch(`/sessions/group/${gId}`);
export const getUpcomingSessions = ()  => apiFetch('/sessions/upcoming');

// ============================================================
// POSTS
// ============================================================
export const createPost   = (body)   => apiFetch('/posts',              { method: 'POST', body: JSON.stringify(body) });
export const getGroupPosts = (gId)   => apiFetch(`/posts/group/${gId}`);

// ============================================================
// ADMIN
// ============================================================
export const getAdminStats = () => apiFetch('/admin/stats');
export const getAdminUsers = () => apiFetch('/admin/users');
