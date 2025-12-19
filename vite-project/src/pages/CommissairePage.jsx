import React from 'react';
import { Navigate } from 'react-router-dom';

function CommissairePage({ token, onLogout, username }) {
  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace commissaire</h1>
            <p>Saisie et validation des résultats, gestion des épreuves.</p>
          </div>
          <div className="spectator-header-right">
            {username && (
              <span>
                {username} · <span style={{ opacity: 0.8 }}>Commissaire</span>
              </span>
            )}
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Se déconnecter
            </button>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">Tableau de bord commissaire</h2>
          <p className="panel-subtitle">
            Placeholders pour la future saisie des résultats et le suivi des manches.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CommissairePage;
