import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

function ResponsablePage({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- ÉTATS DONNÉES ---
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  
  // États Formulaire Compétition
  const [name, setName] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // États Gestion Épreuves 
  const [selectedComp, setSelectedComp] = useState(null); 
  const [epreuves, setEpreuves] = useState([]);           
  const [epreuveName, setEpreuveName] = useState('');     
  const [horairePublic, setHorairePublic] = useState('');
  const [horaireAthletes, setHoraireAthletes] = useState('');

  // États Gestion Volontaires (Données simulées pour l'exemple)
  const [volunteers, setVolunteers] = useState([
      { id: 1, name: 'Hector', role: 'VOLONTAIRE', assignment: 'Non assigné' },
      { id: 2, name: 'Jean', role: 'VOLONTAIRE', assignment: 'Non assigné' },
      { id: 3, name: 'Sophie', role: 'VOLONTAIRE', assignment: 'Non assigné' }
  ]);
  
  const today = new Date().toISOString().split('T')[0];

  // Stats simulées
  const stats = {
    connexions_jour: 1250,         
    temps_moyen: '14 min',         
    utilisateurs_total: 4532,      
    volontaires_actifs: 320       
  };

  // --- API CALLS ---

  // 1. Charger Utilisateurs
  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
  };

  // 2. Changer Rôle
  const handleChangeRole = async (userId, newRole) => {
      try {
        await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role: newRole }),
        });
        loadUsers();
      } catch (e) { console.error(e); }
  };

  // 3. Charger Compétitions
  const loadCompetitions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/competitions`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setCompetitions(await res.json());
      } catch (e) { console.error(e); }
  };

  // 4. Créer Compétition
  const handleCreateCompetition = async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_URL}/api/competitions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, dateDebut, dateFin }),
        });
        setName(''); setDateDebut(''); setDateFin('');
        loadCompetitions();
      } catch (e) { console.error(e); }
  };

  // 5. Charger Épreuves d'une compétition
  const openCompetitionDetails = async (comp) => {
    setSelectedComp(comp);
    try {
        const res = await fetch(`${API_URL}/api/competitions/${comp.id}/epreuves`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setEpreuves(await res.json());
        else setEpreuves([]); 
    } catch (e) { console.error(e); setEpreuves([]); }
  };

  // 6. Créer Épreuve
  const handleCreateEpreuve = async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${API_URL}/api/competitions/${selectedComp.id}/epreuves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: epreuveName, horairePublic, horaireAthletes })
        });
        if(res.ok) {
            setEpreuveName(''); setHorairePublic(''); setHoraireAthletes('');
            openCompetitionDetails(selectedComp); // Recharger la liste
        }
      } catch (e) { console.error(e); }
  };

  // 7. Simulation Assignation Volontaire
  const handleAssignVolunteer = (id, task) => {
      setVolunteers(volunteers.map(v => v.id === id ? {...v, assignment: task} : v));
  };

  useEffect(() => {
    if (token) { loadUsers(); loadCompetitions(); }
  }, [token]);

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Responsable</h1>
            <p>Pilotage global et administration.</p>
          </div>
          <div className="spectator-header-right">
            <span style={{marginRight:'1rem', fontSize:'0.9rem'}}>Marius (Admin)</span>
            <button className="btn-secondary" onClick={onLogout}>Déconnexion</button>
          </div>
        </div>

        {/* --- NAVIGATION DES ONGLETS --- */}
        <div style={{ display:'flex', gap:'1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom:'10px' }}>
          <button className={`btn-secondary ${activeTab === 'dashboard' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
          <button className={`btn-secondary ${activeTab === 'competitions' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('competitions')}>🏆 Compétitions</button>
          <button className={`btn-secondary ${activeTab === 'users' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('users')}>👥 Utilisateurs</button>
          <button className={`btn-secondary ${activeTab === 'volontaires' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('volontaires')}>🦺 Volontaires</button>
        </div>

        <div className="spectator-main-full"> {/* Layout pleine largeur */}

          {/* --- ONGLET 1 : DASHBOARD --- */}
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
          
          {/* --- ONGLET 2 : COMPETITIONS & EPREUVES (RESTAURÉ) --- */}
          {activeTab === 'competitions' && (
            <div className="panel">
              {!selectedComp ? (
                <>
                    {/* VUE LISTE COMPETITIONS */}
                    <h2 className="panel-title">Gestion des Compétitions</h2>
                    
                    {/* Formulaire Création Compétition */}
                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border:'1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Nouvelle compétition</h3>
                        <form onSubmit={handleCreateCompetition} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                            <div>
                                <label style={{fontSize:'0.8rem'}}>Nom</label>
                                <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="Ex: Natation 2026" style={{width:'100%', padding:'0.5rem'}} />
                            </div>
                            <div>
                                <label style={{fontSize:'0.8rem'}}>Début</label>
                                <input type="date" value={dateDebut} onChange={e=>setDateDebut(e.target.value)} required style={{width:'100%', padding:'0.5rem'}} />
                            </div>
                            <div>
                                <label style={{fontSize:'0.8rem'}}>Fin</label>
                                <input type="date" value={dateFin} onChange={e=>setDateFin(e.target.value)} required style={{width:'100%', padding:'0.5rem'}} />
                            </div>
                            <button className="btn-primary" type="submit">Créer</button>
                        </form>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{textAlign:'left', borderBottom:'2px solid #eee'}}>
                                <th style={{padding:'0.5rem'}}>Nom</th>
                                <th style={{padding:'0.5rem'}}>Dates</th>
                                <th style={{padding:'0.5rem'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {competitions.map(c => (
                                <tr key={c.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                                    <td style={{padding:'0.8rem', fontWeight:'600'}}>{c.name}</td>
                                    <td>Du {new Date(c.dateDebut).toLocaleDateString()} au {new Date(c.dateFin).toLocaleDateString()}</td>
                                    <td><button className="btn-secondary" onClick={() => openCompetitionDetails(c)}>Gérer Épreuves 👉</button></td>
                                </tr>
                            ))}
                            {competitions.length === 0 && <tr><td colSpan="3" style={{padding:'1rem', textAlign:'center'}}>Aucune compétition.</td></tr>}
                        </tbody>
                    </table>
                </>
              ) : (
                <>
                    {/* VUE DETAILS EPREUVES */}
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                        <button className="btn-secondary" onClick={() => setSelectedComp(null)}>⬅ Retour Liste</button>
                        <h2 className="panel-title" style={{margin:0}}>Épreuves : {selectedComp.name}</h2>
                    </div>

                    {/* Formulaire Création Épreuve */}
                    <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border:'1px solid #bfdbfe' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color:'#1e40af' }}>Ajouter une épreuve</h3>
                        <form onSubmit={handleCreateEpreuve} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                            <div>
                                <label style={{fontSize:'0.8rem'}}>Nom Épreuve</label>
                                <input type="text" value={epreuveName} onChange={e=>setEpreuveName(e.target.value)} required placeholder="Ex: Finale 100m NL" style={{width:'100%', padding:'0.5rem'}} />
                            </div>
                            <div>
                                <label style={{fontSize:'0.8rem'}}>Horaire Public</label>
                                <input type="datetime-local" value={horairePublic} onChange={e=>setHorairePublic(e.target.value)} required style={{width:'100%', padding:'0.5rem'}} />
                            </div>
                            <div>
                                <label style={{fontSize:'0.8rem'}}>Horaire Athlètes</label>
                                <input type="datetime-local" value={horaireAthletes} onChange={e=>setHoraireAthletes(e.target.value)} required style={{width:'100%', padding:'0.5rem'}} />
                            </div>
                            <button className="btn-primary" type="submit">Ajouter</button>
                        </form>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{textAlign:'left', borderBottom:'2px solid #eee'}}>
                                <th style={{padding:'0.5rem'}}>Épreuve</th>
                                <th style={{padding:'0.5rem'}}>Horaire Public</th>
                                <th style={{padding:'0.5rem'}}>Horaire Athlètes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {epreuves.length > 0 ? epreuves.map(e => (
                                <tr key={e.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                                    <td style={{padding:'0.8rem', fontWeight:'bold'}}>{e.name}</td>
                                    <td>{formatDate(e.horairePublic)}</td>
                                    <td style={{color:'#666'}}>{formatDate(e.horaireAthletes)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" style={{padding:'1rem', textAlign:'center', fontStyle:'italic'}}>Aucune épreuve créée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </>
              )}
            </div>
          )}

          {/* --- ONGLET 3 : UTILISATEURS (RESTAURÉ) --- */}
          {activeTab === 'users' && ( 
             <div className="panel">
                <h2 className="panel-title">Administration Utilisateurs</h2>
                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse', marginTop:'1rem' }}>
                <thead><tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}><th style={{padding:'0.5rem'}}>Login</th><th style={{padding:'0.5rem'}}>Rôle Actuel</th><th style={{padding:'0.5rem'}}>Modifier Rôle</th></tr></thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'0.8rem', fontWeight:'bold'}}>{u.username}</td>
                            <td><span className="badge-secondary">{u.role}</span></td>
                            <td>
                                <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)} style={{padding:'0.3rem', borderRadius:'4px', border:'1px solid #ddd'}}>
                                    <option value="SPECTATEUR">SPECTATEUR</option>
                                    <option value="SPORTIF">SPORTIF</option>
                                    <option value="COMMISSAIRE">COMMISSAIRE</option>
                                    <option value="RESPONSABLE">RESPONSABLE</option>
                                    <option value="VOLONTAIRE">VOLONTAIRE</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
              </table>
             </div> 
          )}

          {/* --- ONGLET 4 : VOLONTAIRES (NOUVEAU) --- */}
          {activeTab === 'volontaires' && (
              <div className="panel">
                  <h2 className="panel-title">Affectation des Volontaires</h2>
                  <p className="panel-subtitle">Assignez les tâches du jour aux équipes terrain.</p>
                  
                  <table style={{width:'100%', marginTop:'1rem', borderCollapse:'collapse'}}>
                      <thead><tr style={{textAlign:'left', borderBottom:'1px solid #ddd'}}><th style={{padding:'0.5rem'}}>Volontaire</th><th style={{padding:'0.5rem'}}>Tâche Actuelle</th><th style={{padding:'0.5rem'}}>Nouvelle Assignation</th></tr></thead>
                      <tbody>
                          {volunteers.map(v => (
                              <tr key={v.id} style={{borderBottom:'1px solid #f9f9f9'}}>
                                  <td style={{padding:'0.8rem', fontWeight:'bold'}}>{v.name}</td>
                                  <td style={{color: v.assignment === 'Non assigné' ? '#999' : '#16a34a', fontWeight:'500'}}>{v.assignment}</td>
                                  <td>
                                      <select onChange={(e) => handleAssignVolunteer(v.id, e.target.value)} style={{padding:'0.4rem', width:'100%', maxWidth:'200px', border:'1px solid #ccc', borderRadius:'4px'}}>
                                          <option value="Non assigné">-- Choisir --</option>
                                          <option value="Accueil Public - Zone A">Accueil Public - Zone A</option>
                                          <option value="Contrôle Billets - Entrée Sud">Contrôle Billets - Entrée Sud</option>
                                          <option value="Sécurité - Bassin">Sécurité - Bassin</option>
                                          <option value="Logistique - Matériel">Logistique - Matériel</option>
                                      </select>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}

        </div>
      </div>
    </div>
  );
}
export default ResponsablePage;