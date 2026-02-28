import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createResultat, getManchesByEpreuve, getUpcomingEpreuves } from './competitionService';
import { __competitionServiceInternals } from './competitionService';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('competitionService endpoints', () => {
  beforeEach(() => {
    __competitionServiceInternals.cache.clear();
    __competitionServiceInternals.inFlight.clear();
  });

  it('requests upcoming epreuves through public gateway endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse([]));
    await getUpcomingEpreuves('token', 5);

    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/public/upcoming-epreuves');
    expect(url).toContain('limit=5');
  });

  it('requests manches by epreuve id', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse([]));
    await getManchesByEpreuve('token', 12);

    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/epreuves/12/manches');
  });

  it('posts a result to a manche endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
    await createResultat('token', 8, { athleteId: 1001, temps: '00:00:09.90', statut: 'VALIDE' });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/manches/8/resultats');
    expect(options.method).toBe('POST');
  });
});
