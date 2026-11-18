import { useEditorStore } from '../../../store/editorStore';
import { EntryCard } from './EntryCard';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Plus, Award, Calendar, Link as LinkIcon, Building } from 'lucide-react';
import type { CertificationEntry } from '@smartresume/shared';

interface CertificationsEditorProps {
  sectionId: string;
}

export function CertificationsEditor({ sectionId }: CertificationsEditorProps) {
  const section = useEditorStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId)
  );
  const updateSectionData = useEditorStore((s) => s.updateSectionData);

  const rawEntries = (section?.data as any)?.entries || [];
  const entries: CertificationEntry[] = rawEntries;

  const handleAddEntry = () => {
    const newEntry: CertificationEntry = {
      id: `cert_${crypto.randomUUID().slice(0, 8)}`,
      name: '',
      issuer: '',
      date: '',
      link: '',
    };
    updateSectionData(sectionId, { entries: [newEntry, ...entries] });
  };

  const handleUpdateEntry = (index: number, patch: Partial<CertificationEntry>) => {
    const updated = [...entries];
    const item = updated[index];
    if (item) {
      updated[index] = { ...item, ...patch };
      updateSectionData(sectionId, { entries: updated });
    }
  };

  const handleDeleteEntry = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    updateSectionData(sectionId, { entries: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text uppercase tracking-wider">
            Certifications & Licenses
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Industry credentials (AWS, Google Cloud, CKA, PMP, etc.).
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddEntry}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Certification
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-text-muted">No certifications added yet.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={handleAddEntry}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Certification
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <EntryCard
              key={entry.id || index}
              title={entry.name || 'Certification Name'}
              subtitle={entry.issuer}
              dateRange={entry.date}
              defaultExpanded={index === 0}
              onDelete={() => handleDeleteEntry(index)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Certification Title <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={entry.name || ''}
                      onChange={(e) =>
                        handleUpdateEntry(index, { name: e.target.value })
                      }
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Issuing Organization <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={entry.issuer || ''}
                      onChange={(e) =>
                        handleUpdateEntry(index, { issuer: e.target.value })
                      }
                      placeholder="e.g. Amazon Web Services"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Issue Date (YYYY-MM)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={entry.date || ''}
                      onChange={(e) =>
                        handleUpdateEntry(index, { date: e.target.value })
                      }
                      placeholder="e.g. 2023-09"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Credential URL
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={entry.link || ''}
                      onChange={(e) =>
                        handleUpdateEntry(index, { link: e.target.value })
                      }
                      placeholder="https://credly.com/..."
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
