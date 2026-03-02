import { apiGet, apiPost, apiPut } from './httpClient';

// --- ADMINISTRATION (Pour Marius le Responsable) ---
export function listUsers(token, options = {}) {
  return apiGet('/api/admin/users', token, { signal: options.signal });
}

export function updateUserRole(token, userId, role, options = {}) {
  return apiPut(`/api/admin/users/${userId}/role`, token, { role }, { signal: options.signal });
}

export function listVolontaires(token) {
  return apiGet('/api/admin/volontaires', token);
}

export function assignTask(token, payload) {
  // payload: { volunteerId, taskName, timeSlot }
  return apiPost('/api/admin/tasks/assign', token, payload);
}

// --- DOCUMENTS (Pour Arthur le Commissaire) ---
export function listPendingDocuments(token) {
  return apiGet('/api/admin/documents', token);
}

export function reviewDocument(token, docId, status) {
  // status: 'VALIDE' ou 'REFUSE'
  return apiPut(`/api/admin/documents/${docId}/review`, token, { status });
}

// --- SPORTIF (Pour Léon) ---
export function getSportifProfile(token) {
  return apiGet('/api/users/sportif/me', token);
}

export function uploadDocument(token, docData) {
  // docData: { type, fileName, status: 'EN_ATTENTE' }
  return apiPost('/api/users/documents', token, docData);
}

// --- VOLONTAIRE (Pour Hector) ---
export function getMyTasks(token) {
  return apiGet('/api/users/tasks', token);
}

// --- SPECTATEUR (Pour Suzanne) ---
export function getMyTickets(token) {
  return apiGet('/api/users/tickets', token);
}

export function addTicket(token, ticketData) {
  return apiPost('/api/users/tickets', token, ticketData);
}