import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Accueil from './pages/Accueil.jsx';
import AuthPage from './pages/AuthPage.jsx';
import SpectateurPage from './pages/SpectateurPage.jsx';

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

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

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
          element={
            <AuthPage
              setToken={setToken}
              setUsername={setUsername}
              navigate={navigate}
            />
          }
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
