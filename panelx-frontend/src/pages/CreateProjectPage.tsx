import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, ServerIcon, Loader2, UserPlusIcon, XIcon } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useUsers } from '../hooks/useUsers';
import { useToast } from '../components/Toast';

interface Assignment {
  user_id: string;
  user_name: string;
  user_role: string;
}

export function CreateProjectPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { createProject, assignUserToProjects, createSyncConfig, testConnection, isLoading: projectsLoading } = useProjects();
  const { getUsers } = useUsers();

  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Step 1 State
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Step 2 State - Assign Users (no role — role comes from the user's global role)
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Step 3 State - Sync Settings
  const [serverAddress, setServerAddress] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [filePath, setFilePath] = useState('');
  const [syncFrequency, setSyncFrequency] = useState('manual');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const usersResult = await getUsers();
    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data.items || []);
    }
  };

  const handleAddAssignment = () => {
    if (!selectedUserId) return;
    if (assignments.some(a => a.user_id === selectedUserId)) return;

    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      const userRole = user.is_superuser
        ? 'Admin'
        : user.roles?.[0]?.name || 'No Role';
      setAssignments([...assignments, {
        user_id: user.id,
        user_name: user.full_name,
        user_role: userRole,
      }]);
      setSelectedUserId('');
    }
  };

  const handleRemoveAssignment = (userId: string) => {
    setAssignments(assignments.filter(a => a.user_id !== userId));
  };

  const handleNextStep = () => {
    if (step === 1 && projectName) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);

    const result = await testConnection({
      server_address: serverAddress,
      port: parseInt(port),
      username: username,
      password: password,
      file_path: filePath || '/',
    });

    if (result.success && result.data) {
      setConnectionTestResult({ success: result.data.success, message: result.data.message });
      addToast(result.data.success ? 'success' : 'error', result.data.message);
    } else if (result.error) {
      setConnectionTestResult({ success: false, message: result.error });
      addToast('error', result.error);
    }
    setIsTestingConnection(false);
  };

  const handleCreateAll = async () => {
    setIsCreating(true);
    let createdProjectId: string | null = null;

    try {
      // Step 1: Create Project
      const projectResult = await createProject({
        name: projectName,
        description: projectDescription,
      });

      if (!projectResult.success || !projectResult.data) {
        throw new Error(projectResult.error || 'Failed to create project');
      }

      createdProjectId = projectResult.data.id;

      // Step 2: Assign Users to Project (no project-level role; user's global role applies)
      if (assignments.length > 0) {
        for (const assignment of assignments) {
          await assignUserToProjects({
            user_id: assignment.user_id,
            project_ids: [createdProjectId],
          });
        }
      }

      // Step 3: Create Sync Configuration (if provided)
      if (serverAddress && username) {
        const syncResult = await createSyncConfig(createdProjectId, {
          server_address: serverAddress,
          port: parseInt(port),
          username: username,
          password: password,
          file_path: filePath || '/',
          sync_frequency: syncFrequency,
        });
        if (!syncResult.success) {
          addToast('warning', 'Project created but sync configuration could not be saved');
        }
      }

      addToast('success', `Project "${projectName}" created successfully`);
      navigate('/projects');
    } catch (error: any) {
      console.error('Creation error:', error);
      addToast('error', error.message || 'Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const isStep1Valid = projectName.trim() !== '';
  const isStep3Valid = true; // Sync settings are optional

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Projects
        </Link>
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          Create New Project
        </h1>
        <p className="text-[13px] text-text-secondary mt-2">
          Fill in the project details. All changes will be saved at the end.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-[12px] font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-subtle-bg text-text-secondary border border-border'}`}>
            {step > 1 ? <CheckIcon className="w-4 h-4" /> : '1'}
          </div>
          <span className={`ml-3 font-heading text-[11px] uppercase tracking-wider font-semibold ${step >= 1 ? 'text-text-primary' : 'text-text-secondary'}`}>
            Project Details
          </span>
        </div>
        <div className={`flex-1 h-px mx-4 ${step > 1 ? 'bg-primary' : 'bg-border'}`} />
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-[12px] font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-subtle-bg text-text-secondary border border-border'}`}>
            2
          </div>
          <span className={`ml-3 font-heading text-[11px] uppercase tracking-wider font-semibold ${step >= 2 ? 'text-text-primary' : 'text-text-secondary'}`}>
            Assign Team
          </span>
        </div>
        <div className={`flex-1 h-px mx-4 ${step > 2 ? 'bg-primary' : 'bg-border'}`} />
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-[12px] font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-subtle-bg text-text-secondary border border-border'}`}>
            3
          </div>
          <span className={`ml-3 font-heading text-[11px] uppercase tracking-wider font-semibold ${step >= 3 ? 'text-text-primary' : 'text-text-secondary'}`}>
            Sync Settings
          </span>
        </div>
      </div>

      <div className="bg-card-bg border border-border p-8 animate-fade-up" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04)', animationDelay: '100ms' }}>
        
        {/* Step 1: Project Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. Tower A - Main Facade"
              />
            </div>

            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Optional project description..."
              />
            </div>

            <div className="flex justify-end pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!isStep1Valid}
                className="btn-primary px-8 h-10 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                Next: Assign Team
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Assign Users */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-accent/5 p-4 border border-accent/20">
              <p className="text-[13px] text-text-primary">
                Select team members to assign to this project. Their role is determined by their account settings.
              </p>
            </div>

            {/* Add User */}
            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                Select User
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
                >
                  <option value="">Select a user...</option>
                  {users
                    .filter(u => !assignments.some(a => a.user_id === u.id))
                    .map((user) => {
                      const role = user.is_superuser ? 'Admin' : user.roles?.[0]?.name || 'No Role';
                      return (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.email}) — {role}
                        </option>
                      );
                    })}
                </select>
                <button
                  type="button"
                  onClick={handleAddAssignment}
                  disabled={!selectedUserId}
                  className="btn-primary px-4 py-2 text-white font-heading text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center gap-1"
                >
                  <UserPlusIcon className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Assigned Users List */}
            {assignments.length > 0 && (
              <div className="border border-border">
                <div className="p-3 bg-subtle-bg border-b border-border">
                  <span className="text-[11px] font-heading font-semibold uppercase tracking-wider">
                    Team Members ({assignments.length})
                  </span>
                </div>
                <div className="divide-y divide-border max-h-64 overflow-y-auto">
                  {assignments.map((assignment, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="text-[13px] font-medium text-text-primary">{assignment.user_name}</div>
                        <div className="text-[11px] text-text-secondary">{assignment.user_role}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(assignment.user_id)}
                        className="p-1 text-text-secondary hover:text-red-500 transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-border">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="px-4 py-2 text-[12px] font-heading font-medium uppercase tracking-wider text-text-secondary hover:text-text-primary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-primary px-8 h-10 text-white font-heading text-[12px] font-semibold uppercase tracking-wider"
              >
                Next: Sync Settings
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sync Settings */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-accent/5 p-4 border border-accent/20">
              <p className="text-[13px] text-text-primary">
                Configure SFTP sync settings. You can skip this and configure later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Server Address
                </label>
                <div className="relative">
                  <ServerIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    value={serverAddress}
                    onChange={(e) => setServerAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
                    placeholder="sftp.example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Port
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  File Path
                </label>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="/"
                  className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                Sync Frequency
              </label>
              <select
                value={syncFrequency}
                onChange={(e) => setSyncFrequency(e.target.value)}
                className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
              >
                <option value="manual">Manual</option>
                <option value="5m">Every 5 minutes</option>
                <option value="15m">Every 15 minutes</option>
                <option value="1h">Every hour</option>
                <option value="12h">Every 12 hours</option>
                <option value="24h">Daily</option>
              </select>
            </div>

            {connectionTestResult && (
              <div className={`p-3 border ${connectionTestResult.success ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                {connectionTestResult.message}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-border">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="px-4 py-2 text-[12px] font-heading font-medium uppercase tracking-wider text-text-secondary hover:text-text-primary"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={!serverAddress || !username || isTestingConnection}
                  className="px-4 py-2 text-[12px] font-heading font-medium uppercase tracking-wider text-accent hover:bg-accent/10 transition-colors border border-accent disabled:opacity-50 flex items-center gap-2"
                >
                  {isTestingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Test Connection
                </button>
                <button
                  type="button"
                  onClick={handleCreateAll}
                  disabled={isCreating || !isStep1Valid}
                  className="btn-primary px-6 h-10 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isCreating ? 'Creating Project...' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Section - Show collected data */}
      {step === 3 && (
        <div className="mt-6 p-4 bg-subtle-bg border border-border animate-fade-up" style={{ animationDelay: '150ms' }}>
          <h3 className="font-heading text-[11px] font-semibold text-text-primary uppercase tracking-wider mb-3">
            Project Summary
          </h3>
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-text-secondary">Project Name:</span>
              <span className="text-text-primary font-medium">{projectName}</span>
            </div>
            {assignments.length > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Team Members:</span>
                <span className="text-text-primary font-medium">{assignments.length} assigned</span>
              </div>
            )}
            {serverAddress && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Sync Server:</span>
                <span className="text-text-primary font-medium">{serverAddress}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}