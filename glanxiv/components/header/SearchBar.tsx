'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  Flex,
  Input,
  IconButton,
  HStack,
  Tag,
  Box,
  Text,
  Kbd,
} from '@chakra-ui/react';
import { LuSearch, LuInfo } from "react-icons/lu";
import { mainCategories } from '../data/categories';

interface SearchBarProps {
  isDark: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSubmit: () => void;
  selectedCategories: string[];
  onRemoveCategory: (category: string) => void;
  onSetCategories: (categories: string[]) => void;
  isMobile?: boolean;
  isScrolled?: boolean;
  onFocus?: () => void;
}

interface SearchHistoryItem {
  term: string;
  categories: string[];
  timestamp: number;
}

function SearchBar({
  isDark,
  searchTerm,
  onSearchChange,
  onSubmit,
  selectedCategories,
  onRemoveCategory,
  onSetCategories,
  isMobile = false,
  isScrolled = false,
  onFocus
}: SearchBarProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showTooltip, setShowTooltip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Add current search to history when submitted
  const handleSubmit = () => {
    if (searchTerm.trim() || selectedCategories.length > 0) {
      // Check if this exact search already exists in history
      const existingIndex = searchHistory.findIndex(item => 
        item.term === searchTerm && 
        JSON.stringify(item.categories) === JSON.stringify(selectedCategories)
      );
      
      let updatedHistory;
      if (existingIndex !== -1) {
        // Move existing item to the front
        updatedHistory = [
          searchHistory[existingIndex],
          ...searchHistory.filter((_, index) => index !== existingIndex)
        ].slice(0, 5);
      } else {
        // Add new item to the front
        const newSearch: SearchHistoryItem = {
          term: searchTerm,
          categories: [...selectedCategories],
          timestamp: Date.now()
        };
        updatedHistory = [newSearch, ...searchHistory].slice(0, 5);
      }
      
      setSearchHistory(updatedHistory);
    }
    
    onSubmit();
    setHistoryIndex(-1);
  };

  // Handle keyboard navigation for search history
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && selectedCategories.length > 0) {
      // Remove the last category when backspace is pressed on empty input
      const lastCategory = selectedCategories[selectedCategories.length - 1];
      onRemoveCategory(lastCategory);
    } else if (e.key === 'Enter') {
      // Submit on Enter key
      handleSubmit();
    } else if (e.key === 'ArrowUp' && searchHistory.length > 0) {
      e.preventDefault();
      // Navigate to previous search history item
      let newIndex;
      if (historyIndex === -1) {
        // Starting from current search, go to the most recent history item
        newIndex = 0;
      } else {
        newIndex = historyIndex < searchHistory.length - 1 ? historyIndex + 1 : 0;
      }
      setHistoryIndex(newIndex);
      
      // Restore both search term and categories from history
      const historyItem = searchHistory[newIndex];
      onSearchChange(historyItem.term);
      onSetCategories([...historyItem.categories]);
      
    } else if (e.key === 'ArrowDown' && searchHistory.length > 0) {
      e.preventDefault();
      // Navigate to next search history item
      let newIndex;
      if (historyIndex === -1) {
        // Starting from current search, go to the oldest history item
        newIndex = searchHistory.length - 1;
      } else {
        newIndex = historyIndex > 0 ? historyIndex - 1 : searchHistory.length - 1;
      }
      setHistoryIndex(newIndex);
      
      // Restore both search term and categories from history
      const historyItem = searchHistory[newIndex];
      onSearchChange(historyItem.term);
      onSetCategories([...historyItem.categories]);
    }
  };

  const handleInfoMouseEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(true);
  };

  const handleInfoMouseLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 300);
  };

  const handleTooltipMouseEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 300);
  };

  return (
    <Box position="relative" width="full">
      <Flex 
        align="center" 
        position="relative" 
        width="full" 
        className="search-container"
        borderRadius="full"
        borderWidth="1px"
        borderColor={isDark ? "gray.600" : "gray.300"}
        _hover={{ borderColor: isDark ? "gray.500" : "gray.400" }}
        _focusWithin={{ 
          borderColor: isDark ? "blue.400" : "blue.500", 
          boxShadow: "none" 
        }}
        bg={isDark ? "gray.800" : "gray.50"}
        pl={selectedCategories.length > 0 ? 2 : 4}
        pr={10}
        py={1}
        gap={2}
      >
        {/* Category pills */}
        {selectedCategories.length > 0 && (
          <HStack
            gap={1}
            maxWidth="50%"
            overflowX="auto"
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {selectedCategories.map((category) => {
              return (
                <Tag.Root
                  key={category}
                  size="sm"
                  variant="solid"
                  colorPalette="orange"
                  borderRadius="full"
                  flexShrink={0}
                >
                  <Tag.Label>#{category}</Tag.Label> {/* Just use the category directly */}
                  <Tag.EndElement>
                    <Tag.CloseTrigger 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCategory(category);
                      }}
                    />
                  </Tag.EndElement>
                </Tag.Root>
              );
            })}
          </HStack>
        )}
        
        <Input 
          ref={inputRef}
          placeholder={selectedCategories.length > 0 ? "" : "Search by category or papers..."}
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setHistoryIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (onFocus) onFocus();
          }}
          variant="flushed"
          size={isMobile ? "sm" : "md"}
          color={isDark ? "white" : "gray.900"}
          _placeholder={{ color: isDark ? "gray.400" : "gray.500" }}
          flex={1}
          minW="100px"
        />
        
        <IconButton
          aria-label="Search papers"
          position="absolute"
          right={1}
          color={isDark ? "gray.400" : "gray.500"}
          borderRadius="full"
          size={isMobile ? "xs" : "sm"}
          fontSize={isMobile ? "14px" : "16px"}
          _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
          bg="transparent"
          onClick={handleSubmit}
        >
          <LuSearch />
        </IconButton>
        
        {/* Info icon with tooltip */}
        <Box
          position="absolute"
          right={isMobile ? 8 : 10}
          color={isDark ? "gray.500" : "gray.400"}
          _hover={{ color: isDark ? "gray.300" : "gray.600" }}
          cursor="help"
          onMouseEnter={handleInfoMouseEnter}
          onMouseLeave={handleInfoMouseLeave}
        >
          <LuInfo size={isMobile ? 14 : 16} />
        </Box>
      </Flex>
      
      {/* Tooltip content */}
      {showTooltip && (
        <Box
          position="absolute"
          top="100%"
          right={0}
          mt={2}
          width="280px"
          bg={isDark ? "gray.700" : "white"}
          borderWidth="1px"
          borderColor={isDark ? "gray.600" : "gray.200"}
          borderRadius="md"
          boxShadow="md"
          p={3}
          zIndex={1001}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Search Tips
          </Text>

          <Text fontSize="xs" mb={1}>
            • Use # to filter by categories (e.g., #physics) and press <Kbd>Enter</Kbd>
          </Text>

          <Text fontSize="xs" mb={1}>
            • Alternatively, use the selectors below to filter
          </Text>

          <Text fontSize="xs" mb={1}>
            • Press <Kbd>Backspace</Kbd> to remove categories or use the <Kbd>x</Kbd>
          </Text>

          <Text fontSize="xs" mb={1}>
            • Press <Kbd>Enter</Kbd> to search
          </Text>

          {!isMobile && (
            <Text fontSize="xs" mb={1}>
              • Use <Kbd>↑</Kbd> and <Kbd>↓</Kbd> arrows to cycle through search history
            </Text>
          )}

          <Text fontSize="xs">
            • Combine categories with keywords for precise results
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default SearchBar;