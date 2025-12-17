import { NextRequest, NextResponse } from 'next/server'
import { getProgressAnalysis } from '@/app/actions/ai'

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

    const analysis = await getProgressAnalysis(goalId);
    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}