import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * API Service Configuration
 * Handles all HTTP requests to the backend with JWT authentication
 */

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add JWT token to headers
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response interceptor - Handle token expiration
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Authentication Service ============
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
};

// ============ User Service ============
export const userService = {
  getAllUsers: async (params?: any) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

// ============ Patient Service ============
export const patientService = {
  getAllPatients: async (params?: any) => {
    const response = await apiClient.get('/patients', { params });
    return response.data;
  },
  getPatientById: async (id: string) => {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
  },
  createPatient: async (patientData: any) => {
    const response = await apiClient.post('/patients', patientData);
    return response.data;
  },
  updatePatient: async (id: string, patientData: any) => {
    const response = await apiClient.put(`/patients/${id}`, patientData);
    return response.data;
  },
  deletePatient: async (id: string) => {
    const response = await apiClient.delete(`/patients/${id}`);
    return response.data;
  },
  searchPatients: async (query: string) => {
    const response = await apiClient.get('/patients/search', {
      params: { q: query },
    });
    return response.data;
  },
};

// ============ Doctor Service ============
export const doctorService = {
  getAllDoctors: async (params?: any) => {
    const response = await apiClient.get('/doctors', { params });
    return response.data;
  },
  getDoctorById: async (id: string) => {
    const response = await apiClient.get(`/doctors/${id}`);
    return response.data;
  },
  createDoctor: async (doctorData: any) => {
    const response = await apiClient.post('/doctors', doctorData);
    return response.data;
  },
  updateDoctor: async (id: string, doctorData: any) => {
    const response = await apiClient.put(`/doctors/${id}`, doctorData);
    return response.data;
  },
  deleteDoctor: async (id: string) => {
    const response = await apiClient.delete(`/doctors/${id}`);
    return response.data;
  },
};

// ============ Secretary Service ============
export const secretaryService = {
  getAllSecretaries: async (params?: any) => {
    const response = await apiClient.get('/secretaries', { params });
    return response.data;
  },
  getSecretaryById: async (id: string) => {
    const response = await apiClient.get(`/secretaries/${id}`);
    return response.data;
  },
  createSecretary: async (secretaryData: any) => {
    const response = await apiClient.post('/secretaries', secretaryData);
    return response.data;
  },
  updateSecretary: async (id: string, secretaryData: any) => {
    const response = await apiClient.put(`/secretaries/${id}`, secretaryData);
    return response.data;
  },
  deleteSecretary: async (id: string) => {
    const response = await apiClient.delete(`/secretaries/${id}`);
    return response.data;
  },
};

// ============ Appointment Service ============
export const appointmentService = {
  getAllAppointments: async (params?: any) => {
    const response = await apiClient.get('/appointments', { params });
    return response.data;
  },
  getAppointmentById: async (id: string) => {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  },
  createAppointment: async (appointmentData: any) => {
    const response = await apiClient.post('/appointments', appointmentData);
    return response.data;
  },
  updateAppointment: async (id: string, appointmentData: any) => {
    const response = await apiClient.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },
  deleteAppointment: async (id: string) => {
    const response = await apiClient.delete(`/appointments/${id}`);
    return response.data;
  },
  getAppointmentsByDoctor: async (doctorId: string, params?: any) => {
    const response = await apiClient.get(`/appointments/doctor/${doctorId}`, { params });
    return response.data;
  },
  getAppointmentsByPatient: async (patientId: string, params?: any) => {
    const response = await apiClient.get(`/appointments/patient/${patientId}`, { params });
    return response.data;
  },
};

// ============ Consultation Service ============
export const consultationService = {
  getAllConsultations: async (params?: any) => {
    const response = await apiClient.get('/consultations', { params });
    return response.data;
  },
  getConsultationById: async (id: string) => {
    const response = await apiClient.get(`/consultations/${id}`);
    return response.data;
  },
  createConsultation: async (consultationData: any) => {
    const response = await apiClient.post('/consultations', consultationData);
    return response.data;
  },
  updateConsultation: async (id: string, consultationData: any) => {
    const response = await apiClient.put(`/consultations/${id}`, consultationData);
    return response.data;
  },
  deleteConsultation: async (id: string) => {
    const response = await apiClient.delete(`/consultations/${id}`);
    return response.data;
  },
};

// ============ Prescription Service ============
export const prescriptionService = {
  getAllPrescriptions: async (params?: any) => {
    const response = await apiClient.get('/prescriptions', { params });
    return response.data;
  },
  getPrescriptionById: async (id: string) => {
    const response = await apiClient.get(`/prescriptions/${id}`);
    return response.data;
  },
  createPrescription: async (prescriptionData: any) => {
    const response = await apiClient.post('/prescriptions', prescriptionData);
    return response.data;
  },
  updatePrescription: async (id: string, prescriptionData: any) => {
    const response = await apiClient.put(`/prescriptions/${id}`, prescriptionData);
    return response.data;
  },
  deletePrescription: async (id: string) => {
    const response = await apiClient.delete(`/prescriptions/${id}`);
    return response.data;
  },
};

// ============ Medication Service ============
export const medicationService = {
  getAllMedications: async (params?: any) => {
    const response = await apiClient.get('/medications', { params });
    return response.data;
  },
  getMedicationById: async (id: string) => {
    const response = await apiClient.get(`/medications/${id}`);
    return response.data;
  },
  createMedication: async (medicationData: any) => {
    const response = await apiClient.post('/medications', medicationData);
    return response.data;
  },
  updateMedication: async (id: string, medicationData: any) => {
    const response = await apiClient.put(`/medications/${id}`, medicationData);
    return response.data;
  },
  deleteMedication: async (id: string) => {
    const response = await apiClient.delete(`/medications/${id}`);
    return response.data;
  },
};

export default apiClient;
