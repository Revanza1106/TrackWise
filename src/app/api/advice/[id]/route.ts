import { NextRequest, NextResponse } from 'next/server'
import { getAIAdvice } from '@/app/actions/ai'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goalId = parseInt(params.id);
    const hasValidId = !isNaN(goalId) && goalId > 0;

    if (!hasValidId) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const context = searchParams.get('context') as 'dashboard' | 'goal_detail' | 'progress_logging' || 'dashboard';

    const advice = await getAIAdvice(goalId, context);
    return NextResponse.json(advice);

  } catch (error) {
    console.error('Advice API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate advice' },
      { status: 500 }
    );
  }
}