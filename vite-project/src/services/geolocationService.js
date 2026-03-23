import { apiGet, apiPost } from './httpClient';

export function postLocation(userId, latitude, longitude, altitude, options = {}) {
  return apiPost(`/api/localisation/localisation/user/${userId}`, null, {latitude, longitude, altitude});
}

export function getLocation(userId, options = {}) {
  return apiGet(`/api/localisation/localisation/user/${userId}`);
}
