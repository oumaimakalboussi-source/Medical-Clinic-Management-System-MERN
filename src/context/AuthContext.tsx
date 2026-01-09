import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/apiService';

/**
 * Auth Context
 * Manages user authentication state, JWT token, and role-based access
 */

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'doctor' | 'patient' | 'secretary';
  telephone?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');

      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (err) {
          console.error('Failed to parse saved user:', err);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      } else if ((import.meta as any).env.DEV) {
        // Development mode: Auto-login with demo admin account for frontend testing
        const demoUser: User = {
          id: 'demo-admin-001',
          email: 'admin@clinic.com',
          nom: 'Admin',
          prenom: 'Demo',
          role: 'admin',
          telephone: '+212 5XX-XXX-XXX',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
        };
        localStorage.setItem('authToken', 'demo-token-dev-mode');
        localStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      // Backend response structure: { success, message, data: { token, user } }
      const { token, user: userData } = response.data || response;

      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      // Store token and user
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
