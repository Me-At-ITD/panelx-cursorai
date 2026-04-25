import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloudIcon,
  FileIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowLeftIcon } from
'lucide-react';
export function DwgUploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<
    'idle' | 'uploading' | 'success' | 'error'>(
    'idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };
  const validateAndSetFile = (selectedFile: File) => {
    const validExtensions = ['.dwg', '.dxf'];
    const fileExtension = selectedFile.name.
    substring(selectedFile.name.lastIndexOf('.')).
    toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      setUploadState('error');
      return;
    }
    if (selectedFile.size > 250 * 1024 * 1024) {
      // 250MB
      setUploadState('error');
      return;
    }
    setFile(selectedFile);
    setUploadState('idle');
  };
  const handleUpload = () => {
    if (!file) return;
    setUploadState('uploading');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState('success');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };
  const resetUpload = () => {
    setFile(null);
    setUploadState('idle');
    setProgress(0);
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <Link
          to="/dwg-viewer"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4">
          
          <ArrowLeftIcon className="w-4 h-4" /> Back to Viewer
        </Link>
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          Upload DWG File
        </h1>
        <p className="text-[13px] text-text-secondary mt-1">
          Upload AutoCAD drawing files for processing and panel extraction.
        </p>
      </div>

      <div
        className="bg-card-bg border border-border p-8 animate-fade-up"
        style={{
          animationDelay: '50ms',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
        }}>
        
        {uploadState === 'idle' && !file &&
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent hover:bg-subtle-bg'}`}>
          
            <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".dwg,.dxf"
            className="hidden" />
          
            <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-accent text-white' : 'bg-subtle-bg text-text-secondary'}`}>
            
              <UploadCloudIcon className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
              Drag a DWG file here
            </h3>
            <p className="text-[13px] text-text-secondary mb-6">
              or click to browse from your computer
            </p>
            <div className="flex items-center gap-4 text-[11px] font-heading uppercase tracking-wider text-text-secondary">
              <span className="px-2 py-1 bg-subtle-bg border border-border">
                .DWG
              </span>
              <span className="px-2 py-1 bg-subtle-bg border border-border">
                .DXF
              </span>
              <span>Max 250MB</span>
            </div>
          </div>
        }

        {uploadState === 'error' && !file &&
        <div className="border-2 border-dashed border-status-problem p-16 flex flex-col items-center justify-center text-center bg-status-problem-bg">
            <div className="w-16 h-16 rounded-full bg-status-problem/20 flex items-center justify-center mb-4 text-status-problem">
              <AlertCircleIcon className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-lg font-bold text-status-problem mb-2">
              Invalid File
            </h3>
            <p className="text-[13px] text-text-secondary mb-6">
              Please ensure the file is a .dwg or .dxf and under 250MB.
            </p>
            <button
            onClick={resetUpload}
            className="btn-primary px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider">
            
              Try Again
            </button>
          </div>
        }

        {file && uploadState === 'idle' &&
        <div className="border border-border p-6 bg-subtle-bg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 flex items-center justify-center text-accent">
                  <FileIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium text-text-primary text-[14px]">
                    {file.name}
                  </h4>
                  <p className="text-[12px] text-text-secondary">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
              onClick={resetUpload}
              className="text-text-secondary hover:text-status-problem transition-colors">
              
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button
              onClick={resetUpload}
              className="px-4 py-2 text-[12px] font-heading font-medium uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors">
              
                Cancel
              </button>
              <button
              onClick={handleUpload}
              className="btn-primary px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider">
              
                Upload File
              </button>
            </div>
          </div>
        }

        {uploadState === 'uploading' && file &&
        <div className="border border-border p-8 text-center">
            <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
              Uploading & Processing
            </h3>
            <p className="text-[13px] text-text-secondary mb-8">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>

            <div className="w-full max-w-md mx-auto mb-4">
              <div className="flex justify-between text-[11px] font-heading uppercase tracking-wider text-text-secondary mb-2">
                <span>Progress</span>
                <span className="text-accent font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-subtle-bg overflow-hidden">
                <div
                className="h-full bg-accent transition-all duration-300 ease-out"
                style={{
                  width: `${progress}%`
                }} />
              
              </div>
            </div>

            <button
            onClick={resetUpload}
            className="text-[12px] text-text-secondary hover:text-status-problem transition-colors font-medium mt-4">
            
              Cancel Upload
            </button>
          </div>
        }

        {uploadState === 'success' &&
        <div className="border border-border p-12 text-center bg-status-installed-bg">
            <div className="w-20 h-20 bg-status-installed/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-status-installed" />
            </div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
              Processing Complete!
            </h3>
            <p className="text-[14px] text-text-secondary mb-8">
              Successfully extracted 2,450 panels from {file?.name}
            </p>
            <div className="flex justify-center gap-4">
              <button
              onClick={resetUpload}
              className="px-6 py-2 border border-border text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors bg-card-bg">
              
                Upload Another
              </button>
              <Link
              to="/dwg-viewer"
              className="btn-primary px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
              
                Open DWG Viewer
              </Link>
            </div>
          </div>
        }
      </div>
    </div>);

}