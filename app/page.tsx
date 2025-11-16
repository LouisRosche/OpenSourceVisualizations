import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Open Source Visualizations
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Professional analytics platform for teaching, learning, and professional development
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <Link
              href="/dashboard"
              className="group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                Dashboard
              </h3>
              <p className="text-muted-foreground">
                View comprehensive analytics and insights
              </p>
            </Link>

            <Link
              href="/skills"
              className="group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                Skill Matrix
              </h3>
              <p className="text-muted-foreground">
                Analyze competency levels with interactive heat maps
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
                Time-series analysis with cohort comparisons
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
                Identify competency gaps and development opportunities
              </p>
            </Link>

            <Link
              href="/insights"
              className="group p-6 bg-card border border-primary rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                📊 Comparative Insights
              </h3>
              <p className="text-muted-foreground">
                Compare against national benchmarks (NCES, IPEDS, EDFacts)
              </p>
            </Link>

            <Link
              href="/data"
              className="group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                Data Import
              </h3>
              <p className="text-muted-foreground">
                Upload CSV files or enter data manually
              </p>
            </Link>

            <Link
              href="/export"
              className="group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                Export & Share
              </h3>
              <p className="text-muted-foreground">
                Generate reports and embeddable visualizations
              </p>
            </Link>
          </div>

          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Statistical rigor with confidence intervals and significance testing</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Interactive coordinated views for deep exploration</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Publication-quality exports (SVG, PNG, PDF)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Embeddable components for integration</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>WCAG AA accessibility compliant</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
