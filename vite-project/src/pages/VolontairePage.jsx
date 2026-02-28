import React, { useCallback, useState } from 'react';
import { useProgramme } from '../hooks/useProgramme';
import { useAuth } from '../context/AuthContext.jsx';

function VolontairePage() {
  const { token, user, logout } = useAuth();
  const [tasks] = useState([
      {id:1, titre:'Accueil Zone A', heure:'08:00 - 12:00', statut:'Terminé'},
      {id:2, titre:'Sécurité Bassin', heure:'13:00 - 17:00', statut:'À venir'},
  ]);
  const [showModal, setShowModal] = useState(false);

  const mapProgramme = useCallback((e, competition) => ({ ...e, context: competition.name }), []);
  const { data: programme, loading } = useProgramme({ token, mapper: mapProgramme });

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
            <div className="spectator-header-left"><h1>Espace Volontaire</h1><p>Merci Hector !</p></div>
            <div className="spectator-header-right">{user?.username && <span>{user.username}</span>}<button className="btn-secondary" onClick={logout}>Déconnexion</button></div>
        </div>

        <div className="spectator-main">
            <div className="panel">
                <div style={{background:'#fee2e2', padding:'1rem', borderRadius:'8px', textAlign:'center', border:'1px solid #fecaca', marginBottom:'1.5rem'}}>
                    <h3 style={{color:'#991b1b', margin:'0 0 10px 0'}}>🆘 Urgence</h3>
                    <button className="btn-primary" style={{background:'red', width:'100%'}} onClick={() => setShowModal(true)}>SIGNALER INCIDENT</button>
                </div>

                <h3>📋 Mes Tâches</h3>
                {tasks.map((t) => (
                    <div key={t.id} style={{padding:'10px', borderLeft: t.statut==='Terminé'?'4px solid green':'4px solid orange', marginBottom:'10px', background:'#f9fafb'}}>
                        <strong>{t.titre}</strong> <br/> {t.heure} <br/> <em>{t.statut}</em>
                    </div>
                ))}
            </div>

            <div className="panel">
                <h3>📅 Programme Global (En direct)</h3>
                <p>Aperçu des épreuves en cours...</p>
                <p className="text-error">Workflow incident backend non connecté (hors API fournie).</p>
                {loading && programme.length === 0 && <p>Chargement...</p>}
                {programme.map((p) => (
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
                        <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                        <button className="btn-primary" style={{background:'red'}} onClick={() => { alert('Envoyé !'); setShowModal(false); }}>CONFIRMER</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default VolontairePage;
