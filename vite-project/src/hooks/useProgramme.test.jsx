import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgramme } from './useProgramme';
import { getProgramme, getProgrammeCacheState } from '../services/competitionService';

vi.mock('../services/competitionService', () => ({
  getProgramme: vi.fn(),
  getProgrammeCacheState: vi.fn(),
}));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useProgramme', () => {
  beforeEach(() => {
    vi.mocked(getProgramme).mockReset();
    vi.mocked(getProgrammeCacheState).mockReset();
    vi.mocked(getProgrammeCacheState).mockReturnValue({ isStale: false, updatedAt: Date.now() });
  });

  it('handles loading transitions from pending to resolved', async () => {
    const pending = deferred();
    vi.mocked(getProgramme).mockReturnValueOnce(pending.promise);

    const { result } = renderHook(() => useProgramme({ token: 'token' }));
    await waitFor(() => expect(result.current.loading).toBe(true));

    pending.resolve([{ id: 1, name: 'A', competition: null }]);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(1);
  });

  it('supports refetch and triggers a new load', async () => {
    vi.mocked(getProgramme)
      .mockResolvedValueOnce([{ id: 1, name: 'A', competition: null }])
      .mockResolvedValueOnce([{ id: 2, name: 'B', competition: null }]);

    const { result } = renderHook(() => useProgramme({ token: 'token' }));
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(getProgramme).toHaveBeenCalledTimes(2);
  });

  it('exposes stale state and supports force refetch', async () => {
    vi.mocked(getProgramme).mockResolvedValue([{ id: 1, name: 'A', competition: null }]);
    vi.mocked(getProgrammeCacheState).mockReturnValue({ isStale: true, updatedAt: 1 });

    const { result } = renderHook(() => useProgramme({ token: 'token' }));
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.isStale).toBe(true);

    act(() => {
      result.current.refetch({ force: true });
    });

    await waitFor(() => expect(getProgramme).toHaveBeenCalledTimes(2));
    expect(vi.mocked(getProgramme).mock.calls[1][1]).toMatchObject({ force: true });
  });
});
