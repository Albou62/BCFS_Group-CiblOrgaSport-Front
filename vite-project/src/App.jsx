// src/App.jsx
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Accueil from './pages/Accueil.jsx';
import AuthPage from './pages/AuthPage.jsx';
import SpectateurPage from './pages/SpectateurPage.jsx';
import ResponsablePage from './pages/ResponsablePage.jsx';
import SportifPage from './pages/SportifPage.jsx';
import CommissairePage from './pages/CommissairePage.jsx';
import VolontairePage from './pages/VolontairePage.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import RequireRole from './components/RequireRole.jsx';
import GuestOnly from './components/GuestOnly.jsx';

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
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route
          path="/auth"
          element={
            <GuestOnly>
              <AuthPage />
            </GuestOnly>
          }
        />
        <Route
          path="/spectateur"
          element={
            <RequireAuth>
              <SpectateurPage />
            </RequireAuth>
          }
        />
        <Route
          path="/responsable"
          element={
            <RequireRole allowedRoles={['RESPONSABLE']}>
              <ResponsablePage />
            </RequireRole>
          }
        />
        <Route
          path="/sportif"
          element={
            <RequireRole allowedRoles={['SPORTIF']}>
              <SportifPage />
            </RequireRole>
          }
        />
        <Route
          path="/commissaire"
          element={
            <RequireRole allowedRoles={['COMMISSAIRE']}>
              <CommissairePage />
            </RequireRole>
          }
        />
        <Route
          path="/volontaire"
          element={
            <RequireRole allowedRoles={['VOLONTAIRE']}>
              <VolontairePage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
