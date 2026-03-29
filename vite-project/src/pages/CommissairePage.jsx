import { useAuth } from '../context/AuthContext.jsx';
import { listPendingDocuments, reviewDocument, getParticipantsByEpreuve } from '../services/userService';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CommissaireTabs from '../features/commissaire/components/CommissaireTabs';
import PendingDocsTable from '../features/commissaire/components/PendingDocsTable';
import EventSelectionTable from '../features/commissaire/components/EventSelectionTable';
import ArbitrageToolbar from '../features/commissaire/components/ArbitrageToolbar';
import ParticipantsResultTable from '../features/commissaire/components/ParticipantsResultTable';
import PodiumDisplay from '../features/commissaire/components/PodiumDisplay';
import IncidentPanel from '../features/commissaire/components/IncidentPanel';
import { useEventArbitrage } from '../features/commissaire/hooks/useEventArbitrage';

function CommissairePage() {
  const { token, user, logout } = useAuth();

  const [view, setView] = useState('epreuves');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [errorEvents, setErrorEvents] = useState(null);
  // 1. DÉCLARER l'état d'abord

  const [realParticipants, setRealParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // 2. EXTRAIRE currentResultType et les autres du hook
  const {
    participants,
    currentResultType,
    setCurrentResultType,
    importSensors,
    updateParticipantResult,
    toggleParticipantStatus,
    publishResults,
    resultLabel,
    podium,
    loading: loadingArbitrage,
    publishing,
    error: errorArbitrage
  } = useEventArbitrage({
    token,
    selectedEvent,
    realInscrits: realParticipants
  });

  // --- 1. GESTION ADMINISTRATIVE  
  const [pendingDocs, setPendingDocs] = useState([]);
  const refreshDocs = useCallback(() => {
    if (token) {
      listPendingDocuments(token)
        .then(data => setPendingDocs(Array.isArray(data) ? data : []))
        .catch(err => console.error("Erreur API Admin Docs:", err));
    }
  }, [token]);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  const handleReview = async (id, status) => {
    try {
      await reviewDocument(token, id, status);
      setPendingDocs(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert("Erreur de validation");
    }
  };

  // --- 2. CHARGEMENT DU PROGRAMME ---
  useEffect(() => {
    if (view !== 'epreuves' || !token) return;
    setLoadingEvents(true);
    fetch('http://localhost:8080/api/public/epreuves', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const valid = data.filter(e => e.name).sort((a, b) => new Date(a.horairePublic) - new Date(b.horairePublic));
        setEvents(valid);
      })
      .catch(() => setErrorEvents("Erreur serveur"))
      .finally(() => setLoadingEvents(false));
  }, [view, token]);


  // --- 3. ARBITRAGE 
  const [loadingInscrits, setLoadingInscrits] = useState(false);

  const handleSelectEvent = async (event) => {
    setSelectedEvent(event);
    setLoadingInscrits(true);
    try {
      const data = await getParticipantsByEpreuve(token, event.id);
      const formatted = data.map((p) => ({
        athleteId: p.id,
        nom: (p.firstName && p.lastName) ? `${p.firstName} ${p.lastName}` : (p.username || "Inconnu"),
        username: p.username,
        resultat: '',
        statut: 'OK'
      }));
      setRealParticipants(formatted);
    } catch (err) {
      setRealParticipants([]);
    } finally {
      setLoadingInscrits(false);
    }
  };

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Commissaire</h1>
            <p>{view === 'admin' ? 'Validation des dossiers' : 'Arbitrage et Chronométrage'}</p>
          </div>
          <div className="spectator-header-right">
            <span style={{ marginRight: '15px', fontWeight: 'bold' }}>{user?.username} (Officiel)</span>
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <div className="spectator-main-full" style={{ padding: '20px' }}>
          {/* Navigation par Onglets */}
          <CommissaireTabs
            view={view}
            onChange={setView}
            pendingDocsCount={pendingDocs.length}
          />

          {/* VUE 1 : VALIDATION ADMINISTRATIVE (Arthur) */}
          {view === 'admin' && (
            <div className="panel" style={{ marginTop: '20px' }}>
              <h2 className="panel-title">📂 Documents en attente</h2>
              <PendingDocsTable
                pendingDocs={pendingDocs}
                onValidate={(id) => handleReview(id, 'VALIDE')}
                onReject={(id) => handleReview(id, 'REFUSE')}
              />
            </div>
          )}

          {/* VUE 2 : SÉLECTION DE L'ÉPREUVE (Liste Globale) */}
          {view === 'epreuves' && !selectedEvent && (
            <div style={{ marginTop: '20px' }}>
              <h2 className="panel-title">📅 Liste des épreuves</h2>
              {loadingEvents ? (
                <p style={{ textAlign: 'center' }}>🔄 Chargement du catalogue...</p>
              ) : errorEvents ? (
                <p style={{ color: '#dc2626' }}>⚠️ {errorEvents}</p>
              ) : (
                <EventSelectionTable events={events} onSelect={handleSelectEvent} />
              )}
            </div>
          )}

          {/* VUE 3 : INTERFACE D'ARBITRAGE (Saisie active) */}
          {view === 'epreuves' && selectedEvent && (
            <div className="panel" style={{ marginTop: '20px', borderTop: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>⬅ Retour</button>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: 0, color: '#1e3a8a' }}>{selectedEvent.name}</h2>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>📍 {selectedEvent.competitionName}</span>
                </div>
              </div>

              {/* Barre d'outils pour changer le mode (Chrono / Points) */}
              <ArbitrageToolbar
                currentResultType={currentResultType}
                onResultTypeChange={setCurrentResultType}
                onImportSensors={importSensors}
              />

              {loadingParticipants || loadingArbitrage ? (
                <p style={{ textAlign: 'center', padding: '40px' }}>⏳ Préparation de la feuille de match...</p>
              ) : participants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', border: '2px dashed #e2e8f0' }}>
                  Aucun athlète n'est inscrit à cette épreuve.
                </div>
              ) : (
                <>
                  {/* TABLEAU DE SAISIE CONNECTÉ AU HOOK */}
                  <ParticipantsResultTable
                    participants={participants}
                    label={resultLabel}
                    onResultChange={updateParticipantResult}
                    onToggleStatus={toggleParticipantStatus}
                  />

                  {/* BOUTON DE PUBLICATION VERS LE BACKEND */}
                  <div style={{ textAlign: 'right', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    {errorArbitrage && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorArbitrage}</p>}
                    <button
                      className="btn-primary"
                      onClick={publishResults}
                      disabled={publishing}
                      style={{ opacity: publishing ? 0.7 : 1 }}
                    >
                      {publishing ? "⏳ Enregistrement..." : "✅ Publier les Résultats Officiels"}
                    </button>
                  </div>

                  {/* AFFICHAGE DU PODIUM CALCULÉ PAR LE HOOK */}
                  {podium && podium.length > 0 && (
                    <div style={{ marginTop: '40px' }}>
                      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📊 Aperçu du Podium</h3>
                      <PodiumDisplay podium={podium} />
                    </div>
                  )}
                </>
              )}

              <IncidentPanel onSuspend={() => alert("Épreuve suspendue. Incident notifié.")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

}

export default CommissairePage;