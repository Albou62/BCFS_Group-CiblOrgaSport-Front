// src/pages/ResponsablePage.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = 'https://bcfs-group-ciblorgasport-back.onrender.com';

function ResponsablePage({ token, onLogout }) {
  const [users, setUsers] = useState([]);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  const loadUsers = async () => {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeRole = async (userId, newRole) => {
    await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });
    loadUsers();
  };

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace responsable</h1>
            <p>Gérer les comptes et les rôles des utilisateurs.</p>
          </div>
          <div className="spectator-header-right">
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Se déconnecter
            </button>
          </div>
        </div>

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
      </div>
    </div>
  );
}

export default ResponsablePage;
