import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const safeGetItem = (key) => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch (e) {
      console.error("Parsing error:", e);
      localStorage.removeItem(key);
      return null;
    }
  };

  const [currentUser, setCurrentUser] = useState(safeGetItem('user'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!safeGetItem('user'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/check_auth', {
          credentials: 'include'
        });

        const data = await response.json();

        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ Login sadece user bilgisini kaydeder
  const login = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setCurrentUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
