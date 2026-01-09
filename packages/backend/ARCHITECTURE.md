# 🏗️ Architecture & Deployment Guide

## System Architecture

### Overview
```
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                      │
│                   Port: 5173                                │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST
                        │ JWT Auth
                        ↓
┌─────────────────────────────────────────────────────────────┐
│               Node.js/Express Backend                       │
│                   Port: 5000                                │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐  │
│  │ Routes  │  │Controller│  │ Middleware │  │ Utilities│  │
│  └────┬────┘  └────┬─────┘  └──────┬─────┘  └──────────┘  │
│       │            │               │                       │
│       └────────────┼───────────────┘                       │
│                    ↓                                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          Mongoose Models (8 Schemas)               │  │
│  └─────────────────┬───────────────────────────────────┘  │
│                    │                                       │
│                    ↓                                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Error Handling & Logging                 │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────────────────┘
                      │ Mongoose ODM
                      ↓
        ┌─────────────────────────────────┐
        │  MongoDB (Local or Atlas)       │
        │  ├── Users (5 roles)            │
        │  ├── Patients (+ medical info)  │
        │  ├── Doctors (+ speciality)     │
        │  ├── Secretaries (+ dept)       │
        │  ├── Appointments               │
        │  ├── Consultations              │
        │  ├── Medications                │
        │  └── Prescriptions (+ meds)     │
        └─────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js 4.18
- **Database**: MongoDB 5.0+ with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: bcryptjs
- **Validation**: express-validator
- **HTTP Client**: Axios
- **Logging**: Morgan
- **CORS**: CORS middleware

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: Axios
- **State Management**: Context API

## API Response Flow

### Success Response
```
Request → Route → Controller → Model → Database
                                  ↓
Response ← Error Handler (if needed) ← Success Response
```

### Example: Create Patient Flow
```javascript
POST /api/patients
├── Authentication Middleware (verify JWT)
├── Authorization Middleware (check role)
├── Validation (required fields)
├── Controller: patientController.createPatient()
│   ├── Database validation (email unique)
│   ├── Mongoose create()
│   └── Return formatted response
└── Response to client with 201 status
```

## Project Structure Details

### `/src/config`
- `database.js` - MongoDB connection setup
- `jwt.js` - JWT token utilities (generate, verify, decode)

### `/src/models` (8 Mongoose Schemas)
- `User.js` - Base user with roles and password hashing
- `Patient.js` - Patient profiles with medical history
- `Doctor.js` - Doctor profiles with specialties
- `Secretary.js` - Administrative staff profiles
- `Appointment.js` - Appointment bookings between patients/doctors
- `Consultation.js` - Medical consultation records
- `Medication.js` - Medicine database
- `Prescription.js` - Prescriptions with embedded medications

### `/src/controllers` (9 Controller Files)
Each controller handles:
- CRUD operations (Create, Read, Update, Delete)
- Data validation and error handling
- Response formatting for frontend
- Pagination and sorting logic
- Search functionality

**Controllers**:
- `authController.js` - Login, register, logout, token refresh
- `userController.js` - User management (admin only)
- `patientController.js` - Patient CRUD + search
- `doctorController.js` - Doctor CRUD + search
- `secretaryController.js` - Secretary CRUD
- `appointmentController.js` - Appointments with doctor/patient filtering
- `consultationController.js` - Consultations with relationships
- `medicationController.js` - Medication database management
- `prescriptionController.js` - Prescriptions with multiple meds

### `/src/routes` (9 Route Files)
Each route file:
- Imports controller functions
- Defines HTTP methods (GET, POST, PUT, DELETE)
- Applies authentication & authorization middleware
- Maps to controller actions
- Defines pagination and filtering parameters

### `/src/middleware`
- `auth.js` - JWT verification, user attachment, role checking
- `errorHandler.js` - Global error handling, HTTP status codes
- `validator.js` - Input validation error handling

### `/src/utils`
- `helpers.js` - Utility functions:
  - Pagination parameter calculation
  - Sort options builder
  - Search query builder
  - Response formatter
  - Async handler wrapper

## Database Schema Relationships

```
User (1) ────── (1) Patient
         ────── (1) Doctor
         ────── (1) Secretary

Patient (1) ────── (N) Appointment
Doctor  (1) ────── (N) Appointment
Appointment (1) ────── (1) Consultation

Consultation (1) ────── (N) Prescription
Doctor       (1) ────── (N) Prescription
Patient      (1) ────── (N) Prescription

