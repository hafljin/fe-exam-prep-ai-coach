import { NextResponse } from 'next/server';
import { getProblem } from '@/lib/content';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const problem = await getProblem(resolvedParams.id);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    return NextResponse.json(problem);
  } catch (error) {
    console.error('Failed to load problem:', error);
    return NextResponse.json({ error: 'Failed to load problem' }, { status: 500 });
  }
}

