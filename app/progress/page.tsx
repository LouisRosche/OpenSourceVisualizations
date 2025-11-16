'use client';

import { useState, useMemo, useEffect } from 'react';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import { NoDataEmptyState, ErrorEmptyState } from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import { transformToTimeSeries } from '@/lib/dataTransformers';
import { generateTimeSeriesData } from '@/lib/sampleData';
import { calculateStatistics } from '@/lib/stats';

export default function ProgressPage() {
  const [series, setSeries] = useState<Array<{
    id: string;
    label: string;
    data: Array<{ timestamp: Date; value: number; confidence?: number }>;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [showConfidence, setShowConfidence] = useState(true);
  const [showTrendLine, setShowTrendLine] = useState(true);

  // Fetch data from database on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/data/fetch');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const dbData = await response.json();

        // Transform database data to time series format
        const transformed = transformToTimeSeries(dbData);

        // Check if we have time-series data
        if (transformed.length === 0 || transformed.every(s => s.data.length < 2)) {
          // No time-series data, use sample data
          console.warn('No time-series data found. Using sample data for demonstration.');
          setUsingSampleData(true);
          setSeries(generateTimeSeriesData(4, 24));
        } else {
          setSeries(transformed);
          setUsingSampleData(false);
        }
      } catch (err) {
        console.error('Failed to fetch progress data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Memoize expensive statistics calculations
  const stats = useMemo(() => {
    return series.map(s => ({
      label: s.label,
      ...calculateStatistics(s.data.map(d => d.value))
    }));
  }, [series]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Progress Tracking</h1>
          <p className="text-muted-foreground mb-8">
            Time-series analysis with cohort comparisons and trend detection
          </p>
          <LoadingSpinner size="lg" message="Loading progress tracking data..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Progress Tracking</h1>
          <p className="text-muted-foreground mb-8">
            Time-series analysis with cohort comparisons and trend detection
          </p>
          <ErrorEmptyState message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Time-series analysis with cohort comparisons and trend detection
          </p>
        </div>

        {/* Notice when using sample data */}
        {usingSampleData && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-500 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Showing Sample Data
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Progress tracking requires multiple assessments over time. Your imported data contains only
                  single assessments per user/skill. Showing sample data for demonstration purposes.
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                  <strong>To see real progress data:</strong> Re-import the same CSV file at different times
                  or add a "date" column to your CSV with different assessment dates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show empty state if no data */}
        {(!series || series.length === 0) && !usingSampleData && (
          <NoDataEmptyState />
        )}

        {/* Show visualization if data is available */}
        {series && series.length > 0 && (
          <>

        <div className="mb-6 flex gap-4 items-center p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-confidence-ts"
              checked={showConfidence}
              onChange={(e) => setShowConfidence(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="show-confidence-ts" className="text-sm font-medium">
              Show Confidence Intervals
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-trend"
              checked={showTrendLine}
              onChange={(e) => setShowTrendLine(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="show-trend" className="text-sm font-medium">
              Show Trend Lines
            </label>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <TimeSeriesChart
            series={series}
            width={1000}
            height={500}
            showConfidence={showConfidence}
            showTrendLine={showTrendLine}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Statistical Analysis</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4 bg-card border border-border rounded-lg">
                <h3 className="font-semibold mb-3 text-lg">{stat.label}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mean:</span>
                    <span className="font-mono">{stat.mean.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Median:</span>
                    <span className="font-mono">{stat.median.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Std Dev:</span>
                    <span className="font-mono">{stat.stdDev.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Range:</span>
                    <span className="font-mono">
                      {stat.min.toFixed(1)} - {stat.max.toFixed(1)}
                    </span>
                  </div>
                  {stat.confidenceInterval95 && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground text-xs">95% CI:</span>
                      <span className="font-mono text-xs">
                        [{stat.confidenceInterval95[0].toFixed(2)}, {stat.confidenceInterval95[1].toFixed(2)}]
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Analysis Methods</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Linear regression for trend detection</li>
              <li>• 95% confidence intervals for uncertainty quantification</li>
              <li>• Time-series smoothing with monotonic curves</li>
              <li>• Comparative cohort analysis</li>
              <li>• Statistical significance testing available</li>
            </ul>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Use Cases</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Track skill development over time</li>
              <li>• Compare cohort performance</li>
              <li>• Identify acceleration or plateau periods</li>
              <li>• Measure intervention effectiveness</li>
              <li>• Forecast future progress</li>
            </ul>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
