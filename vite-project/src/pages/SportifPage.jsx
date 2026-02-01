import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

function SportifPage({ token, onLogout, username }) {
  // --- MOCK DONNÉES ---
  const [schedule] = useState([
    {
      id: 1,
      epreuve: '200m 4 Nages (Séries)',
      lieu: 'Centre Aquatique - Bassin Compétition',
      heure_convocation: '08:30',
      heure_debut: '10:00',
      statut: 'À venir',
    }
  ]);

  const [results] = useState([
    { id: 10, epreuve: '100m Papillon', temps: '51.20s', rang: '2ème', date: '04/02/2026' }
  ]);

  // --- GESTION DOCUMENTS ---
  const [documents, setDocuments] = useState({
    passeport: { file: null, status: 'Manquant' },
    certificat: { file: null, status: 'Manquant' }
  });

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [type]: { file: file, status: 'En attente' }
      }));
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'Validé': return <span className="badge-success">Validé ✅</span>;
        case 'Refusé': return <span className="badge-warning" style={{background:'#fee2e2', color:'#991b1b'}}>Refusé ❌</span>;
        case 'En attente': return <span className="badge-secondary" style={{background:'#fef3c7', color:'#92400e'}}>En examen ⏳</span>;
        default: return <span className="badge-secondary">À envoyer 📤</span>;
    }
  };

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Sportif</h1>
            <p>Bienvenue {username || 'Athlète'}. Préparez vos prochaines courses.</p>
          </div>
          <div className="spectator-header-right">
             {username && <span>{username} · <span style={{ opacity: 0.8 }}>Athlète</span></span>}
            <button className="btn-secondary" onClick={onLogout}>Se déconnecter</button>
          </div>
        </div>

        <div className="spectator-main">
          
          {/* COLONNE GAUCHE : DOCUMENTS */}
          <div className="panel" style={{flex: 1}}>
            <h2 className="panel-title">🪪 Dossier Administratif</h2>
            <p className="panel-subtitle">Documents requis pour l'accréditation.</p>
            
            <div style={{marginTop:'1rem'}}>
                {/* PASSEPORT */}
                <div style={{padding:'1rem', border:'1px solid #e5e7eb', borderRadius:'8px', marginBottom:'1rem'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                        <strong>Passeport / CNI</strong>
                        {getStatusBadge(documents.passeport.status)}
                    </div>
                    {documents.passeport.status !== 'Validé' && (
                        <input type="file" onChange={(e) => handleFileChange('passeport', e)} accept=".pdf,.jpg,.png" />
                    )}
                    {documents.passeport.file && <div style={{fontSize:'0.8rem', marginTop:'0.3rem', color:'#666'}}>Fichier : {documents.passeport.file.name}</div>}
                </div>

                {/* CERTIFICAT MÉDICAL */}
                <div style={{padding:'1rem', border:'1px solid #e5e7eb', borderRadius:'8px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                        <strong>Certificat Médical</strong>
                        {getStatusBadge(documents.certificat.status)}
                    </div>
                    {documents.certificat.status !== 'Validé' && (
                        <input type="file" onChange={(e) => handleFileChange('certificat', e)} accept=".pdf,.jpg,.png" />
                    )}
                    {documents.certificat.file && <div style={{fontSize:'0.8rem', marginTop:'0.3rem', color:'#666'}}>Fichier : {documents.certificat.file.name}</div>}
                </div>
            </div>
            
            <div style={{marginTop:'1rem', fontSize:'0.8rem', color:'#6b7280', fontStyle:'italic'}}>
                * Vos documents sont vérifiés manuellement par le commissaire sportif.
            </div>
          </div>

          {/* COLONNE DROITE : PLANNING */}
          <div className="panel" style={{flex: 2}}>
            <h2 className="panel-title">📅 Votre Planning</h2>
            <div className="event-list">
              {schedule.map((item) => (
                <div key={item.id} className="event-item" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className="event-name">{item.epreuve}</div>
                  <div className="event-meta" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    Convocation : {item.heure_convocation}
                  </div>
                  <div className="event-meta">📍 {item.lieu}</div>
                </div>
              ))}
            </div>

            <h2 className="panel-title" style={{marginTop:'2rem'}}>🏆 Performances</h2>
             <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                <tbody>
                    {results.map(r => (
                        <tr key={r.id}><td style={{padding:'0.5rem'}}>{r.epreuve}</td><td style={{fontWeight:'bold'}}>{r.temps}</td></tr>
                    ))}
                </tbody>
             </table>
             
             {/* Bouton pour déclarer forfait  */}
             <div style={{marginTop:'2rem', textAlign:'right'}}>
                <button className="btn-secondary" style={{color:'#dc2626', borderColor:'#dc2626'}}>Déclarer Forfait</button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SportifPage;