import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  LayoutGridIcon,
  ListIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon } from
'lucide-react';
const mockResults = [
{
  id: 'PNL-A-0501',
  project: 'Tower A',
  floor: '5',
  type: 'Curtain Wall',
  status: 'Installed',
  date: '2026-03-15',
  dimensions: '1200x2400'
},
{
  id: 'PNL-A-0502',
  project: 'Tower A',
  floor: '5',
  type: 'Curtain Wall',
  status: 'Installed',
  date: '2026-03-15',
  dimensions: '1200x2400'
},
{
  id: 'PNL-A-0503',
  project: 'Tower A',
  floor: '5',
  type: 'Spandrel',
  status: 'Pending',
  date: '-',
  dimensions: '1200x800'
},
{
  id: 'PNL-B-1201',
  project: 'Building B',
  floor: '12',
  type: 'Vision Glass',
  status: 'Installed',
  date: '2026-03-10',
  dimensions: '1500x3000'
},
{
  id: 'PNL-B-1202',
  project: 'Building B',
  floor: '12',
  type: 'Vision Glass',
  status: 'Problem',
  date: '-',
  dimensions: '1500x3000'
},
{
  id: 'PNL-C-0201',
  project: 'Complex C',
  floor: '2',
  type: 'Opaque',
  status: 'Not Started',
  date: '-',
  dimensions: '900x2100'
}];

export function SearchResultsPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selected, setSelected] = useState<string[]>([]);
  const toggleSelectAll = () => {
    if (selected.length === mockResults.length) setSelected([]);else
    setSelected(mockResults.map((r) => r.id));
  };
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Installed':
        return 'bg-status-installed-bg text-status-installed-text border-status-installed/30';
      case 'Pending':
        return 'bg-status-pending-bg text-status-pending-text border-status-pending/30';
      case 'Problem':
        return 'bg-status-problem-bg text-status-problem-text border-status-problem/30';
      default:
        return 'bg-subtle-bg text-text-secondary border-border';
    }
  };
  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'Installed':
        return 'var(--status-installed)';
      case 'Pending':
        return 'var(--status-pending)';
      case 'Problem':
        return 'var(--status-problem)';
      default:
        return 'var(--border)';
    }
  };
  return (
    <div>
      <div className="mb-6 animate-fade-up">
        <Link
          to="/panel-search/advanced"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4">
          
          <ArrowLeftIcon className="w-4 h-4" /> Back to Filters
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
              Search Results
            </h1>
            <p className="text-[13px] text-text-secondary mt-1">
              Showing 1-6 of 156 results
            </p>
          </div>
          <div className="flex items-center gap-2 bg-card-bg border border-border p-1">
            <button
              onClick={() => setView('table')}
              className={`p-1.5 transition-colors ${view === 'table' ? 'bg-subtle-bg text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
              
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 transition-colors ${view === 'grid' ? 'bg-subtle-bg text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
              
              <LayoutGridIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div
        className="bg-card-bg border border-border p-3 mb-6 flex flex-wrap items-center justify-between gap-4 animate-fade-up"
        style={{
          animationDelay: '50ms'
        }}>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer pl-2">
            <input
              type="checkbox"
              checked={selected.length === mockResults.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent" />
            
            <span className="text-[12px] font-heading font-medium uppercase tracking-wider text-text-primary">
              Select All
            </span>
          </label>
          {selected.length > 0 &&
          <span className="text-[12px] text-accent font-medium">
              {selected.length} selected
            </span>
          }
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-1.5 border border-border bg-subtle-bg text-[12px] font-heading uppercase tracking-wider text-text-primary focus:outline-none focus:border-accent appearance-none disabled:opacity-50"
            disabled={selected.length === 0}>
            
            <option>Update Status...</option>
            <option>Set Installed</option>
            <option>Set Pending</option>
            <option>Report Problem</option>
          </select>
          <button
            disabled={selected.length === 0}
            className="px-3 py-1.5 border border-border bg-subtle-bg text-[12px] font-heading uppercase tracking-wider text-text-primary hover:bg-card-bg transition-colors disabled:opacity-50 flex items-center gap-2">
            
            <DownloadIcon className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Results */}
      <div
        className="animate-fade-up"
        style={{
          animationDelay: '100ms'
        }}>
        
        {view === 'table' ?
        <div
          className="bg-card-bg border border-border overflow-x-auto"
          style={{
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
          }}>
          
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-subtle-bg">
                  <th className="p-4 w-12"></th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Panel ID
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Project
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Floor
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Dimensions
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockResults.map((panel) =>
              <tr
                key={panel.id}
                className="hover:bg-subtle-bg transition-colors">
                
                    <td className="p-4">
                      <input
                    type="checkbox"
                    checked={selected.includes(panel.id)}
                    onChange={() => toggleSelect(panel.id)}
                    className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent" />
                  
                    </td>
                    <td className="p-4 text-[13px] font-bold text-text-primary">
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
                    <td className="p-4 text-[13px] text-text-secondary">
                      {panel.dimensions}
                    </td>
                    <td className="p-4">
                      <span
                    className={`inline-flex items-center px-2 py-1 text-[9px] font-heading font-semibold uppercase tracking-wider border ${getStatusColor(panel.status)}`}>
                    
                        {panel.status}
                      </span>
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {panel.date}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div> :

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockResults.map((panel) =>
          <div
            key={panel.id}
            className="bg-card-bg border border-border p-4 relative group"
            style={{
              borderLeft: `3px solid ${getStatusBorder(panel.status)}`,
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
            }}>
            
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                type="checkbox"
                checked={selected.includes(panel.id)}
                onChange={() => toggleSelect(panel.id)}
                className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent" />
              
                </div>
                <div className="mb-3">
                  <h3 className="font-heading text-[15px] font-bold text-text-primary">
                    {panel.id}
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {panel.project} • Floor {panel.floor}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 text-[12px]">
                  <div>
                    <span className="text-text-secondary block text-[10px] uppercase tracking-wider font-heading">
                      Type
                    </span>
                    <span className="text-text-primary font-medium">
                      {panel.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[10px] uppercase tracking-wider font-heading">
                      Dimensions
                    </span>
                    <span className="text-text-primary font-medium">
                      {panel.dimensions}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span
                className={`inline-flex items-center px-2 py-1 text-[9px] font-heading font-semibold uppercase tracking-wider border ${getStatusColor(panel.status)}`}>
                
                    {panel.status}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    {panel.date}
                  </span>
                </div>
              </div>
          )}
          </div>
        }
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-[13px] text-text-secondary">Page 1 of 8</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center border border-border bg-card-bg text-text-secondary disabled:opacity-50">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-border bg-card-bg text-text-primary hover:bg-subtle-bg">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-border bg-card-bg text-text-secondary hover:bg-subtle-bg">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-border bg-card-bg text-text-secondary hover:bg-subtle-bg">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-border bg-card-bg text-text-secondary hover:bg-subtle-bg">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>);

}