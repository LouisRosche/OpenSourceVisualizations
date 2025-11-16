/**
 * Sample data generators for demonstration purposes
 */

import { SkillMatrixEntry, TimeSeriesPoint, GapAnalysis } from './types';

export function generateSkillMatrixData(userCount: number = 10, skillCount: number = 8): SkillMatrixEntry[] {
  const skillNames = [
    'JavaScript', 'TypeScript', 'React', 'Node.js',
    'Data Analysis', 'SQL', 'Python', 'Communication',
    'Project Management', 'Leadership', 'Problem Solving', 'Critical Thinking'
  ].slice(0, skillCount);

  const users: SkillMatrixEntry[] = [];

  for (let i = 0; i < userCount; i++) {
    const entry: SkillMatrixEntry = {
      userId: `user-${i + 1}`,
      userName: `User ${i + 1}`,
      skills: {}
    };

    skillNames.forEach((skillName, skillIdx) => {
      const skillId = `skill-${skillIdx + 1}`;
      // Generate scores with some correlation to user level
      const baseScore = 30 + Math.random() * 50 + (i * 2);
      const score = Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 20));
      const confidence = 3 + Math.random() * 7; // 3-10% confidence interval

      entry.skills[skillId] = {
        name: skillName,
        score: score,
        confidence: confidence
      };
    });

    users.push(entry);
  }

  return users;
}

export function generateTimeSeriesData(
  seriesCount: number = 3,
  pointsPerSeries: number = 20
): Array<{ id: string; label: string; data: TimeSeriesPoint[]; color?: string }> {
  const series: Array<{ id: string; label: string; data: TimeSeriesPoint[]; color?: string }> = [];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const now = new Date();
  const startDate = new Date(now.getTime() - (pointsPerSeries * 7 * 24 * 60 * 60 * 1000)); // weeks ago

  for (let s = 0; s < seriesCount; s++) {
    const data: TimeSeriesPoint[] = [];
    let currentValue = 40 + Math.random() * 20; // Starting value

    for (let i = 0; i < pointsPerSeries; i++) {
      const timestamp = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));

      // Add trend and noise
      const trend = 0.5; // Upward trend
      const noise = (Math.random() - 0.5) * 10;
      currentValue = Math.min(100, Math.max(0, currentValue + trend + noise));

      data.push({
        timestamp,
        value: currentValue,
        confidence: 3 + Math.random() * 4, // 3-7 points
        label: `Week ${i + 1}`
      });
    }

    series.push({
      id: `series-${s + 1}`,
      label: `Cohort ${s + 1}`,
      data,
      color: colors[s % colors.length]
    });
  }

  return series;
}

export function generateGapAnalysisData(skillCount: number = 10): GapAnalysis[] {
  const skillCategories = [
    { name: 'JavaScript', category: 'technical' },
    { name: 'TypeScript', category: 'technical' },
    { name: 'React', category: 'technical' },
    { name: 'Node.js', category: 'technical' },
    { name: 'Data Analysis', category: 'technical' },
    { name: 'Communication', category: 'soft' },
    { name: 'Leadership', category: 'soft' },
    { name: 'Project Management', category: 'soft' },
    { name: 'Problem Solving', category: 'domain' },
    { name: 'Critical Thinking', category: 'domain' },
    { name: 'SQL', category: 'technical' },
    { name: 'Python', category: 'technical' },
  ].slice(0, skillCount);

  const gaps: GapAnalysis[] = skillCategories.map((skill, idx) => {
    const currentLevel = 30 + Math.random() * 50;
    const targetLevel = Math.min(100, currentLevel + 20 + Math.random() * 30);
    const gap = targetLevel - currentLevel;

    let priority: 'low' | 'medium' | 'high';
    if (gap > 30) priority = 'high';
    else if (gap > 15) priority = 'medium';
    else priority = 'low';

    const recommendedActions = [];
    if (skill.category === 'technical') {
      recommendedActions.push('Complete online course');
      recommendedActions.push('Build practice projects');
      recommendedActions.push('Code review sessions');
    } else if (skill.category === 'soft') {
      recommendedActions.push('Attend workshops');
      recommendedActions.push('Seek mentorship');
      recommendedActions.push('Practice in team settings');
    } else {
      recommendedActions.push('Read industry literature');
      recommendedActions.push('Apply to real scenarios');
      recommendedActions.push('Collaborative projects');
    }

    return {
      skillId: `skill-${idx + 1}`,
      skillName: skill.name,
      category: skill.category,
      currentLevel,
      targetLevel,
      gap,
      priority,
      recommendedActions
    };
  });

  return gaps;
}
