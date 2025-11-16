/**
 * CSV import utilities with validation and security measures
 */

import Papa from 'papaparse';
import { SkillAssessmentData } from './types';

export interface CSVImportResult<T> {
  data: T[];
  errors: string[];
  warnings: string[];
}

export interface SkillMatrixCSVRow {
  userId: string;
  userName: string;
  skillId: string;
  skillName: string;
  category: string;
  score: number;
  confidence?: number;
}

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 10000; // Prevent memory exhaustion
const ALLOWED_MIME_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];

/**
 * Sanitize string to prevent CSV injection attacks
 * Removes leading characters that could trigger formulas: = + - @
 */
function sanitizeCSVValue(value: string): string {
  const trimmed = value.trim();
  // Remove leading formula characters
  if (trimmed.length > 0 && /^[=+\-@]/.test(trimmed)) {
    return trimmed.substring(1);
  }
  return trimmed;
}

/**
 * Validate file before parsing
 */
function validateFile(file: File): string[] {
  const errors: string[] = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.endsWith('.csv')) {
    errors.push(`Invalid file type: ${file.type}. Please upload a CSV file.`);
  }

  // Check file name
  if (!file.name || file.name.length > 255) {
    errors.push('Invalid file name');
  }

  return errors;
}

/**
 * Validate and parse skill matrix CSV data with security measures
 */
export function parseSkillMatrixCSV(file: File): Promise<CSVImportResult<SkillMatrixCSVRow>> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validData: SkillMatrixCSVRow[] = [];

    // Pre-flight validation
    const fileErrors = validateFile(file);
    if (fileErrors.length > 0) {
      resolve({ data: [], errors: fileErrors, warnings });
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Check row count
        if (results.data.length > MAX_ROWS) {
          errors.push(`Too many rows: ${results.data.length} (max ${MAX_ROWS})`);
          resolve({ data: [], errors, warnings });
          return;
        }

        results.data.forEach((row, index) => {
          const rowNum = index + 2; // +2 because of header and 0-index

          // Required fields - check existence
          if (!row.userId) {
            errors.push(`Row ${rowNum}: Missing userId`);
            return;
          }
          if (!row.userName) {
            errors.push(`Row ${rowNum}: Missing userName`);
            return;
          }
          if (!row.skillId) {
            errors.push(`Row ${rowNum}: Missing skillId`);
            return;
          }
          if (!row.skillName) {
            errors.push(`Row ${rowNum}: Missing skillName`);
            return;
          }
          if (!row.score) {
            errors.push(`Row ${rowNum}: Missing score`);
            return;
          }

          // Sanitize string values (prevent CSV injection)
          const userId = sanitizeCSVValue(row.userId);
          const userName = sanitizeCSVValue(row.userName);
          const skillId = sanitizeCSVValue(row.skillId);
          const skillName = sanitizeCSVValue(row.skillName);
          const category = row.category ? sanitizeCSVValue(row.category) : 'general';

          // Validate after sanitization
          if (!userId || userId.length === 0) {
            errors.push(`Row ${rowNum}: userId is empty after sanitization`);
            return;
          }
          if (!userName || userName.length === 0) {
            errors.push(`Row ${rowNum}: userName is empty after sanitization`);
            return;
          }
          if (!skillId || skillId.length === 0) {
            errors.push(`Row ${rowNum}: skillId is empty after sanitization`);
            return;
          }
          if (!skillName || skillName.length === 0) {
            errors.push(`Row ${rowNum}: skillName is empty after sanitization`);
            return;
          }

          // Length validation
          if (userId.length > 100) {
            errors.push(`Row ${rowNum}: userId too long (max 100 chars)`);
            return;
          }
          if (userName.length > 200) {
            errors.push(`Row ${rowNum}: userName too long (max 200 chars)`);
            return;
          }

          // Parse score
          const score = parseFloat(row.score);
          if (isNaN(score)) {
            errors.push(`Row ${rowNum}: Invalid score "${row.score}"`);
            return;
          }
          if (score < 0 || score > 100) {
            errors.push(`Row ${rowNum}: Score must be between 0-100, got ${score}`);
            return;
          }

          // Parse confidence (optional)
          let confidence: number | undefined;
          if (row.confidence) {
            confidence = parseFloat(row.confidence);
            if (isNaN(confidence)) {
              warnings.push(`Row ${rowNum}: Invalid confidence "${row.confidence}", ignoring`);
              confidence = undefined;
            } else if (confidence < 0 || confidence > 100) {
              warnings.push(`Row ${rowNum}: Confidence should be 0-100, got ${confidence}`);
            }
          }

          validData.push({
            userId,
            userName,
            skillId,
            skillName,
            category,
            score,
            confidence,
          });
        });

        resolve({ data: validData, errors, warnings });
      },
      error: (error) => {
        errors.push(`CSV parsing error: ${error.message}`);
        resolve({ data: [], errors, warnings });
      },
    });
  });
}

/**
 * Generate a template CSV for skill matrix import
 */
export function generateSkillMatrixTemplate(): string {
  const headers = ['userId', 'userName', 'skillId', 'skillName', 'category', 'score', 'confidence'];
  const exampleRows = [
    ['user-1', 'John Doe', 'skill-1', 'JavaScript', 'technical', '85', '5'],
    ['user-1', 'John Doe', 'skill-2', 'Leadership', 'soft', '72', '8'],
    ['user-2', 'Jane Smith', 'skill-1', 'JavaScript', 'technical', '92', '4'],
  ];

  return [
    headers.join(','),
    ...exampleRows.map(row => row.join(','))
  ].join('\n');
}

/**
 * Download template CSV
 */
export function downloadSkillMatrixTemplate(): void {
  const template = generateSkillMatrixTemplate();
  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'skill-matrix-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}
