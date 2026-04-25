import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLinkIcon, LayoutIcon } from 'lucide-react';
const sitemap = [
{
  name: 'Login',
  path: '/login'
},
{
  name: 'Forgot Password',
  path: '/forgot-password'
},
{
  name: 'Reset Password',
  path: '/reset-password'
},
{
  name: 'Admin Dashboard',
  path: '/admin'
},
{
  name: 'Projects',
  path: '/projects'
},
{
  name: 'Create Project',
  path: '/projects/new'
},
{
  name: 'Project Dashboard',
  path: '/projects/1'
},
{
  name: 'Project Settings',
  path: '/projects/1/settings'
},
{
  name: 'Panel Search',
  path: '/panel-search'
},
{
  name: 'Advanced Filters',
  path: '/panel-search/advanced'
},
{
  name: 'Search Results',
  path: '/panel-search/results'
},
{
  name: 'Saved Queries',
  path: '/saved-queries'
},
{
  name: 'Reports',
  path: '/reports'
},
{
  name: 'Report Templates',
  path: '/reports/templates'
},
{
  name: 'Report Builder',
  path: '/reports/builder'
},
{
  name: 'Report Preview',
  path: '/reports/preview'
},
{
  name: 'Data Import',
  path: '/data-import'
},
{
  name: 'Data Management',
  path: '/admin/data'
},
{
  name: 'DWG Viewer',
  path: '/dwg-viewer'
},
{
  name: 'DWG Upload',
  path: '/dwg-upload'
},
{
  name: 'DWG Processing',
  path: '/dwg-processing'
},
{
  name: 'Photos',
  path: '/photos'
},
{
  name: 'Photo Upload',
  path: '/photos/upload'
},
{
  name: 'Photo Detail',
  path: '/photos/1'
},
{
  name: 'AI Assistant',
  path: '/ai-assistant'
},
{
  name: 'Admin Panel',
  path: '/admin-panel'
},
{
  name: 'Create User',
  path: '/admin-panel/user/new'
},
{
  name: 'Sync Monitor',
  path: '/sync-monitor'
},
{
  name: 'Sync Config',
  path: '/admin/sync-config'
},
{
  name: 'Sitemap',
  path: '/sitemap'
},
{
  name: 'Mobile Dashboard',
  path: '/mobile'
},
{
  name: 'Mobile Scanner',
  path: '/mobile/scanner'
}];

export function PrototypePage() {
  const [activePath, setActivePath] = useState('/admin');
  return (
    <div className="h-screen flex flex-col bg-subtle-bg overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-card-bg border-b border-border flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <LayoutIcon className="w-5 h-5 text-accent" />
          <h1 className="font-heading text-[14px] font-bold text-text-primary uppercase tracking-wider hidden sm:block">
            PanelX Prototype Viewer
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={activePath}
            onChange={(e) => setActivePath(e.target.value)}
            className="px-3 py-1.5 border border-border bg-subtle-bg text-[13px] text-text-primary focus:outline-none focus:border-accent font-medium">
            
            {sitemap.map((item) =>
            <option key={item.path} value={item.path}>
                {item.name}
              </option>
            )}
          </select>

          <a
            href={activePath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider font-semibold text-text-secondary hover:text-accent transition-colors">
            
            <ExternalLinkIcon className="w-4 h-4" />{' '}
            <span className="hidden sm:inline">Open in new tab</span>
          </a>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Preview Area */}
        <div className="flex-1 bg-subtle-bg flex flex-col overflow-hidden relative w-full p-4 sm:p-8">
          <div className="bg-white shadow-2xl overflow-hidden border border-border flex flex-col w-full h-full rounded-sm">
            {/* Browser Header Mock */}
            <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-4 flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white border border-slate-200 rounded text-[11px] text-slate-500 px-3 py-1 text-center font-mono truncate">
                panelx.app{activePath}
              </div>
            </div>

            {/* Iframe Content */}
            <iframe
              src={`${activePath}?preview=true`}
              className="flex-1 w-full bg-white"
              title="Prototype Preview" />
            
          </div>
        </div>
      </div>
    </div>);

}