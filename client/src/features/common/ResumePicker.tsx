import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { api } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Select } from '../../components/ui/Select.js';
import { FileText, ArrowRight, Plus } from 'lucide-react';
import type { ResumeSummary } from '@smartresume/shared';

interface GridResumePickerProps {
  title: string;
  description: string;
  targetRoute: (resumeId: string) => string;
  value?: never;
  onChange?: never;
  placeholder?: never;
}

interface SelectResumePickerProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  title?: never;
  description?: never;
  targetRoute?: never;
}

export type ResumePickerProps = GridResumePickerProps | SelectResumePickerProps;

export function ResumePicker(props: ResumePickerProps) {
  const navigate = useNavigate();
  const { data: resumes, isLoading } = useQuery<ResumeSummary[]>({
    queryKey: ['resumes'],
    queryFn: () => api.get<ResumeSummary[]>('/resumes?limit=50'),
  });
  const resumeList = resumes ?? [];

  // Dropdown Select mode
  if ('onChange' in props && props.onChange) {
    return (
      <Select
        value={props.value || ''}
        onChange={(e) => props.onChange!(e.target.value)}
        className="text-xs font-medium"
      >
        <option value="" disabled>
          {isLoading ? 'Loading resumes...' : props.placeholder || 'Select a resume...'}
        </option>
        {resumeList.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title} ({r.completion}% Complete{r.lastAtsScore !== null ? ` • ATS ${r.lastAtsScore}` : ''})
          </option>
        ))}
      </Select>
    );
  }

  // Grid Picker mode
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500 mt-3 font-medium">Loading your resumes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{props.title}</h1>
        <p className="text-xs text-gray-500 mt-1">{props.description}</p>
      </div>

      {resumeList.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-900 mb-1">No resumes found</h3>
          <p className="text-xs text-gray-500 mb-4">Create your first resume to run this tool.</p>
          <Button onClick={() => navigate('/dashboard')} leftIcon={<Plus className="w-4 h-4" />}>
            Create Resume
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resumeList.map((resume) => (
            <Card
              key={resume.id}
              hover
              onClick={() => navigate(props.targetRoute!(resume.id))}
              className="p-4 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {resume.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                    <span>{resume.completion}% Complete</span>
                    {resume.lastAtsScore !== null && (
                      <span>• ATS: {resume.lastAtsScore}/100</span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
