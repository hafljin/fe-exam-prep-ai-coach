import { NextResponse } from 'next/server';
import { getRandomProblem } from '@/lib/content';

export async function GET() {
  try {
    const problem = await getRandomProblem();
    if (!problem) {
      return NextResponse.json({ error: 'No problems found' }, { status: 404 });
    }
    return NextResponse.json(problem);
  } catch (error) {
    console.error('Failed to get random problem:', error);
    return NextResponse.json({ error: 'Failed to get random problem' }, { status: 500 });
  }
}

