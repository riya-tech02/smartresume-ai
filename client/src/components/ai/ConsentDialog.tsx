import React, { useState } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';

export interface ConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentSuccess: () => void;
}

export function ConsentDialog({ isOpen, onClose, onConsentSuccess }: ConsentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const addToast = useUiStore((s) => s.addToast);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const res = await api.patch<{ user: any }>('/users/me', {
        aiConsentAccepted: true,
      });

      if (user) {
        setUser({
          ...user,
          aiConsentAcceptedAt: res.user.preferences?.aiConsentAcceptedAt || new Date().toISOString(),
        });
      }

      addToast({
        type: 'success',
        message: 'AI Assistant features enabled!',
      });

      onConsentSuccess();
      onClose();
    } catch {
      addToast({
        type: 'error',
        message: 'Failed to record consent. Please retry.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3 text-indigo-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-2">Enable AI Resume Assistant</h3>
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          SmartResume AI uses artificial intelligence to refine bullet points, suggest keywords, and structure your experience.
        </p>

        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-left mb-6 space-y-2">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700">
              <strong>Strict Privacy:</strong> Your personal contact details (email, phone number, address, web links) are stripped and <em>never</em> sent to external AI providers.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700">
              <strong>Honesty Guardrail:</strong> AI suggestions are never applied automatically. You review, edit, or reject each suggestion before it touches your resume.
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAccept} isLoading={isLoading} className="flex-1">
            I Understand & Agree
          </Button>
        </div>
      </div>
    </Modal>
  );
}
