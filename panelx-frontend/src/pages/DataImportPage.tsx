import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadIcon,
  FileIcon,
  CheckCircleIcon,
  XCircleIcon,
  Loader2Icon,
  FilterIcon,
  XIcon } from
'lucide-react';
import { useLanguage } from '../components/LanguageContext';
const mockImports = [
{
  id: '1',
  file: 'tower_a_panels_march.xlsx',
  type: 'Excel',
  project: 'Tower A',
  user: 'David Levy',
  date: '2 hours ago',
  status: 'Success',
  rows: '1,250'
},
{
  id: '2',
  file: 'building_b_floor_plans.dwg',
  type: 'DWG',
  project: 'Building B',
  user: 'Sarah Cohen',
  date: '5 hours ago',
  status: 'Processing',
  rows: '-'
},
{
  id: '3',
  file: 'complex_c_updates.csv',
  type: 'CSV',
  project: 'Complex C',
  user: 'Michael Ben-David',
  date: '1 day ago',
  status: 'Failed',
  rows: '0'
},
{
  id: '4',
  file: 'tower_d_initial_import.xlsx',
  type: 'Excel',
  project: 'Office Tower D',
  user: 'Rachel Goldstein',
  date: '2 days ago',
  status: 'Success',
  rows: '3,100'
},
{
  id: '5',
  file: 'mall_e_revisions.dwg',
  type: 'DWG',
  project: 'Shopping Mall E',
  user: 'David Levy',
  date: '3 days ago',
  status: 'Success',
  rows: '-'
},
{
  id: '6',
  file: 'hospital_f_panels.csv',
  type: 'CSV',
  project: 'Hospital Wing F',
  user: 'Admin User',
  date: '1 week ago',
  status: 'Success',
  rows: '920'
}];

