import mongoose from 'mongoose';

/**
 * Patient Schema
 * Extended user model with medical information
 */

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    prenom: {
      type: String,
      required: true,
      trim: true,
    },
    dateNaissance: {
      type: Date,
      required: false,
    },
    sexe: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: false,
    },
    telephone: {
      type: String,
      trim: true,
    },
    adresse: {
      type: String,
      trim: true,
    },
    numeroSecu: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined values but enforce uniqueness on non-null values
      trim: true,
    },
    mutuelle: {
      type: String,
      trim: true,
    },
    allergies: {
      type: String,
      trim: true,
    },
    antecedents: {
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

// Index for faster searches
patientSchema.index({ email: 1 });
patientSchema.index({ nom: 1, prenom: 1 });

export default mongoose.model('Patient', patientSchema);