Medication (1) ────── (N) (embedded in Prescription)
```

## Authentication & Authorization Flow

### Login Flow
```
1. User submits credentials (email, password)
2. Backend validates email exists
3. Backend compares password with bcrypt hash
4. Backend checks user.status === 'active'
5. Backend generates JWT token (HS256)
6. Backend returns token + user info (no password)
7. Frontend stores token in localStorage
8. Frontend adds token to Authorization header
```

### Request with Auth Flow
```
1. Frontend adds: Authorization: Bearer <token>
2. Backend auth middleware:
   ├── Extracts token from header
   ├── Verifies token signature with JWT_SECRET
   ├── Checks token hasn't expired
   ├── Decodes user ID and role
   ├── Fetches user from DB
   └── Attaches user to req.user
3. Authorization middleware:
   ├── Checks if user role is allowed
   ├── Returns 403 if unauthorized
   └── Passes to controller
4. Controller executes with req.user context
```

### Role-Based Access Control Matrix

| Resource | Admin | Doctor | Secretary | Patient |
|----------|:-----:|:------:|:---------:|:-------:|
| Users (CRUD) | ✓ | ✗ | ✗ | ✗ |
| Patients (R) | ✓ | ✓ | ✓ | ✓ |
| Patients (CUD) | ✓ | ✗ | ✓ | ✗ |
| Doctors (R) | ✓ | ✓ | ✓ | ✓ |
| Doctors (CUD) | ✓ | ✗ | ✗ | ✗ |
| Appointments (R) | ✓ | ✓ | ✓ | ✓ |
| Appointments (CUD) | ✓ | ✗ | ✓ | ✓ |
| Consultations (R) | ✓ | ✓ | ✓ | ✗ |
| Consultations (CU) | ✓ | ✓ | ✗ | ✗ |
| Consultations (D) | ✓ | ✗ | ✗ | ✗ |
| Medications (R) | ✓ | ✓ | ✓ | ✓ |
| Medications (CUD) | ✓ | ✗ | ✗ | ✗ |
| Prescriptions (R) | ✓ | ✓ | ✓ | ✗ |
| Prescriptions (CU) | ✓ | ✓ | ✗ | ✗ |
| Prescriptions (D) | ✓ | ✗ | ✗ | ✗ |

## API Endpoint Categories

### Public Routes
- `POST /api/auth/login` - Any user
- `POST /api/auth/register` - New user registration
- `GET /api/medications` - Read medications (no auth)

### Protected Routes
- All other routes require valid JWT token

### Admin-Only Routes
- `GET/POST/PUT/DELETE /api/users` - User management
- `POST/PUT/DELETE /api/doctors` - Doctor management
- `POST/PUT/DELETE /api/secretaries` - Secretary management
- `POST/PUT/DELETE /api/medications` - Medication management
- `DELETE /api/consultations` - Delete consultations
- `DELETE /api/prescriptions` - Delete prescriptions

### Doctor-Only Routes
- `POST/PUT /api/consultations` - Record consultations
- `POST/PUT /api/prescriptions` - Issue prescriptions

### Secretary Routes
- All patient CRUD operations
- All appointment CRUD operations

### Patient Routes
- `POST /api/appointments` - Book appointments
- `GET /api/appointments/patient/:patientId` - View own appointments

## Deployment Considerations

### Environment Variables Required
```env
# Database
MONGODB_URI=<connection_string>

# Server
PORT=5000
NODE_ENV=production

# Authentication
JWT_SECRET=<strong_random_secret>
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=<frontend_url>

# Logging
LOG_LEVEL=error
```

### Security Checklist
- [ ] Change JWT_SECRET to strong random value
- [ ] Use HTTPS in production (nginx/reverse proxy)
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGIN to specific frontend URL
- [ ] Use MongoDB Atlas with connection security
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Set up database backups
- [ ] Enable MongoDB authentication
- [ ] Use environment variables file (not .env in git)
- [ ] Log errors without sensitive data

### Production Deployment Options

#### Option 1: Traditional Server (AWS EC2, DigitalOcean, Heroku)
1. Push code to GitHub
2. Connect to deployment platform
3. Set environment variables
4. Deploy (automatic or manual)

#### Option 2: Containerized (Docker)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

#### Option 3: Serverless (AWS Lambda, Google Cloud Functions)
- Requires refactoring for serverless constraints
- MongoDB Atlas recommended (serverless-friendly)

### Performance Optimization
- Add caching layer (Redis) for medications list
- Implement request/response compression
- Use database indexing on frequently queried fields
- Implement pagination for large datasets
- Add logging and monitoring

### Monitoring
- Monitor database performance
- Set up error logging (Sentry, LogRocket)
- Track API response times
- Monitor database connections
- Set up alerts for critical errors

## Scaling Strategies

### Horizontal Scaling
- Run multiple backend instances
- Load balance with nginx/HAProxy
- Use MongoDB replica set for redundancy

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching

### Microservices (Future)
- Separate appointment service
- Separate consultation service
- Separate notification service
- Use message queue (RabbitMQ/Kafka)

---

**Next**: See README.md for complete API documentation and QUICK_START.md for setup instructions.
