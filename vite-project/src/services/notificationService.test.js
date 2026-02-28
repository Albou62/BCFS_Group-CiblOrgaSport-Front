import { describe, expect, it, vi } from 'vitest';
import {
  consumeNotifications,
  listGroups,
  listSubscriptionsByUser,
  subscribeToGroup,
  unsubscribeFromGroup,
} from './notificationService';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('notificationService', () => {
  it('loads groups and normalizes ids', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse([{ groupId: 1, groupName: 'Security' }]));
    const groups = await listGroups({ token: 'token' });
    expect(groups[0].groupId).toBe('1');
  });

  it('loads user subscriptions via query param', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse([]));
    await listSubscriptionsByUser('42', { token: 'token' });
    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/notification/subscription');
    expect(url).toContain('userId=42');
  });

  it('subscribes and unsubscribes with numeric ids', async () => {
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse('OK')));
    await subscribeToGroup('42', '7', { token: 'token' });
    await unsubscribeFromGroup('42', '7', { token: 'token' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('consumes notifications as strings', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(['A', 'B']));
    const notifications = await consumeNotifications(42, { token: 'token' });
    expect(notifications).toEqual(['A', 'B']);
  });
});
