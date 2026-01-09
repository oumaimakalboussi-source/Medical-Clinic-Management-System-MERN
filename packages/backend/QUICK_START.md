# 🚀 Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your MongoDB URI and settings.

### Step 3: Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### Step 4: Seed Database
```bash
npm run seed
```

### Step 5: Start Server
```bash
npm run dev
```

Server will be available at: `http://localhost:5000`

---

## 🔑 Test Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.com | admin123 |
| Doctor | dr.ahmed@clinic.com | doctor123 |
| Secretary | secretary@clinic.com | secretary123 |
| Patient | patient1@clinic.com | patient123 |

---

## 📱 Frontend Configuration

Update your React frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

The frontend automatically:
- Reads API base URL from env
- Adds JWT tokens to requests via interceptor
- Redirects to login on 401 errors

---

## 📊 Database Collections

After seeding, MongoDB will have:
- **Users**: 5 (1 admin, 2 doctors, 1 secretary, 1 patient)
- **Patients**: 3 profiles
- **Doctors**: 2 profiles
- **Medications**: 5 sample medications
- **Appointments**: 3 bookings
- **Consultations**: 2 records
- **Prescriptions**: 2 issued

---

## 🧪 Quick API Test

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.com",
    "password": "admin123"
  }'
```

Copy the `token` from response.

### 2. Get Patients
```bash
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 3. Create Patient
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newpatient@example.com",
    "nom": "Smith",
    "prenom": "Alice",
    "dateNaissance": "1985-05-10",
    "sexe": "female",
    "telephone": "+212 6XX-XXX-XXX"
  }'
```

---

## 🛠️ Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB or use MongoDB Atlas connection string

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in `.env` or kill process using port 5000

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Update `CORS_ORIGIN` in `.env` to match frontend URL

### Invalid Token
```
Invalid token: jwt malformed
```
**Solution**: 
- Re-login to get new token
- Ensure token hasn't expired
- Check JWT_SECRET in .env

---

## 📚 Additional Resources

- Full API Documentation: See [README.md](./README.md)
- Postman Collection: [POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json)
- Import to Postman: File → Import → Select JSON

---

## 🎯 Next Steps

1. ✅ Backend running
2. ✅ Database seeded
3. → Run frontend: `npm run dev` (in parent directory)
4. → Test in browser: `http://localhost:5173`
5. → Explore API with Postman Collection

---

**Need Help?** Check the main README.md for complete documentation and troubleshooting.
