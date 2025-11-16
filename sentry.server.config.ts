/**
 * Sentry Server Configuration
 * Captures errors on the server (API routes, server components, etc.)
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // Adjust this value in production to reduce costs
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Filter out non-error events in development
    beforeSend(event, hint) {
      // Don't send events in development unless it's an error
      if (process.env.NODE_ENV === 'development' && event.level !== 'error') {
        return null;
      }

      // Add server-specific filtering if needed
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);

        // Filter out known non-critical errors
        if (message.includes('ECONNREFUSED')) {
          console.error('Database connection refused:', message);
          // Still send to Sentry in production
          if (process.env.NODE_ENV !== 'production') {
            return null;
          }
        }
      }

      return event;
    },
  });
} else if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Sentry DSN not configured. Error tracking is disabled.');
}
