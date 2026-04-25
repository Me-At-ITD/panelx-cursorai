import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboardIcon,
  FolderIcon,
  FileTextIcon,
  SearchIcon,
  UploadIcon,
  CameraIcon,
  DatabaseIcon,
  UsersIcon,
  BookmarkIcon,
  RefreshCwIcon,
  GlobeIcon,
  LogOutIcon,
  XIcon,
  ShieldIcon,
  UserCircleIcon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';

interface SidebarProps {
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobile,
  onCloseMobile
}: SidebarProps) {
  const location = useLocation();
  const { t } = useLanguage();
  const { getCurrentUser } = useUsers();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('U');
  const [userRole, setUserRole] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    setIsLoadingUser(true);
    const result = await getCurrentUser();
    if (result.success && result.data) {
      const name = result.data.full_name || result.data.email || 'User';
      setUserName(name);
      setUserEmail(result.data.email || '');
      
      // Get initials
      const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      setUserInitials(initials);
      
      // Set profile image
      if (result.data.profile_image_url) {
        setProfileImage(result.data.profile_image_url);
        setImageError(false);
      }
      
      // Set role
      if (result.data.is_superuser) {
        setUserRole('Superuser');
      } else if (result.data.roles && result.data.roles.length > 0) {
        setUserRole(result.data.roles[0].name);
      } else {
        setUserRole('User');
      }
    }
    setIsLoadingUser(false);
  };

  const renderSectionLabel = (
    label: string,
    icon?: React.ReactNode,
    tooltip?: string
  ) => {
    if (isCollapsed) {
      return (
        <div className="mx-3 my-3 h-[0.5px] bg-white/[0.06]" title={tooltip} />
      );
    }
    return (
      <div className="px-5 py-3 mt-2" title={tooltip}>
        <div className="flex items-center gap-2">
          <div className="h-[0.5px] flex-1 bg-white/[0.06]" />
          <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-heading whitespace-nowrap flex items-center gap-1">
            {t(label)}
            {icon}
          </span>
          <div className="h-[0.5px] flex-1 bg-white/[0.06]" />
        </div>
      </div>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 64 : 256
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
      className="h-screen flex flex-col relative z-50 shadow-2xl lg:shadow-none"
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #0A1628 100%)'
      }}>
      
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06] overflow-hidden flex-shrink-0">
        <img
          src="/logo-light.png"
          alt="Design L.EFRAIM LTD."
          className={`transition-all duration-300 ${isCollapsed ? 'w-8 opacity-0' : 'w-32 opacity-100'}`} />
        
        {isMobile &&
          <button
            onClick={onCloseMobile}
            className="p-2 text-slate-400 hover:text-white transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        }
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {/* DWG VIEWER SECTION (PRIMARY) */}
        <div className="mt-1 mb-1">
          <div className="px-2">
            <Link
              to="/dwg-viewer"
              className={`flex items-center gap-3 px-3 py-2.5 text-white relative transition-colors ${isCollapsed ? 'justify-center' : ''}`}
              style={{
                backgroundColor: 'rgb(46, 134, 171)',
                borderInlineStart: '3px solid #2E86AB'
              }}>
              
              <FileTextIcon className="w-[20px] h-[20px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[14px] font-bold tracking-wider whitespace-nowrap overflow-hidden">
                  {t('DWG VIEWER')}
                </span>
              }
            </Link>
          </div>
          <ul className="space-y-0.5 mt-1">
            <li>
              <Link
                to="/admin"
                className={`flex items-center gap-3 pl-9 pr-3 py-2 transition-all duration-200 relative ${location.pathname === '/admin' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                
                {!isCollapsed &&
                  <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-white/10" />
                }
                {!isCollapsed &&
                  <div className="absolute left-[22px] top-1/2 w-3 h-[2px] bg-white/10" />
                }
                <LayoutDashboardIcon className="w-[14px] h-[14px]" />
                {!isCollapsed &&
                  <span className="font-heading text-[11px] font-medium tracking-wider">
                    {t('Recent Drawings')}
                  </span>
                }
              </Link>
            </li>
            <li>
              <Link
                to="/projects"
                className={`flex items-center gap-3 pl-9 pr-3 py-2 transition-all duration-200 relative ${location.pathname === '/projects' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                
                {!isCollapsed &&
                  <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-white/10" />
                }
                {!isCollapsed &&
                  <div className="absolute left-[22px] top-1/2 w-3 h-[2px] bg-white/10" />
                }
                <FolderIcon className="w-[14px] h-[14px]" />
                {!isCollapsed &&
                  <span className="font-heading text-[11px] font-medium tracking-wider">
                    {t('All Projects')}
                  </span>
                }
              </Link>
            </li>
            <li>
              <Link
                to="/panel-search"
                className={`flex items-center gap-3 pl-9 pr-3 py-2 transition-all duration-200 relative ${location.pathname === '/panel-search' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                
                {!isCollapsed &&
                  <div className="absolute left-[22px] top-0 bottom-1/2 w-[2px] bg-white/10" />
                }
                {!isCollapsed &&
                  <div className="absolute left-[22px] top-1/2 w-3 h-[2px] bg-white/10" />
                }
                <SearchIcon className="w-[14px] h-[14px]" />
                {!isCollapsed &&
                  <span className="font-heading text-[11px] font-medium tracking-wider">
                    {t('Panel Search')}
                  </span>
                }
              </Link>
            </li>
          </ul>
        </div>

        {/* DATA MANAGEMENT SECTION */}
        {renderSectionLabel('DATA MANAGEMENT')}
        <ul className="space-y-0.5 px-2">
          <li>
            <Link
              to="/dwg-processing"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname === '/dwg-processing' ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <FileTextIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('DWG Files')}
                </span>
              }
            </Link>
          </li>
          <li>
            <Link
              to="/data-import"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname === '/data-import' ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <UploadIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('Data Import')}
                </span>
              }
            </Link>
          </li>
          <li>
            <Link
              to="/photos"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname.startsWith('/photos') ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <CameraIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('Photos')}
                </span>
              }
            </Link>
          </li>
          <li>
            <Link
              to="/admin/data"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname === '/admin/data' ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <DatabaseIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('Raw Data')}
                </span>
              }
            </Link>
          </li>
        </ul>

        {/* ADMIN SETTINGS SECTION */}
        {renderSectionLabel('ADMIN SETTINGS')}
        <ul className="space-y-0.5 px-2">
          <li>
            <Link
              to="/admin-panel"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname === '/admin-panel' ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <UsersIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('Users')}
                </span>
              }
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/roles"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname === '/admin/roles' ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <ShieldIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('Roles & Permissions')}
                </span>
              }
            </Link>
          </li>
          
          <li>
            <Link
              to="/saved-queries"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname === '/saved-queries' ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <BookmarkIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('Saved Queries')}
                </span>
              }
            </Link>
          </li>
          
          <li>
            <Link
              to="/sync-monitor"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname === '/sync-monitor' ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <RefreshCwIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('Sync Monitor')}
                </span>
              }
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin-panel?tab=system"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname === '/admin-panel' && location.search.includes('tab=system') ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <GlobeIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('Language & Region')}
                </span>
              }
            </Link>
          </li>
        </ul>

        {/* PROFILE SECTION */}
        {renderSectionLabel('ACCOUNT')}
        <ul className="space-y-0.5 px-2">
          <li>
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${location.pathname === '/profile' ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              
              <UserCircleIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed &&
                <span className="font-heading text-[11px] font-medium tracking-wider">
                  {t('My Profile')}
                </span>
              }
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Profile & Logout - Dynamic User Info */}
      <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
        {!isLoadingUser ? (
          <>
            <div
              className={`flex items-center gap-3 mb-2 px-1 ${isCollapsed ? 'justify-center' : ''}`}>
              
              {/* Profile Image or Initials */}
              {profileImage && !imageError ? (
                <img
                  src={profileImage}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border border-accent/50 flex-shrink-0"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/80 flex items-center justify-center text-white text-[10px] font-heading font-bold flex-shrink-0">
                  {userInitials}
                </div>
              )}
              
              {!isCollapsed &&
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="flex-1 min-w-0">
                  
                  <div className="font-heading text-[11px] font-medium text-white truncate tracking-wide">
                    {userName}
                  </div>
                  <div className="text-[9px] text-slate-500 truncate uppercase tracking-wider">
                    {userRole}
                  </div>
                  <div className="text-[8px] text-slate-600 truncate">
                    {userEmail}
                  </div>
                </motion.div>
              }
            </div>

            {/* Quick Actions when collapsed */}
            {isCollapsed && (
              <div className="flex flex-col items-center gap-1 mt-2">
                <Link
                  to="/profile"
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors rounded"
                  title="Profile"
                >
                  <UserCircleIcon className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className={`flex items-center gap-3 mb-2 px-1 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex-1">
                <div className="h-3 bg-white/10 rounded animate-pulse w-24 mb-2" />
                <div className="h-2 bg-white/10 rounded animate-pulse w-16" />
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-white/[0.04] hover:text-white transition-colors mt-2 ${isCollapsed ? 'justify-center' : ''}`}>
          
          <LogOutIcon className="w-[18px] h-[18px] flex-shrink-0" />
          {!isCollapsed &&
            <span className="font-heading text-[11px] font-medium tracking-wider">
              {t('Logout')}
            </span>
          }
        </button>
      </div>
    </motion.aside>
  );
}