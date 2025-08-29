import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import keycloak from '../config/keycloak';
import type { ReactNode } from 'react';
import type { JwtUser } from '../utils/types';
import { authStore } from '../store/authStore';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: JwtUser;
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
  const [user, setUser] = useState<JwtUser | null>(null);
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
          try {
            const response = await axios.get(
              `${keycloak.authServerUrl}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
              {
                headers: {
                  Authorization: `Bearer ${keycloak.token}`
                }
              }
            );
            setUser(response.data);
          } catch (error) {
            console.error('Errore inizializzazione Keycloak:', error);
            keycloak.logout();
          }
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
  const setJwtToken = authStore((state) => state.setJwtToken);
  const setLogout = authStore((state) => state.setLogout);
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  setJwtToken(context.token || null);
  setLogout(context.logout);
  return context;
};