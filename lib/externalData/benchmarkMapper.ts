/**
 * Benchmark Data Mapper
 *
 * Maps external educational data (IPEDS, EDFacts, CCD) to internal
 * skill assessment schema for comparative analysis.
 *
 * This allows users to compare their imported assessment data against
 * national and state benchmarks from Department of Education sources.
 */

import {
  type IPEDSInstitution,
  type CCDSchool,
  type EDFactsAssessment,
  type EducationalBenchmark,
} from './urbanInstituteClient';

/**
 * Benchmark types aligned with our skill categories
 */
export interface BenchmarkSkill {
  skillId: string;
  skillName: string;
  category: string;
  nationalAverage: number;
  stateAverage?: number;
  percentile25?: number;
  percentile50?: number;
  percentile75?: number;
  percentile90?: number;
  year: number;
  source: string;
  metadata: {
    dataPoints: number;
    geographicScope: 'national' | 'state' | 'district';
    educationalLevel: 'k12' | 'postsecondary';
  };
}

/**
 * Map EDFacts assessment data to skill benchmarks
 *
 * Converts state/district testing proficiency rates into skill benchmarks
 * for subjects like mathematics, reading, science
 */
export function mapEDFactsToSkillBenchmarks(
  assessments: EDFactsAssessment[],
  year: number
): BenchmarkSkill[] {
  // Group by subject and grade
  const grouped = new Map<string, EDFactsAssessment[]>();

  assessments.forEach(assessment => {
    const key = `${assessment.subject}_${assessment.grade}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(assessment);
  });

  const benchmarks: BenchmarkSkill[] = [];

  grouped.forEach((assessmentGroup, key) => {
    const [subject, grade] = key.split('_');

    const proficiencyRates = assessmentGroup
      .filter(a => a.proficient_percent !== undefined && a.proficient_percent !== null)
      .map(a => a.proficient_percent!);

    if (proficiencyRates.length === 0) return;

    // Calculate statistics
    const sorted = proficiencyRates.sort((a, b) => a - b);
    const nationalAverage = sorted.reduce((a, b) => a + b, 0) / sorted.length;

    benchmarks.push({
      skillId: `edfacts_${subject}_${grade}`,
      skillName: `${subject.charAt(0).toUpperCase() + subject.slice(1)} - Grade ${grade}`,
      category: subject,
      nationalAverage,
      percentile25: sorted[Math.floor(sorted.length * 0.25)],
      percentile50: sorted[Math.floor(sorted.length * 0.50)],
      percentile75: sorted[Math.floor(sorted.length * 0.75)],
      percentile90: sorted[Math.floor(sorted.length * 0.90)],
      year,
      source: 'EDFacts (Department of Education)',
      metadata: {
        dataPoints: proficiencyRates.length,
        geographicScope: 'national',
        educationalLevel: 'k12',
      },
    });
  });

  return benchmarks;
}

/**
 * Map IPEDS institutional data to skill benchmarks
 *
 * Converts college/university metrics into educational performance benchmarks
 * for postsecondary comparison
 */
export function mapIPEDSToSkillBenchmarks(
  institutions: IPEDSInstitution[],
  year: number
): BenchmarkSkill[] {
  const benchmarks: BenchmarkSkill[] = [];

  // Enrollment benchmarks by institution type
  const enrollmentByLevel = new Map<number, number[]>();
  institutions.forEach(inst => {
    if (inst.total_enrollment && inst.level_of_institution) {
      if (!enrollmentByLevel.has(inst.level_of_institution)) {
        enrollmentByLevel.set(inst.level_of_institution, []);
      }
      enrollmentByLevel.get(inst.level_of_institution)!.push(inst.total_enrollment);
    }
  });

  enrollmentByLevel.forEach((enrollments, level) => {
    const sorted = enrollments.sort((a, b) => a - b);
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;

    const levelName = level === 1 ? '4-Year+' : level === 2 ? '2-Year' : 'Less than 2-Year';

    benchmarks.push({
      skillId: `ipeds_enrollment_level${level}`,
      skillName: `Average Enrollment - ${levelName} Institutions`,
      category: 'institutional_metrics',
      nationalAverage: avg,
      percentile25: sorted[Math.floor(sorted.length * 0.25)],
      percentile50: sorted[Math.floor(sorted.length * 0.50)],
      percentile75: sorted[Math.floor(sorted.length * 0.75)],
      percentile90: sorted[Math.floor(sorted.length * 0.90)],
      year,
      source: 'IPEDS (Integrated Postsecondary Education Data System)',
      metadata: {
        dataPoints: enrollments.length,
        geographicScope: 'national',
        educationalLevel: 'postsecondary',
      },
    });
  });

  return benchmarks;
}

/**
 * Map Common Core of Data to skill benchmarks
 *
 * Converts K-12 school data into educational performance metrics
 */
export function mapCCDToSkillBenchmarks(
  schools: CCDSchool[],
  year: number
): BenchmarkSkill[] {
  const benchmarks: BenchmarkSkill[] = [];

  // Student-teacher ratio analysis
  const studentTeacherRatios: number[] = [];
  schools.forEach(school => {
    if (school.enrollment && school.teachers_total_fte && school.teachers_total_fte > 0) {
      studentTeacherRatios.push(school.enrollment / school.teachers_total_fte);
    }
  });

  if (studentTeacherRatios.length > 0) {
    const sorted = studentTeacherRatios.sort((a, b) => a - b);
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;

    benchmarks.push({
      skillId: 'ccd_student_teacher_ratio',
      skillName: 'Student-Teacher Ratio',
      category: 'school_metrics',
      nationalAverage: avg,
      percentile25: sorted[Math.floor(sorted.length * 0.25)],
      percentile50: sorted[Math.floor(sorted.length * 0.50)],
      percentile75: sorted[Math.floor(sorted.length * 0.75)],
      percentile90: sorted[Math.floor(sorted.length * 0.90)],
      year,
      source: 'CCD (Common Core of Data)',
      metadata: {
        dataPoints: studentTeacherRatios.length,
        geographicScope: 'national',
        educationalLevel: 'k12',
      },
    });
  }

  return benchmarks;
}

/**
 * Generate comparative insights by comparing user data to benchmarks
 */
export interface ComparisonInsight {
  skillName: string;
  userAverage: number;
  nationalAverage: number;
  percentilRank: number; // Where user falls in national distribution (0-100)
  gap: number; // userAverage - nationalAverage
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  benchmarkSource: string;
}

export function generateComparisonInsights(
  userSkills: Array<{ skillName: string; score: number; category: string }>,
  benchmarks: BenchmarkSkill[]
): ComparisonInsight[] {
  const insights: ComparisonInsight[] = [];

  userSkills.forEach(userSkill => {
    // Find matching benchmark by category or skill name similarity
    const matchingBenchmark = benchmarks.find(b =>
      b.category.toLowerCase().includes(userSkill.category.toLowerCase()) ||
      userSkill.skillName.toLowerCase().includes(b.category.toLowerCase())
    );

    if (!matchingBenchmark) return;

    // Calculate percentile rank
    let percentileRank = 50; // Default to median
    if (matchingBenchmark.percentile25 && matchingBenchmark.percentile75) {
      if (userSkill.score < matchingBenchmark.percentile25) {
        percentileRank = 25;
      } else if (userSkill.score < matchingBenchmark.percentile50!) {
        percentileRank = 37.5;
      } else if (userSkill.score < matchingBenchmark.percentile75) {
        percentileRank = 62.5;
      } else if (userSkill.score < matchingBenchmark.percentile90!) {
        percentileRank = 82.5;
      } else {
        percentileRank = 95;
      }
    }

    const gap = userSkill.score - matchingBenchmark.nationalAverage;

    // Generate recommendation
    let recommendation = '';
    let priority: 'high' | 'medium' | 'low' = 'low';

    if (gap < -20) {
      recommendation = `Significantly below national average. Prioritize professional development in ${userSkill.skillName}.`;
      priority = 'high';
    } else if (gap < -10) {
      recommendation = `Below national average. Consider targeted training or mentorship in ${userSkill.skillName}.`;
      priority = 'medium';
    } else if (gap < 10) {
      recommendation = `Near national average. Maintain current practices for ${userSkill.skillName}.`;
      priority = 'low';
    } else {
      recommendation = `Above national average! Continue excellence in ${userSkill.skillName} and consider sharing best practices.`;
      priority = 'low';
    }

    insights.push({
      skillName: userSkill.skillName,
      userAverage: userSkill.score,
      nationalAverage: matchingBenchmark.nationalAverage,
      percentilRank: percentileRank,
      gap,
      recommendation,
      priority,
      benchmarkSource: matchingBenchmark.source,
    });
  });

  // Sort by priority (high first) then by gap size (largest gaps first)
  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return Math.abs(b.gap) - Math.abs(a.gap);
  });
}
