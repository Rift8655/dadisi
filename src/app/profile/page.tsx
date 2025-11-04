'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VerifyEmailButton } from '@/components/verify-email-button';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { ChangePasswordDialog } from '@/components/change-password-dialog';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <DashboardShell title="Profile">
      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email Status</p>
              <p className={`text-sm font-medium ${user.email_verified_at ? 'text-green-600' : 'text-yellow-600'}`}>
                {user.email_verified_at ? '✓ Verified' : '⚠ Not verified'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>Verify your email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.email_verified_at ? (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <p className="font-medium">✓ Email verified</p>
                <p className="text-xs mt-1">
                  Verified on {new Date(user.email_verified_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Verify your email to unlock all features and ensure account security.
                </p>
                <VerifyEmailButton className="w-full" />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={() => setChangePasswordOpen(true)}>
              Change Password
            </Button>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
