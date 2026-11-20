import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { requestAiSuggestion } from '../../assistant/aiApi';
import { getErrorMessage } from '../../../lib/errors';
import { Plus, Trash2, Sparkles, X, Loader2 } from 'lucide-react';
import type { AiSuggestionWarning, SkillGroup } from '@smartresume/shared';

interface SkillsEditorProps {
  sectionId: string;
}

export function SkillsEditor({ sectionId }: SkillsEditorProps) {
  const section = useEditorStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId)
  );
  const headline = useEditorStore((s) => s.resume?.personalInfo?.headline);
  const resumeId = useEditorStore((s) => s.resume?.id);
  const updateSectionData = useEditorStore((s) => s.updateSectionData);

  const rawGroups = (section?.data as any)?.groups || [];
  const groups: SkillGroup[] = rawGroups;

  const [newSkillInput, setNewSkillInput] = useState<Record<number, string>>({});
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<AiSuggestionWarning[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddGroup = () => {
    const newGroup: SkillGroup = {
      id: `skill_${crypto.randomUUID().slice(0, 8)}`,
      category: 'Technologies',
      items: [],
    };
    updateSectionData(sectionId, { groups: [...groups, newGroup] });
  };

  const handleUpdateGroupName = (index: number, category: string) => {
    const updated = [...groups];
    const item = updated[index];
    if (item) {
      updated[index] = { ...item, category };
      updateSectionData(sectionId, { groups: updated });
    }
  };

  const handleDeleteGroup = (index: number) => {
    const updated = groups.filter((_, i) => i !== index);
    updateSectionData(sectionId, { groups: updated });
  };

  const handleAddSkill = (groupIndex: number, skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    const group = groups[groupIndex];
    if (!group || group.items.includes(trimmed)) return;

    const updated = [...groups];
    updated[groupIndex] = {
      ...group,
      items: [...group.items, trimmed],
    };
    updateSectionData(sectionId, { groups: updated });
    setNewSkillInput({ ...newSkillInput, [groupIndex]: '' });
  };

  const handleRemoveSkill = (groupIndex: number, skillIndex: number) => {
    const group = groups[groupIndex];
    if (!group) return;
    const updated = [...groups];
    updated[groupIndex] = {
      ...group,
      items: group.items.filter((_, i) => i !== skillIndex),
    };
    updateSectionData(sectionId, { groups: updated });
  };

  const handleSuggestSkills = async () => {
    setIsSuggesting(true);
    setError(null);
    try {
      if (!resumeId) throw new Error('Save the resume before requesting AI suggestions.');
      const allCurrentSkills = groups.flatMap((g) => g.items);
      const res = await requestAiSuggestion({
        feature: 'suggest-skills',
        resumeId,
        payload: {
          targetRole: headline || 'Software Engineer',
          existingSkills: allCurrentSkills,
        },
      });

      if (res.suggestions) {
        setSuggestedSkills(res.suggestions.map((suggestion) => suggestion.improved));
        setWarnings(res.meta.warnings);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch skill recommendations'));
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddSuggestedSkill = (skill: string) => {
    if (groups.length === 0) {
      handleAddGroup();
    }
    const targetGroupIndex = 0;
    const group = groups[targetGroupIndex] || {
      id: `skill_${crypto.randomUUID().slice(0, 8)}`,
      category: 'Core Skills',
      items: [],
    };

    if (!group.items.includes(skill)) {
      const updated = groups.length === 0 ? [{ ...group, items: [skill] }] : [...groups];
      const target = updated[targetGroupIndex];
      if (target) {
        updated[targetGroupIndex] = {
          ...target,
          items: [...target.items, skill],
        };
        updateSectionData(sectionId, { groups: updated });
      }
    }
    setSuggestedSkills(suggestedSkills.filter((s) => s !== skill));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text uppercase tracking-wider">
            Technical & Professional Skills
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Organize skills by category (e.g. Languages, Frameworks, Cloud, Tools).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isSuggesting}
            onClick={handleSuggestSkills}
            leftIcon={
              isSuggesting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              )
            }
          >
            AI Suggest Skills
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddGroup}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Suggested Skills Banner */}
      {suggestedSkills.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
          {warnings.length > 0 && (
            <p className="text-xs text-warning">
              Review AI suggestions carefully; some details may need verification.
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Recommended In-Demand Skills (Click to add)
            </span>
            <button
              type="button"
              onClick={() => setSuggestedSkills([])}
              className="text-text-muted hover:text-text text-xs"
            >
              Dismiss
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestedSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleAddSuggestedSkill(skill)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface border border-primary/30 text-text hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-3 h-3 text-primary" />
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-danger bg-danger/10 p-2.5 rounded-lg border border-danger/20">
          {error}
        </p>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-text-muted">No skill categories added yet.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={handleAddGroup}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Skill Category
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group, groupIndex) => (
            <div
              key={group.id || groupIndex}
              className="bg-surface border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 max-w-xs">
                  <Input
                    value={group.category}
                    onChange={(e) =>
                      handleUpdateGroupName(groupIndex, e.target.value)
                    }
                    placeholder="Category Name (e.g. Languages)"
                    className="text-xs font-semibold"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteGroup(groupIndex)}
                  className="p-1.5 text-text-muted hover:text-danger rounded-lg transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Skill chips */}
              <div className="flex flex-wrap gap-1.5 items-center min-h-[32px]">
                {group.items.map((skill, skillIndex) => (
                  <Badge
                    key={skillIndex}
                    variant="neutral"
                    className="inline-flex items-center gap-1 text-xs py-1 px-2.5"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(groupIndex, skillIndex)}
                      className="hover:text-danger ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Add skill input */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={newSkillInput[groupIndex] || ''}
                  onChange={(e) =>
                    setNewSkillInput({
                      ...newSkillInput,
                      [groupIndex]: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(
                        groupIndex,
                        newSkillInput[groupIndex] || ''
                      );
                    }
                  }}
                  placeholder="Type skill and press Enter (e.g. TypeScript)..."
                  className="text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleAddSkill(groupIndex, newSkillInput[groupIndex] || '')
                  }
                  className="shrink-0 text-xs"
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
