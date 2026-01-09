# Clinic Management System - Monorepo Architecture Guide

## 📐 Architecture Overview

This project follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles to ensure separation of concerns, testability, and maintainability at scale.

```
┌────────────────────────────────────────────────────────────────┐
│                    MONOREPO ROOT                               │
│  ├─ npm workspaces (packages/frontend, packages/backend)      │
│  ├─ Shared scripts & configs                                   │
│  └─ Concurrently run dev servers                              │
└────────────────────────────────────────────────────────────────┘
          │
          ├─────────────────────────┬──────────────────────────────
          │                         │
    ┌─────▼─────────────┐   ┌──────▼──────────────┐
    │ packages/frontend │   │ packages/backend    │
    │  (React + Vite)   │   │ (Node.js + Express) │
    └─────────────────── ┘   └─────────────────────┘
```

## 🏗️ Backend Architecture (Clean Architecture Layers)

### Layer 1: Presentation (Controllers & Routes)
Handles HTTP requests/responses; minimal business logic.

```
src/
├── controllers/            # HTTP handlers (thin, delegates to services)
│   └── patientController.js
├── routes/                 # Express route definitions
│   └── patientRoutes.js
└── middleware/             # Auth, validation, error handling
    ├── auth.js
    ├── errorHandler.js
    └── validator.js
```

**Responsibility**: Parse request → validate input → delegate to service → format response.

### Layer 2: Application (Services/Use Cases)
Business logic; orchestrates domain and infrastructure.

```
src/
└── application/            # Use-case implementations (services)
    └── services/
        └── patientService.js
             - list()       # Fetch with pagination
             - getById()    # Fetch single
             - create()     # Validate & persist
             - update()     # Modify & persist
             - remove()     # Delete
             - search()     # Full-text search
```

**Responsibility**: Implement business rules; call repositories; throw domain errors.

### Layer 3: Domain (Entities, Value Objects, Interfaces)
Core business concepts; independent of frameworks.

```
src/
└── domain/                 # (Future) Domain models & rules
    ├── entities/           # Patient, Doctor, Appointment, etc.
    └── interfaces/         # Repository contracts (implemented in infrastructure)
```

**Responsibility**: Define what a Patient is; validation rules; business constraints.

### Layer 4: Infrastructure (Repositories & External Services)
Data access, external APIs, persistence.

```
src/
└── infrastructure/
    ├── repositories/       # Database queries abstracted as interfaces
    │   └── patientRepository.js
    │        - find()
    │        - count()
    │        - findById()
    │        - create()
    │        - updateById()
    │        - deleteById()
    │        - searchByQuery()
    └── config/
        └── database.js     # MongoDB connection
```

**Responsibility**: Translate domain/service calls into Mongoose queries.

### Layer 5: Configuration & Models
Database schemas, JWT secrets, environment.

```
src/
├── models/                 # Mongoose schemas
│   ├── Patient.js
│   ├── Doctor.js
│   ├── Appointment.js
│   └── ...
├── config/
│   ├── database.js
│   ├── jwt.js
│   └── .env (secrets)
└── utils/
    └── helpers.js          # Pagination, sorting, search utilities
```

## 🎯 Data Flow Example: Create Patient

```
POST /api/patients
     │
     ├─► patientController.createPatient()
     │   ├─ Parse req.body
     │   ├─ Call patientService.create(data)
     │   │  ├─ Validate required fields (business rule)
     │   │  ├─ Check email uniqueness via repository
     │   │  ├─ Call patientRepository.create()
     │   │  │  └─ Execute Mongoose Patient.create()
     │   │  └─ Return created document
     │   ├─ Catch errors (validation, duplicate, etc.)
     │   └─ Return 201 + JSON
     │
Response 201: { success: true, data: patient }
```

## 📦 Frontend Architecture

### Component-Based Structure
```
packages/frontend/src/
├── components/            # Reusable UI components
│   ├── forms/            # FormTextField, FormSelect, etc.
│   ├── DataTable.tsx     # Pagination, sort, filter
│   ├── Layout.tsx        # Nav, sidebar
│   └── ProtectedRoute.tsx # Role-based routing
├── pages/                # Page components (route targets)
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PatientsPage.tsx
│   └── ...
├── context/              # Global state (Auth, Notifications)
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── services/             # API client
│   └── apiService.ts     # Axios instance + interceptors
├── App.tsx               # Routes & layouts
└── main.tsx              # Entry point
```

