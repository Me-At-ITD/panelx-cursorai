import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileBarChartIcon,
  DownloadIcon,
  PlusIcon,
  FilterIcon,
  CalendarIcon } from
'lucide-react';
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
import { useLanguage } from '../components/LanguageContext';
const barData = [
{
  name: 'Jan',
  installed: 400
},
{
  name: 'Feb',
  installed: 650
},
{
  name: 'Mar',
  installed: 800
},
{
  name: 'Apr',
  installed: 1200
},
{
  name: 'May',
  installed: 1500
},
{
  name: 'Jun',
  installed: 2100
}];

const pieData = [
{
  name: 'Installed',
  value: 5400,
  color: '#16A34A'
},
{
  name: 'Pending',
  value: 2100,
  color: '#D97706'
},
{
  name: 'Problem',
  value: 150,
  color: '#DC2626'
}];

const mockReports = [
{
  id: '1',
  title: 'Monthly Progress Report - March 2026',
  date: 'Apr 1, 2026',
  project: 'All Projects'
},
{
  id: '2',
  title: 'Quality Assurance Summary',
  date: 'Mar 28, 2026',
  project: 'Tower A - Main Facade'
},
{
  id: '3',
  title: 'Pending Installation Forecast',
  date: 'Mar 25, 2026',
  project: 'Building B - East Wing'
},
{
  id: '4',
  title: 'Problem Panel Resolution Log',
  date: 'Mar 20, 2026',
  project: 'Residential Complex C'
},
{
  id: '5',
  title: 'Quarterly Executive Summary',
  date: 'Mar 15, 2026',
  project: 'All Projects'
}];

function ChartSkeleton() {
  return (
    <div
      className="bg-card-bg border border-border p-6 h-[340px] flex flex-col"
      style={{
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
      }}>
      
      <div className="skeleton h-5 w-48 mb-8" />
      <div className="flex-1 flex items-end justify-between gap-4 px-4">
        {[1, 2, 3, 4, 5, 6].map((i) =>
        <div
          key={i}
          className="skeleton w-full"
          style={{
            height: `${Math.random() * 60 + 20}%`
          }} />

        )}
      </div>
    </div>);

}
function ListSkeleton() {
  return (
    <div
      className="bg-card-bg border border-border mt-6"
      style={{
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
      }}>
      
      <div className="p-5 border-b border-border bg-subtle-bg">
        <div className="skeleton h-4 w-32" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) =>
        <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="skeleton h-10 w-10" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-32" />
              </div>
            </div>
            <div className="skeleton h-8 w-24" />
          </div>
        )}
      </div>
    </div>);

}
export function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          {t('Reports & Analytics')}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/reports/templates"
            className="px-4 py-2 text-[12px] font-heading uppercase tracking-wider font-semibold text-text-secondary hover:text-text-primary transition-colors">
            
            {t('Templates')}
          </Link>
          <Link
            to="/reports/builder"
            className="btn-primary h-10 px-4 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
            
            <PlusIcon className="w-4 h-4" />
            {t('New Report')}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-up"
        style={{
          animationDelay: '50ms'
        }}>
        
        <div className="relative">
          <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <select className="w-full sm:w-64 pl-9 pr-4 py-2 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
            <option>{t('All Projects')}</option>
            <option>Tower A - Main Facade</option>
            <option>Building B - East Wing</option>
            <option>Residential Complex C</option>
          </select>
        </div>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <select className="w-full sm:w-48 pl-9 pr-4 py-2 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
            <option>{t('Last 6 Months')}</option>
            <option>{t('This Year')}</option>
            <option>{t('Last Year')}</option>
            <option>{t('All Time')}</option>
          </select>
        </div>
      </div>

      {isLoading ?
      <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <ListSkeleton />
        </> :

      <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bar Chart Card */}
            <div
            className="bg-card-bg border border-border p-6 animate-fade-up"
            style={{
              borderLeft: '3px solid var(--accent)',
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
              animationDelay: '60ms'
            }}>
            
              <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider mb-6">
                {t('Installation Progress')}
              </h2>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                  data={barData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0
                  }}>
                  
                    <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)" />
                  
                    <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: 'var(--text-secondary)'
                    }}
                    dy={10} />
                  
                    <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: 'var(--text-secondary)'
                    }} />
                  
                    <Tooltip
                    cursor={{
                      fill: 'var(--bg-subtle)'
                    }}
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border)',
                      borderRadius: 0,
                      fontSize: '12px',
                      color: 'var(--text-primary)'
                    }} />
                  
                    <Bar dataKey="installed" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart Card */}
            <div
            className="bg-card-bg border border-border p-6 animate-fade-up"
            style={{
              borderLeft: '3px solid var(--stat-users)',
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
              animationDelay: '100ms'
            }}>
            
              <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider mb-6">
                {t('Panel Status Distribution')}
              </h2>
              <div className="h-[240px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none">
                    
                      {pieData.map((entry, index) =>
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    )}
                    </Pie>
                    <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border)',
                      borderRadius: 0,
                      fontSize: '12px',
                      color: 'var(--text-primary)'
                    }} />
                  
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-heading font-bold text-text-primary">
                    7.6k
                  </span>
                  <span className="text-[10px] font-heading uppercase tracking-wider text-text-secondary">
                    {t('Total Panels')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports List */}
          <div
          className="bg-card-bg border border-border animate-fade-up"
          style={{
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
            animationDelay: '140ms'
          }}>
          
            <div className="p-5 border-b border-border bg-subtle-bg flex items-center gap-2">
              <FileBarChartIcon className="w-4 h-4 text-accent" />
              <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider">
                {t('Recent Reports')}
              </h2>
            </div>
            <div className="divide-y divide-border">
              {mockReports.map((report, index) =>
            <div
              key={report.id}
              className="p-4 hover:bg-subtle-bg transition-colors flex items-center justify-between">
              
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                      <FileBarChartIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-medium text-text-primary">
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[12px] text-text-secondary">
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.project}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                to="/reports/preview"
                className="px-3 py-1.5 border border-border text-text-secondary hover:text-accent hover:border-accent transition-colors flex items-center gap-2 text-[11px] font-heading uppercase tracking-wider font-medium">
                
                    <DownloadIcon className="w-3.5 h-3.5" />
                    {t('Preview')}
                  </Link>
                </div>
            )}
            </div>
          </div>
        </>
      }
    </div>);

}