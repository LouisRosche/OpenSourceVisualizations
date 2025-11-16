import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Comprehensive overview of learning and development metrics
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Link
            href="/skills"
            className="group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
              Skill Matrix
            </h3>
            <p className="text-muted-foreground">
              View heat map of competencies
            </p>
          </Link>

          <Link
            href="/progress"
            className="group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
              Progress Tracking
            </h3>
            <p className="text-muted-foreground">
              Time-series analysis and trends
            </p>
          </Link>

          <Link
            href="/gaps"
            className="group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
              Gap Analysis
            </h3>
            <p className="text-muted-foreground">
              Identify development priorities
            </p>
          </Link>
        </div>

        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Real-time collaboration features</li>
            <li>• Advanced data filtering and export</li>
            <li>• Custom dashboard builder</li>
            <li>• API integrations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
