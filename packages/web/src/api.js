// packages/web/src/api.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// ─── Auth & Users ─────────────────────────────────

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return await res.json();
}

export async function logout() {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Logout failed');
  return await res.json();
}

export async function createUser(username, password, role = 'user') {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, role })
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return await res.json();
}

export async function getMe() {
  const res = await fetch(`${API_URL}/me`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Not authenticated');
  return await res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Could not fetch users');
  return await res.json();
}

export async function getUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('User not found');
  return await res.json();
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update failed');
  return await res.json();
}


// ─── Events ────────────────────────────────────────

export async function getEvents() {
  const res = await fetch(`${API_URL}/events`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Could not fetch events');
  return await res.json();
}

export async function createEvent(title, date) {
  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, date })
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return await res.json();
}


// ─── Messages (Ping / Inbox) ──────────────────────

export async function getMessages() {
  const res = await fetch(`${API_URL}/messages`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Could not fetch messages');
  return await res.json();
}

export async function sendMessage(toUserId, content) {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toUserId, content })
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return await res.json();
}

export async function markMessageRead(id) {
  const res = await fetch(`${API_URL}/messages/${id}/read`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Could not mark message read');
  return await res.json();
}
