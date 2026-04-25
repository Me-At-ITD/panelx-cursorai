import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RefreshCwIcon,
  CalendarIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  PauseCircleIcon,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ActivityLog } from '../components/ActivityLog';
import { FileSyncStatus } from '../components/FileSyncStatus';
import { useLanguage } from '../components/LanguageContext';
import { useProjects, Project } from '../hooks/useProjects';

function SkeletonStatCard() {
  return (
    <div
      className="bg-card-bg p-6 border border-border"
      style={{ borderLeft: '3px solid var(--border)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-8 w-14" />
        </div>
        <div className="skeleton h-10 w-10" />
      </div>
      <div className="skeleton h-8 w-full mt-3" />
    </div>
  );
}

function SkeletonWidget() {
  return (
    <div className="bg-card-bg border border-border" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
      <div className="p-5 border-b border-border bg-subtle-bg">
        <div className="skeleton h-4 w-32" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4">
            <div className="flex items-start gap-3">
              <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { getProjects, isLoading: projectsLoading } = useProjects();
  const [projects, setProjects] = useState<Project[]>([]);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const result = await getProjects(0, 100);
    if (result.success && result.data) {
      setProjects(result.data.items || []);
    }
  };

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status?.toLowerCase() === 'active').length;
  const completedProjects = projects.filter(p => p.status?.toLowerCase() === 'completed').length;
  const onHoldProjects = projects.filter(p => p.status?.toLowerCase() === 'on_hold').length;

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const getStatusDot = (status: string) => {
    if (status?.toLowerCase() === 'active') return 'bg-green-500';
    if (status?.toLowerCase() === 'completed') return 'bg-purple-500';
    return 'bg-amber-500';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          {t('Dashboard Overview')}
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <select className="w-full sm:w-48 pl-9 pr-4 py-2 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          <Link
            to="/sync-monitor"
            className="btn-primary h-10 px-4 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            {t('Sync Monitor')}
          </Link>
        </div>
      </div>

      {projectsLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonWidget />
            <SkeletonWidget />
          </div>
        </>
      ) : (
        <>
          {/* STAT CARDS — real project counts from API */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title={t('Total Projects')}
              value={totalProjects}
              icon={FolderIcon}
              accentColor="#2E86AB"
              trend=""
              delay={60}
            />
            <StatCard
              title={t('Active')}
              value={activeProjects}
              icon={CheckCircleIcon}
              accentColor="#16A34A"
              trend=""
              delay={100}
            />
            <StatCard
              title={t('Completed')}
              value={completedProjects}
              icon={ClockIcon}
              accentColor="#7C3AED"
              trend=""
              delay={140}
            />
            <StatCard
              title="On Hold"
              value={onHoldProjects}
              icon={PauseCircleIcon}
              accentColor="#D97706"
              trend=""
              delay={180}
            />
          </div>

          {/* RECENT PROJECTS */}
          <div className="mb-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider mb-4">
              {t('Recent Projects')}
            </h2>
            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentProjects.map((project, i) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="bg-card-bg border border-border group cursor-pointer hover:border-accent transition-colors flex flex-col"
                    style={{
                      boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                      borderLeft: '3px solid var(--accent)',
                      animation: 'fadeUp 0.35s ease both',
                      animationDelay: `${(i + 4) * 40}ms`,
                    }}
                  >
                    <div className="h-[120px] bg-subtle-bg border-b border-border relative overflow-hidden flex items-center justify-center">
                      <div
                        className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity bg-cover bg-center"
                        style={{
                          backgroundImage:
                            'url(https://cdn.magicpatterns.com/uploads/vUCGFMdaYkKcBdLoZyGgi2/real_facade_drawings_image.jpg)',
                          filter: 'grayscale(100%) contrast(1.2)',
                        }}
                      />
                      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className="font-heading text-[13px] font-bold text-text-primary truncate"
                          title={project.name}
                        >
                          {project.name}
                        </h3>
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${getStatusDot(project.status)}`}
                          title={`Status: ${project.status}`}
                        />
                      </div>
                      <p className="text-[11px] text-text-secondary truncate mb-3">
                        {project.description || 'No description'}
                      </p>
                      <div className="mt-auto text-[10px] font-heading uppercase tracking-wider text-text-placeholder">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="bg-card-bg border border-border p-8 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
              >
                <FolderIcon className="w-10 h-10 text-text-placeholder mb-3" />
                <p className="text-[13px] text-text-secondary mb-3">No projects yet</p>
                <Link
                  to="/projects/new"
                  className="btn-primary px-4 py-2 text-white font-heading text-[11px] font-semibold uppercase tracking-wider"
                >
                  Create First Project
                </Link>
              </div>
            )}
          </div>

          {/* ACTIVITY & SYNC COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityLog />
            <FileSyncStatus />
          </div>
        </>
      )}
    </div>
  );
}
