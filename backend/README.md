# 🏥 Medical Clinic Management System - Backend API

Professional Node.js + Express + MongoDB backend for a comprehensive medical clinic management web application. Fully integrated with React frontend, featuring JWT authentication, role-based access control, and complete CRUD operations for all clinic entities.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [End-to-End Workflow Examples](#end-to-end-workflow-examples)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## ✨ Features

### Core Functionality
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Admin, Doctor, Patient, Secretary roles
- ✅ **Complete CRUD Operations** - All entities fully manageable
- ✅ **Data Validation** - Comprehensive input validation
- ✅ **Error Handling** - Centralized error handling middleware
- ✅ **Pagination & Sorting** - Efficient data retrieval
- ✅ **Search Functionality** - Full-text search on entities

### Entities
1. **Users** - System users with roles (Admin, Doctor, Patient, Secretary)
2. **Patients** - Patient profiles with medical history
3. **Doctors** - Doctor profiles with specialties
4. **Secretaries** - Administrative staff profiles
5. **Appointments** - Booking system between patients and doctors
6. **Consultations** - Medical consultation records linked to appointments
7. **Medications** - Medicine database
8. **Prescriptions** - Doctor-issued prescriptions with multiple medications

## 📦 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager
- React frontend running on `http://localhost:5173`

## 🚀 Installation

### 1. Clone and Setup Backend

```bash
cd backend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

### 3. Configure MongoDB

Ensure MongoDB is running:

```bash
# For local MongoDB
mongod

# Or using MongoDB Atlas, update .env with your connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic-management
```

### 4. Seed Database (Optional)

Populate with test data:

```bash
npm run seed
```

## ⚙️ Configuration

Edit `.env` file with your settings:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/clinic-management

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

## 🏃 Running the Server

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

Server starts on `http://localhost:5000`

### API Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Response Format

All responses follow a standard format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "pagination": { /* if applicable */ }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if applicable */ ]
}
```

---

## 🔐 Authentication Routes

### POST `/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@clinic.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "userId",
      "email": "user@clinic.com",
      "nom": "Doe",
      "prenom": "John",
      "role": "doctor",
      "telephone": "+212 6XX-XXX-XXX"
    }
  }
}
```

### POST `/auth/register`
Register a new user.

**Request:**
```json
{
  "email": "newuser@clinic.com",
  "password": "password123",
  "nom": "Doe",
  "prenom": "John",
  "role": "patient"
}
```

### POST `/auth/refresh`
Refresh expired token (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

### POST `/auth/logout`
Logout user (requires authentication).

---

## 👥 User Management Routes

**Authentication Required: YES**
**Required Role: Admin**

### GET `/users`
Get all users with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `sortBy` (default: createdAt)
- `order` (asc/desc, default: asc)

**Example:**
```
GET /users?page=1&limit=20&sortBy=email&order=asc
```

### GET `/users/:id`
Get user by ID.

### POST `/users`
Create a new user.

**Request:**
```json
{
  "email": "newuser@clinic.com",
  "password": "password123",
  "nom": "Doe",
  "prenom": "John",
  "role": "doctor",
  "telephone": "+212 6XX-XXX-XXX",
  "status": "active"
}
```

### PUT `/users/:id`
Update user.

### DELETE `/users/:id`
Delete user.

---

## 👨‍⚕️ Patient Routes

**Authentication Required: YES**
**Create/Update/Delete Role: Admin, Secretary**

### GET `/patients`
Get all patients with search and pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` - Search by nom, prenom, email, telephone
- `sortBy` (default: createdAt)
- `order` (asc/desc)

**Example:**
```
GET /patients?search=john&limit=20
```

### GET `/patients/:id`
Get patient by ID.

### POST `/patients`
Create a new patient.

**Request:**
```json
{
  "email": "john@example.com",
  "nom": "Martin",
  "prenom": "John",
  "dateNaissance": "1990-05-15",
  "sexe": "male",
  "telephone": "+212 6XX-XXX-XXX",
  "adresse": "123 Main St, City",
  "numeroSecu": "SEU-123-456-789",
  "mutuelle": "Mutuelle Plus",
  "allergies": "Peanuts",
  "antecedents": "None"
}
```

### PUT `/patients/:id`
Update patient.

### DELETE `/patients/:id`
Delete patient.

### GET `/patients/search?q=john`
Search patients by multiple fields.

---

## 👨‍⚕️ Doctor Routes

**Authentication Required: YES**
**Create/Update/Delete Role: Admin**

### GET `/doctors`
Get all doctors with search.

**Query Parameters:**
- `page`, `limit`, `search`, `sortBy`, `order`

### GET `/doctors/:id`
Get doctor by ID.

### POST `/doctors`
Create a new doctor.