### Frontend-Backend Decoupling
- **No shared types**: Frontend imports from backend only as needed via REST contract.
- **API Service Layer**: All backend calls go through `apiService.ts` (centralized, interceptors for auth).
- **Observable Pattern**: Context/hooks for state; no tight coupling to server state.
- **Fully Independent Deploy**: Frontend bundle (Vite) can deploy anywhere; backend is a separate API.

## 🔄 Workflow: Monorepo Commands

```bash
# Install all packages and their dependencies
npm install

# Run both dev servers in parallel
npm run dev

# Run just backend (nodemon)
npm run dev:backend

# Run just frontend (Vite)
npm run dev:frontend

# Build frontend for production
npm run build:frontend

# Preview production build
npm run preview
```

## 🛣️ Routing in Backend

All routes prefixed with `/api`:

```javascript
// src/server.js
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/appointments', appointmentRoutes);
// ...
app.use('/api', apiRouter);
```

Example: `POST /api/patients` → `patientRoutes` → `patientController.createPatient()`

## 🔐 Security & Best Practices

### Backend
- ✅ JWT tokens in Authorization header
- ✅ Middleware for auth & error handling
- ✅ Validation at controller layer (express-validator)
- ✅ CORS configured for frontend origin
- ✅ Mongoose schema validation

### Frontend
- ✅ Protected routes check user role
- ✅ API interceptor adds token to headers
- ✅ 401 response redirects to login
- ✅ Toast notifications for errors

## 📈 Scaling Path

### Service Layer Expansion
1. **Appointment Service**: Already a candidate (currently in controller)
2. **Doctor Service**: Extract from userController
3. **Consultation Service**: Create from consultationController
4. **Payment/Billing Service**: New domain

### Domain Models (Next Phase)
```javascript
// src/domain/entities/Patient.js
export class Patient {
  constructor(id, email, nom, prenom, dateNaissance, ...) {
    this.id = id;
    this.email = email;
    // ... validation rules here
  }
  
  isAdult() { /* business logic */ }
  hasValidSecu() { /* business logic */ }
}
```

### Repository Interfaces
```javascript
// src/domain/interfaces/PatientRepository.js
export class IPatientRepository {
  find(query, sort, skip, limit) { throw new Error('Not impl'); }
  create(data) { throw new Error('Not impl'); }
  // ...
}

// src/infrastructure/repositories/patientRepository.js
export class MongoPatientRepository extends IPatientRepository {
  find(query, sort, skip, limit) {
    return Patient.find(query)...
  }
}
```

### Testing Integration
```javascript
// tests/unit/services/patientService.test.js
import { patientService } from '../../src/application/services/patientService.js';

describe('Patient Service', () => {
  it('should create patient with valid data', async () => {
    const patient = await patientService.create({
      email: 'test@clinic.com',
      nom: 'Doe',
      prenom: 'John',
    });
    expect(patient.email).toBe('test@clinic.com');
  });
});
```

## 🚀 Deployment

### Backend
```bash
cd packages/backend
npm run start     # Or: NODE_ENV=production node src/server.js
```

### Frontend
```bash
cd packages/frontend
npm run build     # Creates dist/
# Deploy dist/ to CDN/static host
```

Both can scale independently:
- Backend scales horizontally (load balancer, replicas)
- Frontend is static assets (CDN, cache)

## 📊 Code Organization Summary

| Layer | File Location | Responsibility | Example |
|-------|---------------|-----------------|---------|
| **Presentation** | `controllers/` | Parse request, call service, respond | `patientController.createPatient()` |
| **Application** | `application/services/` | Business logic, orchestration | `patientService.create()` validates & calls repo |
| **Domain** | `domain/` (future) | Business rules, entities | `Patient` class with `isAdult()` |
| **Infrastructure** | `infrastructure/repositories/` | Data access, external APIs | `patientRepository.find()` → Mongoose query |
| **Config** | `config/`, `models/` | Schemas, env, database | `Patient` Mongoose model |

## ✅ Principles Applied

- ✅ **Single Responsibility**: Each layer has one reason to change
- ✅ **Dependency Inversion**: Services depend on repositories by interface (future)
- ✅ **Separation of Concerns**: Frontend and backend independent
- ✅ **Repository Pattern**: Database abstraction allows easy testing
- ✅ **Error Handling**: Centralized middleware catches all errors
- ✅ **API Decoupling**: Frontend consumes stable REST contract, not internal code

This architecture scales from a 2-3 person team to 10+ engineers working in parallel.
