import React, { useState } from 'react';
import { useProgramme } from '../hooks/useProgramme';
import CommissaireTabs from '../features/commissaire/components/CommissaireTabs';
import PendingDocsTable from '../features/commissaire/components/PendingDocsTable';
import EventSelectionTable from '../features/commissaire/components/EventSelectionTable';
import ArbitrageToolbar from '../features/commissaire/components/ArbitrageToolbar';
import ParticipantsResultTable from '../features/commissaire/components/ParticipantsResultTable';
import PodiumDisplay from '../features/commissaire/components/PodiumDisplay';
import IncidentPanel from '../features/commissaire/components/IncidentPanel';
import { useEventArbitrage } from '../features/commissaire/hooks/useEventArbitrage';
import { useAuth } from '../context/AuthContext.jsx';

function CommissairePage() {
  const { token, user, logout } = useAuth();
  const [view, setView] = useState('epreuves');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([
    { id: 1, athlete: 'Thomas DURAND', type: 'Passeport', fileName: 'pass_thomas.pdf' },
    { id: 2, athlete: 'Julie DUBOIS', type: 'Certificat', fileName: 'certif.pdf' },
  ]);

  const { data: events } = useProgramme({ token });
  const {
    participants,
    currentResultType,
    podium,
    loading,
    publishing,
    error,
    setCurrentResultType,
    updateParticipantResult,
    toggleParticipantStatus,
    importSensors,
    publishResults,
    suspendEvent,
    resultLabel,
  } = useEventArbitrage({ token, selectedEvent });

  const handleValidateDoc = (id) => {
    setPendingDocs((prev) => prev.filter((d) => d.id !== id));
    alert('✅ Document validé.');
  };

  const handleRejectDoc = (id) => {
    setPendingDocs((prev) => prev.filter((d) => d.id !== id));
    alert('❌ Document refusé.');
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Commissaire</h1>
            <p>Administration & Arbitrage</p>
          </div>
          <div className="spectator-header-right">
            {user?.username && <span>{user.username} (Officiel)</span>}
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <div className="spectator-main-full">
          <CommissaireTabs view={view} onChange={setView} pendingDocsCount={pendingDocs.length} />

          {view === 'admin' && (
            <>
              <p className="text-error">Backend non connecté pour ce module (hors API fournie).</p>
              <PendingDocsTable
                pendingDocs={pendingDocs}
                onReject={handleRejectDoc}
                onValidate={handleValidateDoc}
                apiUrl=""
              />
            </>
          )}

          {view === 'epreuves' && !selectedEvent && (
            <EventSelectionTable events={events} onSelect={handleSelectEvent} />
          )}

          {view === 'epreuves' && selectedEvent && (
            <div className="panel">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>⬅ Retour Liste</button>
                <div style={{textAlign:'right'}}>
                  <h2 style={{margin:0, fontSize:'1.4rem'}}>{selectedEvent.name}</h2>
                  <span style={{color:'#666', fontSize:'0.9rem'}}>{selectedEvent.competitionName}</span>
                </div>
              </div>

              <ArbitrageToolbar
                currentResultType={currentResultType}
                onResultTypeChange={setCurrentResultType}
                onImportSensors={importSensors}
              />
              {loading && <p>Chargement des manches et résultats...</p>}
              {error && <p className="text-error">{error}</p>}

              <ParticipantsResultTable
                participants={participants}
                label={resultLabel}
                onResultChange={updateParticipantResult}
                onToggleStatus={toggleParticipantStatus}
              />

              <div style={{textAlign:'right', paddingBottom:'1rem', borderBottom:'1px solid #eee'}}>
                <button className="btn-primary" onClick={publishResults} style={{fontSize:'1.1rem', padding:'12px 24px'}} disabled={publishing || loading}>
                  {publishing ? 'Publication...' : '✅ Valider & Publier'}
                </button>
              </div>

              <PodiumDisplay podium={podium} />
              <IncidentPanel onSuspend={suspendEvent} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommissairePage;
