import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login.jsx';
import Register from '../components/Register.jsx';

const API_URL = import.meta.env.VITE_API_URL;

function AuthPage({ setToken, setUsername }) {
  const [showRegister, setShowRegister] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState('');
  const navigate = useNavigate();

  const fetchMeAndRedirect = async (token) => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      navigate('/spectateur');
      return;
    }
    const me = await res.json();

    setUsername(me.username);

    switch (me.role) {
      case 'RESPONSABLE':
        navigate('/responsable');
        break;
      case 'SPORTIF':
        navigate('/sportif');
        break;
      case 'COMMISSAIRE':
        navigate('/commissaire');
        break;
      case 'VOLONTAIRE':
        navigate('/volontaire');
        break;
      default:
        navigate('/spectateur');
    }
  };

  const handleLogin = async (newToken, usernameFromForm) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    await fetchMeAndRedirect(newToken);
  };

  const handleRegistered = (username) => {
    setPrefilledUsername(username);
    setShowRegister(false);
  };

  return (
    <div className="app-container">
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div className="card">
          <div className="tabs">
            <button
              className={!showRegister ? 'tab active' : 'tab'}
              type="button"
              onClick={() => setShowRegister(false)}
            >
              Connexion
            </button>
            <button
              className={showRegister ? 'tab active' : 'tab'}
              type="button"
              onClick={() => setShowRegister(true)}
            >
              Inscription
            </button>
          </div>

          {showRegister ? (
            <Register onRegistered={handleRegistered} />
          ) : (
            <Login onLogin={handleLogin} prefilledUsername={prefilledUsername} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;