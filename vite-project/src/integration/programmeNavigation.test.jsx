import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Link, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useProgramme } from '../hooks/useProgramme';

const PROGRAMME_SAMPLE = [
  {
    id: 1,
    name: '100m',
    horairePublic: '2026-02-28T10:00:00.000Z',
    competitionId: 1,
    competitionName: 'Comp A',
    competition: { id: 1, name: 'Comp A' },
  },
];

let programmeRequests = 0;
const cache = new Map();

vi.mock('../services/competitionService', () => ({
  getProgramme: vi.fn(async (token) => {
    if (!cache.has(token)) {
      programmeRequests += 1;
      cache.set(token, PROGRAMME_SAMPLE);
    }
    return cache.get(token);
  }),
  getProgrammeCacheState: vi.fn(() => ({ isStale: false, updatedAt: Date.now() })),
}));

function VolontaireScreen() {
  const { data } = useProgramme({ token: 'token' });
  return (
    <div>
      <div data-testid="vol-count">{data.length}</div>
      <Link to="/commissaire">Go commissaire</Link>
    </div>
  );
}

function CommissaireScreen() {
  const { data } = useProgramme({ token: 'token' });
  return <div data-testid="com-count">{data.length}</div>;
}

describe('programme request reuse between role pages', () => {
  it('does not re-trigger identical programme fetch when navigating within TTL', async () => {
    programmeRequests = 0;
    cache.clear();

    render(
      <MemoryRouter initialEntries={['/volontaire']}>
        <Routes>
          <Route path="/volontaire" element={<VolontaireScreen />} />
          <Route path="/commissaire" element={<CommissaireScreen />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('vol-count')).toHaveTextContent('1'));
    fireEvent.click(screen.getByText('Go commissaire'));
    await waitFor(() => expect(screen.getByTestId('com-count')).toHaveTextContent('1'));
    expect(programmeRequests).toBe(1);
  });
});
