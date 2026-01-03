import { AI_CONFIG } from './ai-config'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: AI_CONFIG.openaiApiKey,
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface ChatContext {
  goal: {
    id: number
    title: string
    description?: string
    status: string
    progress: Array<{
      date: Date
      note: string
      hours?: number
    }>
    totalHours: number
    progressCount: number
  }
  conversationHistory?: ChatMessage[]
}

interface ConversationHistory {
  role: string
  content: unknown
  createdAt: unknown
}

export class ChatService {
  static async createConversation(goalId: number, title: string) {
    return await prisma.conversation.create({
      data: {
        goalId,
        title,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  static async getConversation(conversationId: number) {
    return await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  static async getOrCreateConversation(goalId: number) {
    let conversation = await prisma.conversation.findFirst({
      where: { goalId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (!conversation) {
      conversation = await this.createConversation(
        goalId,
        `Learning Coach: ${goalId}`
      )
    }

    return conversation
  }

  static async saveMessage(
    conversationId: number,
    role: 'user' | 'assistant',
    content: string
  ) {
    return await prisma.chatMessage.create({
      data: {
        conversationId,
        role,
        content,
      },
    })
  }

  static buildSystemPrompt(context: ChatContext): string {
    const { goal } = context

    const recentProgress = goal.progress.slice(-5).map(p =>
      `- ${new Date(p.date).toLocaleDateString()}: ${p.note}${p.hours ? ` (${p.hours} hours)` : ''}`
    ).join('\n')

    return `You are an expert learning coach and AI tutor for TrackWise. Your role is to help users analyze their learning progress, provide personalized advice, and keep them motivated.

Current Goal Context:
- Goal: ${goal.title}
- Description: ${goal.description || 'No description'}
- Status: ${goal.status}
- Total progress entries: ${goal.progressCount}
- Total hours invested: ${goal.totalHours}

Recent Progress:
${recentProgress || 'No recent progress entries'}

Your capabilities:
1. Analyze learning patterns and progress trends
2. Provide personalized study recommendations
3. Offer motivational support and encouragement
4. Suggest learning strategies based on their progress
5. Help them overcome learning obstacles
6. Create actionable next steps

Guidelines:
- Be encouraging and supportive
- Provide specific, actionable advice
- Reference their actual progress data
- Ask follow-up questions to understand their challenges
- Keep responses concise but thorough
- Focus on practical solutions

Respond naturally as a learning coach would.`
  }

  static async generateResponse(
    userMessage: string,
    context: ChatContext
  ): Promise<string> {
    if (!AI_CONFIG.openaiApiKey) {
      return "I'm sorry, AI features are not available. Please add an OpenAI API key to your environment variables."
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context)

      const messages: any[] = [
        { role: 'system', content: systemPrompt },
      ]

      if (context.conversationHistory) {
        context.conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content,
          })
        })
      }

      messages.push({
        role: 'user',
        content: userMessage,
      })

      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      })

      return response.choices[0]?.message?.content || "I'm having trouble generating a response. Please try again."
    } catch (error) {
      return "I'm experiencing some technical difficulties. Please try again later."
    }
  }

  static async sendMessage(
    goalId: number,
    userMessage: string
  ): Promise<{ response: string; conversationId: number }> {
    const conversation = await this.getOrCreateConversation(goalId)

    await this.saveMessage(conversation.id, 'user', userMessage)

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        progress: {
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    const context: ChatContext = {
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description || undefined,
        status: goal.status,
        progress: goal.progress.map(p => ({
          date: p.date,
          note: p.note,
          hours: p.hours ?? undefined,
        })),
        totalHours: goal.progress.reduce((sum, p) => sum + (p.hours || 0), 0),
        progressCount: goal.progress.length,
      },
      conversationHistory: conversation.messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: String(msg.content),
        createdAt: new Date(msg.createdAt),
      })),
    }

    const response = await this.generateResponse(userMessage, context)

    await this.saveMessage(conversation.id, 'assistant', response)

    return {
      response,
      conversationId: conversation.id,
    }
  }
}