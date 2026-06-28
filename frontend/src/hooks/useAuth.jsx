import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, setTokens, clearTokens, getStoredRefreshToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from stored refresh token on mount
  useEffect(() => {
    const stored = getStoredRefreshToken();
    if (!stored) {
      setLoading(false);
      return;
    }
    authApi.refresh()
      .then(data => {
        if (data.accessToken) {
          setTokens(data.accessToken, data.refreshToken);
          setUser(data.user || { restored: true });
        }
      })
      .catch(() => {
        clearTokens();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signin = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const data = await authApi.signin(username, password);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user || { username });
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name, age, username, email, password) => {
    setLoading(true);
    try {
      return await authApi.signup(name, age, username, email, password);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback((fields) => {
    setUser(prev => ({ ...prev, ...fields }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
