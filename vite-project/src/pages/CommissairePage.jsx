import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { listPendingDocuments, reviewDocument } from '../services/userService';
import { useProgramme } from '../hooks/useProgramme';

// Tes composants UI
import CommissaireTabs from '../features/commissaire/components/CommissaireTabs';
import PendingDocsTable from '../features/commissaire/components/PendingDocsTable';
import EventSelectionTable from '../features/commissaire/components/EventSelectionTable';
import ArbitrageToolbar from '../features/commissaire/components/ArbitrageToolbar';
import ParticipantsResultTable from '../features/commissaire/components/ParticipantsResultTable';
import PodiumDisplay from '../features/commissaire/components/PodiumDisplay';
import IncidentPanel from '../features/commissaire/components/IncidentPanel';

function CommissairePage() {
  const { token, user, logout } = useAuth();
  const [view, setView] = useState('epreuves');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- 1. PARTIE ADMIN (VRAI BACKEND) ---
  const [pendingDocs, setPendingDocs] = useState([]);
  
  const refreshDocs = useCallback(() => {
    if (token && view === 'admin') {
      listPendingDocuments(token)
        .then(data => setPendingDocs(Array.isArray(data) ? data : []))
        .catch(err => console.error("Erreur API Admin:", err));
    }
  }, [token, view]);

  useEffect(() => { refreshDocs(); }, [refreshDocs]);

  const handleReview = async (id, status) => {
    try {
      await reviewDocument(token, id, status);
      setPendingDocs(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert("Erreur de validation");
    }
  };

  // --- 2. PARTIE ÉPREUVES (VRAI BACKEND + MOCK DE SECOURS SI 500) ---
  const { data: eventsBackend, loading: loadingEvents } = useProgramme({ token });
  
  // Si le backend répond (200), on prend ses données. Si erreur 500, on affiche les mocks.
  const events = (eventsBackend && eventsBackend.length > 0) ? eventsBackend : [
    { id: 1, name: '100m Sprint (Demo)', competitionName: 'Stade de France' },
    { id: 2, name: 'Saut en Hauteur (Demo)', competitionName: 'Arena Bercy' }
  ];

  // --- 3. MOCKS POUR L'ARBITRAGE (On n'utilise plus le hook useEventArbitrage pour éviter les crashs) ---
  const mockParticipants = [
    { athleteId: 101, nom: 'Thomas DURAND', couloir: 4, resultat: '9.58', statut: 'OK' },
    { athleteId: 102, nom: 'Lucas MARTIN', couloir: 5, resultat: '9.72', statut: 'OK' },
    { athleteId: 103, nom: 'Julie DUBOIS', couloir: 3, resultat: '9.81', statut: 'OK' },
  ];

  const mockPodium = [
    { nom: 'Thomas DURAND', resultat: '9.58', athleteId: 101 },
    { nom: 'Lucas MARTIN', resultat: '9.72', athleteId: 102 },
    { nom: 'Julie DUBOIS', resultat: '9.81', athleteId: 103 },
  ];

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Commissaire</h1>
            <p>Gestion {view === 'admin' ? 'Administrative' : 'Arbitrage'}</p>
          </div>
          <div className="spectator-header-right">
            {user?.username && <span style={{marginRight: '15px'}}>{user.username} (Officiel)</span>}
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <div className="spectator-main-full" style={{padding: '20px'}}>
          <CommissaireTabs view={view} onChange={setView} pendingDocsCount={pendingDocs.length} />

          {/* VUE ADMINISTRATIVE : CONNECTÉE AU BACKEND */}
          {view === 'admin' && (
            <div className="panel" style={{marginTop: '20px'}}>
              <h2 className="panel-title">Dossiers à valider</h2>
              <PendingDocsTable 
                pendingDocs={pendingDocs} 
                onValidate={(id) => handleReview(id, 'VALIDE')}
                onReject={(id) => handleReview(id, 'REFUSE')}
              />
            </div>
          )}

          {/* VUE ÉPREUVES : LISTE (RÉEL OU MOCK SI CRASH) */}
          {view === 'epreuves' && !selectedEvent && (
            <div style={{marginTop: '20px'}}>
              {loadingEvents ? (
                 <p>Chargement des épreuves...</p>
              ) : (
                <EventSelectionTable events={events} onSelect={setSelectedEvent} />
              )}
            </div>
          )}

          {/* VUE ARBITRAGE : RÉSULTATS ET PODIUM (MOCKS POUR STABILITÉ) */}
          {view === 'epreuves' && selectedEvent && (
            <div className="panel" style={{marginTop: '20px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
                <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>⬅ Retour</button>
                <div style={{textAlign:'right'}}>
                  <h2 style={{margin:0}}>{selectedEvent.name}</h2>
                  <span style={{color:'#666'}}>{selectedEvent.competitionName}</span>
                </div>
              </div>

              <ArbitrageToolbar currentResultType="chrono" />
              
              <ParticipantsResultTable 
                participants={mockParticipants} 
                label="Temps (s)"
                onResultChange={() => {}} 
                onToggleStatus={() => {}} 
              />

              <div style={{textAlign:'right', marginTop:'20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                <button className="btn-primary" onClick={() => alert("Résultats publiés !")}>
                  ✅ Publier les résultats
                </button>
              </div>

              <div style={{marginTop: '30px'}}>
                <PodiumDisplay podium={mockPodium} />
              </div>

              <IncidentPanel onSuspend={() => alert("Épreuve suspendue")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommissairePage;