import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function VolontairePage({ token, onLogout, username }) {
  // Liste des épreuves réelles (Programme global)
  const [programme, setProgramme] = useState([]);
  
  // Tâches assignées 
  const [tasks] = useState([
    { id: 1, titre: 'Accueil Public - Zone A', heure: '08:00 - 12:00', statut: 'Terminé' },
    { id: 2, titre: 'Contrôle Accès - Bassin', heure: '13:00 - 17:00', statut: 'À venir' }
  ]);

  const loadProgramme = async () => {
    try {
      // 1. Récupérer les compétitions
      const resComp = await fetch(`${API_URL}/api/competitions`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if(!resComp.ok) return;
      const comps = await resComp.json();

      // 2. Récupérer les épreuves
      let all = [];
      await Promise.all(comps.map(async (c) => {
          const r = await fetch(`${API_URL}/api/competitions/${c.id}/epreuves`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if(r.ok) {
              const eps = await r.json();
              all = [...all, ...eps.map(e => ({...e, context: c.name}))];
          }
      }));
      
      // Trier par date
      all.sort((a,b) => new Date(a.horairePublic) - new Date(b.horairePublic));
      setProgramme(all);

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if(token) loadProgramme();
  }, [token]);

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Volontaire</h1>
            <p>Merci pour votre aide précieuse, Hector !</p>
          </div>
          <div className="spectator-header-right">
            {username && <span>{username} · <span style={{ opacity: 0.8 }}>Staff</span></span>}
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Se déconnecter
            </button>
          </div>
        </div>

        <div className="spectator-main">
            
            {/* Colonne 1 : Mes Tâches (Assignations) */}
            <div className="panel">
                <h2 className="panel-title">📋 Ma feuille de route</h2>
                <p className="panel-subtitle">Vos missions pour aujourd'hui.</p>
                <div className="event-list">
                    {tasks.map(t => (
                        <div key={t.id} className="event-item" style={{borderLeft: t.statut === 'À venir' ? '4px solid #f59e0b' : '4px solid #10b981'}}>
                            <div className="event-name">{t.titre}</div>
                            <div className="event-meta">⏰ {t.heure}</div>
                            <div className="event-meta">Statut : {t.statut}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Colonne 2 : Programme Global  */}
            <div className="panel">
                <h2 className="panel-title">📅 Programme Global</h2>
                <p className="panel-subtitle">Les épreuves en cours sur le site.</p>
                
                <table style={{width:'100%', fontSize:'0.85rem', borderCollapse:'collapse'}}>
                    <thead>
                        <tr style={{textAlign:'left', borderBottom:'1px solid #ddd'}}>
                            <th style={{padding:'0.5rem'}}>Horaire</th>
                            <th style={{padding:'0.5rem'}}>Épreuve</th>
                        </tr>
                    </thead>
                    <tbody>
                        {programme.map(p => (
                            <tr key={p.id} style={{borderBottom:'1px solid #f9f9f9'}}>
                                <td style={{padding:'0.5rem'}}>
                                    {p.horairePublic ? new Date(p.horairePublic).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                </td>
                                <td style={{padding:'0.5rem'}}>
                                    <strong>{p.name}</strong><br/>
                                    <span style={{color:'gray', fontSize:'0.75rem'}}>{p.context}</span>
                                </td>
                            </tr>
                        ))}
                        {programme.length === 0 && <tr><td colSpan="2" style={{padding:'1rem', fontStyle:'italic'}}>Aucune épreuve chargée.</td></tr>}
                    </tbody>
                </table>
            </div>

        </div>
      </div>
    </div>
  );
}

export default VolontairePage;