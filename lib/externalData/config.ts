/**
 * External Data Sources Configuration
 *
 * Configures connections to educational data APIs:
 * - Urban Institute Education Data Portal (IPEDS, EDFacts, Common Core)
 * - NCES EDGE Open Data APIs
 * - Data.ed.gov (Department of Education Open Data Platform)
 */

export const EXTERNAL_DATA_SOURCES = {
  urbanInstitute: {
    name: 'Urban Institute Education Data Portal',
    baseUrl: 'https://educationdata.urban.org/api/v1',
    datasets: {
      ipeds: {
        name: 'IPEDS (Integrated Postsecondary Education Data System)',
        endpoint: '/college-university',
        description: 'Data from 6,400+ colleges and universities',
      },
      ccd: {
        name: 'CCD (Common Core of Data)',
        endpoint: '/schools',
        description: 'K-12 school data',
      },
      crdc: {
        name: 'CRDC (Civil Rights Data Collection)',
        endpoint: '/crdc',
        description: 'Civil rights and equity data',
      },
      edfacts: {
        name: 'EDFacts',
        endpoint: '/edfacts',
        description: 'State and district performance data',
      },
      collegeScorecard: {
        name: 'College Scorecard',
        endpoint: '/scorecard',
        description: 'College outcomes and affordability',
      },
    },
    rateLimit: {
      requestsPerMinute: 100,
      maxRetries: 3,
    },
    requiresAuth: false,
  },

  ncesEdge: {
    name: 'NCES EDGE Open Data APIs',
    baseUrl: 'https://data-nces.opendata.arcgis.com/api/v3',
    description: 'Geographic and demographic education estimates',
    requiresAuth: false,
  },

  dataEdGov: {
    name: 'Department of Education Open Data Platform',
    baseUrl: 'https://data.ed.gov/api/3',
    description: 'Official DoE data assets',
    requiresAuth: false,
  },
} as const;

export type DataSourceKey = keyof typeof EXTERNAL_DATA_SOURCES;
export type UrbanInstituteDataset = keyof typeof EXTERNAL_DATA_SOURCES.urbanInstitute.datasets;
