import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  durationMs?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UiState {
  mobileTab: 'edit' | 'preview';
  activeSectionId: string | null;
  toasts: ToastMessage[];
  setMobileTab: (tab: 'edit' | 'preview') => void;
  setActiveSectionId: (sectionId: string | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileTab: 'edit',
  activeSectionId: null,
  toasts: [],

  setMobileTab: (mobileTab) => set({ mobileTab }),
  setActiveSectionId: (activeSectionId) => set({ activeSectionId }),

  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-remove toast after duration (default 5s)
    const duration = toast.durationMs || 5000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
