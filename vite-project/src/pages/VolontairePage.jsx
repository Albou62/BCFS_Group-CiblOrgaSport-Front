import React from 'react';
import { Navigate } from 'react-router-dom';

function VolontairePage({ token, onLogout, username }) {
  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace volontaire</h1>
            <p>Consultation des programmes et tâches assignées.</p>
          </div>
          <div className="spectator-header-right">
            {username && (
              <span>
                {username} · <span style={{ opacity: 0.8 }}>Volontaire</span>
              </span>
            )}
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Se déconnecter
            </button>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">Tableau de bord volontaire</h2>
          <p className="panel-subtitle">
            Cette vue contiendra les créneaux, lieux et tâches des volontaires.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VolontairePage;
