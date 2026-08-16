import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gratitude_token') || null);
  const [stats, setStats] = useState({ total_entries: 0, streak_days: 0, has_today_entry: false });
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('gratitude_token');
      if (storedToken) {
        try {
          const res = await authAPI.getCurrentUser();
          setUser(res.data.user);
          if (res.data.stats) {
            setStats(res.data.stats);
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const refreshUserStats = async () => {
    if (!token) return;
    try {
      const res = await authAPI.getCurrentUser();
      setUser(res.data.user);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('gratitude_token', newToken);
    setToken(newToken);
    setUser(newUser);
    await refreshUserStats();
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await authAPI.register({ username, email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('gratitude_token', newToken);
    setToken(newToken);
    setUser(newUser);
    await refreshUserStats();
    return res.data;
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (err) {
      console.error('Error during logout API call:', err);
    } finally {
      localStorage.removeItem('gratitude_token');
      setToken(null);
      setUser(null);
      setStats({ total_entries: 0, streak_days: 0, has_today_entry: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        stats,
        loading,
        login,
        register,
        logout,
        refreshUserStats,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
