import mongoose from 'mongoose';

/**
 * Medication Schema
 * Medicines database for prescriptions
 */

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    composition: {
      type: String,
      trim: true,
    },
    dosageOptions: {
      type: [String], // e.g., ["100mg", "250mg", "500mg"]
      default: [],
    },
    sideEffects: {
      type: String,
      trim: true,
    },
    contraindications: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
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

medicationSchema.index({ name: 1 });

export default mongoose.model('Medication', medicationSchema);
