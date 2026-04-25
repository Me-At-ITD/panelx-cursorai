// pages/RoleManagement.tsx
import React, { useState, useEffect } from 'react';
import { PlusIcon, Edit2Icon, Trash2Icon, ShieldIcon, KeyIcon } from 'lucide-react';
import { useRoles, Role, Permission } from '../hooks/useRoles';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface RoleManagementProps {
  onSelectRole?: (role: Role) => void;
}

export function RoleManagement({ onSelectRole }: RoleManagementProps) {
  const {
    getRoles,
    getPermissions,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
    isLoading,
    error,
  } = useRoles();
  const { addToast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteRole, setConfirmDeleteRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    const result = await getRoles();
    if (result.success && result.data) {
      setRoles(result.data);
    }
  };

  const loadPermissions = async () => {
    const result = await getPermissions();
    if (result.success && result.data) {
      setPermissions(result.data);
    }
  };

  const handleCreateRole = () => {
    setModalMode('create');
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setModalMode('edit');
    setFormData({ name: role.name, description: role.description || '' });
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions.map(p => p.id));
    setIsPermissionsModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();

    let result;
    if (modalMode === 'create') {
      result = await createRole(formData);
    } else {
      result = await updateRole(selectedRole!.id, formData);
    }

    if (result.success) {
      setIsModalOpen(false);
      addToast('success', modalMode === 'create' ? `Role "${formData.name}" created successfully` : `Role "${formData.name}" updated successfully`);
      loadRoles();
    } else {
      addToast('error', result.error || 'Failed to save role');
    }
  };

  const handleDeleteRole = (role: Role) => {
    setConfirmDeleteRole(role);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteRole) return;
    setIsDeleting(true);
    const result = await deleteRole(confirmDeleteRole.id);
    setIsDeleting(false);
    setConfirmDeleteRole(null);
    if (result.success) {
      addToast('success', `Role "${confirmDeleteRole.name}" deleted successfully`);
      loadRoles();
    } else {
      addToast('error', result.error || 'Failed to delete role');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    const result = await updateRolePermissions(selectedRole.id, selectedPermissions);
    if (result.success) {
      setIsPermissionsModalOpen(false);
      addToast('success', `Permissions for "${selectedRole.name}" updated successfully`);
      loadRoles();
    } else {
      addToast('error', result.error || 'Failed to update permissions');
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  if (isLoading && roles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-heading text-lg font-semibold text-text-primary flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-accent" />
            Role Management
          </h2>
          <p className="text-[12px] text-text-secondary mt-1">
            Manage roles and their permissions for access control
          </p>
        </div>
        <button
          onClick={handleCreateRole}
          className="btn-primary px-4 py-2 text-white font-heading text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Create Role
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500 text-red-500 text-[12px]">
          {error}
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-card-bg border border-border p-4 hover:shadow-lg transition-shadow"
            style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-heading text-[14px] font-semibold text-text-primary">
                  {role.name}
                </h3>
                <p className="text-[11px] text-text-secondary mt-1">
                  {role.description || 'No description'}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditRole(role)}
                  className="p-1.5 text-text-secondary hover:text-accent transition-colors"
                  title="Edit Role"
                >
                  <Edit2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRole(role)}
                  disabled={isDeleting}
                  className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
                  title="Delete Role"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Permissions Summary */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-heading font-semibold text-text-secondary uppercase tracking-wider">
                  Permissions ({role.permissions?.length || 0})
                </span>
                <button
                  onClick={() => handleManagePermissions(role)}
                  className="text-[10px] text-accent hover:underline font-medium"
                >
                  Manage
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {role.permissions?.slice(0, 3).map((perm) => (
                  <span
                    key={perm.id}
                    className="px-1.5 py-0.5 bg-accent/10 text-accent text-[9px] font-heading font-semibold uppercase tracking-wider"
                  >
                    {perm.name.split('.').pop()}
                  </span>
                ))}
                {role.permissions && role.permissions.length > 3 && (
                  <span className="px-1.5 py-0.5 bg-subtle-bg text-text-secondary text-[9px] font-heading">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Meta Info */}
            <div className="mt-3 pt-2 text-[9px] text-text-secondary">
              <div>Created: {new Date(role.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}

        {roles.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12 text-text-secondary">
            No roles created yet. Click "Create Role" to get started.
          </div>
        )}
      </div>

      {/* Create/Edit Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card-bg border border-border w-full max-w-md p-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
              {modalMode === 'create' ? 'Create New Role' : 'Edit Role'}
            </h2>
            
            <form onSubmit={handleSaveRole}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
                    placeholder="e.g., Project Manager"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent"
                    placeholder="Describe the role's purpose"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border text-[12px] font-heading font-semibold text-text-primary hover:bg-subtle-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary px-4 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (modalMode === 'create' ? 'Create Role' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Permissions Modal */}
      {isPermissionsModalOpen && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card-bg border border-border w-full max-w-2xl max-h-[80vh] overflow-scroll">
            <div className="p-6 border-b border-border">
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                Manage Permissions for "{selectedRole.name}"
              </h2>
              <p className="text-[12px] text-text-secondary mt-1">
                Select the permissions this role should have
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start gap-3 p-3 border border-border hover:bg-subtle-bg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="mt-0.5 w-4 h-4 text-accent border-border rounded-none focus:ring-accent"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <KeyIcon className="w-3 h-3 text-accent" />
                        <span className="text-[12px] font-mono font-medium text-text-primary">
                          {permission.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(false)}
                className="px-4 py-2 border border-border text-[12px] font-heading font-semibold text-text-primary hover:bg-subtle-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={isLoading}
                className="btn-primary px-4 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteRole}
        onClose={() => setConfirmDeleteRole(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${confirmDeleteRole?.name}"? Users with this role will lose their permissions.`}
        confirmText="Delete Role"
        variant="danger"
      />
    </div>
  );
}