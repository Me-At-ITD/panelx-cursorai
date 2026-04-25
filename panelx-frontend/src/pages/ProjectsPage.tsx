import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  PauseCircleIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon,
  FileTextIcon,
  Loader2,
  LockIcon,
  ConstructionIcon,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useLanguage } from '../components/LanguageContext';
import { useProjects, Project } from '../hooks/useProjects';
import { useUsers, User } from '../hooks/useUsers';
import { useToast } from '../components/Toast';

function hasPermission(user: User | null, permissionName: string): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return (
    user.roles?.some(role =>
      role.permissions?.some(p => p.name === permissionName)
    ) ?? false
  );
}

function SkeletonProjectCard() {
  return (
    <div
      className="bg-card-bg border border-border p-5"
      style={{
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
      }}>
      
      <div className="flex justify-between items-start mb-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-5 w-16" />
      </div>
      <div className="skeleton h-2 w-full mb-4" />
      <div className="flex justify-between mb-6">
        <div className="skeleton h-4 w-12" />
        <div className="skeleton h-4 w-12" />
        <div className="skeleton h-4 w-12" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-6 w-6" />
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const { getProjects, getProjectStats, isLoading: projectsLoading } = useProjects();
  const { getCurrentUser } = useUsers();
  const { addToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    on_hold: 0
  });
  const { t } = useLanguage();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setIsStatsLoading(true);
    
    // Load stats and projects in parallel
    await Promise.all([
      loadStats(),
      loadProjectsAndUser()
    ]);
    
    setIsLoading(false);
  };

  const loadStats = async () => {
    setIsStatsLoading(true);
    try {
      const result = await getProjectStats();
     
      
      if (result.success && result.data) {
        setStats({
          total: result.data.total || 0,
          active: result.data.active || 0,
          completed: result.data.completed || 0,
          on_hold: result.data.on_hold || 0
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const loadProjectsAndUser = async () => {
    const [projectsResult, userResult] = await Promise.all([
      getProjects(),
      getCurrentUser(),
    ]);
    
    console.log('Projects API Response:', projectsResult);
    
    if (projectsResult.success && projectsResult.data) {
      let projectsData = [];
      if (Array.isArray(projectsResult.data)) {
        projectsData = projectsResult.data;
      } else if (projectsResult.data.items && Array.isArray(projectsResult.data.items)) {
        projectsData = projectsResult.data.items;
      } else if (projectsResult.data.projects && Array.isArray(projectsResult.data.projects)) {
        projectsData = projectsResult.data.projects;
      } else {
        projectsData = [];
      }
      
      setProjects(projectsData);
      console.log('Projects set:', projectsData);
      console.log('Total projects count:', projectsData.length);
    } else if (!projectsResult.success) {
      addToast('error', projectsResult.error || 'Failed to load projects');
    }
    
    if (userResult.success && userResult.data) {
      setCurrentUser(userResult.data);
    }
  };

  const canCreateProject = hasPermission(currentUser, 'create_project');

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'active':
        return 'bg-status-installed-bg text-status-installed-text border-status-installed/30';
      case 'completed':
        return 'bg-accent/10 text-accent border-accent/30';
      case 'on_hold':
        return 'bg-status-pending-bg text-status-pending-text border-status-pending/30';
      default:
        return 'bg-subtle-bg text-text-secondary border-border';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const statusLower = project.status?.toLowerCase();
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'on_hold' ? statusLower === 'on_hold' : statusLower === statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  // Use stats from API for all counts
  const totalProjects = stats.total;
  const activeProjects = stats.active;
  const completedProjects = stats.completed;
  const onHoldProjects = stats.on_hold;

  console.log('Stats from API - Total:', totalProjects, 'Active:', activeProjects, 'Completed:', completedProjects, 'On Hold:', onHoldProjects);

  // Show loading skeleton while initial data is loading
  if (isLoading || projectsLoading || isStatsLoading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
          <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
            {t('Projects')}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <div className="skeleton w-48 h-10" />
            </div>
            <div className="relative hidden sm:block">
              <div className="skeleton w-48 h-10" />
            </div>
            <div className="skeleton h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card-bg p-6 border border-border">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton h-8 w-14" />
                </div>
                <div className="skeleton h-10 w-10" />
              </div>
              <div className="skeleton h-8 w-full mt-3" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonProjectCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          {t('Projects')}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder={t('Search projects...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 pl-9 pr-4 py-2 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent" />
          </div>
          <div className="relative hidden sm:block">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 pl-9 pr-4 py-2 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
              <option value="all">{t('All Statuses')}</option>
              <option value="active">{t('Active')}</option>
              <option value="completed">{t('Completed')}</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          {canCreateProject ? (
            <Link
              to="/projects/new"
              className="btn-primary h-10 px-4 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              {t('New Project')}
            </Link>
          ) : (
            currentUser !== null && (
              <div
                className="h-10 px-4 flex items-center gap-2 border border-border text-text-secondary text-[12px] font-heading font-semibold uppercase tracking-wider cursor-not-allowed opacity-60"
                title="You do not have permission to create projects">
                <LockIcon className="w-4 h-4" />
                {t('New Project')}
              </div>
            )
          )}
        </div>
      </div>

      {!canCreateProject && currentUser !== null && (
        <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-[12px] flex items-center gap-2">
          <LockIcon className="w-4 h-4 flex-shrink-0" />
          You do not have permission to create projects. Contact your administrator.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('Total Projects')}
          value={totalProjects}
          icon={FolderIcon}
          accentColor="#2E86AB"
          trend=""
          delay={60} />
        <StatCard
          title={t('Active')}
          value={activeProjects}
          icon={CheckCircleIcon}
          accentColor="#16A34A"
          trend=""
          delay={100} />
        <StatCard
          title={t('Completed')}
          value={completedProjects}
          icon={ClockIcon}
          accentColor="#7C3AED"
          trend=""
          delay={140} />
        <StatCard
          title="On Hold"
          value={onHoldProjects}
          icon={PauseCircleIcon}
          accentColor="#D97706"
          trend=""
          delay={180} />
      </div>

      {/* RECENT DRAWINGS - Coming Soon */}
      <div
        className="mb-8 animate-fade-up"
        style={{ animationDelay: '200ms' }}>
        <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider mb-4">
          {t('Recent Drawings')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((_, i) => (
            <div
              key={i}
              className="bg-card-bg border border-border group flex flex-col relative cursor-pointer"
              style={{
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                borderLeft: '3px solid var(--accent)',
                animation: 'fadeUp 0.35s ease both',
                animationDelay: `${(i + 4) * 40}ms`
              }}>
              <div className="h-[100px] bg-subtle-bg border-b border-border relative overflow-hidden flex items-center justify-center">
                <ConstructionIcon className="w-8 h-8 text-text-placeholder" />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-heading text-[11px] font-bold text-text-placeholder uppercase tracking-wider">
                  Coming Soon
                </h3>
                <p className="text-[9px] text-text-placeholder mt-1">
                  Drawing previews will appear here
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <Link
            to={`/projects/${project.id}`}
            key={project.id}
            className="bg-card-bg border border-border p-5 transition-transform duration-200 hover:-translate-y-0.5 group flex flex-col block"
            style={{
              borderLeft: '3px solid var(--accent)',
              boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
              animation: 'fadeUp 0.35s ease both',
              animationDelay: `${(index + 4) * 40}ms`
            }}>
            
            <div className="flex justify-between items-start mb-4 gap-4">
              <h3 className="font-heading text-[15px] font-bold text-text-primary leading-tight">
                {project.name}
              </h3>
              <span className={`px-2 py-1 text-[9px] font-heading uppercase tracking-wider font-medium border flex-shrink-0 ${getStatusColor(project.status)}`}>
                {t(project.status || 'Active')}
              </span>
            </div>

            {project.description && (
              <p className="text-[11px] text-text-secondary mb-4 line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Progress placeholder - dynamic data coming soon */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] font-heading uppercase tracking-wider text-text-secondary mb-1.5">
                <span>Progress</span>
                <span className="text-text-placeholder">Coming Soon</span>
              </div>
              <div className="w-full h-1.5 bg-subtle-bg overflow-hidden">
                <div className="h-full bg-accent" style={{ width: '0%' }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-subtle-bg p-2 text-center border border-border">
                <div className="text-[10px] font-heading uppercase tracking-wider text-text-secondary mb-0.5">
                  {t('Total')}
                </div>
                <div className="text-[13px] font-bold text-text-placeholder">
                  —
                </div>
              </div>
              <div className="bg-subtle-bg p-2 text-center border border-border">
                <div className="text-[10px] font-heading uppercase tracking-wider text-text-secondary mb-0.5">
                  Inst.
                </div>
                <div className="text-[13px] font-bold text-text-placeholder">
                  —
                </div>
              </div>
              <div className="bg-subtle-bg p-2 text-center border border-border">
                <div className="text-[10px] font-heading uppercase tracking-wider text-text-secondary mb-0.5">
                  Pend.
                </div>
                <div className="text-[13px] font-bold text-text-placeholder">
                  —
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
              <div className="text-[11px] text-text-secondary flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5" />
                Created {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Recently'}
              </div>
              <div className="w-6 h-6 bg-primary text-white flex items-center justify-center text-[9px] font-heading font-bold">
                {project.owner_id?.slice(0, 2).toUpperCase() || 'PM'}
              </div>
            </div>

            {/* Open Drawing button - Coming Soon */}
            <div
              className="mt-3 w-full h-9 text-white font-heading text-[11px] font-bold uppercase tracking-wider opacity-50 flex items-center justify-center gap-2 cursor-not-allowed"
              style={{
                background: 'linear-gradient(to bottom right, #006384, #004a64)'
              }}
              title="Coming Soon">
              <FileTextIcon className="w-3.5 h-3.5" />
              {t('Open Drawing')} (Coming Soon)
            </div>
          </Link>
        ))}
      </div>

      {filteredProjects.length === 0 && !projectsLoading && (
        <div className="text-center py-12">
          <FolderIcon className="w-12 h-12 text-text-placeholder mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching projects found' : 'No projects yet'}
          </h3>
          <p className="text-[13px] text-text-secondary mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : canCreateProject 
                ? 'Create your first project to get started' 
                : 'No projects have been assigned to you yet'}
          </p>
          {canCreateProject && !searchTerm && statusFilter === 'all' && (
            <Link to="/projects/new" className="btn-primary px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider">
              Create Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
}