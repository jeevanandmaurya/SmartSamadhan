import { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getUser, getAdmin } = useDatabase();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, role) => {
    try {
      let authenticatedUser = null;

      if (role === 'user') {
        authenticatedUser = await getUser(username);
      } else if (role === 'admin') {
        authenticatedUser = await getAdmin(username);
      }

      if (authenticatedUser && authenticatedUser.password === password) {
        const userData = {
          id: authenticatedUser.id,
          username: authenticatedUser.username,
          role,
          fullName: authenticatedUser.fullName,
          email: authenticatedUser.email,
          phone: authenticatedUser.phone,
          address: authenticatedUser.address,
          createdAt: authenticatedUser.createdAt,
          level: authenticatedUser.level || null,
          accessLevel: authenticatedUser.accessLevel || null
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateSession = (partial) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    login,
    logout,
  loading,
  updateSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
