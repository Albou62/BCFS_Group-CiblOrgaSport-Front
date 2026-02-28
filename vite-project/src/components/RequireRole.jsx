import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AuthLoading() {
  return <div className="app-container"><p>Chargement de la session...</p></div>;
}

export default function RequireRole({ allowedRoles, children }) {
  const { user, isAuthenticated, isHydrating, getHomeRouteForRole } = useAuth();

  if (isHydrating) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return children;
}
