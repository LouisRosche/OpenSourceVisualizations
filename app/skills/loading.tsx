/**
 * Loading state for Skills Matrix page
 */

import { LoadingCard } from '@/components/LoadingSpinner';

export default function SkillsLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Skill Matrix</h1>
        <p className="text-muted-foreground mb-8">
          Visualizing competency distribution across users and skills
        </p>

        <LoadingCard message="Loading skill matrix visualization..." />
      </div>
    </div>
  );
}
