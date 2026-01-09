import mongoose from 'mongoose';

/**
 * Doctor Schema
 * Extended user model for medical professionals
 */

const doctorSchema = new mongoose.Schema(
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
    specialite: {
      type: String,
      trim: true,
    },
    numeroOrdre: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    telephone: {
      type: String,
      trim: true,
    },
    cabinet: {
      type: String,
      trim: true,
    },
    horairesConsultation: {
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

doctorSchema.index({ email: 1 });
doctorSchema.index({ specialite: 1 });

export default mongoose.model('Doctor', doctorSchema);
