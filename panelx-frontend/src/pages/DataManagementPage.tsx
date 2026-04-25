import React, { useState } from 'react';
import {
  DatabaseIcon,
  DownloadIcon,
  Trash2Icon,
  RefreshCwIcon,
  SearchIcon } from
'lucide-react';
export function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<'panels' | 'materials' | 'issues'>(
    'panels'
  );
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide mb-1">
            Raw Data
          </h1>
          <p className="text-[13px] text-text-secondary">
            Manage raw database records and perform bulk operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-border text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors flex items-center gap-2">
            <DownloadIcon className="w-4 h-4" /> Export All
          </button>
        </div>
      </div>

      <div
        className="bg-card-bg border border-border animate-fade-up"
        style={{
          animationDelay: '50ms',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
        }}>
        
        <div className="flex border-b border-border overflow-x-auto hide-scrollbar bg-subtle-bg">
          {['panels', 'materials', 'issues'].map((tab) =>
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-heading text-[12px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-primary bg-card-bg' : 'text-text-secondary hover:text-text-primary'}`}>
            
              {tab}
              {activeTab === tab &&
            <div className="absolute top-0 left-0 w-full h-0.5 bg-primary" />
            }
            </button>
          )}
        </div>

        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-9 pr-4 py-2 border border-border bg-subtle-bg text-[13px] text-text-primary focus:outline-none focus:border-accent transition-colors" />
            
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-text-secondary hover:text-text-primary border border-border bg-subtle-bg transition-colors"
              title="Refresh">
              
              <RefreshCwIcon className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-status-problem hover:bg-status-problem hover:text-white border border-status-problem/30 transition-colors"
              title="Bulk Delete">
              
              <Trash2Icon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-subtle-bg">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent" />
                  
                </th>
                <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  ID
                </th>
                <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  Project
                </th>
                <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  Type
                </th>
                <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) =>
              <tr key={i} className="hover:bg-subtle-bg transition-colors">
                  <td className="p-4">
                    <input
                    type="checkbox"
                    className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent" />
                  
                  </td>
                  <td className="p-4 text-[13px] font-medium text-text-primary">
                    REC-{i}00{i}
                  </td>
                  <td className="p-4 text-[13px] text-text-secondary">
                    Tower A - Main Facade
                  </td>
                  <td className="p-4 text-[13px] text-text-secondary capitalize">
                    {activeTab.slice(0, -1)}
                  </td>
                  <td className="p-4 text-[13px] text-text-secondary">
                    2026-10-24
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-[11px] font-heading uppercase tracking-wider text-accent hover:underline font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between text-[12px] text-text-secondary">
          <span>Showing 1-5 of 2,450 records</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-border hover:bg-subtle-bg transition-colors disabled:opacity-50">
              Prev
            </button>
            <button className="px-3 py-1 border border-border hover:bg-subtle-bg transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>);

}