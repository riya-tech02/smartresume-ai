import React from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { Input } from '../../../components/ui/Input';
import { User, Mail, Phone, MapPin, Briefcase, Globe, Linkedin, Github } from 'lucide-react';
import type { PersonalInfo } from '@smartresume/shared';

export function PersonalInfoEditor() {
  const personalInfo = useEditorStore((s) => s.resume?.personalInfo);
  const updatePersonalInfo = useEditorStore((s) => s.updatePersonalInfo);

  if (!personalInfo) return null;

  const links = personalInfo.links || [];

  const getLinkUrl = (label: string): string => {
    return links.find((l) => l.label.toLowerCase() === label.toLowerCase())?.url || '';
  };

  const setLinkUrl = (label: string, url: string) => {
    const existingIndex = links.findIndex((l) => l.label.toLowerCase() === label.toLowerCase());
    let updatedLinks = [...links];
    if (existingIndex >= 0) {
      if (!url.trim()) {
        updatedLinks = updatedLinks.filter((_, i) => i !== existingIndex);
      } else {
        const existingLink = updatedLinks[existingIndex];
        if (!existingLink) return;
        updatedLinks[existingIndex] = {
          id: existingLink.id || `link_${crypto.randomUUID().slice(0, 8)}`,
          label,
          url: url.trim(),
        };
      }
    } else if (url.trim()) {
      updatedLinks.push({
        id: `link_${crypto.randomUUID().slice(0, 8)}`,
        label,
        url: url.trim(),
      });
    }
    updatePersonalInfo({ links: updatedLinks });
  };

  const handleChange = (field: keyof Omit<PersonalInfo, 'links'>, value: string) => {
    updatePersonalInfo({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-text uppercase tracking-wider">
          Personal Information
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Your contact information and headline. This appears at the very top of your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-text mb-1.5">
            Full Name <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={personalInfo.fullName || ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Professional Headline */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-text mb-1.5">
            Professional Headline / Title
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={personalInfo.headline || ''}
              onChange={(e) => handleChange('headline', e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer | React & Node.js"
              className="pl-9"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            Email Address <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="email"
              value={personalInfo.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="alex@example.com"
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={personalInfo.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="pl-9"
            />
          </div>
        </div>

        {/* Location */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-text mb-1.5">
            Location
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={personalInfo.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="San Francisco, CA (or Remote)"
              className="pl-9"
            />
          </div>
        </div>

        {/* Portfolio / Website */}
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            Personal Website / Portfolio
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={getLinkUrl('Portfolio')}
              onChange={(e) => setLinkUrl('Portfolio', e.target.value)}
              placeholder="https://alexmorgan.dev"
              className="pl-9"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            LinkedIn Profile
          </label>
          <div className="relative">
            <Linkedin className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={getLinkUrl('LinkedIn')}
              onChange={(e) => setLinkUrl('LinkedIn', e.target.value)}
              placeholder="https://linkedin.com/in/alexmorgan"
              className="pl-9"
            />
          </div>
        </div>

        {/* GitHub */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-text mb-1.5">
            GitHub / Code Profile
          </label>
          <div className="relative">
            <Github className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={getLinkUrl('GitHub')}
              onChange={(e) => setLinkUrl('GitHub', e.target.value)}
              placeholder="https://github.com/alexmorgan"
              className="pl-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
