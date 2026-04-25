import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileTextIcon,
  RefreshCwIcon,
  EyeIcon,
  FilterIcon,
  UploadIcon,
  XIcon,
  Loader2Icon,
  CheckCircleIcon } from
'lucide-react';
const mockProcessingFiles = [
{
  id: '1',
  name: 'Floor_05_Facade.dwg',
  project: 'Tower A',
  date: '2026-10-24 14:30',
  status: 'Processing',
  panels: '-',
  duration: '2m 15s'
},
{
  id: '2',
  name: 'Floor_06_Facade.dwg',
  project: 'Tower A',
  date: '2026-10-24 14:28',
  status: 'Queued',
  panels: '-',
  duration: '-'
},
{
  id: '3',
  name: 'Elevation_South.dwg',
  project: 'Building B',
  date: '2026-10-24 13:15',
  status: 'Complete',
  panels: '450',
  duration: '5m 20s'
},
{
  id: '4',
  name: 'Roof_Details.dwg',
  project: 'Complex C',
  date: '2026-10-24 11:05',
  status: 'Failed',
  panels: '-',
  duration: '1m 10s'
},
{
  id: '5',
  name: 'Floor_01_Base.dwg',
  project: 'Tower A',
  date: '2026-10-23 09:00',
  status: 'Complete',
  panels: '320',
  duration: '4m 45s'
},
{
  id: '6',
  name: 'East_Wing_Elev.dwg',
  project: 'Building B',
  date: '2026-10-23 08:30',
  status: 'Complete',
  panels: '890',
  duration: '12m 30s'
},
{
  id: '7',
  name: 'Section_A.dwg',
  project: 'Complex C',
  date: '2026-10-22 16:45',
  status: 'Failed',
  panels: '-',
  duration: '0m 45s'
},
{
  id: '8',
  name: 'Floor_12_Facade.dwg',
  project: 'Tower D',
  date: '2026-10-22 10:15',
  status: 'Complete',
  panels: '410',
  duration: '6m 15s'
}];

