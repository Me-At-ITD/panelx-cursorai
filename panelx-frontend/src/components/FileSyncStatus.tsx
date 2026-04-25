import React from 'react';
import { RefreshCwIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useLanguage } from './LanguageContext';
interface SyncConnection {
  id: string;
  projectName: string;
  serverAddress: string;
  lastSync: string;
  status: 'active' | 'error';
}
const mockConnections: SyncConnection[] = [
{
  id: '1',
  projectName: 'Tower A - Main Facade',
  serverAddress: '192.168.1.100/sync',
  lastSync: '5 minutes ago',
  status: 'active'
},
{
  id: '2',
  projectName: 'Building B - East Wing',
  serverAddress: '192.168.1.101/sync',
  lastSync: '12 minutes ago',
  status: 'active'
},
{
  id: '3',
  projectName: 'Residential Complex C',
  serverAddress: '192.168.1.102/sync',
  lastSync: '2 hours ago',
  status: 'error'
}];

export function FileSyncStatus() {
  const { t } = useLanguage();
  return (
    <div
      className="bg-card-bg border border-border"
      style={{
        boxShadow:
        '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
        animation: 'fadeUp 0.35s ease both',
        animationDelay: '240ms'
      }}>
      
      {/* Header */}
      <div
        className="p-5 border-b border-border flex items-center gap-2"
        style={{
          borderLeft: '3px solid #059669',
          background: 'var(--bg-subtle)'
        }}>
        
        <RefreshCwIcon className="w-4 h-4 text-stat-syncs" />
        <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider">
          {t('File Sync Status')}
        </h2>
      </div>

      {/* Connection rows */}
      <div className="divide-y divide-border">
        {mockConnections.map((connection, index) =>
        <div
          key={connection.id}
          className="p-4 hover:bg-subtle-bg transition-colors"
          style={{
            borderLeft:
            connection.status === 'active' ?
            '2px solid rgba(22,163,74,0.4)' :
            '2px solid rgba(220,38,38,0.5)',
            animation: `fadeUp 0.2s ease both ${index * 30}ms`
          }}>
          
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0 mt-1">
                  {connection.status === 'active' ?
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 status-dot-online" /> :

                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-semibold text-text-primary truncate">
                    {connection.projectName}
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-0.5 truncate font-mono">
                    {connection.serverAddress}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-1">
                    {t('Last Sync')}: {connection.lastSync}
                  </p>
                </div>
              </div>
              <button className="px-3 py-1.5 border border-accent text-accent text-[11px] font-heading font-medium uppercase tracking-wider hover:bg-accent/5 transition-colors flex items-center gap-1.5 flex-shrink-0">
                <RefreshCwIcon className="w-3.5 h-3.5" />
                {t('SYNC')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

}