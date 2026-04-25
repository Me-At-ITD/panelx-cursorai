import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  FileTextIcon,
  SearchIcon,
  CameraIcon,
  FileBarChartIcon,
  DownloadIcon,
  EyeIcon,
  UploadIcon,
  Trash2Icon,
  SettingsIcon,
  Loader2Icon,
  AlertCircleIcon,
  ConstructionIcon,
} from 'lucide-react';
import { useProjects, Project, ProjectFile } from '../hooks/useProjects';
import { useToast } from '../components/Toast';

// Static mock photos for now (no photos API)
const mockPhotos = [
  'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
];

// Static mock PDF files for Structural Calcs (no PDF API)
const mockPdfFiles = [
  { id: '1', name: 'Structural_Calcs_TowerA_v2.pdf', size: '12.4 MB', date: 'Oct 15, 2026' },
  { id: '2', name: 'Wind_Load_Analysis.pdf', size: '8.1 MB', date: 'Oct 10, 2026' },
  { id: '3', name: 'Thermal_Performance_Report.pdf', size: '4.2 MB', date: 'Oct 05, 2026' },
];

function formatFileSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileStatusClass(status: string) {
  switch (status) {
    case 'completed': return 'bg-status-installed-bg text-status-installed-text border-status-installed/30';
    case 'processing': return 'bg-status-pending-bg text-status-pending-text border-status-pending/30';
    case 'failed': return 'bg-status-problem-bg text-status-problem-text border-status-problem/30';
    default: return 'bg-subtle-bg text-text-secondary border-border';
  }
}

function getFileStatusLabel(status: string) {
  switch (status) {
    case 'completed': return 'Processed';
    case 'processing': return 'Processing';
    case 'uploaded': return 'Uploaded';
    case 'failed': return 'Failed';
    default: return status || 'Uploaded';
  }
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'active': return 'bg-status-installed-bg text-status-installed-text border-status-installed/30';
    case 'completed': return 'bg-accent/10 text-accent border-accent/30';
    case 'on_hold': return 'bg-status-pending-bg text-status-pending-text border-status-pending/30';
    default: return 'bg-subtle-bg text-text-secondary border-border';
  }
}

// Coming Soon Component
function ComingSoonMessage({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ConstructionIcon className="w-16 h-16 text-text-placeholder mb-4" />
      <h3 className="font-heading text-[15px] font-semibold text-text-primary mb-2">Coming Soon</h3>
      <p className="text-[12px] text-text-secondary">{message || "This feature is currently under development"}</p>
    </div>
  );
}

// Disabled Link Component
function DisabledLink({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="bg-card-bg border border-border p-4 flex items-center gap-3 opacity-50 cursor-not-allowed">
      <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent">
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-heading text-[12px] font-semibold uppercase tracking-wider text-text-primary">
        {label}
      </span>
      <span className="ml-auto text-[9px] text-text-placeholder">Soon</span>
    </div>
  );
}

// Disabled Tab Component
function DisabledTab({ label }: { label: string }) {
  return (
    <div className="px-6 py-3 font-heading text-[12px] font-semibold uppercase tracking-wider whitespace-nowrap opacity-50 cursor-not-allowed">
      {label}
      <span className="ml-2 text-[8px] text-text-placeholder">(Soon)</span>
    </div>
  );
}

