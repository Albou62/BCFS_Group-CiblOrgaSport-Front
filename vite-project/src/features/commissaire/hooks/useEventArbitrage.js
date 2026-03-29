import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  createManche,
  createResultat,
  getClassementByManche,
  getManchesByEpreuve,
  getResultatsByManche,
  getPodiumByManche,
  updateResultat,
} from '../../../services/competitionService';

function toClassementType(resultType) {
  return resultType === 'chrono' ? 'TIME_ASC' : 'SCORE_DESC';
}

function uiStatusFromApi(status) {
  return (status === 'VALIDE' || status === 'OK') ? 'OK' : 'DQ';
}

function apiStatusFromUi(status) {
  return status === 'OK' ? 'VALIDE' : 'DSQ';
}

/**
 * Fusionne les inscrits avec les résultats existants du backend.
 * Priorise l'affichage du score (points/distance) si présent,
 * sinon nettoie le format LocalTime pour n'afficher que les secondes.
 */
function mergeParticipants(inscrits, resultatsExistants) {
  // Création d'une Map pour une recherche rapide par ID d'athlète
  const byAthleteId = new Map(
    resultatsExistants.map((item) => [item.athleteId, item])
  );

  return inscrits.map((athlete) => {
    // On gère les deux formats possibles d'ID (selon la source de realInscrits)
    const aid = athlete.athleteId || athlete.id;
    const existing = byAthleteId.get(aid);

    let displayResult = ''; // Valeur par défaut (champ vide)

    if (existing) {
      // 1. PRIORITÉ AU SCORE (Points / Distance)
      // Si score est un nombre (même 0), on l'affiche en priorité
      if (existing.score !== null && existing.score !== undefined) {
        displayResult = existing.score.toString();
      }
      // 2. RÉCUPÉRATION DU TEMPS (Chrono)
      // Si pas de score mais un temps valide (différent de minuit)
      else if (existing.temps && existing.temps !== "00:00:00") {
        const parts = existing.temps.split(':');
        const lastPart = parts[parts.length - 1]; // Récupère "09.58" ou "11"

        // Nettoyage : On enlève les zéros au début (09.58 -> 9.58)
        // La regex /^0+(?=\d)/ garde le 0 si c'est "0.50"
        displayResult = lastPart.replace(/^0+(?=\d)/, '') || '0';
      }
    }

    return {
      athleteId: aid,
      nom: athlete.nom || `${athlete.firstName} ${athlete.lastName}`,
      couloir: athlete.couloir || 0,
      resultat: displayResult,
      statut: existing ? uiStatusFromApi(existing.statut) : 'OK',
      backendResultId: existing?.id || null,
    };
  });
}

