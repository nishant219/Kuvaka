import mongoose, { Schema, Document } from 'mongoose';
import { IScoringResult } from '../types';

export interface ILeadDocument extends IScoringResult, Document {
  userId: string;
  offerId: string;
  batchId: string;
}

const leadSchema = new Schema<ILeadDocument>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    linkedin_bio: { type: String, default: '', trim: true },
    intent: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      required: true,
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    reasoning: { type: String, required: true },
    ruleScore: { type: Number, required: true, min: 0, max: 50 },
    aiScore: { type: Number, required: true, min: 0, max: 50 },
    userId: { type: String, required: true, index: true },
    offerId: { type: String, required: true, index: true },
    batchId: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ userId: 1, batchId: 1 });
leadSchema.index({ userId: 1, offerId: 1 });

export const Lead = mongoose.model<ILeadDocument>('Lead', leadSchema);
