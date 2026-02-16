import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function VolontairePage({ token, onLogout, username }) {
  const [tasks] = useState([
      {id:1, titre:'Accueil Zone A', heure:'08:00 - 12:00', statut:'Terminé'},
      {id:2, titre:'Sécurité Bassin', heure:'13:00 - 17:00', statut:'À venir'}
  ]);
  const [programme, setProgramme] = useState([]); // <-- Données API
  const [showModal, setShowModal] = useState(false);

  // --- CONNEXION BACK-END ---
  const loadProgramme = async () => {
    try {
      const resComp = await fetch(`${API_URL}/api/competitions`, { headers: { Authorization: `Bearer ${token}` } });
      if(!resComp.ok) return;
      const comps = await resComp.json();

      let all = [];
      await Promise.all(comps.map(async (c) => {
          const r = await fetch(`${API_URL}/api/competitions/${c.id}/epreuves`, { headers: { Authorization: `Bearer ${token}` } });
          if(r.ok) {
              const eps = await r.json();
              all = [...all, ...eps.map(e => ({...e, context: c.name}))];
          }
      }));
      setProgramme(all);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if(token) loadProgramme();
  }, [token]);

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
            <div className="spectator-header-left"><h1>Espace Volontaire</h1><p>Merci Hector !</p></div>
            <div className="spectator-header-right"><button className="btn-secondary" onClick={onLogout}>Déconnexion</button></div>
        </div>

        <div className="spectator-main"> 
            <div className="panel">
                <div style={{background:'#fee2e2', padding:'1rem', borderRadius:'8px', textAlign:'center', border:'1px solid #fecaca', marginBottom:'1.5rem'}}>
                    <h3 style={{color:'#991b1b', margin:'0 0 10px 0'}}>🆘 Urgence</h3>
                    <button className="btn-primary" style={{background:'red', width:'100%'}} onClick={()=>setShowModal(true)}>SIGNALER INCIDENT</button>
                </div>

                <h3>📋 Mes Tâches</h3>
                {tasks.map(t=>(
                    <div key={t.id} style={{padding:'10px', borderLeft: t.statut==='Terminé'?'4px solid green':'4px solid orange', marginBottom:'10px', background:'#f9fafb'}}>
                        <strong>{t.titre}</strong> <br/> {t.heure} <br/> <em>{t.statut}</em>
                    </div>
                ))}
            </div>

            <div className="panel">
                <h3>📅 Programme Global (En direct)</h3>
                <p>Aperçu des épreuves en cours...</p>
                {programme.length === 0 && <p>Chargement...</p>}
                {programme.map(p => (
                    <div key={p.id} style={{borderBottom:'1px solid #eee', padding:'5px 0'}}>
                        <strong>{p.name}</strong> <span style={{color:'gray'}}>({p.context})</span>
                    </div>
                ))}
            </div>
        </div>

        {showModal && (
            <div className="notifications-overlay-backdrop">
                <div className="notifications-overlay" style={{textAlign:'center'}}>
                    <h2 style={{color:'red'}}>🚨 Alerte Sécurité</h2>
                    <p>Envoi de votre position GPS au PC Sécurité...</p>
                    <textarea placeholder="Description..." style={{width:'100%', height:'80px'}}></textarea>
                    <div style={{marginTop:'1rem', display:'flex', gap:'10px', justifyContent:'center'}}>
                        <button className="btn-secondary" onClick={()=>setShowModal(false)}>Annuler</button>
                        <button className="btn-primary" style={{background:'red'}} onClick={()=>{alert("Envoyé !"); setShowModal(false)}}>CONFIRMER</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
export default VolontairePage;