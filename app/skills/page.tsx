'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import SkillMatrixHeatmap from '@/components/SkillMatrixHeatmap';
import ExportButtons from '@/components/ExportButtons';
import { NoDataEmptyState, ErrorEmptyState } from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import { transformToSkillMatrix, validateDataQuality } from '@/lib/dataTransformers';
import { SkillMatrixEntry } from '@/lib/types';

export default function SkillsPage() {
  const [data, setData] = useState<SkillMatrixEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfidence, setShowConfidence] = useState(false);
  const [colorScheme, setColorScheme] = useState<'sequential' | 'diverging'>('sequential');
  const vizRef = useRef<HTMLDivElement>(null);

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

        // Transform database data to visualization format
        const transformed = transformToSkillMatrix(dbData);
        setData(transformed);

        // Validate data quality
        const validation = validateDataQuality(dbData);
        if (validation.warnings.length > 0) {
          console.warn('Data quality warnings:', validation.warnings);
        }
      } catch (err) {
        console.error('Failed to fetch skill matrix data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Memoize statistics calculations
  const statistics = useMemo(() => {
    const skillCount = data.length > 0 ? Object.keys(data[0]?.skills || {}).length : 0;
    return {
      userCount: data.length,
      skillCount,
      assessmentCount: data.length * skillCount,
    };
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Skill Matrix Heat Map</h1>
          <p className="text-muted-foreground mb-8">
            Comprehensive visualization of competency levels across users and skills
          </p>
          <LoadingSpinner size="lg" message="Loading skill matrix data..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Skill Matrix Heat Map</h1>
          <p className="text-muted-foreground mb-8">
            Comprehensive visualization of competency levels across users and skills
          </p>
          <ErrorEmptyState message={error} />
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Skill Matrix Heat Map</h1>
          <p className="text-muted-foreground mb-8">
            Comprehensive visualization of competency levels across users and skills
          </p>
          <NoDataEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Skill Matrix Heat Map</h1>
          <p className="text-muted-foreground">
            Comprehensive visualization of competency levels across users and skills
          </p>
        </div>

        <div className="mb-6 flex gap-4 items-center p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-confidence"
              checked={showConfidence}
              onChange={(e) => setShowConfidence(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="show-confidence" className="text-sm font-medium">
              Show Confidence Intervals
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="color-scheme" className="text-sm font-medium">
              Color Scheme:
            </label>
            <select
              id="color-scheme"
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as 'sequential' | 'diverging')}
              className="px-3 py-1 border border-border rounded"
            >
              <option value="sequential">Sequential</option>
              <option value="diverging">Diverging</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <ExportButtons
            visualizationRef={vizRef}
            data={data}
            visualizationType="skills"
            filename="skill-matrix"
          />
        </div>

        <div ref={vizRef} className="bg-card border border-border rounded-lg p-6">
          <SkillMatrixHeatmap
            data={data}
            colorScheme={colorScheme}
            showConfidence={showConfidence}
            onCellClick={(userId, skillId) => {
              console.log('Cell clicked:', { userId, skillId });
            }}
          />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Key Insights</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Each cell represents a user's proficiency in a specific skill</li>
              <li>• Color intensity indicates proficiency level (darker = higher)</li>
              <li>• Hover over cells for detailed information</li>
              <li>• Click cells to drill down into individual assessments</li>
              <li>• Identify skill gaps and training opportunities at a glance</li>
            </ul>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Statistical Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Users:</span>
                <span className="font-semibold">{statistics.userCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Skills:</span>
                <span className="font-semibold">{statistics.skillCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Assessments:</span>
                <span className="font-semibold">{statistics.assessmentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
