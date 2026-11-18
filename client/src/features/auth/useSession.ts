import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { api } from '../../lib/api.js';

export function useSession() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const res = await api.post<{ accessToken: string; user?: any }>('/auth/refresh', {}, { skipAuth: true });
        if (mounted && res.accessToken) {
          setAuth(res.accessToken, res.user);
        } else if (mounted) {
          clearAuth();
        }
      } catch {
        if (mounted) {
          clearAuth();
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [setAuth, clearAuth]);
}
