const API_URL = import.meta.env.VITE_API_URL;

export async function login(username, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error('Identifiants invalides');
  }

  return res.json(); // { token }
}

export async function register(username, password) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error('Inscription impossible');
  }

  return true; // backend renvoie "OK"
}

export async function fetchMe(token) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Impossible de récupérer le profil');
  }

  return res.json();
}

export const getMe = fetchMe;
