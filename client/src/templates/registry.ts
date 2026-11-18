import React from 'react';
import type { TemplateId, TemplateMeta, ResumeData, ResumeSettings } from '@smartresume/shared';
import { TEMPLATES } from '@smartresume/shared';
import { MinimalAtsTemplate } from './MinimalAts.js';
import { SoftwareEngineerTemplate } from './SoftwareEngineer.js';
import { FresherStudentTemplate } from './FresherStudent.js';
import { ModernProfessionalTemplate } from './ModernProfessional.js';

export { TEMPLATES as TEMPLATE_META };
export type { TemplateId, TemplateMeta };

export interface TemplateComponentProps {
  resume: ResumeData;
  settings?: ResumeSettings;
  showPageBreaks?: boolean;
  estimatedPages?: number;
}

export interface TemplateDefinition {
  meta: TemplateMeta;
  component: React.ComponentType<TemplateComponentProps>;
}

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  'minimal-ats': {
    meta: TEMPLATES.find((t) => t.id === 'minimal-ats')!,
    component: MinimalAtsTemplate as React.ComponentType<TemplateComponentProps>,
  },
  'software-engineer': {
    meta: TEMPLATES.find((t) => t.id === 'software-engineer')!,
    component: SoftwareEngineerTemplate as React.ComponentType<TemplateComponentProps>,
  },
  'fresher-student': {
    meta: TEMPLATES.find((t) => t.id === 'fresher-student')!,
    component: FresherStudentTemplate as React.ComponentType<TemplateComponentProps>,
  },
  'modern-professional': {
    meta: TEMPLATES.find((t) => t.id === 'modern-professional')!,
    component: ModernProfessionalTemplate as React.ComponentType<TemplateComponentProps>,
  },
};

export function getTemplate(templateId: TemplateId): TemplateDefinition {
  return TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY['minimal-ats'];
}

export function getTemplateComponent(templateId: TemplateId): React.ComponentType<TemplateComponentProps> {
  return getTemplate(templateId).component;
}
