/**
 * Prisma Database Client
 * Includes connection pooling, error handling, and retry logic
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client with production-ready configuration
 */
function createPrismaClient() {
  return new PrismaClient({
    // Logging configuration
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],

    // Error formatting
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Test database connection with retry logic
 * Useful for startup checks and health endpoints
 */
export async function testDatabaseConnection(maxRetries = 3): Promise<boolean> {
  let attempts = 0;
  const retryDelays = [1000, 2000, 4000]; // Exponential backoff in ms

  while (attempts < maxRetries) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✓ Database connection successful');
      return true;
    } catch (error) {
      attempts++;
      console.error(`Database connection attempt ${attempts}/${maxRetries} failed:`, error);

      if (attempts < maxRetries) {
        const delay = retryDelays[attempts - 1] || 4000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('❌ Database connection failed after all retries');
  return false;
}

/**
 * Gracefully disconnect from database
 * Call this on server shutdown
 */
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✓ Database disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    throw error;
  }
}

/**
 * Health check for database
 * Returns connection status and latency
 */
export async function getDatabaseHealth(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

// Graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectDatabase();
  });

  process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

export default prisma;
