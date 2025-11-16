/**
 * Urban Institute Education Data Portal API Client
 *
 * Provides access to comprehensive educational datasets including:
 * - IPEDS (postsecondary institutions)
 * - Common Core of Data (K-12 schools)
 * - EDFacts (state/district performance)
 * - Civil Rights Data Collection
 * - College Scorecard
 *
 * API Documentation: https://educationdata.urban.org/documentation/
 */

import { EXTERNAL_DATA_SOURCES, type UrbanInstituteDataset } from './config';

const BASE_URL = EXTERNAL_DATA_SOURCES.urbanInstitute.baseUrl;

interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export class UrbanInstituteAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'UrbanInstituteAPIError';
  }
}

/**
 * Fetch data from Urban Institute Education Data Portal
 */
async function fetchUrbanInstituteAPI<T>(
  endpoint: string,
  params?: QueryParams
): Promise<T> {
  try {
    // Build query string
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';

    const url = `${BASE_URL}${endpoint}${queryString}`;

    console.log(`[UrbanInstitute] Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 1 hour in production
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new UrbanInstituteAPIError(
        `API request failed: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof UrbanInstituteAPIError) {
      throw error;
    }

    throw new UrbanInstituteAPIError(
      `Failed to fetch from Urban Institute API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      endpoint
    );
  }
}

/**
 * IPEDS: Get institutional characteristics for colleges/universities
 */
export interface IPEDSInstitution {
  unitid: number;
  inst_name: string;
  state_abbr: string;
  year: number;
  level_of_institution?: number; // 1=4-year+, 2=2-year, 3=less than 2-year
  control_of_institution?: number; // 1=public, 2=private nonprofit, 3=private for-profit
  total_enrollment?: number;
  total_price?: number;
  average_faculty_salary?: number;
  instructional_expenditure_per_fte?: number;
}

export async function getIPEDSInstitutions(params: {
  year: number;
  state?: string;
  level?: number;
  control?: number;
  limit?: number;
}): Promise<IPEDSInstitution[]> {
  const endpoint = '/college-university/ipeds/institutional-characteristics';

  const queryParams: QueryParams = {
    year: params.year,
    ...(params.state && { state_abbr: params.state }),
    ...(params.level && { level_of_institution: params.level }),
    ...(params.control && { control_of_institution: params.control }),
  };

  const response = await fetchUrbanInstituteAPI<{ results: IPEDSInstitution[] }>(
    endpoint,
    queryParams
  );

  return response.results.slice(0, params.limit || 100);
}

/**
 * Common Core of Data: Get K-12 school information
 */
export interface CCDSchool {
  ncessch: string; // School ID
  school_name: string;
  state_abbr: string;
  year: number;
  enrollment?: number;
  free_or_reduced_price_lunch?: number;
  teachers_total_fte?: number;
  locale?: string; // Urban/rural classification
  charter?: number; // 1=yes, 0=no
}

export async function getCCDSchools(params: {
  year: number;
  state?: string;
  locale?: string;
  charter?: number;
  limit?: number;
}): Promise<CCDSchool[]> {
  const endpoint = '/schools/ccd/directory';

  const queryParams: QueryParams = {
    year: params.year,
    ...(params.state && { state_abbr: params.state }),
    ...(params.locale && { locale: params.locale }),
    ...(params.charter !== undefined && { charter: params.charter }),
  };

  const response = await fetchUrbanInstituteAPI<{ results: CCDSchool[] }>(
    endpoint,
    queryParams
  );

  return response.results.slice(0, params.limit || 100);
}

/**
 * EDFacts: Get state/district assessment performance
 */
export interface EDFactsAssessment {
  fipst: number; // State FIPS code
  leaid?: string; // District ID
  year: number;
  subject: string; // 'math' or 'reading'
  grade: string;
  proficient_percent?: number;
  tested_percent?: number;
}

export async function getEDFactsAssessments(params: {
  year: number;
  state?: string;
  subject: 'math' | 'reading';
  grade?: string;
  limit?: number;
}): Promise<EDFactsAssessment[]> {
  const endpoint = '/edfacts/assessments';

  const queryParams: QueryParams = {
    year: params.year,
    subject: params.subject,
    ...(params.state && { state_abbr: params.state }),
    ...(params.grade && { grade: params.grade }),
  };

  const response = await fetchUrbanInstituteAPI<{ results: EDFactsAssessment[] }>(
    endpoint,
    queryParams
  );

  return response.results.slice(0, params.limit || 100);
}

/**
 * Get aggregated benchmark data for comparisons
 *
 * This function combines data from multiple sources to create
 * benchmarks for skills assessment comparison
 */
export interface EducationalBenchmark {
  category: string;
  level: 'k12' | 'postsecondary';
  metric: string;
  nationalAverage: number;
  stateAverage?: number;
  year: number;
  source: 'ipeds' | 'ccd' | 'edfacts';
}

export async function getEducationalBenchmarks(params: {
  level: 'k12' | 'postsecondary';
  year: number;
  state?: string;
}): Promise<EducationalBenchmark[]> {
  const benchmarks: EducationalBenchmark[] = [];

  try {
    if (params.level === 'postsecondary') {
      // Get IPEDS data for postsecondary benchmarks
      const institutions = await getIPEDSInstitutions({
        year: params.year,
        ...(params.state && { state: params.state }),
        limit: 1000,
      });

      if (institutions.length > 0) {
        const avgEnrollment = institutions
          .filter(i => i.total_enrollment)
          .reduce((sum, i) => sum + (i.total_enrollment || 0), 0) /
          institutions.filter(i => i.total_enrollment).length;

        benchmarks.push({
          category: 'enrollment',
          level: 'postsecondary',
          metric: 'average_total_enrollment',
          nationalAverage: avgEnrollment,
          year: params.year,
          source: 'ipeds',
        });
      }
    } else {
      // Get CCD and EDFacts data for K-12 benchmarks
      const mathAssessments = await getEDFactsAssessments({
        year: params.year,
        subject: 'math',
        ...(params.state && { state: params.state }),
        limit: 1000,
      });

      if (mathAssessments.length > 0) {
        const avgProficiency = mathAssessments
          .filter(a => a.proficient_percent)
          .reduce((sum, a) => sum + (a.proficient_percent || 0), 0) /
          mathAssessments.filter(a => a.proficient_percent).length;

        benchmarks.push({
          category: 'mathematics',
          level: 'k12',
          metric: 'proficiency_rate',
          nationalAverage: avgProficiency,
          year: params.year,
          source: 'edfacts',
        });
      }
    }

    return benchmarks;
  } catch (error) {
    console.error('[UrbanInstitute] Failed to fetch benchmarks:', error);
    throw error;
  }
}
