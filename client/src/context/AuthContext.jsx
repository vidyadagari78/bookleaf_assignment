import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bookleaf_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState({ authors: [], admins: [] });

  // Load demo accounts list for one-click testing
  useEffect(() => {
    api.getDemoAccounts()
      .then(res => setDemoAccounts(res))
      .catch(err => console.error('Failed to load demo accounts:', err));
  }, []);

  // Validate session token on mount
  useEffect(() => {
    if (token) {
      api.getMe()
        .then(res => setUser(res.user))
        .catch(err => {
          console.warn('Session expired or invalid, logging out:', err.message);
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  async function login(email, password) {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('bookleaf_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('bookleaf_token');
    setToken(null);
    setUser(null);
  }

  // Quick switch into any demo account (author or admin)
  async function quickSwitch(email, role = 'author') {
    const password = role === 'admin' ? 'adminpassword123' : 'password123';
    return await login(email, password);
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      quickSwitch,
      demoAccounts,
      isAdmin: user?.role === 'admin',
      isAuthor: user?.role === 'author'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
