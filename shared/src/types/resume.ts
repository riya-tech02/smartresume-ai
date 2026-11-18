import type { Section, PersonalInfo } from '../schemas/section.js';
import type { ResumeSettings } from '../schemas/resume.js';
import type { TemplateId } from '../constants/templates.js';

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  templateId: TemplateId;
  settings: ResumeSettings;
  personalInfo: PersonalInfo;
  sections: Section[];
  completion: number;
  lastAtsScore: number | null;
  revision: number;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSummary {
  id: string;
  title: string;
  templateId: TemplateId;
  completion: number;
  lastAtsScore: number | null;
  isSample: boolean;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  aiConsentAcceptedAt: string | null;
  createdAt: string;
}
