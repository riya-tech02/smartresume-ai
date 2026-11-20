// Constants
export { TEMPLATE_IDS, TEMPLATES, DEFAULT_TEMPLATE_ID } from './constants/templates.js';
export type { TemplateId, TemplateMeta } from './constants/templates.js';
export { SECTION_TYPES, UNIQUE_SECTION_TYPES, SECTION_LABELS } from './constants/sectionTypes.js';
export type { SectionType } from './constants/sectionTypes.js';
export { LIMITS, ACCENT_PALETTE, FONT_SCALES, SPACING_OPTIONS } from './constants/limits.js';
export type { FontScale, SpacingOption } from './constants/limits.js';

// Schemas
export {
  registerSchema, loginSchema, changePasswordSchema,
  updateProfileSchema, deleteAccountSchema,
} from './schemas/auth.js';
export type {
  RegisterInput, LoginInput, ChangePasswordInput,
  UpdateProfileInput, DeleteAccountInput,
} from './schemas/auth.js';

export {
  personalInfoSchema, sectionSchema, linkSchema,
  educationEntrySchema, experienceEntrySchema, projectEntrySchema,
  certificationEntrySchema, achievementEntrySchema, languageEntrySchema,
  skillGroupSchema, customEntrySchema,
} from './schemas/section.js';
export type {
  Section, SummaryData, PersonalInfo, Link,
  EducationEntry, ExperienceEntry, ProjectEntry,
  CertificationEntry, AchievementEntry, LanguageEntry,
  SkillGroup, CustomEntry,
} from './schemas/section.js';

export {
  resumeSettingsSchema, createResumeSchema, updateResumeSchema,
  duplicateResumeSchema, listResumesSchema,
} from './schemas/resume.js';
export type {
  ResumeSettings, CreateResumeInput, UpdateResumeInput,
  DuplicateResumeInput, ListResumesInput,
} from './schemas/resume.js';

export { AI_FEATURES, aiSuggestSchema, aiSuggestionWarning, aiSuggestionMeta } from './schemas/ai.js';
export type { AiFeature, AiSuggestInput, AiSuggestionWarning, AiSuggestionMeta } from './schemas/ai.js';

export { runAtsSchema, jobMatchSchema } from './schemas/ats.js';
export type { RunAtsInput, JobMatchInput } from './schemas/ats.js';

// Types
export type { ResumeData, ResumeSummary, User } from './types/resume.js';
export type { AtsReport, AtsCheck, Recommendation, KeywordHit, JobMatchResult } from './types/ats.js';
export { ATS_DISCLAIMER } from './types/ats.js';
export type {
  AiSuggestion,
  AiSuggestResponse,
  AiStatus,
} from './types/ai.js';
export type { ApiSuccess, ApiError, ApiResponse, PaginationMeta } from './types/api.js';
export { ERROR_CODES } from './types/api.js';
export type { ErrorCode } from './types/api.js';

// Functions
export { calculateCompleteness } from './completeness.js';
