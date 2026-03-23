import React from 'react';
import Geolocation from '../components/Geolocation.jsx';

function Accueil() {
  return (
    <div className="app-container">
      <Geolocation />
      <div style={{ width: '100%', maxWidth: '900px', textAlign:'center', marginTop:'4rem' }}>
        <h1 style={{fontSize:'3rem', marginBottom:'1rem', color:'#1e3a8a'}}>CiblOrgaSport 2026</h1>
        <p style={{fontSize:'1.2rem', color:'#475569', marginBottom:'3rem'}}>
          La plateforme officielle des Championnats d'Europe de Natation.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', textAlign:'left' }}>
          <div className="panel">
            <div style={{ fontSize: '2rem' }}>📅</div>
            <h3>Programme Unifié</h3>
            <p style={{color:'#64748b'}}>Suivez les compétitions en temps réel, horaires et résultats.</p>
          </div>
          <div className="panel">
            <div style={{ fontSize: '2rem' }}>🎟️</div>
            <h3>Billetterie & Accès</h3>
            <p style={{color:'#64748b'}}>Gérez vos E-Billets et trouvez votre chemin vers les stades.</p>
          </div>
          <div className="panel">
            <div style={{ fontSize: '2rem' }}>🛡️</div>
            <h3>Sécurité & Alertes</h3>
            <p style={{color:'#64748b'}}>Restez informé des incidents et notifications de sécurité.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accueil;