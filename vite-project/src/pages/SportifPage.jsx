import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getSportifProfile, uploadDocument, registerToEpreuve } from '../services/userService';

function SportifPage() {
  const { token, user, logout } = useAuth();

  // 1. États de base
  const [docs, setDocs] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [mesInscriptionsIds, setMesInscriptionsIds] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Calcul des épreuves confirmées (doit être après la définition de schedule)
  const mesEpreuves = useMemo(() => {
    return schedule.filter(s => mesInscriptionsIds.includes(s.id));
  }, [schedule, mesInscriptionsIds]);

  // 3. Récupération du profil et des documents
  const refreshDocs = useCallback(() => {
    if (!token) return;
    getSportifProfile(token)
      .then(data => {
        setDocs(data.documents || []);
        setMesInscriptionsIds(data.registeredEpreuveIds || []);

        const hasPassport = data.documents?.some(d => d.type?.toUpperCase().includes('PASS') && d.status === 'VALIDE');
        const hasCertif = data.documents?.some(d => d.type?.toUpperCase().includes('CERTIF') && d.status === 'VALIDE');

        setIsEligible(hasPassport && hasCertif && data.trackingAccepted);
      })
      .catch(err => console.error("Erreur profil:", err));
  }, [token]);

  // 4. Chargement du programme (URL publique Gateway)
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('http://localhost:8080/api/public/upcoming-epreuves?limit=10')
      .then((res) => res.json())
      .then((data) => {
        const formattedData = Array.isArray(data) ? data.map(e => ({
          id: e.id,
          epreuve: e.name,
          lieu: e.competitionName || (e.competition ? e.competition.name : 'Site Olympique'),
          dateRaw: e.horairePublic
        })) : [];
        setSchedule(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur chargement épreuves:', err);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  // 5. Actions (Upload & Inscription)
  const handleUpload = async (type, fileName) => {
    if (!fileName) return;
    const docPayload = { type, fileName, status: 'EN_ATTENTE' };
    try {
      await uploadDocument(token, docPayload);
      alert(`✅ ${type} envoyé !`);
      refreshDocs();
    } catch (err) {
      alert("❌ Erreur upload.");
    }
  };

  const handleRegister = async (epreuveId) => {
    if (!isEligible) {
      alert("❌ Dossier non validé.");
      return;
    }
    try {
      await registerToEpreuve(token, { username: user.username, epreuveId });
      alert("✅ Inscription confirmée !");
      refreshDocs();
    } catch (err) {
      alert("❌ Erreur inscription.");
    }
  };

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Sportif</h1>
            <p>Paris 2024 - Athlète Officiel</p>
          </div>
          <div className="spectator-header-right">
            <span style={{ marginRight: '15px', fontWeight: 'bold' }}>{user?.username}</span>
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <div className="spectator-main-full">
          {/* --- SECTION MES INSCRIPTIONS --- */}
          <div className="panel" style={{ width: '100%', marginBottom: '1.5rem', border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
            <h2 className="panel-title" style={{ color: '#16a34a' }}>🏆 Mes Épreuves Confirmées</h2>
            {mesEpreuves.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Aucune inscription confirmée.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {mesEpreuves.map(me => (
                  <div key={me.id} style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontWeight: 'bold' }}>{me.epreuve}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>📍 {me.lieu}</div>
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '5px', fontWeight: '600' }}>
                      ⏱️ {new Date(me.dateRaw).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* --- SECTION DOCUMENTS --- */}
            <div className="panel" style={{ flex: 1, minWidth: '350px' }}>
              <h2 className="panel-title">🪪 Dossier Administratif</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {['Passeport', 'Certificat'].map(type => {
                  const doc = docs.find(d => d.type?.toUpperCase().includes(type.toUpperCase().substring(0, 4)));
                  const isValide = doc?.status === 'VALIDE';
                  const isPending = doc?.status === 'EN_ATTENTE';
                  const isRefuse = doc?.status === 'REFUSE';

                  return (
                    <div key={type} style={{
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: isValide ? '#f0fdf4' : isRefuse ? '#fef2f2' : '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '0.95rem' }}>
                          {type === 'Passeport' ? '🛂 Passeport' : '🏥 Certificat Médical'}
                        </strong>
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                          background: isValide ? '#16a34a' : isRefuse ? '#dc2626' : isPending ? '#ca8a04' : '#64748b',
                          color: 'white'
                        }}>
                          {doc ? doc.status.replace('_', ' ') : 'À ENVOYER'}
                        </span>
                      </div>



                      {/* Affichage du nom du fichier OU de l'input pour renvoyer */}
                      {doc && !isRefuse ? (
                        <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          📄 {doc.fileName}
                        </div>
                      ) : (
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>
                            {isRefuse ? "Recharger un document valide :" : "Sélectionner un fichier :"}
                          </label>
                          <input
                            type="file"
                            onChange={(e) => handleUpload(type, e.target.files[0]?.name)}
                            style={{ fontSize: '0.8rem', width: '100%' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- SECTION PROGRAMME --- */}
            <div className="panel" style={{ flex: 2, minWidth: '400px' }}>
              <h2 className="panel-title">📅 Inscription aux Épreuves</h2>
              {loading && <p>Chargement...</p>}
              {!loading && schedule.map(s => {
                const dejaInscrit = mesInscriptionsIds.includes(s.id);
                return (
                  <div key={s.id} style={{ padding: '15px', borderLeft: '5px solid #2563eb', background: '#f8fafc', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{s.epreuve}</div>
                      <div style={{ fontSize: '0.85rem' }}>📍 {s.lieu}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => !dejaInscrit && handleRegister(s.id)}
                        disabled={dejaInscrit || !isEligible}
                        style={{
                          padding: '8px 16px', borderRadius: '6px', border: 'none',
                          backgroundColor: dejaInscrit ? '#16a34a' : (isEligible ? '#2563eb' : '#94a3b8'),
                          color: 'white', fontWeight: 'bold', cursor: (dejaInscrit || !isEligible) ? 'default' : 'pointer'
                        }}
                      >
                        {dejaInscrit ? "✅ Inscrit" : (isEligible ? "🚀 S'inscrire" : "🔒 Dossier à valider")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SportifPage;