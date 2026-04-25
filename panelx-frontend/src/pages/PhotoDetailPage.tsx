import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  Trash2Icon,
  Edit2Icon,
  CheckIcon } from
'lucide-react';
export function PhotoDetailPage() {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [caption, setCaption] = useState(
    'Tower A - Floor 5 Installation Progress'
  );
  const [tempCaption, setTempCaption] = useState(caption);
  const saveCaption = () => {
    setCaption(tempCaption);
    setIsEditingCaption(false);
  };
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 animate-fade-up flex-shrink-0">
        <Link
          to="/photos"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors">
          
          <ArrowLeftIcon className="w-4 h-4" /> Back to Gallery
        </Link>
      </div>

      <div
        className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 animate-fade-up"
        style={{
          animationDelay: '50ms'
        }}>
        
        {/* Main Image Area */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden group border border-border">
          <img
            src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&h=800&fit=crop"
            alt={caption}
            className="max-w-full max-h-full object-contain" />
          

          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent">
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col bg-card-bg border border-border flex-shrink-0 overflow-y-auto">
          <div className="p-6 border-b border-border">
            <h3 className="font-heading text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
              Caption
            </h3>
            {isEditingCaption ?
            <div className="flex gap-2">
                <textarea
                value={tempCaption}
                onChange={(e) => setTempCaption(e.target.value)}
                className="flex-1 px-3 py-2 border border-accent bg-subtle-bg text-[13px] text-text-primary focus:outline-none resize-none"
                rows={3}
                autoFocus />
              
                <button
                onClick={saveCaption}
                className="w-8 h-8 bg-accent text-white flex items-center justify-center flex-shrink-0">
                
                  <CheckIcon className="w-4 h-4" />
                </button>
              </div> :

            <div className="flex items-start justify-between group/caption">
                <p className="text-[14px] text-text-primary font-medium leading-snug pr-4">
                  {caption}
                </p>
                <button
                onClick={() => setIsEditingCaption(true)}
                className="text-text-secondary hover:text-accent opacity-0 group-hover/caption:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                
                  <Edit2Icon className="w-4 h-4" />
                </button>
              </div>
            }
          </div>

          <div className="p-6 space-y-6 flex-1">
            <div>
              <h3 className="font-heading text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                Project
              </h3>
              <p className="text-[13px] text-text-primary">
                Tower A - Main Facade
              </p>
            </div>
            <div>
              <h3 className="font-heading text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                Location
              </h3>
              <p className="text-[13px] text-text-primary">
                Floor 5, North Elevation
              </p>
            </div>
            <div>
              <h3 className="font-heading text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                Date Taken
              </h3>
              <p className="text-[13px] text-text-primary">
                Oct 24, 2026 at 14:30
              </p>
            </div>
            <div>
              <h3 className="font-heading text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                Photographer
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-[9px] font-heading font-bold">
                  DL
                </div>
                <p className="text-[13px] text-text-primary">David Levy</p>
              </div>
            </div>
            <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-heading text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Dimensions
                </h3>
                <p className="text-[13px] text-text-primary">4032 x 3024</p>
              </div>
              <div>
                <h3 className="font-heading text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  File Size
                </h3>
                <p className="text-[13px] text-text-primary">3.2 MB</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border bg-subtle-bg flex flex-col gap-3">
            <button className="w-full px-4 py-2 border border-border bg-card-bg text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors flex items-center justify-center gap-2">
              <DownloadIcon className="w-4 h-4" /> Download Original
            </button>
            <button className="w-full px-4 py-2 border border-status-problem/30 text-[12px] font-heading font-semibold uppercase tracking-wider text-status-problem hover:bg-status-problem hover:text-white transition-colors flex items-center justify-center gap-2">
              <Trash2Icon className="w-4 h-4" /> Delete Photo
            </button>
          </div>
        </div>
      </div>
    </div>);

}