import { describe, expect, it, vi, beforeEach } from 'vitest';
import { apiDelete, request, setUnauthorizedHandler } from './httpClient';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('httpClient', () => {
  beforeEach(() => {
    setUnauthorizedHandler(null);
  });

  it('normalizes non-2xx responses to app error shape', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ message: 'boom' }, 500));

    await expect(request('/api/test')).rejects.toMatchObject({
      code: 'SERVER_ERROR',
      message: 'boom',
      status: 500,
      cause: { message: 'boom' },
    });
  });

  it('calls the shared unauthorized handler on 401', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ message: 'expired' }, 401));

    await expect(request('/api/protected')).rejects.toMatchObject({
      code: 'TOKEN_EXPIRED',
      status: 401,
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('parses JSON string payloads', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response('"OK"', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(request('/api/notification/subscription')).resolves.toBe('OK');
  });

  it('handles empty successful payload', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response('', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(request('/api/notification/group')).resolves.toBeNull();
  });

  it('supports DELETE requests with JSON body', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse('OK', 200));
    await apiDelete('/api/notification/subscription', 'token', { userId: 1, groupId: 2 });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/notification/subscription');
    expect(options.method).toBe('DELETE');
    expect(options.headers.Authorization).toBe('Bearer token');
    expect(options.body).toBe(JSON.stringify({ userId: 1, groupId: 2 }));
  });
});
