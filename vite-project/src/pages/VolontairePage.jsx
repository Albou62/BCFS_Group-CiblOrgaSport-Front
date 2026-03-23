import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyTasks } from '../services/userService';

function VolontairePage() {
  const { token, user, logout } = useAuth();

  // États pour les tâches (Microservice Task/User)
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // États pour le programme (Microservice Compétition)
  const [programme, setProgramme] = useState([]);
  const [loadingProgramme, setLoadingProgramme] = useState(false);

  // États pour le modal d'incident (Microservice Notification)
  const [showModal, setShowModal] = useState(false);
  const [incidentDesc, setIncidentDesc] = useState('');

  // 1. Récupération du Programme Global (Épreuves à venir)
  useEffect(() => {
    const fetchProgramme = async () => {
      setLoadingProgramme(true);
      try {
        const response = await fetch('http://localhost:8080/api/public/upcoming-epreuves?limit=10');
        if (!response.ok) throw new Error('Erreur API Programme');
        const data = await response.json();

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

  // 2. Récupération des Tâches assignées par le Responsable
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

  // 3. Envoi d'un Signalement d'Incident
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
      alert('✅ Incident envoyé ! Les secours et le responsable ont été alertés.');
      setShowModal(false);
      setIncidentDesc('');
    } catch (err) { alert("❌ Erreur d'envoi."); }
  };

  // 4. Mise à jour du statut d'une tâche (Démarrer / Terminer)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la mise à jour");
      }

      // Mise à jour locale de l'état pour refléter le changement immédiatement
      setTasks(prevTasks =>
        prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );

      if (newStatus === 'En cours') {
        alert("▶️ Mission démarrée ! Bon courage sur le terrain.");
      } else {
        alert("✅ Mission terminée. Merci pour votre aide !");
      }
    } catch (err) {
      console.error("Erreur mise à jour statut:", err);
      alert("❌ Impossible de mettre à jour le statut. Vérifiez votre connexion.");
    }
  };


  return (
    <div className="app-container">
      <div className="spectator-shell">
        {/* HEADER */}
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Volontaire</h1>
            <p>Ravi de vous revoir, <strong>{user?.username || 'Volontaire'}</strong> !</p>
          </div>
          <div className="spectator-header-right">
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <div className="spectator-main">
          {/* COLONNE GAUCHE : URGENCES & MISSIONS */}
          <div className="panel">
            {/* BLOC URGENCE */}
            <div style={{ background: '#fee2e2', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '2px solid #ef4444', marginBottom: '2rem' }}>
              <h3 style={{ color: '#991b1b', margin: '0 0 10px 0', fontWeight: '800' }}>🚨 Sécurité & Incidents</h3>
              <p style={{ fontSize: '0.85rem', color: '#b91c1c', marginBottom: '1rem' }}>Signalez immédiatement tout problème sur le terrain.</p>
              <button className="btn-primary" style={{ background: '#dc2626', width: '100%', fontWeight: 'bold' }} onClick={() => setShowModal(true)}>
                SIGNALER UN INCIDENT
              </button>
            </div>

            <h3>📋 Mon Agenda</h3>
            {loadingTasks ? <p>Chargement...</p> : tasks.length === 0 ? (
              <p>Aucune tâche pour aujourd'hui.</p>
            ) : (
              tasks.map((t) => (
                <div key={t.id} style={{
                  padding: '15px',
                  borderLeft: t.status === 'Terminé' ? '5px solid #10b981' : (t.status === 'En cours' ? '5px solid #3b82f6' : '5px solid #f97316'),
                  marginBottom: '12px', background: '#fff', borderRadius: '0 8px 8px 0', border: '1px solid #eee', borderLeftWidth: '5px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>{t.title}</strong>
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                      backgroundColor: t.status === 'Terminé' ? '#dcfce7' : (t.status === 'En cours' ? '#dbeafe' : '#ffedd5'),
                      color: t.status === 'Terminé' ? '#166534' : (t.status === 'En cours' ? '#1e40af' : '#9a3412')
                    }}>
                      {t.status === 'Terminé' ? 'TERMINÉ' : (t.status === 'En cours' ? 'EN COURS' : 'À VENIR')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem' }}>🕒 {t.timeSlot}</span>
                    {t.status !== 'Terminé' && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '10px', padding: '5px', background: t.status === 'En cours' ? '#10b981' : '#3b82f6' }}
                        onClick={() => handleUpdateStatus(t.id, t.status === 'En cours' ? 'Terminé' : 'En cours')}
                      >
                        {t.status === 'En cours' ? 'TERMINER' : 'DÉMARRER'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* COLONNE DROITE : PROGRAMME GLOBAL */}
          <div className="panel">
            <h3>📅 Programme Olympique</h3>
            <p className="panel-subtitle">Restez informé des épreuves en cours.</p>

            {loadingProgramme ? <p>Mise à jour du calendrier...</p> : programme.length > 0 ? (
              programme.map((p) => (
                <div key={p.id} style={{ borderBottom: '1px solid #f3f4f6', padding: '15px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '1rem' }}>{p.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>📍 {p.context}</div>
                    </div>

                    <div style={{ textAlign: 'right', background: '#eff6ff', padding: '5px 10px', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 'bold', color: '#1d4ed8', fontSize: '1rem' }}>
                        {p.horairePublic ? new Date(p.horairePublic).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 'bold' }}>
                        {p.horairePublic ? new Date(p.horairePublic).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase() : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'gray' }}>Aucune épreuve détectée.</p>
            )}
          </div>
        </div>

        {/* MODAL INCIDENT */}
        {showModal && (
          <div className="notifications-overlay-backdrop">
            <div className="notifications-overlay" style={{ maxWidth: '450px', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 style={{ color: '#b91c1c', margin: 0 }}>Alerte Terrain</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Décrivez précisément l'incident pour une intervention rapide.</p>

              <textarea
                placeholder="Type de problème, lieu exact, nombre de personnes impliquées..."
                style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
              ></textarea>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Annuler</button>
                <button className="btn-primary" style={{ background: '#dc2626', flex: 2 }} onClick={handleSignalement}>ENVOYER L'ALERTE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VolontairePage;