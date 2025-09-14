'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
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

// Batch size configuration
const BATCH_SIZE = 1000;
const BATCH_DELAY_MS = 100; // Delay between batches in milliseconds

export default function Library() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [allPapers, setAllPapers] = useState<Paper[]>([]) // Store all fetched papers
  const [loading, setLoading] = useState(true)
  const [batchLoading, setBatchLoading] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)
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

        setAllPapers(validatedData);
        setError(null);
        
        // Preprocess and cache all papers for search
        processedPapersCache = validatedData.map(preprocessPaper);
        
        // Start batch loading
        setBatchLoading(true);
        
      } catch (error) {
        console.error('Error fetching papers:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setAllPapers(sampleData);
        setPapers(sampleData);
        processedPapersCache = sampleData.map(preprocessPaper);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Batch loading effect
  useEffect(() => {
    if (!batchLoading || allPapers.length === 0) return;

    const loadNextBatch = () => {
      const nextBatchEnd = Math.min(loadedCount + BATCH_SIZE, allPapers.length);
      const nextBatch = allPapers.slice(loadedCount, nextBatchEnd);
      
      setPapers(prev => [...prev, ...nextBatch]);
      setLoadedCount(nextBatchEnd);

      if (nextBatchEnd >= allPapers.length) {
        setBatchLoading(false);
        setLoading(false);
      }
    };

    // Load first batch immediately
    if (loadedCount === 0) {
      loadNextBatch();
      return;
    }

    // Load subsequent batches with delay
    const timer = setTimeout(loadNextBatch, BATCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [batchLoading, allPapers, loadedCount]);

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
    
    // If no filters, return currently loaded papers
    if (!shouldFilterBySearch && !shouldFilterByCategory) {
      return papers;
    }
    
    const results: Paper[] = [];
    
    // Optimized filtering with early exits - only search through loaded papers
    const loadedProcessedPapers = processedPapersCache.slice(0, loadedCount);
    
    for (const paper of loadedProcessedPapers) {
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
  }, [papers, searchTerm, selectedCategory, matchesSearch, matchesCategory, loadedCount]);

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

  // Show loading spinner only during initial fetch, not during batch loading
  if (loading && loadedCount === 0) {
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
        {/* Show batch loading progress if still loading */}
        {batchLoading && (
          <Box 
            position="sticky" 
            top={0} 
            zIndex={10} 
            bg={isDark ? "gray.800" : "white"} 
            p={2} 
            mb={4}
            borderRadius="md"
            textAlign="center"
            fontSize="sm"
            color={isDark ? "gray.300" : "gray.600"}
          >
            Loading papers... {loadedCount} / {allPapers.length}
            <Spinner/>
          </Box>
        )}
        <PapersGrid papers={filteredPapers} isDark={isDark} />
      </Box>
      <Footer isDark={isDark}/>
    </Box>
  )
}