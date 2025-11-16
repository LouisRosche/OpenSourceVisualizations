'use client';

import { useState, useMemo } from 'react';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import { NoDataEmptyState } from '@/components/EmptyState';
import { generateTimeSeriesData } from '@/lib/sampleData';
import { calculateStatistics } from '@/lib/stats';

export default function ProgressPage() {
  const [series] = useState(() => generateTimeSeriesData(4, 24));
  const [showConfidence, setShowConfidence] = useState(true);
  const [showTrendLine, setShowTrendLine] = useState(true);

  // Memoize expensive statistics calculations
  const stats = useMemo(() => {
    return series.map(s => ({
      label: s.label,
      ...calculateStatistics(s.data.map(d => d.value))
    }));
  }, [series]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Time-series analysis with cohort comparisons and trend detection
          </p>
        </div>

        {/* Show empty state if no data */}
        {(!series || series.length === 0) && (
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
