export interface AIConfig {
  openaiApiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const AI_CONFIG: AIConfig = {
  model: 'gpt-3.5-turbo',
  maxTokens: 500,
  temperature: 0.7,
  openaiApiKey: process.env.OPENAI_API_KEY,
};

export interface GoalInsight {
  id: string;
  type: 'advice' | 'progress_analysis' | 'motivation' | 'recommendation';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface ProgressAnalysis {
  percentage: number;
  trend: 'improving' | 'stable' | 'declining' | 'no_data';
  consistency: number;
  estimatedCompletion?: Date;
  insights: string[];
  recommendations: string[];
}

export interface AIAdviceRequest {
  goal: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    progress: Array<{
      date: Date;
      note: string;
      hours?: number;
    }>;
    totalHours: number;
    progressCount: number;
  };
  context: 'dashboard' | 'goal_detail' | 'progress_logging';
  userPreferences?: {
    adviceStyle: 'motivational' | 'analytical' | 'practical';
    focusAreas: string[];
  };
}