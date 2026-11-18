import { useEditorStore } from '../../../store/editorStore';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Plus, Trash2, Languages } from 'lucide-react';
import type { LanguageEntry } from '@smartresume/shared';

interface LanguagesEditorProps {
  sectionId: string;
}

export function LanguagesEditor({ sectionId }: LanguagesEditorProps) {
  const section = useEditorStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId)
  );
  const updateSectionData = useEditorStore((s) => s.updateSectionData);

  const rawEntries = (section?.data as any)?.entries || [];
  const entries: LanguageEntry[] = rawEntries;

  const handleAddEntry = () => {
    const newEntry: LanguageEntry = {
      id: `lang_${crypto.randomUUID().slice(0, 8)}`,
      language: '',
      proficiency: 'Fluent',
    };
    updateSectionData(sectionId, { entries: [...entries, newEntry] });
  };

  const handleUpdateEntry = (index: number, patch: Partial<LanguageEntry>) => {
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
            Languages
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Languages you speak and your proficiency levels.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddEntry}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Language
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-text-muted">No languages added yet.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={handleAddEntry}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Language
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.id || index}
              className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3"
            >
              <div className="relative flex-1">
                <Languages className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={entry.language || ''}
                  onChange={(e) =>
                    handleUpdateEntry(index, { language: e.target.value })
                  }
                  placeholder="e.g. English, Spanish, Mandarin"
                  className="pl-9 text-xs"
                />
              </div>

              <div className="w-44">
                <Select
                  value={entry.proficiency || 'Fluent'}
                  onChange={(e) =>
                    handleUpdateEntry(index, {
                      proficiency: e.target.value as LanguageEntry['proficiency'],
                    })
                  }
                  className="text-xs"
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Professional">Professional</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </Select>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteEntry(index)}
                className="p-2 text-text-muted hover:text-danger rounded-lg transition-colors"
                title="Delete language"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
