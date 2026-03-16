// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('es_token');
    if (token) {
      api.me()
        .then(setUser)
        .catch(() => localStorage.removeItem('es_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem('es_token', token);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const { token, user } = await api.register(data);
    localStorage.setItem('es_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('es_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
