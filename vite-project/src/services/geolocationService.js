import { apiGet, apiPost } from './httpClient';

export function postLocation(userId, latitude, longitude, altitude) {
  return apiPost(`/api/localisation/localisation/user/${userId}`, null, {latitude, longitude, altitude});
}

export function getLocation(userId) {
  return apiGet(`/api/localisation/localisation/user/${userId}`);
}