export function DwgProcessingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [files, setFiles] = useState(mockProcessingFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  const projects = [
  'Tower A - Main Facade',
  'Building B - East Wing',
  'Residential Complex C',
  'Office Tower D',
  'Shopping Mall E',
  'Hospital Wing F'];

  const handleUploadFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      setUploadComplete(true);
      const newFiles = Array.from(fileList).map((file, i) => ({
        id: `new-${Date.now()}-${i}`,
        name: file.name,
        project: selectedProject,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'Queued',
        panels: '-',
        duration: '-'
      }));
      setFiles((prev) => [...newFiles, ...prev]);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStep(1);
        setSelectedProject('');
        setUploadProgress(0);
        setUploadComplete(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }, 1000);
    }, 2200);
  };
  const resetModal = () => {
    setShowUploadModal(false);
    setUploadStep(1);
    setSelectedProject('');
    setUploadProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider border bg-status-installed-bg text-status-installed-text border-status-installed/30">
            Complete
          </span>);

      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider border bg-status-pending-bg text-status-pending-text border-status-pending/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-pending animate-pulse" />
            Processing
          </span>);

      case 'Failed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider border bg-status-problem-bg text-status-problem-text border-status-problem/30">
            Failed
          </span>);

      case 'Queued':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider border bg-subtle-bg text-text-secondary border-border">
            Queued
          </span>);

    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide mb-1">
            DWG Processing Status
          </h1>
          <p className="text-[13px] text-text-secondary flex items-center gap-1.5">
            <RefreshCwIcon className="w-3.5 h-3.5 animate-spin-slow" />{' '}
            Auto-refreshing every 10s
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary h-10 px-4 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
          
          <UploadIcon className="w-4 h-4" />
          Upload DWG
        </button>
      </div>

      <div
        className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-up"
        style={{
          animationDelay: '50ms'
        }}>
        
        <div className="relative">
          <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <select className="w-full sm:w-48 pl-9 pr-4 py-2 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
            <option>All Statuses</option>
            <option>Processing</option>
            <option>Queued</option>
            <option>Complete</option>
            <option>Failed</option>
          </select>
        </div>
        <div className="relative">
          <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <select className="w-full sm:w-48 pl-9 pr-4 py-2 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
            <option>All Projects</option>
            <option>Tower A</option>
            <option>Building B</option>
            <option>Complex C</option>
          </select>
        </div>
      </div>

      {isLoading ?
      <div className="bg-card-bg border border-border p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) =>
          <div key={i} className="skeleton h-12 w-full" />
          )}
          </div>
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
                    File Name
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Project
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Panels Found
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {files.map((file) =>
              <tr
                key={file.id}
                className="hover:bg-subtle-bg transition-colors">
                
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
                        <FileTextIcon className="w-4 h-4 text-accent" />
                        {file.name}
                      </div>
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {file.project}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {file.date}
                    </td>
                    <td className="p-4">{getStatusBadge(file.status)}</td>
                    <td className="p-4 text-[13px] text-text-primary font-medium">
                      {file.panels}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {file.duration}
                    </td>
                    <td className="p-4 text-right">
                      {file.status === 'Failed' &&
                  <button className="px-3 py-1.5 border border-border text-[11px] font-heading uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors">
                          Retry
                        </button>
                  }
                      {file.status === 'Complete' &&
                  <Link
                    to="/dwg-viewer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-[11px] font-heading uppercase tracking-wider text-text-secondary hover:text-accent hover:border-accent transition-colors">
                    
                          <EyeIcon className="w-3.5 h-3.5" /> View
                        </Link>
                  }
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }

      {/* Upload Modal */}
      {showUploadModal &&
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={resetModal} />
        
          <div
          className="relative bg-card-bg border border-border w-full max-w-lg"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
          
            <div className="flex items-center justify-between p-4 border-b border-border bg-subtle-bg">
              <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider">
                Upload DWG — Step {uploadStep} of 2
              </h3>
              <button
              onClick={resetModal}
              className="text-text-secondary hover:text-text-primary">
              
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {uploadStep === 1 &&
            <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-heading uppercase tracking-wider text-text-secondary mb-2 font-semibold">
                      Select Project *
                    </label>
                    <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
                  
                      <option value="">Choose a project...</option>
                      {projects.map((p) =>
                  <option key={p} value={p}>
                          {p}
                        </option>
                  )}
                    </select>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                  onClick={() => setUploadStep(2)}
                  disabled={!selectedProject}
                  className="btn-primary px-6 py-2.5 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50">
                  
                      Continue
                    </button>
                  </div>
                </div>
            }

              {uploadStep === 2 &&
            <div className="space-y-4">
                  <p className="text-[12px] text-text-secondary">
                    Project:{' '}
                    <span className="font-medium text-text-primary">
                      {selectedProject}
                    </span>
                  </p>

                  {!isUploading && !uploadComplete &&
              <div
                className={`border-2 border-dashed p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? 'border-accent bg-accent/5' : 'border-border bg-subtle-bg hover:border-accent/50'}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleUploadFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}>
                
                      <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".dwg,.dxf"
                  multiple
                  onChange={(e) => handleUploadFiles(e.target.files)} />
                
                      <UploadIcon className="w-10 h-10 text-accent mb-3" />
                      <p className="font-heading text-[14px] font-bold text-text-primary mb-1">
                        Drag & drop DWG/DXF files
                      </p>
                      <p className="text-[12px] text-text-secondary mb-3">
                        or click to browse
                      </p>
                      <p className="text-[10px] text-text-placeholder">
                        Accepted: .dwg, .dxf — Max 250MB per file
                      </p>
                    </div>
              }

                  {(isUploading || uploadComplete) &&
              <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {uploadComplete ?
                  <CheckCircleIcon className="w-5 h-5 text-status-installed flex-shrink-0" /> :

                  <Loader2Icon className="w-5 h-5 text-accent animate-spin flex-shrink-0" />
                  }
                        <span className="text-[13px] font-medium text-text-primary">
                          {uploadComplete ? 'Upload complete!' : 'Uploading...'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-subtle-bg border border-border overflow-hidden">
                        <div
                    className="h-full bg-accent transition-all duration-300 ease-out"
                    style={{
                      width: `${uploadProgress}%`
                    }} />
                  
                      </div>
                      <p className="text-[11px] text-text-secondary text-right">
                        {uploadProgress}%
                      </p>
                    </div>
              }

                  {!isUploading && !uploadComplete &&
              <div className="flex justify-between pt-2">
                      <button
                  onClick={() => setUploadStep(1)}
                  className="px-4 py-2 border border-border text-[12px] font-heading font-medium uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors">
                  
                        Back
                      </button>
                    </div>
              }
                </div>
            }
            </div>
          </div>
        </div>
      }

      {/* Toast */}
      {showToast &&
      <div className="fixed bottom-6 right-6 z-[99999] bg-card-bg border border-status-installed/30 shadow-xl px-5 py-3 flex items-center gap-3 animate-fade-up">
          <CheckCircleIcon className="w-5 h-5 text-status-installed" />
          <span className="text-[13px] font-medium text-text-primary">
            DWG file uploaded successfully
          </span>
        </div>
      }
    </div>);

}