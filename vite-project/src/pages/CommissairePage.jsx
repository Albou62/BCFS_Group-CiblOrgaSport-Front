import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function CommissairePage({ token, onLogout, username }) {
  const [view, setView] = useState('epreuves'); 

  // --- ÉTATS ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Participants 
  const [participants, setParticipants] = useState([
    { id: 1, nom: 'DURAND Thomas', couloir: 4, temps: '', statut: 'OK' }, 
    { id: 2, nom: 'MARTIN Lucas', couloir: 5, temps: '', statut: 'OK' },
    { id: 3, nom: 'DUBOIS Julie', couloir: 3, temps: '', statut: 'OK' },
  ]);

  // Documents à vérifier
  const [pendingDocs, setPendingDocs] = useState([
    { id: 1, athlete: 'Thomas DURAND', type: 'Passeport', fileName: 'pass_thomas.pdf', date: '01/02/2026' },
    { id: 2, athlete: 'Thomas DURAND', type: 'Certificat Médical', fileName: 'certif_thomas.pdf', date: '01/02/2026' },
    { id: 3, athlete: 'Julie DUBOIS', type: 'Passeport', fileName: 'pass_julie.jpg', date: '02/02/2026' },
  ]);

  // --- API CALLS ---
  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const resComp = await fetch(`${API_URL}/api/competitions`, { headers: { Authorization: `Bearer ${token}` } });
      if(!resComp.ok) return;
      const comps = await resComp.json();

      let all = [];
      await Promise.all(comps.map(async (c) => {
          const r = await fetch(`${API_URL}/api/competitions/${c.id}/epreuves`, { headers: { Authorization: `Bearer ${token}` } });
          if(r.ok) {
              const eps = await r.json();
              all = [...all, ...eps.map(e => ({...e, competitionName: c.name}))];
          }
      }));
      all.sort((a,b) => new Date(a.horaireAthletes) - new Date(b.horaireAthletes));
      setEvents(all);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // --- LOGIQUE MÉTIER ---
  const handleTimeChange = (id, value) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, temps: value } : p));
  };

  const toggleDisqualify = (id) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, statut: p.statut === 'DQ' ? 'OK' : 'DQ', temps: p.statut === 'DQ' ? '' : 'DQ' } : p
    ));
  };

  const handleSuspendEvent = () => {
    if(window.confirm("⚠️ Voulez-vous vraiment SUSPENDRE cette épreuve pour cause Météo/Incident ?")) {
        alert("Épreuve suspendue. Notification envoyée aux responsables et athlètes.");
    }
  };

  const handleValidateDoc = (id) => {
    setPendingDocs(pendingDocs.filter(d => d.id !== id));
    alert("Document validé !");
  };

  const handleRejectDoc = (id) => {
    setPendingDocs(pendingDocs.filter(d => d.id !== id));
    alert("Document refusé.");
  };

  useEffect(() => { if(token) fetchAllEvents(); }, [token]);

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell" style={{ maxWidth: '100%', padding: '20px' }}>
        
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Commissaire</h1>
          </div>
          <div className="spectator-header-right">
             {username && <span>{username} (Officiel)</span>}
            <button className="btn-secondary" onClick={onLogout}>Se déconnecter</button>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="tabs" style={{marginBottom:'1.5rem', borderBottom:'1px solid #eee'}}>
             <button className={`tab ${view==='epreuves'?'active':''}`} onClick={()=>setView('epreuves')}>⏱️ Gestion Épreuves</button>
             <button className={`tab ${view==='admin'?'active':''}`} onClick={()=>setView('admin')}>🗂️ Vérification Administrative</button>
        </div>

        <div className="spectator-main">
          
          {/* VUE 1 : VERIFICATION DOCUMENTS */}
          {view === 'admin' && (
            <div className="panel" style={{width:'100%'}}>
                <h2 className="panel-title">Documents en attente</h2>
                <table style={{width:'100%', borderCollapse:'collapse', marginTop:'1rem'}}>
                    <thead>
                        <tr style={{textAlign:'left', borderBottom:'2px solid #eee'}}>
                            <th style={{padding:'0.5rem'}}>Date</th>
                            <th style={{padding:'0.5rem'}}>Athlète</th>
                            <th style={{padding:'0.5rem'}}>Document</th>
                            <th style={{padding:'0.5rem'}}>Fichier</th>
                            <th style={{padding:'0.5rem', textAlign:'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingDocs.map(doc => (
                            <tr key={doc.id} style={{borderBottom:'1px solid #f9f9f9'}}>
                                <td style={{padding:'0.8rem'}}>{doc.date}</td>
                                <td style={{fontWeight:'bold'}}>{doc.athlete}</td>
                                <td><span className="badge-secondary">{doc.type}</span></td>
                                <td style={{color:'#2563eb', textDecoration:'underline', cursor:'pointer'}}>{doc.fileName}</td>
                                <td style={{textAlign:'right'}}>
                                    <button onClick={()=>handleRejectDoc(doc.id)} style={{marginRight:'0.5rem', padding:'0.3rem 0.6rem', background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:'4px', cursor:'pointer'}}>Refuser</button>
                                    <button onClick={()=>handleValidateDoc(doc.id)} style={{padding:'0.3rem 0.6rem', background:'#dcfce7', color:'#166534', border:'none', borderRadius:'4px', cursor:'pointer'}}>Valider</button>
                                </td>
                            </tr>
                        ))}
                        {pendingDocs.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'2rem', fontStyle:'italic'}}>Aucun document en attente.</td></tr>}
                    </tbody>
                </table>
            </div>
          )}

          {/* VUE 2 : GESTION EPREUVES */}
          {view === 'epreuves' && (
             (!selectedEvent ? (
                /* LISTE DES EPREUVES */
                <div className="panel" style={{width: '100%'}}>
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                       <h2 className="panel-title">Sélectionner une épreuve à arbitrer</h2>
                       <button onClick={fetchAllEvents} style={{border:'none', background:'none', cursor:'pointer'}}>🔄</button>
                   </div>
                   {loading ? <p>Chargement...</p> : (
                   <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                             <tr style={{textAlign:'left', borderBottom:'2px solid #eee'}}>
                                <th style={{padding:'0.5rem'}}>Horaire</th>
                                <th style={{padding:'0.5rem'}}>Épreuve</th>
                                <th style={{padding:'0.5rem'}}>Compétition</th>
                                <th style={{padding:'0.5rem'}}>Action</th>
                             </tr>
                        </thead>
                        <tbody>
                            {events.map(e => (
                                <tr key={e.id} style={{borderBottom:'1px solid #eee'}}>
                                    <td style={{padding:'0.8rem'}}>{e.horaireAthletes ? new Date(e.horaireAthletes).toLocaleString() : '-'}</td>
                                    <td style={{fontWeight:'bold'}}>{e.name}</td>
                                    <td style={{color:'#666'}}>{e.competitionName}</td>
                                    <td><button className="btn-primary" onClick={()=>setSelectedEvent(e)}>Gérer 👉</button></td>
                                </tr>
                            ))}
                            {events.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'1rem'}}>Aucune épreuve trouvée.</td></tr>}
                        </tbody>
                   </table>
                   )}
                </div>
             ) : (
                /* DETAIL EPREUVE + INCIDENTS */
                <div style={{display:'flex', gap:'1rem', width:'100%'}}>
                    
                    {/* COLONNE GAUCHE : SAISIE RESULTATS */}
                    <div className="panel" style={{flex: 2}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
                             <button className="btn-secondary" onClick={()=>setSelectedEvent(null)}>⬅ Retour</button>
                             <div className="badge-warning">🔴 En cours</div>
                        </div>
                        
                        <h2 className="panel-title" style={{margin:0}}>{selectedEvent.name}</h2>
                        <p className="panel-subtitle">{selectedEvent.competitionName}</p>

                        <table style={{ width: '100%', borderCollapse:'collapse', marginTop:'1rem' }}>
                            <thead>
                                <tr style={{background:'#f3f4f6'}}>
                                    <th style={{padding:'0.5rem', textAlign:'left'}}>Couloir</th>
                                    <th style={{padding:'0.5rem', textAlign:'left'}}>Athlète</th>
                                    <th style={{padding:'0.5rem', textAlign:'left'}}>Temps</th>
                                    <th style={{padding:'0.5rem', textAlign:'center'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p) => (
                                <tr key={p.id} style={{borderBottom: '1px solid #eee'}}>
                                    <td style={{padding:'0.8rem', fontWeight:'bold'}}>{p.couloir}</td>
                                    <td>{p.nom}</td>
                                    <td><input type="text" value={p.temps} onChange={(e) => handleTimeChange(p.id, e.target.value)} placeholder="00.00" style={{width:'80px', padding:'0.3rem'}} disabled={p.statut === 'DQ'} /></td>
                                    <td style={{textAlign:'center'}}>
                                    <button onClick={() => toggleDisqualify(p.id)} style={{fontSize:'0.8rem', background: p.statut === 'DQ' ? '#ef4444' : '#e5e7eb', color: p.statut === 'DQ' ? 'white' : 'black', border:'none', borderRadius:'4px', padding:'0.3rem 0.6rem', cursor:'pointer'}}>
                                        {p.statut === 'DQ' ? 'Disqualifié' : 'Disqualifier'}
                                    </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{marginTop:'1.5rem', textAlign:'right'}}>
                            <button className="btn-primary">✅ Valider et Publier les résultats</button>
                        </div>
                    </div>

                    {/* COLONNE DROITE : GESTION INCIDENTS  */}
                    <div className="panel" style={{flex: 1, height:'fit-content'}}>
                        <h2 className="panel-title">⚠️ Gestion Incidents</h2>
                        <p className="panel-subtitle">Sécurité et Météo</p>

                        <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginTop:'1rem'}}>
                            {/* BOUTON METEO */}
                            <div style={{padding:'1rem', border:'1px solid #fca5a5', borderRadius:'6px', background:'#fff1f2'}}>
                                <h3 style={{fontSize:'0.95rem', margin:'0 0 0.5rem 0', color:'#991b1b'}}>Conditions Météo</h3>
                                <p style={{fontSize:'0.85rem', color:'#7f1d1d', marginBottom:'0.8rem'}}>
                                    En cas d'orage, de vent violent ou de conditions dangereuses pour les athlètes.
                                </p>
                                <button 
                                    className="btn-secondary" 
                                    onClick={handleSuspendEvent}
                                    style={{width:'100%', borderColor:'#dc2626', color:'#dc2626', background:'white', fontWeight:'bold'}}
                                >
                                    ⛔ SUSPENDRE L'ÉPREUVE
                                </button>
                            </div>
                            
                            {/* BOUTON APPEL */}
                            <div style={{padding:'1rem', border:'1px solid #93c5fd', borderRadius:'6px', background:'#eff6ff'}}>
                                <h3 style={{fontSize:'0.95rem', margin:'0 0 0.5rem 0', color:'#1e40af'}}>Appel Athlètes</h3>
                                <p style={{fontSize:'0.85rem', color:'#1e3a8a', marginBottom:'0.8rem'}}>
                                    Vérification des présences en chambre d'appel.
                                </p>
                                <button className="btn-secondary" style={{width:'100%', borderColor:'#2563eb', color:'#2563eb', background:'white'}}>
                                    📋 Ouvrir liste d'appel
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
             ))
          )}

        </div>
      </div>
    </div>
  );
}

export default CommissairePage;