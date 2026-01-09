import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Card,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { FormTextField } from '../components/forms/FormTextField';
import { FormSelect } from '../components/forms/FormSelect';
import { authService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';

/**
 * Signup Page
 * Allows users to create an account for roles: doctor, patient, secretary (not admin)
 * Real-time validation, password visibility toggles, and loading state
 */

const ROLE_OPTIONS = [
  { label: 'Patient', value: 'patient' },
  { label: 'Doctor', value: 'doctor' },
  { label: 'Secretary', value: 'secretary' },
] as const;

type AllowedRole = typeof ROLE_OPTIONS[number]['value'];

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<AllowedRole>('patient');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Validation helpers
  const emailValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email), [email]);
  const phoneValid = useMemo(() => {
    if (!telephone) return false;
    // Simple international phone validation, allows +, digits, spaces, dashes, parentheses
    return /^\+?[0-9\s().-]{7,20}$/.test(telephone.trim());
  }, [telephone]);
  const fullNameParts = useMemo(() => fullName.trim().split(/\s+/).filter(Boolean), [fullName]);
  const fullNameValid = fullNameParts.length >= 2; // require at least first and last name
  const passwordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const canSubmit = fullNameValid && emailValid && phoneValid && passwordValid && passwordsMatch && !isSubmitting;

  const getFieldError = (field: 'fullName' | 'email' | 'password' | 'confirmPassword') => {
    switch (field) {
      case 'fullName':
        if (fullName.length === 0) return '';
        return fullNameValid ? '' : 'Please enter your first and last name';
      case 'email':
        if (email.length === 0) return '';
        return emailValid ? '' : 'Please enter a valid email';
      case 'password':
        if (password.length === 0) return '';
        return passwordValid ? '' : 'Password must be at least 6 characters';
      case 'confirmPassword':
        if (confirmPassword.length === 0) return '';
        return passwordsMatch ? '' : 'Passwords do not match';
      case 'telephone':
        if (telephone.length === 0) return '';
        return phoneValid ? '' : 'Please enter a valid phone number';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!canSubmit) return;

    // Map full name to prenom (first) and nom (last)
    const prenom = fullNameParts[0];
    const nom = fullNameParts.slice(1).join(' ');

    try {
      setIsSubmitting(true);
      // Register via backend
      await authService.register({ email, password, nom, prenom, role, telephone: telephone.trim() });

      addNotification('Registration successful! Please login to continue.', 'success');
      navigate('/login');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Signup failed. Please try again.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
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
        <Card sx={{ width: '100%', p: 4, boxShadow: 3 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Create Account
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Join the Clinic Management platform
            </Typography>
          </Box>

          {/* Error Messages */}
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormTextField
              label="Full Name"
              value={fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
              disabled={isSubmitting}
              error={!!getFieldError('fullName')}
              helperText={getFieldError('fullName')}
              required
            />

            <FormTextField
              label="Email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              error={!!getFieldError('email')}
              helperText={getFieldError('email')}
              required
            />

            <FormTextField
              label="Phone"
              value={telephone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelephone(e.target.value)}
              placeholder="e.g. +212 5XX-XXX-XXX"
              disabled={isSubmitting}
              error={!!getFieldError('telephone')}
              helperText={getFieldError('telephone')}
              required
            />

            <FormTextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Create a password"
              disabled={isSubmitting}
              error={!!getFieldError('password')}
              helperText={getFieldError('password')}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormTextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={isSubmitting}
              error={!!getFieldError('confirmPassword')}
              helperText={getFieldError('confirmPassword')}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormSelect
              label="Role"
              value={role}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value as AllowedRole)}
              options={ROLE_OPTIONS as any}
              disabled={isSubmitting}
              helperText="Choose how you'll use the system"
              required
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 1 }}
              type="submit"
              disabled={!canSubmit}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Sign up'}
            </Button>

            <Button
              fullWidth
              variant="text"
              color="primary"
              size="medium"
              sx={{ mt: 1 }}
              onClick={() => navigate('/login')}
              disabled={isSubmitting}
            >
              Already have an account? Log in
            </Button>
          </form>
        </Card>
      </Box>
    </Container>
  );
};
