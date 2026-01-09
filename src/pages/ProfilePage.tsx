import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { userService } from '../services/apiService';
import { FormTextField } from '../components/forms/FormTextField';
import { Typography } from '@mui/material';

/**
 * Profile Page
 * Allow users to view and update their personal information
 */

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);

      const updateData: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
      };

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          addNotification('Passwords do not match', 'error');
          return;
        }
        if (!formData.currentPassword) {
          addNotification('Please enter your current password', 'error');
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      if (user) {
        await userService.updateUser(user.id, updateData);
        addNotification('Profile updated successfully', 'success');
        setEditing(false);
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err: any) {
      addNotification(
        err.response?.data?.message || 'Failed to update profile',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                }}
              >
                {user?.prenom[0]}
                {user?.nom[0]}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user?.prenom} {user?.nom}
              </Typography>
              <Typography color="text.secondary" variant="subtitle2" sx={{ mb: 2 }}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Profile Information
                </Typography>
                <Button
                  variant={editing ? 'outlined' : 'contained'}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </Box>

              {!editing ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {user?.email}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Phone
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {user?.telephone || 'Not provided'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Role
                  </Typography>
                  <Typography variant="body2">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <FormTextField
                    label="First Name"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    disabled={loading}
                  />

                  <FormTextField
                    label="Last Name"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    disabled={loading}
                  />

                  <FormTextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                  />

                  <FormTextField
                    label="Phone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    disabled={loading}
                  />

                  <Alert severity="info" sx={{ my: 2 }}>
                    Leave password fields blank if you don't want to change your password
                  </Alert>

                  <FormTextField
                    label="Current Password"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    disabled={loading}
                    placeholder="Required to change password"
                  />

                  <FormTextField
                    label="New Password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    disabled={loading}
                  />

                  <FormTextField
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={loading}
                  />

                  <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