export function useEventArbitrage({ token, selectedEvent, realInscrits = [] }) {
  const [participants, setParticipants] = useState([]);
  const [currentResultType, setCurrentResultType] = useState('chrono');
  const [podium, setPodium] = useState([]);
  const [activeManche, setActiveManche] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setParticipants(mergeParticipants(realInscrits, []));
  }, [realInscrits]);

  // Remplace ton ancienne définition par celle-ci :
  const refreshFromBackend = useCallback(async (mancheToUse) => {
    if (!mancheToUse?.id) return;
    try {
      const [resList, podiumDto] = await Promise.all([
        getResultatsByManche(token, mancheToUse.id),
        getPodiumByManche(token, mancheToUse.id)
      ]);

      if (podiumDto) {
        const mapMedal = (res) => {
          if (!res) return null;
          const athlete = realInscrits.find(i =>
            String(i.id) === String(res.athleteId) ||
            String(i.athleteId) === String(res.athleteId)
          );

          let valeurAffichee = "";
          if (currentResultType === 'chrono') {
            valeurAffichee = res.temps ? res.temps.split(':').pop().replace(/^0+(?=\d)/, '') : "0";
          } else {
            valeurAffichee = res.score?.toString() || "0";
          }

          return {
            ...res,
            nom: athlete ? (athlete.nom || `${athlete.firstName} ${athlete.lastName}`) : "Inconnu",
            resultat: valeurAffichee
          };
        };

        setPodium([
          mapMedal(podiumDto.orResultat),
          mapMedal(podiumDto.argentResultat),
          mapMedal(podiumDto.bronzeResultat)
        ].filter(Boolean));
      }

      setParticipants(mergeParticipants(realInscrits, resList));
    } catch (err) {
      console.error("Erreur refresh:", err);
    }
  }, [token, realInscrits, currentResultType]); // Dépendances stables

  useEffect(() => {
    if (!token || !selectedEvent?.id) return;

    const initLoad = async () => {
      setLoading(true);
      try {
        const list = await getManchesByEpreuve(token, selectedEvent.id);
        if (list?.length > 0) {
          setActiveManche(list[0]);
          await refreshFromBackend(list[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initLoad();
  }, [token, selectedEvent?.id, refreshFromBackend]); // selectedEvent.id est plus stable que selectedEvent

  const updateParticipantResult = useCallback((athleteId, resultat) => {
    setParticipants(prev => prev.map(p => p.athleteId === athleteId ? { ...p, resultat } : p));
  }, []);

  const toggleParticipantStatus = useCallback((athleteId) => {
    setParticipants(prev => prev.map(p => p.athleteId === athleteId ? { ...p, statut: p.statut === 'OK' ? 'DQ' : 'OK' } : p));
  }, []);

  const importSensors = useCallback(() => {
    const fake = currentResultType === 'chrono' ? ['9.85', '10.02', '10.15', '9.58'] : ['85', '92', '78', '99'];
    setParticipants(prev => prev.map((p, i) => ({ ...p, resultat: fake[i] || p.resultat })));
  }, [currentResultType]);

  function formatTimeToBackend(val) {
    if (!val) return null;
    const sVal = val.toString().replace(',', '.'); // Gère la virgule
    const [seconds, millis] = sVal.split('.');

    const ss = seconds.padStart(2, '0'); // "9" -> "09"
    const ms = (millis || '0').padEnd(3, '0').substring(0, 3); // "58" -> "580"

    return `00:00:${ss}.${ms}`;
  }



  // Dans publishResults
  const publishResults = useCallback(async () => {
    setPublishing(true);
    try {
      const typePourJava = toClassementType(currentResultType); // 'SCORE_DESC'

      // FORCE la création d'une nouvelle manche pour réinitialiser le tri Java
      const nouvelleManche = await createManche(token, selectedEvent.id, {
        name: 'Classement Points ' + Date.now(),
        typeClassement: typePourJava, // C'est ici que Java comprend qu'il doit trier par score
        ordre: 1
      });
      setActiveManche(nouvelleManche);

      for (const p of participants) {
        const payload = {
          athleteId: Number(p.athleteId),
          statut: p.statut === 'OK' ? 'VALIDE' : 'DSQ',
          temps: currentResultType === 'chrono' ? formatTimeToBackend(p.resultat) : null,
          score: currentResultType !== 'chrono' ? parseFloat(p.resultat) : null
        };

        // On crée les résultats sur la NOUVELLE manche
        await createResultat(token, nouvelleManche.id, payload);
      }

      await getClassementByManche(token, nouvelleManche.id);
      await refreshFromBackend(nouvelleManche);
      alert("Podium mis à jour par points !");
    } catch (err) {
      setError("Erreur de publication");
    } finally {
      setPublishing(false);
    }
  }, [token, participants, currentResultType, selectedEvent]);

  const resultLabel = useMemo(() => {
    switch (currentResultType) {
      case 'chrono':
        return 'Temps (s)';
      case 'distance':
        return 'Distance (m)';
      case 'points':
        return 'Points';
      default:
        return 'Résultat';
    }
  }, [currentResultType]);
  return { participants, currentResultType, setCurrentResultType, podium, loading, publishing, error, updateParticipantResult, toggleParticipantStatus, importSensors, publishResults, resultLabel };
}