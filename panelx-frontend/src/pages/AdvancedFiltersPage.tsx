import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, FilterIcon, SaveIcon, XIcon } from 'lucide-react';
export function AdvancedFiltersPage() {
  const navigate = useNavigate();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [queryName, setQueryName] = useState('');
  const handleApply = () => {
    navigate('/panel-search/results');
  };
  const handleSave = () => {
    setShowSaveModal(false);
    navigate('/saved-queries');
  };
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <Link
          to="/panel-search"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4">
          
          <ArrowLeftIcon className="w-4 h-4" /> Back to Search
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
            <FilterIcon className="w-6 h-6 text-accent" /> Advanced Filters
          </h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-border text-[12px] font-heading font-semibold uppercase tracking-wider text-text-secondary hover:bg-subtle-bg transition-colors">
              Reset All
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 border border-accent text-[12px] font-heading font-semibold uppercase tracking-wider text-accent hover:bg-accent/10 transition-colors flex items-center gap-2">
              
              <SaveIcon className="w-4 h-4" /> Save as Query
            </button>
          </div>
        </div>
        <p className="text-[13px] text-text-secondary mt-2">3 active filters</p>
      </div>

      <div
        className="bg-card-bg border border-border p-8 animate-fade-up space-y-8"
        style={{
          animationDelay: '50ms',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
        }}>
        
        {/* Project & Floor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">
              Project
            </h3>
            <div className="space-y-3">
              {[
              'Tower A - Main Facade',
              'Building B - East Wing',
              'Residential Complex C',
              'Office Tower D'].
              map((p) =>
              <label
                key={p}
                className="flex items-center gap-3 cursor-pointer group">
                
                  <input
                  type="checkbox"
                  className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent" />
                
                  <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">
                    {p}
                  </span>
                </label>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">
              Floor Range
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-4 py-2 border border-border bg-subtle-bg text-[13px] focus:outline-none focus:border-accent" />
              
              <span className="text-text-secondary">to</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full px-4 py-2 border border-border bg-subtle-bg text-[13px] focus:outline-none focus:border-accent" />
              
            </div>
          </div>
        </div>

        {/* Type & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">
              Panel Type
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
              'Curtain Wall',
              'Spandrel',
              'Vision Glass',
              'Opaque',
              'Louver',
              'Corner Panel'].
              map((t) =>
              <label
                key={t}
                className="flex items-center gap-3 cursor-pointer group">
                
                  <input
                  type="checkbox"
                  className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent" />
                
                  <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">
                    {t}
                  </span>
                </label>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">
              Status
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
              'Installed',
              'Pending',
              'Problem',
              'Not Started',
              'In Transit',
              'Fabrication'].
              map((s) =>
              <label
                key={s}
                className="flex items-center gap-3 cursor-pointer group">
                
                  <input
                  type="checkbox"
                  className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent" />
                
                  <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">
                    {s}
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Dates & Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">
              Installation Date Range
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="date"
                className="w-full px-4 py-2 border border-border bg-subtle-bg text-[13px] text-text-secondary focus:outline-none focus:border-accent" />
              
              <span className="text-text-secondary">to</span>
              <input
                type="date"
                className="w-full px-4 py-2 border border-border bg-subtle-bg text-[13px] text-text-secondary focus:outline-none focus:border-accent" />
              
            </div>
          </div>
          <div>
            <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">
              Dimensions (mm)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-text-secondary w-12">
                  Width
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-1.5 border border-border bg-subtle-bg text-[13px] focus:outline-none focus:border-accent" />
                
                <span className="text-text-secondary">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-1.5 border border-border bg-subtle-bg text-[13px] focus:outline-none focus:border-accent" />
                
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-text-secondary w-12">
                  Height
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-1.5 border border-border bg-subtle-bg text-[13px] focus:outline-none focus:border-accent" />
                
                <span className="text-text-secondary">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-1.5 border border-border bg-subtle-bg text-[13px] focus:outline-none focus:border-accent" />
                
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex justify-end">
          <button
            onClick={handleApply}
            className="btn-primary px-8 h-12 text-white font-heading text-[13px] font-bold uppercase tracking-wider">
            
            Apply Filters
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal &&
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSaveModal(false)} />
        
          <div
          className="relative bg-card-bg border border-border w-full max-w-md p-6"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
          
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Save Query
              </h3>
              <button
              onClick={() => setShowSaveModal(false)}
              className="text-text-secondary hover:text-text-primary">
              
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Query Name
                </label>
                <input
                type="text"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                placeholder="e.g. Tower A Pending Panels"
                className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent" />
              
              </div>
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Description (Optional)
                </label>
                <textarea
                rows={2}
                className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent resize-none" />
              
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
              onClick={() => setShowSaveModal(false)}
              className="px-4 py-2 text-[12px] font-heading font-medium uppercase tracking-wider text-text-secondary hover:text-text-primary">
              
                Cancel
              </button>
              <button
              onClick={handleSave}
              disabled={!queryName}
              className="btn-primary px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50">
              
                Save Query
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}