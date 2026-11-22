import { Routes, Route, Navigate } from 'react-router';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { BuilderPage } from './features/builder/BuilderPage';
import { TemplateGalleryPage } from './features/templates-gallery/TemplateGalleryPage';
import { AtsPage } from './features/ats/AtsPage';
import { JobMatchPage } from './features/jobmatch/JobMatchPage';
import { AssistantPage } from './features/assistant/AssistantPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { PrintPage } from './features/print/PrintPage';
import { NotFoundPage } from './features/common/NotFoundPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/print" element={<PrintPage />} />

      {/* Templates Gallery (Accessible with Shell) */}
      <Route
        path="/templates"
        element={
          <AppShell>
            <TemplateGalleryPage />
          </AppShell>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Builder is full-screen without standard shell */}
      <Route
        path="/builder/:id"
        element={
          <ProtectedRoute>
            <BuilderPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ats"
        element={
          <ProtectedRoute>
            <AppShell>
              <AtsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobmatch"
        element={
          <ProtectedRoute>
            <AppShell>
              <JobMatchPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-match"
        element={
          <ProtectedRoute>
            <AppShell>
              <JobMatchPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <AppShell>
              <AssistantPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell>
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resumes/:id/print"
        element={
          <ProtectedRoute>
            <PrintPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
