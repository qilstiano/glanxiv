import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Paper } from '@/app/types';

// Cache for papers
let allPapersCache: Paper[] = [];
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const loadPapers = (): Paper[] => {
  const now = Date.now();
  if (allPapersCache.length > 0 && now - lastCacheUpdate < CACHE_TTL) {
    return allPapersCache;
  }

  try {
    const dailyDir = path.join(process.cwd(), 'scraping', 'daily');
    if (!fs.existsSync(dailyDir)) {
      console.log('Daily folder not found');
      return [];
    }

    const files = fs.readdirSync(dailyDir).filter(f => f.endsWith('.json'));
    const allPapers: Paper[] = [];

    for (const file of files) {
      const filePath = path.join(dailyDir, file);
      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(fileData);
        allPapers.push(...json);
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e);
      }
    }

    // Sort by date (newest first)
    allPapers.sort((a, b) => {
      return new Date(b.published).getTime() - new Date(a.published).getTime();
    });

    // Validate papers
    const validatedData = allPapers.map((paper: Paper) => ({
      id: paper.id || Math.random().toString(36).substr(2, 9),
      title: paper.title || 'No title',
      authors: paper.authors || [],
      abstract: paper.abstract || '',
      pdf_url: paper.pdf_url || '',
      published: paper.published || new Date().toISOString(),
      categories: paper.categories || [],
      primary_category: paper.primary_category || ''
    }));

    allPapersCache = validatedData;
    lastCacheUpdate = now;
    console.log(`Loaded ${validatedData.length} papers`);

    return validatedData;
  } catch (error) {
    console.error('Error loading papers:', error);
    return [];
  }
};

// Simple search and category functions for basic use
export const matchesSearch = (paper: Paper, term: string): boolean => {
  if (!term) return true;
  
  const termLower = term.toLowerCase();
  const titleLower = paper.title.toLowerCase();
  const abstractLower = paper.abstract.toLowerCase();
  const authorsLower = paper.authors.map(author => author.toLowerCase());
  
  return titleLower.includes(termLower) ||
         abstractLower.includes(termLower) ||
         authorsLower.some(author => author.includes(termLower));
};

export const matchesCategory = (paper: Paper, category: string): boolean => {
  if (category === 'all') return true;
  
  const categoryLower = category.toLowerCase();
  const paperCategories = [
    ...paper.categories.map(c => c.toLowerCase()),
    paper.primary_category?.toLowerCase() || ''
  ];
  
  return paperCategories.some(paperCat => 
    paperCat === categoryLower || paperCat.startsWith(categoryLower + '.')
  );
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    const papers = loadPapers();
    
    // Basic pagination without filtering
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPapers = papers.slice(startIndex, endIndex);
    
    return NextResponse.json({
      papers: paginatedPapers,
      total: papers.length,
      page,
      totalPages: Math.ceil(papers.length / limit),
      hasMore: endIndex < papers.length
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}