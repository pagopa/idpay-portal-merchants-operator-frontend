import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import keycloak from '../config/keycloak';
import type { ReactNode } from 'react';
import type { LoggedUser } from '../utils/types';
import { authStore } from '../store/authStore';
import axios from 'axios';
import { JwtUser } from '@pagopa/mui-italia/components/HeaderAccount';

interface AuthContextType {
  isAuthenticated: boolean;
  user?: JwtUser;
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
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isInitialized = useRef(false)

  const setJwtToken = authStore((state) => state.setJwtToken);
  const setLogout = authStore((state) => state.setLogout);

  const login = useCallback(() => {
    keycloak.login({
      redirectUri: window.location.origin + '/esercente/', //return to homepage after login
    });
  }, []);

  const logout = useCallback(() => {
    keycloak.logout({
      redirectUri: window.location.origin + '/esercente/', //return to homepage after logout
    });
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  }, [setIsAuthenticated, setUser, setToken]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          checkLoginIframe: false,
          pkceMethod: 'S256',
        });

        if (authenticated) {
          setIsAuthenticated(true);
          setToken(keycloak.token || null);
          try {
            const { data }: { data: LoggedUser } = await axios.get(
              `${keycloak.authServerUrl}/realms/${import.meta.env.VITE_KEYCLOAK_REALM
              }/protocol/openid-connect/userinfo`,
              {
                headers: {
                  Authorization: `Bearer ${keycloak.token}`,
                },
              }
            );
            setUser({id: data?.sub, name: data?.name, email: data?.email});
          } catch {
            keycloak.logout();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initKeycloak();

    const refreshToken = () => {
      if (keycloak.authenticated) {
        keycloak
          .updateToken(70)
          .then((refreshed) => {
            if (refreshed) {
              setToken(keycloak.token || null);
            }
          })
          .catch(() => {
            logout();
          });
      }
    };

    const interval = setInterval(refreshToken, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setJwtToken(token);
  }, [token, setJwtToken]);

  useEffect(() => {
    setLogout(logout);
  }, [logout, setLogout]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      login,
      logout,
      loading,
    }),
    [isAuthenticated, user, token, login, logout, loading]
  );

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider");
  }
  return context;
};
