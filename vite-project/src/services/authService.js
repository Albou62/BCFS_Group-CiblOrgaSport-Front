import { apiGet, apiPost } from './httpClient';

export function login(username, password, options = {}) {
  return apiPost('/api/auth/login', null, { username, password }, { signal: options.signal });
}

export function register(username, password, options = {}) {
  return apiPost('/api/auth/register', null, { username, password }, { signal: options.signal });
}

export function me(token, options = {}) {
  return apiGet('/api/auth/me', token, { signal: options.signal });
}
