import React from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  FolderIcon,
  CameraIcon,
  SearchIcon,
  MenuIcon,
  FileTextIcon,
  FileBarChartIcon,
  ArrowRightIcon } from
'lucide-react';
export function MobileDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 sticky top-0 z-10 flex-shrink-0">
        <img
          src="/logo.png"
          alt="Design L.EFRAIM LTD."
          className="h-7 object-contain" />
        
        <div className="w-8 h-8 rounded-full bg-[#2E86AB] flex items-center justify-center text-white text-[10px] font-heading font-bold">
          DL
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="font-heading text-xl font-bold text-slate-900">
            Good morning, David
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ready to review your drawings?
          </p>
        </div>

        {/* PRIMARY ACTIONS - Drawing First Hierarchy */}
        <div className="space-y-3">
          <Link
            to="/dwg-viewer"
            className="w-full h-20 bg-[#004a64] text-white flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform relative overflow-hidden">
            
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                backgroundSize: '10px 10px'
              }} />
            
            <FileTextIcon className="w-8 h-8 relative z-10" />
            <span className="font-heading text-[16px] font-bold uppercase tracking-wider relative z-10">
              Open Drawing
            </span>
          </Link>

          <Link
            to="/photos/upload"
            className="w-full h-16 bg-white border border-slate-200 text-slate-800 flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform">
            
            <CameraIcon className="w-6 h-6 text-[#2E86AB]" />
            <span className="font-heading text-[14px] font-bold uppercase tracking-wider">
              Take Photo
            </span>
          </Link>

          <div className="flex gap-3">
            <Link
              to="/panel-search"
              className="flex-1 h-14 bg-white border border-slate-200 text-slate-700 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
              
              <SearchIcon className="w-5 h-5 text-slate-400" />
              <span className="font-heading text-[11px] font-bold uppercase tracking-wider">
                Search Panel
              </span>
            </Link>
            <Link
              to="/reports/builder"
              className="flex-1 h-14 bg-white border border-slate-200 text-slate-700 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
              
              <FileBarChartIcon className="w-5 h-5 text-slate-400" />
              <span className="font-heading text-[11px] font-bold uppercase tracking-wider">
                Create Report
              </span>
            </Link>
          </div>
        </div>

        {/* RECENT DRAWINGS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-[12px] font-bold text-slate-900 uppercase tracking-wider">
              Recent Drawings
            </h2>
            <Link
              to="/projects"
              className="text-[11px] text-[#2E86AB] font-bold uppercase tracking-wider flex items-center gap-1">
              
              View All <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-6 px-6">
            {[
            {
              project: 'Tower A',
              file: 'Floor_05_Facade.dwg',
              time: '2h ago'
            },
            {
              project: 'Building B',
              file: 'Ground_Floor.dwg',
              time: '5h ago'
            }].
            map((dwg, i) =>
            <Link
              to="/dwg-viewer"
              key={i}
              className="flex-shrink-0 w-[220px] bg-white border border-slate-200 shadow-sm snap-start flex flex-col active:scale-95 transition-transform">
              
                <div className="h-[100px] bg-slate-50 border-b border-slate-200 relative overflow-hidden flex items-center justify-center">
                  <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                    'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                  }} />
                
                  <FileTextIcon className="w-8 h-8 text-slate-300 relative z-10" />
                </div>
                <div className="p-3">
                  <h3 className="font-heading text-[12px] font-bold text-slate-900 truncate">
                    {dwg.file}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {dwg.project}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-2 font-mono">
                    {dwg.time}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Active Projects (Minimized) */}
        <div>
          <h2 className="font-heading text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-3">
            Active Projects
          </h2>
          <div className="space-y-3">
            {[
            {
              name: 'Tower A - Main Facade',
              progress: 67,
              status: 'Active'
            },
            {
              name: 'Building B - East Wing',
              progress: 100,
              status: 'Completed'
            }].
            map((p, i) =>
            <div
              key={i}
              className="bg-white border border-slate-200 p-4 shadow-sm">
              
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-heading text-[13px] font-bold text-slate-900">
                    {p.name}
                  </h3>
                  <span
                  className={`px-2 py-0.5 text-[9px] font-heading uppercase tracking-wider font-bold border ${p.status === 'Active' ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30' : 'bg-[#2E86AB]/10 text-[#2E86AB] border-[#2E86AB]/30'}`}>
                  
                    {p.status}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 overflow-hidden">
                  <div
                  className="h-full bg-[#2E86AB]"
                  style={{
                    width: `${p.progress}%`
                  }} />
                
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex items-center justify-around h-16 pb-safe z-50">
        <Link
          to="/mobile"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#2E86AB]">
          
          <HomeIcon className="w-5 h-5" />
          <span className="text-[9px] font-heading uppercase tracking-wider font-bold">
            Home
          </span>
        </Link>
        <Link
          to="/projects"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#2E86AB]">
          
          <FolderIcon className="w-5 h-5" />
          <span className="text-[9px] font-heading uppercase tracking-wider font-bold">
            Projects
          </span>
        </Link>
        <div className="relative -top-5">
          <Link
            to="/dwg-viewer"
            className="w-14 h-14 bg-[#004a64] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-[#F8FAFC] hover:scale-105 transition-transform">
            
            <FileTextIcon className="w-6 h-6" />
          </Link>
        </div>
        <Link
          to="/photos"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#2E86AB]">
          
          <CameraIcon className="w-5 h-5" />
          <span className="text-[9px] font-heading uppercase tracking-wider font-bold">
            Photos
          </span>
        </Link>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#2E86AB]">
          <MenuIcon className="w-5 h-5" />
          <span className="text-[9px] font-heading uppercase tracking-wider font-bold">
            More
          </span>
        </button>
      </nav>
    </div>);

}