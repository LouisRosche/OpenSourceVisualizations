'use client';

import { useState, useRef, useMemo } from 'react';
import SkillMatrixHeatmap from '@/components/SkillMatrixHeatmap';
import ExportButtons from '@/components/ExportButtons';
import { NoDataEmptyState } from '@/components/EmptyState';
import { generateSkillMatrixData } from '@/lib/sampleData';

export default function SkillsPage() {
  const [data] = useState(() => generateSkillMatrixData(15, 10));
  const [showConfidence, setShowConfidence] = useState(false);
  const [colorScheme, setColorScheme] = useState<'sequential' | 'diverging'>('sequential');
  const vizRef = useRef<HTMLDivElement>(null);

  // Memoize statistics calculations
  const statistics = useMemo(() => {
    const skillCount = data.length > 0 ? Object.keys(data[0]?.skills || {}).length : 0;
    return {
      userCount: data.length,
      skillCount,
      assessmentCount: data.length * skillCount,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Skill Matrix Heat Map</h1>
          <p className="text-muted-foreground">
            Comprehensive visualization of competency levels across users and skills
          </p>
        </div>

        {/* Show empty state if no data */}
        {(!data || data.length === 0) && (
          <NoDataEmptyState />
        )}

        {/* Show visualization if data is available */}
        {data && data.length > 0 && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
