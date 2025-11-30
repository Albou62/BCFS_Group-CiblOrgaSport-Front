import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/register.jsx';

const API_URL = 'http://localhost:8080';

function Header() {
  return (
    <header
      style={{
        width: '100%',
        padding: '0.8rem 2rem',
        background: '#0f172a',
        color: '#e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
        CiblOrgaSport
      </div>
      <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.95rem' }}>
        <Link to="/" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
          Accueil
        </Link>
        <Link to="/auth" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
          Connexion
        </Link>
      </nav>
    </header>
  );
}

function Accueil() {
  return (
    <div className="app-container">
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

      <div className="card">
        <h2>Accès à la plateforme</h2>
        <p className="hero-text" style={{ marginBottom: '1rem' }}>
          Créez un compte ou connectez-vous pour accéder à votre espace personnalisé
          (spectateur par défaut dans cette première version).
        </p>
        <div className="actions">
          <Link to="/auth">
            <button className="btn-primary" type="button">
              Se connecter / S’inscrire
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AuthPage({ setToken, setUsername }) {
  const [showRegister, setShowRegister] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = (newToken, usernameFromForm) => {
    setToken(newToken);
    setUsername(usernameFromForm);
    navigate('/spectateur');
  };

  const handleRegistered = (username) => {
    setPrefilledUsername(username);
    setShowRegister(false);
  };

  return (
    <div className="app-container">
      <div className="hero">
        <h1>CiblOrgaSport</h1>
        <p className="hero-text">
          Connectez-vous à votre compte ou créez-en un nouveau pour accéder à la
          plateforme des Championnats d’Europe de Natation 2026.
        </p>
      </div>

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
  );
}

function SpectateurPage({ token, username, onLogout }) {
  const [hello, setHello] = useState('');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  const events = [
    {
      id: 1,
      name: 'Finale 200m nage libre',
      venue: 'Centre Aquatique Olympique',
      time: '12 août 2026 - 18:00',
    },
    {
      id: 2,
      name: 'Demi-finale plongeon 10m',
      venue: 'Piscine Montreuil',
      time: '13 août 2026 - 15:30',
    },
    {
      id: 3,
      name: 'Cérémonie d’ouverture',
      venue: 'Paris La Défense Arena',
      time: '10 août 2026 - 20:00',
    },
  ];

  const fetchHello = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hello`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Non autorisé');
      const text = await res.text();
      setHello(text);
    } catch (err) {
      setHello(`Erreur: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h2>Espace spectateur</h2>
        {username && (
          <p
            className="hero-text"
            style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}
          >
            Connecté en tant que {username}
          </p>
        )}
        <p className="hero-text" style={{ marginBottom: '1rem' }}>
          Retrouvez ici quelques compétitions à venir des Championnats d’Europe de
          Natation 2026.
        </p>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            marginBottom: '1rem',
          }}
        >
          {events.map((e) => (
            <li
              key={e.id}
              style={{
                marginBottom: '0.8rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontWeight: 600 }}>{e.name}</div>
              <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                {e.venue}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                {e.time}
              </div>
            </li>
          ))}
        </ul>

        <div className="actions">
          <button className="btn-primary" type="button" onClick={fetchHello}>
            Vérifier l’accès sécurisé (/api/hello)
          </button>
          <button className="btn-secondary" type="button" onClick={onLogout}>
            Se déconnecter
          </button>
        </div>

        {hello && <p style={{ marginTop: '1rem' }}>{hello}</p>}
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUsername('');
  };

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route
          path="/auth"
          element={<AuthPage setToken={setToken} setUsername={setUsername} />}
        />
        <Route
          path="/spectateur"
          element={
            <SpectateurPage token={token} username={username} onLogout={logout} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
