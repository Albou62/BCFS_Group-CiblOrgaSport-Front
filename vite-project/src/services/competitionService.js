import { apiGet, apiPost } from './httpClient';

const CACHE_TTL_MS = 45_000;
const cache = new Map();
const inFlight = new Map();

const DEBUG_COMPETITION_SERVICE = false;
function debugLog(...args) {
  if (DEBUG_COMPETITION_SERVICE) {
    // Temporary during rollout; remove once migration is validated.
    // eslint-disable-next-line no-console
    console.debug('[competitionService]', ...args);
  }
}

function buildCacheKey(type, token, suffix = '') {
  return `${type}:${token || 'anon'}:${suffix}`;
}

function isFresh(entry) {
  if (!entry) return false;
  return Date.now() - entry.updatedAt < CACHE_TTL_MS;
}

function withAbort(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) {
    return Promise.reject({
      code: 'ABORTED',
      message: 'Request was aborted',
      status: 0,
      cause: null,
    });
  }

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject({
        code: 'ABORTED',
        message: 'Request was aborted',
        status: 0,
        cause: null,
      });
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      }
    );
  });
}

function fetchWithCache(key, fetcher, { force = false, signal } = {}) {
  const cached = cache.get(key);
  if (!force && isFresh(cached)) {
    debugLog('cache hit', key);
    return withAbort(Promise.resolve(cached.value), signal);
  }

  if (inFlight.has(key)) {
    debugLog('in-flight reuse', key);
    return withAbort(inFlight.get(key), signal);
  }

  const promise = (async () => {
    const value = await fetcher();
    cache.set(key, { value, updatedAt: Date.now() });
    return value;
  })().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return withAbort(promise, signal);
}

function sortProgramme(a, b) {
  const ta = a.horairePublic ? new Date(a.horairePublic).getTime() : Number.MAX_SAFE_INTEGER;
  const tb = b.horairePublic ? new Date(b.horairePublic).getTime() : Number.MAX_SAFE_INTEGER;
  if (ta !== tb) return ta - tb;
  const nameCompare = String(a.name || '').localeCompare(String(b.name || ''), 'fr');
  if (nameCompare !== 0) return nameCompare;
  return String(a.id || '').localeCompare(String(b.id || ''), 'fr');
}

async function fetchProgrammeAggregated(token, { signal }) {
  const aggregated = await apiGet('/api/epreuves?includeCompetition=true', token, { signal });
  if (!Array.isArray(aggregated)) return [];
  return aggregated
    .map((epreuve) => ({
      ...epreuve,
      competitionId: epreuve.competitionId ?? epreuve.competition?.id ?? null,
      competitionName: epreuve.competitionName ?? epreuve.competition?.name ?? '-',
      competition: epreuve.competition ?? null,
    }))
    .sort(sortProgramme);
}

async function runWithConcurrency(items, worker, concurrency) {
  if (!items.length) return [];
  const maxConcurrency = Math.max(1, Math.min(concurrency || items.length, items.length));
  const results = new Array(items.length);
  let next = 0;

  async function execute() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: maxConcurrency }, execute));
  return results;
}

export function getCompetitions(token, options = {}) {
  const key = buildCacheKey('competitions', token);
  return fetchWithCache(key, () => apiGet('/api/competitions', token, { signal: options.signal }), options);
}

export function createCompetition(token, payload, options = {}) {
  return apiPost('/api/competitions', token, payload, { signal: options.signal }).then((created) => {
    cache.delete(buildCacheKey('competitions', token));
    cache.delete(buildCacheKey('programme', token));
    return created;
  });
}

export function getEpreuvesByCompetition(token, competitionId, options = {}) {
  const key = buildCacheKey('epreuvesByCompetition', token, String(competitionId));
  return fetchWithCache(
    key,
    () => apiGet(`/api/competitions/${competitionId}/epreuves`, token, { signal: options.signal }),
    options
  );
}

export function createEpreuve(token, competitionId, payload, options = {}) {
  return apiPost(`/api/competitions/${competitionId}/epreuves`, token, payload, { signal: options.signal }).then((created) => {
    cache.delete(buildCacheKey('epreuvesByCompetition', token, String(competitionId)));
    cache.delete(buildCacheKey('programme', token));
    return created;
  });
}

export async function getProgramme(token, options = {}) {
  const { signal, force = false, concurrency } = options;
  const key = buildCacheKey('programme', token);

  return fetchWithCache(
    key,
    async () => {
      try {
        return await fetchProgrammeAggregated(token, { signal });
      } catch (error) {
        if (![400, 404, 405, 501].includes(error?.status)) {
          throw error;
        }
      }

      const competitions = await getCompetitions(token, { signal, force });
      const nested = await runWithConcurrency(
        competitions,
        async (competition) => {
          try {
            const epreuves = await getEpreuvesByCompetition(token, competition.id, { signal, force });
            return epreuves.map((epreuve) => ({
              ...epreuve,
              competitionId: competition.id,
              competitionName: competition.name,
              competition,
            }));
          } catch {
            return [];
          }
        },
        concurrency
      );

      return nested.flat().sort(sortProgramme);
    },
    { force, signal }
  );
}

export function getProgrammeCacheState(token) {
  const key = buildCacheKey('programme', token);
  const entry = cache.get(key);
  if (!entry) return { isStale: true, updatedAt: null };
  return {
    isStale: !isFresh(entry),
    updatedAt: entry.updatedAt,
  };
}

export function listCompetitions(token, options = {}) {
  return getCompetitions(token, options);
}

export function listEpreuvesByCompetition(token, competitionId, options = {}) {
  return getEpreuvesByCompetition(token, competitionId, options);
}

export async function listAllEpreuvesWithCompetition(token, mapItem = (epreuve) => epreuve, options = {}) {
  const programme = await getProgramme(token, options);
  return programme.map((epreuve) => mapItem(epreuve, epreuve.competition));
}

export const __competitionServiceInternals = { cache, inFlight, CACHE_TTL_MS };
