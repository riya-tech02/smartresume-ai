import mongoose, { Schema, Document, Types, SchemaDefinitionProperty } from 'mongoose';
import type { ResumeData } from '@smartresume/shared';
import { ACCENT_PALETTE } from '@smartresume/shared';

export interface IResume extends Document, Omit<ResumeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    templateId: {
      type: String,
      required: true,
      enum: ['modern-professional', 'minimal-ats', 'software-engineer', 'fresher-student'],
      default: 'fresher-student',
    },
    settings: {
      accentColor: { type: String, default: ACCENT_PALETTE[0] },
      fontScale: { type: String, enum: ['sm', 'md', 'lg'], default: 'md' },
      spacing: { type: String, enum: ['compact', 'normal', 'relaxed'], default: 'normal' },
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      headline: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      links: [
        {
          id: { type: String, required: true },
          label: { type: String, required: true },
          url: { type: String, default: '' },
        },
      ],
    },
    sections: {
      type: [Schema.Types.Mixed],
      default: [],
    } as unknown as SchemaDefinitionProperty<IResume['sections']>,
    completion: { type: Number, default: 0, min: 0, max: 100 },
    lastAtsScore: { type: Number, default: null },
    revision: { type: Number, default: 1, min: 1 },
    isSample: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        ret.userId = String(ret.userId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

ResumeSchema.index({ userId: 1, updatedAt: -1 });
ResumeSchema.index({ userId: 1, title: 1 });

export const ResumeModel = mongoose.model<IResume>('Resume', ResumeSchema);
