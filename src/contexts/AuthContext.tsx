import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
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

  const [keycloak, setKeycloak] = useState<any>(null);

  useEffect(() => {
  let interval: any;
    const initKeycloak = async () => {
      try {
        const { default: Keycloak } = await import('keycloak-js');
        const kc = new Keycloak({
          url: process.env.REACT_APP_KEYCLOAK_URL!,
          realm: process.env.REACT_APP_KEYCLOAK_REALM!,
          clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID!
        });
        setKeycloak(kc) ;


        const authenticated = await kc.init({
          onLoad: 'login-required',
          pkceMethod: 'S256'
        });

        if (authenticated) {
          setIsAuthenticated(true);
          setToken(kc.token || null);
          const userProfile = await kc.loadUserProfile();
          setUser(userProfile);

          interval = setInterval(async () => {
            try {
              const refreshed = await kc.updateToken(70);
              if (refreshed) {
                setToken(kc.token || null);
                console.log('Token aggiornato');
              }
            } catch {
              console.log('Impossibile aggiornare il token');
              logout();
            }
          }, 60000);
        }
      } catch (error) {
        console.error('Errore inizializzazione Keycloak:', error);
      } finally {
        setLoading(false);
      }
    };

    initKeycloak();

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(() => {
    keycloak.login();
  },[]);

  const logout = useCallback(() => {
    keycloak.logout();
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  }, [setIsAuthenticated, setUser, setToken]);

  const value = useMemo(() => ({
    isAuthenticated,
    user,
    token,
    login,
    logout,
    loading
  }), [isAuthenticated, user, token, login, logout, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};