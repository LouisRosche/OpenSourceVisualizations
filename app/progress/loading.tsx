/**
 * Loading state for Progress Tracking page
 */

import { LoadingCard } from '@/components/LoadingSpinner';

export default function ProgressLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Progress Tracking</h1>
        <p className="text-muted-foreground mb-8">
          Time-series analysis of skill development over time
        </p>

        <LoadingCard message="Loading progress tracking visualization..." />
      </div>
    </div>
  );
}
