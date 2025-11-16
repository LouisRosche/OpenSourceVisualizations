/**
 * Database service for persisting imported data
 */

import prisma from './db';
import { Prisma } from '@prisma/client';
import { SkillMatrixCSVRow } from './csvImport';

export interface ImportResult {
  success: boolean;
  usersCreated: number;
  skillsCreated: number;
  assessmentsCreated: number;
  errors?: string[];
}

/**
 * Save imported CSV data to database
 * Creates organizations, users, skills, and assessments as needed
 */
export async function saveCSVImport(
  data: SkillMatrixCSVRow[],
  organizationName: string = 'Default Organization'
): Promise<ImportResult> {
  const errors: string[] = [];

  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get or create organization
      let organization = await tx.organization.findFirst({
        where: { name: organizationName },
      });

      if (!organization) {
        organization = await tx.organization.create({
          data: {
            name: organizationName,
            type: 'general',
            description: 'Auto-created from CSV import',
          },
        });
      }

      // 2. Collect unique users and skills
      const uniqueUsers = new Map<string, { id: string; name: string }>();
      const uniqueSkills = new Map<string, { id: string; name: string; category: string }>();

      data.forEach((row) => {
        uniqueUsers.set(row.userId, { id: row.userId, name: row.userName });
        uniqueSkills.set(row.skillId, {
          id: row.skillId,
          name: row.skillName,
          category: row.category,
        });
      });

      // 3. Create users (upsert to handle duplicates)
      let usersCreated = 0;
      for (const [userId, userData] of uniqueUsers) {
        await tx.user.upsert({
          where: { email: `${userId}@imported.local` }, // Temporary email
          update: {
            name: userData.name,
          },
          create: {
            email: `${userId}@imported.local`,
            name: userData.name,
            role: 'learner',
            organizationId: organization.id,
            metadata: JSON.stringify({ importedUserId: userId }),
          },
        });
        usersCreated++;
      }

      // 4. Create skills (upsert to handle duplicates)
      let skillsCreated = 0;
      for (const [skillId, skillData] of uniqueSkills) {
        await tx.skill.upsert({
          where: {
            id: skillId,
          },
          update: {
            name: skillData.name,
            category: skillData.category,
          },
          create: {
            id: skillId,
            name: skillData.name,
            category: skillData.category,
            organizationId: organization.id,
          },
        });
        skillsCreated++;
      }

      // 5. Create assessments
      let assessmentsCreated = 0;
      for (const row of data) {
        const user = await tx.user.findFirst({
          where: {
            metadata: {
              contains: row.userId,
            },
            organizationId: organization.id,
          },
        });

        if (!user) {
          errors.push(`User not found: ${row.userId}`);
          continue;
        }

        await tx.assessment.create({
          data: {
            userId: user.id,
            skillId: row.skillId,
            score: row.score,
            confidence: row.confidence,
            method: 'csv-import',
            assessedAt: new Date(),
            notes: 'Imported from CSV',
          },
        });
        assessmentsCreated++;
      }

      return { usersCreated, skillsCreated, assessmentsCreated };
    });

    return {
      success: true,
      ...result,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Database save failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return {
      success: false,
      usersCreated: 0,
      skillsCreated: 0,
      assessmentsCreated: 0,
      errors: [message],
    };
  }
}

/**
 * Fetch all imported data for visualization
 */
export async function fetchImportedData(organizationName: string = 'Default Organization') {
  try {
    const organization = await prisma.organization.findFirst({
      where: { name: organizationName },
      include: {
        users: {
          include: {
            assessments: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    return organization;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}
