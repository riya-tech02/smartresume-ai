import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  User,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Export & Delete state
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const updated = await api.patch<any>('/users/me', { name: name.trim() });
      setUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    setIsSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      await api.post('/users/me/password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await api.get<any>('/users/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smartresume_export_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Enter your password to delete your account.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      await api.delete('/users/me', { body: JSON.stringify({ password: deletePassword }) });
      clearAuth();
      navigate('/login');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
          Account Settings
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your personal details, credentials, and data privacy.
        </p>
      </div>

      {/* Profile Details */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">
            Personal Information
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Email Address
              </label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-surface-sunken opacity-75"
              />
            </div>
          </div>

          {profileSuccess && (
            <p className="text-xs text-success flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
            </p>
          )}

          {profileError && (
            <p className="text-xs text-danger bg-danger/10 p-2.5 rounded-lg border border-danger/20">
              {profileError}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingProfile}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">
            Security & Password
          </h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Current Password
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {passwordSuccess && (
            <p className="text-xs text-success flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Password changed successfully!
            </p>
          )}

          {passwordError && (
            <p className="text-xs text-danger bg-danger/10 p-2.5 rounded-lg border border-danger/20">
              {passwordError}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              isLoading={isSavingPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Data Export */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-text">Export Your Data</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Download a portable JSON archive of all your resumes, sections, and analysis records.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportData}
          isLoading={isExporting}
          leftIcon={<Download className="w-4 h-4" />}
          className="shrink-0 text-xs"
        >
          Export JSON
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-danger flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Delete Account
          </h3>
          <p className="text-xs text-danger/80 mt-0.5">
            Permanently delete your account, saved credentials, and all resume documents. This cannot be undone.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          leftIcon={<Trash2 className="w-4 h-4 text-danger" />}
          className="shrink-0 text-danger border-danger/30 hover:bg-danger/10 text-xs"
        >
          Delete Account
        </Button>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletePassword('');
          setDeleteError(null);
        }}
        title="Permanently Delete Account?"
        description="This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Your account, resumes, ATS analyses, and profile data will be permanently deleted.
          </p>
          <div>
            <label htmlFor="delete-account-password" className="block text-xs font-semibold text-text mb-1">
              Confirm your password
            </label>
            <Input
              id="delete-account-password"
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {deleteError && (
            <p role="alert" className="text-xs text-danger bg-danger/10 p-2.5 rounded-lg border border-danger/20">
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDeleteAccount()}
              isLoading={isDeletingAccount}
            >
              Yes, Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
