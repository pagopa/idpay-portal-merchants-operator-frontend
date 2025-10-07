import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress } from '@mui/material';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </div>
    )
  }

  if (!isAuthenticated) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Reindirizzamento al login...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;