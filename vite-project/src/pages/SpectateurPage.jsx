import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function SpectateurPage({ token, username, onLogout }) {
  // --- ÉTATS ---
  const [hello, setHello] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gestion des billets (Local)
  const [tickets, setTickets] = useState([]);
  const [newTicketCode, setNewTicketCode] = useState('');
  const [newTicketFile, setNewTicketFile] = useState(null); // État pour le fichier PDF

  // Gestion des Notifications
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifResults, setNotifResults] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [notifEvents, setNotifEvents] = useState(false);

  // --- API CALLS ---
  const fetchHello = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hello`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setHello(await res.text());
    } catch (err) { console.error(err); }
  };

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const resComp = await fetch(`${API_URL}/api/competitions`, { headers: { Authorization: `Bearer ${token}` } });
      if (!resComp.ok) { setLoading(false); return; }
      const competitions = await resComp.json();

      let allEpreuves = [];
      await Promise.all(competitions.map(async (comp) => {
        const resEp = await fetch(`${API_URL}/api/competitions/${comp.id}/epreuves`, { headers: { Authorization: `Bearer ${token}` } });
        if (resEp.ok) {
            const epreuvesData = await resEp.json();
            const enriched = epreuvesData.map(e => ({ ...e, competitionName: comp.name }));
            allEpreuves = [...allEpreuves, ...enriched];
        }
      }));
      allEpreuves.sort((a, b) => new Date(a.horairePublic) - new Date(b.horairePublic));
      setEvents(allEpreuves);
    } catch (e) { console.error("Erreur chargement events", e); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (token) { fetchHello(); fetchAllEvents(); }
  }, [token]);

  // --- GESTION BILLETS (PDF) ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setNewTicketFile(e.target.files[0]);
    }
  };

  const addTicket = (e) => {
    e.preventDefault();
    if (!newTicketCode && !newTicketFile) return; 

    const ticket = {
        id: Date.now(),
        code: newTicketCode || 'E-Billet',
        fileName: newTicketFile ? newTicketFile.name : 'Aucun fichier'
    };

    setTickets([...tickets, ticket]);
    setNewTicketCode('');
    setNewTicketFile(null);
    // Reset du champ file visuel
    e.target.reset(); 
  };

  const notifList = [];
  if (notifResults) notifList.push('résultats');
  if (notifSecurity) notifList.push('sécurité');
  if (notifEvents) notifList.push('événements festifs');

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        
        {/* EN-TÊTE */}
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Spectateur</h1>
            <p>Vivez les championnats d'Europe 2026.</p>
            {hello && <span style={{fontSize:'0.8rem', color:'#666'}}>{hello}</span>}
          </div>
          <div className="spectator-header-right">
             {username && <span>{username} · <span style={{ opacity: 0.8 }}>Fan</span></span>}
             <button className="icon-button" title="Notifications" onClick={() => setShowNotifPanel(true)} style={{marginLeft:'1rem', background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem'}}>🔔</button>
             <button className="btn-secondary" onClick={onLogout} style={{marginLeft:'1rem'}}>Se déconnecter</button>
          </div>
        </div>

        <div className="spectator-main">
          
          {/* COLONNE GAUCHE : PROGRAMME */}
          <div className="panel" style={{flex: 2}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                <h2 className="panel-title">🏊 Programme Officiel</h2>
                <button onClick={fetchAllEvents} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem'}}>🔄</button>
            </div>
            
            {loading ? (
                <div style={{textAlign:'center', padding:'2rem', color:'#666'}}>Chargement...</div>
            ) : (
                <ul className="event-list">
                  {events.length > 0 ? events.map((e) => (
                    <li key={e.id} className="event-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{flex: 1}}>
                          <div className="event-name" style={{fontSize:'1rem', fontWeight:'bold', color:'#111827'}}>{e.name}</div>
                          <div className="event-meta" style={{color:'#2563eb', fontSize:'0.85rem', marginTop:'0.2rem', fontWeight:'600'}}>🏆 {e.competitionName}</div>
                      </div>
                      <div className="event-meta" style={{ fontSize: '0.9rem', color: '#4b5563', whiteSpace: 'nowrap', textAlign: 'right', background: '#f9fafb', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                        🕒 {e.horairePublic ? new Date(e.horairePublic).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour:'2-digit', minute:'2-digit' }).replace(':', 'h') : 'À confirmer'}
                      </div>
                    </li>
                  )) : (
                    <div style={{textAlign:'center', padding:'2rem', background:'#f9fafb', borderRadius:'8px', color:'#6b7280'}}>
                        <p>Aucune épreuve planifiée.</p>
                    </div>
                  )}
                </ul>
            )}
          </div>

          {/* COLONNE DROITE : BILLETS (PDF) */}
          <div className="panel" style={{flex: 1}}>
            <h2 className="panel-title">🎟️ Mes Billets</h2>
            <p className="panel-subtitle">Importez vos E-Billets (PDF) pour l'accès.</p>
            
            <form onSubmit={addTicket} style={{marginBottom:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                <div style={{display:'flex', gap:'0.5rem'}}>
                    <input 
                        type="text" 
                        placeholder="Réf. Billet (ex: A-1234)" 
                        value={newTicketCode} 
                        onChange={e=>setNewTicketCode(e.target.value)}
                        style={{flex:1, padding:'0.5rem', borderRadius:'4px', border:'1px solid #d1d5db'}}
                    />
                </div>
                
                {/* CHAMP UPLOAD PDF */}
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                    <label style={{
                        flex:1, 
                        cursor:'pointer', 
                        padding:'0.5rem', 
                        border:'1px dashed #2563eb', 
                        borderRadius:'4px', 
                        textAlign:'center', 
                        color:'#2563eb', 
                        fontSize:'0.85rem',
                        background: '#eff6ff'
                    }}>
                        📄 {newTicketFile ? newTicketFile.name : "Choisir un PDF..."}
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handleFileChange} 
                            style={{display:'none'}}
                        />
                    </label>
                    <button type="submit" className="btn-primary" style={{padding:'0.5rem 1rem'}}>Ajouter</button>
                </div>
            </form>

            {tickets.length > 0 ? (
                <ul className="ticket-list" style={{listStyle:'none', padding:0}}>
                    {tickets.map(t => (
                        <li key={t.id} className="ticket-item" style={{
                            padding:'0.8rem', 
                            background:'#f0fdf4', 
                            border:'1px solid #bbf7d0', 
                            borderRadius:'6px', 
                            marginBottom:'0.5rem',
                            display:'flex', justifyContent:'space-between', alignItems:'center'
                        }}>
                            <div style={{overflow: 'hidden'}}>
                                <div style={{fontWeight:'bold', color:'#166534'}}>{t.code}</div>
                                {t.fileName !== 'Aucun fichier' && (
                                    <div style={{fontSize:'0.75rem', color:'#15803d', display:'flex', alignItems:'center', gap:'4px'}}>
                                        📎 {t.fileName}
                                    </div>
                                )}
                            </div>
                            <span style={{fontSize:'1.5rem'}}>🎫</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={{color:'gray', fontStyle:'italic', fontSize:'0.9rem'}}>Aucun billet importé.</p>
            )}
            
            <div style={{marginTop:'2rem', padding:'1rem', background:'#fff1f2', borderRadius:'8px', border:'1px solid #fecaca'}}>
                <h3 style={{fontSize:'0.9rem', color:'#991b1b', margin:'0 0 0.5rem 0'}}>Urgence & Sécurité</h3>
                <p style={{fontSize:'0.8rem', color:'#7f1d1d', margin:0}}>En cas d'incident, contactez le PC Sécurité ou recevez les alertes en direct.</p>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {showNotifPanel && (
            <div className="notifications-overlay-backdrop" onClick={() => setShowNotifPanel(false)}>
                <div className="notifications-overlay" onClick={(e) => e.stopPropagation()}>
                    <h2 className="panel-title">Préférences Notifications</h2>
                    <div className="notification-options" style={{marginTop:'1.5rem'}}>
                        <label style={{display:'block', marginBottom:'0.8rem'}}><input type="checkbox" checked={notifResults} onChange={(e) => setNotifResults(e.target.checked)} /> 🏆 Résultats en direct</label>
                        <label style={{display:'block', marginBottom:'0.8rem'}}><input type="checkbox" checked={notifSecurity} onChange={(e) => setNotifSecurity(e.target.checked)} /> 🚨 Alertes Sécurité</label>
                        <label style={{display:'block', marginBottom:'0.8rem'}}><input type="checkbox" checked={notifEvents} onChange={(e) => setNotifEvents(e.target.checked)} /> 🎉 Fan Zones</label>
                    </div>
                    <div style={{marginTop: '1.5rem', textAlign: 'right'}}>
                        <button className="btn-primary" type="button" onClick={() => setShowNotifPanel(false)}>Fermer</button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

export default SpectateurPage;