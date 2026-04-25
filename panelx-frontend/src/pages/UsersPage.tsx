import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, Edit2Icon, Trash2Icon, Loader2 } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { useUsers, User } from '../hooks/useUsers';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

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

function getRoleBadgeClass(role: string) {
  const r = role?.toLowerCase();
  if (r === 'admin' || r === 'superuser')
    return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
  if (r === 'editor' || r === 'project manager')
    return 'bg-accent/10 text-accent border border-accent/20';
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
}

function getUserRole(user: User): string {
  if (user.is_superuser) return 'Admin';
  if (user.roles && user.roles.length > 0) return user.roles[0].name;
  return 'User';
}

function getUserInitials(fullName: string): string {
  if (!fullName) return 'U';
  return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function UsersPage() {
  const { t } = useLanguage();
  const { getUsers, deleteUser, isLoading } = useUsers();
  const { addToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data.items || []);
    } else {
      addToast('error', result.error || 'Failed to load users');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    const result = await deleteUser(confirmDelete.id);
    setDeletingId(null);
    setConfirmDelete(null);
    if (result.success) {
      addToast('success', `${confirmDelete.full_name} has been deactivated`);
      await loadUsers();
    } else {
      addToast('error', result.error || 'Failed to deactivate user');
    }
  };

  return (
    <div>
      <h1
        className="font-heading text-2xl font-bold text-text-primary mb-8 uppercase tracking-wide"
        style={{ animation: 'fadeUp 0.35s ease both' }}
      >
        {t('Users')}
      </h1>

      <div style={{ animation: 'fadeUp 0.35s ease both', animationDelay: '100ms' }}>
        {isLoading ? (
          <SkeletonTable />
        ) : (
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
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-card-bg">
                    <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('User')}</th>
                    <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('Role')}</th>
                    <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('Projects')}</th>
                    <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('Joined')}</th>
                    <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('Status')}</th>
                    <th className="p-4 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider text-right">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-secondary text-[13px]">
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
                                onError={() => setImageErrors(prev => ({ ...prev, [user.id]: true }))}
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
                        <td className="p-4 text-[13px] text-text-secondary">—</td>
                        <td className="p-4 text-[13px] text-text-secondary">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                            <span className="text-[12px] text-text-primary">
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin-panel/user/${user.id}`}
                              state={{ user }}
                              className="p-1.5 text-text-secondary hover:text-accent transition-colors"
                              title="Edit User"
                            >
                              <Edit2Icon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setConfirmDelete(user)}
                              disabled={deletingId === user.id}
                              className="p-1.5 text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50"
                              title="Deactivate User"
                            >
                              {deletingId === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
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
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirmed}
        title="Deactivate User"
        description={`Are you sure you want to deactivate "${confirmDelete?.full_name}"? They will lose access to the system.`}
        confirmText="Deactivate"
        variant="danger"
      />
    </div>
  );
}