**Request:**
```json
{
  "email": "dr.smith@clinic.com",
  "nom": "Smith",
  "prenom": "Dr.",
  "specialite": "Cardiologist",
  "numeroOrdre": "ORD-001",
  "telephone": "+212 6XX-XXX-XXX",
  "cabinet": "Cabinet Medical Centre",
  "horairesConsultation": "Monday to Friday 09:00-17:00"
}
```

### PUT `/doctors/:id`
Update doctor.

### DELETE `/doctors/:id`
Delete doctor.

---

## 📅 Appointment Routes

**Authentication Required: YES**
**Create Role: Patient, Secretary, Admin**
**Update/Delete Role: Secretary, Admin**

### GET `/appointments`
Get all appointments.

**Query Parameters:**
- `page`, `limit`, `sortBy`, `order`
- `status` - Filter by status (pending, confirmed, cancelled, completed)

### GET `/appointments/:id`
Get appointment by ID.

### GET `/appointments/doctor/:doctorId`
Get all appointments for a specific doctor.

### GET `/appointments/patient/:patientId`
Get all appointments for a specific patient.

### POST `/appointments`
Create a new appointment.

**Request:**
```json
{
  "patientId": "patientObjectId",
  "doctorId": "doctorObjectId",
  "dateTime": "2024-01-15T10:00:00Z",
  "reason": "General check-up",
  "status": "pending",
  "notes": "Patient needs blood work"
}
```

### PUT `/appointments/:id`
Update appointment.

### DELETE `/appointments/:id`
Delete appointment.

---

## 🏥 Consultation Routes

**Authentication Required: YES**
**Create/Update Role: Doctor, Admin**
**Delete Role: Admin**

### GET `/consultations`
Get all consultations.

**Query Parameters:**
- `page`, `limit`, `sortBy`, `order`
- `status` - Filter by status (in-progress, completed, cancelled)

### GET `/consultations/:id`
Get consultation by ID.

### POST `/consultations`
Create a new consultation.

**Request:**
```json
{
  "appointmentId": "appointmentObjectId",
  "patientId": "patientObjectId",
  "doctorId": "doctorObjectId",
  "dateTime": "2024-01-15T10:00:00Z",
  "diagnosis": "Hypertension Stage 1",
  "treatment": "Start antihypertensive medication",
  "notes": "Patient to return for follow-up in 2 weeks",
  "status": "completed"
}
```

### PUT `/consultations/:id`
Update consultation.

### DELETE `/consultations/:id`
Delete consultation.

---

## 💊 Medication Routes

**Authentication Required: NO (read only)**
**Create/Update/Delete Role: Admin (requires auth)**

### GET `/medications`
Get all medications.

**Query Parameters:**
- `page`, `limit`, `search`, `sortBy`, `order`

### GET `/medications/:id`
Get medication by ID.

### POST `/medications`
Create a new medication (Admin only).

**Request:**
```json
{
  "name": "Aspirin",
  "description": "Pain reliever and blood thinner",
  "composition": "Acetylsalicylic acid 500mg",
  "dosageOptions": ["100mg", "325mg", "500mg"],
  "sideEffects": "Stomach upset, heartburn",
  "contraindications": "Allergic to salicylates",
  "manufacturer": "Generic Pharma Inc."
}
```

### PUT `/medications/:id`
Update medication (Admin only).

### DELETE `/medications/:id`
Delete medication (Admin only).

---

## 📝 Prescription Routes

**Authentication Required: YES**
**Create/Update Role: Doctor, Admin**
**Delete Role: Admin**

### GET `/prescriptions`
Get all prescriptions.

**Query Parameters:**
- `page`, `limit`, `sortBy`, `order`
- `status` - Filter by status (draft, issued, completed)

### GET `/prescriptions/:id`
Get prescription by ID.

### POST `/prescriptions`
Create a new prescription.

**Request:**
```json
{
  "consultationId": "consultationObjectId",
  "patientId": "patientObjectId",
  "doctorId": "doctorObjectId",
  "medications": [
    {
      "medicationId": "medicationObjectId",
      "medicationName": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "Three times daily",
      "duration": "7 days",
      "notes": "Take with food"
    }
  ],
  "notes": "Follow up in one week",
  "status": "draft"
}
```

### PUT `/prescriptions/:id`
Update prescription.

### DELETE `/prescriptions/:id`
Delete prescription.

---

## 🗄️ Database Schema

