import React from 'react';
import { Navigate } from 'react-router-dom';

function SportifPage({ token, onLogout, username }) {
  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace sportif</h1>
            <p>Suivi des épreuves, résultats et informations pour les sportifs.</p>
          </div>
          <div className="spectator-header-right">
            {username && (
              <span>
                {username} · <span style={{ opacity: 0.8 }}>Sportif</span>
              </span>
            )}
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Se déconnecter
            </button>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">Tableau de bord sportif</h2>
          <p className="panel-subtitle">
            Cette page sera enrichie : épreuves inscrites, horaires, résultats personnels, etc.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SportifPage;
