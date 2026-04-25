import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  UsersIcon,
  SettingsIcon,
  LinkIcon,
  GlobeIcon,
  ShieldIcon,
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { useUsers, User } from '../hooks/useUsers';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RoleManagementModal } from '../components/RoleManagementModal';

function getRoleBadgeClass(role: string) {
  const r = role?.toLowerCase();
  if (r === 'admin' || r === 'superuser')
    return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
  if (r === 'editor')
    return 'bg-accent/10 text-accent border border-accent/20';
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
}

function SkeletonTable() {
  return (
    <div className="bg-card-bg border border-border" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
      <div className="p-4 border-b border-border bg-subtle-bg flex justify-between items-center">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-9 w-28" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 w-1/3">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
            <div className="skeleton h-6 w-16" />
            <div className="skeleton h-4 w-12" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-16" />
            <div className="flex gap-2">
              <div className="skeleton w-8 h-8" />
              <div className="skeleton w-8 h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPanelPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { getUsers, deleteUser, isLoading, error } = useUsers();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'integrations'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data.items || []);
    } else {
      addToast('error', result.error || 'Failed to load users');
    }
  };

  const getUserInitials = (fullName: string) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserRole = (user: User) => {
    if (user.is_superuser) return 'Admin';
    if (user.roles && user.roles.length > 0) return user.roles[0].name;
    return 'User';
  };

  const handleManageRoles = (user: User) => {
    setSelectedUserForRole(user);
  };

  const handleImageError = (userId: string) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }));
  };

  const handleEditUser = (user: User) => {
    navigate(`/admin-panel/user/${user.id}`, { state: { user } });
  };

  const handleDeleteUser = (user: User) => {
    setConfirmDeleteUser(user);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteUser) return;
    setDeletingUserId(confirmDeleteUser.id);
    const result = await deleteUser(confirmDeleteUser.id);
    setDeletingUserId(null);
    setConfirmDeleteUser(null);
    if (result.success) {
      addToast('success', `${confirmDeleteUser.full_name} has been deactivated`);
      await loadUsers();
    } else {
      addToast('error', result.error || 'Failed to deactivate user');
    }
  };

  return (
    <>
      <div>
        <h1
          className="font-heading text-2xl font-bold text-text-primary mb-8 uppercase tracking-wide"
          style={{ animation: 'fadeUp 0.35s ease both' }}
        >
          {t('Admin Panel')}
        </h1>

        {/* Tabs */}
        <div
          className="flex border-b border-border mb-6"
          style={{ animation: 'fadeUp 0.35s ease both', animationDelay: '50ms' }}
        >
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors relative ${
              activeTab === 'users' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            {t('Users')}
            {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-6 py-3 font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors relative ${
              activeTab === 'system' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            {t('System')}
            {activeTab === 'system' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-6 py-3 font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors relative ${
              activeTab === 'integrations' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            {t('Integrations')}
            {activeTab === 'integrations' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ animation: 'fadeUp 0.35s ease both', animationDelay: '100ms' }}>
          {activeTab === 'users' && (
            <div className="bg-card-bg border border-border" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
              <div
                className="p-4 border-b border-border bg-subtle-bg flex items-center justify-between"
                style={{ borderLeft: '3px solid var(--primary)' }}
              >
                <h2 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider">
                  {t('User Management')}
                </h2>
                <Link
                  to="/admin-panel/user/new"
                  className="btn-primary px-4 py-2 text-white font-heading text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  {t('Add User')}
                </Link>
              </div>

              {error && (
                <div className="p-4 text-stat-alerts text-center border-b border-border">{error}</div>
              )}

              {isLoading ? (
                <SkeletonTable />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-card-bg">
                        <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('User')}</th>
                        <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('Role')}</th>
                        <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('Status')}</th>
                        <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('Created')}</th>
                        <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider text-right">{t('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-text-secondary">
                            No users found. Click "Add User" to create one.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-subtle-bg transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {user.profile_image_url && !imageErrors[user.id] ? (
                                  <img
                                    src={user.profile_image_url}
                                    alt={user.full_name}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={() => handleImageError(user.id)}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-heading font-bold flex-shrink-0">
                                    {getUserInitials(user.full_name)}
                                  </div>
                                )}
                                <div>
                                  <p className="text-[13px] font-medium text-text-primary">{user.full_name}</p>
                                  <p className="text-[11px] text-text-secondary">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider ${getRoleBadgeClass(getUserRole(user))}`}>
                                {getUserRole(user)}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                                <span className="text-[12px] text-text-primary">
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-[13px] text-text-secondary">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="p-1.5 text-text-secondary hover:text-accent transition-colors"
                                  title="Edit User"
                                  disabled={deletingUserId === user.id}
                                >
                                  <Edit2Icon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleManageRoles(user)}
                                  className="p-1.5 text-text-secondary hover:text-accent transition-colors"
                                  title="Manage Roles"
                                  disabled={deletingUserId === user.id}
                                >
                                  <ShieldIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={deletingUserId === user.id}
                                  className="p-1.5 text-text-secondary hover:text-stat-alerts transition-colors disabled:opacity-50"
                                  title="Deactivate User"
                                >
                                  {deletingUserId === user.id ? (
                                    <div className="w-4 h-4 border-2 border-stat-alerts border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2Icon className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-card-bg border border-border p-8 min-h-[400px]">
              <div className="max-w-2xl">
                <h2 className="font-heading text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <GlobeIcon className="w-5 h-5 text-accent" />
                  {t('Language & Region')}
                </h2>
                <div className="space-y-6">
                  <div className="p-6 border border-border bg-subtle-bg">
                    <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider mb-4">
                      {t('Interface Language')}
                    </h3>
                    <p className="text-[13px] text-text-secondary mb-4">
                      Select your preferred language. This will also update the text direction (LTR/RTL).
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`flex-1 p-4 border flex flex-col items-center justify-center gap-2 transition-colors ${
                          language === 'en'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-card-bg text-text-secondary hover:border-accent/50'
                        }`}
                      >
                        <span className="text-2xl font-bold">A</span>
                        <span className="font-heading text-[12px] font-semibold uppercase tracking-wider">
                          {t('English (LTR)')}
                        </span>
                      </button>
                      <button
                        onClick={() => setLanguage('he')}
                        className={`flex-1 p-4 border flex flex-col items-center justify-center gap-2 transition-colors ${
                          language === 'he'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-card-bg text-text-secondary hover:border-accent/50'
                        }`}
                      >
                        <span className="text-2xl font-bold">א</span>
                        <span className="font-heading text-[12px] font-semibold uppercase tracking-wider">
                          {t('Hebrew (RTL)')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-card-bg border border-border p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <LinkIcon className="w-12 h-12 text-text-placeholder mb-4" />
              <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                Integration Management Coming Soon
              </h3>
              <p className="text-[13px] text-text-secondary max-w-md">
                Connect PanelX with your existing tools like AutoCAD, Revit, Procore, and cloud storage providers.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedUserForRole && (
        <RoleManagementModal
          user={selectedUserForRole}
          onClose={() => setSelectedUserForRole(null)}
          onSuccess={() => {
            loadUsers();
            addToast('success', `Role updated for ${selectedUserForRole.full_name}`);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteUser}
        onClose={() => setConfirmDeleteUser(null)}
        onConfirm={handleDeleteConfirmed}
        title="Deactivate User"
        description={`Are you sure you want to deactivate "${confirmDeleteUser?.full_name}"? They will lose access to the system.`}
        confirmText="Deactivate"
        variant="danger"
      />
    </>
  );
}