function UploadSkeleton() {
  return (
    <div className="border-2 border-dashed border-border p-12 flex flex-col items-center justify-center bg-subtle-bg h-[240px] mb-8">
      <div className="skeleton h-12 w-12 mb-4" />
      <div className="skeleton h-5 w-64 mb-2" />
      <div className="skeleton h-4 w-48" />
    </div>);

}
function TableSkeleton() {
  return (
    <div
      className="bg-card-bg border border-border"
      style={{
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
      }}>
      
      <div className="p-5 border-b border-border bg-subtle-bg">
        <div className="skeleton h-4 w-32" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5, 6].map((i) =>
        <div key={i} className="p-4 flex gap-4 items-center">
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-6 w-20" />
          </div>
        )}
      </div>
    </div>);

}
export function DataImportPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imports, setImports] = useState(mockImports);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('');
  const [modalDragging, setModalDragging] = useState(false);
  const [modalUploading, setModalUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const modalFileRef = useRef<HTMLInputElement>(null);
  const projects = [
  'Tower A - Main Facade',
  'Building B - East Wing',
  'Residential Complex C',
  'Office Tower D',
  'Shopping Mall E',
  'Hospital Wing F'];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const newImports = Array.from(files).map((file, index) => {
        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        return {
          id: `new-${Date.now()}-${index}`,
          file: file.name,
          type: ext,
          project: 'Unassigned',
          user: 'Current User',
          date: 'Just now',
          status: 'Processing',
          rows: '-'
        };
      });
      setImports((prev) => [...newImports, ...prev]);
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 1500);
  };
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Success':
        return (
          <div className="flex items-center gap-1.5 text-status-installed">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-[12px] font-medium">Success</span>
          </div>);

      case 'Processing':
        return (
          <div className="flex items-center gap-1.5 text-status-pending">
            <Loader2Icon className="w-4 h-4 animate-spin" />
            <span className="text-[12px] font-medium">Processing</span>
          </div>);

      case 'Failed':
        return (
          <div className="flex items-center gap-1.5 text-status-problem">
            <XCircleIcon className="w-4 h-4" />
            <span className="text-[12px] font-medium">Failed</span>
          </div>);

      default:
        return null;
    }
  };
  const getAcceptedFormats = () => {
    if (selectedDataType === 'Structural Calculations')
    return '.xlsx,.xls,.csv,.pdf';
    if (selectedDataType === 'Approved Details') return '.pdf,.dwg,.dxf,.xlsx';
    return '.xlsx,.xls,.csv,.pdf,.dwg,.dxf';
  };
  const getFormatLabel = () => {
    if (selectedDataType === 'Structural Calculations')
    return 'Excel (.xlsx, .xls), CSV, PDF';
    if (selectedDataType === 'Approved Details')
    return 'PDF, DWG, DXF, Excel (.xlsx)';
    return 'All supported formats';
  };
  const handleModalUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setModalUploading(true);
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
      setModalUploading(false);
      setUploadComplete(true);
      const newImports = Array.from(fileList).map((file, i) => ({
        id: `modal-${Date.now()}-${i}`,
        file: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        project: selectedProject,
        user: 'Current User',
        date: 'Just now',
        status: 'Processing',
        rows: '-'
      }));
      setImports((prev) => [...newImports, ...prev]);
      setTimeout(() => {
        resetModal();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }, 1000);
    }, 2200);
  };
  const resetModal = () => {
    setShowUploadModal(false);
    setUploadStep(1);
    setSelectedProject('');
    setSelectedDataType('');
    setUploadProgress(0);
    setModalUploading(false);
    setUploadComplete(false);
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          {t('Data Import')}
        </h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary h-10 px-4 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
          
          <UploadIcon className="w-4 h-4" />
          Upload Data
        </button>
      </div>

      {isLoading ?
      <TableSkeleton /> :

      <div
        className="bg-card-bg border border-border animate-fade-up"
        style={{
          animationDelay: '100ms',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
        }}>
        
          <div className="p-4 border-b border-border bg-subtle-bg flex items-center justify-between">
            <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider">
              {t('Import History')}
            </h2>
            <div className="relative">
              <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
              <select className="pl-8 pr-4 py-1.5 border border-border bg-card-bg text-[11px] font-heading uppercase tracking-wider text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
                <option>{t('All Projects')}</option>
                <option>Tower A</option>
                <option>Building B</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-card-bg">
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('File')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Type')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Project')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('User')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Date')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    {t('Rows')}
                  </th>
                  <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider text-right">
                    {t('Status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {imports.map((item) =>
              <tr
                key={item.id}
                className="hover:bg-subtle-bg transition-colors">
                
                    <td className="p-4 text-[13px] font-medium text-text-primary flex items-center gap-2">
                      <FileIcon className="w-4 h-4 text-text-placeholder" />
                      {item.file}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {item.type}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {item.project}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {item.user}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary">
                      {item.date}
                    </td>
                    <td className="p-4 text-[13px] text-text-secondary font-mono">
                      {item.rows}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'Success' &&
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    }
                        {item.status === 'Processing' &&
                    <Loader2Icon className="w-4 h-4 text-accent animate-spin" />
                    }
                        {item.status === 'Failed' &&
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                    }
                        <span
                      className={`text-[12px] font-medium ${item.status === 'Success' ? 'text-green-600 dark:text-green-400' : item.status === 'Failed' ? 'text-red-600 dark:text-red-400' : 'text-accent'}`}>
                      
                          {t(item.status)}
                        </span>
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }

      {/* Upload Data Modal */}
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
                Upload Data — Step {uploadStep} of 2
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
                  <div>
                    <label className="block text-[11px] font-heading uppercase tracking-wider text-text-secondary mb-2 font-semibold">
                      Data Type *
                    </label>
                    <select
                  value={selectedDataType}
                  onChange={(e) => setSelectedDataType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
                  
                      <option value="">Choose data type...</option>
                      <option value="Structural Calculations">
                        Structural Calculations
                      </option>
                      <option value="Approved Details">Approved Details</option>
                    </select>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                  onClick={() => setUploadStep(2)}
                  disabled={!selectedProject || !selectedDataType}
                  className="btn-primary px-6 py-2.5 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50">
                  
                      Continue
                    </button>
                  </div>
                </div>
            }

              {uploadStep === 2 &&
            <div className="space-y-4">
                  <div className="text-[12px] text-text-secondary space-y-1">
                    <p>
                      Project:{' '}
                      <span className="font-medium text-text-primary">
                        {selectedProject}
                      </span>
                    </p>
                    <p>
                      Type:{' '}
                      <span className="font-medium text-text-primary">
                        {selectedDataType}
                      </span>
                    </p>
                  </div>

                  {!modalUploading && !uploadComplete &&
              <div
                className={`border-2 border-dashed p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${modalDragging ? 'border-accent bg-accent/5' : 'border-border bg-subtle-bg hover:border-accent/50'}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setModalDragging(true);
                }}
                onDragLeave={() => setModalDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setModalDragging(false);
                  handleModalUpload(e.dataTransfer.files);
                }}
                onClick={() => modalFileRef.current?.click()}>
                
                      <input
                  type="file"
                  ref={modalFileRef}
                  className="hidden"
                  accept={getAcceptedFormats()}
                  multiple
                  onChange={(e) => handleModalUpload(e.target.files)} />
                
                      <UploadIcon className="w-10 h-10 text-accent mb-3" />
                      <p className="font-heading text-[14px] font-bold text-text-primary mb-1">
                        Drag & drop files
                      </p>
                      <p className="text-[12px] text-text-secondary mb-3">
                        or click to browse
                      </p>
                      <p className="text-[10px] text-text-placeholder">
                        Accepted: {getFormatLabel()}
                      </p>
                    </div>
              }

                  {(modalUploading || uploadComplete) &&
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

                  {!modalUploading && !uploadComplete &&
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
            Data uploaded successfully
          </span>
        </div>
      }
    </div>);

}