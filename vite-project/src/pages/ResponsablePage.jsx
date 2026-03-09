import React, { useState, useEffect } from 'react';
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
import { useNotifications } from '../features/responsable/hooks/useNotification';

function ResponsablePage() {
  // 1. Auth
  const { token, user, logout } = useAuth();

  // 2. Onglet actif
  const [activeTab, setActiveTab] = useState('dashboard');

  // 3. Compétitions / épreuves
  const { competitions, createCompetition } = useCompetitions(token);
  const {
    epreuves,
    createEpreuve,
    selectCompetition,
    selectedCompetition,
  } = useEpreuves(token, { mode: 'byCompetition' });

  // 4. Utilisateurs
  const {
    users,
    error: usersError,
    changeRole,
  } = useUsersAdmin(token);

  const {
  volunteers,
  assignVolunteer,
  loading: volunteersLoading, // On renomme 'loading' en 'volunteersLoading' ici
  error: volunteersError,
  refresh
} = useVolunteerAssignments(token);

  // 6. Notifications (hook)
  const {
    groups,
    loading: loadingGroups,
    error: notificationError,
    loadGroups,
    sendNotification: apiSendNotification,
  } = useNotifications(token);

  // 7. États locaux notifications
  const [selectedGroup, setSelectedGroup] = useState('');
  const [notificationForm, setNotificationForm] = useState({
    label: '',
    impactLevel: 'INFO',
  });

  // 8. Effet : charger les groupes uniquement quand on arrive sur l’onglet notifications
  useEffect(() => {
    if (activeTab === 'notifications') {
      loadGroups();
    }
  }, [activeTab, loadGroups]);

  const stats = {
    connexions_jour: 1250,
    temps_moyen: '14 min',
    utilisateurs_total: 4532,
    volontaires_actifs: 320,
  };

  // 9. Envoi de notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !notificationForm.label.trim()) {
      alert('Groupe et message obligatoires');
      return;
    }

    const payload = {
      groupId: parseInt(selectedGroup, 10),
      label: notificationForm.label,
      impactLevel: notificationForm.impactLevel,
    };

    const result = await apiSendNotification(payload);
    if (result?.success) {
      setNotificationForm({ label: '', impactLevel: 'INFO' });
      alert('✅ Notification envoyée !');
    } else if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <div className="app-container">
      <div className="spectator-shell">
        {/* HEADER */}
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Responsable</h1>
            <p>Pilotage global et administration.</p>
          </div>
          <div className="spectator-header-right">
            <span style={{ marginRight: '1rem', fontSize: '0.9rem' }}>
              {user?.username || 'Admin'} (Admin)
            </span>
            <button className="btn-secondary" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* TABS */}
        <ResponsableTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* CONTENU */}
        <div className="spectator-main-full">
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="panel">
              <h2 className="panel-title">Indicateurs de performance (KPI)</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                <div
                  style={{
                    background: '#f0f9ff',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#0284c7',
                    }}
                  >
                    {stats.connexions_jour}
                  </div>
                  <div style={{ color: '#475569', fontWeight: '500' }}>
                    Connexions / jour
                  </div>
                </div>
                <div
                  style={{
                    background: '#f0fdf4',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#16a34a',
                    }}
                  >
                    {stats.temps_moyen}
                  </div>
                  <div style={{ color: '#475569', fontWeight: '500' }}>
                    Temps moyen passé
                  </div>
                </div>
                <div
                  style={{
                    background: '#fff7ed',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #fed7aa',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#ea580c',
                    }}
                  >
                    {stats.volontaires_actifs}
                  </div>
                  <div style={{ color: '#475569', fontWeight: '500' }}>
                    Volontaires actifs
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMPÉTITIONS */}
          {activeTab === 'competitions' && (
            <div className="panel">
              {!selectedCompetition ? (
                <>
                  <h2 className="panel-title">Gestion des Compétitions</h2>
                  <CompetitionForm onSubmit={createCompetition} />
                  <CompetitionTable
                    competitions={competitions}
                    onSelectCompetition={selectCompetition}
                  />
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <button
                      className="btn-secondary"
                      onClick={() => selectCompetition(null)}
                    >
                      ⬅ Retour Liste
                    </button>
                    <h2 className="panel-title" style={{ margin: 0 }}>
                      Épreuves : {selectedCompetition.name}
                    </h2>
                  </div>
                  <EpreuveForm onSubmit={createEpreuve} />
                  <EpreuveTable epreuves={epreuves} />
                </>
              )}
            </div>
          )}

          {/* UTILISATEURS */}
          {activeTab === 'users' && (
            <div className="panel">
              <h2 className="panel-title">Administration Utilisateurs</h2>
              {usersError && <p className="text-error">{usersError}</p>}
              <UsersTable users={users} onChangeRole={changeRole} />
            </div>
          )}

          {/* VOLONTAIRES */}

