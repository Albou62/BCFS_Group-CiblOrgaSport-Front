import { apiGet, apiPut } from './httpClient';

export function listUsers(token, options = {}) {
  return apiGet('/api/admin/users', token, { signal: options.signal });
}

export function updateUserRole(token, userId, role, options = {}) {
  return apiPut(`/api/admin/users/${userId}/role`, token, { role }, { signal: options.signal });
}
