import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';
import { userService } from '../services/apiService';
import { FormTextField } from '../components/forms/FormTextField';
import { FormSelect } from '../components/forms/FormSelect';
import { DataTable, Column } from '../components/DataTable';
import { Typography } from '@mui/material';

/**
 * Users Management Page
 * Admin only - manage all users in the system
 */

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'doctor' | 'patient' | 'secretary';
  telephone?: string;
  status: 'active' | 'inactive';
}

export const UsersPage: React.FC = () => {
  const { addNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<User>>({
    role: 'patient',
    status: 'active',
  });

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({ limit: 100 });
      setUsers(response.data?.data || response.data || []);
    } catch (err: any) {
      addNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData(user);
    } else {
      setEditingId(null);
      setFormData({ role: 'patient', status: 'active' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ role: 'patient', status: 'active' });
  };

  const handleSave = async () => {
    try {
      if (!formData.email || !formData.nom || !formData.prenom) {
        addNotification('Please fill in all required fields', 'warning');
        return;
      }

      if (editingId) {
        await userService.updateUser(editingId, formData);
        addNotification('User updated successfully', 'success');
      } else {
        await userService.createUser(formData);
        addNotification('User created successfully', 'success');
      }

      handleCloseDialog();
      fetchUsers();
    } catch (err: any) {
      addNotification(
        err.response?.data?.message || 'Failed to save user',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        addNotification('User deleted successfully', 'success');
        fetchUsers();
      } catch (err: any) {
        addNotification('Failed to delete user', 'error');
      }
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'nom',
      label: 'Last Name',
      sortable: true,
    },
    {
      key: 'prenom',
      label: 'First Name',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <Chip
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          color={
            value === 'admin'
              ? 'error'
              : value === 'doctor'
              ? 'primary'
              : value === 'secretary'
              ? 'warning'
              : 'default'
          }
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Chip
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          color={value === 'active' ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(row);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(value);
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New User
        </Button>
      </Box>

      {/* Data Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable<User>
          columns={columns}
          data={users}
          searchFields={['email', 'nom', 'prenom']}
        />
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit User' : 'New User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormTextField
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <FormTextField
            label="Last Name"
            value={formData.nom || ''}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />

          <FormTextField
            label="First Name"
            value={formData.prenom || ''}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />

          <FormTextField
            label="Phone"
            value={formData.telephone || ''}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />

          <FormSelect
            label="Role"
            value={formData.role || 'patient'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, role: e.target.value as any })}
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Doctor', value: 'doctor' },
              { label: 'Secretary', value: 'secretary' },
              { label: 'Patient', value: 'patient' },
            ]}
            required
          />

          <FormSelect
            label="Status"
            value={formData.status || 'active'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            required
          />

          {!editingId && (
            <FormTextField
              label="Password"
              type="password"
              value={formData.prenom || ''}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              helperText="Leave empty for auto-generated password"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
