'use server'

import { ProgressAnalyzer } from '@/services/progress-analyzer'
import { AIAdviceService } from '@/services/ai-advice'
import { getGoal } from './goals'

export async function getProgressAnalysis(goalId: number) {
  try {
    const hasValidId = goalId && goalId > 0;
    if (!hasValidId) {
      throw new Error('Invalid goal ID');
    }

    const goal = await getGoal(goalId);
    const analysis = ProgressAnalyzer.calculateProgressPercentage(goal);

    return analysis;
  } catch (error) {
    console.error('Progress analysis failed:', error);
    throw error;
  }
}

export async function getAIAdvice(goalId: number, context: 'dashboard' | 'goal_detail' | 'progress_logging' = 'dashboard') {
  try {
    const hasValidId = goalId && goalId > 0;
    if (!hasValidId) {
      throw new Error('Invalid goal ID');
    }

    const goal = await getGoal(goalId);
    const adviceRequest = {
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        createdAt: goal.createdAt,
        progress: goal.progress.map(p => ({
          date: p.date,
          note: p.note,
          hours: p.hours || undefined
        })),
        totalHours: goal.totalHours,
        progressCount: goal.progress.length
      },
      context
    };

    const advice = await AIAdviceService.generateGoalAdvice(adviceRequest);
    return advice;
  } catch (error) {
    console.error('AI advice generation failed:', error);
    throw error;
  }
}

export async function getProgressSummary(goalId: number) {
  try {
    const hasValidId = goalId && goalId > 0;
    if (!hasValidId) {
      throw new Error('Invalid goal ID');
    }

    const goal = await getGoal(goalId);
    const summary = await AIAdviceService.generateProgressSummary(goal);
    return summary;
  } catch (error) {
    console.error('Progress summary generation failed:', error);
    throw error;
  }
}