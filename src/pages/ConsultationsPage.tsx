import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  consultationService,
  appointmentService,
  patientService,
} from '../services/apiService';
import { FormTextField } from '../components/forms/FormTextField';
import { FormSelect } from '../components/forms/FormSelect';
import { DataTable, Column } from '../components/DataTable';
import { Typography } from '@mui/material';

/**
 * Consultations Page
 * Doctors can record consultations linked to appointments
 */

interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  dateTime: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  status: 'in-progress' | 'completed' | 'cancelled';
}

export const ConsultationsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { addNotification } = useNotification();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<Consultation>>({
    status: 'in-progress',
  });

  // Fetch data
  useEffect(() => {
    fetchConsultations();
    fetchRelatedData();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await consultationService.getAllConsultations();
      setConsultations(response.data?.data || response.data || []);
    } catch (err: any) {
      addNotification('Failed to load consultations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [appointmentRes] = await Promise.all([
        appointmentService.getAllAppointments({ limit: 100 }),
        patientService.getAllPatients({ limit: 100 }),
      ]);
      setAppointments(appointmentRes.data?.data || appointmentRes.data || []);
    } catch (err) {
      console.error('Failed to fetch related data:', err);
    }
  };

  const handleOpenDialog = (consultation?: Consultation) => {
    if (consultation) {
      setEditingId(consultation.id);
      setFormData(consultation);
    } else {
      setEditingId(null);
      setFormData({ status: 'in-progress' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ status: 'in-progress' });
  };

  const handleSave = async () => {
    try {
      if (!formData.appointmentId || !formData.patientId || !formData.diagnosis) {
        addNotification('Please fill in all required fields', 'warning');
        return;
      }

      if (editingId) {
        await consultationService.updateConsultation(editingId, formData);
        addNotification('Consultation updated successfully', 'success');
      } else {
        await consultationService.createConsultation(formData);
        addNotification('Consultation created successfully', 'success');
      }

      handleCloseDialog();
      fetchConsultations();
    } catch (err: any) {
      addNotification(
        err.response?.data?.message || 'Failed to save consultation',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this consultation?')) {
      try {
        await consultationService.deleteConsultation(id);
        addNotification('Consultation deleted successfully', 'success');
        fetchConsultations();
      } catch (err: any) {
        addNotification('Failed to delete consultation', 'error');
      }
    }
  };

  const columns: Column<Consultation>[] = [
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
      key: 'diagnosis',
      label: 'Diagnosis',
      sortable: false,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
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
          Consultations
        </Typography>
        {hasRole(['admin', 'doctor']) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Consultation
          </Button>
        )}
      </Box>

      {/* Data Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable<Consultation>
          columns={columns}
          data={consultations}
          searchFields={['patientName', 'diagnosis']}
        />
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Consultation' : 'New Consultation'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormSelect
            label="Appointment"
            value={formData.appointmentId || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const apt = appointments.find((a) => a.id === e.target.value);
              setFormData({
                ...formData,
                appointmentId: e.target.value,
                patientId: apt?.patientId,
                patientName: apt?.patientName,
                doctorId: apt?.doctorId,
                doctorName: apt?.doctorName,
                dateTime: apt?.dateTime,
              });
            }}
            options={appointments.map((a) => ({
              label: `${a.patientName} - ${a.dateTime}`,
              value: a.id,
            }))}
            required
          />

          <FormTextField
            label="Diagnosis"
            value={formData.diagnosis || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, diagnosis: e.target.value })}
            multiline
            rows={3}
            required
          />

          <FormTextField
            label="Treatment"
            value={formData.treatment || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, treatment: e.target.value })}
            multiline
            rows={3}
          />

          <FormTextField
            label="Notes"
            value={formData.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={3}
          />

          <FormSelect
            label="Status"
            value={formData.status || 'in-progress'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { label: 'In Progress', value: 'in-progress' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' },
            ]}
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
