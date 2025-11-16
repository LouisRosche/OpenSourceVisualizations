/**
 * Empty State Component
 * Displays helpful guidance when no data is available
 */

import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '📊',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref as any}
          className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Pre-configured empty states for common scenarios
 */

export function NoDataEmptyState() {
  return (
    <EmptyState
      icon="📁"
      title="No data available"
      description="Upload a CSV file with your skill assessment data to get started with visualizations."
      actionLabel="Import Data"
      actionHref="/data"
    />
  );
}

export function NoResultsEmptyState() {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description="Try adjusting your filters or search criteria to find what you're looking for."
    />
  );
}

export function ErrorEmptyState({ message }: { message?: string }) {
  return (
    <EmptyState
      icon="⚠️"
      title="Unable to load data"
      description={
        message ||
        'There was an error loading the visualization. Please try again or contact support if the problem persists.'
      }
      actionLabel="Reload Page"
      onAction={() => window.location.reload()}
    />
  );
}
