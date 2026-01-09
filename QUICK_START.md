# Quick Start Guide - Monorepo Development

## 🚀 Get Up and Running

### Initial Setup
```bash
# Install all dependencies (workspace root + packages)
npm install
```

### Development Servers
```bash
# Start both backend (port 5000) and frontend (port 5173) in parallel
npm run dev

# OR run them separately in different terminals:
npm run dev:backend    # Backend only (http://localhost:5000)
npm run dev:frontend   # Frontend only (http://localhost:5173)
```

### Production Build
```bash
# Build frontend for production
npm run build:frontend

# Preview production build locally
npm run preview
```

## 🏗️ Architecture at a Glance

### Backend (Node.js + Express + MongoDB)
```
packages/backend/src/
├── controllers/         # HTTP handlers → delegate to services
├── routes/             # Express route definitions
├── application/        # Business logic (services)
├── infrastructure/     # Data access (repositories)
├── models/            # Mongoose schemas
├── middleware/        # Auth, validation, error handling
├── config/            # DB connection, JWT secrets
└── utils/             # Helpers (pagination, sorting, etc.)
```

**Flow**: Request → Controller → Service → Repository → MongoDB

### Frontend (React + Vite + TypeScript)
```
packages/frontend/src/
├── pages/             # Route components
├── components/        # Reusable UI blocks
├── context/          # Global state (Auth, Notifications)
├── services/         # API client (axios + interceptors)
└── assets/           # Images, styles
```

**Flow**: User Action → Component → Context/Service → API Call → Backend

## 📝 Developing a New Feature

### Example: Create "Medication" Service Layer (like Patient)

1. **Repository** (`packages/backend/src/infrastructure/repositories/medicationRepository.js`)
   ```javascript
   import Medication from '../../models/Medication.js'
   
   export const medicationRepository = {
     async find(query, sort, skip, limit) {
       return Medication.find(query).sort(sort).skip(skip).limit(limit)
     },
     async create(data) {
       return Medication.create(data)
     },
     // ... other methods
   }
   ```

2. **Service** (`packages/backend/src/application/services/medicationService.js`)
   ```javascript
   import { medicationRepository } from '../../infrastructure/repositories/medicationRepository.js'
   
   export const medicationService = {
     async list(params) {
       // Business logic: pagination, validation, error handling
     },
     async create(data) {
       // Validate & delegate to repository
     },
     // ... other methods
   }
   ```

3. **Controller** (`packages/backend/src/controllers/medicationController.js`)
   ```javascript
   import { medicationService } from '../application/services/medicationService.js'
   
   export const createMedication = asyncHandler(async (req, res) => {
     const medication = await medicationService.create(req.body)
     res.status(201).json({ success: true, data: medication })
   })
   ```

## 🔌 API Endpoints

All endpoints prefixed with `/api`:

```
POST   /api/auth/login                    # Login
GET    /api/patients                      # List patients
POST   /api/patients                      # Create patient
GET    /api/patients/:id                  # Get patient
PUT    /api/patients/:id                  # Update patient
DELETE /api/patients/:id                  # Delete patient
GET    /api/patients/search?q=<query>     # Search patients
```

## 🔐 Authentication

1. **Login**: POST `/api/auth/login` with `{ email, password }`
2. **Get Token**: Response includes `token` in JWT format
3. **Use Token**: Frontend stores in localStorage; API service auto-includes in `Authorization: Bearer <token>` header
4. **Token Refresh**: Handled by interceptor on 401 response

## 📦 Workspace Commands Reference

| Command | What it does |
|---------|-------------|
| `npm install` | Install all packages + dependencies |
| `npm run dev` | Start both backend and frontend |
| `npm run dev:backend` | Start backend only (nodemon watch mode) |
| `npm run dev:frontend` | Start frontend only (Vite dev server) |
| `npm run build:frontend` | Build frontend for production (dist/) |
| `npm run preview` | Preview production build locally |

## 🧪 Testing (Future Setup)

```bash
# Backend unit tests
npm run test -w packages/backend

# Frontend component tests
npm run test -w packages/frontend
```

## 🐛 Debugging

### Backend
```bash
# Run with debugging enabled
node --inspect-brk packages/backend/src/server.js

# Or use your IDE debugger (VSCode: attach to localhost:9229)
```

### Frontend
```bash
# Open browser DevTools (F12) and check Console/Network tabs
# Vite provides fast source maps for debugging
```

## 📚 Related Docs

- [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) - Deep dive into layers & patterns
- [packages/backend/README.md](./packages/backend/README.md) - Backend API docs
- [packages/frontend/README.md](./packages/frontend/README.md) - Frontend features & setup (coming soon)

## ❓ Common Issues

### Backend fails to start
```bash
# Check MongoDB is running
mongod

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend doesn't load
```bash
# Check environment variable
cat .env.local  # Should have VITE_API_URL=http://localhost:5000/api

# Hard refresh browser (Ctrl+Shift+R) to clear cache
```

### Port already in use
```bash
# Backend running on 5000? Find and kill:
lsof -ti:5000 | xargs kill -9

# Frontend on 5173? Find and kill:
lsof -ti:5173 | xargs kill -9
```

---

**Happy coding!** 🎉
