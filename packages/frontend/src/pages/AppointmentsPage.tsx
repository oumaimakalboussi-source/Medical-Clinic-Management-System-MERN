import React, { useState, useEffect, useMemo } from 'react';
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
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  appointmentService,
  patientService,
  doctorService,
} from '../services/apiService';
import { FormTextField, FormSelect, DateTimePicker } from '../components';
import { DataTable, Column } from '../components/DataTable';

/**
 * Appointments Page - Enhanced Version
 * CRUD operations for appointments with role-based UI
 * - Patients: simplified booking form (doctor, date/time, reason, notes)
 * - Admin/Secretary: full CRUD with table management
 */

// Types
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

interface Doctor {
  id?: string;
  _id?: string;
  nom: string;
  prenom: string;
  specialite?: string;
}

interface Patient {
  id?: string;
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
}

// Constants
const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' },
] as const;

const EMPTY_FORM_DATA: Partial<Appointment> = {
  status: 'pending',
};

export const AppointmentsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { addNotification } = useNotification();

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>(EMPTY_FORM_DATA);

  // Computed values
  const isPatient = hasRole('patient');
  const isAdmin = hasRole(['admin', 'secretary']);
  const canManageAppointments = isAdmin;

  // Normalize ID from MongoDB (_id) or formatted (id)
  const getId = (item: Doctor | Patient): string => (item.id || item._id) as string;

  // Memoized doctor and patient options for selects
  const doctorOptions = useMemo(
    () => doctors.map((d) => ({
      label: `Dr. ${d.prenom} ${d.nom}${d.specialite ? ` - ${d.specialite}` : ''}`,
      value: getId(d),
    })),
    [doctors]
  );

  const patientOptions = useMemo(
    () => patients.map((p) => ({
      label: `${p.prenom} ${p.nom} (${p.email})`,
      value: getId(p),
    })),
    [patients]
  );

  // Filter appointments for patients (show only their own)
  const displayedAppointments = useMemo(() => {
    if (isPatient && patientData) {
      const patientId = getId(patientData);
      return appointments.filter((apt) => apt.patientId === patientId);
    }
    return appointments;
  }, [appointments, isPatient, patientData]);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAllAppointments();
      setAppointments(response.data?.data || response.data || []);
    } catch (err: any) {
      console.error('Failed to load appointments:', err);
      addNotification(
        err.response?.data?.message || 'Failed to load appointments. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors, patients, and current patient profile
  const fetchRelatedData = async () => {
    try {
      // Always fetch doctors
      const doctorRes = await doctorService.getAllDoctors({ limit: 1000 });
      setDoctors(doctorRes.data?.data || doctorRes.data || []);

      // Fetch patients for admin/secretary
      if (isAdmin) {
        const patientRes = await patientService.getAllPatients({ limit: 1000 });
        setPatients(patientRes.data?.data || patientRes.data || []);
      }

      // Fetch current patient profile for patient role
      if (isPatient && user) {
        const patientRes = await patientService.getAllPatients({ limit: 1000 });
        const patientList = patientRes.data?.data || patientRes.data || [];
        
        // Try to find by email first, then by name
        let currentPatient = patientList.find((p: Patient) => p.email === user.email);
        
        if (!currentPatient) {
          currentPatient = patientList.find(
            (p: Patient) => p.prenom === user.prenom && p.nom === user.nom
          );
        }
        
        if (currentPatient) {
          setPatientData(currentPatient);
        } else {
          addNotification(
            'Patient profile not found. Please contact clinic support.',
            'error'
          );
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch related data:', err);
      addNotification(
        err.response?.data?.message || 'Failed to load doctors and patients data.',
        'error'
      );
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAppointments();
    fetchRelatedData();
  }, []);

  // Dialog handlers
  const handleOpenDialog = (appointment?: Appointment) => {
    if (isPatient && appointment) {
      addNotification('You cannot edit appointments', 'warning');
      return;
    }

    if (appointment) {
      setEditingId(appointment.id);
      setFormData(appointment);
    } else {
      setEditingId(null);
      setFormData({ ...EMPTY_FORM_DATA });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM_DATA });
  };

  // Form validation
  const validateForm = (): boolean => {
    if (isPatient) {
      if (!patientData?.id && !patientData?._id) {
        addNotification('Patient profile not loaded', 'error');
        return false;
      }
      if (!formData.doctorId || !formData.dateTime) {
        addNotification('Please select a doctor and date/time', 'warning');
        return false;
      }
    } else {
      if (!formData.patientId || !formData.doctorId || !formData.dateTime) {
        addNotification('Please fill in all required fields', 'warning');
        return false;
      }
    }
    return true;
  };

  // Save appointment
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSavingAppointment(true);

      if (isPatient && patientData) {
        // Patient booking: enforce pending status, auto-fill patientId
        const payload = {
          patientId: getId(patientData),
          doctorId: formData.doctorId!,
          dateTime: formData.dateTime!,
          reason: formData.reason || '',
          notes: formData.notes || '',
        };
        await appointmentService.createAppointment(payload);
        addNotification('Appointment booked successfully! Status is pending.', 'success');
      } else {
        // Admin/Secretary: full CRUD
        if (editingId) {
          await appointmentService.updateAppointment(editingId, formData);
          addNotification('Appointment updated successfully', 'success');
        } else {
          await appointmentService.createAppointment(formData);
          addNotification('Appointment created successfully', 'success');
        }
      }

      handleCloseDialog();
      if (isPatient) {
        setShowBookingForm(false);
        setFormData({ ...EMPTY_FORM_DATA });
      }
      fetchAppointments();
    } catch (err: any) {
      console.error('Failed to save appointment:', err);
      addNotification(
        err.response?.data?.message || 'Failed to save appointment. Please try again.',
        'error'
      );
    } finally {
      setSavingAppointment(false);
    }
  };

  // Delete appointment
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await appointmentService.deleteAppointment(id);
      addNotification('Appointment deleted successfully', 'success');
      fetchAppointments();
    } catch (err: any) {
      console.error('Failed to delete appointment:', err);
      addNotification(
        err.response?.data?.message || 'Failed to delete appointment.',
        'error'
      );
    }
  };

  // Table columns configuration
  const columns: Column<Appointment>[] = [
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'doctorName', label: 'Doctor', sortable: true },
    { key: 'dateTime', label: 'Date & Time', sortable: true },
    { key: 'reason', label: 'Reason', sortable: false },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Chip
          label={value}
          color={
            value === 'confirmed' ? 'success' :
            value === 'pending' ? 'warning' :
            value === 'cancelled' ? 'error' : 'default'
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
          {canManageAppointments && (
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

  // Patient Booking Form
  const renderPatientBookingForm = () => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Book Your Appointment
        </Typography>
        
        {!patientData ? (
          <Alert severity="warning">
            Unable to load your patient profile. Please refresh the page or contact support.
          </Alert>
        ) : (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormSelect
              label="Doctor"
              value={formData.doctorId || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, doctorId: e.target.value })
              }
              options={doctorOptions}
              required
              disabled={loading || savingAppointment}
            />

            <DateTimePicker
              value={formData.dateTime || ''}
              onChange={(value) => setFormData({ ...formData, dateTime: value })}
              required
              disabled={loading || savingAppointment}
            />

            <FormTextField
              label="Reason for Visit"
              value={formData.reason || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="e.g. General checkup, pain in shoulder"
              multiline
              rows={2}
              disabled={loading || savingAppointment}
            />

            <FormTextField
              label="Additional Notes"
              value={formData.notes || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional information for the doctor"
              multiline
              rows={2}
              disabled={loading || savingAppointment}
            />

            <Alert severity="info">
              Your appointment will be created with status <strong>Pending</strong>. 
              The doctor or clinic staff will confirm it soon.
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  setShowBookingForm(false);
                  setFormData({ ...EMPTY_FORM_DATA });
                }}
                fullWidth
                disabled={savingAppointment}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSave}
                fullWidth
                disabled={savingAppointment || loading}
              >
                {savingAppointment ? <CircularProgress size={24} /> : 'Book Appointment'}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Admin/Secretary Dialog Form
  const renderAppointmentDialog = () => (
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingId ? 'Edit Appointment' : 'New Appointment'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <FormSelect
          label="Patient"
          value={formData.patientId || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, patientId: e.target.value })
          }
          options={patientOptions}
          required
          disabled={savingAppointment}
        />

        <FormSelect
          label="Doctor"
          value={formData.doctorId || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, doctorId: e.target.value })
          }
          options={doctorOptions}
          required
          disabled={savingAppointment}
        />

        <DateTimePicker
          value={formData.dateTime || ''}
          onChange={(value) => setFormData({ ...formData, dateTime: value })}
          required
          disabled={savingAppointment}
        />

        <FormTextField
          label="Reason"
          value={formData.reason || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, reason: e.target.value })
          }
          multiline
          rows={2}
          disabled={savingAppointment}
        />

        <FormSelect
          label="Status"
          value={formData.status || 'pending'}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, status: e.target.value as Appointment['status'] })
          }
          options={STATUS_OPTIONS as any}
          disabled={savingAppointment}
        />

        <FormTextField
          label="Notes"
          value={formData.notes || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          multiline
          rows={2}
          disabled={savingAppointment}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} disabled={savingAppointment}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={savingAppointment}
        >
          {savingAppointment ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isPatient ? 'My Appointments' : 'Appointments Management'}
        </Typography>
        {isPatient && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowBookingForm(true)}
            disabled={loading || showBookingForm}
          >
            Book Appointment
          </Button>
        )}
        {canManageAppointments && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            New Appointment
          </Button>
        )}
      </Box>

      {/* Patient Booking Form */}
      {isPatient && showBookingForm && renderPatientBookingForm()}

      {/* Appointments Table/List */}
      {!isPatient && (
        <>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : displayedAppointments.length === 0 ? (
            <Alert severity="info">
              No appointments found. {canManageAppointments && 'Click "New Appointment" to create one.'}
            </Alert>
          ) : (
            <DataTable<Appointment>
              columns={columns}
              data={displayedAppointments}
              searchFields={['patientName', 'doctorName', 'reason']}
            />
          )}
        </>
      )}

      {/* Patient Appointments List */}
      {isPatient && !showBookingForm && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Your Appointments
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : displayedAppointments.length === 0 ? (
            <Alert severity="info">
              You have no appointments yet. Book your first appointment above!
            </Alert>
          ) : (
            <DataTable<Appointment>
              columns={columns.filter((col) => col.key !== 'id')} // Hide actions for patients
              data={displayedAppointments}
              searchFields={['doctorName', 'reason', 'dateTime']}
            />
          )}
        </Box>
      )}

      {/* Admin/Secretary Dialog */}
      {canManageAppointments && renderAppointmentDialog()}
    </Box>
  );
};
