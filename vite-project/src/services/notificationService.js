import { apiDelete, apiGet, apiPost } from './httpClient';
import { toNumberId, toStringId } from '../utils/id';

function normalizeGroup(item) {
  return {
    groupId: toStringId(item?.groupId),
    groupName: item?.groupName || item?.name || '',
  };
}

function normalizeSubscription(item) {
  return {
    groupId: toStringId(item?.groupId),
    userId: toStringId(item?.userId),
    dateInscription: item?.dateInscription || null,
    groupName: item?.groupName || '',
  };
}

export async function listGroups(options = {}) {
  const data = await apiGet('/api/notification/group', options.token, { signal: options.signal });
  return Array.isArray(data) ? data.map(normalizeGroup) : [];
}

export function createGroup(name, options = {}) {
  return apiPost('/api/notification/group', options.token, { name }, { signal: options.signal });
}

export async function listSubscriptionsByUser(userId, options = {}) {
  const data = await apiGet('/api/notification/subscription', options.token, {
    signal: options.signal,
    params: { userId: toNumberId(userId) },
  });
  return Array.isArray(data) ? data.map(normalizeSubscription) : [];
}

export function subscribeToGroup(userId, groupId, options = {}) {
  return apiPost(
    '/api/notification/subscription',
    options.token,
    {
      userId: toNumberId(userId),
      groupId: toNumberId(groupId),
    },
    { signal: options.signal }
  );
}

export function unsubscribeFromGroup(userId, groupId, options = {}) {
  return apiDelete(
    '/api/notification/subscription',
    options.token,
    {
      userId: toNumberId(userId),
      groupId: toNumberId(groupId),
    },
    { signal: options.signal }
  );
}

export async function consumeNotifications(userId, options = {}) {
  const data = await apiGet('/api/notification/notification', options.token, {
    signal: options.signal,
    params: { userId: toNumberId(userId) },
  });
  return Array.isArray(data) ? data.map((item) => String(item)) : [];
}

export function publishNotification(payload, options = {}) {
  return apiPost('/api/notification/notification', options.token, payload, { signal: options.signal });
}
