import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCwIcon,
  ServerIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  XIcon,
  SettingsIcon } from
'lucide-react';
import { useLanguage } from '../components/LanguageContext';
const mockSyncData = [
{
  id: '1',
  project: 'Tower A - Main Facade',
  server: 'sftp.tower-a.local',
  lastSync: '2 mins ago',
  filesSynced: 12,
  status: 'Active'
},
{
  id: '2',
  project: 'Building B - East Wing',
  server: 'ftp.build-b.net',
  lastSync: '15 mins ago',
  filesSynced: 4,
  status: 'Active'
},
{
  id: '3',
  project: 'Residential Complex C',
  server: '192.168.1.105',
  lastSync: '2 hours ago',
  filesSynced: 0,
  status: 'Error'
},
{
  id: '4',
  project: 'Office Tower D',
  server: 'sftp.office-d.com',
  lastSync: 'Just now',
  filesSynced: 45,
  status: 'Syncing'
},
{
  id: '5',
  project: 'Shopping Mall E',
  server: 'ftp.mall-e.local',
  lastSync: '1 day ago',
  filesSynced: 0,
  status: 'Disabled'
},
{
  id: '6',
  project: 'Hospital Wing F',
  server: '10.0.0.55',
  lastSync: '5 mins ago',
  filesSynced: 2,
  status: 'Active'
}];

export function SyncMonitorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-status-installed text-status-installed';
      case 'Syncing':
        return 'bg-status-pending text-status-pending';
      case 'Error':
        return 'bg-status-problem text-status-problem';
      case 'Disabled':
        return 'bg-text-secondary text-text-secondary';
      default:
        return 'bg-text-secondary text-text-secondary';
    }
  };
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-status-installed-bg border-status-installed/30';
      case 'Syncing':
        return 'bg-status-pending-bg border-status-pending/30';
      case 'Error':
        return 'bg-status-problem-bg border-status-problem/30';
      case 'Disabled':
        return 'bg-subtle-bg border-border';
      default:
        return 'bg-subtle-bg border-border';
    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide mb-1">
            {t('Sync Monitor')}
          </h1>
          <p className="text-[13px] text-text-secondary flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5" /> Last refreshed: 30s ago
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/admin/sync-config"
            className="px-4 py-2 border border-border text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors flex items-center gap-2 justify-center flex-1 sm:flex-none">
            
            <SettingsIcon className="w-4 h-4" />
            {t('File Sync')}
          </Link>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-primary px-4 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2 justify-center flex-1 sm:flex-none disabled:opacity-50">
            
            <RefreshCwIcon
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            
            {t('Refresh Status')}
          </button>
        </div>
      </div>

      {isLoading ?
      <div className="bg-card-bg border border-border">
          <div className="p-4 border-b border-border flex gap-4">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-6 w-32" />
          </div>
          {[1, 2, 3, 4, 5].map((i) =>
        <div
          key={i}
          className="p-4 border-b border-border flex items-center justify-between">
          
              <div className="flex items-center gap-4 w-1/3">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="space-y-2 w-full">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
              <div className="skeleton h-6 w-24" />
              <div className="skeleton h-8 w-20" />
            </div>
        )}
        </div> :

      <div
        className="bg-card-bg border border-border animate-fade-up"
        style={{
          animationDelay: '100ms',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
        }}>
        
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-subtle-bg">
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Project')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Server')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Last Sync')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Files Synced')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Status')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider text-right">
                    {t('Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockSyncData.map((row) =>
              <tr
                key={row.id}
                className="hover:bg-subtle-bg transition-colors">
                
                    <td className="p-4">
                      <div className="text-[13px] font-medium text-text-primary">
                        {row.project}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                        <ServerIcon className="w-3.5 h-3.5" />
                        {row.server}
                      </div>
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {row.lastSync}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-[13px] text-text-primary">
                        <FileTextIcon className="w-3.5 h-3.5 text-accent" />
                        {row.filesSynced}
                      </div>
                    </td>
                    <td className="p-4">
                      <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 border ${getStatusBg(row.status)}`}>
                    
                        <div
                      className={`w-1.5 h-1.5 rounded-full ${getStatusColor(row.status).split(' ')[0]}`} />
                    
                        <span
                      className={`text-[10px] font-heading font-semibold uppercase tracking-wider ${getStatusColor(row.status).split(' ')[1]}`}>
                      
                          {t(row.status)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                      onClick={() => setSelectedLog(row.project)}
                      className="text-[11px] font-heading uppercase tracking-wider text-accent hover:underline font-medium">
                      
                          View Log
                        </button>
                        <button
                      disabled={
                      row.status === 'Disabled' ||
                      row.status === 'Syncing'
                      }
                      className="px-3 py-1.5 border border-border text-[11px] font-heading uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      
                          {t('Sync Now')}
                        </button>
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }

      {/* Log Modal */}
      {selectedLog &&
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedLog(null)} />
        
          <div
          className="relative bg-card-bg border border-border w-full max-w-2xl flex flex-col max-h-[80vh]"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
          
            <div className="flex items-center justify-between p-4 border-b border-border bg-subtle-bg">
              <div>
                <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider">
                  Sync Log
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {selectedLog}
                </p>
              </div>
              <button
              onClick={() => setSelectedLog(null)}
              className="text-text-secondary hover:text-text-primary">
              
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-[#0F172A] font-mono text-[11px] text-slate-300 space-y-1.5">
              <div className="text-slate-500">
                [2026-10-24 14:30:01] Starting sync process...
              </div>
              <div className="text-slate-500">
                [2026-10-24 14:30:02] Connecting to sftp.server.local:22...
              </div>
              <div className="text-emerald-400">
                [2026-10-24 14:30:03] Connection established successfully.
              </div>
              <div className="text-slate-500">
                [2026-10-24 14:30:03] Scanning remote directory /dwg_files...
              </div>
              <div className="text-slate-300">
                [2026-10-24 14:30:05] Found 3 new files, 1 modified file.
              </div>
              <div className="text-slate-300">
                [2026-10-24 14:30:06] Downloading Floor_05_Facade.dwg (2.4MB)...
              </div>
              <div className="text-emerald-400">
                [2026-10-24 14:30:08] Download complete.
              </div>
              <div className="text-slate-300">
                [2026-10-24 14:30:08] Downloading Floor_06_Facade.dwg (2.6MB)...
              </div>
              <div className="text-emerald-400">
                [2026-10-24 14:30:11] Download complete.
              </div>
              <div className="text-slate-300">
                [2026-10-24 14:30:11] Downloading Elevation_South.dwg (5.1MB)...
              </div>
              <div className="text-emerald-400">
                [2026-10-24 14:30:16] Download complete.
              </div>
              <div className="text-slate-500">
                [2026-10-24 14:30:17] Updating local database records...
              </div>
              <div className="text-emerald-400">
                [2026-10-24 14:30:18] Sync completed successfully. 4 files
                processed.
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button
              onClick={() => setSelectedLog(null)}
              className="px-4 py-2 text-[12px] font-heading font-medium uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors border border-border">
              
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}