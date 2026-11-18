import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { useEditorStore } from '../../store/editorStore';
import { TEMPLATE_META, TemplateId } from '../../templates/registry';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface TemplateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateDrawer({ isOpen, onClose }: TemplateDrawerProps) {
  const currentTemplateId = useEditorStore((s) => s.resume?.templateId);
  const setTemplateId = useEditorStore((s) => s.setTemplateId);

  const handleSelect = (id: TemplateId) => {
    setTemplateId(id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Resume Template"
      maxWidth="xl"
    >
      <div className="space-y-4">
        <p className="text-xs text-text-muted">
          Switch templates anytime without losing any content. All templates are tested against ATS parsers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {TEMPLATE_META.map((tmpl) => {
            const isSelected = currentTemplateId === tmpl.id;

            return (
              <div
                key={tmpl.id}
                onClick={() => handleSelect(tmpl.id)}
                className={`relative p-5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border bg-surface hover:border-text-muted/40 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text flex items-center gap-2">
                      {tmpl.name}
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-text-muted font-medium truncate max-w-[200px]">
                    {tmpl.intendedFor}
                  </span>

                  <div className="flex items-center gap-1.5 text-success font-semibold text-xs shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{tmpl.atsSafe ? 'ATS Safe' : 'Designer'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
