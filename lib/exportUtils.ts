/**
 * Utilities for exporting visualizations to various formats
 * Includes validation and security measures
 */

import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';

/**
 * Sanitize filename to prevent directory traversal and invalid characters
 */
function sanitizeFilename(filename: string): string {
  // Remove directory traversal attempts
  let safe = filename.replace(/\.\./g, '');
  // Remove path separators
  safe = safe.replace(/[\/\\]/g, '');
  // Allow only alphanumeric, dash, underscore, dot
  safe = safe.replace(/[^a-zA-Z0-9\-_.]/g, '_');
  // Limit length
  return safe.substring(0, 255);
}

/**
 * Validate visualization ID (should be alphanumeric + hyphens only)
 */
function validateVisualizationId(id: string): boolean {
  return /^[a-zA-Z0-9\-]+$/.test(id) && id.length > 0 && id.length <= 100;
}

/**
 * Validate dimensions
 */
function validateDimensions(width?: number, height?: number): void {
  if (width !== undefined && (width < 100 || width > 10000 || !Number.isFinite(width))) {
    throw new Error('Invalid width: must be between 100-10000');
  }
  if (height !== undefined && (height < 100 || height > 10000 || !Number.isFinite(height))) {
    throw new Error('Invalid height: must be between 100-10000');
  }
}

/**
 * Export visualization to PNG format
 * @throws {Error} If element is invalid or export fails
 */
export async function exportToPNG(
  element: HTMLElement | null,
  filename: string = 'visualization.png',
  options?: { width?: number; height?: number; quality?: number }
): Promise<void> {
  // Validate inputs
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error('Invalid element: must be a valid HTMLElement');
  }

  validateDimensions(options?.width, options?.height);

  const quality = options?.quality !== undefined
    ? Math.max(0.1, Math.min(1.0, options.quality))
    : 0.95;

  const safeFilename = sanitizeFilename(filename);

  try {
    const dataUrl = await toPng(element, {
      quality,
      width: options?.width,
      height: options?.height,
      pixelRatio: 2, // Higher resolution
    });

    saveAs(dataUrl, safeFilename);
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw new Error('PNG export failed', { cause: error });
  }
}

/**
 * Export visualization to SVG format
 * @throws {Error} If element is invalid or export fails
 */
export async function exportToSVG(
  element: HTMLElement | null,
  filename: string = 'visualization.svg'
): Promise<void> {
  // Validate inputs
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error('Invalid element: must be a valid HTMLElement');
  }

  const safeFilename = sanitizeFilename(filename);

  try {
    const dataUrl = await toSvg(element);
    saveAs(dataUrl, safeFilename);
  } catch (error) {
    console.error('Failed to export SVG:', error);
    throw new Error('SVG export failed', { cause: error });
  }
}

/**
 * Export data to CSV format
 * @throws {Error} If data is invalid or export fails
 */
export function exportToCSV(data: any[], filename: string = 'data.csv'): void {
  if (!Array.isArray(data)) {
    throw new Error('Invalid data: must be an array');
  }

  if (data.length === 0) {
    throw new Error('No data to export');
  }

  if (typeof data[0] !== 'object' || data[0] === null) {
    throw new Error('Invalid data format: array elements must be objects');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  if (headers.length === 0) {
    throw new Error('No data fields to export');
  }

  // Build CSV string with proper escaping
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];

        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }

        // Convert to string
        const stringValue = String(value);

        // Handle values with commas, quotes, or newlines
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      }).join(',')
    )
  ];

  const safeFilename = sanitizeFilename(filename);
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, safeFilename);
}

/**
 * Generate embed code for iframe integration
 * @throws {Error} If inputs are invalid
 */
export function generateEmbedCode(
  visualizationId: string,
  type: 'skills' | 'progress' | 'gaps',
  width: number = 800,
  height: number = 600
): string {
  // Validate visualization ID to prevent XSS
  if (!validateVisualizationId(visualizationId)) {
    throw new Error('Invalid visualization ID: must be alphanumeric with hyphens only');
  }

  // Validate dimensions
  validateDimensions(width, height);

  // Get base URL with validation
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Construct URL with validated inputs (no user-controlled string interpolation)
  const embedUrl = new URL(`/embed/${type}/${visualizationId}`, baseUrl).href;

  // Generate iframe with HTML entity encoding for safety
  return `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="clipboard-write"
  title="Data Visualization"
  sandbox="allow-scripts allow-same-origin">
</iframe>`;
}

/**
 * Generate shareable link for visualization
 * @throws {Error} If inputs are invalid
 */
export function generateShareableLink(
  visualizationId: string,
  type: 'skills' | 'progress' | 'gaps'
): string {
  // Validate visualization ID
  if (!validateVisualizationId(visualizationId)) {
    throw new Error('Invalid visualization ID: must be alphanumeric with hyphens only');
  }

  // Get base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Construct URL safely using URL API
  const url = new URL(`/${type}`, baseUrl);
  url.searchParams.set('id', visualizationId);

  return url.href;
}
