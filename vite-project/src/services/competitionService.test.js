import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __competitionServiceInternals,
  getCompetitions,
} from './competitionService';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('competitionService caching and in-flight behavior', () => {
  beforeEach(() => {
    __competitionServiceInternals.cache.clear();
    __competitionServiceInternals.inFlight.clear();
    vi.useRealTimers();
  });

  it('handles cache hit/miss across TTL boundary', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-28T08:00:00.000Z'));
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse([{ id: 1, name: 'A' }])));

    await getCompetitions('token');
    await getCompetitions('token');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(__competitionServiceInternals.CACHE_TTL_MS + 1);
    await getCompetitions('token');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('dedupes in-flight requests for the same cache key', async () => {
    const pending = deferred();
    global.fetch = vi.fn().mockReturnValue(pending.promise);

    const p1 = getCompetitions('token', { force: true });
    const p2 = getCompetitions('token', { force: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    pending.resolve(jsonResponse([{ id: 1 }]));
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual(r2);
  });

  it('returns ABORTED when request is canceled via AbortSignal', async () => {
    const pending = deferred();
    global.fetch = vi.fn().mockReturnValue(pending.promise);
    const controller = new AbortController();

    const promise = getCompetitions('token', { force: true, signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toMatchObject({
      code: 'ABORTED',
      status: 0,
    });

    pending.resolve(jsonResponse([]));
    await Promise.resolve();
  });
});
