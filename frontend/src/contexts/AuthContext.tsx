import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin } from '../types';
import { AuthService } from '../services';

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const storedAdmin = AuthService.getStoredAdmin();
          if (storedAdmin) {
            // Verificar token con el servidor
            const { admin: verifiedAdmin } = await AuthService.verify();
            setAdmin(verifiedAdmin);
          }
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { admin: loggedAdmin } = await AuthService.login({ email, password });
      setAdmin(loggedAdmin);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setAdmin(null);
    AuthService.logout();
  };

  const isAuthenticated = !!admin && AuthService.isAuthenticated();

  const value: AuthContextType = {
    admin,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
