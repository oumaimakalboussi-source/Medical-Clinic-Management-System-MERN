# Clinic Management System - Frontend

A professional medical clinic management web application built with React.js, featuring appointment scheduling, patient management, consultations, and prescription handling.

## 🏥 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based login with role-based access control
- **Dashboard**: Role-specific dashboards with statistics and charts
- **Appointment Management**: Create, read, update, and delete appointments
- **Patient Management**: Complete patient profile management with medical history
- **Consultations**: Doctors can record consultations linked to appointments
- **Prescriptions**: Create prescriptions and manage multiple medications
- **User Management**: Admin panel for user administration

### User Roles
- **Admin**: Full system access, user management, statistics
- **Doctor**: Appointment viewing, consultation records, prescriptions
- **Patient**: Book appointments, view own records
- **Secretary**: Appointment and patient management

### Technical Features
- ✨ Responsive Material-UI design
- 📊 Data tables with sorting, filtering, and pagination
- 📈 Charts and statistics using Recharts
- 🔐 Protected routes with role-based rendering
- 🔔 Toast notifications for user feedback
- 📱 Mobile-friendly responsive layout
- ⚡ Optimized API service layer with interceptors

## 🛠️ Tech Stack

- **React 18**: Component-based UI library
- **TypeScript**: Type-safe development
- **Material-UI (MUI)**: Professional UI components
- **React Router v6**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Recharts**: Data visualization
- **Context API**: Global state management

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   cd projet-semesteriel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to set your backend API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 🚀 Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── forms/              # Reusable form components
│   │   ├── FormTextField.tsx
│   │   └── FormSelect.tsx
│   ├── DataTable.tsx       # Reusable data table with pagination
│   ├── Layout.tsx          # Main layout with navigation
│   ├── ProtectedRoute.tsx  # Route protection wrapper
│   └── NotificationContainer.tsx
├── context/
│   ├── AuthContext.tsx     # Authentication context
│   └── NotificationContext.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AppointmentsPage.tsx
│   ├── PatientsPage.tsx
│   ├── ConsultationsPage.tsx
│   ├── PrescriptionsPage.tsx
│   ├── UsersPage.tsx
│   └── ProfilePage.tsx
├── services/
│   └── apiService.ts       # API client with interceptors
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css
```

## 🔐 Authentication

### Login Flow
1. User enters credentials (email & password)
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. Token automatically included in all API requests via interceptor
5. Token expiration triggers redirect to login

### Demo Credentials
```
Admin:     admin@clinic.com / password123
Doctor:    doctor@clinic.com / password123
Patient:   patient@clinic.com / password123
Secretary: secretary@clinic.com / password123
```

## 📡 API Integration

### Base URL Configuration
Set `VITE_API_URL` in environment variables. Default: `http://localhost:5000/api`

### API Service Structure

The `apiService.ts` exports organized service modules:

```typescript
// Authentication
authService.login(email, password)
authService.logout()

// Patients
patientService.getAllPatients()
patientService.getPatientById(id)
patientService.createPatient(data)
patientService.updatePatient(id, data)
patientService.deletePatient(id)
patientService.searchPatients(query)

// Appointments
appointmentService.getAllAppointments()
appointmentService.getAppointmentsByDoctor(doctorId)
appointmentService.getAppointmentsByPatient(patientId)
// ... CRUD operations

// Similar services for:
// - doctorService
// - consultationService
// - prescriptionService
// - medicationService
```

### Request Interceptor
- Automatically adds JWT token to Authorization header
- Handles 401 errors by redirecting to login

## 🎨 UI Components

### DataTable Component
Reusable table with built-in:
- Sorting by columns
- Text search/filtering
- Pagination
- Custom cell rendering
- Row click handlers

Usage:
```typescript
<DataTable
  columns={columns}
  data={data}
  searchFields={['name', 'email']}
  onRowClick={handleRowClick}
/>
```

### Form Components
- `FormTextField`: Standard text input with validation
- `FormSelect`: Dropdown select with options
- Consistent styling and error handling

### Protected Routes
```typescript
<ProtectedRoute requiredRoles={['admin', 'doctor']}>
  <SomeComponent />
</ProtectedRoute>
```

## 📊 State Management

### AuthContext
Manages:
- Current user information
- JWT token
- Authentication state
- Role-based access checking

