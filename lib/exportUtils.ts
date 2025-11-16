/**
 * Utilities for exporting visualizations to various formats
 */

import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';

export async function exportToPNG(
  element: HTMLElement,
  filename: string = 'visualization.png',
  options?: { width?: number; height?: number; quality?: number }
): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      quality: options?.quality || 0.95,
      width: options?.width,
      height: options?.height,
      pixelRatio: 2, // Higher resolution
    });

    saveAs(dataUrl, filename);
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw new Error('PNG export failed');
  }
}

export async function exportToSVG(
  element: HTMLElement,
  filename: string = 'visualization.svg'
): Promise<void> {
  try {
    const dataUrl = await toSvg(element);
    saveAs(dataUrl, filename);
  } catch (error) {
    console.error('Failed to export SVG:', error);
    throw new Error('SVG export failed');
  }
}

export function exportToCSV(data: any[], filename: string = 'data.csv'): void {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Build CSV string
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

export function generateEmbedCode(
  visualizationId: string,
  type: 'skills' | 'progress' | 'gaps',
  width: number = 800,
  height: number = 600
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const embedUrl = `${baseUrl}/embed/${type}/${visualizationId}`;

  return `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="clipboard-write"
  title="Data Visualization">
</iframe>`;
}

export function generateShareableLink(
  visualizationId: string,
  type: 'skills' | 'progress' | 'gaps'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/${type}?id=${visualizationId}`;
}
