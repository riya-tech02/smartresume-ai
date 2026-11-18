import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/ui/Card.js';
import { ProgressRing } from '../../components/ui/ProgressRing.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import {
  FileText,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Download,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { formatRelativeTime } from '../../lib/format.js';
import { TEMPLATES } from '@smartresume/shared';
import type { ResumeSummary } from '@smartresume/shared';
import { api } from '../../lib/api.js';
import { useUiStore } from '../../store/uiStore.js';

export function ResumeCard({
  resume,
  onRefresh,
}: {
  resume: ResumeSummary;
  onRefresh: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const navigate = useNavigate();
  const addToast = useUiStore((s) => s.addToast);

  const templateMeta = TEMPLATES.find((t) => t.id === resume.templateId);

  const handleDuplicate = async () => {
    try {
      await api.post(`/resumes/${resume.id}/duplicate`);
      addToast({ type: 'success', message: 'Resume duplicated successfully' });
      onRefresh();
    } catch {
      addToast({ type: 'error', message: 'Failed to duplicate resume' });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/resumes/${resume.id}`);
      addToast({ type: 'success', message: 'Resume deleted' });
      setDeleteModalOpen(false);
      onRefresh();
    } catch {
      addToast({ type: 'error', message: 'Failed to delete resume' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const blob = await api.post<Blob>(`/resumes/${resume.id}/pdf`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addToast({ type: 'success', message: 'PDF downloaded' });
    } catch {
      addToast({
        type: 'error',
        message: 'PDF generation failed. Opening print preview fallback...',
      });
      window.open(`/resumes/${resume.id}/print`, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Card hover className="p-5 flex flex-col justify-between relative group">
        <div>
          {/* Card Top Row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h3
                  onClick={() => navigate(`/builder/${resume.id}`)}
                  className="text-sm font-bold text-gray-900 truncate hover:text-indigo-600 cursor-pointer transition-colors"
                  title={resume.title}
                >
                  {resume.title}
                </h3>
                <span className="text-[10px] text-gray-500 font-medium">
                  {templateMeta?.name || resume.templateId} {resume.isSample && '• Sample'}
                </span>
              </div>
            </div>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Resume options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                >
                  <button
                    onClick={() => navigate(`/builder/${resume.id}`)}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                    <span>Edit in Builder</span>
                  </button>

                  <button
                    onClick={() => navigate(`/ats?resumeId=${encodeURIComponent(resume.id)}`)}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-gray-500" />
                    <span>Run ATS Analysis</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>{isDownloading ? 'Exporting...' : 'Download PDF'}</span>
                  </button>

                  <button
                    onClick={handleDuplicate}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Duplicate</span>
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scores Row */}
          <div className="flex items-center justify-between py-2 border-y border-gray-100 my-3 text-xs">
            <div className="flex items-center gap-2">
              <ProgressRing progress={resume.completion} size={32} strokeWidth={3} />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Profile</span>
                <span className="text-xs font-bold text-gray-700">{resume.completion}% Complete</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">ATS Score</span>
              {resume.lastAtsScore !== null ? (
                <span
                  className={`text-xs font-black ${
                    resume.lastAtsScore >= 80
                      ? 'text-emerald-600'
                      : resume.lastAtsScore >= 60
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {resume.lastAtsScore}/100
                </span>
              ) : (
                <span className="text-xs text-gray-400 font-medium">Unanalyzed</span>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer: Last edited + CTA */}
        <div className="flex items-center justify-between pt-2">
          <span
            className="text-[10px] text-gray-400"
            title={new Date(resume.updatedAt).toLocaleString()}
          >
            Edited {formatRelativeTime(resume.updatedAt)}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(`/builder/${resume.id}`)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:underline"
            >
              <span>Open</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message={`Are you sure you want to permanently delete "${resume.title}"? This will also remove its associated ATS reports and cannot be undone.`}
        confirmText="Delete Resume"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
