import mongoose from 'mongoose';

/**
 * Consultation Schema
 * Medical consultations linked to appointments
 */

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Consultation date and time is required'],
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    treatment: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'cancelled'],
      default: 'in-progress',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

consultationSchema.index({ patientId: 1 });
consultationSchema.index({ doctorId: 1 });
consultationSchema.index({ appointmentId: 1 });

export default mongoose.model('Consultation', consultationSchema);
