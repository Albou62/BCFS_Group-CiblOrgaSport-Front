import { useCallback, useMemo, useState } from 'react';

const DEFAULT_PARTICIPANTS = [
  { id: 1, nom: 'DURAND Thomas', couloir: 4, resultat: '', statut: 'OK' },
  { id: 2, nom: 'MARTIN Lucas', couloir: 5, resultat: '', statut: 'OK' },
  { id: 3, nom: 'DUBOIS Julie', couloir: 3, resultat: '', statut: 'OK' },
  { id: 4, nom: 'PETIT Pierre', couloir: 6, resultat: '', statut: 'OK' },
];

function parseResult(val) {
  if (val === 'X' || val === '-' || val.toUpperCase() === 'DQ') return -9999;
  return parseFloat(val.replace(',', '.'));
}

export function useEventArbitrage() {
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS);
  const [currentResultType, setCurrentResultType] = useState('chrono');
  const [podium, setPodium] = useState([]);

  const resetForNewEvent = useCallback(() => {
    setCurrentResultType('chrono');
    setPodium([]);
    setParticipants(DEFAULT_PARTICIPANTS.map((p) => ({ ...p, resultat: '', statut: 'OK' })));
  }, []);

  const updateParticipantResult = useCallback((id, resultat) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, resultat } : p)));
  }, []);

  const toggleParticipantStatus = useCallback((id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statut: p.statut === 'OK' ? 'DQ' : 'OK' } : p))
    );
  }, []);

  const importSensors = useCallback(() => {
    alert('📡 Connexion aux capteurs en cours...');
    setTimeout(() => {
      const isDistance = currentResultType === 'distance';
      const randomResults = isDistance ? ['8.52', '8.95', '8.10', 'X'] : ['9.85', '9.92', '10.04', '9.58'];
      setParticipants((prev) => prev.map((p, i) => ({ ...p, resultat: randomResults[i] || '' })));
      alert('✅ Données reçues !');
    }, 800);
  }, [currentResultType]);

  const publishResults = useCallback(() => {
    const valid = participants.filter((p) => p.statut === 'OK' && p.resultat && p.resultat.trim() !== '');

    valid.sort((a, b) => {
      const valA = parseResult(a.resultat);
      const valB = parseResult(b.resultat);
      return currentResultType === 'chrono' ? valA - valB : valB - valA;
    });

    setPodium(valid);
    alert('✅ Résultats publiés ! Le podium a été mis à jour.');
  }, [participants, currentResultType]);

  const suspendEvent = useCallback(() => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir SUSPENDRE ou ANNULER cette épreuve ?\n\nCela enverra une notification immédiate.')) {
      alert('🚫 Épreuve suspendue. Le chronomètre est arrêté.');
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
