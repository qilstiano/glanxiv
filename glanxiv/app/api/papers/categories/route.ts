import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // Use a more efficient query with proper joins and counting
    const { data: categoryData, error } = await supabase
      .from('categories')
      .select(`
        id,
        name
      `);

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get counts for each category
    const categoriesWithCounts = await Promise.all(
      (categoryData || []).map(async (category) => {
        const { count } = await supabase
          .from('paper_categories')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);
        
        return {
          id: category.id,
          name: category.name,
          count: count || 0
        };
      })
    );

    // Filter out categories with no papers and sort by count
    const categories = categoriesWithCounts
      .filter(category => category.count > 0)
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ 
      categories,
      total: categories.reduce((sum, cat) => sum + cat.count, 0)
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}