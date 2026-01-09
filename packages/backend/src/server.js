import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, disconnectDB } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import secretaryRoutes from './routes/secretaryRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware
 */

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

/**
 * API Routes
 * All routes prefixed with /api
 */

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/secretaries', secretaryRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/consultations', consultationRoutes);
apiRouter.use('/medications', medicationRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);

app.use('/api', apiRouter);

/**
 * Error Handling Middleware
 */

app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Server Startup
 */

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🏥 Clinic Management System Backend              ║
║                                                           ║
║  ✓ Server running on port ${PORT}                          ║
║  ✓ Environment: ${process.env.NODE_ENV || 'development'}                    ║
║  ✓ API Base URL: http://localhost:${PORT}/api            ║
║                                                           ║
║  Documentation:                                           ║
║  See README.md for API documentation and examples        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

startServer();

export default app;
