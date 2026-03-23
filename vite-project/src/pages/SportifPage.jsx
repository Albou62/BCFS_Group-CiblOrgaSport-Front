import React, { useCallback, useState, useEffect } from 'react';
import { useProgramme } from '../hooks/useProgramme';
import { useAuth } from '../context/AuthContext.jsx';
import { getSportifProfile, uploadDocument } from '../services/userService';
import Geolocation from '../components/Geolocation.jsx';

function SportifPage() {
  const { token, user, logout } = useAuth();
  const [docs, setDocs] = useState([]);

  // 1. Rafraîchir la liste des documents 
  const refreshDocs = useCallback(() => {
    if (!token) return;
    getSportifProfile(token)
      .then(data => {
        setDocs(data.documents || []);
      })
      .catch(err => console.error("Erreur lors de la récupération du profil:", err));
  }, [token]);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  // 2. Gestion de l'upload 
  const handleUpload = async (type, fileName) => {
    if (!fileName) return;
    
    const docPayload = {
      type: type,
      fileName: fileName,
      status: 'EN_ATTENTE'
    };

    try {
      await uploadDocument(token, docPayload);
      alert(`✅ ${type} envoyé avec succès !`);
      refreshDocs(); 
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Erreur lors de l'envoi du document.");
    }
  };

  // 3. Programme des épreuves 
  const mapSchedule = useCallback((e, comp) => ({ 
    id: e.id, 
    epreuve: e.name, 
    lieu: e.competitionName || (comp ? comp.name : 'Site Olympique'),
    dateRaw: e.horairePublic 
  }), []);

  const { data: schedule, loading } = useProgramme({ token, mapper: mapSchedule });

  return (
    <div className="app-container">
      <Geolocation />
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Sportif</h1>
            <p>Paris 2024 - Athlète Officiel</p>
          </div>
          <div className="spectator-header-right">
            <span style={{marginRight: '15px', fontWeight: 'bold'}}>{user?.username}</span>
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <div className="spectator-main-full">
          <div style={{display:'flex', gap:'1.5rem', flexWrap: 'wrap'}}>
            
            {/* SECTION DOSSIER ADMINISTRATIF */}
            <div className="panel" style={{flex:1, minWidth: '350px'}}>
              <h2 className="panel-title">🪪 Suivi de mon Dossier</h2>
              <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem'}}>
                Statut de vos pièces justificatives pour l'éligibilité.
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
                      transition: 'all 0.3s ease',
                      background: isValide ? '#f0fdf4' : isRefuse ? '#fef2f2' : '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                        <strong style={{fontSize: '0.95rem'}}>
                          {type === 'Passeport' ? '🛂 Passeport' : '🏥 Certificat Médical'}
                        </strong>
                        
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                          background: isValide ? '#16a34a' : isRefuse ? '#dc2626' : isPending ? '#ca8a04' : '#64748b',
                          color: 'white',
                          textTransform: 'uppercase'
                        }}>
                          {doc ? doc.status.replace('_', ' ') : 'À ENVOYER'}
                        </span>
                      </div>

                      {!doc || isRefuse ? (
                        <div style={{marginTop: '5px'}}>
                          <input 
                            type="file" 
                            onChange={(e) => handleUpload(type, e.target.files[0]?.name)}
                            style={{fontSize: '0.8rem', width: '100%'}}
                          />
                          {isRefuse && (
                            <p style={{color: '#dc2626', fontSize: '0.75rem', marginTop: '8px', fontWeight: '500'}}>
                              ⚠️ Document refusé. Veuillez uploader une version conforme.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div style={{fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px'}}>
                          <span role="img" aria-label="file">📄</span> {doc.fileName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION ÉPREUVES */}
            <div className="panel" style={{flex:2, minWidth: '400px'}}>
              <h2 className="panel-title">📅 Mon Calendrier de Compétition</h2>
              {loading ? (
                <p>Chargement de votre programme...</p>
              ) : schedule.length > 0 ? (
                schedule.map(s => (
                  <div key={s.id} style={{
                    padding:'15px', 
                    borderLeft:'5px solid #2563eb', 
                    background:'#f8fafc', 
                    marginBottom:'12px', 
                    display:'flex', 
                    justifyContent:'space-between',
                    alignItems: 'center',
                    borderRadius: '0 8px 8px 0'
                  }}>
                    <div>
                      <div style={{fontWeight: 'bold', color: '#1e3a8a'}}>{s.epreuve}</div>
                      <div style={{fontSize: '0.85rem', color: '#64748b'}}>📍 {s.lieu}</div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontWeight: '600', color: '#334155'}}>
                        {s.dateRaw ? new Date(s.dateRaw).toLocaleDateString('fr-FR', {day:'2-digit', month:'long'}) : ''}
                      </div>
                      <div style={{fontSize: '0.8rem', color: '#64748b'}}>
                        {s.dateRaw ? new Date(s.dateRaw).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) : ''}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>
                  <p>Aucune épreuve programmée pour le moment.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SportifPage;