'use client';

import { useState } from 'react';
import { NoDataEmptyState, ErrorEmptyState } from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

interface ComparisonInsight {
  skillName: string;
  userAverage: number;
  nationalAverage: number;
  percentilRank: number;
  gap: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  benchmarkSource: string;
}

interface InsightsSummary {
  totalSkillsAnalyzed: number;
  aboveAverage: number;
  belowAverage: number;
  atAverage: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  averagePercentileRank: number;
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<ComparisonInsight[]>([]);
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [level, setLevel] = useState<'k12' | 'postsecondary'>('k12');
  const [year, setYear] = useState(2023);
  const [state, setState] = useState('');

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);

    const toastId = toast.loading('Generating insights from national benchmarks...');

    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          year,
          ...(state && { state }),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate insights');
      }

      setInsights(data.insights);
      setSummary(data.summary);
      toast.success(`Generated ${data.insights.length} insights!`, { id: toastId });
    } catch (err) {
      console.error('Failed to generate insights:', err);
      const message = err instanceof Error ? err.message : 'Failed to load insights';
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Comparative Insights & Benchmarks</h1>
          <p className="text-muted-foreground">
            Compare your assessment data against national educational benchmarks from the Department of Education
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="mb-8 p-6 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Generate Insights</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure benchmarking parameters to compare your data against national or state averages from NCES, IPEDS, and EDFacts.
          </p>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium mb-2">Educational Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as 'k12' | 'postsecondary')}
                className="w-full p-2 border border-border rounded bg-background"
              >
                <option value="k12">K-12 Education</option>
                <option value="postsecondary">Postsecondary/Higher Ed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full p-2 border border-border rounded bg-background"
              >
                {[2023, 2022, 2021, 2020, 2019].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State (Optional)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="e.g., CA, NY"
                maxLength={2}
                className="w-full p-2 border border-border rounded bg-background"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateInsights}
                disabled={loading}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Insights'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <LoadingSpinner size="lg" message="Fetching national benchmarks and generating insights..." />
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorEmptyState message={error} />
        )}

        {/* Summary Statistics */}
        {summary && !loading && (
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Skills Analyzed</div>
              <div className="text-2xl font-bold">{summary.totalSkillsAnalyzed}</div>
            </div>

            <div className="p-4 bg-card border border-green-500 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Above National Avg</div>
              <div className="text-2xl font-bold text-green-600">{summary.aboveAverage}</div>
            </div>

            <div className="p-4 bg-card border border-amber-500 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">At National Avg</div>
              <div className="text-2xl font-bold text-amber-600">{summary.atAverage}</div>
            </div>

            <div className="p-4 bg-card border border-red-500 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Below National Avg</div>
              <div className="text-2xl font-bold text-red-600">{summary.belowAverage}</div>
            </div>

            <div className="p-4 bg-card border border-border rounded-lg col-span-full">
              <div className="text-sm text-muted-foreground mb-1">Average Percentile Rank</div>
              <div className="text-3xl font-bold">{summary.averagePercentileRank.toFixed(1)}th</div>
              <div className="text-xs text-muted-foreground mt-1">
                Your average performance compared to national benchmarks
              </div>
            </div>
          </div>
        )}

        {/* Insights List */}
        {insights.length > 0 && !loading && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Actionable Recommendations</h2>
              <p className="text-sm text-muted-foreground">
                Insights prioritized by impact. High-priority items indicate significant gaps with national benchmarks.
              </p>
            </div>

            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-6 bg-card border rounded-lg ${
                    insight.priority === 'high' ? 'border-red-500' :
                    insight.priority === 'medium' ? 'border-amber-500' :
                    'border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{insight.skillName}</h3>
                      <div className="text-xs text-muted-foreground mt-1">
                        Source: {insight.benchmarkSource}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' :
                      insight.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' :
                      'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Your Average</div>
                      <div className="text-xl font-bold">{insight.userAverage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">National Average</div>
                      <div className="text-xl font-bold">{insight.nationalAverage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Gap</div>
                      <div className={`text-xl font-bold ${
                        insight.gap > 0 ? 'text-green-600' : insight.gap < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {insight.gap > 0 ? '+' : ''}{insight.gap.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-background rounded">
                    <div className="text-sm font-medium mb-2">Recommendation:</div>
                    <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Percentile Rank: {insight.percentilRank.toFixed(1)}th (Your performance relative to national distribution)
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {insights.length === 0 && !loading && !error && (
          <div className="p-8 bg-card border border-border rounded-lg text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Insights Generated Yet</h3>
            <p className="text-muted-foreground mb-4">
              Configure the parameters above and click "Generate Insights" to compare your data against national benchmarks.
            </p>
            <p className="text-sm text-muted-foreground">
              Make sure you have imported assessment data first via the Data Import page.
            </p>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Data Sources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>NCES:</strong> National Center for Education Statistics</li>
              <li>• <strong>IPEDS:</strong> Integrated Postsecondary Education Data System (6,400+ institutions)</li>
              <li>• <strong>EDFacts:</strong> K-12 state and district performance data</li>
              <li>• <strong>CCD:</strong> Common Core of Data (K-12 schools nationwide)</li>
              <li>• All data sourced from U.S. Department of Education via Urban Institute Education Data Portal</li>
            </ul>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">How It Works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Your assessment data is compared against aggregated national/state benchmarks</li>
              <li>• Gaps are calculated as: Your Average - National Average</li>
              <li>• Priority is assigned based on gap size (&gt;20% = high, 10-20% = medium)</li>
              <li>• Percentile ranks show where you fall in the national distribution</li>
              <li>• Recommendations are generated to guide professional development priorities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
