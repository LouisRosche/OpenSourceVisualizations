/**
 * Next.js Instrumentation
 * Initializes monitoring and error tracking
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // Only run on edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.client.config');
  }
}
