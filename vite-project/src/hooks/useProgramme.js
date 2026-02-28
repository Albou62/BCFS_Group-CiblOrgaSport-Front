import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProgramme, getProgrammeCacheState } from '../services/competitionService';

function defaultSort(a, b) {
  const ta = a.horairePublic ? new Date(a.horairePublic).getTime() : Number.MAX_SAFE_INTEGER;
  const tb = b.horairePublic ? new Date(b.horairePublic).getTime() : Number.MAX_SAFE_INTEGER;
  if (ta !== tb) return ta - tb;
  return String(a.name || '').localeCompare(String(b.name || ''), 'fr');
}

export function useProgramme({
  token,
  enabled = true,
  forceRefresh,
  mapper = (item) => item,
  sortBy,
} = {}) {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshState, setRefreshState] = useState({ key: 0, force: false });

  const load = useCallback(
    async ({ force = false, signal } = {}) => {
      if (!token || !enabled) return;
      setLoading(true);
      setError(null);
      try {
        const next = await getProgramme(token, { signal, force });
        setRaw(Array.isArray(next) ? next : []);
      } catch (err) {
        if (err?.code === 'ABORTED') return;
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [enabled, token]
  );

  useEffect(() => {
    if (!token || !enabled) {
      setRaw([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    load({
      force: Boolean(forceRefresh) || refreshState.force,
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [token, enabled, forceRefresh, refreshState, load]);

  const refetch = useCallback((options = {}) => {
    setRefreshState((prev) => ({
      key: prev.key + 1,
      force: Boolean(options.force),
    }));
  }, []);

  const data = useMemo(() => {
    const mapped = raw.map((item) => mapper(item, item.competition));
    const sortFn = typeof sortBy === 'function' ? sortBy : defaultSort;
    return [...mapped].sort(sortFn);
  }, [mapper, raw, sortBy]);

  const isStale = useMemo(() => {
    if (!token) return true;
    return getProgrammeCacheState(token).isStale;
  }, [token, raw]);

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
  };
}