export function ProjectDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const { getProject, isLoading: projectsLoading } = useProjects();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview'>('overview'); // Only overview tab available
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    setIsLoading(true);
    const result = await getProject(id!);
    if (result.success && result.data) {
      setProject(result.data as Project);
    } else {
      addToast('error', result.error || 'Failed to load project');
    }
    setIsLoading(false);
  };

  if (isLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="w-12 h-12 animate-spin text-accent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-text-secondary mb-4">Project not found</p>
        <Link to="/projects" className="btn-primary inline-block px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider">
          Back to Projects
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', available: true },
    { id: 'dwg', label: 'Assembly Drawings', available: false },
    { id: 'calcs', label: 'Structural Calcs', available: false },
    { id: 'details', label: 'Approved Details', available: false },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="flex items-center justify-between w-full flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
              {project.name}
            </h1>
            <span className={`px-2.5 py-1 text-[10px] font-heading uppercase tracking-wider font-medium border ${getStatusColor(project.status)}`}>
              {project.status || 'Active'}
            </span>
          </div>
          <Link
            to={`/projects/${id}/settings`}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-subtle-bg transition-colors border border-border"
            title="Project Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>
        </div>
        {project.description && (
          <p className="text-[13px] text-text-secondary mt-2">{project.description}</p>
        )}
      </div>

      {/* Tabs - Only Overview available */}
      <div
        className="flex border-b border-border mb-6 overflow-x-auto hide-scrollbar"
        style={{ animation: 'fadeUp 0.35s ease both', animationDelay: '50ms' }}
      >
        {tabs.map((tab) => (
          tab.available ? (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-heading text-[12px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors relative text-primary`}
            >
              {tab.label}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
            </button>
          ) : (
            <DisabledTab key={tab.id} label={tab.label} />
          )
        ))}
      </div>

      <div style={{ animation: 'fadeUp 0.35s ease both', animationDelay: '100ms' }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats - Coming Soon */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-card-bg border border-border p-4" style={{ borderLeft: '3px solid var(--primary)' }}>
                <p className="text-[10px] font-heading uppercase tracking-wider text-text-secondary mb-1">Total Panels</p>
                <p className="text-2xl font-bold font-heading text-text-primary">—</p>
                <p className="text-[9px] text-text-placeholder mt-1">Coming Soon</p>
              </div>
              <div className="bg-card-bg border border-border p-4" style={{ borderLeft: '3px solid var(--status-installed)' }}>
                <p className="text-[10px] font-heading uppercase tracking-wider text-text-secondary mb-1">Installed</p>
                <p className="text-2xl font-bold font-heading text-status-installed">—</p>
                <p className="text-[9px] text-text-placeholder mt-1">Coming Soon</p>
              </div>
              <div className="bg-card-bg border border-border p-4" style={{ borderLeft: '3px solid var(--status-pending)' }}>
                <p className="text-[10px] font-heading uppercase tracking-wider text-text-secondary mb-1">Pending</p>
                <p className="text-2xl font-bold font-heading text-status-pending">—</p>
                <p className="text-[9px] text-text-placeholder mt-1">Coming Soon</p>
              </div>
              <div className="bg-card-bg border border-border p-4" style={{ borderLeft: '3px solid var(--status-problem)' }}>
                <p className="text-[10px] font-heading uppercase tracking-wider text-text-secondary mb-1">Problems</p>
                <p className="text-2xl font-bold font-heading text-status-problem">—</p>
                <p className="text-[9px] text-text-placeholder mt-1">Coming Soon</p>
              </div>
              <div className="bg-card-bg border border-border p-4" style={{ borderLeft: '3px solid var(--text-placeholder)' }}>
                <p className="text-[10px] font-heading uppercase tracking-wider text-text-secondary mb-1">Not Started</p>
                <p className="text-2xl font-bold font-heading text-text-secondary">—</p>
                <p className="text-[9px] text-text-placeholder mt-1">Coming Soon</p>
              </div>
            </div>

            {/* Progress - Coming Soon */}
            <div className="bg-card-bg border border-border p-6" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
              <div className="flex justify-between items-end mb-2">
                <h3 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider">
                  Overall Progress
                </h3>
                <span className="text-2xl font-bold font-heading text-accent">—</span>
              </div>
              <div className="w-full h-2 bg-subtle-bg overflow-hidden">
                <div className="h-full bg-accent" style={{ width: '0%' }} />
              </div>
              <p className="text-[11px] text-text-placeholder mt-2">
                Coming Soon - Track panel installation progress here.
              </p>
            </div>

            {/* Quick Actions - All Disabled */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DisabledLink icon={FileTextIcon} label="View Drawings" />
              <DisabledLink icon={SearchIcon} label="Search Panels" />
              <DisabledLink icon={CameraIcon} label="Upload Photo" />
              <DisabledLink icon={FileBarChartIcon} label="Generate Report" />
            </div>

            {/* Recent Photos - Coming Soon */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider">
                  Recent Photos
                </h3>
                <span className="text-[12px] text-text-placeholder">Coming Soon</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {mockPhotos.slice(0, 6).map((_, i) => (
                  <div key={i} className="aspect-square bg-subtle-bg border border-border overflow-hidden flex items-center justify-center">
                    <CameraIcon className="w-8 h-8 text-text-placeholder" />
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-text-placeholder mt-3">
                Photo upload and gallery coming soon
              </p>
            </div>

            {/* System Status Message */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
              <ConstructionIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-[12px] text-yellow-600 dark:text-yellow-400">
                Drawings and panel management features are currently under development.
                <br />
                Check back soon for updates!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}