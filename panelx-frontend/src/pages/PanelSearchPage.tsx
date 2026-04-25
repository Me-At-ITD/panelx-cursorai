import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon } from
'lucide-react';
import { useLanguage } from '../components/LanguageContext';
const mockPanels = [
{
  id: 'PNL-A-0501',
  project: 'Tower A - Main Facade',
  floor: '5',
  type: 'Curtain Wall',
  status: 'Installed',
  date: '2026-03-15'
},
{
  id: 'PNL-A-0502',
  project: 'Tower A - Main Facade',
  floor: '5',
  type: 'Curtain Wall',
  status: 'Installed',
  date: '2026-03-15'
},
{
  id: 'PNL-A-0503',
  project: 'Tower A - Main Facade',
  floor: '5',
  type: 'Spandrel',
  status: 'Pending',
  date: '-'
},
{
  id: 'PNL-B-1201',
  project: 'Building B - East Wing',
  floor: '12',
  type: 'Vision Glass',
  status: 'Installed',
  date: '2026-03-10'
},
{
  id: 'PNL-B-1202',
  project: 'Building B - East Wing',
  floor: '12',
  type: 'Vision Glass',
  status: 'Problem',
  date: '-'
},
{
  id: 'PNL-C-0201',
  project: 'Residential Complex C',
  floor: '2',
  type: 'Louver',
  status: 'Pending',
  date: '-'
},
{
  id: 'PNL-C-0202',
  project: 'Residential Complex C',
  floor: '2',
  type: 'Louver',
  status: 'Installed',
  date: '2026-03-08'
},
{
  id: 'PNL-D-1501',
  project: 'Office Tower D',
  floor: '15',
  type: 'Curtain Wall',
  status: 'Pending',
  date: '-'
},
{
  id: 'PNL-D-1502',
  project: 'Office Tower D',
  floor: '15',
  type: 'Curtain Wall',
  status: 'Pending',
  date: '-'
},
{
  id: 'PNL-E-0101',
  project: 'Shopping Mall E',
  floor: '1',
  type: 'Vision Glass',
  status: 'Installed',
  date: '2026-03-01'
},
{
  id: 'PNL-E-0102',
  project: 'Shopping Mall E',
  floor: '1',
  type: 'Vision Glass',
  status: 'Installed',
  date: '2026-03-01'
},
{
  id: 'PNL-F-0801',
  project: 'Hospital Wing F',
  floor: '8',
  type: 'Spandrel',
  status: 'Installed',
  date: '2026-02-28'
}];

function TableSkeleton() {
  return (
    <div
      className="bg-card-bg border border-border"
      style={{
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
      }}>
      
      <div className="p-4 border-b border-border bg-subtle-bg flex gap-4">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-4 w-24" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
        <div key={i} className="p-4 flex gap-4 items-center">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-4 w-12" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-6 w-20" />
            <div className="skeleton h-4 w-24" />
          </div>
        )}
      </div>
    </div>);

}
export function PanelSearchPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Installed':
        return 'bg-status-installed-bg text-status-installed-text border-status-installed/30';
      case 'Problem':
        return 'bg-status-problem-bg text-status-problem-text border-status-problem/30';
      case 'Pending':
        return 'bg-status-pending-bg text-status-pending-text border-status-pending/30';
      default:
        return 'bg-subtle-bg text-text-secondary border-border';
    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          {t('Panel Search')}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/panel-search/advanced"
            className="px-4 py-2 text-[12px] font-heading uppercase tracking-wider font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
            
            <FilterIcon className="w-4 h-4" />
            {t('Advanced Filters')}
          </Link>
          <Link
            to="/saved-queries"
            className="px-4 py-2 text-[12px] font-heading uppercase tracking-wider font-semibold text-text-secondary hover:text-text-primary transition-colors">
            
            {t('Saved Queries')}
          </Link>
        </div>
      </div>

      {/* Search Bar - Inline with Button */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder={t('Search panels...')}
            className="w-full pl-12 pr-4 py-3 bg-card-bg border border-border text-[14px] text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent transition-colors" />
          
        </div>
        <button className="btn-primary px-8 py-3 text-white font-heading text-[13px] font-semibold uppercase tracking-wider whitespace-nowrap">
          {t('Search')}
        </button>
      </div>

      {isLoading ?
      <TableSkeleton /> :

      <div
        className="animate-fade-up"
        style={{
          animationDelay: '100ms'
        }}>
        
          <div className="p-4 border-t border-border bg-subtle-bg flex items-center justify-between">
            <div className="text-[12px] text-text-secondary">
              {t('Showing')}{' '}
              <span className="font-medium text-text-primary">1</span> to{' '}
              <span className="font-medium text-text-primary">6</span> {t('of')}{' '}
              <span className="font-medium text-text-primary">1,240</span>{' '}
              {t('results')}
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-border text-[11px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary hover:bg-card-bg transition-colors disabled:opacity-50">
                {t('Previous')}
              </button>
              <button className="px-3 py-1.5 border border-border text-[11px] font-heading uppercase tracking-wider text-text-primary hover:text-text-primary hover:bg-card-bg transition-colors">
                {t('Next')}
              </button>
            </div>
          </div>

          <div
          className="bg-card-bg border border-border overflow-x-auto"
          style={{
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
          }}>
          
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-card-bg">
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Panel ID')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Project')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Floor')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Panel Type')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Status')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider text-right">
                    {t('Installation Date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockPanels.map((panel, index) =>
              <tr
                key={index}
                className="hover:bg-subtle-bg transition-colors">
                
                    <td className="p-4 text-[13px] font-medium text-text-primary">
                      {panel.id}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {panel.project}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {panel.floor}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {panel.type}
                    </td>
                    <td className="p-4">
                      <span
                    className={`inline-flex items-center px-2 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider border ${getStatusColor(panel.status)}`}>
                    
                        {t(panel.status)}
                      </span>
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary text-right font-mono">
                      {panel.date}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>);

}