import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UploadCloudIcon,
  XIcon,
  CheckCircleIcon,
  CameraIcon } from
'lucide-react';
export function PhotoUploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadState, setUploadState] = useState<
    'idle' | 'uploading' | 'success'>(
    'idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handleUpload = () => {
    if (files.length === 0) return;
    setUploadState('uploading');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState('success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <Link
          to="/photos"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4">
          
          <ArrowLeftIcon className="w-4 h-4" /> Back to Gallery
        </Link>
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          Upload Photos
        </h1>
      </div>

      {uploadState === 'success' ?
      <div className="bg-status-installed-bg border border-status-installed/30 p-12 text-center animate-fade-up">
          <div className="w-20 h-20 bg-status-installed/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-status-installed" />
          </div>
          <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
            Upload Complete!
          </h3>
          <p className="text-[14px] text-text-secondary mb-8">
            Successfully uploaded {files.length} photos to the gallery.
          </p>
          <div className="flex justify-center gap-4">
            <button
            onClick={() => {
              setFiles([]);
              setUploadState('idle');
              setProgress(0);
            }}
            className="px-6 py-2 border border-border text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors bg-card-bg">
            
              Upload More
            </button>
            <Link
            to="/photos"
            className="btn-primary px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
            
              View Gallery
            </Link>
          </div>
        </div> :

      <div className="space-y-6">
          {files.length === 0 ?
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-card-bg ${isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent hover:bg-subtle-bg'}`}>
          
              <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg, image/png, image/webp"
            multiple
            className="hidden" />
          
              <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-accent text-white' : 'bg-subtle-bg text-text-secondary'}`}>
            
                <UploadCloudIcon className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                Drag photos here
              </h3>
              <p className="text-[13px] text-text-secondary mb-6">
                or click to browse from your device
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-xs mx-auto">
                <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex-1 py-2.5 border border-border bg-card-bg text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors flex items-center justify-center gap-2">
              
                  <UploadCloudIcon className="w-4 h-4" /> Browse
                </button>
                <button
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
              className="flex-1 py-2.5 border border-accent bg-accent/10 text-[12px] font-heading font-semibold uppercase tracking-wider text-accent hover:bg-accent hover:text-white transition-colors flex items-center justify-center gap-2">
              
                  <CameraIcon className="w-4 h-4" /> Camera
                </button>
                <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              capture="environment"
              className="hidden" />
            
              </div>

              <div className="flex items-center gap-4 text-[11px] font-heading uppercase tracking-wider text-text-secondary">
                <span className="px-2 py-1 bg-subtle-bg border border-border">
                  .JPG
                </span>
                <span className="px-2 py-1 bg-subtle-bg border border-border">
                  .PNG
                </span>
                <span className="px-2 py-1 bg-subtle-bg border border-border">
                  .WEBP
                </span>
              </div>
            </div> :

        <div className="animate-fade-up">
              <div className="bg-card-bg border border-border p-4 mb-6 flex flex-wrap items-center gap-6">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-heading font-medium text-text-secondary mb-1 uppercase tracking-wider">
                    Default Project
                  </label>
                  <select className="w-full px-3 py-2 border border-border bg-subtle-bg text-[13px] focus:outline-none focus:border-accent">
                    <option>Select Project...</option>
                    <option>Tower A - Main Facade</option>
                    <option>Building B - East Wing</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-heading font-medium text-text-secondary mb-1 uppercase tracking-wider">
                    Default Floor/Location
                  </label>
                  <input
                type="text"
                placeholder="e.g. Floor 5"
                className="w-full px-3 py-2 border border-border bg-subtle-bg text-[13px] focus:outline-none focus:border-accent" />
              
                </div>
                <div className="flex items-end h-[52px]">
                  <button className="text-[12px] text-accent hover:underline font-medium">
                    Apply to all
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {files.map((file, index) =>
            <div
              key={index}
              className="bg-card-bg border border-border flex flex-col relative group">
              
                    <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-status-problem">
                
                      <XIcon className="w-4 h-4" />
                    </button>
                    <div className="aspect-[4/3] bg-subtle-bg border-b border-border overflow-hidden">
                      <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover" />
                
                    </div>
                    <div className="p-3 space-y-3">
                      <input
                  type="text"
                  placeholder="Add caption..."
                  className="w-full px-2 py-1.5 border border-transparent hover:border-border focus:border-accent bg-transparent focus:bg-subtle-bg text-[12px] transition-colors outline-none" />
                
                      <select className="w-full px-2 py-1.5 border border-border bg-subtle-bg text-[11px] text-text-secondary outline-none">
                        <option>Tower A - Main Facade</option>
                      </select>
                      <input
                  type="text"
                  placeholder="Floor/Location"
                  className="w-full px-2 py-1.5 border border-border bg-subtle-bg text-[11px] text-text-secondary outline-none" />
                
                    </div>
                  </div>
            )}

                <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-subtle-bg border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center min-h-[250px] cursor-pointer transition-colors text-text-secondary hover:text-accent">
              
                  <UploadCloudIcon className="w-8 h-8 mb-2" />
                  <span className="text-[12px] font-heading uppercase tracking-wider font-medium mb-4">
                    Add More
                  </span>
                  <button
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="px-4 py-2 bg-card-bg border border-border text-[11px] font-heading uppercase tracking-wider flex items-center gap-2 hover:text-accent hover:border-accent transition-colors">
                
                    <CameraIcon className="w-3.5 h-3.5" /> Use Camera
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <span className="text-[13px] text-text-secondary">
                  {files.length} photos selected
                </span>
                {uploadState === 'uploading' ?
            <div className="flex items-center gap-4 w-64">
                    <div className="flex-1 h-2 bg-subtle-bg overflow-hidden">
                      <div
                  className="h-full bg-accent transition-all duration-200"
                  style={{
                    width: `${progress}%`
                  }} />
                
                    </div>
                    <span className="text-[12px] font-bold text-accent">
                      {progress}%
                    </span>
                  </div> :

            <button
              onClick={handleUpload}
              className="btn-primary px-8 py-2.5 text-white font-heading text-[12px] font-semibold uppercase tracking-wider">
              
                    Upload All
                  </button>
            }
              </div>
            </div>
        }
        </div>
      }
    </div>);

}