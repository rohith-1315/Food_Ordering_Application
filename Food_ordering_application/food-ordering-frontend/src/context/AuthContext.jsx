import { createContext, useCallback, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { logoutUser } from '../api/authApi';

export const AuthContext = createContext();

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REFRESH_TOKEN_KEY = 'refreshToken';

const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  const logout = useCallback((skipServerLogout = false) => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!skipServerLogout && storedRefreshToken) {
      logoutUser(storedRefreshToken).catch(() => {});
    }

    setCurrentUser(null);
    setToken(null);
    setRefreshToken(null);
    clearAuthStorage();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setCurrentUser(JSON.parse(storedUser));
          setRefreshToken(storedRefreshToken || null);
        } else {
          logout(true);
        }
      } catch {
        logout(true);
      }
    }
  }, [logout]);

  const login = (userData, jwtToken, jwtRefreshToken) => {
    setCurrentUser(userData);
    setToken(jwtToken);
    setRefreshToken(jwtRefreshToken || null);
    localStorage.setItem(TOKEN_KEY, jwtToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    if (jwtRefreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, jwtRefreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
