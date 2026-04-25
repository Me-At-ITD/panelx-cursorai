import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDashboardPage } from './pages/ProjectDashboardPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { PanelSearchPage } from './pages/PanelSearchPage';
import { ReportsPage } from './pages/ReportsPage';
import { DataImportPage } from './pages/DataImportPage';
import { DwgViewerPage } from './pages/DwgViewerPage';
import { DwgUploadPage } from './pages/DwgUploadPage';
import { PhotosPage } from './pages/PhotosPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { SyncMonitorPage } from './pages/SyncMonitorPage';
import { SitemapPage } from './pages/SitemapPage';
import { ProjectSettingsPage } from './pages/ProjectSettingsPage';
import { FileSyncConfigPage } from './pages/FileSyncConfigPage';
import { ReportTemplateManagerPage } from './pages/ReportTemplateManagerPage';
import { ReportBuilderPage } from './pages/ReportBuilderPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { UserFormPage } from './pages/UserFormPage';
import { DwgProcessingPage } from './pages/DwgProcessingPage';
import { AdvancedFiltersPage } from './pages/AdvancedFiltersPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { SavedQueriesPage } from './pages/SavedQueriesPage';
import { PhotoUploadPage } from './pages/PhotoUploadPage';
import { PhotoDetailPage } from './pages/PhotoDetailPage';
import { ReportPreviewPage } from './pages/ReportPreviewPage';
import { MobileDashboardPage } from './pages/MobileDashboardPage';
import { MobileScannerPage } from './pages/MobileScannerPage';
import { PrototypePage } from './pages/PrototypePage';
import { AppLayout } from './components/AppLayout';
import { LanguageProvider } from './components/LanguageContext';
import { ToastProvider } from './components/Toast';
import { UsersPage } from './pages/UsersPage';
import { LanguageRegionPage } from './pages/LanguageRegionPage';
import { useAuth } from './hooks/useAuth';
import { RoleManagement } from './pages/RoleManagement';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

// Protected Route wrapper (already good!)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated, isLoading, refreshToken, getTokenExpiryTime, logout } = useAuth();

  // Optional: Proactive token refresh
  // This will refresh the token before it expires (5 minutes before)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndRefreshToken = async () => {
      const expiryTime = getTokenExpiryTime();
      if (!expiryTime) return;

      const timeUntilExpiry = expiryTime - Date.now();
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry

      // If token expires in less than 5 minutes, refresh it proactively
      if (timeUntilExpiry < refreshThreshold && timeUntilExpiry > 0) {
        console.log('Token expiring soon, refreshing proactively...');
        await refreshToken();
      }
    };

    // Check immediately
    checkAndRefreshToken();

    // Set up interval to check every 10 minutes
    const interval = setInterval(checkAndRefreshToken, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken, getTokenExpiryTime]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Unauthenticated Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/admin" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/admin" replace />
          ) : (
            <ForgotPasswordPage />
          )
        }
      />
      
      <Route
        path="/reset-password"
        element={
          isAuthenticated ? (
            <Navigate to="/admin" replace />
          ) : (
            <ResetPasswordPage />
          )
        }
      />

      {/* Authenticated Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <ProjectsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <CreateProjectPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <ProjectDashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects/:id/settings"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <ProjectSettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/panel-search"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <PanelSearchPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/data-import"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <DataImportPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dwg-viewer"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <DwgViewerPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dwg-upload"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <DwgUploadPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/photos"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <PhotosPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <AiAssistantPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin-panel"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <AdminPanelPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin-panel/user/new"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <UserFormPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin-panel/user/:id"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <UserFormPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <RoleManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dwg-processing"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <DwgProcessingPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/panel-search/advanced"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <AdvancedFiltersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/panel-search/results"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <SearchResultsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/saved-queries"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <SavedQueriesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/photos/upload"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <PhotoUploadPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/photos/:id"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <PhotoDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/preview"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <ReportPreviewPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/mobile"
        element={
          <ProtectedRoute>
            <MobileDashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/mobile/scanner"
        element={
          <ProtectedRoute>
            <MobileScannerPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/prototype" element={<PrototypePage />} />
      
      <Route
        path="/admin/sync-config"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <FileSyncConfigPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/data"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <DataManagementPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <UsersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/language-region"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <LanguageRegionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/templates"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <ReportTemplateManagerPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/builder"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <ReportBuilderPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sync-monitor"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <SyncMonitorPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sitemap"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <SitemapPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <AppLayout onLogout={logout}>
        <ProfileSettingsPage />
      </AppLayout>
    </ProtectedRoute>
  }
/>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </LanguageProvider>
  );
}