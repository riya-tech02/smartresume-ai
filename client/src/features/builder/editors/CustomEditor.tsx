import { useEditorStore } from '../../../store/editorStore';
import { EntryCard } from './EntryCard';
import { BulletListEditor } from './BulletListEditor';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Plus } from 'lucide-react';
import type { CustomEntry } from '@smartresume/shared';

interface CustomEditorProps {
  sectionId: string;
}

export function CustomEditor({ sectionId }: CustomEditorProps) {
  const section = useEditorStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId)
  );
  const updateSectionData = useEditorStore((s) => s.updateSectionData);

  const rawEntries = (section?.data as any)?.entries || [];
  const entries: CustomEntry[] = rawEntries;

  const handleAddEntry = () => {
    const newEntry: CustomEntry = {
      id: `custom_${crypto.randomUUID().slice(0, 8)}`,
      title: '',
      subtitle: '',
      date: '',
      bullets: [''],
    };
    updateSectionData(sectionId, { entries: [newEntry, ...entries] });
  };

  const handleUpdateEntry = (index: number, patch: Partial<CustomEntry>) => {
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
            {section?.title || 'Custom Section'}
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Add custom items such as publications, volunteer work, patents, or interests.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddEntry}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Item
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-text-muted">No items in this section yet.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={handleAddEntry}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <EntryCard
              key={entry.id || index}
              title={entry.title || 'Item Title'}
              subtitle={entry.subtitle}
              dateRange={entry.date}
              defaultExpanded={index === 0}
              onDelete={() => handleDeleteEntry(index)}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Title <span className="text-danger">*</span>
                    </label>
                    <Input
                      value={entry.title || ''}
                      onChange={(e) =>
                        handleUpdateEntry(index, { title: e.target.value })
                      }
                      placeholder="e.g. Volunteer Lead"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Subtitle / Organization
                    </label>
                    <Input
                      value={entry.subtitle || ''}
                      onChange={(e) =>
                        handleUpdateEntry(index, { subtitle: e.target.value })
                      }
                      placeholder="e.g. Code for America"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-text mb-1">
                      Date or Period (YYYY-MM)
                    </label>
                    <Input
                      value={entry.date || ''}
                      onChange={(e) =>
                        handleUpdateEntry(index, { date: e.target.value })
                      }
                      placeholder="e.g. 2023-01"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <BulletListEditor
                    bullets={entry.bullets || []}
                    onChange={(bullets) => handleUpdateEntry(index, { bullets })}
                    targetRole={entry.title}
                    label="Description & Highlights"
                    placeholder="Describe your role, contributions, or outcomes..."
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
