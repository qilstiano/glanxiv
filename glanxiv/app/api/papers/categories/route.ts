import { NextResponse } from 'next/server';
import { loadPapers } from '../route';

export async function GET() {
  try {
    const papers = loadPapers();
    const categoryCounts: Record<string, number> = {};
    
    papers.forEach(paper => {
      // Count all categories
      paper.categories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      
      // Count primary category
      if (paper.primary_category) {
        categoryCounts[paper.primary_category] = (categoryCounts[paper.primary_category] || 0) + 1;
      }
    });

    // Convert to array and sort by count
    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ categories });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}