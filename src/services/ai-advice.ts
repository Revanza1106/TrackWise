import OpenAI from 'openai';
import { AI_CONFIG, AIAdviceRequest, GoalInsight } from './ai-config';

export class AIAdviceService {
  private static openai: OpenAI | null = null;

  // Constants
  private static readonly MAX_ADVICE_LENGTH = 200;
  private static readonly DEFAULT_INSIGHTS = [
    'Keep making progress every day',
    'Consistency is key to success',
    'Small steps lead to big results'
  ];

  private static initializeOpenAI(): OpenAI {
    if (!this.openai && AI_CONFIG.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: AI_CONFIG.openaiApiKey
      });
    }

    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    return this.openai;
  }

  static async generateGoalAdvice(request: AIAdviceRequest): Promise<GoalInsight[]> {
    try {
      const hasValidGoal = request.goal && request.goal.title;
      if (!hasValidGoal) {
        throw new Error('Invalid goal data provided');
      }

      const hasApiKey = !!AI_CONFIG.openaiApiKey;
      if (!hasApiKey) {
        return this.getDefaultInsights();
      }

      const openai = this.initializeOpenAI();
      const advice = await this.callOpenAI(openai, request);
      return this.parseAdviceResponse(advice);

    } catch (error) {
      console.error('AI advice generation failed:', error);
      return this.getDefaultInsights();
    }
  }

  private static async callOpenAI(openai: OpenAI, request: AIAdviceRequest): Promise<string> {
    const prompt = this.buildPrompt(request);
    const hasValidPrompt = prompt.length > 0;

    if (!hasValidPrompt) {
      throw new Error('Failed to build valid prompt');
    }

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful learning coach. Provide concise, actionable advice in 2-3 sentences maximum.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature
    });

    const response = completion.choices[0]?.message?.content;
    const hasValidResponse = response && response.length > 0;

    if (!hasValidResponse) {
      throw new Error('Invalid response from OpenAI');
    }

    return response;
  }

  private static buildPrompt(request: AIAdviceRequest): string {
    const { goal, context } = request;
    const progressData = this.formatProgressData(goal);

    const contextSpecificPrompts = {
      dashboard: 'Provide general advice for this learning goal',
      goal_detail: 'Give specific advice based on their progress',
      progress_logging: 'Suggest next steps for their learning journey'
    };

    const prompt = contextSpecificPrompts[context] || contextSpecificPrompts.dashboard;

    return `
${prompt}

Goal: ${goal.title}
Description: ${goal.description || 'No description'}
Status: ${goal.status}
Progress: ${goal.progressCount} entries, ${goal.totalHours} hours
Recent activity: ${progressData}

Provide 2-3 specific, actionable tips.
    `.trim();
  }

  private static formatProgressData(goal: any): string {
    const hasRecentProgress = goal.progress && goal.progress.length > 0;
    if (!hasRecentProgress) {
      return 'No recent progress';
    }

    const recentEntries = goal.progress.slice(-3);
    return recentEntries.map((p: any) =>
      `${new Date(p.date).toLocaleDateString()}: ${p.note.substring(0, 50)}...`
    ).join('\n');
  }

  private static parseAdviceResponse(advice: string): GoalInsight[] {
    const hasValidAdvice = advice && advice.trim().length > 0;
    if (!hasValidAdvice) {
      return this.getDefaultInsights();
    }

    const adviceLines = advice.split('\n').filter(line => line.trim().length > 0);
    const insights: GoalInsight[] = [];

    adviceLines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const hasContent = trimmedLine.length > 0;

      if (hasContent) {
        insights.push({
          id: `ai-advice-${Date.now()}-${index}`,
          type: 'advice',
          title: 'AI Coach Advice',
          content: trimmedLine.substring(0, this.MAX_ADVICE_LENGTH),
          priority: index === 0 ? 'high' : 'medium',
          createdAt: new Date()
        });
      }
    });

    const hasInsights = insights.length > 0;
    return hasInsights ? insights : this.getDefaultInsights();
  }

  private static getDefaultInsights(): GoalInsight[] {
    return this.DEFAULT_INSIGHTS.map((insight, index) => ({
      id: `default-insight-${index}`,
      type: 'motivation',
      title: 'Learning Tip',
      content: insight,
      priority: 'medium',
      createdAt: new Date()
    }));
  }

  static async generateProgressSummary(goal: any): Promise<string> {
    try {
      const hasValidGoal = goal && goal.title;
      if (!hasValidGoal) {
        throw new Error('Invalid goal data');
      }

      const hasApiKey = !!AI_CONFIG.openaiApiKey;
      if (!hasApiKey) {
        return this.getDefaultSummary(goal);
      }

      const openai = this.initializeOpenAI();
      const summary = await this.callOpenAISummary(openai, goal);
      return summary;

    } catch (error) {
      console.error('Progress summary generation failed:', error);
      return this.getDefaultSummary(goal);
    }
  }

  private static async callOpenAISummary(openai: OpenAI, goal: any): Promise<string> {
    const prompt = `
Summarize this learning progress in one sentence:

Goal: ${goal.title}
Progress: ${goal.progressCount || 0} entries, ${goal.totalHours || 0} hours
Status: ${goal.status || 'active'}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'You are a progress analyst. Provide concise, encouraging summaries in one sentence.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    });

    const response = completion.choices[0]?.message?.content?.trim();
    return response || this.getDefaultSummary(goal);
  }

  private static getDefaultSummary(goal: any): string {
    const progressCount = goal.progressCount || 0;
    const totalHours = goal.totalHours || 0;

    if (progressCount === 0) {
      return `Ready to start learning ${goal.title}`;
    }

    if (progressCount < 5) {
      return `Beginning your journey with ${goal.title}`;
    }

    return `Made ${progressCount} entries and spent ${totalHours} hours on ${goal.title}`;
  }
}