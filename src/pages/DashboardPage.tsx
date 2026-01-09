import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  appointmentService,
  patientService,
  consultationService,
  medicationService,
} from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Dashboard Page
 * Displays overview of appointments, patients, consultations, and medications
 * Shows role-based widgets and statistics
 */

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

interface UpcomingAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch appointments
        const appointmentsRes = await appointmentService.getAllAppointments({
          limit: 10,
          sort: 'dateTime',
        });
        setAppointments(appointmentsRes.data?.slice(0, 5) || []);

        // Fetch statistics based on role
        if (hasRole('admin')) {
          const [patients, consultations, medications] = await Promise.all([
            patientService.getAllPatients({ limit: 1 }),
            consultationService.getAllConsultations({ limit: 1 }),
            medicationService.getAllMedications({ limit: 1 }),
          ]);

          setStats({
            patients: patients.total || 0,
            appointments: appointmentsRes.total || 0,
            consultations: consultations.total || 0,
            medications: medications.total || 0,
          });
        }

        // Generate sample chart data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = days.map((day) => ({
          day,
          appointments: Math.floor(Math.random() * 8) + 2,
          consultations: Math.floor(Math.random() * 6) + 1,
        }));
        setChartData(data);
      } catch (err: any) {
        addNotification(
          'Failed to load dashboard data',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Admin Dashboard
  if (hasRole('admin')) {
    const statCards: StatCard[] = [
      {
        title: 'Total Patients',
        value: stats.patients || 0,
        icon: <PeopleIcon sx={{ fontSize: 40 }} />,
        color: '#1976d2',
      },
      {
        title: 'Upcoming Appointments',
        value: stats.appointments || 0,
        icon: <EventIcon sx={{ fontSize: 40 }} />,
        color: '#388e3c',
      },
      {
        title: 'Consultations',
        value: stats.consultations || 0,
        icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
        color: '#f57c00',
      },
      {
        title: 'Medications',
        value: stats.medications || 0,
        icon: <MedicationIcon sx={{ fontSize: 40 }} />,
        color: '#7b1fa2',
      },
    ];

    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Dashboard
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: `${card.color}20`,
                    mr: 2,
                  }}
                >
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
                <CardContent sx={{ flex: 1, p: 0 }}>
                  <Typography color="text.secondary" variant="subtitle2">
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Weekly Appointments & Consultations
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="consultations"
                  stroke="#388e3c"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Appointments Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Upcoming Appointments
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/appointments')}
              >
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt.id} hover>
                      <TableCell>{apt.patientName}</TableCell>
                      <TableCell>{apt.doctorName}</TableCell>
                      <TableCell>{apt.dateTime}</TableCell>
                      <TableCell>
                        <Chip
                          label={apt.status}
                          color={
                            apt.status === 'confirmed'
                              ? 'success'
                              : apt.status === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Doctor Dashboard
  if (hasRole('doctor')) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Welcome, Dr. {user?.nom}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Today's Appointments
                </Typography>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" color="primary">
                    5
                  </Typography>
                  <Typography color="text.secondary">Scheduled for today</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/appointments')}
                  >
                    View Appointments
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/consultations')}
                  >
                    New Consultation
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Patient Dashboard
  if (hasRole('patient')) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Welcome, {user?.prenom}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Your Appointments
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/appointments')}
                >
                  Book an Appointment
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Secretary Dashboard
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Secretary Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Total Appointments Today
              </Typography>
              <Typography variant="h3" color="primary">
                {appointments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/appointments')}
                >
                  Manage Appointments
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/patients')}
                >
                  View Patients
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