### NotificationContext
Handles toast notifications with auto-dismissal

## 🎯 Key Features Implementation

### Complete CRUD Flow Example: Appointments

1. **Read**: Fetch appointments on page load
   ```typescript
   const response = await appointmentService.getAllAppointments()
   ```

2. **Create**: Open dialog, submit form
   ```typescript
   await appointmentService.createAppointment(formData)
   ```

3. **Update**: Edit existing appointment
   ```typescript
   await appointmentService.updateAppointment(id, formData)
   ```

4. **Delete**: Confirm and delete
   ```typescript
   await appointmentService.deleteAppointment(id)
   ```

### Role-Based Access

Access control is enforced at:
- Route level: `ProtectedRoute` component
- Navigation level: Menu items filtered by role
- Feature level: Edit/delete buttons conditional

```typescript
{hasRole(['admin', 'secretary']) && (
  <Button onClick={handleEdit}>Edit</Button>
)}
```

## 📈 Dashboard Features

- **Admin Dashboard**: 
  - Total statistics (patients, appointments, consultations)
  - Weekly activity chart
  - Upcoming appointments table

- **Doctor Dashboard**:
  - Today's appointments count
  - Quick action buttons

- **Patient Dashboard**:
  - Appointment booking options

- **Secretary Dashboard**:
  - Appointment management overview

## 🔔 Notifications

Notifications are triggered for:
- Successful operations (create, update, delete)
- Errors and validation failures
- API errors with custom messages

Usage:
```typescript
const { addNotification } = useNotification()

addNotification('Success message', 'success')
addNotification('Error message', 'error')
addNotification('Warning message', 'warning')
addNotification('Info message', 'info')
```

## 🧪 Component Examples

### Creating a CRUD Page
```typescript
export const MyPage: React.FC = () => {
  const { addNotification } = useNotification()
  const [data, setData] = useState<Item[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState<Partial<Item>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await itemService.getAll()
      setData(response.data)
    } catch (err) {
      addNotification('Failed to load data', 'error')
    }
  }

  const handleSave = async () => {
    try {
      await itemService.create(formData)
      addNotification('Created successfully', 'success')
      fetchData()
    } catch (err) {
      addNotification('Failed to create', 'error')
    }
  }

  const columns: Column<Item>[] = [
    { key: 'name', label: 'Name', sortable: true },
    // ... more columns
  ]

  return (
    <Box>
      <DataTable columns={columns} data={data} />
      {/* Dialog form */}
    </Box>
  )
}
```

## 🚨 Error Handling

All API calls include:
- Try-catch blocks
- Automatic error notifications
- User-friendly error messages
- Network error handling

## 📱 Responsive Design

- Desktop-first approach
- Breakpoints: xs, sm, md, lg, xl
- Mobile navigation drawer
- Tablet optimization

## 🔄 Best Practices Implemented

✅ Component modularity and reusability
✅ Custom hooks for shared logic
✅ Type-safe TypeScript throughout
✅ Centralized API service
✅ Global state with Context API
✅ Protected routes with role checking
✅ Proper error handling and user feedback
✅ Loading states and spinners
✅ Form validation
✅ Responsive and accessible UI
✅ Clean code organization

## 🤝 Integration with Backend

This frontend is designed to work with a Node.js/Express backend with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### Resources (CRUD)
- `/api/users` - User management
- `/api/patients` - Patient management
- `/api/doctors` - Doctor management
- `/api/secretaries` - Secretary management
- `/api/appointments` - Appointment management
- `/api/consultations` - Consultation management
- `/api/prescriptions` - Prescription management
- `/api/medications` - Medication management

## 📝 Environment Variables

```env
# API Base URL
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### CORS Issues
Ensure backend allows requests from frontend origin

### API Connection Issues
- Check `VITE_API_URL` configuration
- Verify backend is running
- Check network tab in browser devtools

### Token Expiration
- Tokens automatically redirect to login on 401 response
- Clear localStorage if stuck in login loop

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Material-UI Documentation](https://mui.com)
- [React Router Documentation](https://reactrouter.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

## 📄 License

This project is part of a medical clinic management system.

## 👥 Support

For issues or questions, please contact the development team.

---

**Status**: Production Ready ✅
**Last Updated**: January 2024
**Version**: 1.0.0
