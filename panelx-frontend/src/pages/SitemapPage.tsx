import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  FolderIcon,
  FileTextIcon,
  SearchIcon,
  DatabaseIcon,
  BotIcon,
  CameraIcon,
  FileBarChartIcon,
  SettingsIcon,
  SmartphoneIcon } from
'lucide-react';
const modules = [
{
  title: 'Authentication',
  icon: SettingsIcon,
  screens: [
  {
    id: 'S1',
    name: 'Login',
    path: '/login',
    status: 'Built'
  },
  {
    id: 'S2',
    name: 'Forgot Password',
    path: '/forgot-password',
    status: 'Built'
  },
  {
    id: 'S3',
    name: 'Reset Password',
    path: '/reset-password',
    status: 'Built'
  }]

},
{
  title: 'Admin & Dashboard',
  icon: LayoutDashboardIcon,
  screens: [
  {
    id: 'S4',
    name: 'Admin Dashboard',
    path: '/admin',
    status: 'Built'
  },
  {
    id: 'S5',
    name: 'User Management',
    path: '/admin-panel',
    status: 'Built'
  },
  {
    id: 'S6',
    name: 'Create/Edit User',
    path: '/admin-panel/user/new',
    status: 'Built'
  }]

},
{
  title: 'Projects',
  icon: FolderIcon,
  screens: [
  {
    id: 'S7',
    name: 'Project List',
    path: '/projects',
    status: 'Built'
  },
  {
    id: 'S11',
    name: 'Project Dashboard',
    path: '/projects/1',
    status: 'Built'
  },
  {
    id: 'S12',
    name: 'Project Settings',
    path: '/projects/1/settings',
    status: 'Built'
  },
  {
    id: 'S13',
    name: 'Create Project',
    path: '/projects/new',
    status: 'Built'
  },
  {
    id: 'S8',
    name: 'File Sync Config',
    path: '/admin/sync-config',
    status: 'Built'
  },
  {
    id: 'S14',
    name: 'Sync Monitor',
    path: '/sync-monitor',
    status: 'Built'
  }]

},
{
  title: 'DWG Viewer',
  icon: FileTextIcon,
  screens: [
  {
    id: 'S15',
    name: 'DWG Upload',
    path: '/dwg-upload',
    status: 'Built'
  },
  {
    id: 'S16',
    name: 'Processing Status',
    path: '/dwg-processing',
    status: 'Built'
  },
  {
    id: 'S17',
    name: 'DWG Viewer',
    path: '/dwg-viewer',
    status: 'Built'
  },
  {
    id: 'S18',
    name: 'Panel Detail Sidebar',
    path: '#',
    status: 'Planned'
  },
  {
    id: 'S19',
    name: 'Layer Controls',
    path: '#',
    status: 'Planned'
  }]

},
{
  title: 'Search & Data',
  icon: SearchIcon,
  screens: [
  {
    id: 'S20',
    name: 'Panel Search',
    path: '/panel-search',
    status: 'Built'
  },
  {
    id: 'S21',
    name: 'Advanced Filters',
    path: '/panel-search/advanced',
    status: 'Built'
  },
  {
    id: 'S22',
    name: 'Search Results',
    path: '/panel-search/results',
    status: 'Built'
  },
  {
    id: 'S29',
    name: 'Saved Queries',
    path: '/saved-queries',
    status: 'Built'
  },
  {
    id: 'S23',
    name: 'Data Import',
    path: '/data-import',
    status: 'Built'
  },
  {
    id: 'S24-27',
    name: 'Data Management',
    path: '/admin/data',
    status: 'Built'
  }]

},
{
  title: 'AI & Photos',
  icon: BotIcon,
  screens: [
  {
    id: 'S28',
    name: 'AI Assistant',
    path: '/ai-assistant',
    status: 'Built'
  },
  {
    id: 'S30',
    name: 'Photo Gallery',
    path: '/photos',
    status: 'Built'
  },
  {
    id: 'S31',
    name: 'Photo Upload',
    path: '/photos/upload',
    status: 'Built'
  },
  {
    id: 'S32',
    name: 'Photo Detail',
    path: '/photos/1',
    status: 'Built'
  }]

},
{
  title: 'Reports',
  icon: FileBarChartIcon,
  screens: [
  {
    id: 'S33',
    name: 'Reports Dashboard',
    path: '/reports',
    status: 'Built'
  },
  {
    id: 'S34',
    name: 'Report Builder',
    path: '/reports/builder',
    status: 'Built'
  },
  {
    id: 'S35',
    name: 'Report Preview',
    path: '/reports/preview',
    status: 'Built'
  },
  {
    id: 'S9',
    name: 'Template Manager',
    path: '/reports/templates',
    status: 'Built'
  }]

},
{
  title: 'Mobile',
  icon: SmartphoneIcon,
  screens: [
  {
    id: 'S36',
    name: 'Mobile Dashboard',
    path: '/mobile',
    status: 'Built'
  },
  {
    id: 'S37',
    name: 'Mobile Scanner',
    path: '/mobile/scanner',
    status: 'Built'
  }]

}];

export function SitemapPage() {
  return (
    <div>
      <div className="mb-8 animate-fade-up">
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          Application Map
        </h1>
        <p className="text-[13px] text-text-secondary mt-1">
          Overview of all 37 screens in the PanelX system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <div
              key={module.title}
              className="bg-card-bg border border-border p-6"
              style={{
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                animation: 'fadeUp 0.35s ease both',
                animationDelay: `${index * 50}ms`
              }}>
              
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 bg-subtle-bg flex items-center justify-center text-text-secondary">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="font-heading text-[14px] font-bold text-text-primary uppercase tracking-wider">
                  {module.title}
                </h2>
              </div>

              <div className="space-y-3">
                {module.screens.map((screen) =>
                <div
                  key={screen.id}
                  className="flex items-center justify-between group">
                  
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-heading font-bold text-text-secondary w-6">
                        {screen.id}
                      </span>
                      {screen.status === 'Built' ?
                    <Link
                      to={screen.path}
                      className="text-[13px] text-text-primary hover:text-accent font-medium transition-colors">
                      
                          {screen.name}
                        </Link> :

                    <span className="text-[13px] text-text-secondary">
                          {screen.name}
                        </span>
                    }
                    </div>
                    <span
                    className={`px-2 py-0.5 text-[9px] font-heading uppercase tracking-wider font-medium border ${screen.status === 'Built' ? 'bg-status-installed-bg text-status-installed-text border-status-installed/30' : 'bg-status-pending-bg text-status-pending-text border-status-pending/30'}`}>
                    
                      {screen.status}
                    </span>
                  </div>
                )}
              </div>
            </div>);

        })}
      </div>
    </div>);

}