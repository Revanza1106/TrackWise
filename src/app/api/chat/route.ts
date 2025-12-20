import { NextRequest, NextResponse } from 'next/server'
import { ChatService } from '@/services/chat-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { goalId, message } = body

    if (!goalId || !message) {
      return NextResponse.json(
        { error: 'Goal ID and message are required' },
        { status: 400 }
      )
    }

    const parsedGoalId = parseInt(goalId)
    if (isNaN(parsedGoalId) || parsedGoalId <= 0) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      )
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const result = await ChatService.sendMessage(parsedGoalId, message.trim())

    return NextResponse.json({
      success: true,
      response: result.response,
      conversationId: result.conversationId,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goalId')

    if (!goalId) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    const parsedGoalId = parseInt(goalId)
    if (isNaN(parsedGoalId) || parsedGoalId <= 0) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      )
    }

    const conversation = await ChatService.getOrCreateConversation(parsedGoalId)

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        messages: conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        })),
      },
    })

  } catch (error) {
    console.error('Chat GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load conversation' },
      { status: 500 }
    )
  }
}