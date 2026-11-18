import { useEditorStore } from '../../../store/editorStore';
import { EntryCard } from './EntryCard';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Plus, GraduationCap, Building, MapPin, Calendar, Award } from 'lucide-react';
import type { EducationEntry } from '@smartresume/shared';

interface EducationEditorProps {
  sectionId: string;
}

export function EducationEditor({ sectionId }: EducationEditorProps) {
  const section = useEditorStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId)
  );
  const updateSectionData = useEditorStore((s) => s.updateSectionData);

  const rawEntries = (section?.data as any)?.entries || [];
  const entries: EducationEntry[] = rawEntries;

  const handleAddEntry = () => {
    const newEntry: EducationEntry = {
      id: `edu_${crypto.randomUUID().slice(0, 8)}`,
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      grade: '',
      details: [],
    };
    updateSectionData(sectionId, { entries: [newEntry, ...entries] });
  };

  const handleUpdateEntry = (index: number, patch: Partial<EducationEntry>) => {
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
            Education
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Add your degrees, certifications, and academic background.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddEntry}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Education
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-text-muted">No education entries added yet.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={handleAddEntry}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Your Degree
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const subtitle = [entry.institution, entry.location].filter(Boolean).join(', ');
            const dateRange = entry.current
              ? `${entry.startDate || 'Start'} - Present`
              : entry.startDate || entry.endDate
              ? `${entry.startDate || ''} - ${entry.endDate || ''}`
              : '';

            return (
              <EntryCard
                key={entry.id || index}
                title={entry.degree ? `${entry.degree}${entry.field ? ` in ${entry.field}` : ''}` : 'Degree'}
                subtitle={subtitle}
                dateRange={dateRange}
                defaultExpanded={index === 0}
                onDelete={() => handleDeleteEntry(index)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Institution */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      School / University <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.institution || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { institution: e.target.value })
                        }
                        placeholder="e.g. University of California, Berkeley"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Degree */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Degree <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.degree || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { degree: e.target.value })
                        }
                        placeholder="e.g. Bachelor of Science"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Field of Study */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Field of Study / Major
                    </label>
                    <Input
                      value={entry.field || ''}
                      onChange={(e) =>
                        handleUpdateEntry(index, { field: e.target.value })
                      }
                      placeholder="e.g. Computer Science"
                    />
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
                        placeholder="e.g. Berkeley, CA"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Dates (YYYY-MM)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                          value={entry.startDate || ''}
                          onChange={(e) =>
                            handleUpdateEntry(index, { startDate: e.target.value })
                          }
                          placeholder="2018-09"
                          className="pl-8 text-xs"
                        />
                      </div>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                          value={entry.endDate || ''}
                          onChange={(e) =>
                            handleUpdateEntry(index, { endDate: e.target.value })
                          }
                          placeholder="2022-05"
                          className="pl-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grade / GPA */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      GPA / Honors (Optional)
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.grade || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { grade: e.target.value })
                        }
                        placeholder="e.g. 3.9 / 4.0, Magna Cum Laude"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </EntryCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
