'use client';

import { useState } from 'react';
import { signInWithGoogleAction } from '../actions';

export function useGoogleSignIn(nextPath?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignIn() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await signInWithGoogleAction(nextPath);

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setIsLoading(false);
        return;
      }

      window.location.href = result.data.url;
    } catch {
      setErrorMessage('Failed to connect to authentication server. Please try again.');
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    errorMessage,
    handleSignIn,
  };
}
