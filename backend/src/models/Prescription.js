import mongoose from 'mongoose';

/**
 * Prescription Schema
 * Prescriptions issued by doctors with multiple medications
 */

const prescriptionMedicationSchema = new mongoose.Schema(
  {
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    medicationName: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: [true, 'Consultation ID is required'],
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
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    medications: {
      type: [prescriptionMedicationSchema],
      required: true,
      validate: [
        (arr) => arr.length > 0,
        'At least one medication is required',
      ],
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'issued', 'completed'],
      default: 'draft',
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

prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ consultationId: 1 });
prescriptionSchema.index({ status: 1 });

export default mongoose.model('Prescription', prescriptionSchema);
