// src/pages/ResponsablePage.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// URLs locales des microservices (Docker)
const AUTH_API_URL = 'http://localhost:1001';
const COMP_API_URL = 'http://localhost:1003';

function ResponsablePage({ token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  // formulaire création compétition
  const [name, setName] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [disciplineId, setDisciplineId] = useState('');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // ---------- API AUTH (utilisateurs) ----------
  const loadUsers = async () => {
    try {
      const res = await fetch(`${AUTH_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error('Erreur chargement utilisateurs', e);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await fetch(`${AUTH_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      loadUsers();
    } catch (e) {
      console.error('Erreur changement rôle', e);
    }
  };

  // ---------- API COMPETITION-SERVICE ----------
  const loadCompetitions = async () => {
    try {
      const res = await fetch(`${COMP_API_URL}/api/competitions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCompetitions(data);
    } catch (e) {
      console.error('Erreur chargement compétitions', e);
    }
  };

  const handleCreateCompetition = async (e) => {
    e.preventDefault();
    if (!name || !dateDebut || !dateFin) return;

    const payload = {
      name,
      dateDebut,   // adapter au format attendu par ton back (ex: yyyy-MM-dd)
      dateFin,
      disciplineId: disciplineId || null,
    };

    try {
      await fetch(`${COMP_API_URL}/api/competitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      setName('');
      setDateDebut('');
      setDateFin('');
      setDisciplineId('');
      loadCompetitions();
    } catch (e) {
      console.error('Erreur création compétition', e);
    }
  };

  useEffect(() => {
    loadUsers();
    loadCompetitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace responsable</h1>
            <p>Gérer les comptes, les rôles et les compétitions.</p>
          </div>
          <div className="spectator-header-right">
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Panel utilisateurs */}
        <div className="panel">
          <h2 className="panel-title">Utilisateurs</h2>
          <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Id</th>
                <th style={{ textAlign: 'left' }}>Login</th>
                <th style={{ textAlign: 'left' }}>Rôle</th>
                <th style={{ textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    >
                      <option value="SPECTATEUR">SPECTATEUR</option>
                      <option value="SPORTIF">SPORTIF</option>
                      <option value="COMMISSAIRE">COMMISSAIRE</option>
                      <option value="RESPONSABLE">RESPONSABLE</option>
                      <option value="VOLONTAIRE">VOLONTAIRE</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel compétitions */}
        <div className="panel">
          <h2 className="panel-title">Compétitions</h2>

          <form onSubmit={handleCreateCompetition} style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Nom de la compétition</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Championnats d’Europe 2026"
              />
            </div>
            <div className="form-group">
              <label>Date de début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Date de fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Discipline ID (optionnel)</label>
              <input
                type="number"
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value)}
              />
            </div>
            <button className="btn-primary" type="submit">
              Créer la compétition
            </button>
          </form>

          <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Id</th>
                <th style={{ textAlign: 'left' }}>Nom</th>
                <th style={{ textAlign: 'left' }}>Début</th>
                <th style={{ textAlign: 'left' }}>Fin</th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.dateDebut}</td>
                  <td>{c.dateFin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ResponsablePage;
