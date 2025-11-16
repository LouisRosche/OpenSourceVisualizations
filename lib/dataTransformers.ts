/**
 * Data transformation layer
 * Converts database entities to visualization-ready formats
 */

import { SkillMatrixEntry, GapAnalysis } from './types';

/**
 * Database result type from fetchImportedData
 */
interface DatabaseOrganization {
  users: Array<{
    id: string;
    name: string;
    email: string;
    assessments: Array<{
      score: number;
      confidence: number | null;
      assessedAt: Date;
      skill: {
        id: string;
        name: string;
        category: string;
      };
    }>;
  }>;
}

/**
 * Transform database data to skill matrix format
 * Groups assessments by user and skill
 */
export function transformToSkillMatrix(
  dbData: DatabaseOrganization | null
): SkillMatrixEntry[] {
  if (!dbData || !dbData.users || dbData.users.length === 0) {
    return [];
  }

  return dbData.users.map((user) => {
    const skills: SkillMatrixEntry['skills'] = {};

    user.assessments.forEach((assessment) => {
      skills[assessment.skill.id] = {
        name: assessment.skill.name,
        score: assessment.score,
        confidence: assessment.confidence ?? undefined,
      };
    });

    return {
      userId: user.id,
      userName: user.name,
      skills,
    };
  });
}

/**
 * Transform database data to gap analysis format
 * Calculates gaps between current proficiency and target levels
 *
 * NOTE: Currently uses fixed target of 80 for all skills
 * TODO: Add target levels to database schema
 */
export function transformToGapAnalysis(
  dbData: DatabaseOrganization | null,
  targetLevel: number = 80
): GapAnalysis[] {
  if (!dbData || !dbData.users || dbData.users.length === 0) {
    return [];
  }

  // Aggregate all skills across users
  const skillMap = new Map<string, {
    id: string;
    name: string;
    category: string;
    scores: number[];
  }>();

  dbData.users.forEach((user) => {
    user.assessments.forEach((assessment) => {
      const skill = assessment.skill;

      if (!skillMap.has(skill.id)) {
        skillMap.set(skill.id, {
          id: skill.id,
          name: skill.name,
          category: skill.category,
          scores: [],
        });
      }

      skillMap.get(skill.id)!.scores.push(assessment.score);
    });
  });

  // Calculate average score per skill and determine gaps
  const gaps: GapAnalysis[] = [];

  skillMap.forEach((skill) => {
    const avgScore = skill.scores.reduce((sum, s) => sum + s, 0) / skill.scores.length;
    const gap = Math.max(0, targetLevel - avgScore);

    // Determine priority based on gap size
    let priority: 'low' | 'medium' | 'high';
    if (gap >= 30) {
      priority = 'high';
    } else if (gap >= 15) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    gaps.push({
      skillId: skill.id,
      skillName: skill.name,
      category: skill.category,
      currentLevel: Math.round(avgScore * 10) / 10,
      targetLevel,
      gap: Math.round(gap * 10) / 10,
      priority,
      recommendedActions: generateRecommendations(skill.name, gap, priority),
    });
  });

  // Sort by priority (high first) then by gap size
  return gaps.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.gap - a.gap;
  });
}

/**
 * Generate recommended actions based on skill gap
 */
function generateRecommendations(
  skillName: string,
  gap: number,
  priority: 'low' | 'medium' | 'high'
): string[] {
  const recommendations: string[] = [];

  if (priority === 'high') {
    recommendations.push(`Immediate training required for ${skillName}`);
    recommendations.push('Schedule 1-on-1 coaching sessions');
    recommendations.push('Assign mentor with expertise in this area');
  } else if (priority === 'medium') {
    recommendations.push(`Enroll in ${skillName} development program`);
    recommendations.push('Practice through hands-on projects');
  } else {
    recommendations.push(`Continue maintenance practice for ${skillName}`);
    recommendations.push('Consider peer learning opportunities');
  }

  return recommendations;
}

/**
 * Transform database data to time series format
 * Groups assessments by date for progress tracking
 *
 * NOTE: Requires multiple assessments over time to be meaningful
 * Currently returns empty if no time-series data exists
 */
export function transformToTimeSeries(
  dbData: DatabaseOrganization | null
): Array<{
  id: string;
  label: string;
  data: Array<{ timestamp: Date; value: number; confidence?: number }>;
}> {
  if (!dbData || !dbData.users || dbData.users.length === 0) {
    return [];
  }

  // Group assessments by skill across all users
  const skillTimelineMap = new Map<string, {
    name: string;
    points: Array<{ timestamp: Date; value: number; confidence?: number }>;
  }>();

  dbData.users.forEach((user) => {
    user.assessments.forEach((assessment) => {
      const skillId = assessment.skill.id;

      if (!skillTimelineMap.has(skillId)) {
        skillTimelineMap.set(skillId, {
          name: assessment.skill.name,
          points: [],
        });
      }

      skillTimelineMap.get(skillId)!.points.push({
        timestamp: new Date(assessment.assessedAt),
        value: assessment.score,
        confidence: assessment.confidence ?? undefined,
      });
    });
  });

  // Convert to array and sort points by timestamp
  const series = Array.from(skillTimelineMap.entries()).map(([skillId, skill]) => ({
    id: skillId,
    label: skill.name,
    data: skill.points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
  }));

  return series;
}

/**
 * Check if database has sufficient data for visualizations
 */
export function validateDataQuality(dbData: DatabaseOrganization | null): {
  hasData: boolean;
  userCount: number;
  skillCount: number;
  assessmentCount: number;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!dbData || !dbData.users || dbData.users.length === 0) {
    return {
      hasData: false,
      userCount: 0,
      skillCount: 0,
      assessmentCount: 0,
      warnings: ['No data imported yet. Please import CSV data to get started.'],
    };
  }

  const userCount = dbData.users.length;
  const assessmentCount = dbData.users.reduce(
    (sum, user) => sum + user.assessments.length,
    0
  );

  const uniqueSkills = new Set(
    dbData.users.flatMap((user) =>
      user.assessments.map((a) => a.skill.id)
    )
  );
  const skillCount = uniqueSkills.size;

  // Quality checks
  if (userCount < 3) {
    warnings.push('Low sample size: Consider adding more users for reliable statistics.');
  }

  if (skillCount < 3) {
    warnings.push('Limited skills: Add more skills for comprehensive analysis.');
  }

  if (assessmentCount < 10) {
    warnings.push('Insufficient data: Add more assessments for better insights.');
  }

  return {
    hasData: true,
    userCount,
    skillCount,
    assessmentCount,
    warnings,
  };
}
