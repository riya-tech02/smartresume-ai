import { useEditorStore } from '../../../store/editorStore';
import { EntryCard } from './EntryCard';
import { BulletListEditor } from './BulletListEditor';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Plus, Building2, Briefcase, MapPin, Calendar } from 'lucide-react';
import type { ExperienceEntry } from '@smartresume/shared';

interface ExperienceEditorProps {
  sectionId: string;
}

export function ExperienceEditor({ sectionId }: ExperienceEditorProps) {
  const section = useEditorStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId)
  );
  const headline = useEditorStore((s) => s.resume?.personalInfo?.headline);
  const updateSectionData = useEditorStore((s) => s.updateSectionData);

  const rawEntries = (section?.data as any)?.entries || [];
  const entries: ExperienceEntry[] = rawEntries;

  const handleAddEntry = () => {
    const newEntry: ExperienceEntry = {
      id: `exp_${crypto.randomUUID().slice(0, 8)}`,
      role: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    };
    updateSectionData(sectionId, { entries: [newEntry, ...entries] });
  };

  const handleUpdateEntry = (index: number, patch: Partial<ExperienceEntry>) => {
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
            Work Experience
          </h3>
          <p className="text-xs text-text-muted mt-1">
            List your relevant roles in reverse chronological order. Highlight achievements with metrics.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddEntry}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Experience
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-text-muted">No experience entries added yet.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={handleAddEntry}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Your First Role
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const dateRange = entry.current
              ? `${entry.startDate || 'Start'} - Present`
              : entry.startDate || entry.endDate
              ? `${entry.startDate || ''} - ${entry.endDate || ''}`
              : '';

            return (
              <EntryCard
                key={entry.id || index}
                title={entry.role || 'Job Title'}
                subtitle={entry.organization || 'Organization'}
                dateRange={dateRange}
                defaultExpanded={index === 0}
                onDelete={() => handleDeleteEntry(index)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Job Title */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Job Title / Role <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.role || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { role: e.target.value })
                        }
                        placeholder="e.g. Senior Software Engineer"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Company / Organization <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.organization || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { organization: e.target.value })
                        }
                        placeholder="e.g. Acme Corp"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.location || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { location: e.target.value })
                        }
                        placeholder="e.g. San Francisco, CA (or Remote)"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-text">
                        Dates Employed
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!entry.current}
                          onChange={(e) =>
                            handleUpdateEntry(index, { current: e.target.checked })
                          }
                          className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span>Current Role</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                          value={entry.startDate || ''}
                          onChange={(e) =>
                            handleUpdateEntry(index, { startDate: e.target.value })
                          }
                          placeholder="YYYY-MM (e.g. 2022-01)"
                          className="pl-8 text-xs"
                        />
                      </div>

                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                          value={entry.endDate || ''}
                          disabled={!!entry.current}
                          onChange={(e) =>
                            handleUpdateEntry(index, { endDate: e.target.value })
                          }
                          placeholder={entry.current ? 'Present' : 'YYYY-MM'}
                          className="pl-8 text-xs disabled:bg-surface-sunken"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bullets with inline AI enhancement */}
                <div className="pt-2 border-t border-border/50">
                  <BulletListEditor
                    bullets={entry.bullets || []}
                    onChange={(bullets) => handleUpdateEntry(index, { bullets })}
                    targetRole={entry.role || headline || 'Software Engineer'}
                    label="Accomplishments & Impact"
                    placeholder="Led development of [feature] using [tech], improving [metric] by [X]%..."
                  />
                </div>
              </EntryCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
