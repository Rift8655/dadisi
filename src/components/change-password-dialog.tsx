'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/lib/sweetalert';
import { api } from '@/lib/api';
import { createPortal } from 'react-dom';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormErrors({ submit: 'All fields are required' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setFormErrors({ newPassword: 'Password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);

    try {
      await api.post<{ message: string }>('/api/auth/password/change', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      await showSuccess('Password changed', 'Your password has been successfully updated.');

      // Reset form and close
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setFormErrors({ submit: message });
      await showError('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const target = typeof document !== 'undefined' ? document.body : null;
  if (!target) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(20rem,92vw,40rem)] p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full rounded-xl border bg-card text-card-foreground shadow-2xl"
        >
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="absolute right-3 top-3 rounded-md p-2 text-foreground/70 transition hover:bg-accent hover:text-accent-foreground"
          >
            ✕
          </button>

          <div className="p-6">
            <h2 className="mb-2 text-xl font-semibold">Change Password</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Enter your current password and choose a new one
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {formErrors.submit && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {formErrors.submit}
                </div>
              )}

              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  name="current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Must be 8+ chars with letters, numbers & special chars"
                />
                {formErrors.newPassword && (
                  <p className="mt-1 text-sm text-destructive">{formErrors.newPassword}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    target
  );
}
