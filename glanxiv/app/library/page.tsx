'use client'

import { useState, useEffect, useCallback } from 'react'
import { Box, Button, Center, Text, IconButton } from '@chakra-ui/react'
import Header from '../../components/header/Header'
import ErrorDisplay from '../../components/ErrorDisplay'
import PapersGrid from '../../components/PapersGrid'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Paper } from '../types'
import Footer from '@/components/Footer'
import { ChevronDown, ArrowUp } from 'lucide-react'

export default function Library() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalPapers, setTotalPapers] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Handle search submission (on Enter)
  const handleSearchSubmit = useCallback((term: string) => {
    setSubmittedSearchTerm(term);
    setPage(1);
  }, []);

  // Show scroll-to-top button when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle category changes from Header
  const handleCategoryChange = useCallback((category: string) => {
    if (category === 'all') {
      setSelectedCategories([]);
      return;
    }
    
    // Toggle category selection
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  // Helper function to format category for API request
  const formatCategoryForAPI = (category: string): string => {
    // Main categories that should use .all pattern
    const mainCategories = ['cs', 'math', 'physics', 'stat', 'eess', 'q-bio', 'q-fin'];
    
    const categoryLower = category.toLowerCase();
    if (mainCategories.includes(categoryLower)) {
      return `${categoryLower}.all`;
    }
    return category;
  };

  // Helper function to format category for display
  const formatCategoryForDisplay = (category: string): string => {
    if (category.endsWith('.all')) {
      return `${category.replace('.all', '')}.*`;
    }
    return category;
  };

  // Fetch papers with proper API endpoint selection
  const fetchPapers = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
      setIsInitialLoad(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12'
      });

      let endpoint = '/api/papers';
      
      // Use search endpoint only when there's a search term
      if (submittedSearchTerm) {
        endpoint = '/api/papers/search';
        params.append('q', submittedSearchTerm);
      }

      // Add category filter if specified
      if (selectedCategories.length > 0) {
        // Convert main categories to .all pattern for API
        const categoryParam = selectedCategories
          .map(formatCategoryForAPI)
          .join(',');
        params.append('category', categoryParam);
      }

      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (reset) {
        setPapers(data.papers);
        setPage(1);
        setIsInitialLoad(false);
      } else {
        setPapers(prev => [...prev, ...data.papers]);
      }

      setHasMore(data.hasMore);
      setTotalPapers(data.total);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching papers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      // Fallback to main endpoint if specialized endpoints fail
      try {
        const fallbackParams = new URLSearchParams({
          page: '1',
          limit: '12'
        });
        
        const fallbackResponse = await fetch(`/api/papers?${fallbackParams}`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setPapers(fallbackData.papers);
          setHasMore(fallbackData.hasMore);
          setTotalPapers(fallbackData.total);
          setError(null);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      if (reset) {
        setPapers([]);
        setIsInitialLoad(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [submittedSearchTerm, selectedCategories]);

  // Reset and fetch when search or categories change
  useEffect(() => {
    fetchPapers(1, true);
  }, [submittedSearchTerm, selectedCategories, fetchPapers]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPapers(nextPage, false);
  }, [page, fetchPapers]);

  // Calculate display text for showing papers count
  const getDisplayText = () => {
    if (loading && isInitialLoad) return '/loading papers...';
    
    if (papers.length === 0) {
      return '/no papers found';
    }

    let text = `/showing ${papers.length}`;
    
    if (totalPapers > 0 && totalPapers > papers.length) {
      text += ` of ${totalPapers.toLocaleString()} papers`;
    } else {
      text += ' papers';
    }

    if (submittedSearchTerm) {
      text += ` for "${submittedSearchTerm}"`;
    }

    if (selectedCategories.length > 0) {
      text += ` in ${selectedCategories.join(', ')}`;
    }

    return text;
  };

  if (isInitialLoad && loading) {
    return <LoadingSpinner />;
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
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
      />
      
      <Box py={8} px={{ base: 4, md: 6 }} maxW="7xl" mx="auto">
        {papers.length > 0 && (
          <Text 
            color={isDark ? "gray.400" : "gray.500"} 
            fontSize="sm" 
            mb={4}
            fontFamily="var(--font-geist-mono)"
          >
            {getDisplayText()}
          </Text>
        )}

        <PapersGrid papers={papers} isDark={isDark} />

        {hasMore && (
          <Center mt={8}>
            <Button
              onClick={loadMore}
              loading={loadingMore}
              loadingText="Loading more papers..."
              colorScheme="orange"
              variant="solid"
            >
              <ChevronDown size={20} />
              Load More Papers
            </Button>
          </Center>
        )}

        {!loading && papers.length === 0 && (
          <Center py={12}>
            <Text color={isDark ? "gray.400" : "gray.500"} fontSize="lg">
              No papers found. Try a different search term or category.
            </Text>
          </Center>
        )}
      </Box>
      <Footer isDark={isDark}/>

      {/* Sticky Scroll-to-Top Button */}
      {showScrollTop && (
        <IconButton
          aria-label="Scroll to top"
          onClick={scrollToTop}
          position="fixed"
          bottom="4"
          right="4"
          colorScheme="orange"
          borderRadius="full"
          size="md"
        >
          <ArrowUp size={20} />
        </IconButton>
      )}
    </Box>
  )
}