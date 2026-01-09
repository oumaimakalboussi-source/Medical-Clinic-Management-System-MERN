# 🔧 Configuration Examples

## Environment Variables (.env)

### Development Configuration
```env
# Database
MONGODB_URI=mongodb://localhost:27017/clinic-management

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=dev-secret-key-change-in-production-use-strong-random-32-chars-min
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### Production Configuration (Heroku/AWS/DigitalOcean)
```env
# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/clinic-management?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# JWT (Use strong random key!)
JWT_SECRET=your-strong-random-secret-key-at-least-32-characters-long
JWT_EXPIRE=7d

# CORS (Your production domain)
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=error
```

### Testing Configuration
```env
# Database (Separate test DB)
MONGODB_URI=mongodb://localhost:27017/clinic-management-test

# Server
PORT=5001
NODE_ENV=test

# JWT
JWT_SECRET=test-secret-key-for-testing
JWT_EXPIRE=1h

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=error
```

---

## JWT Configuration

### Token Payload Example
```javascript
{
  "id": "507f1f77bcf86cd799439011",      // User MongoDB ID
  "role": "doctor",                       // User role
  "iat": 1704618000,                      // Issued at timestamp
  "exp": 1705222800                       // Expiration timestamp (7 days)
}
```

### JWT Options
```javascript
{
  algorithm: "HS256",                     // HMAC SHA-256
  expiresIn: "7d",                        // 7 days
  issuer: "clinic-management-system"      // Optional: add issuer
}
```

---

## MongoDB Connection Examples

### Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/clinic-management
```

### MongoDB Atlas (Cloud)
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.abcde.mongodb.net/clinic-management?retryWrites=true&w=majority
```

### MongoDB with Authentication
```env
MONGODB_URI=mongodb://username:password@host:27017/clinic-management?authSource=admin
```

### MongoDB Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:5.0
```

---

## CORS Configuration Examples

### Development (Allow All)
```javascript
cors({
  origin: "http://localhost:5173",
  credentials: true
})
```

### Production (Specific Domain)
```javascript
cors({
  origin: "https://clinic.example.com",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### Multiple Domains
```javascript
cors({
  origin: [
    "https://clinic.example.com",
    "https://admin.clinic.example.com",
    "http://localhost:5173"
  ],
  credentials: true
})
```

---

## Nginx Reverse Proxy Configuration

For production deployment:

```nginx
upstream backend {
  server localhost:5000;
  server localhost:5001;  # Load balancing
}

server {
  listen 80;
  server_name api.clinic.example.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.clinic.example.com;

  # SSL Certificates
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  # Security Headers
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;

  # Compression
  gzip on;
  gzip_types application/json;

  # Rate Limiting
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
  limit_req zone=api_limit burst=20;

  location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support (if needed)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

---

## Docker Configuration

### Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY scripts ./scripts

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["node", "src/server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/clinic-management
      NODE_ENV: development
      JWT_SECRET: dev-secret-key
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      - mongodb
    volumes:
      - ./src:/app/src

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: clinic-management

volumes:
  mongodb_data:
```

---

## Request/Response Examples

### Login Request
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@clinic.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@clinic.com",
      "nom": "Admin",
      "prenom": "System",
      "role": "admin",
      "telephone": "+212 5XX-XXX-XXX"
    }
  }
}
```

### Create Patient Request
```bash
POST /api/patients
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "email": "john.doe@example.com",
  "nom": "Doe",
  "prenom": "John",
  "dateNaissance": "1990-05-15",
  "sexe": "male",
  "telephone": "+212 612345678",
  "adresse": "123 Main St, City",
  "numeroSecu": "SEU-123-456-789",
  "mutuelle": "Mutuelle Plus",
  "allergies": "Peanuts",
  "antecedents": "None"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "john.doe@example.com",
    "nom": "Doe",
    "prenom": "John",
    "dateNaissance": "1990-05-15T00:00:00.000Z",
    "sexe": "male",
    "telephone": "+212 612345678",
    "adresse": "123 Main St, City",
    "numeroSecu": "SEU-123-456-789",
    "mutuelle": "Mutuelle Plus",
    "allergies": "Peanuts",
    "antecedents": "None",
    "createdAt": "2024-01-07T10:30:00.000Z",
    "updatedAt": "2024-01-07T10:30:00.000Z"
  }
}
```

### Pagination Example
```bash
GET /api/patients?page=2&limit=20&sortBy=nom&order=asc
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Patients retrieved successfully",
  "data": [ /* 20 patient objects */ ],
  "pagination": {
    "total": 47,
    "page": 2,
    "limit": 20,
    "pages": 3
  }
}
```

---

## Error Response Examples

### 400 Bad Request (Validation)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "nom",
      "message": "Last name is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Please provide a valid JWT token."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Required roles: admin. Your role: patient"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Patient not found"
}
```

### 409 Conflict (Duplicate)
```json
{
  "success": false,
  "message": "email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Test Data Seeds

After running `npm run seed`, you'll have:

**Admin User:**
- Email: `admin@clinic.com`
- Password: `admin123`
- Role: `admin`

**Doctor Users:**
- Email: `dr.ahmed@clinic.com` | Password: `doctor123`
- Email: `dr.fatima@clinic.com` | Password: `doctor123`

**Secretary User:**
- Email: `secretary@clinic.com`
- Password: `secretary123`

**Patient Users:**
- Email: `patient@clinic.com` | Password: `patient123`
- Email: `sarah@clinic.com` | Password: `patient123`
- Email: `michael@clinic.com` | Password: `patient123`

---

## Postman Setup

### Import Collection
1. Open Postman
2. Click "Import"
3. Select `POSTMAN_COLLECTION.json`
4. Choose workspace

### Set Variables
1. Click "Environments" → Create new
2. Add variables:
   ```
   baseUrl: http://localhost:5000/api
   token: (leave empty, will be filled from login)
   ```

### Create Pre-request Script
In collection settings, add:
```javascript
if (pm.response.code === 200 && pm.response.json().data.token) {
  pm.environment.set("token", pm.response.json().data.token);
}
```

---

## Database Monitoring

### MongoDB Atlas Monitoring
```javascript
// Check connection status
db.adminCommand({ ping: 1 })

// View database stats
db.stats()

// Check indexes
db.patients.getIndexes()

// Monitor performance
db.system.profile.find().pretty()
```

---

## Logging Configuration

### Development Logging
```javascript
// Morgan format
app.use(morgan('dev'));  // Shows: GET /api/patients 200 50ms
```

### Production Logging
```javascript
// Morgan format
app.use(morgan('combined'));  // Apache combined log format

// Or use custom format
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'));
```

---

**For complete API documentation, see README.md**  
**For deployment guide, see ARCHITECTURE.md**
