import { BrowserRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useSession } from './features/auth/useSession';
import { AppRoutes } from './router';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

function SessionInitializer({ children }: { children: React.ReactNode }) {
  useSession();
  return <>{children}</>;
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SessionInitializer>
            <AppRoutes />
          </SessionInitializer>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
