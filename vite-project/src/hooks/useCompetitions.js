import { useCallback, useEffect, useState } from 'react';
import { createCompetition as createCompetitionApi, listCompetitions } from '../services/competitionService';

export function useCompetitions(token) {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listCompetitions(token);
      setCompetitions(data);
    } catch (err) {
      setError(err);
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createCompetition = useCallback(
    async (payload) => {
      if (!token) return null;
      const created = await createCompetitionApi(token, payload);
      await reload();
      return created;
    },
    [reload, token]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { competitions, loading, error, reload, createCompetition };
}
