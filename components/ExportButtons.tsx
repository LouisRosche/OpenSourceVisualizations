'use client';

import { useRef, useState } from 'react';
import { exportToPNG, exportToSVG, exportToCSV, generateEmbedCode } from '@/lib/exportUtils';

interface ExportButtonsProps {
  visualizationRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
  data: any[];
  visualizationType: 'skills' | 'progress' | 'gaps';
  filename?: string;
}

export default function ExportButtons({
  visualizationRef,
  data,
  visualizationType,
  filename = 'visualization',
}: ExportButtonsProps) {
  const [exporting, setExporting] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const embedCode = generateEmbedCode('demo-123', visualizationType, 1000, 600);

  const handleExportPNG = async () => {
    if (!visualizationRef.current) return;
    setExporting(true);
    try {
      await exportToPNG(visualizationRef.current, `${filename}.png`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PNG');
    } finally {
      setExporting(false);
    }
  };

  const handleExportSVG = async () => {
    if (!visualizationRef.current) return;
    setExporting(true);
    try {
      await exportToSVG(visualizationRef.current, `${filename}.svg`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export SVG');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(data, `${filename}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV');
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExportPNG}
          disabled={exporting}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 text-sm"
        >
          {exporting ? 'Exporting...' : 'Export PNG'}
        </button>
        <button
          onClick={handleExportSVG}
          disabled={exporting}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 text-sm"
        >
          Export SVG
        </button>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-sm"
        >
          Export Data (CSV)
        </button>
        <button
          onClick={() => setShowEmbedCode(!showEmbedCode)}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-sm"
        >
          {showEmbedCode ? 'Hide' : 'Show'} Embed Code
        </button>
      </div>

      {showEmbedCode && (
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-sm">Embed Code</h3>
            <button
              onClick={copyEmbedCode}
              className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Copy
            </button>
          </div>
          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
            <code>{embedCode}</code>
          </pre>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Embed functionality requires saved visualization with ID. This is a demo code.
          </p>
        </div>
      )}
    </div>
  );
}
