import React, { useState } from 'react';
import { useCompetitions } from '../hooks/useCompetitions';
import { useEpreuves } from '../hooks/useEpreuves';
import ResponsableTabs from '../features/responsable/components/ResponsableTabs';
import CompetitionForm from '../features/responsable/components/CompetitionForm';
import CompetitionTable from '../features/responsable/components/CompetitionTable';
import EpreuveForm from '../features/responsable/components/EpreuveForm';
import EpreuveTable from '../features/responsable/components/EpreuveTable';
import UsersTable from '../features/responsable/components/UsersTable';
import VolunteersTable from '../features/responsable/components/VolunteersTable';
import { useUsersAdmin } from '../features/responsable/hooks/useUsersAdmin';
import { useVolunteerAssignments } from '../features/responsable/hooks/useVolunteerAssignments';
import { useAuth } from '../context/AuthContext.jsx';

function ResponsablePage() {
  const { token, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { competitions, createCompetition } = useCompetitions(token);
  const {
    epreuves,
    createEpreuve,
    selectCompetition,
    selectedCompetition,
  } = useEpreuves(token, { mode: 'byCompetition' });

  const { users, error: usersError, changeRole } = useUsersAdmin(token);
  const { volunteers, assignVolunteer } = useVolunteerAssignments();

  const stats = {
    connexions_jour: 1250,
    temps_moyen: '14 min',
    utilisateurs_total: 4532,
    volontaires_actifs: 320,
  };

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Responsable</h1>
            <p>Pilotage global et administration.</p>
          </div>
          <div className="spectator-header-right">
            <span style={{marginRight:'1rem', fontSize:'0.9rem'}}>{user?.username || 'Admin'} (Admin)</span>
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <ResponsableTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="spectator-main-full">
          {activeTab === 'dashboard' && (
            <div className="panel">
              <h2 className="panel-title">Indicateurs de performance (KPI)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border:'1px solid #bae6fd' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0284c7' }}>{stats.connexions_jour}</div>
                  <div style={{ color: '#475569', fontWeight:'500' }}>Connexions / jour</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border:'1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{stats.temps_moyen}</div>
                  <div style={{ color: '#475569', fontWeight:'500' }}>Temps moyen passé</div>
                </div>
                <div style={{ background: '#fff7ed', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border:'1px solid #fed7aa' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c' }}>{stats.volontaires_actifs}</div>
                  <div style={{ color: '#475569', fontWeight:'500' }}>Volontaires actifs</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'competitions' && (
            <div className="panel">
              {!selectedCompetition ? (
                <>
                  <h2 className="panel-title">Gestion des Compétitions</h2>
                  <CompetitionForm onSubmit={createCompetition} />
                  <CompetitionTable competitions={competitions} onSelectCompetition={selectCompetition} />
                </>
              ) : (
                <>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                    <button className="btn-secondary" onClick={() => selectCompetition(null)}>⬅ Retour Liste</button>
                    <h2 className="panel-title" style={{margin:0}}>Épreuves : {selectedCompetition.name}</h2>
                  </div>
                  <EpreuveForm onSubmit={createEpreuve} />
                  <EpreuveTable epreuves={epreuves} />
                </>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="panel">
              <h2 className="panel-title">Administration Utilisateurs</h2>
              {usersError && <p className="text-error">{usersError}</p>}
              <UsersTable users={users} onChangeRole={changeRole} />
            </div>
          )}

          {activeTab === 'volontaires' && (
            <div className="panel">
              <h2 className="panel-title">Affectation des Volontaires</h2>
              <p className="panel-subtitle">Assignez les tâches du jour aux équipes terrain.</p>
              <p className="text-error">Backend non connecté pour ce module (hors API fournie).</p>
              <VolunteersTable volunteers={volunteers} onAssign={assignVolunteer} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResponsablePage;
