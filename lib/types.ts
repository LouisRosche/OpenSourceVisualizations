// Core data types for the application

export interface SkillAssessmentData {
  userId: string;
  userName: string;
  skillId: string;
  skillName: string;
  category: string;
  score: number;
  confidence?: number;
  assessedAt: Date;
}

export interface SkillMatrixEntry {
  userId: string;
  userName: string;
  skills: {
    [skillId: string]: {
      name: string;
      score: number;
      confidence?: number;
    };
  };
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  confidence?: number;
  label?: string;
}

export interface CohortComparison {
  cohortId: string;
  cohortName: string;
  metric: string;
  values: number[];
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  quartiles: [number, number, number]; // Q1, Q2 (median), Q3
}

export interface GapAnalysis {
  skillId: string;
  skillName: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'low' | 'medium' | 'high';
  recommendedActions?: string[];
}

export interface StatisticalSummary {
  count: number;
  mean: number;
  median: number;
  mode?: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  quartiles: [number, number, number];
  iqr: number; // Interquartile range
  confidenceInterval95?: [number, number];
}

export interface VisualizationExportOptions {
  format: 'svg' | 'png' | 'pdf' | 'csv' | 'json';
  width?: number;
  height?: number;
  quality?: number;
  includeData?: boolean;
  includeMetadata?: boolean;
}
