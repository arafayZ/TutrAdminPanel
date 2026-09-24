// src/api/adminClient.js

const BASE_URL = 'http://192.168.100.10:8080';

/**
 * Central fetch wrapper for all admin API calls.
 * - Adds JWT token automatically
 * - Redirects to /login?reason=session_expired on 401/403
 */
export const adminFetch = async (path, options = {}) => {
  const token = localStorage.getItem('admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Session expired → clear + redirect with reason
 //  401 = session expired → logout
if (response.status === 401) {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  window.location.href = '/login?reason=session_expired';
  throw new Error('Session expired');
}

//  403 = permission denied → don't logout, throw distinct error
if (response.status === 403) {
  const err = new Error('Forbidden');
  err.status = 403;
  throw err;
}
  return response;
};

/**
 * Same as adminFetch but for multipart file uploads.
 * Does NOT set Content-Type (browser sets it with boundary).
 */
export const adminUpload = async (path, formData, method = 'POST') => {
  const token = localStorage.getItem('admin_token');

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  // Session expired → clear + redirect with reason
 if (response.status === 401) {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  window.location.href = '/login?reason=session_expired';
  throw new Error('Session expired');
}

if (response.status === 403) {
  const err = new Error('Forbidden');
  err.status = 403;
  throw err;
}

  return response;
};

/**
 * Builds a full image URL from a stored path like "/uploads/admin-profile-images/..."
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

/**
 * Helper: get the current logged-in admin (from localStorage)
 */
export const getCurrentAdmin = () => {
  const raw = localStorage.getItem('admin_user');
  return raw ? JSON.parse(raw) : null;
};

/**
 * Helper: logout (manual)
 * Redirects to plain /login (no reason param — this is a user-initiated logout)
 */
export const adminLogout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  window.location.href = '/login';
};