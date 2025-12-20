import { ProgressAnalysis } from './ai-config';

export class ProgressAnalyzer {
  private static readonly POINTS_PER_ENTRY = 5;
  private static readonly POINTS_PER_HOUR = 2;
  private static readonly MAX_PROGRESS = 100;
  private static readonly MIN_ENTRIES_FOR_TREND = 3;
  private static readonly DAYS_FOR_CONSISTENCY = 30;
  private static readonly LOW_PROGRESS = 30;
  private static readonly LOW_CONSISTENCY = 40;
  private static readonly GOOD_PROGRESS = 50;

  static calculateProgressPercentage(goal: unknown): ProgressAnalysis {
    const progress = goal.progress || [];
    const totalHours = goal.totalHours || 0;

    if (!Array.isArray(progress)) {
      throw new Error('Progress must be an array');
    }

    const percentage = this.getPercentage(progress.length, totalHours);
    const trend = this.getTrend(progress);
    const consistency = this.getConsistency(progress);

    return {
      percentage,
      trend,
      consistency,
      insights: this.getInsights(percentage, totalHours, progress.length),
      recommendations: this.getRecommendations(percentage, consistency)
    };
  }

  private static getPercentage(progressCount: number, totalHours: number): number {
    const points = (progressCount * this.POINTS_PER_ENTRY) + (totalHours * this.POINTS_PER_HOUR);
    return Math.min(points, this.MAX_PROGRESS);
  }

  private static getTrend(progress: any[]): 'improving' | 'stable' | 'declining' | 'no_data' {
    const hasEnoughData = progress.length >= this.MIN_ENTRIES_FOR_TREND;
    if (!hasEnoughData) {
      throw new Error(`Need at least ${this.MIN_ENTRIES_FOR_TREND} progress entries to analyze trend`);
    }

    const recentEntries = progress.slice(-this.MIN_ENTRIES_FOR_TREND);

    const recentHours = recentEntries.reduce((sum, p) => sum + (p.hours || 1), 0);
    const recentDays = (Date.now() - new Date(recentEntries[0].date).getTime()) / (1000 * 60 * 60 * 24);

    if (recentHours / Math.max(recentDays, 1) > 1) return 'improving';
    if (recentHours / Math.max(recentDays, 1) < 0.5) return 'declining';
    return 'stable';
  }

  private static getConsistency(progress: any[]): number {
    const hasProgress = progress.length > 0;
    if (!hasProgress) {
      throw new Error('No progress data to calculate consistency');
    }

    const cutoffTime = Date.now() - (this.DAYS_FOR_CONSISTENCY * 24 * 60 * 60 * 1000);
    const recentEntries = progress.filter(p => new Date(p.date).getTime() > cutoffTime);

    const consistencyPercentage = (recentEntries.length / this.DAYS_FOR_CONSISTENCY) * 100;
    return Math.round(consistencyPercentage);
  }

  private static getInsights(percentage: number, totalHours: number, progressCount: number): string[] {
    const hasValidData = Number.isFinite(percentage) && Number.isFinite(totalHours) && Number.isFinite(progressCount);
    if (!hasValidData) {
      return ['Start tracking your progress to see insights'];
    }

    return [
      `${percentage}% progress`,
      `${progressCount} sessions completed`,
      `${totalHours} hours invested`
    ];
  }

  private static getRecommendations(percentage: number, consistency: number): string[] {
    const hasValidNumbers = Number.isFinite(percentage) && Number.isFinite(consistency);
    if (!hasValidNumbers) {
      return ['Track daily progress'];
    }

    const needsMorePractice = percentage < this.LOW_PROGRESS;
    const needsMoreConsistency = consistency < this.LOW_CONSISTENCY;
    const isDoingWell = percentage > this.GOOD_PROGRESS;

    const recommendations: string[] = [];

    if (needsMorePractice) {
      recommendations.push('Practice more frequently');
    }

    if (needsMoreConsistency) {
      recommendations.push('Create a routine');
    }

    if (isDoingWell) {
      recommendations.push('Keep up the good work');
    }

    recommendations.push('Track daily progress');

    return recommendations;
  }
}