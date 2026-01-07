import { NextResponse } from 'next/server';
import { getProblems } from '@/lib/content';

export async function GET() {
  try {
    const problems = await getProblems();
    return NextResponse.json(problems);
  } catch (error) {
    console.error('Failed to load problems:', error);
    return NextResponse.json({ error: 'Failed to load problems' }, { status: 500 });
  }
}

