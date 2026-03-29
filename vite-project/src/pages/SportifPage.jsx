import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getSportifProfile, uploadDocument, registerToEpreuve } from '../services/userService';
import { getManchesByEpreuve, getResultatsByManche } from '../services/competitionService';

function SportifPage() {
  const { token, user, logout } = useAuth();

  const [docs, setDocs] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [mesInscriptionsIds, setMesInscriptionsIds] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour l'affichage des résultats
  const [selectedResults, setSelectedResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const mesEpreuves = useMemo(() => {
    return schedule.filter(s => mesInscriptionsIds.includes(s.id));
  }, [schedule, mesInscriptionsIds]);

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
          dateRaw: e.horairePublic,
          inscrits: e.inscrits || []
        })) : [];
        setSchedule(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur épreuves:', err);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => { refreshDocs(); }, [refreshDocs]);

  // FONCTION DE RÉCUPÉRATION SYNCHRONISÉE
  // FONCTION DE RÉCUPÉRATION SYNCHRONISÉE ET CORRIGÉE
  const handleViewResults = async (epreuveId) => {
    try {
      const manches = await getManchesByEpreuve(token, epreuveId);
      if (!manches || manches.length === 0) {
        alert("ℹ️ Aucun résultat publié pour le moment.");
        return;
      }

      // 1. On prend la manche la plus RÉCENTE par ID pour éviter d'afficher d'anciens tests
      const derniereManche = [...manches].sort((a, b) => b.id - a.id)[0];

      // 2. On récupère les résultats de cette manche précise
      const results = await getResultatsByManche(token, derniereManche.id);

      // 3. Récupération des infos pour le mapping des noms
      const epreuveInfos = schedule.find(s => s.id === epreuveId);
      const listeInscrits = epreuveInfos?.inscrits || [];

      const enriched = results.map(res => {
        // RECHERCHE ROBUSTE : On compare les IDs en les forçant en String
        const athlete = listeInscrits.find(i =>
          String(i.id) === String(res.athleteId) || String(i.athleteId) === String(res.athleteId)
        );

        return {
          ...res,
          // Priorité au nom du backend, sinon recherche dans les inscrits, sinon fallback
          nomAffiche: res.nomAthlete || (athlete ? (athlete.nom || `${athlete.firstName} ${athlete.lastName}`) : `Concurrent #${res.athleteId}`)
        };
      });

      setSelectedResults({
        mancheNom: derniereManche.name,
        type: derniereManche.typeClassement,
        scores: enriched,
        epreuveNom: epreuveInfos?.epreuve || "Épreuve"
      });
      setShowResults(true);
    } catch (err) {
      console.error("Erreur de synchronisation :", err);
      alert("Erreur lors du chargement des scores.");
    }
  };

  const handleUpload = async (type, fileName) => {
    if (!fileName) return;
    try {
      await uploadDocument(token, { type, fileName, status: 'EN_ATTENTE' });
      alert(`✅ ${type} envoyé !`);
      refreshDocs();
    } catch (err) { alert("❌ Erreur upload."); }
  };

  const handleRegister = async (epreuveId) => {
    if (!isEligible) return alert("❌ Dossier incomplet.");
    try {
      await registerToEpreuve(token, { username: user.username, epreuveId });
      alert("✅ Inscription confirmée !");
      refreshDocs();
    } catch (err) { alert("❌ Erreur inscription."); }
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
          {/* SECTION MES ÉPREUVES */}
          <div className="panel" style={{ width: '100%', marginBottom: '1.5rem', border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
            <h2 className="panel-title" style={{ color: '#16a34a' }}>🏆 Mes Épreuves Confirmées</h2>
            {mesEpreuves.length === 0 ? <p>Aucune inscription confirmée.</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {mesEpreuves.map(me => (
                  <div key={me.id} style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontWeight: 'bold' }}>{me.epreuve}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>📍 {me.lieu}</div>
                    <button
                      onClick={() => handleViewResults(me.id)}
                      style={{ marginTop: '10px', padding: '8px', cursor: 'pointer', width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                    >
                      📊 Voir Classement
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* DOSSIER ADMIN */}
            <div className="panel" style={{ flex: 1, minWidth: '350px' }}>
              <h2 className="panel-title">🪪 Dossier Administratif</h2>
              {['Passeport', 'Certificat'].map(type => {
                const doc = docs.find(d => d.type?.toUpperCase().includes(type.toUpperCase().substring(0, 4)));
                return (
                  <div key={type} style={{ padding: '15px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: doc?.status === 'VALIDE' ? '#f0fdf4' : '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{type}</strong>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: doc?.status === 'VALIDE' ? '#16a34a' : '#ca8a04' }}>{doc ? doc.status : 'À ENVOYER'}</span>
                    </div>
                    {doc ? <div style={{ fontSize: '0.85rem' }}>📄 {doc.fileName}</div> : <input type="file" onChange={(e) => handleUpload(type, e.target.files[0]?.name)} />}
                  </div>
                );
              })}
            </div>

            {/* INSCRIPTION */}
            <div className="panel" style={{ flex: 2, minWidth: '400px' }}>
              <h2 className="panel-title">📅 Inscription aux Épreuves</h2>
              {schedule.map(s => {
                const dejaInscrit = mesInscriptionsIds.includes(s.id);
                return (
                  <div key={s.id} style={{ padding: '15px', background: '#f8fafc', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px' }}>
                    <div><div style={{ fontWeight: 'bold' }}>{s.epreuve}</div><small>📍 {s.lieu}</small></div>
                    <button onClick={() => !dejaInscrit && handleRegister(s.id)} disabled={dejaInscrit || !isEligible} style={{ background: dejaInscrit ? '#16a34a' : '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold' }}>
                      {dejaInscrit ? "✅ Inscrit" : "🚀 S'inscrire"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TABLEAU DES RÉSULTATS DYNAMIQUE */}
          {showResults && selectedResults && (
            <div className="panel" style={{ width: '100%', marginTop: '1.5rem', border: '2px solid #2563eb', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: '#2563eb' }}>📊 Résultats : {selectedResults.epreuveNom}</h2>
                <button onClick={() => setShowResults(false)} style={{ cursor: 'pointer', fontSize: '1.5rem', border: 'none', background: 'none' }}>✖</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Rang</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Athlète</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedResults.scores.map((res, index) => {
                    const isMe = String(res.athleteId) === String(user?.id);
                    return (
                      <tr key={res.id} style={{ background: isMe ? '#eff6ff' : 'white', fontWeight: isMe ? 'bold' : 'normal', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {index + 1} {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {res.nomAffiche} {isMe && <span style={{ color: '#2563eb', marginLeft: '8px' }}>(Moi)</span>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {selectedResults.type === 'TIME_ASC'
                            ? (res.temps?.split(':').pop() || '0')
                            : (res.score || '0')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SportifPage;