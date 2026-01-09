import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { patientService } from '../services/apiService';
import { FormTextField } from '../components/forms/FormTextField';
import { FormSelect } from '../components/forms/FormSelect';
import { DataTable, Column } from '../components/DataTable';
import { Typography } from '@mui/material';

/**
 * Patients Page
 * CRUD operations for patient management
 * Accessible to admin, doctors, and secretaries
 */

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  sexe: 'male' | 'female' | 'other';
  adresse: string;
  numeroSecu?: string;
  mutuelle?: string;
  allergies?: string;
  antecedents?: string;
}

export const PatientsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { addNotification } = useNotification();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Patient>>({
    sexe: 'male',
  });

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAllPatients({ limit: 100 });
      setPatients(response.data?.data || response.data || []);
    } catch (err: any) {
      addNotification('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setEditingId(patient.id);
      setFormData(patient);
    } else {
      setEditingId(null);
      setFormData({ sexe: 'male' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ sexe: 'male' });
  };

  const handleSave = async () => {
    try {
      if (!formData.nom || !formData.prenom || !formData.email) {
        addNotification('Please fill in all required fields', 'warning');
        return;
      }

      if (editingId) {
        await patientService.updatePatient(editingId, formData);
        addNotification('Patient updated successfully', 'success');
      } else {
        await patientService.createPatient(formData);
        addNotification('Patient created successfully', 'success');
      }

      handleCloseDialog();
      fetchPatients();
    } catch (err: any) {
      addNotification(
        err.response?.data?.message || 'Failed to save patient',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.deletePatient(id);
        addNotification('Patient deleted successfully', 'success');
        fetchPatients();
      } catch (err: any) {
        addNotification('Failed to delete patient', 'error');
      }
    }
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  const columns: Column<Patient>[] = [
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
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'telephone',
      label: 'Phone',
      sortable: false,
    },
    {
      key: 'dateNaissance',
      label: 'Date of Birth',
      sortable: true,
    },
    {
      key: 'sexe',
      label: 'Gender',
      sortable: true,
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A',
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
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(row);
            }}
          >
            View
          </Button>
          {hasRole(['admin', 'secretary']) && (
            <>
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
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Patients
        </Typography>
        {hasRole(['admin', 'secretary']) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Patient
          </Button>
        )}
      </Box>

      {/* Data Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable<Patient>
          columns={columns}
          data={patients}
          searchFields={['nom', 'prenom', 'email', 'telephone']}
        />
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Patient' : 'New Patient'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormTextField
            label="Last Name"
            value={formData.nom || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nom: e.target.value })}
            required
          />

          <FormTextField
            label="First Name"
            value={formData.prenom || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />

          <FormTextField
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <FormTextField
            label="Phone"
            value={formData.telephone || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, telephone: e.target.value })}
          />

          <FormTextField
            label="Date of Birth"
            type="date"
            value={formData.dateNaissance || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dateNaissance: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <FormSelect
            label="Gender"
            value={formData.sexe || 'male'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sexe: e.target.value as any })}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ]}
          />

          <FormTextField
            label="Address"
            value={formData.adresse || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, adresse: e.target.value })}
            multiline
            rows={2}
          />

          <FormTextField
            label="Social Security Number"
            value={formData.numeroSecu || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, numeroSecu: e.target.value })}
          />

          <FormTextField
            label="Health Insurance"
            value={formData.mutuelle || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, mutuelle: e.target.value })}
          />

          <FormTextField
            label="Allergies"
            value={formData.allergies || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, allergies: e.target.value })}
            multiline
            rows={2}
          />

          <FormTextField
            label="Medical History"
            value={formData.antecedents || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, antecedents: e.target.value })}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Patient Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Patient Details - {selectedPatient?.prenom} {selectedPatient?.nom}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedPatient && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Personal Information
              </Typography>
              <Box sx={{ ml: 2, mb: 2 }}>
                <Typography variant="body2">Email: {selectedPatient.email}</Typography>
                <Typography variant="body2">Phone: {selectedPatient.telephone}</Typography>
                <Typography variant="body2">Date of Birth: {selectedPatient.dateNaissance}</Typography>
                <Typography variant="body2">Gender: {selectedPatient.sexe}</Typography>
                <Typography variant="body2">Address: {selectedPatient.adresse}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Medical Information
              </Typography>
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2">SSN: {selectedPatient.numeroSecu}</Typography>
                <Typography variant="body2">Insurance: {selectedPatient.mutuelle}</Typography>
                <Typography variant="body2">Allergies: {selectedPatient.allergies || 'None'}</Typography>
                <Typography variant="body2">
                  Medical History: {selectedPatient.antecedents || 'None'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
