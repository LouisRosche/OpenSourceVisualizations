/**
 * Environment variable validation
 * Run at app startup to ensure required configuration is present
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_APP_URL',
] as const;

const optionalEnvVars = [
  'DIRECT_DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Check optional but recommended variables
  optionalEnvVars.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(key);
    }
  });

  // Log results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('See .env.example for required configuration');

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  Missing optional environment variables:', warnings.join(', '));
  }

  if (missing.length === 0) {
    console.log('✓ Environment variables validated');
  }
}

/**
 * Get environment variable with validation
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value || defaultValue || '';
}

/**
 * Check if running in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
