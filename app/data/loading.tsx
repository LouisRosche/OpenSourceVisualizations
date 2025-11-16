/**
 * Loading state for Data Import page
 */

import { LoadingCard } from '@/components/LoadingSpinner';

export default function DataLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Data Import</h1>
        <p className="text-muted-foreground mb-8">
          Upload CSV files to create visualizations
        </p>

        <LoadingCard message="Loading import interface..." />
      </div>
    </div>
  );
}
