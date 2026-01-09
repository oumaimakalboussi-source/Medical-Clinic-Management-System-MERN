import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  prescriptionService,
  consultationService,
  medicationService,
} from '../services/apiService';
import { FormTextField } from '../components/forms/FormTextField';
import { FormSelect } from '../components/forms/FormSelect';
import { DataTable, Column } from '../components/DataTable';
import { Typography } from '@mui/material';

/**
 * Prescriptions Page
 * Doctors can create prescriptions and add multiple medications per consultation
 */

interface PrescriptionMedication {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  dateCreated: string;
  medications: PrescriptionMedication[];
  notes: string;
  status: 'draft' | 'issued' | 'completed';
}

export const PrescriptionsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { addNotification } = useNotification();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<Prescription>>({
    medications: [],
    status: 'draft',
  });

  const [newMedication, setNewMedication] = useState<Partial<PrescriptionMedication>>({});

  // Fetch data
  useEffect(() => {
    fetchPrescriptions();
    fetchRelatedData();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionService.getAllPrescriptions();
      setPrescriptions(response.data?.data || response.data || []);
    } catch (err: any) {
      addNotification('Failed to load prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [consultationRes, medicationRes] = await Promise.all([
        consultationService.getAllConsultations({ limit: 100 }),
        medicationService.getAllMedications({ limit: 100 }),
      ]);
      setConsultations(consultationRes.data?.data || consultationRes.data || []);
      setMedications(medicationRes.data?.data || medicationRes.data || []);
    } catch (err) {
      console.error('Failed to fetch related data:', err);
    }
  };

  const handleOpenDialog = (prescription?: Prescription) => {
    if (prescription) {
      setEditingId(prescription.id);
      setFormData(prescription);
    } else {
      setEditingId(null);
      setFormData({ medications: [], status: 'draft' });
    }
    setNewMedication({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ medications: [], status: 'draft' });
    setNewMedication({});
  };

  const handleAddMedication = () => {
    if (!newMedication.medicationId || !newMedication.dosage || !newMedication.frequency) {
      addNotification('Please fill in medication details', 'warning');
      return;
    }

    const med = medications.find((m) => m.id === newMedication.medicationId);
    const medicationToAdd: PrescriptionMedication = {
      medicationId: newMedication.medicationId,
      medicationName: med?.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      duration: newMedication.duration || '',
      notes: newMedication.notes,
    };

    setFormData({
      ...formData,
      medications: [...(formData.medications || []), medicationToAdd],
    });
    setNewMedication({});
  };

  const handleRemoveMedication = (index: number) => {
    setFormData({
      ...formData,
      medications: formData.medications?.filter((_, i) => i !== index) || [],
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.consultationId || !formData.medications || formData.medications.length === 0) {
        addNotification('Please select a consultation and add medications', 'warning');
        return;
      }

      if (editingId) {
        await prescriptionService.updatePrescription(editingId, formData);
        addNotification('Prescription updated successfully', 'success');
      } else {
        await prescriptionService.createPrescription(formData);
        addNotification('Prescription created successfully', 'success');
      }

      handleCloseDialog();
      fetchPrescriptions();
    } catch (err: any) {
      addNotification(
        err.response?.data?.message || 'Failed to save prescription',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptionService.deletePrescription(id);
        addNotification('Prescription deleted successfully', 'success');
        fetchPrescriptions();
      } catch (err: any) {
        addNotification('Failed to delete prescription', 'error');
      }
    }
  };

  const columns: Column<Prescription>[] = [
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
      key: 'dateCreated',
      label: 'Date Created',
      sortable: true,
    },
    {
      key: 'medications',
      label: 'Medications',
      sortable: false,
      render: (value: PrescriptionMedication[]) => `${value.length} medication(s)`,
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
          Prescriptions
        </Typography>
        {hasRole(['admin', 'doctor']) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Prescription
          </Button>
        )}
      </Box>

      {/* Data Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable<Prescription>
          columns={columns}
          data={prescriptions}
          searchFields={['patientName', 'doctorName']}
        />
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Prescription' : 'New Prescription'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormSelect
            label="Consultation"
            value={formData.consultationId || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const consultation = consultations.find((c) => c.id === e.target.value);
              setFormData({
                ...formData,
                consultationId: e.target.value,
                patientId: consultation?.patientId,
                patientName: consultation?.patientName,
                doctorId: consultation?.doctorId,
                doctorName: consultation?.doctorName,
              });
            }}
            options={consultations.map((c) => ({
              label: `${c.patientName} - ${c.dateTime}`,
              value: c.id,
            }))}
            required
          />

          <FormTextField
            label="Notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={2}
          />

          <FormSelect
            label="Status"
            value={formData.status || 'draft'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Issued', value: 'issued' },
              { label: 'Completed', value: 'completed' },
            ]}
          />

          {/* Medications Section */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            Medications
          </Typography>

          <Card sx={{ mb: 2, p: 2, backgroundColor: '#f9f9f9' }}>
            <FormSelect
              label="Medication"
              value={newMedication.medicationId || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMedication({ ...newMedication, medicationId: e.target.value })}
              options={medications.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
            />

            <FormTextField
              label="Dosage"
              value={newMedication.dosage || ''}
              onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
              placeholder="e.g., 500mg"
            />

            <FormTextField
              label="Frequency"
              value={newMedication.frequency || ''}
              onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
              placeholder="e.g., 3 times daily"
            />

            <FormTextField
              label="Duration"
              value={newMedication.duration || ''}
              onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
              placeholder="e.g., 7 days"
            />

            <FormTextField
              label="Notes"
              value={newMedication.notes || ''}
              onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
              multiline
              rows={2}
            />

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddMedication}
              sx={{ mt: 1 }}
            >
              Add Medication
            </Button>
          </Card>

          {/* Medications List */}
          {formData.medications && formData.medications.length > 0 && (
            <Card>
              <CardContent>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Medication</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Dosage</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Frequency</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.medications.map((med, index) => (
                      <TableRow key={index}>
                        <TableCell>{med.medicationName}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>{med.duration}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveMedication(index)}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
