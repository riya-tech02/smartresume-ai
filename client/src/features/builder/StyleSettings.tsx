import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { useEditorStore } from '../../store/editorStore';
import { Select } from '../../components/ui/Select';
import { Palette, Type, AlignJustify } from 'lucide-react';
import { ACCENT_PALETTE } from '@smartresume/shared';
import type { ResumeSettings } from '@smartresume/shared';

interface StyleSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_SWATCHES = [
  { name: 'Indigo', value: ACCENT_PALETTE[0] || '#4F46E5' },
  { name: 'Slate', value: '#1E293B' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Teal', value: '#0D9488' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#E11D48' },
];

export function StyleSettings({ isOpen, onClose }: StyleSettingsProps) {
  const settings = useEditorStore((s) => s.resume?.settings);
  const updateSettings = useEditorStore((s) => s.updateSettings);

  const currentSettings: ResumeSettings = settings || {
    accentColor: '#4F46E5',
    fontScale: 'md',
    spacing: 'normal',
  };

  const handleUpdate = (partial: Partial<ResumeSettings>) => {
    updateSettings(partial);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resume Styling & Layout"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Accent Color */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-primary" />
            Accent Color
          </label>
          <div className="flex items-center gap-2.5">
            {COLOR_SWATCHES.map((color) => {
              const isSelected =
                currentSettings.accentColor?.toLowerCase() ===
                color.value.toLowerCase();
              return (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleUpdate({ accentColor: color.value })}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    isSelected ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              );
            })}

            <input
              type="color"
              value={currentSettings.accentColor || '#4F46E5'}
              onChange={(e) => handleUpdate({ accentColor: e.target.value })}
              className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 ml-1 bg-transparent"
              title="Custom Hex Color"
            />
          </div>
        </div>

        {/* Font Scale & Spacing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-primary" />
              Font Size / Scale
            </label>
            <Select
              value={currentSettings.fontScale || 'md'}
              onChange={(e) =>
                handleUpdate({ fontScale: e.target.value as 'sm' | 'md' | 'lg' })
              }
              className="text-xs"
            >
              <option value="sm">Small (11px - Fit more)</option>
              <option value="md">Medium (12px - Standard)</option>
              <option value="lg">Large (13px - Maximum readability)</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
              <AlignJustify className="w-3.5 h-3.5 text-primary" />
              Section Spacing
            </label>
            <Select
              value={currentSettings.spacing || 'normal'}
              onChange={(e) =>
                handleUpdate({ spacing: e.target.value as 'compact' | 'normal' | 'relaxed' })
              }
              className="text-xs"
            >
              <option value="compact">Compact (Fit to 1 page)</option>
              <option value="normal">Normal (Balanced padding)</option>
              <option value="relaxed">Relaxed (Spacious 2 pages)</option>
            </Select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
