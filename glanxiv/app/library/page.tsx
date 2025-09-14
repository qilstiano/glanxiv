'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Box } from '@chakra-ui/react'
import Header from '../../components/header/Header'
import ErrorDisplay from '../../components/ErrorDisplay'
import PapersGrid from '../../components/PapersGrid'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Paper } from '../types'
import Footer from '@/components/Footer'

// Sample data fallback
const sampleData: Paper[] = []

// Precompute lowercase versions and search indexes
const preprocessPaper = (paper: Paper) => ({
  ...paper,
  _searchData: {
    titleLower: paper.title.toLowerCase(),
    abstractLower: paper.abstract.toLowerCase(),
    authorsLower: paper.authors.map(author => author.toLowerCase()),
    categoriesLower: paper.categories.map(cat => cat.toLowerCase()),
    primaryCategoryLower: paper.primary_category?.toLowerCase() || ''
  }
});

// Cache for processed papers
let processedPapersCache: ReturnType<typeof preprocessPaper>[] = [];

export default function Library() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/papers');
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        
        const data: Paper[] = await response.json();
        console.log('Fetched papers:', data.length);

        const validatedData = data.map((paper: Paper) => ({
          id: paper.id || '',
          title: paper.title || '',
          authors: paper.authors || [],
          abstract: paper.abstract || '',
          pdf_url: paper.pdf_url || '',
          published: paper.published || '',
          categories: paper.categories || [],
          primary_category: paper.primary_category || ''
        }));

        setPapers(validatedData);
        setError(null);
        
        // Preprocess and cache papers for search
        processedPapersCache = validatedData.map(preprocessPaper);
        
      } catch (error) {
        console.error('Error fetching papers:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setPapers(sampleData);
        processedPapersCache = sampleData.map(preprocessPaper);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoized search function
  const matchesSearch = useCallback((paper: ReturnType<typeof preprocessPaper>, term: string): boolean => {
    if (!term) return true;
    
    const termLower = term.toLowerCase();
    
    // Check title first (most common search)
    if (paper._searchData.titleLower.includes(termLower)) {
      return true;
    }
    
    // Check authors
    for (const author of paper._searchData.authorsLower) {
      if (author.includes(termLower)) {
        return true;
      }
    }
    
    // Check abstract last (most expensive)
    return paper._searchData.abstractLower.includes(termLower);
  }, []);

  // Memoized category matching function
  const matchesCategory = useCallback((paper: ReturnType<typeof preprocessPaper>, category: string): boolean => {
    if (category === 'all') return true;
    
    const categories = category.split(',').map(cat => cat.trim().toLowerCase());
    
    return categories.some(cat => {
      // Handle .all variants
      if (cat.endsWith('.all')) {
        const baseCategory = cat.replace('.all', '');
        return paper._searchData.categoriesLower.some(category => 
          category.startsWith(baseCategory + '.')
        ) || paper._searchData.primaryCategoryLower.startsWith(baseCategory + '.');
      }
      
      // Handle main categories
      const mainCategories = ['cs', 'math', 'physics', 'eess', 'econ', 'q-bio', 'q-fin', 'stat'];
      if (mainCategories.includes(cat)) {
        return paper._searchData.categoriesLower.some(category => 
          category.startsWith(cat + '.')
        ) || paper._searchData.primaryCategoryLower.startsWith(cat + '.');
      }
      
      // Exact match
      return paper._searchData.categoriesLower.includes(cat) || 
             paper._searchData.primaryCategoryLower === cat;
    });
  }, []);

  // Memoized filtered papers with optimized search
  const filteredPapers = useMemo(() => {
    if (!processedPapersCache.length) return [];
    
    const searchTermLower = searchTerm.toLowerCase();
    const shouldFilterBySearch = searchTermLower.length > 0;
    const shouldFilterByCategory = selectedCategory !== 'all';
    
    // If no filters, return all papers
    if (!shouldFilterBySearch && !shouldFilterByCategory) {
      return processedPapersCache.map(paper => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        pdf_url: paper.pdf_url,
        published: paper.published,
        categories: paper.categories,
        primary_category: paper.primary_category
      }));
    }
    
    const results: Paper[] = [];
    
    // Optimized filtering with early exits
    for (const paper of processedPapersCache) {
      let include = true;
      
      // Apply search filter first (more selective)
      if (shouldFilterBySearch && !matchesSearch(paper, searchTermLower)) {
        include = false;
      }
      
      // Then apply category filter
      if (include && shouldFilterByCategory && !matchesCategory(paper, selectedCategory)) {
        include = false;
      }
      
      if (include) {
        results.push({
          id: paper.id,
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          pdf_url: paper.pdf_url,
          published: paper.published,
          categories: paper.categories,
          primary_category: paper.primary_category
        });
      }
    }
    
    return results;
  }, [papers, searchTerm, selectedCategory, matchesSearch, matchesCategory]);

  // Debounced search to avoid too many re-renders
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Box 
      minH="100vh" 
      bg={isDark ? "gray.900" : "gray.50"}
      color={isDark ? "white" : "gray.900"}
      fontFamily="var(--font-geist)"
      transition="all 0.3s ease"
    >
      <ErrorDisplay error={error} />
      <Header 
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <Box py={8} px={{ base: 4, md: 6 }} maxW="7xl" mx="auto">
        <PapersGrid papers={filteredPapers} isDark={isDark} />
      </Box>
      <Footer isDark={isDark}/>
    </Box>
  )
}