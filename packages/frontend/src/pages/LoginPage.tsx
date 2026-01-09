import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Card,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { FormTextField } from '../components/forms/FormTextField';

/**
 * Login Page
 * Authenticates users with email and password
 * Supports multiple roles: admin, doctor, patient, secretary
 */

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Card
          sx={{
            width: '100%',
            p: 4,
            boxShadow: 3,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Clinic Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gestion de Cabinet Médical
            </Typography>
          </Box>

          {/* Error Messages */}
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || localError}
            </Alert>
          )}

          {/* Demo Credentials Info */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Demo Credentials:
            </Typography>
            <Box sx={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
              <div><strong>Admin:</strong> admin@clinic.com / admin123</div>
             
        </Box>
          </Alert>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <FormTextField
              label="Email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />

            <FormTextField
              label="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Login'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size="medium"
              sx={{ mb: 1 }}
              onClick={() => navigate('/signup')}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>
        </Card>
      </Box>
    </Container>
  );
};
