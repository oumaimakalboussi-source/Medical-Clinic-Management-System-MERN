import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * RoleBasedRedirect Component
 * Redirects users to appropriate page based on their role:
 * - Patients: /appointments
 * - Others (admin, doctor, secretary): /dashboard
 */
export const RoleBasedRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect patients to appointments page, others to dashboard
  const redirectPath = user?.role === 'patient' ? '/appointments' : '/dashboard';
  return <Navigate to={redirectPath} replace />;
};
