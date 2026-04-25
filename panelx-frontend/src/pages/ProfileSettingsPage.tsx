// pages/ProfileSettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  SaveIcon,
  EyeIcon,
  EyeOffIcon,
  UploadIcon,
  XIcon,
  UserIcon,
  LockIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import { useUsers, User } from '../hooks/useUsers';
import { useToast } from '../components/Toast';
import { PasswordStrength, validatePassword } from '../components/PasswordStrength';

export function ProfileSettingsPage() {
  const { getCurrentUser, updateOwnProfile, changeOwnPassword, isLoading } = useUsers();
  const { addToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const result = await getCurrentUser();
    if (result.success && result.data) {
      setUser(result.data);
      setFormData({ full_name: result.data.full_name || '', email: result.data.email || '' });
      if (result.data.profile_image_url) {
        setProfileImagePreview(result.data.profile_image_url);
      }
    } else {
      addToast('error', result.error || 'Failed to load user profile');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('error', 'Image size must be less than 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Please upload a valid image file');
      return;
    }
    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setProfileImage(null);
    if (profileImagePreview && !user?.profile_image_url) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImagePreview(user?.profile_image_url || null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const result = await updateOwnProfile({
      full_name: formData.full_name,
      email: formData.email,
      profile_image: profileImage || undefined,
    });

    setIsSaving(false);

    if (result.success) {
      addToast('success', 'Profile updated successfully');
      setUser(result.data);
      if (profileImage && result.data.profile_image_url) {
        setProfileImagePreview(result.data.profile_image_url);
        setProfileImage(null);
      }
    } else {
      addToast('error', result.error || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      addToast('error', 'New passwords do not match');
      return;
    }

    if (!validatePassword(passwordData.new_password)) {
      addToast('warning', 'Password does not meet all requirements. Please check the rules below.');
      return;
    }

    setIsChangingPassword(true);

    const result = await changeOwnPassword({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    });

    setIsChangingPassword(false);

    if (result.success) {
      addToast('success', 'Password changed successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } else {
      addToast('error', result.error || 'Failed to change password');
    }
  };

  const showPasswordStrength =
    (newPasswordFocused || passwordData.new_password.length > 0);

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide">
          Profile Settings
        </h1>
        <p className="text-text-secondary text-[13px] mt-2">
          Manage your personal information and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div
          className="bg-card-bg border border-border p-8 animate-fade-up"
          style={{ animationDelay: '50ms', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
        >
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-accent" />
            Personal Information
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                {profileImagePreview ? (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-accent"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-subtle-bg border-2 border-dashed border-border flex items-center justify-center">
                    <UploadIcon className="w-8 h-8 text-text-secondary" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-image-input"
                  />
                  <label
                    htmlFor="profile-image-input"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border text-[12px] font-heading font-semibold uppercase tracking-wider text-text-primary hover:bg-subtle-bg transition-colors cursor-pointer"
                  >
                    <UploadIcon className="w-4 h-4" />
                    {profileImagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  <p className="text-[10px] text-text-secondary mt-2">Recommended: Square image, max 2MB</p>
                </div>
              </div>
            </div>

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
                placeholder="Your full name"
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
                placeholder="your.email@example.com"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <SaveIcon className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div
          className="bg-card-bg border border-border p-8 animate-fade-up"
          style={{ animationDelay: '100ms', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
        >
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
            <LockIcon className="w-5 h-5 text-accent" />
            Change Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showCurrentPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  onFocus={() => setNewPasswordFocused(true)}
                  onBlur={() => setNewPasswordFocused(false)}
                  className="w-full px-4 py-2.5 pr-10 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showNewPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {showPasswordStrength && <PasswordStrength password={passwordData.new_password} />}
            </div>

            <div>
              <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className={`w-full px-4 py-2.5 pr-10 border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent transition-colors ${
                    passwordData.confirm_password && passwordData.confirm_password !== passwordData.new_password
                      ? 'border-red-500'
                      : 'border-border'
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {passwordData.confirm_password && passwordData.confirm_password !== passwordData.new_password && (
                <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isChangingPassword || (!!passwordData.confirm_password && passwordData.confirm_password !== passwordData.new_password)}
                className="btn-primary px-6 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LockIcon className="w-4 h-4" />
                )}
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
