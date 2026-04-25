import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileBarChartIcon,
  PlusIcon,
  Edit2Icon,
  CopyIcon,
  Trash2Icon,
  ArrowLeftIcon } from
'lucide-react';
export function ReportTemplateManagerPage() {
  const templates = [
  {
    id: '1',
    name: 'Weekly Progress Summary',
    type: 'PDF',
    uses: 45,
    lastUpdated: 'Oct 20, 2026'
  },
  {
    id: '2',
    name: 'Panel Installation Status',
    type: 'Excel',
    uses: 120,
    lastUpdated: 'Oct 15, 2026'
  },
  {
    id: '3',
    name: 'Quality Control Issues',
    type: 'PDF',
    uses: 32,
    lastUpdated: 'Oct 10, 2026'
  },
  {
    id: '4',
    name: 'Material Delivery Schedule',
    type: 'Excel',
    uses: 18,
    lastUpdated: 'Oct 05, 2026'
  }];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4">
            
            <ArrowLeftIcon className="w-4 h-4" /> Back to Reports
          </Link>
          <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide mb-1">
            Report Templates
          </h1>
          <p className="text-[13px] text-text-secondary">
            Manage and customize report templates for your projects.
          </p>
        </div>
        <Link
          to="/reports/builder"
          className="btn-primary h-10 px-4 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
          
          <PlusIcon className="w-4 h-4" />
          Create Template
        </Link>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-up"
        style={{
          animationDelay: '50ms'
        }}>
        
        {templates.map((template) =>
        <div
          key={template.id}
          className="bg-card-bg border border-border p-6 flex flex-col"
          style={{
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
          }}>
          
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent">
                <FileBarChartIcon className="w-5 h-5" />
              </div>
              <span className="px-2 py-1 text-[9px] font-heading uppercase tracking-wider font-medium border bg-subtle-bg text-text-secondary border-border">
                {template.type}
              </span>
            </div>
            <h3 className="font-heading text-[15px] font-bold text-text-primary mb-2 line-clamp-1">
              {template.name}
            </h3>
            <div className="flex items-center gap-4 text-[11px] text-text-secondary mb-6">
              <span>{template.uses} uses</span>
              <span>•</span>
              <span>Updated {template.lastUpdated}</span>
            </div>
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
              <button className="text-[11px] font-heading uppercase tracking-wider text-accent hover:underline font-medium">
                Preview
              </button>
              <div className="flex items-center gap-2">
                <button
                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                title="Edit">
                
                  <Edit2Icon className="w-4 h-4" />
                </button>
                <button
                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                title="Duplicate">
                
                  <CopyIcon className="w-4 h-4" />
                </button>
                <button
                className="p-1.5 text-text-secondary hover:text-status-problem transition-colors"
                title="Delete">
                
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

}