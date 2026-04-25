import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, DownloadIcon, PrinterIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell } from
'recharts';
const barData = [
{
  name: 'Week 1',
  installed: 45
},
{
  name: 'Week 2',
  installed: 60
},
{
  name: 'Week 3',
  installed: 85
},
{
  name: 'Week 4',
  installed: 120
}];

const pieData = [
{
  name: 'Installed',
  value: 804,
  color: '#16A34A'
},
{
  name: 'Pending',
  value: 356,
  color: '#D97706'
},
{
  name: 'Problems',
  value: 28,
  color: '#DC2626'
},
{
  name: 'Not Started',
  value: 12,
  color: '#64748B'
}];

export function ReportPreviewPage() {
  const handlePrint = () => {
    window.print();
  };
  return (
    <div className="max-w-4xl mx-auto">
      {/* Non-printable action bar */}
      <div className="flex items-center justify-between mb-6 print:hidden animate-fade-up">
        <Link
          to="/reports/builder"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors">
          
          <ArrowLeftIcon className="w-4 h-4" /> Back to Builder
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-border bg-card-bg text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors flex items-center gap-2">
            
            <PrinterIcon className="w-4 h-4" /> Print
          </button>
          <button className="btn-primary px-4 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
            <DownloadIcon className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Report Area */}
      <div
        className="bg-white text-black p-12 min-h-[1056px] shadow-xl print:shadow-none print:p-0 animate-fade-up"
        style={{
          animationDelay: '50ms'
        }}>
        
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-200 pb-8 mb-8">
          <div>
            <img
              src="/logo.png"
              alt="Design L.EFRAIM LTD."
              className="h-12 object-contain mb-6" />
            
            <h1 className="font-heading text-3xl font-bold text-slate-900 uppercase tracking-wide mb-2">
              Monthly Progress Report
            </h1>
            <p className="text-slate-600 font-medium">Tower A - Main Facade</p>
          </div>
          <div className="text-right text-sm text-slate-500 space-y-1">
            <p>
              <span className="font-semibold text-slate-700">Date Range:</span>{' '}
              Oct 1 - Oct 31, 2026
            </p>
            <p>
              <span className="font-semibold text-slate-700">Generated:</span>{' '}
              Nov 1, 2026
            </p>
            <p>
              <span className="font-semibold text-slate-700">Prepared By:</span>{' '}
              David Levy
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-10">
          <h2 className="font-heading text-lg font-bold text-slate-800 uppercase tracking-wider mb-4 border-l-4 border-[#004a64] pl-3">
            Executive Summary
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm">
            Installation progress on Tower A has accelerated during October,
            with 310 new panels installed across floors 15-22. The East
            elevation is now 85% complete. Weather conditions caused minor
            delays in week 2, but the team recovered the schedule by week 4.
            Material deliveries for floors 23-30 have arrived on site and passed
            initial QA inspections.
          </p>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-l-4 border-[#2E86AB] pl-3">
              Installation Velocity
            </h2>
            <div className="h-64 border border-slate-200 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0" />
                  
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: '#64748b'
                    }} />
                  
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: '#64748b'
                    }} />
                  
                  <Tooltip
                    cursor={{
                      fill: '#f1f5f9'
                    }} />
                  
                  <Bar
                    dataKey="installed"
                    fill="#2E86AB"
                    radius={[2, 2, 0, 0]} />
                  
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h2 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-l-4 border-[#2E86AB] pl-3">
              Overall Status
            </h2>
            <div className="h-64 border border-slate-200 p-4 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value">
                    
                    {pieData.map((entry, index) =>
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-4 space-y-2">
                {pieData.map((item) =>
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-xs">
                  
                    <div
                    className="w-3 h-3"
                    style={{
                      backgroundColor: item.color
                    }} />
                  
                    <span className="text-slate-600 w-20">{item.name}</span>
                    <span className="font-bold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Documentation */}
        <div className="mb-10">
          <h2 className="font-heading text-lg font-bold text-slate-800 uppercase tracking-wider mb-4 border-l-4 border-[#004a64] pl-3">
            Photo Documentation
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <img
                src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop"
                alt="Progress"
                className="w-full aspect-[4/3] object-cover border border-slate-200" />
              
              <p className="text-xs text-slate-500 text-center">
                Floor 15 Installation
              </p>
            </div>
            <div className="space-y-2">
              <img
                src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop"
                alt="Progress"
                className="w-full aspect-[4/3] object-cover border border-slate-200" />
              
              <p className="text-xs text-slate-500 text-center">
                East Elevation View
              </p>
            </div>
            <div className="space-y-2">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop"
                alt="Progress"
                className="w-full aspect-[4/3] object-cover border border-slate-200" />
              
              <p className="text-xs text-slate-500 text-center">
                Crane Operations
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 font-heading uppercase tracking-widest">
          Design L.EFRAIM LTD. • Confidential Project Report
        </div>
      </div>
    </div>);

}