'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error('Application error:', error);

    // Send to Sentry if configured
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full p-8 bg-card border border-border rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            We encountered an unexpected error. This has been logged and we'll look into it.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded text-left">
              <h3 className="font-semibold text-sm mb-2 text-destructive">Error Details (Development Only):</h3>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
                {error.message}
              </pre>
              {error.digest && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-6 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
