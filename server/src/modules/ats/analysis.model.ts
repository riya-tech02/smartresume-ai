import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnalysis extends Document {
  userId: Types.ObjectId;
  resumeId: Types.ObjectId;
  type: 'ats' | 'job-match';
  hasJobDescription: boolean;
  jobTitle?: string;
  company?: string;
  jobDescriptionHash?: string;
  result: Record<string, unknown>;
  overall?: number;
  createdAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    type: { type: String, enum: ['ats', 'job-match'], required: true },
    hasJobDescription: { type: Boolean, default: false },
    jobTitle: { type: String, default: '' },
    company: { type: String, default: '' },
    jobDescriptionHash: { type: String, default: '' },
    result: { type: Schema.Types.Mixed, required: true },
    overall: { type: Number, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        ret.userId = String(ret.userId);
        ret.resumeId = String(ret.resumeId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

AnalysisSchema.index({ resumeId: 1, type: 1, createdAt: -1 });

export const AnalysisModel = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
