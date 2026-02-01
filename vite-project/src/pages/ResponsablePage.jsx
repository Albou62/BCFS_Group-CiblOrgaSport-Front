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

  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  
  // États Formulaire Compétition
  const [name, setName] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [disciplineId, setDisciplineId] = useState('');

  // États Gestion Épreuves 
  const [selectedComp, setSelectedComp] = useState(null); 
  const [epreuves, setEpreuves] = useState([]);           
  const [epreuveName, setEpreuveName] = useState('');     
  const [horairePublic, setHorairePublic] = useState('');
  const [horaireAthletes, setHoraireAthletes] = useState('');

  
  const today = new Date().toISOString().split('T')[0];

  // --- STATISTIQUES (MOCK / DONNÉES FICTIVES) ---
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
          body: JSON.stringify({ name, dateDebut, dateFin, disciplineId: disciplineId || null }),
        });
        setName(''); setDateDebut(''); setDateFin(''); setDisciplineId('');
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
            openCompetitionDetails(selectedComp);
        }
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (token) { loadUsers(); loadCompetitions(); }
  }, [token]);

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        
        {/* EN-TÊTE */}
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Responsable</h1>
            <p>Pilotage global et administration.</p>
          </div>
          <div className="spectator-header-right">
            <span style={{marginRight:'1rem', fontSize:'0.9rem'}}>Marius (Admin)</span>
            <button className="btn-secondary" onClick={onLogout}>Se déconnecter</button>
          </div>
        </div>

        {/* ONGLETS DE NAVIGATION */}
        <div className="tabs" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => {setActiveTab('dashboard'); setSelectedComp(null);}}>📊 Dashboard</button>
          <button className={`tab ${activeTab === 'competitions' ? 'active' : ''}`} onClick={() => setActiveTab('competitions')}>🏆 Compétitions</button>
          <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => {setActiveTab('users'); setSelectedComp(null);}}>👥 Utilisateurs</button>
        </div>

        <div className="spectator-main" style={{ display: 'block' }}>

          {/* --- ONGLET 1 : DASHBOARD (STATS MOCKÉES) --- */}
          {activeTab === 'dashboard' && (
             <div className="panel">
                <h2 className="panel-title">Indicateurs de performance</h2>
                <p className="panel-subtitle">Aperçu de l'activité.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  
                  <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border:'1px solid #bae6fd' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0284c7' }}>{stats.connexions_jour}</div>
                    <div style={{ color: '#475569', fontWeight:'500' }}>Connexions / jour</div>
                  </div>

                  <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border:'1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{stats.temps_moyen}</div>
                    <div style={{ color: '#475569', fontWeight:'500' }}>Temps moyen passé</div>
                  </div>

                  <div style={{ background: '#fdf4ff', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border:'1px solid #e9d5ff' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9333ea' }}>{stats.utilisateurs_total}</div>
                    <div style={{ color: '#475569', fontWeight:'500' }}>Utilisateurs inscrits</div>
                  </div>

                  <div style={{ background: '#fff7ed', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border:'1px solid #fed7aa' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c' }}>{stats.volontaires_actifs}</div>
                    <div style={{ color: '#475569', fontWeight:'500' }}>Volontaires actifs</div>
                  </div>

                </div>
             </div>
          )}
          
          {/* --- ONGLET 2 : UTILISATEURS --- */}
          {activeTab === 'users' && ( 
             <div className="panel">
                <h2 className="panel-title">Administration Utilisateurs</h2>
                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                        <th style={{padding:'0.5rem'}}>Login</th>
                        <th style={{padding:'0.5rem'}}>Rôle</th>
                        <th style={{padding:'0.5rem'}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'0.8rem'}}>{u.username}</td>
                            <td><span className="badge-secondary">{u.role}</span></td>
                            <td>
                                <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)} style={{padding:'0.2rem', borderRadius:'4px', border:'1px solid #ddd'}}>
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

          {/* --- ONGLET 3 : COMPETITIONS --- */}
          {activeTab === 'competitions' && (
            <div className="panel">
              {!selectedComp ? (
                /* VUE LISTE */
                <>
                    <h2 className="panel-title">Gestion des Compétitions</h2>
                    
                    {/* Form Création */}
                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border:'1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Nouvelle compétition</h3>
                        <form onSubmit={handleCreateCompetition} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                            <div className="form-group" style={{marginBottom:0}}>
                                <label style={{fontSize:'0.8rem'}}>Nom</label>
                                <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="Ex: Championnats d'Europe" />
                            </div>
                            <div className="form-group" style={{marginBottom:0}}>
                                <label style={{fontSize:'0.8rem'}}>Début</label>
                                <input type="date" min={today} value={dateDebut} onChange={e=>setDateDebut(e.target.value)} required />
                            </div>
                            <div className="form-group" style={{marginBottom:0}}>
                                <label style={{fontSize:'0.8rem'}}>Fin</label>
                                <input type="date" min={dateDebut || today} value={dateFin} onChange={e=>setDateFin(e.target.value)} required />
                            </div>
                            <button className="btn-primary" type="submit">Créer</button>
                        </form>
                    </div>

                    {/* Tableau Liste */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
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
                                    <td>
                                        <button className="btn-secondary" style={{fontSize:'0.8rem'}} onClick={() => openCompetitionDetails(c)}>
                                            Gérer les Épreuves 👉
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {competitions.length === 0 && <tr><td colSpan="3" style={{padding:'1rem', textAlign:'center', fontStyle:'italic'}}>Aucune compétition.</td></tr>}
                        </tbody>
                    </table>
                </>
              ) : (
                /* VUE DETAIL (EPREUVES) */
                <>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem'}}>
                        <button className="btn-secondary" onClick={() => setSelectedComp(null)}>⬅ Retour</button>
                        <h2 className="panel-title" style={{margin:0}}>Épreuves : {selectedComp.name}</h2>
                    </div>

                    <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border:'1px solid #bfdbfe' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color:'#1e40af' }}>Ajouter une épreuve</h3>
                        <form onSubmit={handleCreateEpreuve} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                            <div className="form-group" style={{marginBottom:0}}>
                                <label style={{fontSize:'0.8rem'}}>Nom</label>
                                <input type="text" value={epreuveName} onChange={e=>setEpreuveName(e.target.value)} required placeholder="Ex: Finale 100m NL" />
                            </div>
                            <div className="form-group" style={{marginBottom:0}}>
                                <label style={{fontSize:'0.8rem'}}>Horaire Public</label>
                                <input 
                                    type="datetime-local" 
                                    min={`${selectedComp.dateDebut}T00:00`} 
                                    max={`${selectedComp.dateFin}T23:59`}
                                    value={horairePublic} onChange={e=>setHorairePublic(e.target.value)} required 
                                />
                            </div>
                            <div className="form-group" style={{marginBottom:0}}>
                                <label style={{fontSize:'0.8rem'}}>Horaire Athlètes</label>
                                <input 
                                    type="datetime-local" 
                                    min={`${selectedComp.dateDebut}T00:00`} 
                                    max={`${selectedComp.dateFin}T23:59`}
                                    value={horaireAthletes} onChange={e=>setHoraireAthletes(e.target.value)} required 
                                />
                            </div>
                            <button className="btn-primary" type="submit">Ajouter</button>
                        </form>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
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
                                <tr><td colSpan="3" style={{padding:'1rem', textAlign:'center', fontStyle:'italic'}}>Aucune épreuve.</td></tr>
                            )}
                        </tbody>
                    </table>
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