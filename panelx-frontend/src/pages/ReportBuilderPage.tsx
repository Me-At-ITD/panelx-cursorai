import React, { useState } from 'react';
import {
  ArrowLeftIcon,
  SaveIcon,
  LayoutIcon,
  TypeIcon,
  ImageIcon,
  TableIcon,
  PieChartIcon } from
'lucide-react';
import { Link } from 'react-router-dom';
export function ReportBuilderPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 animate-fade-up flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/reports"
            className="w-8 h-8 flex items-center justify-center border border-border bg-card-bg text-text-secondary hover:text-text-primary transition-colors">
            
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-text-primary uppercase tracking-wide">
              Report Builder
            </h1>
            <p className="text-[11px] text-text-secondary">
              Editing: Weekly Progress Summary
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/reports/preview"
            className="px-4 py-2 border border-border text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors">
            
            Preview
          </Link>
          <button className="btn-primary px-4 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
            <SaveIcon className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex gap-6 min-h-0 animate-fade-up"
        style={{
          animationDelay: '50ms'
        }}>
        
        {/* Toolbar */}
        <div
          className="w-64 bg-card-bg border border-border flex flex-col overflow-y-auto"
          style={{
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
          }}>
          
          <div className="p-4 border-b border-border bg-subtle-bg">
            <h2 className="font-heading text-[12px] font-bold text-text-primary uppercase tracking-wider">
              Elements
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {[
            {
              icon: TypeIcon,
              label: 'Text Block'
            },
            {
              icon: ImageIcon,
              label: 'Image / Logo'
            },
            {
              icon: TableIcon,
              label: 'Data Table'
            },
            {
              icon: PieChartIcon,
              label: 'Chart'
            },
            {
              icon: LayoutIcon,
              label: 'Page Break'
            }].
            map((item, i) =>
            <div
              key={i}
              className="flex items-center gap-3 p-3 border border-border bg-subtle-bg cursor-grab hover:border-accent transition-colors">
              
                <item.icon className="w-4 h-4 text-text-secondary" />
                <span className="text-[12px] font-medium text-text-primary">
                  {item.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-subtle-bg border border-border overflow-y-auto p-8 flex justify-center">
          <div className="w-full max-w-[800px] bg-white shadow-lg min-h-[1000px] p-12 relative">
            {/* Mock Report Content */}
            <div className="border-2 border-dashed border-accent/30 p-4 mb-6 hover:border-accent transition-colors cursor-pointer relative group">
              <div className="absolute -top-3 -right-3 bg-accent text-white px-2 py-1 text-[9px] font-heading uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Edit Header
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Weekly Progress Summary
              </h1>
              <p className="text-slate-500">
                Project: [Project Name] | Date: [Current Date]
              </p>
            </div>

            <div className="border-2 border-dashed border-border p-4 mb-6 hover:border-accent transition-colors cursor-pointer relative group">
              <div className="absolute -top-3 -right-3 bg-accent text-white px-2 py-1 text-[9px] font-heading uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Edit Chart
              </div>
              <div className="h-64 bg-slate-50 flex items-center justify-center text-slate-400">
                [ Installation Progress Chart Placeholder ]
              </div>
            </div>

            <div className="border-2 border-dashed border-border p-4 hover:border-accent transition-colors cursor-pointer relative group">
              <div className="absolute -top-3 -right-3 bg-accent text-white px-2 py-1 text-[9px] font-heading uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Edit Table
              </div>
              <div className="h-48 bg-slate-50 flex items-center justify-center text-slate-400">
                [ Recent Issues Table Placeholder ]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}