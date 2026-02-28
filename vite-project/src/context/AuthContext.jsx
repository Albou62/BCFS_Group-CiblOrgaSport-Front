import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMe, login as authLogin } from '../api/auth.jsx';

export const AUTH_TOKEN_KEY = 'token';

const ROLE_HOME_MAP = {
  RESPONSABLE: '/responsable',
  SPORTIF: '/sportif',
  COMMISSAIRE: '/commissaire',
  VOLONTAIRE: '/volontaire',
};

export function getHomeRouteForRole(role) {
  return ROLE_HOME_MAP[role] || '/spectateur';
}

const AuthContext = createContext(null);

function loadToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function saveToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const hasHydratedRef = useRef(false);

  const applySession = useCallback((nextToken, me) => {
    setToken(nextToken);
    setUser({
      username: me?.username ?? null,
      role: me?.role ?? null,
    });
  }, []);

  const clearSession = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async (sourceToken) => {
    const activeToken = sourceToken ?? token;
    if (!activeToken) {
      setUser(null);
      return null;
    }

    try {
      const me = await fetchMe(activeToken);
      applySession(activeToken, me);
      return me;
    } catch (_error) {
      clearSession();
      return null;
    }
  }, [applySession, clearSession, token]);

  const login = useCallback(async (username, password) => {
    const data = await authLogin(username, password);
    saveToken(data.token);
    try {
      const me = await fetchMe(data.token);
      applySession(data.token, me);
      return getHomeRouteForRole(me.role);
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [applySession, clearSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }
    hasHydratedRef.current = true;

    const hydrate = async () => {
      const storedToken = loadToken();
      if (!storedToken) {
        setToken(null);
        setUser(null);
        setIsHydrating(false);
        return;
      }

      setToken(storedToken);
      try {
        const me = await fetchMe(storedToken);
        applySession(storedToken, me);
      } catch (_error) {
        clearSession();
      } finally {
        setIsHydrating(false);
      }
    };

    hydrate();
  }, [applySession, clearSession]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    isHydrating,
    login,
    logout,
    refreshMe,
    getHomeRouteForRole,
  }), [user, token, isHydrating, login, logout, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
