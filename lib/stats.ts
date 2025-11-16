/**
 * Statistical calculation utilities
 * Provides rigorous statistical functions for data analysis
 */

import { StatisticalSummary } from './types';

/**
 * Calculate the mean (average) of an array of numbers
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate the median of an array of numbers
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate the mode (most frequent value) of an array of numbers
 */
export function mode(values: number[]): number | undefined {
  if (values.length === 0) return undefined;

  const frequency: { [key: number]: number } = {};
  let maxFreq = 0;
  let modeValue: number | undefined;

  for (const value of values) {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      modeValue = value;
    }
  }

  return modeValue;
}

/**
 * Calculate the standard deviation of an array of numbers
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Calculate the variance of an array of numbers
 */
export function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return mean(squareDiffs);
}

/**
 * Calculate quartiles (Q1, Q2, Q3) of an array of numbers
 */
export function quartiles(values: number[]): [number, number, number] {
  if (values.length === 0) return [0, 0, 0];

  const sorted = [...values].sort((a, b) => a - b);
  const q2 = median(sorted);

  const midpoint = Math.floor(sorted.length / 2);
  const lowerHalf = sorted.length % 2 === 0
    ? sorted.slice(0, midpoint)
    : sorted.slice(0, midpoint);
  const upperHalf = sorted.length % 2 === 0
    ? sorted.slice(midpoint)
    : sorted.slice(midpoint + 1);

  const q1 = median(lowerHalf);
  const q3 = median(upperHalf);

  return [q1, q2, q3];
}

/**
 * Calculate the interquartile range (IQR)
 */
export function iqr(values: number[]): number {
  const [q1, , q3] = quartiles(values);
  return q3 - q1;
}

/**
 * Calculate 95% confidence interval for the mean
 */
export function confidenceInterval95(values: number[]): [number, number] {
  if (values.length === 0) return [0, 0];

  const avg = mean(values);
  const stdErr = standardDeviation(values) / Math.sqrt(values.length);
  const margin = 1.96 * stdErr; // 1.96 for 95% CI

  return [avg - margin, avg + margin];
}

/**
 * Calculate a comprehensive statistical summary
 */
export function calculateStatistics(values: number[]): StatisticalSummary {
  if (values.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
      variance: 0,
      min: 0,
      max: 0,
      range: 0,
      quartiles: [0, 0, 0],
      iqr: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const q = quartiles(values);
  const avg = mean(values);
  const std = standardDeviation(values);

  return {
    count: values.length,
    mean: avg,
    median: median(values),
    mode: mode(values),
    stdDev: std,
    variance: variance(values),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    range: sorted[sorted.length - 1] - sorted[0],
    quartiles: q,
    iqr: q[2] - q[0],
    confidenceInterval95: confidenceInterval95(values),
  };
}

/**
 * Detect outliers using the IQR method
 */
export function detectOutliers(values: number[]): number[] {
  const [q1, , q3] = quartiles(values);
  const iqrValue = q3 - q1;
  const lowerBound = q1 - 1.5 * iqrValue;
  const upperBound = q3 + 1.5 * iqrValue;

  return values.filter(val => val < lowerBound || val > upperBound);
}

/**
 * Normalize values to 0-1 range
 */
export function normalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) return values.map(() => 0);
  return values.map(val => (val - min) / range);
}

/**
 * Calculate percentile rank for a value in a dataset
 */
export function percentileRank(value: number, values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  if (index === -1) return 100;
  return (index / sorted.length) * 100;
}

/**
 * Calculate correlation coefficient between two arrays
 */
export function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const xMean = mean(x);
  const yMean = mean(y);

  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;

  for (let i = 0; i < x.length; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }

  if (xDenominator === 0 || yDenominator === 0) return 0;
  return numerator / Math.sqrt(xDenominator * yDenominator);
}

/**
 * Perform a simple linear regression
 */
export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
  if (x.length !== y.length || x.length === 0) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const n = x.length;
  const xMean = mean(x);
  const yMean = mean(y);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;
  const r = correlation(x, y);

  return {
    slope,
    intercept,
    r2: r * r,
  };
}
