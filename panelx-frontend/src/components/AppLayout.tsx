import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { AIChat } from './AIChat';
import { LanguageSwitcher } from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, BellIcon, MenuIcon, XIcon } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { useUsers } from '../hooks/useUsers'; // Add this import

interface AppLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export function AppLayout({ children, onLogout }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const location = useLocation();
  const { t, direction } = useLanguage();
  
  // Add state for user data
  const [user, setUser] = useState<{
    full_name: string;
    email: string;
    profile_image_url?: string | null;
    is_superuser?: boolean;
  } | null>(null);
  const [imageError, setImageError] = useState(false);
  const { getCurrentUser } = useUsers();

  // Check if we're inside the prototype preview iframe
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      const result = await getCurrentUser();
      if (result.success && result.data) {
        setUser({
          full_name: result.data.full_name,
          email: result.data.email,
          profile_image_url: result.data.profile_image_url,
          is_superuser: result.data.is_superuser,
        });
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const getPageTitle = (path: string) => {
    if (path.startsWith('/admin-panel/user')) return t('User Management');
    if (path.startsWith('/admin-panel')) return t('Admin Panel');
    if (path.startsWith('/admin/sync-config')) return t('File Sync Config');
    if (path.startsWith('/admin/data')) return t('Data Management');
    if (path.startsWith('/admin')) return t('Dashboard');
    if (path.startsWith('/projects/new')) return t('New Project');
    if (path.match(/^\/projects\/[^/]+\/settings/)) return t('Project Settings');
    if (path.match(/^\/projects\/[^/]+$/)) return t('Project Dashboard');
    if (path.startsWith('/projects')) return t('Projects');
    if (path.startsWith('/dwg-processing')) return t('DWG Processing');
    if (path.startsWith('/dwg-viewer')) return t('DWG Viewer');
    if (path.startsWith('/dwg-upload')) return t('DWG Upload');
    if (path.startsWith('/panel-search/advanced')) return t('Advanced Filters');
    if (path.startsWith('/panel-search/results')) return t('Search Results');
    if (path.startsWith('/panel-search')) return t('Panel Search');
    if (path.startsWith('/saved-queries')) return t('Saved Queries');
    if (path.startsWith('/data-import')) return t('Data Import');
    if (path.startsWith('/ai-assistant')) return t('AI Assistant');
    if (path.startsWith('/photos/upload')) return t('Upload Photos');
    if (path.match(/^\/photos\/[^/]+$/)) return t('Photo Detail');
    if (path.startsWith('/photos')) return t('Photos');
    if (path.startsWith('/reports/preview')) return t('Report Preview');
    if (path.startsWith('/reports/builder')) return t('Report Builder');
    if (path.startsWith('/reports/templates')) return t('Report Templates');
    if (path.startsWith('/reports')) return t('Reports');
    if (path.startsWith('/sync-monitor')) return t('Sync Monitor');
    if (path.startsWith('/sitemap')) return t('Application Map');
    return t('Dashboard');
  };

  // Get user initials from full name
  const getUserInitials = (fullName: string) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // If in preview mode, render content without sidebar/chrome
  if (isPreview) {
    return (
      <div className="min-h-screen w-full">
        <main
          className="p-4 sm:p-8 min-h-screen"
          style={{
            background:
              'linear-gradient(160deg, var(--bg-page) 0%, var(--bg-section) 50%, var(--bg-page) 100%)'
          }}
        >
          <div className="max-w-[1440px] mx-auto">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out ${
          isMobile
            ? isMobileSidebarOpen
              ? 'translate-x-0 rtl:translate-x-0'
              : '-translate-x-full rtl:translate-x-full'
            : 'translate-x-0'
        }`}
      >
        <Sidebar
          onLogout={onLogout}
          isCollapsed={isMobile ? false : isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobile={isMobile}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      <motion.div
        initial={false}
        animate={{
          marginInlineStart: isMobile ? 0 : isSidebarCollapsed ? 64 : 256,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-screen w-full"
      >
        {/* Top color stripe */}
        <div
          className="h-[3px] w-full flex-shrink-0"
          style={{
            background:
              'linear-gradient(90deg, #004a64 0%, #2E86AB 50%, #7C3AED 100%)',
          }}
        />

        {/* Header bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-border flex-shrink-0 backdrop-blur-xl bg-card-bg/85 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            )}
            <span className="font-heading text-[11px] font-medium text-text-secondary uppercase tracking-wider truncate max-w-[150px] sm:max-w-none">
              {getPageTitle(location.pathname)}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors relative group">
              <SearchIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:block absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#0F172A] text-white text-[9px] font-heading tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ⌘ K
              </span>
            </button>

            <ThemeToggle />

            <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors relative">
              <BellIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-stat-alerts rounded-full" />
            </button>

            {/* User Profile Button with Dropdown Menu */}
            <div className="relative group ml-1 sm:ml-2">
              <button className="flex items-center gap-2 focus:outline-none">
                {user?.profile_image_url && !imageError ? (
                  <img
                    src={user.profile_image_url}
                    alt={user.full_name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-accent/20"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent flex items-center justify-center text-white text-[9px] sm:text-[10px] font-heading font-bold ring-2 ring-accent/20">
                    {user ? getUserInitials(user.full_name) : '...'}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-card-bg border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-[13px] font-medium text-text-primary truncate">
                    {user?.full_name || 'Loading...'}
                  </p>
                  <p className="text-[11px] text-text-secondary truncate mt-0.5">
                    {user?.email || 'Loading...'}
                  </p>
                  {user?.is_superuser && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-heading font-semibold uppercase tracking-wider rounded">
                      Administrator
                    </span>
                  )}
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="w-full text-left px-4 py-2 text-[12px] text-text-secondary  hover:text-text-primary transition-colors"
                  >
                    Profile Settings
                  </Link>
                 
                  <hr className="my-1 border-border" />
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-[12px] text-stat-alerts hover:bg-red-500/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main
          className="flex-1 p-4 sm:p-8 overflow-y-auto overflow-x-hidden"
          style={{
            background:
              'linear-gradient(160deg, var(--bg-page) 0%, var(--bg-section) 50%, var(--bg-page) 100%)',
          }}
        >
          <div className="max-w-[1440px] mx-auto">{children}</div>
        </main>
      </motion.div>

      <AIChat />
      <LanguageSwitcher />
    </div>
  );
}