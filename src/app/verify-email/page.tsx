'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/lib/sweetalert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const { setToken } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsVerifying(true);

      try {
        const response = await api.post<{
          message: string;
          token: string;
          user: {
            id: number;
            name: string;
            email: string;
            email_verified_at: string;
          };
        }>('/api/auth/verify-email', { code });

        await setToken(response.token);

        await showSuccess('Email Verified!', 'Your email has been successfully verified.');

        router.push('/dashboard');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to verify email';
        setError(message);
      } finally {
        setIsVerifying(false);
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, router, setToken]);

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      const response = await api.post<{
        message: string;
        token: string;
        user: {
          id: number;
          name: string;
          email: string;
          email_verified_at: string;
        };
      }>('/api/auth/verify-email', { code: manualCode });

      await setToken(response.token);

      await showSuccess('Email Verified!', 'Your email has been successfully verified.');

      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify email';
      setError(message);
      await showError('Verification failed', message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading && isVerifying) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Verifying Email</CardTitle>
            <CardDescription>Please wait while we verify your email address...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
  );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            {error
              ? 'Enter the code from your email to verify your account'
              : 'Check your email for a verification code'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleManualVerify}>
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="Enter code from email"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                disabled={isVerifying}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
