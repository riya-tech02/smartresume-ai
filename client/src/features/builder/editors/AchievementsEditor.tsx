import { useEditorStore } from '../../../store/editorStore';
import { EntryCard } from './EntryCard';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Plus, Trophy, Calendar } from 'lucide-react';
import type { AchievementEntry } from '@smartresume/shared';

interface AchievementsEditorProps {
  sectionId: string;
}

export function AchievementsEditor({ sectionId }: AchievementsEditorProps) {
  const section = useEditorStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId)
  );
  const updateSectionData = useEditorStore((s) => s.updateSectionData);

  const rawEntries = (section?.data as any)?.entries || [];
  const entries: AchievementEntry[] = rawEntries;

  const handleAddEntry = () => {
    const newEntry: AchievementEntry = {
      id: `ach_${crypto.randomUUID().slice(0, 8)}`,
      title: '',
      description: '',
      date: '',
    };
    updateSectionData(sectionId, { entries: [newEntry, ...entries] });
  };

  const handleUpdateEntry = (index: number, patch: Partial<AchievementEntry>) => {
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
            Key Achievements & Awards
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Hackathon wins, patents, publication highlights, and company-wide recognition.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddEntry}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Achievement
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-text-muted">No achievements added yet.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={handleAddEntry}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Achievement
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <EntryCard
              key={entry.id || index}
              title={entry.title || 'Achievement Title'}
              dateRange={entry.date}
              defaultExpanded={index === 0}
              onDelete={() => handleDeleteEntry(index)}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Title / Award <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <Trophy className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.title || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { title: e.target.value })
                        }
                        placeholder="e.g. 1st Place - TechCrunch Disrupt Hackathon"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Date Received (YYYY-MM)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.date || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { date: e.target.value })
                        }
                        placeholder="e.g. 2024-10"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Details / Context
                  </label>
                  <Textarea
                    value={entry.description || ''}
                    onChange={(e) =>
                      handleUpdateEntry(index, { description: e.target.value })
                    }
                    placeholder="Built a real-time collaborative code editor in 24 hours outperforming 150 competing teams..."
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