### User Schema
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  nom: String (required),
  prenom: String (required),
  role: Enum ['admin', 'doctor', 'patient', 'secretary'],
  telephone: String,
  avatar: String,
  status: Enum ['active', 'inactive'],
  createdAt: Date,
  updatedAt: Date
}
```

### Patient Schema
```javascript
{
  userId: ObjectId (ref: User),
  email: String (unique, required),
  nom: String (required),
  prenom: String (required),
  dateNaissance: Date,
  sexe: Enum ['male', 'female', 'other'],
  telephone: String,
  adresse: String,
  numeroSecu: String (unique),
  mutuelle: String,
  allergies: String,
  antecedents: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Schema
```javascript
{
  patientId: ObjectId (ref: Patient, required),
  doctorId: ObjectId (ref: Doctor, required),
  dateTime: Date (required),
  reason: String,
  status: Enum ['pending', 'confirmed', 'cancelled', 'completed'],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Consultation Schema
```javascript
{
  appointmentId: ObjectId (ref: Appointment, required, unique),
  patientId: ObjectId (ref: Patient, required),
  doctorId: ObjectId (ref: Doctor, required),
  dateTime: Date (required),
  diagnosis: String (required),
  treatment: String,
  notes: String,
  status: Enum ['in-progress', 'completed', 'cancelled'],
  createdAt: Date,
  updatedAt: Date
}
```

### Prescription Schema
```javascript
{
  consultationId: ObjectId (ref: Consultation, required),
  patientId: ObjectId (ref: Patient, required),
  doctorId: ObjectId (ref: Doctor, required),
  dateCreated: Date,
  medications: [
    {
      medicationId: ObjectId (ref: Medication),
      medicationName: String,
      dosage: String,
      frequency: String,
      duration: String,
      notes: String
    }
  ],
  notes: String,
  status: Enum ['draft', 'issued', 'completed'],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication

### JWT Token Structure

All authenticated requests require:
```
Authorization: Bearer <jwt_token>
```

Token payload:
```json
{
  "id": "userId",
  "role": "admin|doctor|patient|secretary",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Token Expiration
- Default: 7 days
- Configurable via `JWT_EXPIRE` environment variable

### Refresh Token
```bash
POST /api/auth/refresh
Authorization: Bearer <expired_token>
```

---

## 👮 Role-Based Access Control

| Endpoint | Admin | Doctor | Secretary | Patient |
|----------|:-----:|:------:|:---------:|:-------:|
| **Users** | ✓ | ✗ | ✗ | ✗ |
| **Patients** (Read) | ✓ | ✓ | ✓ | ✗ |
| **Patients** (Write) | ✓ | ✗ | ✓ | ✗ |
| **Doctors** (Read) | ✓ | ✓ | ✓ | ✗ |
| **Doctors** (Write) | ✓ | ✗ | ✗ | ✗ |
| **Appointments** (Read) | ✓ | ✓ | ✓ | ✓ |
| **Appointments** (Write) | ✓ | ✗ | ✓ | ✓ |
| **Consultations** (Read) | ✓ | ✓ | ✓ | ✗ |
| **Consultations** (Write) | ✓ | ✓ | ✗ | ✗ |
| **Prescriptions** (Read) | ✓ | ✓ | ✓ | ✗ |
| **Prescriptions** (Write) | ✓ | ✓ | ✗ | ✗ |
| **Medications** (Read) | ✓ | ✓ | ✓ | ✓ |
| **Medications** (Write) | ✓ | ✗ | ✗ | ✗ |

---

## 🔄 End-to-End Workflow Examples

### Workflow 1: Patient Appointment to Prescription

#### Step 1: Patient Books Appointment
```bash
POST /api/appointments
Authorization: Bearer <patient_token>

{
  "patientId": "6077a5d0f1a2b3c4d5e6f7g8",
  "doctorId": "5077a5d0f1a2b3c4d5e6f7g1",
  "dateTime": "2024-01-20T14:00:00Z",
  "reason": "Regular check-up"
}
```

#### Step 2: Secretary Confirms Appointment
```bash
PUT /api/appointments/6177a5d0f1a2b3c4d5e6f7g9
Authorization: Bearer <secretary_token>

{
  "status": "confirmed"
}
```

#### Step 3: Doctor Records Consultation
```bash
POST /api/consultations
Authorization: Bearer <doctor_token>

{
  "appointmentId": "6177a5d0f1a2b3c4d5e6f7g9",
  "patientId": "6077a5d0f1a2b3c4d5e6f7g8",
  "doctorId": "5077a5d0f1a2b3c4d5e6f7g1",
  "diagnosis": "Type 2 Diabetes",
  "treatment": "Medication and lifestyle changes",
  "status": "completed"
}
```

#### Step 4: Doctor Issues Prescription
```bash
POST /api/prescriptions
Authorization: Bearer <doctor_token>

{
  "consultationId": "6277a5d0f1a2b3c4d5e6f7ga",
  "patientId": "6077a5d0f1a2b3c4d5e6f7g8",
  "doctorId": "5077a5d0f1a2b3c4d5e6f7g1",
  "medications": [
    {
      "medicationId": "5377a5d0f1a2b3c4d5e6f7g2",
      "medicationName": "Metformin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "30 days"
    }
  ],
  "status": "issued"
}
```

#### Step 5: Patient Views Prescription
```bash
GET /api/prescriptions/6377a5d0f1a2b3c4d5e6f7gb
Authorization: Bearer <patient_token>
```

### Workflow 2: Admin Creating Doctor and Assigning Patients

#### Step 1: Admin Creates Doctor User
```bash
POST /api/users
Authorization: Bearer <admin_token>

{
  "email": "dr.newdoctor@clinic.com",
  "password": "secure_password123",
  "nom": "NewDoctor",
  "prenom": "Dr.",
  "role": "doctor"
}
```

#### Step 2: Admin Creates Doctor Profile
```bash
POST /api/doctors
Authorization: Bearer <admin_token>

{
  "email": "dr.newdoctor@clinic.com",
  "nom": "NewDoctor",
  "prenom": "Dr.",
  "specialite": "Cardiologist",
  "numeroOrdre": "ORD-123"
}
```

#### Step 3: Admin Assigns Appointments
```bash
POST /api/appointments
Authorization: Bearer <admin_token>

{
  "patientId": "6077a5d0f1a2b3c4d5e6f7g8",
  "doctorId": "5477a5d0f1a2b3c4d5e6f7g3",
  "dateTime": "2024-01-25T10:00:00Z",
  "reason": "Cardiac evaluation"
}
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── jwt.js               # JWT utilities
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── secretaryController.js
│   │   ├── appointmentController.js
│   │   ├── consultationController.js
│   │   ├── medicationController.js
│   │   └── prescriptionController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Secretary.js
│   │   ├── Appointment.js
│   │   ├── Consultation.js
│   │   ├── Medication.js
│   │   └── Prescription.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── secretaryRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── consultationRoutes.js
│   │   ├── medicationRoutes.js
│   │   └── prescriptionRoutes.js
│   ├── middleware/
│   │   ├── auth.js              # Authentication & authorization
│   │   ├── errorHandler.js      # Error handling
│   │   └── validator.js         # Input validation
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   └── server.js                # Main entry point
├── scripts/
│   └── seedData.js              # Database seeding script
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors */ ]
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

### Common Error Scenarios

**Missing Authentication Token:**
```json
{
  "success": false,
  "message": "No token provided. Please provide a valid JWT token."
}
```

**Insufficient Permissions:**
```json
{
  "success": false,
  "message": "Access denied. Required roles: doctor, admin. Your role: patient"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## ✅ Best Practices

### Security
- ✓ Always use HTTPS in production
- ✓ Store JWT_SECRET securely (use environment variables)
- ✓ Validate and sanitize all inputs
- ✓ Use strong passwords (minimum 6 characters, enforced)
- ✓ Never log sensitive data (passwords are excluded from logs)
- ✓ Implement rate limiting for production
- ✓ Use CORS with specific origins

### Performance
- ✓ Use pagination for large datasets (limit max 100)
- ✓ Create database indexes on frequently searched fields
- ✓ Use async/await for non-blocking operations
- ✓ Implement caching strategies for medications list
- ✓ Monitor database queries in production

### Code Quality
- ✓ Use consistent error handling with try-catch
- ✓ Validate all inputs before database operations
- ✓ Use meaningful error messages
- ✓ Maintain code documentation
- ✓ Use environment variables for configuration
- ✓ Test all endpoints before deployment

### Database
- ✓ Always use transactions for multi-document updates
- ✓ Implement soft deletes for audit trails (future enhancement)
- ✓ Use database backups in production
- ✓ Monitor MongoDB performance
- ✓ Use connection pooling

---

## 📞 Support & Troubleshooting

### MongoDB Connection Issues
```bash
# Test connection
mongodb://localhost:27017

# For MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/clinic-management
```

### CORS Issues
Ensure `CORS_ORIGIN` in .env matches your frontend URL:
```env
CORS_ORIGIN=http://localhost:5173
```

### Token Issues
- Token expired: Use `/auth/refresh` endpoint
- Invalid token: Re-login with `/auth/login`
- No token: Ensure `Authorization: Bearer <token>` header is present

### Database Seeding
```bash
npm run seed
```

Test credentials after seeding:
- Admin: `admin@clinic.com` / `admin123`
- Doctor: `dr.ahmed@clinic.com` / `doctor123`
- Patient: `patient1@clinic.com` / `patient123`

---

## 📝 License

All rights reserved - Medical Clinic Management System

---

## 🔗 Frontend Integration

This backend is designed to work seamlessly with the React frontend located at:
```
../
```

### Frontend API Configuration
Frontend uses base URL from environment:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

All JWT tokens are automatically attached to requests via interceptor.

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✓
