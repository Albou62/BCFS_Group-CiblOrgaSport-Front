import React from 'react';
import { Link } from 'react-router-dom';

function Accueil() {
return (
<div className="app-container" style={{ alignItems: 'center' }}>
<div
style={{
width: '100%',
maxWidth: '900px',
}}
>
<div className="hero">
<h1>CiblOrgaSport</h1>
<p className="hero-subtitle">
Plateforme des championnats d’Europe de Natation 2026
</p>
<p className="hero-text">
CiblOrgaSport centralise les informations des compétitions : programme,
résultats, sécurité, notifications et suivi en temps réel. L’application
s’adresse aux sportifs, spectateurs, volontaires, commissaires et
responsables OrgaEvLille.
</p>
</div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '1rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '0.9rem',
          padding: '0.9rem 1rem',
          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={{ fontSize: '1.2rem' }}>📅</div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.3rem' }}>
          Programme unifié
        </div>
        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Horaires, lieux et sessions regroupés pour tous les publics.
        </div>
      </div>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '0.9rem',
          padding: '0.9rem 1rem',
          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={{ fontSize: '1.2rem' }}>🎟️</div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.3rem' }}>
          Espace spectateur
        </div>
        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Stockage des billets et informations pratiques pour les spectateurs.
        </div>
      </div>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '0.9rem',
          padding: '0.9rem 1rem',
          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={{ fontSize: '1.2rem' }}>🔔</div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.3rem' }}>
          Notifications ciblées
        </div>
        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Résultats, sécurité, événements festifs autour des sites.
        </div>
      </div>
    </div>
  </div>
</div>
);
}

export default Accueil;
