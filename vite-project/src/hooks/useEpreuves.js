import { useCallback, useEffect, useState } from 'react';
import {
  createEpreuve as createEpreuveApi,
  listAllEpreuvesWithCompetition,
  listEpreuvesByCompetition,
} from '../services/competitionService';

const identityMapItem = (item) => item;

export function useEpreuves(token, options = {}) {
  const { mode = 'byCompetition', mapItem = identityMapItem } = options;

  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [epreuves, setEpreuves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!token) return;
    if (mode === 'byCompetition' && !selectedCompetition) {
      setEpreuves([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === 'all') {
        const data = await listAllEpreuvesWithCompetition(token, mapItem);
        setEpreuves(data);
      } else {
        const data = await listEpreuvesByCompetition(token, selectedCompetition.id);
        setEpreuves(data.map((item) => mapItem(item, selectedCompetition)));
      }
    } catch (err) {
      setError(err);
      setEpreuves([]);
    } finally {
      setLoading(false);
    }
  }, [token, mode, selectedCompetition, mapItem]);

  const createEpreuve = useCallback(
    async (payload) => {
      if (!token || !selectedCompetition) return null;
      const created = await createEpreuveApi(token, selectedCompetition.id, payload);
      await reload();
      return created;
    },
    [reload, selectedCompetition, token]
  );

  const selectCompetition = useCallback((competition) => {
    setSelectedCompetition(competition);
  }, []);

  useEffect(() => {
    if (mode === 'all') reload();
  }, [mode, reload]);

  useEffect(() => {
    if (mode === 'byCompetition') reload();
  }, [mode, reload, selectedCompetition]);

  return {
    epreuves,
    loading,
    error,
    reload,
    createEpreuve,
    selectCompetition,
    selectedCompetition,
  };
}
