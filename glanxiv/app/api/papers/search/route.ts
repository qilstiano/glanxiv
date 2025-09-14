import { NextRequest, NextResponse } from 'next/server';
import { loadPapers } from '../route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    console.log('Search params:', { searchTerm, category: categoryParam, page, limit });
    
    const papers = loadPapers();
    console.log('Total papers loaded:', papers.length);

    let filteredPapers = papers;

    // Apply filters only if needed
    if (searchTerm || categoryParam !== 'all') {
      const searchTermLower = searchTerm.toLowerCase();
      
      // Parse multiple categories (comma-separated)
      const categories = categoryParam !== 'all' 
        ? categoryParam.split(',').map(cat => cat.trim().toLowerCase())
        : [];
      
      filteredPapers = papers.filter(paper => {
        let include = true;
        
        // Apply search filter
        if (searchTerm) {
          const paperLower = {
            title: paper.title.toLowerCase(),
            abstract: paper.abstract.toLowerCase(),
            authors: paper.authors.map(a => a.toLowerCase())
          };
          
          include = paperLower.title.includes(searchTermLower) ||
                   paperLower.abstract.includes(searchTermLower) ||
                   paperLower.authors.some(author => author.includes(searchTermLower));
        }
        
        // Apply category filter (multiple categories)
        if (include && categories.length > 0) {
          const paperCategories = [
            ...paper.categories.map(c => c.toLowerCase()),
            paper.primary_category?.toLowerCase() || ''
          ];
          
          // Check if paper matches ANY of the requested categories
          include = categories.some(categoryToCheck => {
            return paperCategories.some(paperCat => {
              // Exact match
              if (paperCat === categoryToCheck) return true;
              
              // Handle subcategories (e.g., "cs.AI" should match "cs.AI" and "cs.AI.*")
              if (categoryToCheck.includes('.')) {
                return paperCat.startsWith(categoryToCheck);
              }
              
              // Handle main categories (e.g., "cs" should match "cs.*")
              return paperCat.startsWith(categoryToCheck + '.');
            });
          });
        }
        
        return include;
      });
    }

    console.log('Filtered papers count:', filteredPapers.length);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPapers = filteredPapers.slice(startIndex, endIndex);

    return NextResponse.json({
      papers: paginatedPapers,
      total: filteredPapers.length,
      page,
      totalPages: Math.ceil(filteredPapers.length / limit),
      hasMore: endIndex < filteredPapers.length
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to process search request'
      }, 
      { status: 500 }
    );
  }
}