// pages/UserFormPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useUsers, Role, User } from '../hooks/useUsers';
import { useToast } from '../components/Toast';
import { PasswordStrength, validatePassword } from '../components/PasswordStrength';

export function UserFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { addToast } = useToast();

  const { createUser, updateUser, getRoles, isLoading: apiLoading, error: apiError } = useUsers();
  // Removed: useProjects import and getProjects

  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  // Removed: projects state and selectedProjectIds state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
    is_superuser: false,
    is_active: true,
  });

  useEffect(() => {
    loadRoles();
    // Removed: loadProjects()

    if (isEditing && location.state?.user) {
      const user = location.state.user as User;
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        password: '',
        role_id: user.roles?.[0]?.id || '',
        is_superuser: user.is_superuser || false,
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    }
  }, [isEditing, location.state]);

  const loadRoles = async () => {
    const result = await getRoles();
    if (result.success && result.data) setRoles(result.data);
  };

  // Removed: loadProjects function
  // Removed: toggleProject function
  // Removed: updateUserProjects call

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && formData.password && !validatePassword(formData.password)) {
      addToast('warning', 'Password does not meet all requirements. Please check the rules below.');
      return;
    }

    setIsSaving(true);

    let result;

    if (isEditing && id) {
      result = await updateUser({
        user_id: id,
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password || undefined,
        role_id: formData.role_id || undefined,
        is_superuser: formData.is_superuser,
        is_active: formData.is_active,
      });
    } else {
      result = await createUser({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role_id: formData.role_id || undefined,
        is_superuser: formData.is_superuser,
      });
    }

    // Removed: Project assignment logic

    setIsSaving(false);

    if (result.success) {
      addToast('success', isEditing ? 'User updated successfully' : 'User created successfully');
      navigate('/admin-panel');
    } else {
      addToast('error', result.error || (isEditing ? 'Failed to update user' : 'Failed to create user'));
    }
  };

  const showPasswordStrength =
    (passwordFocused || formData.password.length > 0) &&
    (!isEditing || formData.password.length > 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <Link
          to="/admin-panel"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Users
        </Link>
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          {isEditing ? 'Edit User' : 'Create New User'}
        </h1>
      </div>

      <div
        className="bg-card-bg border border-border p-8 animate-fade-up"
        style={{ animationDelay: '50ms', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
      >
        {apiLoading && !isSaving ? (
          <div className="space-y-6">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-32 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {apiError && (
              <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-[12px]">
                {apiError}
              </div>
            )}

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                Password {!isEditing && '*'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!isEditing}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full px-4 py-2.5 pr-10 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors"
                  placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {isEditing && !formData.password && (
                <p className="text-[11px] text-text-secondary mt-1">Leave blank to keep current password</p>
              )}
              {showPasswordStrength && <PasswordStrength password={formData.password} />}
            </div>

            {/* Role + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Superuser */}
            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                Superuser
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_superuser}
                  onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                  className="w-4 h-4 text-accent border-border rounded-none focus:ring-accent"
                />
                <span className="text-[13px] text-text-primary">Grant superuser privileges</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Link
                to="/admin-panel"
                className="px-6 py-2 border border-border text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving || !formData.full_name || !formData.email || (!isEditing && !formData.password)}
                className="btn-primary px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <SaveIcon className="w-4 h-4" />
                )}
                {isSaving
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update User' : 'Create User')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}