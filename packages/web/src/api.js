const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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
