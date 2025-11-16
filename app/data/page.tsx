'use client';

import { useState } from 'react';
import { parseSkillMatrixCSV, downloadSkillMatrixTemplate, type SkillMatrixCSVRow } from '@/lib/csvImport';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface DatabaseSaveResult {
  success: boolean;
  usersCreated: number;
  skillsCreated: number;
  assessmentsCreated: number;
  warnings?: string[];
}

export default function DataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{
    data: SkillMatrixCSVRow[];
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [dbResult, setDbResult] = useState<DatabaseSaveResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setDbResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setDbResult(null);

    try {
      // Step 1: Parse and validate CSV
      const importResult = await parseSkillMatrixCSV(file);
      setResult(importResult);

      // Step 2: Save to database if no errors
      if (importResult.errors.length === 0 && importResult.data.length > 0) {
        setSaving(true);
        const toastId = toast.loading('Saving to database...');

        try {
          const response = await fetch('/api/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: importResult.data,
              organizationName: 'Default Organization',
            }),
          });

          const saveResult = await response.json();

          if (!response.ok) {
            throw new Error(saveResult.error || 'Database save failed');
          }

          setDbResult({
            success: true,
            usersCreated: saveResult.usersCreated,
            skillsCreated: saveResult.skillsCreated,
            assessmentsCreated: saveResult.assessmentsCreated,
            warnings: saveResult.warnings,
          });

          toast.success(
            `Saved ${saveResult.assessmentsCreated} assessments for ${saveResult.usersCreated} users`,
            { id: toastId }
          );
        } catch (dbError) {
          const message = dbError instanceof Error ? dbError.message : 'Database save failed';
          setDbResult({
            success: false,
            usersCreated: 0,
            skillsCreated: 0,
            assessmentsCreated: 0,
            warnings: [message],
          });
          toast.error(`Database save failed: ${message}`, { id: toastId });
        } finally {
          setSaving(false);
        }
      }
    } catch (error) {
      setResult({
        data: [],
        errors: [error instanceof Error ? error.message : 'Import failed'],
        warnings: [],
      });
      toast.error('CSV parsing failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Data Import</h1>
        <p className="text-muted-foreground mb-8">
          Upload CSV files to create visualizations
        </p>

        {/* CSV Template Download */}
        <div className="mb-8 p-6 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Step 1: Download Template</h2>
          <p className="text-muted-foreground mb-4">
            Start with our template to ensure your data is formatted correctly
          </p>
          <button
            onClick={downloadSkillMatrixTemplate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Download CSV Template
          </button>
        </div>

        {/* File Upload */}
        <div className="mb-8 p-6 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Step 2: Upload Your Data</h2>
          <p className="text-muted-foreground mb-4">
            Select a CSV file with your skill assessment data
          </p>

          <div className="space-y-4">
            <div>
              <label className="block">
                <span className="sr-only">Choose CSV file</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  onClick={handleImport}
                  disabled={importing || saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {importing ? 'Parsing CSV...' : saving ? 'Saving to database...' : 'Import Data'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mb-8">
            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                <h3 className="font-semibold text-destructive mb-2">
                  Errors ({result.errors.length})
                </h3>
                <ul className="text-sm space-y-1">
                  {result.errors.map((error, i) => (
                    <li key={i} className="text-destructive">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-500 rounded-lg">
                <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
                  Warnings ({result.warnings.length})
                </h3>
                <ul className="text-sm space-y-1">
                  {result.warnings.map((warning, i) => (
                    <li key={i} className="text-amber-700 dark:text-amber-300">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Database Save Result */}
            {dbResult && dbResult.success && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 border border-green-500 rounded-lg">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  ✓ Successfully saved to database
                </h3>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <p>• Created {dbResult.usersCreated} users</p>
                  <p>• Created {dbResult.skillsCreated} skills</p>
                  <p>• Created {dbResult.assessmentsCreated} assessments</p>
                </div>
                {dbResult.warnings && dbResult.warnings.length > 0 && (
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    <p>Warnings: {dbResult.warnings.join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {dbResult && !dbResult.success && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                <h3 className="font-semibold text-destructive mb-2">
                  Database Save Failed
                </h3>
                <p className="text-sm text-destructive">
                  {dbResult.warnings && dbResult.warnings.length > 0
                    ? dbResult.warnings.join(', ')
                    : 'Unknown database error'}
                </p>
              </div>
            )}

            {/* Success */}
            {result.errors.length === 0 && result.data.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-500 rounded-lg">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  ✓ Successfully imported {result.data.length} rows
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  {dbResult?.success
                    ? 'Data has been saved to database and is ready to visualize'
                    : 'Data parsed successfully. Database save in progress or failed (see above).'}
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/skills"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    View Skill Matrix
                  </Link>
                  <Link
                    href="/progress"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    View Progress
                  </Link>
                  <Link
                    href="/gaps"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    View Gap Analysis
                  </Link>
                </div>
              </div>
            )}

            {/* Preview */}
            {result.data.length > 0 && (
              <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                <h3 className="font-semibold mb-3">Data Preview (first 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Skill</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-right p-2">Score</th>
                        <th className="text-right p-2">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-2">{row.userName}</td>
                          <td className="p-2">{row.skillName}</td>
                          <td className="p-2">{row.category}</td>
                          <td className="text-right p-2">{row.score.toFixed(1)}</td>
                          <td className="text-right p-2">
                            {row.confidence ? `±${row.confidence.toFixed(1)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.data.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ... and {result.data.length - 5} more rows
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="p-6 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">CSV Format Requirements</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Required columns:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code>userId</code> - Unique identifier for the user</li>
              <li><code>userName</code> - Display name</li>
              <li><code>skillId</code> - Unique identifier for the skill</li>
              <li><code>skillName</code> - Skill display name</li>
              <li><code>score</code> - Proficiency score (0-100)</li>
            </ul>
            <p className="mt-4"><strong>Optional columns:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code>category</code> - Skill category (technical, soft, domain)</li>
              <li><code>confidence</code> - Confidence interval (0-100)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
