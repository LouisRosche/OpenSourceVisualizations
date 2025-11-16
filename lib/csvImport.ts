/**
 * CSV import utilities with validation
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

/**
 * Validate and parse skill matrix CSV data
 */
export function parseSkillMatrixCSV(file: File): Promise<CSVImportResult<SkillMatrixCSVRow>> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validData: SkillMatrixCSVRow[] = [];

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row, index) => {
          const rowNum = index + 2; // +2 because of header and 0-index

          // Required fields
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
            userId: row.userId.trim(),
            userName: row.userName.trim(),
            skillId: row.skillId.trim(),
            skillName: row.skillName.trim(),
            category: row.category?.trim() || 'general',
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
