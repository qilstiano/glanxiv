import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { Paper } from '@/app/types';

// Define types for the Supabase response
interface SupabaseAuthor {
  author_order: number;
  authors: {
    name: string;
  };
}

interface SupabaseCategory {
  categories: {
    name: string;
  };
}

interface SupabasePaper {
  arxiv_id: string;
  title: string;
  abstract: string | null;
  pdf_url: string | null;
  published: string;
  primary_category: string | null;
  paper_authors: SupabaseAuthor[];
  paper_categories: SupabaseCategory[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const categoryParam = searchParams.get('category') || 'all';
    
    // Build the base query
    let query = supabase
      .from('papers')
      .select(`
        *,
        paper_authors (
          author_order,
          authors (name)
        ),
        paper_categories (
          categories (name)
        )
      `, { count: 'exact' });

    // Apply category filter if specified
    if (categoryParam !== 'all') {
      const categories = categoryParam.split(',').map(cat => cat.trim());
      
      const categoryConditions = categories.map(category => {
        if (category.endsWith('.all')) {
          // Handle .all pattern - match all subcategories
          const mainCategory = category.replace('.all', '');
          return `primary_category.ilike.${mainCategory}.%`;
        } else {
          // Exact category match
          return `primary_category.eq.${category}`;
        }
      });

      if (categoryConditions.length === 1) {
        query = query.or(categoryConditions[0]);
      } else {
        query = query.or(categoryConditions.join(','));
      }
    }

    // Apply pagination using range()
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    query = query
      .order('published', { ascending: false })
      .range(start, end);

    const { data: papersData, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Transform the data
    const transformedPapers: Paper[] = (papersData || []).map((paper: SupabasePaper) => {
      const authors = paper.paper_authors
        .sort((a: SupabaseAuthor, b: SupabaseAuthor) => a.author_order - b.author_order)
        .map((pa: SupabaseAuthor) => pa.authors.name);
      
      const categories = paper.paper_categories.map((pc: SupabaseCategory) => pc.categories.name);
      
      return {
        id: `http://arxiv.org/abs/${paper.arxiv_id}`,
        title: paper.title,
        authors,
        abstract: paper.abstract || '',
        pdf_url: paper.pdf_url || `http://arxiv.org/pdf/${paper.arxiv_id}`,
        published: paper.published,
        categories,
        primary_category: paper.primary_category || ''
      };
    });

    return NextResponse.json({
      papers: transformedPapers,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: end < (count || 0) - 1
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}