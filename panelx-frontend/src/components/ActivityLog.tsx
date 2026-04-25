import React from 'react';
import { ClockIcon, HistoryIcon } from 'lucide-react';
import { useLanguage } from './LanguageContext';
interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  avatar: string;
}
const mockActivities: Activity[] = [
{
  id: '1',
  user: 'David Levy',
  action: 'uploaded a DWG file to Project Tower A',
  timestamp: '2 hours ago',
  avatar: 'DL'
},
{
  id: '2',
  user: 'Sarah Cohen',
  action: 'updated panel status for Building B',
  timestamp: '4 hours ago',
  avatar: 'SC'
},
{
  id: '3',
  user: 'Michael Ben-David',
  action: 'created a new project: Residential Complex C',
  timestamp: '6 hours ago',
  avatar: 'MB'
},
{
  id: '4',
  user: 'Rachel Goldstein',
  action: 'uploaded 24 photos to Project Tower A',
  timestamp: '1 day ago',
  avatar: 'RG'
},
{
  id: '5',
  user: 'Admin User',
  action: 'added new user: Tom Shapiro',
  timestamp: '1 day ago',
  avatar: 'AD'
},
{
  id: '6',
  user: 'David Levy',
  action: 'generated progress report for Building B',
  timestamp: '2 days ago',
  avatar: 'DL'
},
{
  id: '7',
  user: 'Sarah Cohen',
  action: 'imported Excel data for Project Tower A',
  timestamp: '2 days ago',
  avatar: 'SC'
},
{
  id: '8',
  user: 'Michael Ben-David',
  action: 'marked 12 panels as installed',
  timestamp: '3 days ago',
  avatar: 'MB'
}];

export function ActivityLog() {
  const { t } = useLanguage();
  return (
    <div
      className="bg-card-bg border border-border"
      style={{
        boxShadow:
        '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
        animation: 'fadeUp 0.35s ease both',
        animationDelay: '180ms'
      }}>
      
      {/* Header */}
      <div
        className="p-5 border-b border-border flex items-center justify-between"
        style={{
          borderLeft: '3px solid #2E86AB',
          background: 'var(--bg-subtle)'
        }}>
        
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-4 h-4 text-accent" />
          <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider">
            {t('Recent Activity')}
          </h2>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1"
          style={{
            background: 'rgba(22,163,74,0.1)',
            border: '0.5px solid rgba(22,163,74,0.3)'
          }}>
          
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-dot-online" />
          <span className="font-heading text-[9px] text-green-700 dark:text-green-400 uppercase tracking-widest font-medium">
            Real-time
          </span>
        </div>
      </div>

      {/* Activity rows */}
      <div className="divide-y divide-border">
        {mockActivities.map((activity, index) =>
        <div
          key={activity.id}
          className="p-4 hover:bg-subtle-bg transition-colors"
          style={{
            animation:
            index < 10 ?
            `fadeUp 0.2s ease both ${index * 30}ms` :
            undefined
          }}>
          
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-heading font-bold flex-shrink-0">
                {activity.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-text-primary leading-relaxed">
                  <span className="font-semibold">{activity.user}</span>{' '}
                  {activity.action}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-text-secondary">
                  <ClockIcon className="w-3 h-3" />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

}