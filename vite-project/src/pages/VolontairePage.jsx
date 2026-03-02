import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyTasks } from '../services/userService'; 

function VolontairePage() {
  const { token, user, logout } = useAuth();
  
  // États pour les tâches
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  // États pour le programme (Remplacement du hook par fetch direct)
  const [programme, setProgramme] = useState([]);
  const [loadingProgramme, setLoadingProgramme] = useState(false);

  // États pour le modal d'incident
  const [showModal, setShowModal] = useState(false);
  const [incidentDesc, setIncidentDesc] = useState('');

  // 1. Récupération du Programme Global (Fetch Direct)
  useEffect(() => {
    const fetchProgramme = async () => {
      setLoadingProgramme(true);
      try {
        // On utilise l'URL qui a fonctionné précédemment
        const response = await fetch('http://localhost:8080/api/public/upcoming-epreuves?limit=10');
        if (!response.ok) throw new Error('Erreur API Programme');
        const data = await response.json();
        
        // Mapping manuel pour correspondre à ta mise en page (p.name et p.context)
        const mappedData = data.map(p => ({
          ...p,
          name: p.name || "Épreuve sans nom",
          context: p.competitionName || `Compétition #${p.competitionId}`
        }));
        
        setProgramme(mappedData);
      } catch (err) {
        console.error("Erreur programme:", err);
      } finally {
        setLoadingProgramme(false);
      }
    };

    if (token) fetchProgramme();
  }, [token]);

  // 2. Récupération des Tâches (Microservice User)
  useEffect(() => {
    if (token) {
      setLoadingTasks(true);
      getMyTasks(token)
        .then(data => {
          setTasks(Array.isArray(data) ? data : []);
          setLoadingTasks(false);
        })
        .catch(err => {
          console.error("Erreur tâches :", err);
          setLoadingTasks(false);
        });
    }
  }, [token]);

  // 3. Envoi d'un Incident
  const handleSignalement = async () => {
    if (!incidentDesc.trim()) return alert("Veuillez décrire le problème.");
    try {
      const response = await fetch('http://localhost:8080/api/notification/incidents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          description: incidentDesc, 
          niveau: 'URGENCE',
          auteur: user?.username || 'Anonyme'
        })
      });
      if (!response.ok) throw new Error("Échec de l'envoi");
      alert('✅ Incident envoyé !');
      setShowModal(false);
      setIncidentDesc('');
    } catch (err) { alert("❌ Erreur d'envoi."); }
  };

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
            <div className="spectator-header-left">
              <h1>Espace Volontaire</h1>
              <p>Merci pour ton engagement, {user?.username || 'Volontaire'} !</p>
            </div>
            <div className="spectator-header-right">
              {user?.username && <span style={{ marginRight: '1rem' }}>{user.username}</span>}
              <button className="btn-secondary" onClick={logout}>Déconnexion</button>
            </div>
        </div>

        <div className="spectator-main">
            {/* Colonne Gauche : Urgences et Tâches */}
            <div className="panel">
                <div style={{background:'#fee2e2', padding:'1rem', borderRadius:'8px', textAlign:'center', border:'1px solid #fecaca', marginBottom:'1.5rem'}}>
                    <h3 style={{color:'#991b1b', margin:'0 0 10px 0'}}>🆘 Urgence</h3>
                    <button className="btn-primary" style={{background:'red', width:'100%'}} onClick={() => setShowModal(true)}>
                      SIGNALER UN INCIDENT
                    </button>
                </div>

                <h3>📋 Mes Tâches assignées</h3>
                {loadingTasks ? (
                  <p>Chargement des missions...</p>
                ) : tasks.length === 0 ? (
                  <div style={{ padding: '10px', background: '#f3f4f6', borderRadius: '4px', fontStyle: 'italic', color: '#4b5563' }}>
                    Aucune tâche assignée.
                  </div>
                ) : (
                  tasks.map((t) => (
                    <div key={t.id} style={{ padding:'10px', borderLeft: t.status === 'Terminé' ? '4px solid green' : '4px solid orange', marginBottom:'10px', background:'#f9fafb' }}>
                        <strong>{t.title}</strong> <br/> 
                        {t.timeSlot} <br/> 
                        <em>{t.status}</em>
                    </div>
                  ))
                )}
            </div>

           {/* Colonne Droite : Programme global */}
<div className="panel">
    <h3>📅 Programme Global (En direct)</h3>
    <p>Aperçu des épreuves de la journée</p>
    
    {loadingProgramme ? <p>Chargement du programme...</p> : programme.length > 0 ? (
      programme.map((p) => (
          <div key={p.id} style={{borderBottom:'1px solid #eee', padding:'12px 0'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <strong style={{fontSize:'1.1rem', color:'#1e40af'}}>{p.name}</strong> <br/>
                  <span style={{color:'gray', fontSize: '0.85em'}}>🏆 {p.context}</span>
                </div>
                
                {/* AFFICHAGE DU JOUR ET DE L'HEURE */}
                <div style={{textAlign:'right', minWidth:'100px'}}>
                  <div style={{fontWeight:'bold', color:'#374151'}}>
                    {p.horairePublic ? new Date(p.horairePublic).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                  </div>
                  <div style={{fontSize:'0.75rem', color:'#6b7280'}}>
                    {p.horairePublic ? new Date(p.horairePublic).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'}) : ''}
                  </div>
                </div>
              </div>
          </div>
      ))
    ) : (
      <p style={{ color: 'gray' }}>Aucune épreuve programmée pour le moment.</p>
    )}
</div>
        </div>

        {/* Modal Incident */}
        {showModal && (
            <div className="notifications-overlay-backdrop">
                <div className="notifications-overlay" style={{textAlign:'center', maxWidth: '400px', width: '90%'}}>
                    <h2 style={{color:'red'}}>🚨 Alerte Sécurité</h2>
                    <textarea 
                      placeholder="Décrivez l'incident..." 
                      style={{width:'100%', height:'100px', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ccc'}}
                      value={incidentDesc}
                      onChange={(e) => setIncidentDesc(e.target.value)}
                    ></textarea>
                    <div style={{marginTop:'1rem', display:'flex', gap:'10px', justifyContent:'center'}}>
                        <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                        <button className="btn-primary" style={{background:'red'}} onClick={handleSignalement}>ENVOYER</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default VolontairePage;