import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('Auth initialized with stored token');
      } else if (storedRefreshToken) {
        // Try to refresh token
        console.log('Attempting to refresh token during initialization...');
        const refreshed = await refreshToken();
        if (!refreshed) {
          console.warn('Token refresh failed during initialization, logging out');
          logout();
        }
      }
      setLoading(false);

      try {
        await api.get('/csrf-token');
      } catch (error) {
        console.warn('Failed to initialize CSRF token:', error.message);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, refreshToken, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  };

  const signup = async (name, email, password, confirmPassword, country) => {
    const response = await api.post('/auth/signup', { name, email, password, confirmPassword, country });
    const { token, refreshToken, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        console.warn('No refresh token available');
        return false;
      }

      console.log('Refreshing token...');
      const response = await api.post('/auth/refresh', { refreshToken: storedRefreshToken });
      const { token, refreshToken: newRefreshToken } = response.data;

      if (!token) {
        console.error('Token refresh response missing token');
        return false;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);
      setToken(token);
      console.log('Token refreshed successfully in AuthContext');
      return true;
    } catch (error) {
      console.error('Token refresh failed in AuthContext:', error.message, error.response?.status);
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  };

  const logout = () => {
    const tokenToRevoke = localStorage.getItem('token');
    if (tokenToRevoke) {
      api.post('/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${tokenToRevoke}`,
        },
      }).catch(() => {
      });
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, refreshToken, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
