import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../config/keycloak';
import type { ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: unknown;
  token: string | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false,
          pkceMethod: 'S256'
        });

        if (authenticated) {
          setIsAuthenticated(true);
          setToken(keycloak.token || null);
          const userProfile = await keycloak.loadUserProfile();
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Errore inizializzazione Keycloak:', error);
      } finally {
        setLoading(false);
      }
    };

    initKeycloak();

    // Automatic refresh token
    const refreshToken = () => {
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          setToken(keycloak.token || null);
          console.log('Token aggiornato');
        }
      }).catch(() => {
        console.log('Impossibile aggiornare il token');
        logout();
      });
    };

    const interval = setInterval(refreshToken, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout();
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};