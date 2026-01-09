import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  appointmentService,
  patientService,
  doctorService,
} from '../services/apiService';
import { FormTextField } from '../components/forms/FormTextField';
import { FormSelect } from '../components/forms/FormSelect';
import { DataTable, Column } from '../components/DataTable';

/**
 * Appointments Page
 * CRUD operations for appointments
 * Patients can create, Secretaries can manage, Doctors can view
 */

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  dateTime: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export const AppointmentsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { addNotification } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<Appointment>>({
    status: 'pending',
  });

  // Fetch data
  useEffect(() => {
    fetchAppointments();
    fetchRelatedData();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAllAppointments();
      setAppointments(response.data?.data || response.data || []);
    } catch (err: any) {
      addNotification('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [patientRes, doctorRes] = await Promise.all([
        patientService.getAllPatients({ limit: 100 }),
        doctorService.getAllDoctors({ limit: 100 }),
      ]);
      setPatients(patientRes.data?.data || patientRes.data || []);
      setDoctors(doctorRes.data?.data || doctorRes.data || []);
    } catch (err) {
      console.error('Failed to fetch related data:', err);
    }
  };

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingId(appointment.id);
      setFormData(appointment);
    } else {
      setEditingId(null);
      setFormData({ status: 'pending' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ status: 'pending' });
  };

  const handleSave = async () => {
    try {
      if (!formData.patientId || !formData.doctorId || !formData.dateTime) {
        addNotification('Please fill in all required fields', 'warning');
        return;
      }

      if (editingId) {
        await appointmentService.updateAppointment(editingId, formData);
        addNotification('Appointment updated successfully', 'success');
      } else {
        await appointmentService.createAppointment(formData);
        addNotification('Appointment created successfully', 'success');
      }

      handleCloseDialog();
      fetchAppointments();
    } catch (err: any) {
      addNotification(
        err.response?.data?.message || 'Failed to save appointment',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentService.deleteAppointment(id);
        addNotification('Appointment deleted successfully', 'success');
        fetchAppointments();
      } catch (err: any) {
        addNotification('Failed to delete appointment', 'error');
      }
    }
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'patientName',
      label: 'Patient',
      sortable: true,
    },
    {
      key: 'doctorName',
      label: 'Doctor',
      sortable: true,
    },
    {
      key: 'dateTime',
      label: 'Date & Time',
      sortable: true,
    },
    {
      key: 'reason',
      label: 'Reason',
      sortable: false,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Chip
          label={value}
          color={
            value === 'confirmed'
              ? 'success'
              : value === 'pending'
              ? 'warning'
              : value === 'cancelled'
              ? 'error'
              : 'default'
          }
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
          Appointments
        </Typography>
        {hasRole(['admin', 'secretary', 'patient']) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Appointment
          </Button>
        )}
      </Box>

      {/* Data Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable<Appointment>
          columns={columns}
          data={appointments}
          searchFields={['patientName', 'doctorName', 'reason']}
        />
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Appointment' : 'New Appointment'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormSelect
            label="Patient"
            value={formData.patientId || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({
                ...formData,
                patientId: e.target.value,
                patientName: patients.find((p) => p.id === e.target.value)?.nom,
              })
            }
            options={patients.map((p) => ({
              label: `${p.prenom} ${p.nom}`,
              value: p.id,
            }))}
            required
          />

          <FormSelect
            label="Doctor"
            value={formData.doctorId || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({
                ...formData,
                doctorId: e.target.value,
                doctorName: doctors.find((d) => d.id === e.target.value)?.nom,
              })
            }
            options={doctors.map((d) => ({
              label: `Dr. ${d.prenom} ${d.nom}`,
              value: d.id,
            }))}
            required
          />

          <FormTextField
            label="Date & Time"
            type="datetime-local"
            value={formData.dateTime || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dateTime: e.target.value })}
            required
          />

          <FormTextField
            label="Reason"
            value={formData.reason || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, reason: e.target.value })}
            multiline
            rows={2}
          />

          <FormSelect
            label="Status"
            value={formData.status || 'pending'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'Completed', value: 'completed' },
            ]}
          />

          <FormTextField
            label="Notes"
            value={formData.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, notes: e.target.value })}
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
    </Box>
  );
};
