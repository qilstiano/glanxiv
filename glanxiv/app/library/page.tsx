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
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalPapers, setTotalPapers] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

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

  // Fetch papers
  const fetchPapers = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        q: debouncedSearchTerm,
        category: selectedCategory
      });

      const response = await fetch(`/api/papers/search?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (reset) {
        setPapers(data.papers);
        setPage(1);
      } else {
        setPapers(prev => [...prev, ...data.papers]);
      }

      setHasMore(data.hasMore);
      setTotalPapers(data.total);
      setError(null);
    } catch (error) {
      console.error('Error fetching papers:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      if (reset) setPapers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearchTerm, selectedCategory]);

  useEffect(() => {
    setPage(1);
    fetchPapers(1, true);
  }, [debouncedSearchTerm, selectedCategory, fetchPapers]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPapers(nextPage, false);
  }, [page, fetchPapers]);

  if (loading && papers.length === 0) {
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
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <Box py={8} px={{ base: 4, md: 6 }} maxW="7xl" mx="auto">
        {papers.length > 0 && (
          <Text 
            color={isDark ? "gray.400" : "gray.500"} 
            fontSize="sm" 
            mb={4}
            fontFamily="var(--font-geist-mono)"
          >
            /showing {papers.length} of {totalPapers} papers
            {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </Text>
        )}

        <PapersGrid papers={papers} isDark={isDark} />

        {hasMore && (
          <Center mt={8}>
            <Button
              onClick={loadMore}
              loadingText="Loading more papers..."
              colorPalette="orange"
              variant="solid"
            >
              <ChevronDown />
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
          colorPalette="orange"
          borderRadius="full"
          size="md"
        ><ArrowUp /></IconButton>
      )}
    </Box>
  )
}
