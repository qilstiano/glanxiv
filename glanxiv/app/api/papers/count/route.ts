import { NextResponse } from 'next/server';
import { loadPapers } from '../route';

export async function GET() {
  try {
    const papers = loadPapers();
    return NextResponse.json({ total: papers.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}