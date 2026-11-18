import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAiUsage extends Document {
  userId: Types.ObjectId;
  feature: string;
  provider: string;
  fallback: boolean;
  createdAt: Date;
}

const AiUsageSchema = new Schema<IAiUsage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    feature: { type: String, required: true },
    provider: { type: String, required: true },
    fallback: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// TTL index: 30 days
AiUsageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const AiUsageModel = mongoose.model<IAiUsage>('AiUsage', AiUsageSchema);
