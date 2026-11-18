import { useEditorStore } from '../../../store/editorStore';
import { EntryCard } from './EntryCard';
import { BulletListEditor } from './BulletListEditor';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Plus, FolderGit2, Link as LinkIcon, Cpu } from 'lucide-react';
import type { ProjectEntry } from '@smartresume/shared';

interface ProjectsEditorProps {
  sectionId: string;
}

export function ProjectsEditor({ sectionId }: ProjectsEditorProps) {
  const section = useEditorStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId)
  );
  const updateSectionData = useEditorStore((s) => s.updateSectionData);

  const rawEntries = (section?.data as any)?.entries || [];
  const entries: ProjectEntry[] = rawEntries;

  const handleAddEntry = () => {
    const newEntry: ProjectEntry = {
      id: `proj_${crypto.randomUUID().slice(0, 8)}`,
      name: '',
      link: '',
      techStack: [],
      startDate: '',
      endDate: '',
      bullets: [''],
    };
    updateSectionData(sectionId, { entries: [newEntry, ...entries] });
  };

  const handleUpdateEntry = (index: number, patch: Partial<ProjectEntry>) => {
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
            Featured Projects
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Showcase notable personal, open-source, or client projects with tech stack and impact.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddEntry}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Project
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-text-muted">No projects added yet.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={handleAddEntry}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => {
            return (
              <EntryCard
                key={entry.id || index}
                title={entry.name || 'Project Name'}
                subtitle={entry.techStack?.join(', ')}
                defaultExpanded={index === 0}
                onDelete={() => handleDeleteEntry(index)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Project Title <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <FolderGit2 className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.name || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { name: e.target.value })
                        }
                        placeholder="e.g. Distributed Task Queue"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Live URL or Repository
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.link || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, { link: e.target.value })
                        }
                        placeholder="e.g. https://github.com/username/project"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-text mb-1">
                      Technologies Used (comma separated)
                    </label>
                    <div className="relative">
                      <Cpu className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={entry.techStack ? entry.techStack.join(', ') : ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, {
                            techStack: e.target.value
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="e.g. Rust, Redis, Docker, gRPC"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Bullets with AI enhancement */}
                <div className="pt-2 border-t border-border/50">
                  <BulletListEditor
                    bullets={entry.bullets || []}
                    onChange={(bullets) => handleUpdateEntry(index, { bullets })}
                    targetRole={entry.name}
                    label="Project Highlights & Architecture"
                    placeholder="Built a high-throughput broker processing 50k msgs/sec with sub-millisecond p99 latency..."
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
