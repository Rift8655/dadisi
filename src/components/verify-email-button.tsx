'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/lib/sweetalert';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';

interface VerifyEmailButtonProps {
  className?: string;
}

export function VerifyEmailButton({ className }: VerifyEmailButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  if (!user || user.email_verified_at) {
    return null;
  }

  const handleSendVerification = async () => {
    setIsLoading(true);
    try {
      const response = await api.post<{ message: string }>('/api/auth/send-verification');

      await showSuccess('Verification Email Sent', 'Please check your email for the verification code.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email';
      
      if (err instanceof Error && (err as any).status === 429) {
        await showError('Too Many Requests', 'Please wait before trying again.');
      } else {
        await showError('Error', message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSendVerification}
      disabled={isLoading}
      className={className}
      aria-label="Send verification email"
    >
      {isLoading ? (
        <>
          <span className="mr-2 animate-spin">⟳</span>
          Sending...
        </>
      ) : (
        'Verify Email'
      )}
    </Button>
  );
}