{activeTab === 'volontaires' && (
  <div className="panel">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 className="panel-title">Affectation des Volontaires</h2>
        <p className="panel-subtitle">Planification des missions (accueil, transport, médical...) [cite: 41]</p>
      </div>
     <button className="btn-secondary" onClick={() => refresh()}>
  🔄 Actualiser les statuts
</button>
    </div>

    {volunteersLoading && <p>Synchronisation des profils...</p>}
    
    {!volunteersLoading && (
      <VolunteersTable
        volunteers={volunteers}
        onAssign={assignVolunteer} 
      />
    )}
  </div>
)}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="panel">
              <h2 className="panel-title">Envoyer une notification</h2>
              <p className="panel-subtitle">
                Diffusion instantanée vers les groupes abonnés (Kafka).
              </p>

              {notificationError && (
                <div
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    padding: '1rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid #ef4444',
                    marginBottom: '1.5rem',
                  }}
                >
                  ⚠️ {notificationError}
                </div>
              )}

              {loadingGroups ? (
                <div
                  style={{ textAlign: 'center', padding: '3rem' }}
                >
                  Chargement des groupes...
                </div>
              ) : (
                <>
                  {/* Sélection de groupe */}
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontWeight: 600,
                        marginBottom: '0.75rem',
                      }}
                    >
                      Groupe :
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      {groups.length === 0 ? (
                        <span>Aucun groupe disponible</span>
                      ) : (
                        groups.map((group) => (
                          <button
                            key={group.groupId}
                            type="button"
                            onClick={() =>
                              setSelectedGroup(group.groupId)
                            }
                            style={{
                              padding: '0.75rem 1.25rem',
                              borderRadius: '6px',
                              background:
                                selectedGroup === group.groupId
                                  ? '#3b82f6'
                                  : '#f1f5f9',
                              color:
                                selectedGroup === group.groupId
                                  ? 'white'
                                  : '#475569',
                              border: 'none',
                              fontWeight: '500',
                              cursor: 'pointer',
                            }}
                          >
                            {group.groupName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Formulaire notification */}
                  <form
                    onSubmit={handleSendNotification}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <label
                        style={{
                          display: 'block',
                          fontWeight: 600,
                          marginBottom: '0.5rem',
                        }}
                      >
                        Message *
                      </label>
                      <textarea
                        value={notificationForm.label}
                        onChange={(e) =>
                          setNotificationForm({
                            ...notificationForm,
                            label: e.target.value,
                          })
                        }
                        rows="4"
                        placeholder="Urgent : Incident terrain A3 - Intervention immédiate..."
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          resize: 'vertical',
                        }}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label
                        style={{
                          display: 'block',
                          fontWeight: 600,
                          marginBottom: '0.5rem',
                        }}
                      >
                        Niveau
                      </label>
                      <select
                        value={notificationForm.impactLevel}
                        onChange={(e) =>
                          setNotificationForm({
                            ...notificationForm,
                            impactLevel: e.target.value,
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '6px',
                        }}
                      >
                        <option value="INFO">ℹ️ Info</option>
                        <option value="WARNING">⚠️ Avertissement</option>
                        <option value="URGENT">🚨 Urgent</option>
                      </select>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() =>
                          setNotificationForm({
                            label: '',
                            impactLevel: 'INFO',
                          })
                        }
                        style={{ padding: '0.75rem 1.5rem' }}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={
                          !selectedGroup ||
                          !notificationForm.label.trim()
                        }
                        style={{
                          background:
                            !selectedGroup ||
                            !notificationForm.label.trim()
                              ? '#9ca3af'
                              : '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor:
                            !selectedGroup ||
                            !notificationForm.label.trim()
                              ? 'not-allowed'
                              : 'pointer',
                        }}
                      >
                        📢 Envoyer
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResponsablePage;
