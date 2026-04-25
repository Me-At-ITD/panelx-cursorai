import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  SaveIcon,
  Trash2Icon,
  UsersIcon,
  ShieldIcon,
  BellIcon,
  Loader2,
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  ClockIcon,
  AlertCircleIcon,
  GlobeIcon,
  KeyIcon,
  FolderIcon,
  NetworkIcon,
  ActivityIcon,
  PlusIcon,
  XIcon
} from 'lucide-react';
import { useProjects, Project, SyncConfig } from '../hooks/useProjects';
import { useUsers, User } from '../hooks/useUsers';
import { useRoles, Role } from '../hooks/useRoles';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

// Type for project users from API
interface ProjectUser {
  user_id: string;
  full_name: string;
  email: string;
  role_id: string | null;
  role_name: string | null;
}

export function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { 
    getProject, 
    updateProject, 
    deleteProject, 
    getSyncConfig,
    updateSyncConfig,
    createSyncConfig,
    deleteSyncConfig,
    testConnection,
    assignUserToProjects,
    removeUserFromProject,
    isLoading 
  } = useProjects();
  const { getUsers } = useUsers();
  const { getRoles } = useRoles();
  
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'sync' | 'danger'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [project, setProject] = useState<Project & { users?: ProjectUser[] } | null>(null);
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });
  
  const [syncConfig, setSyncConfig] = useState<SyncConfig | null>(null);
  const [syncFormData, setSyncFormData] = useState({
    server_address: '',
    port: 22,
    username: '',
    password: '',
    file_path: '/',
    sync_frequency: 'manual',
    is_active: true,
  });

  // Team management states
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showRemoveUserConfirm, setShowRemoveUserConfirm] = useState<{ userId: string; userName: string } | null>(null);
  const [showDeleteSyncConfirm, setShowDeleteSyncConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectData();
      loadUsers();
    }
  }, [id]);

  const loadProjectData = async () => {
    const projectResult = await getProject(id!);
    if (projectResult.success && projectResult.data) {
      const projectData = projectResult.data as Project & { users?: ProjectUser[] };
      setProject(projectData);
      setProjectUsers(projectData.users || []);
      setFormData({
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status || 'active',
      });
    }
    
    const syncResult = await getSyncConfig(id!);
    if (syncResult.success && syncResult.data) {
      setSyncConfig(syncResult.data);
      setSyncFormData({
        server_address: syncResult.data.server_address,
        port: syncResult.data.port,
        username: syncResult.data.username,
        password: '',
        file_path: syncResult.data.file_path,
        sync_frequency: syncResult.data.sync_frequency,
        is_active: syncResult.data.is_active,
      });
    }
  };

  const loadUsers = async () => {
    const usersResult = await getUsers();
    if (usersResult.success && usersResult.data) {
      setAllUsers(usersResult.data.items || []);
    }
  };

  const handleSaveGeneral = async () => {
    if (!id) return;
    setIsSaving(true);
    
    const result = await updateProject(id, {
      name: formData.name,
      description: formData.description,
      status: formData.status,
    });
    
    setIsSaving(false);
    if (result.success) {
      addToast('success', 'Project updated successfully');
      loadProjectData();
    } else {
      addToast('error', result.error || 'Failed to update project');
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    
    const result = await testConnection({
      server_address: syncFormData.server_address,
      port: syncFormData.port,
      username: syncFormData.username,
      password: syncFormData.password,
      file_path: syncFormData.file_path,
    });
    
    if (result.success && result.data) {
      setConnectionTestResult({
        success: result.data.success,
        message: result.data.message,
      });
      if (result.data.success) {
        addToast('success', 'Connection test successful!');
      } else {
        addToast('error', result.data.message);
      }
    } else if (result.error) {
      setConnectionTestResult({
        success: false,
        message: result.error,
      });
      addToast('error', result.error);
    }
    setIsTestingConnection(false);
  };

  const handleSaveSync = async () => {
    if (!id) return;
    setIsSaving(true);
    
    const updateData: any = {
      server_address: syncFormData.server_address,
      port: syncFormData.port,
      username: syncFormData.username,
      file_path: syncFormData.file_path,
      sync_frequency: syncFormData.sync_frequency,
      is_active: syncFormData.is_active,
    };
    
    if (syncFormData.password) {
      updateData.password = syncFormData.password;
    }
    
    let result;
    if (syncConfig) {
      result = await updateSyncConfig(id, updateData);
    } else {
      result = await createSyncConfig(id, {
        server_address: syncFormData.server_address,
        port: syncFormData.port,
        username: syncFormData.username,
        password: syncFormData.password,
        file_path: syncFormData.file_path,
        sync_frequency: syncFormData.sync_frequency,
      });
    }
    
    setIsSaving(false);
    if (result.success) {
      addToast('success', 'Sync configuration saved successfully');
      loadProjectData();
    } else {
      addToast('error', result.error || 'Failed to save sync configuration');
    }
  };

  const handleDeleteSyncConfig = async () => {
    if (!id || !syncConfig) return;
    
    const result = await deleteSyncConfig(id);
    if (result.success) {
      setSyncConfig(null);
      setSyncFormData({
        server_address: '',
        port: 22,
        username: '',
        password: '',
        file_path: '/',
        sync_frequency: 'manual',
        is_active: true,
      });
      addToast('success', 'Sync configuration deleted');
      setShowDeleteSyncConfirm(false);
    } else {
      addToast('error', result.error || 'Failed to delete sync configuration');
    }
  };

  // Team Management Functions
  const handleAssignUser = async () => {
    if (!selectedUserId || !id) return;
    
    setIsAssigning(true);
    const result = await assignUserToProjects({
      user_id: selectedUserId,
      project_ids: [id],
    });
    
    setIsAssigning(false);
    
    if (result.success) {
      setShowAddUserModal(false);
      setSelectedUserId('');
      await loadProjectData();
      addToast('success', 'User assigned successfully');
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : 'Failed to assign user';
      addToast('error', errorMsg);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!id) return;
    
    setIsRemoving(userId);
    // Updated: pass projectId and userId separately
    const result = await removeUserFromProject(id, userId);
    setIsRemoving(null);
    
    if (result.success) {
      await loadProjectData();
      addToast('success', `${userName} removed successfully`);
      setShowRemoveUserConfirm(null);
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : 'Failed to remove user';
      addToast('error', errorMsg);
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    const result = await deleteProject(id);
    setIsDeleting(false);
    
    if (result.success) {
      addToast('success', 'Project deleted successfully');
      setShowDeleteConfirm(false);
      navigate('/projects');
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : 'Failed to delete project';
      addToast('error', errorMsg);
    }
  };

  const getSyncFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'manual': return 'Manual (on-demand)';
      case '5m': return 'Every 5 minutes';
      case '15m': return 'Every 15 minutes';
      case '1h': return 'Every hour';
      case '12h': return 'Every 12 hours';
      case '24h': return 'Daily';
      default: return frequency;
    }
  };

  const getUserRoleDisplay = (user: ProjectUser) => {
    if (user.role_name) return user.role_name;
    const fullUser = allUsers.find(u => u.id === user.user_id);
    if (fullUser?.is_superuser) return 'Admin';
    if (fullUser?.roles?.[0]?.name) return fullUser.roles[0].name;
    return 'No Role';
  };

  if (isLoading && !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Project not found</p>
        <Link to="/projects" className="btn-primary mt-4 inline-block">Back to Projects</Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Project Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">Project Settings</h1>
            {activeTab === 'general' && (
              <button onClick={handleSaveGeneral} disabled={isSaving} className="btn-primary h-10 px-6 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
              <button onClick={() => setActiveTab('general')} className={`flex items-center gap-3 px-4 py-3 text-[13px] font-heading uppercase tracking-wider font-semibold transition-colors ${activeTab === 'general' ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-text-secondary hover:bg-subtle-bg hover:text-text-primary border-l-2 border-transparent'}`}>
                <ShieldIcon className="w-4 h-4" /> General
              </button>
              <button onClick={() => setActiveTab('team')} className={`flex items-center gap-3 px-4 py-3 text-[13px] font-heading uppercase tracking-wider font-semibold transition-colors ${activeTab === 'team' ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-text-secondary hover:bg-subtle-bg hover:text-text-primary border-l-2 border-transparent'}`}>
                <UsersIcon className="w-4 h-4" /> Team Access
              </button>
              <button onClick={() => setActiveTab('sync')} className={`flex items-center gap-3 px-4 py-3 text-[13px] font-heading uppercase tracking-wider font-semibold transition-colors ${activeTab === 'sync' ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-text-secondary hover:bg-subtle-bg hover:text-text-primary border-l-2 border-transparent'}`}>
                <ServerIcon className="w-4 h-4" /> SFTP Sync
              </button>
              <button onClick={() => setActiveTab('danger')} className={`flex items-center gap-3 px-4 py-3 text-[13px] font-heading uppercase tracking-wider font-semibold transition-colors ${activeTab === 'danger' ? 'bg-red-500/10 text-red-500 border-l-2 border-red-500' : 'text-text-secondary hover:bg-red-500/5 hover:text-red-500 border-l-2 border-transparent'}`}>
                <Trash2Icon className="w-4 h-4" /> Danger Zone
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="bg-card-bg border border-border p-6 space-y-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">Project Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">Project Description</label>
                    <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors resize-none" />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">Project Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent appearance-none cursor-pointer">
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px]">
                      <div><span className="text-text-secondary">Project ID:</span><p className="text-text-primary font-mono text-[11px] mt-1">{project.id}</p></div>
                      <div><span className="text-text-secondary">Owner ID:</span><p className="text-text-primary font-mono text-[11px] mt-1">{project.owner_id}</p></div>
                      <div><span className="text-text-secondary">Created:</span><p className="text-text-primary mt-1">{new Date(project.created_at).toLocaleString()}</p></div>
                      <div><span className="text-text-secondary">Last Updated:</span><p className="text-text-primary mt-1">{new Date(project.updated_at).toLocaleString()}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Access Tab */}
            {activeTab === 'team' && (
              <div className="bg-card-bg border border-border">
                <div className="p-4 border-b border-border bg-subtle-bg flex items-center justify-between flex-wrap gap-3">
                  <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-accent" />
                    Team Members ({projectUsers.length})
                  </h2>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="btn-primary px-4 py-2 text-white font-heading text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add Member
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-card-bg">
                        <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">User</th>
                        <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Email</th>
                        <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Role (Global)</th>
                        <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {projectUsers.map((user) => (
                        <tr key={user.user_id} className="hover:bg-subtle-bg transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-heading font-bold">
                                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </div>
                              <span className="text-[13px] font-medium text-text-primary">
                                {user.full_name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-[13px] text-text-secondary">
                            {user.email}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider border bg-accent/10 text-accent border-accent/30">
                              <ShieldIcon className="w-3 h-3" />
                              {getUserRoleDisplay(user)}
                            </span>
                            <p className="text-[9px] text-text-placeholder mt-1">
                              Role is determined by user's account
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setShowRemoveUserConfirm({ userId: user.user_id, userName: user.full_name || user.email })}
                              disabled={isRemoving === user.user_id}
                              className="p-1.5 text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50"
                              title="Remove User"
                            >
                              {isRemoving === user.user_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2Icon className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {projectUsers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-text-secondary">
                            <UsersIcon className="w-12 h-12 mx-auto mb-3 text-text-placeholder" />
                            No team members assigned yet.
                            <button 
                              onClick={() => setShowAddUserModal(true)}
                              className="block mx-auto mt-3 text-accent hover:underline text-[12px]"
                            >
                              Add your first team member
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sync Tab */}
            {activeTab === 'sync' && (
              <div className="bg-card-bg border border-border p-6 space-y-6">
                {syncConfig && (
                  <div className="bg-subtle-bg border border-accent/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><ActivityIcon className="w-4 h-4 text-accent" /><span className="text-[11px] font-heading font-semibold uppercase tracking-wider">Sync Status</span></div>
                      <span className={`px-2 py-1 text-[9px] font-heading font-semibold uppercase tracking-wider border ${syncConfig.is_active ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                        {syncConfig.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div><span className="text-text-secondary">Last Sync:</span><p className="text-text-primary mt-1">{syncConfig.last_sync_at ? new Date(syncConfig.last_sync_at).toLocaleString() : 'Never'}</p></div>
                      <div><span className="text-text-secondary">Sync Frequency:</span><p className="text-text-primary mt-1">{getSyncFrequencyLabel(syncConfig.sync_frequency)}</p></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">Server Address</label>
                    <div className="relative"><GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" /><input type="text" value={syncFormData.server_address} onChange={(e) => setSyncFormData({ ...syncFormData, server_address: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent" placeholder="sftp.example.com" /></div>
                  </div>
                  
                  <div><label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">Port</label><div className="relative"><NetworkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" /><input type="number" value={syncFormData.port} onChange={(e) => setSyncFormData({ ...syncFormData, port: parseInt(e.target.value) })} className="w-full pl-10 pr-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent" placeholder="22" /></div></div>
                  
                  <div><label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">File Path</label><div className="relative"><FolderIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" /><input type="text" value={syncFormData.file_path} onChange={(e) => setSyncFormData({ ...syncFormData, file_path: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent" placeholder="/remote/path" /></div></div>
                  
                  <div><label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">Username</label><div className="relative"><UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" /><input type="text" value={syncFormData.username} onChange={(e) => setSyncFormData({ ...syncFormData, username: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent" /></div></div>
                  
                  <div><label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">Password</label><div className="relative"><KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" /><input type={showPassword ? 'text' : 'password'} value={syncFormData.password} onChange={(e) => setSyncFormData({ ...syncFormData, password: e.target.value })} placeholder={syncConfig ? "Leave blank to keep current" : "Enter password"} className="w-full pl-10 pr-10 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">{showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}</button></div></div>
                  
                  <div><label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">Sync Frequency</label><div className="relative"><ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" /><select value={syncFormData.sync_frequency} onChange={(e) => setSyncFormData({ ...syncFormData, sync_frequency: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent appearance-none cursor-pointer"><option value="manual">Manual</option><option value="5m">Every 5 minutes</option><option value="15m">Every 15 minutes</option><option value="1h">Every hour</option><option value="12h">Every 12 hours</option><option value="24h">Daily</option></select></div></div>
                  
                  <div className="flex items-center"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={syncFormData.is_active} onChange={(e) => setSyncFormData({ ...syncFormData, is_active: e.target.checked })} className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent" /><span className="text-[11px] text-text-primary">Enable automatic synchronization</span></label></div>
                </div>

                {connectionTestResult && (
                  <div className={`p-3 flex items-center gap-2 text-[11px] ${connectionTestResult.success ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                    {connectionTestResult.success ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    {connectionTestResult.message}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button onClick={handleTestConnection} disabled={!syncFormData.server_address || !syncFormData.username || isTestingConnection} className="px-4 py-2 text-[11px] font-heading font-semibold uppercase tracking-wider text-accent hover:bg-accent/10 transition-colors border border-accent disabled:opacity-50 flex items-center gap-2">
                    {isTestingConnection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCwIcon className="w-3.5 h-3.5" />}
                    Test Connection
                  </button>
                  <button onClick={handleSaveSync} disabled={isSaving} className="px-4 py-2 bg-accent text-white text-[11px] font-heading font-semibold uppercase tracking-wider hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2">
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SaveIcon className="w-3.5 h-3.5" />}
                    Save Sync Settings
                  </button>
                  {syncConfig && (
                    <button onClick={() => setShowDeleteSyncConfirm(true)} className="px-4 py-2 text-[11px] font-heading font-semibold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-colors border border-red-500 flex items-center gap-2">
                      <Trash2Icon className="w-3.5 h-3.5" /> Delete Config
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
              <div className="bg-card-bg border border-red-500/30 p-6 space-y-6">
                <div className="flex items-center justify-between p-4 border border-red-500/30 bg-red-500/5">
                  <div>
                    <div className="text-[13px] font-medium text-red-500">Delete Project</div>
                    <div className="text-[11px] text-text-secondary mt-1">Permanently delete this project and all its data. This action cannot be undone.</div>
                  </div>
                  <button onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting} className="px-4 py-2 bg-red-500 text-white text-[11px] font-heading font-semibold uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2Icon className="w-3.5 h-3.5" />}
                    {isDeleting ? 'Deleting...' : 'Delete Project'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card-bg border border-border max-w-md w-full">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider">
                  Add Team Member
                </h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                    Select User
                  </label>
                  <div className="space-y-2">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
                    >
                      <option value="">Choose a user...</option>
                      {allUsers
                        .filter(user => !projectUsers.some(pu => pu.user_id === user.id))
                        .map(user => {
                          const role = user.is_superuser 
                            ? 'Admin' 
                            : user.roles?.[0]?.name || 'No Role';
                          return (
                            <option key={user.id} value={user.id}>
                              {user.full_name} ({user.email}) — {role}
                            </option>
                          );
                        })}
                    </select>
                    <p className="text-[10px] text-text-placeholder">
                      Note: Users keep their global role. No project-specific role needed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-border flex justify-end gap-3">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-border text-[11px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignUser}
                  disabled={!selectedUserId || isAssigning}
                  className="btn-primary px-4 py-2 text-white font-heading text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                  {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusIcon className="w-3.5 h-3.5" />}
                  {isAssigning ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Project Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete "${project?.name}"? This action cannot be undone. All project data, files, and settings will be permanently removed.`}
        confirmText="Delete Project"
        variant="danger"
      />

      {/* Confirm Remove User Dialog */}
      <ConfirmDialog
        isOpen={!!showRemoveUserConfirm}
        onClose={() => setShowRemoveUserConfirm(null)}
        onConfirm={() => showRemoveUserConfirm && handleRemoveUser(showRemoveUserConfirm.userId, showRemoveUserConfirm.userName)}
        title="Remove Team Member"
        description={`Are you sure you want to remove "${showRemoveUserConfirm?.userName}" from this project? They will lose access to all project resources.`}
        confirmText="Remove User"
        variant="danger"
      />

      {/* Confirm Delete Sync Config Dialog */}
      <ConfirmDialog
        isOpen={showDeleteSyncConfirm}
        onClose={() => setShowDeleteSyncConfirm(false)}
        onConfirm={handleDeleteSyncConfig}
        title="Delete Sync Configuration"
        description="Are you sure you want to delete the SFTP sync configuration? This will stop all automatic file synchronization for this project."
        confirmText="Delete Configuration"
        variant="danger"
      />
    </>
  );
}