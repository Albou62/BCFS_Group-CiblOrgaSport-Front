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

  // Récupération des données via vos hooks personnalisés
  const { competitions, createCompetition } = useCompetitions(token);
  const {
    epreuves,
    createEpreuve,
    selectCompetition,
    selectedCompetition,
  } = useEpreuves(token, { mode: 'byCompetition' });

  const { users, error: usersError, changeRole } = useUsersAdmin(token);
const { volunteers, assignVolunteer } = useVolunteerAssignments(token);
  // Statistiques fictives pour le dashboard (à connecter au back plus tard si besoin)
  const stats = {
    connexions_jour: 1250,
    temps_moyen: '14 min',
    utilisateurs_total: 4532,
    volontaires_actifs: 320,
  };

  return (
    <div className="app-container">
      <div className="spectator-shell">
        
        {/* En-tête de la page */}
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Responsable</h1>
            <p>Pilotage global et administration.</p>
          </div>
          <div className="spectator-header-right">
            <span style={{marginRight:'1rem', fontSize:'0.9rem'}}>
              {user?.username || 'Admin'} (Admin)
            </span>
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        {/* Navigation entre les onglets */}
        <ResponsableTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Contenu principal */}
        <div className="spectator-main-full">
          
          {/* ONGLET : DASHBOARD */}
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

          {/* ONGLET : COMPÉTITIONS ET ÉPREUVES */}
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

          {/* ONGLET : UTILISATEURS */}
          {activeTab === 'users' && (
            <div className="panel">
              <h2 className="panel-title">Administration Utilisateurs</h2>
              {usersError && <p className="text-error" style={{ color: 'red' }}>{usersError}</p>}
              <UsersTable users={users} onChangeRole={changeRole} />
            </div>
          )}

          {/* ONGLET : VOLONTAIRES */}
          {activeTab === 'volontaires' && (
            <div className="panel">
              <h2 className="panel-title">Affectation des Volontaires</h2>
              <p className="panel-subtitle">Assignez les tâches du jour aux équipes terrain.</p>
              
              {/* Si la liste des volontaires est vide, on affiche un message clair */}
              {(!volunteers || volunteers.length === 0) ? (
                <div style={{ background: '#fef2f2', padding: '1rem', borderLeft: '4px solid #ef4444', marginTop: '1rem' }}>
                  <p style={{ color: '#991b1b', margin: 0 }}>
                    <strong>Aucun volontaire disponible.</strong> <br/>
                    (La base de données ne contient aucun utilisateur avec le rôle VOLONTAIRE pour le moment).
                  </p>
                </div>
              ) : (
                <VolunteersTable volunteers={volunteers} onAssign={assignVolunteer} />
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ResponsablePage;