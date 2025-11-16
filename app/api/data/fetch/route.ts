/**
 * API route to fetch imported data from database
 * Returns data in format ready for transformation
 */

import { NextResponse } from 'next/server';
import { fetchImportedData } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchImportedData();

    if (!data) {
      // No data imported yet - return empty structure
      return NextResponse.json({
        users: [],
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch data';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
