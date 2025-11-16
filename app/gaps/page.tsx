'use client';

import { useState, useMemo } from 'react';
import GapAnalysisChart from '@/components/GapAnalysisChart';
import { NoDataEmptyState } from '@/components/EmptyState';
import { generateGapAnalysisData } from '@/lib/sampleData';
import { GapAnalysis } from '@/lib/types';

export default function GapsPage() {
  const [data] = useState(() => generateGapAnalysisData(12));
  const [selectedGap, setSelectedGap] = useState<GapAnalysis | null>(null);

  const handleGapClick = (gap: GapAnalysis) => {
    setSelectedGap(gap);
  };

  // Memoize priority count calculation
  const priorityCount = useMemo(() => {
    if (data.length === 0) return { high: 0, medium: 0, low: 0 };

    return {
      high: data.filter(d => d.priority === 'high').length,
      medium: data.filter(d => d.priority === 'medium').length,
      low: data.filter(d => d.priority === 'low').length,
    };
  }, [data]);

  // Memoize average gap calculation
  const averageGap = useMemo(() => {
    if (data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.gap, 0) / data.length;
  }, [data]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gap Analysis Dashboard</h1>
          <p className="text-muted-foreground">
            Identify competency gaps and prioritize development opportunities
          </p>
        </div>

        {/* Show empty state if no data */}
        {(!data || data.length === 0) && (
          <NoDataEmptyState />
        )}

        {/* Show visualization if data is available */}
        {data && data.length > 0 && (
          <>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Average Gap</div>
            <div className="text-2xl font-bold">{averageGap.toFixed(1)}%</div>
          </div>
          <div className="p-4 bg-card border border-red-500 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">High Priority</div>
            <div className="text-2xl font-bold text-red-600">{priorityCount.high}</div>
          </div>
          <div className="p-4 bg-card border border-amber-500 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Medium Priority</div>
            <div className="text-2xl font-bold text-amber-600">{priorityCount.medium}</div>
          </div>
          <div className="p-4 bg-card border border-green-500 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Low Priority</div>
            <div className="text-2xl font-bold text-green-600">{priorityCount.low}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <GapAnalysisChart
            data={data}
            width={1000}
            height={600}
            onGapClick={handleGapClick}
          />
        </div>

        {selectedGap && (
          <div className="mb-8 p-6 bg-card border border-border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Selected Skill: {selectedGap.skillName}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-semibold capitalize">{selectedGap.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Level:</span>
                    <span className="font-mono">{selectedGap.currentLevel.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Level:</span>
                    <span className="font-mono">{selectedGap.targetLevel.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gap:</span>
                    <span className="font-mono font-bold">{selectedGap.gap.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority:</span>
                    <span className={`font-semibold capitalize ${
                      selectedGap.priority === 'high' ? 'text-red-600' :
                      selectedGap.priority === 'medium' ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {selectedGap.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Recommended Actions</h3>
                <ul className="space-y-2 text-sm">
                  {selectedGap.recommendedActions?.map((action, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span className="text-muted-foreground">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Methodology</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Gaps calculated as target minus current competency level</li>
              <li>• Priority assignment based on gap size and strategic importance</li>
              <li>• High priority: gaps &gt; 30 percentage points</li>
              <li>• Medium priority: gaps 15-30 percentage points</li>
              <li>• Low priority: gaps &lt; 15 percentage points</li>
            </ul>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Applications</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Individual development planning</li>
              <li>• Team capability assessment</li>
              <li>• Training resource allocation</li>
              <li>• Career pathway planning</li>
              <li>• Hiring needs identification</li>
            </ul>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
