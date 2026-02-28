import { useCallback, useEffect, useState } from 'react';
import {
  createManche,
  createResultat,
  getClassementByManche,
  getManchesByEpreuve,
  getResultatsByManche,
  getPodiumByManche,
  updateResultat,
} from '../../../services/competitionService';

const DEFAULT_PARTICIPANTS = [
  { athleteId: 1001, nom: 'DURAND Thomas', couloir: 4 },
  { athleteId: 1002, nom: 'MARTIN Lucas', couloir: 5 },
  { athleteId: 1003, nom: 'DUBOIS Julie', couloir: 3 },
  { athleteId: 1004, nom: 'PETIT Pierre', couloir: 6 },
];

function toClassementType(resultType) {
  return resultType === 'chrono' ? 'TIME_ASC' : 'SCORE_DESC';
}

function uiStatusFromApi(status) {
  return status === 'VALIDE' ? 'OK' : 'DQ';
}

function apiStatusFromUi(status) {
  return status === 'OK' ? 'VALIDE' : 'DSQ';
}

function formatResultValue(resultat, classementType) {
  if (!resultat || !String(resultat).trim()) return { score: null, temps: null };
  const value = String(resultat).trim();
  if (classementType === 'TIME_ASC') {
    if (value.includes(':')) return { score: null, temps: value };
    const normalized = value.replace(',', '.');
    return { score: null, temps: `00:00:${normalized}` };
  }
  const score = Number(value.replace(',', '.'));
  return { score: Number.isFinite(score) ? score : null, temps: null };
}

function podiumToRows(podiumDto) {
  const podiumResults = [podiumDto?.orResultat, podiumDto?.argentResultat, podiumDto?.bronzeResultat].filter(Boolean);
  return podiumResults.map((result) => {
    const participant = DEFAULT_PARTICIPANTS.find((item) => item.athleteId === result.athleteId);
    return {
      nom: participant?.nom || `Athlète ${result.athleteId}`,
      resultat: result.temps || result.score || '-',
      athleteId: result.athleteId,
    };
  });
}

function mergeParticipants(resultats) {
  const byAthleteId = new Map(resultats.map((item) => [item.athleteId, item]));
  return DEFAULT_PARTICIPANTS.map((base) => {
    const existing = byAthleteId.get(base.athleteId);
    return {
      id: base.athleteId,
      athleteId: base.athleteId,
      nom: base.nom,
      couloir: base.couloir,
      resultat: existing?.temps || existing?.score?.toString() || '',
      statut: existing ? uiStatusFromApi(existing.statut) : 'OK',
      backendResultId: existing?.id || null,
    };
  });
}

