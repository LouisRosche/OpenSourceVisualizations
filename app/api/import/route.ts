/**
 * API route for importing CSV data to database
 * Handles server-side database operations for security
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveCSVImport, type ImportResult } from '@/lib/dataService';
import type { SkillMatrixCSVRow } from '@/lib/csvImport';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { data, organizationName } = body;

    // Validate input
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data: must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate organization name
    if (organizationName && typeof organizationName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid organization name: must be a string' },
        { status: 400 }
      );
    }

    // Limit data size for safety
    if (data.length > 10000) {
      return NextResponse.json(
        { error: 'Data too large: maximum 10,000 rows' },
        { status: 413 }
      );
    }

    // Save to database
    const result: ImportResult = await saveCSVImport(
      data as SkillMatrixCSVRow[],
      organizationName || 'Default Organization'
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Database save failed',
          details: result.errors,
        },
        { status: 500 }
      );
    }

    // Return success with statistics
    return NextResponse.json({
      success: true,
      usersCreated: result.usersCreated,
      skillsCreated: result.skillsCreated,
      assessmentsCreated: result.assessmentsCreated,
      warnings: result.errors || [],
    });
  } catch (error) {
    console.error('Import API error:', error);

    // Return user-friendly error message
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: 'Import failed',
        details: [message],
      },
      { status: 500 }
    );
  }
}

// Note: Body size limits for App Router are configured in next.config.ts
// The default limit is 1MB for API routes in App Router
