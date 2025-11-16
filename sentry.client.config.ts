/**
 * Sentry Client Configuration
 * Captures errors in the browser
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // Adjust this value in production to reduce costs
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Filter out non-error events in development
    beforeSend(event, hint) {
      // Don't send events in development unless it's an error
      if (process.env.NODE_ENV === 'development' && event.level !== 'error') {
        return null;
      }

      // Filter out specific errors (add patterns as needed)
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);

        // Filter out common non-critical errors
        if (message.includes('ResizeObserver loop')) {
          return null;
        }
        if (message.includes('Non-Error promise rejection')) {
          return null;
        }
      }

      return event;
    },
  });
} else if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Sentry DSN not configured. Error tracking is disabled.');
}
