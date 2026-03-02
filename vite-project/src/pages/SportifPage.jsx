import React, { useCallback, useState, useEffect } from 'react';
import { useProgramme } from '../hooks/useProgramme';
import { useAuth } from '../context/AuthContext.jsx';
import { getSportifProfile, uploadDocument } from '../services/userService';

function SportifPage() {
  const { token, user, logout } = useAuth();
  const [docs, setDocs] = useState([]);

  // 1. Rafraîchir la liste des documents
  const refreshDocs = useCallback(() => {
    if (!token) return;
    getSportifProfile(token)
      .then(data => setDocs(data.documents || []))
      .catch(err => console.error("Erreur profil:", err));
  }, [token]);

  useEffect(() => { refreshDocs(); }, [refreshDocs]);

  // 2. Gestion de l'upload pour les deux types
  const handleUpload = async (type, fileName) => {
    if (!fileName) return;
    try {
      await uploadDocument(token, { type, fileName, status: 'EN_ATTENTE' });
      alert(`✅ Document ${type} envoyé !`);
      refreshDocs();
    } catch (err) {
      alert("❌ Erreur lors de l'envoi");
    }
  };

  // 3. Tes Hooks pour le programme (inchangés car ils marchent ici)
  const mapSchedule = useCallback((e, comp) => ({ 
    id: e.id, 
    epreuve: e.name, 
    lieu: e.competitionName || (comp ? comp.name : 'Site Olympique'),
    dateRaw: e.horairePublic 
  }), []);

  const { data: schedule, loading } = useProgramme({ token, mapper: mapSchedule });

  // Helper pour trouver le statut d'un document spécifique
  const getStatus = (type) => docs.find(d => d.type === type)?.status || 'Manquant';

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left"><h1>Espace Sportif</h1></div>
          <div className="spectator-header-right">
            {user?.username} <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>
        <div className="spectator-main-full">
          <div style={{display:'flex', gap:'1.5rem'}}>
            
            {/* Dans SportifPage.jsx - Remplace la section Dossier */}
<div className="panel" style={{flex:1}}>
  <h2 className="panel-title">🪪 Suivi de mon Dossier</h2>
  <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '1rem'}}>
    Envoyez vos documents et suivez la validation du commissaire.
  </p>

  <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
    {['Passeport', 'Certificat'].map(type => {
      const doc = docs.find(d => d.type === type);
      const isPending = doc?.status === 'EN_ATTENTE';
      const isValide = doc?.status === 'VALIDE';
      const isRefuse = doc?.status === 'REFUSE';

      return (
        <div key={type} style={{
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0',
          background: isValide ? '#f0fdf4' : isRefuse ? '#fef2f2' : '#fff'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
            <strong>{type === 'Passeport' ? '🛂 Passeport' : '🏥 Certificat Médical'}</strong>
            
            {/* BADGE DE STATUT */}
            <span style={{
              padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
              background: isValide ? '#16a34a' : isRefuse ? '#dc2626' : isPending ? '#ca8a04' : '#64748b',
              color: 'white'
            }}>
              {doc ? doc.status.replace('_', ' ') : 'À ENVOYER'}
            </span>
          </div>

          {!doc || isRefuse ? (
            <div style={{marginTop: '5px'}}>
              <input 
                type="file" 
                onChange={(e) => handleUpload(type, e.target.files[0]?.name)}
                style={{fontSize: '0.8rem'}}
              />
              {isRefuse && <p style={{color: '#dc2626', fontSize: '0.7rem', marginTop: '5px'}}>⚠️ Document refusé, merci de renvoyer un fichier lisible.</p>}
            </div>
          ) : (
            <div style={{fontSize: '0.85rem', color: '#475569'}}>
              📄 {doc.fileName}
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>

            {/* ÉPREUVES */}
            <div className="panel" style={{flex:2}}>
              <h2 className="panel-title">📅 Mes Épreuves</h2>
              {loading ? <p>Chargement...</p> : schedule.map(s => (
                <div key={s.id} style={{padding:'12px', borderLeft:'4px solid blue', background:'#f8fafc', marginBottom:'10px', display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <strong>{s.epreuve}</strong> - 📍 {s.lieu}
                  </div>
                  <div style={{fontSize: '0.9em', color: '#666'}}>
                    {s.dateRaw ? new Date(s.dateRaw).toLocaleString('fr-FR', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}) : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SportifPage;