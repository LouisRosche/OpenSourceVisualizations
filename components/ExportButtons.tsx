'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
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

  // Generate embed code with error handling
  let embedCode = '';
  try {
    embedCode = generateEmbedCode('demo-123', visualizationType, 1000, 600);
  } catch (error) {
    console.error('Failed to generate embed code:', error);
  }

  const handleExportPNG = async () => {
    if (!visualizationRef.current) {
      toast.error('No visualization to export');
      return;
    }

    setExporting(true);
    const toastId = toast.loading('Exporting PNG...');

    try {
      await exportToPNG(visualizationRef.current, `${filename}.png`);
      toast.success('PNG exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Export failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to export PNG';
      toast.error(message, { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const handleExportSVG = async () => {
    if (!visualizationRef.current) {
      toast.error('No visualization to export');
      return;
    }

    setExporting(true);
    const toastId = toast.loading('Exporting SVG...');

    try {
      await exportToSVG(visualizationRef.current, `${filename}.svg`);
      toast.success('SVG exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Export failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to export SVG';
      toast.error(message, { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    const toastId = toast.loading('Exporting CSV...');

    try {
      exportToCSV(data, `${filename}.csv`);
      toast.success('CSV exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Export failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to export CSV';
      toast.error(message, { id: toastId });
    }
  };

  const copyEmbedCode = async () => {
    if (!embedCode) {
      toast.error('No embed code available');
      return;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(embedCode);
        toast.success('Embed code copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = embedCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          toast.success('Embed code copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy. Please copy manually.');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy to clipboard. Please copy manually.');
    }
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
