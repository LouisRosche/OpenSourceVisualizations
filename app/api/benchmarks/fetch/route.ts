/**
 * API Route: Fetch Educational Benchmarks
 *
 * Fetches national and state benchmark data from Department of Education sources
 * to enable comparative analysis with user-uploaded data.
 *
 * GET /api/benchmarks/fetch?level=k12&year=2023&state=CA
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEDFactsAssessments,
  getIPEDSInstitutions,
  getCCDSchools,
} from '@/lib/externalData/urbanInstituteClient';
import {
  mapEDFactsToSkillBenchmarks,
  mapIPEDSToSkillBenchmarks,
  mapCCDToSkillBenchmarks,
  type BenchmarkSkill,
} from '@/lib/externalData/benchmarkMapper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for external API calls

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level') as 'k12' | 'postsecondary' | null;
    const yearParam = searchParams.get('year');
    const state = searchParams.get('state');

    // Validate parameters
    if (!level || !['k12', 'postsecondary'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid or missing level parameter. Must be "k12" or "postsecondary"' },
        { status: 400 }
      );
    }

    const year = yearParam ? parseInt(yearParam) : 2023;
    if (isNaN(year) || year < 2010 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid year parameter. Must be between 2010 and current year' },
        { status: 400 }
      );
    }

    console.log(`[Benchmarks] Fetching ${level} benchmarks for year ${year}${state ? ` in ${state}` : ''}`);

    let benchmarks: BenchmarkSkill[] = [];

    if (level === 'k12') {
      // Fetch K-12 benchmarks from EDFacts and CCD
      try {
        const [mathAssessments, readingAssessments, schools] = await Promise.all([
          getEDFactsAssessments({
            year,
            subject: 'math',
            ...(state && { state }),
            limit: 1000,
          }),
          getEDFactsAssessments({
            year,
            subject: 'reading',
            ...(state && { state }),
            limit: 1000,
          }),
          getCCDSchools({
            year,
            ...(state && { state }),
            limit: 1000,
          }),
        ]);

        const mathBenchmarks = mapEDFactsToSkillBenchmarks(mathAssessments, year);
        const readingBenchmarks = mapEDFactsToSkillBenchmarks(readingAssessments, year);
        const schoolBenchmarks = mapCCDToSkillBenchmarks(schools, year);

        benchmarks = [...mathBenchmarks, ...readingBenchmarks, ...schoolBenchmarks];
      } catch (error) {
        console.error('[Benchmarks] Error fetching K-12 data:', error);
        // Continue with empty benchmarks if external API fails
        benchmarks = [];
      }
    } else {
      // Fetch postsecondary benchmarks from IPEDS
      try {
        const institutions = await getIPEDSInstitutions({
          year,
          ...(state && { state }),
          limit: 1000,
        });

        benchmarks = mapIPEDSToSkillBenchmarks(institutions, year);
      } catch (error) {
        console.error('[Benchmarks] Error fetching postsecondary data:', error);
        // Continue with empty benchmarks if external API fails
        benchmarks = [];
      }
    }

    return NextResponse.json({
      success: true,
      level,
      year,
      state: state || 'national',
      benchmarks,
      count: benchmarks.length,
      sources: benchmarks.map(b => b.source).filter((v, i, a) => a.indexOf(v) === i),
    });
  } catch (error) {
    console.error('[Benchmarks] API error:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch benchmarks';

    return NextResponse.json(
      {
        success: false,
        error: message,
        benchmarks: [],
      },
      { status: 500 }
    );
  }
}
