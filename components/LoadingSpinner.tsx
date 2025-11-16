/**
 * Loading Spinner Component
 * Displays an animated spinner for loading states
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  message,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

/**
 * Full page loading state
 */
export function LoadingPage({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" message={message || 'Loading...'} />
    </div>
  );
}

/**
 * Card/section loading state
 */
export function LoadingCard({ message }: { message?: string }) {
  return (
    <div className="p-8 bg-card border border-border rounded-lg">
      <LoadingSpinner size="md" message={message || 'Loading data...'} />
    </div>
  );
}
