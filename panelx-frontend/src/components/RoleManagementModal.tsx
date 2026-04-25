// components/RoleManagementModal.tsx
import React, { useState, useEffect } from 'react';
import { XIcon, ShieldIcon } from 'lucide-react';
import { useUsers, Role, User } from '../hooks/useUsers';

interface RoleManagementModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export function RoleManagementModal({ user, onClose, onSuccess }: RoleManagementModalProps) {
  const { getRoles, updateUserRole, isLoading } = useUsers();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current role ID (assuming one role per user)
  const currentRoleId = user.roles && user.roles.length > 0 ? user.roles[0].id : '';
  const currentRoleName = user.roles && user.roles.length > 0 ? user.roles[0].name : 'No role assigned';

  useEffect(() => {
    loadRoles();
    // Pre-select current role if exists
    if (currentRoleId) {
      setSelectedRoleId(currentRoleId);
    }
  }, []);

  const loadRoles = async () => {
    const result = await getRoles();
    if (result.success && result.data) {
      setRoles(result.data);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRoleId) return;
    
    // Check if the role is actually changing
    if (selectedRoleId === currentRoleId) {
      onClose(); // No change needed
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    // Use the new updateUserRole function (PUT endpoint)
    const result = await updateUserRole(user.id, selectedRoleId);
    
    setIsProcessing(false);
    
    if (result.success) {
      onSuccess(); // Refresh user list
      onClose(); // Close modal
    } else {
      setError(result.error || 'Failed to update role');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg border border-border max-w-md w-full animate-fade-up">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-4 h-4 text-accent" />
            <h3 className="font-heading text-[13px] font-semibold text-text-primary uppercase tracking-wider">
              Update Role: {user.full_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            disabled={isProcessing}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-[12px]">
              {error}
            </div>
          )}

          {/* User Info */}
          <div className="p-3 bg-subtle-bg border border-border">
            <p className="text-[11px] text-text-secondary mb-1">Email</p>
            <p className="text-[13px] text-text-primary font-medium">{user.email}</p>
          </div>

          {/* Current Role Display */}
          <div>
            <label className="block text-[11px] font-heading font-medium text-text-primary mb-3 uppercase tracking-wider">
              Current Role
            </label>
            <div className="p-3 border border-border bg-subtle-bg">
              <p className="text-[13px] font-medium text-accent">{currentRoleName}</p>
              {user.roles && user.roles.length > 0 && user.roles[0].description && (
                <p className="text-[11px] text-text-secondary mt-1">{user.roles[0].description}</p>
              )}
            </div>
          </div>

          {/* Select New Role */}
          <div>
            <label className="block text-[11px] font-heading font-medium text-text-primary mb-3 uppercase tracking-wider">
              Select New Role
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors appearance-none"
              disabled={isProcessing}
            >
              <option value="">Select a role...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>

          {/* Warning Message */}
          {selectedRoleId && selectedRoleId !== currentRoleId && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-[11px] text-yellow-600 dark:text-yellow-400">
                ⚠️ This will replace the user's current role. The user will lose access to permissions 
                from their previous role and gain permissions from the new role.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-text-secondary hover:text-text-primary text-[12px] font-medium transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRole}
              disabled={!selectedRoleId || selectedRoleId === currentRoleId || isProcessing}
              className="flex-1 btn-primary px-4 py-2 text-white font-heading text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ShieldIcon className="w-3.5 h-3.5" />
                  Update Role
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}