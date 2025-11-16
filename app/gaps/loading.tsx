/**
 * Loading state for Gap Analysis page
 */

import { LoadingCard } from '@/components/LoadingSpinner';

export default function GapsLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Gap Analysis</h1>
        <p className="text-muted-foreground mb-8">
          Identifying skill gaps between current and target competency levels
        </p>

        <LoadingCard message="Loading gap analysis visualization..." />
      </div>
    </div>
  );
}