export function useEventArbitrage({ token, selectedEvent }) {
  const [participants, setParticipants] = useState(mergeParticipants([]));
  const [currentResultType, setCurrentResultType] = useState('chrono');
  const [podium, setPodium] = useState([]);
  const [manches, setManches] = useState([]);
  const [activeManche, setActiveManche] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  const resetForNewEvent = useCallback(() => {
    setCurrentResultType('chrono');
    setPodium([]);
    setManches([]);
    setActiveManche(null);
    setParticipants(mergeParticipants([]));
    setError(null);
  }, []);

  const refreshFromBackend = useCallback(
    async (mancheToUse) => {
      if (!token || !mancheToUse?.id) return;
      const [resultats, podiumDto] = await Promise.all([
        getResultatsByManche(token, mancheToUse.id),
        getPodiumByManche(token, mancheToUse.id).catch(() => null),
      ]);

      setParticipants(mergeParticipants(Array.isArray(resultats) ? resultats : []));
      setPodium(podiumDto ? podiumToRows(podiumDto) : []);
      setCurrentResultType(mancheToUse.typeClassement === 'TIME_ASC' ? 'chrono' : 'points');
    },
    [token]
  );

  useEffect(() => {
    if (!token || !selectedEvent?.id) {
      resetForNewEvent();
      return;
    }

    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const manchesData = await getManchesByEpreuve(token, selectedEvent.id);
        if (!active) return;
        const list = Array.isArray(manchesData) ? manchesData : [];
        setManches(list);
        if (list.length === 0) {
          setActiveManche(null);
          setParticipants(mergeParticipants([]));
          setPodium([]);
          return;
        }

        const firstManche = list[0];
        setActiveManche(firstManche);
        await refreshFromBackend(firstManche);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Impossible de charger les données d'arbitrage.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [token, selectedEvent, refreshFromBackend, resetForNewEvent]);

  const ensureActiveManche = useCallback(async () => {
    if (activeManche?.id) return activeManche;
    if (!selectedEvent?.id || !token) return null;

    const classement = toClassementType(currentResultType);
    const created = await createManche(token, selectedEvent.id, {
      name: 'Finale',
      typeClassement: classement,
      ordre: 1,
    });

    setManches((prev) => [...prev, created].sort((a, b) => a.ordre - b.ordre));
    setActiveManche(created);
    return created;
  }, [activeManche, currentResultType, selectedEvent, token]);

  const updateParticipantResult = useCallback((athleteId, resultat) => {
    setParticipants((prev) => prev.map((p) => (p.athleteId === athleteId ? { ...p, resultat } : p)));
  }, []);

  const toggleParticipantStatus = useCallback((athleteId) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.athleteId === athleteId
          ? { ...p, statut: p.statut === 'OK' ? 'DQ' : 'OK' }
          : p
      )
    );
  }, []);

  const importSensors = useCallback(() => {
    const randomResults =
      currentResultType === 'chrono'
        ? ['9.85', '9.92', '10.04', '9.58']
        : ['8.52', '8.95', '8.10', '7.98'];
    setParticipants((prev) => prev.map((p, i) => ({ ...p, resultat: randomResults[i] || '' })));
  }, [currentResultType]);

  const publishResults = useCallback(async () => {
    if (!token || !selectedEvent?.id) return;
    setPublishing(true);
    setError(null);

    try {
      const manche = await ensureActiveManche();
      if (!manche?.id) {
        throw new Error('Aucune manche active.');
      }

      const classementType = manche.typeClassement || toClassementType(currentResultType);
      for (const participant of participants) {
        const statut = apiStatusFromUi(participant.statut);
        const { score, temps } = formatResultValue(participant.resultat, classementType);

        if (statut === 'VALIDE' && classementType === 'TIME_ASC' && !temps) continue;
        if (statut === 'VALIDE' && classementType === 'SCORE_DESC' && score === null) continue;

        if (participant.backendResultId) {
          await updateResultat(token, manche.id, participant.backendResultId, { score, temps, statut });
        } else {
          try {
            await createResultat(token, manche.id, {
              athleteId: participant.athleteId,
              score,
              temps,
              statut,
            });
          } catch (err) {
            if (err?.status === 409) {
              throw new Error(`Résultat déjà existant pour l'athlète ${participant.athleteId}.`);
            }
            throw err;
          }
        }
      }

      await getClassementByManche(token, manche.id).catch(() => null);
      await refreshFromBackend(manche);
    } catch (err) {
      setError(err?.message || 'Erreur lors de la publication des résultats.');
    } finally {
      setPublishing(false);
    }
  }, [currentResultType, ensureActiveManche, participants, refreshFromBackend, selectedEvent, token]);

  const suspendEvent = useCallback(() => {
    if (window.confirm("⚠️ Suspendre/annuler l'épreuve ?")) {
      setError("Action locale uniquement: publication d'incident non connectée (API non fournie).");
    }
  }, []);

  const resultLabel = useMemo(() => {
    if (currentResultType === 'distance') return 'Distance (m)';
    if (currentResultType === 'points') return 'Points';
    return 'Temps';
  }, [currentResultType]);

  return {
    participants,
    currentResultType,
    podium,
    manches,
    activeManche,
    loading,
    publishing,
    error,
    setCurrentResultType,
    resetForNewEvent,
    updateParticipantResult,
    toggleParticipantStatus,
    importSensors,
    publishResults,
    suspendEvent,
    resultLabel,
  };
}
