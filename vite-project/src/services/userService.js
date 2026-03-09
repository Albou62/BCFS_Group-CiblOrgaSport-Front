// src/services/userService.js
import { apiGet, apiPost, apiPut } from './httpClient.js';


// ---------- SPORTIF ----------
export function getSportifProfile(token, options = {}) {
  return apiGet('/api/users/sportif/me', token, { signal: options.signal });
}

export function uploadDocument(token, payload, options = {}) {
  return apiPost('/api/users/documents', token, payload, { signal: options.signal });
}

// ---------- VOLONTAIRE ----------
export function getMyTasks(token, options = {}) {
  return apiGet('/api/users/tasks', token, { signal: options.signal });
}

// ---------- SPECTATEUR ----------
export function getMyTickets(token, options = {}) {
  return apiGet('/api/users/tickets', token, { signal: options.signal });
}

export function addTicket(token, payload, options = {}) {
  return apiPost('/api/users/tickets', token, payload, { signal: options.signal });
}

// ---------- COMMISSAIRE ----------
export function listPendingDocuments(token, options = {}) {
  return apiGet('/api/admin/documents', token, { signal: options.signal });
}

export function reviewDocument(token, id, status, options = {}) {
  return apiPut(`/api/admin/documents/${id}/review`, token, { status }, { signal: options.signal });
}

// ---------- RESPONSABLE ----------
export function listVolunteers(token, options = {}) {
  return apiGet('/api/admin/volontaires', token, { signal: options.signal });
}

export function assignTask(token, payload, options = {}) {
  return apiPost('/api/admin/tasks/assign', token, payload, { signal: options.signal });
}

export function listUsers(token, options = {}) {
  return apiGet('/api/admin/users', token, { signal: options.signal });
}

export function updateUserRole(token, userId, role, options = {}) {
  return apiPut(`/api/admin/users/${userId}/role`, token, { role }, { signal: options.signal });

  
}

export function listVolontaires(token, options = {}) {
  return apiGet('/api/admin/volontaires', token, { signal: options.signal });
}

export const updateTaskStatus = async (taskId, newStatus, token) => {
  const response = await fetch(`http://localhost:8080/api/tasks/${taskId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  });
  
  if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut");
  return true;
};
