/**
 * API Route: Generate Comparative Insights
 *
 * Compares user-uploaded assessment data against national/state benchmarks
 * and generates actionable recommendations for stakeholders.
 *
 * POST /api/insights/generate
 * Body: { level: 'k12' | 'postsecondary', year: 2023, state?: 'CA' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchImportedData } from '@/lib/dataService';
import {
  getEDFactsAssessments,
  getIPEDSInstitutions,
  getCCDSchools,
} from '@/lib/externalData/urbanInstituteClient';
import {
  mapEDFactsToSkillBenchmarks,
  mapIPEDSToSkillBenchmarks,
  mapCCDToSkillBenchmarks,
  generateComparisonInsights,
  type ComparisonInsight,
  type BenchmarkSkill,
} from '@/lib/externalData/benchmarkMapper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface InsightsRequest {
  level: 'k12' | 'postsecondary';
  year?: number;
  state?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InsightsRequest = await request.json();

    const { level, year = 2023, state } = body;

    // Validate parameters
    if (!level || !['k12', 'postsecondary'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid or missing level parameter' },
        { status: 400 }
      );
    }

    console.log(`[Insights] Generating insights for ${level} (year: ${year}${state ? `, state: ${state}` : ''})`);

    // Step 1: Fetch user's imported data
    const userData = await fetchImportedData();

    if (!userData || !userData.users || userData.users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No user data found. Please import your assessment data first.',
        insights: [],
      });
    }

    // Step 2: Transform user data to skill averages
    const userSkills = new Map<string, { scores: number[]; category: string }>();

    userData.users.forEach(user => {
      user.assessments.forEach(assessment => {
        const key = assessment.skill.name;
        if (!userSkills.has(key)) {
          userSkills.set(key, {
            scores: [],
            category: assessment.skill.category || 'general',
          });
        }
        userSkills.get(key)!.scores.push(assessment.score);
      });
    });

    const userSkillAverages = Array.from(userSkills.entries()).map(([skillName, data]) => ({
      skillName,
      score: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      category: data.category,
    }));

    // Step 3: Fetch benchmark data
    let benchmarks: BenchmarkSkill[] = [];

    try {
      if (level === 'k12') {
        const [mathAssessments, readingAssessments, schools] = await Promise.all([
          getEDFactsAssessments({ year, subject: 'math', ...(state && { state }), limit: 1000 }),
          getEDFactsAssessments({ year, subject: 'reading', ...(state && { state }), limit: 1000 }),
          getCCDSchools({ year, ...(state && { state }), limit: 1000 }),
        ]);

        benchmarks = [
          ...mapEDFactsToSkillBenchmarks(mathAssessments, year),
          ...mapEDFactsToSkillBenchmarks(readingAssessments, year),
          ...mapCCDToSkillBenchmarks(schools, year),
        ];
      } else {
        const institutions = await getIPEDSInstitutions({
          year,
          ...(state && { state }),
          limit: 1000,
        });

        benchmarks = mapIPEDSToSkillBenchmarks(institutions, year);
      }
    } catch (error) {
      console.error('[Insights] Failed to fetch benchmark data:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch benchmark data from external sources',
        insights: [],
      });
    }

    // Step 4: Generate comparative insights
    const insights = generateComparisonInsights(userSkillAverages, benchmarks);

    // Step 5: Generate summary statistics
    const summary = {
      totalSkillsAnalyzed: insights.length,
      aboveAverage: insights.filter(i => i.gap > 0).length,
      belowAverage: insights.filter(i => i.gap < 0).length,
      atAverage: insights.filter(i => Math.abs(i.gap) < 5).length,
      highPriority: insights.filter(i => i.priority === 'high').length,
      mediumPriority: insights.filter(i => i.priority === 'medium').length,
      lowPriority: insights.filter(i => i.priority === 'low').length,
      averagePercentileRank: insights.reduce((sum, i) => sum + i.percentilRank, 0) / insights.length,
    };

    return NextResponse.json({
      success: true,
      level,
      year,
      state: state || 'national',
      summary,
      insights,
      benchmarksUsed: benchmarks.length,
      userDataPoints: userSkillAverages.length,
    });
  } catch (error) {
    console.error('[Insights] API error:', error);

    const message = error instanceof Error ? error.message : 'Failed to generate insights';

    return NextResponse.json(
      {
        success: false,
        error: message,
        insights: [],
      },
      { status: 500 }
    );
  }
}
