import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AuthLoading() {
  return <div className="app-container"><p>Chargement de la session...</p></div>;
}

export default function RequireAuth({ children }) {
  const { isAuthenticated, isHydrating } = useAuth();

  if (isHydrating) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
