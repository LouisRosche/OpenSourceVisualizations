export default function DataPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Data Import</h1>
        <p className="text-muted-foreground mb-8">
          Upload CSV files or enter data manually
        </p>

        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground">
            CSV upload and manual data entry features will be available in the next release.
          </p>
        </div>
      </div>
    </div>
  );
}
