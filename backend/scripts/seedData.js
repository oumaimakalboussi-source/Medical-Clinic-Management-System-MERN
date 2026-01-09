import 'dotenv/config.js';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from '../src/models/User.js';
import Patient from '../src/models/Patient.js';
import Doctor from '../src/models/Doctor.js';
import Secretary from '../src/models/Secretary.js';
import Medication from '../src/models/Medication.js';
import Appointment from '../src/models/Appointment.js';
import Consultation from '../src/models/Consultation.js';
import Prescription from '../src/models/Prescription.js';

/**
 * Seed Data Script
 * Populates MongoDB with test data for development
 * Run with: npm run seed
 */

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic-management';

    // Connect to database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Secretary.deleteMany({}),
      Medication.deleteMany({}),
      Appointment.deleteMany({}),
      Consultation.deleteMany({}),
      Prescription.deleteMany({}),
    ]);

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@clinic.com',
      password: 'admin123',
      nom: 'Admin',
      prenom: 'System',
      role: 'admin',
      telephone: '+212 5XX-XXX-XXX',
      status: 'active',
    });

    console.log('✓ Admin user created:', adminUser.email);

    // Create doctor users
    const doctors = await User.insertMany([
      {
        email: 'dr.ahmed@clinic.com',
        password: 'doctor123',
        nom: 'Ahmed',
        prenom: 'Dr.',
        role: 'doctor',
        telephone: '+212 6XX-XXX-XXX',
        status: 'active',
      },
      {
        email: 'dr.fatima@clinic.com',
        password: 'doctor123',
        nom: 'Fatima',
        prenom: 'Dr.',
        role: 'doctor',
        telephone: '+212 6XX-XXX-XXY',
        status: 'active',
      },
    ]);

    console.log('✓ Doctor users created:', doctors.length);

    // Create doctor profiles
    const doctorProfiles = await Doctor.insertMany([
      {
        userId: doctors[0]._id,
        email: doctors[0].email,
        nom: doctors[0].nom,
        prenom: doctors[0].prenom,
        specialite: 'General Practitioner',
        numeroOrdre: 'ORD-001',
        telephone: doctors[0].telephone,
        cabinet: 'Cabinet Medical Centre',
        horairesConsultation: 'Monday to Friday 09:00-17:00',
      },
      {
        userId: doctors[1]._id,
        email: doctors[1].email,
        nom: doctors[1].nom,
        prenom: doctors[1].prenom,
        specialite: 'Pediatrician',
        numeroOrdre: 'ORD-002',
        telephone: doctors[1].telephone,
        cabinet: 'Cabinet Medical Centre',
        horairesConsultation: 'Tuesday to Saturday 10:00-18:00',
      },
    ]);

    console.log('✓ Doctor profiles created:', doctorProfiles.length);

    // Create secretary users
    const secretaries = await User.insertMany([
      {
        email: 'secretary@clinic.com',
        password: 'secretary123',
        nom: 'Secretary',
        prenom: 'Main',
        role: 'secretary',
        telephone: '+212 6XX-XXX-XXZ',
        status: 'active',
      },
    ]);

    console.log('✓ Secretary users created:', secretaries.length);

    // Create secretary profiles
    const secretaryProfiles = await Secretary.insertMany([
      {
        userId: secretaries[0]._id,
        email: secretaries[0].email,
        nom: secretaries[0].nom,
        prenom: secretaries[0].prenom,
        telephone: secretaries[0].telephone,
        departement: 'Reception',
      },
    ]);

    console.log('✓ Secretary profiles created:', secretaryProfiles.length);

    // Create patient users
    const patients = await User.insertMany([
      {
        email: 'patient@clinic.com',
        password: 'patient123',
        nom: 'Martin',
        prenom: 'John',
        role: 'patient',
        telephone: '+212 6XX-YYY-YYY',
        status: 'active',
      },
      {
        email: 'sarah@clinic.com',
        password: 'patient123',
        nom: 'Johnson',
        prenom: 'Sarah',
        role: 'patient',
        telephone: '+212 6XX-ZZZ-ZZZ',
        status: 'active',
      },
      {
        email: 'michael@clinic.com',
        password: 'patient123',
        nom: 'Williams',
        prenom: 'Michael',
        role: 'patient',
        telephone: '+212 6XX-AAA-AAA',
        status: 'active',
      },
    ]);

    console.log('✓ Patient users created:', patients.length);

    // Create patient profiles
    const patientProfiles = await Patient.insertMany([
      {
        userId: patients[0]._id,
        email: patients[0].email,
        nom: patients[0].nom,
        prenom: patients[0].prenom,
        dateNaissance: new Date('1990-05-15'),
        sexe: 'male',
        telephone: patients[0].telephone,
        adresse: '123 Main St, City',
        numeroSecu: 'SEU-123-456-789',
        mutuelle: 'Mutuelle Plus',
        allergies: 'Peanuts',
        antecedents: 'None',
      },
      {
        userId: patients[1]._id,
        email: patients[1].email,
        nom: patients[1].nom,
        prenom: patients[1].prenom,
        dateNaissance: new Date('1988-03-22'),
        sexe: 'female',
        telephone: patients[1].telephone,
        adresse: '456 Oak Ave, City',
        numeroSecu: 'SEU-987-654-321',
        mutuelle: 'CIMR',
        allergies: 'Penicillin',
        antecedents: 'Hypertension',
      },
      {
        userId: patients[2]._id,
        email: patients[2].email,
        nom: patients[2].nom,
        prenom: patients[2].prenom,
        dateNaissance: new Date('1995-11-10'),
        sexe: 'male',
        telephone: patients[2].telephone,
        adresse: '789 Pine Rd, City',
        numeroSecu: 'SEU-456-789-123',
        mutuelle: 'CNSS',
        allergies: 'None',
        antecedents: 'Asthma',
      },
    ]);

    console.log('✓ Patient profiles created:', patientProfiles.length);

    // Create medications
    const medications = await Medication.insertMany([
      {
        name: 'Ibuprofen',
        description: 'Pain reliever and fever reducer',
        composition: '400mg per tablet',
        dosageOptions: ['200mg', '400mg', '600mg', '800mg'],
        sideEffects: 'Stomach upset, headache',
        contraindications: 'Allergic to NSAIDs, active ulcers',
        manufacturer: 'Generic Pharma Inc.',
      },
      {
        name: 'Amoxicillin',
        description: 'Antibiotic for bacterial infections',
        composition: 'Amoxicillin trihydrate 500mg',
        dosageOptions: ['250mg', '500mg', '1000mg'],
        sideEffects: 'Rash, diarrhea, nausea',
        contraindications: 'Allergic to penicillin',
        manufacturer: 'Generic Pharma Inc.',
      },
      {
        name: 'Metformin',
        description: 'Diabetes medication',
        composition: 'Metformin HCl 500mg',
        dosageOptions: ['500mg', '850mg', '1000mg'],
        sideEffects: 'Gastrointestinal upset',
        contraindications: 'Severe kidney disease',
        manufacturer: 'Generic Pharma Inc.',
      },
      {
        name: 'Lisinopril',
        description: 'Blood pressure medication',
        composition: 'Lisinopril 10mg',
        dosageOptions: ['5mg', '10mg', '20mg'],
        sideEffects: 'Dizziness, dry cough',
        contraindications: 'Pregnancy, history of angioedema',
        manufacturer: 'Generic Pharma Inc.',
      },
      {
        name: 'Omeprazole',
        description: 'Stomach acid reducer',
        composition: 'Omeprazole 20mg',
        dosageOptions: ['10mg', '20mg', '40mg'],
        sideEffects: 'Headache, abdominal pain',
        contraindications: 'Severe liver disease',
        manufacturer: 'Generic Pharma Inc.',
      },
    ]);

    console.log('✓ Medications created:', medications.length);

    // Create appointments
    const appointments = await Appointment.insertMany([
      {
        patientId: patientProfiles[0]._id,
        doctorId: doctorProfiles[0]._id,
        dateTime: new Date('2024-01-15T10:00:00'),
        reason: 'General check-up',
        status: 'confirmed',
        notes: 'Patient needs blood pressure check',
      },
      {
        patientId: patientProfiles[1]._id,
        doctorId: doctorProfiles[0]._id,
        dateTime: new Date('2024-01-16T14:30:00'),
        reason: 'Back pain consultation',
        status: 'confirmed',
        notes: 'Patient reports lower back pain',
      },
      {
        patientId: patientProfiles[2]._id,
        doctorId: doctorProfiles[1]._id,
        dateTime: new Date('2024-01-17T11:00:00'),
        reason: 'Pediatric check-up',
        status: 'pending',
        notes: 'Regular child check-up',
      },
    ]);

    console.log('✓ Appointments created:', appointments.length);

    // Create consultations
    const consultations = await Consultation.insertMany([
      {
        appointmentId: appointments[0]._id,
        patientId: patientProfiles[0]._id,
        doctorId: doctorProfiles[0]._id,
        dateTime: appointments[0].dateTime,
        diagnosis: 'Hypertension Stage 1',
        treatment: 'Start antihypertensive medication',
        notes: 'Patient to return for follow-up in 2 weeks',
        status: 'completed',
      },
      {
        appointmentId: appointments[1]._id,
        patientId: patientProfiles[1]._id,
        doctorId: doctorProfiles[0]._id,
        dateTime: appointments[1].dateTime,
        diagnosis: 'Acute lower back strain',
        treatment: 'Rest, physical therapy, pain management',
        notes: 'Patient advised on ergonomics and stretching exercises',
        status: 'completed',
      },
    ]);

    console.log('✓ Consultations created:', consultations.length);

    // Create prescriptions
    const prescriptions = await Prescription.insertMany([
      {
        consultationId: consultations[0]._id,
        patientId: patientProfiles[0]._id,
        doctorId: doctorProfiles[0]._id,
        medications: [
          {
            medicationId: medications[3]._id, // Lisinopril
            medicationName: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            notes: 'Take in the morning',
          },
        ],
        notes: 'Continue regular monitoring of blood pressure',
        status: 'issued',
      },
      {
        consultationId: consultations[1]._id,
        patientId: patientProfiles[1]._id,
        doctorId: doctorProfiles[0]._id,
        medications: [
          {
            medicationId: medications[0]._id, // Ibuprofen
            medicationName: 'Ibuprofen',
            dosage: '400mg',
            frequency: 'Three times daily',
            duration: '7 days',
            notes: 'Take with food',
          },
        ],
        notes: 'Physical therapy recommended',
        status: 'issued',
      },
    ]);

    console.log('✓ Prescriptions created:', prescriptions.length);

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║            ✓ Database Seeded Successfully!              ║
║                                                           ║
║  Test Credentials:                                        ║
║  ─────────────────────────────────────────────────────   ║
║  Admin:     admin@clinic.com / admin123                  ║
║  Doctor:    dr.ahmed@clinic.com / doctor123              ║
║  Secretary: secretary@clinic.com / secretary123           ║
║  Patient:   patient1@clinic.com / patient123              ║
║                                                           ║
║  Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic-management'}
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
