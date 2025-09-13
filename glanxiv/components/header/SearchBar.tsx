'use client'

import React from 'react';
import {
  Flex,
  Input,
  IconButton,
  HStack,
  Tag,
} from '@chakra-ui/react';
import { LuSearch } from "react-icons/lu";
import { mainCategories } from '../data/categories';

interface SearchBarProps {
  isDark: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSubmit: () => void;
  selectedCategories: string[];
  onRemoveCategory: (category: string) => void;
  isMobile?: boolean;
  isScrolled?: boolean;
  onFocus?: () => void;
}

function SearchBar({
  isDark,
  searchTerm,
  onSearchChange,
  onSubmit,
  selectedCategories,
  onRemoveCategory,
  isMobile = false,
  isScrolled = false,
  onFocus
}: SearchBarProps) {
  // Handle backspace to remove last category
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && selectedCategories.length > 0) {
      // Remove the last category when backspace is pressed on empty input
      const lastCategory = selectedCategories[selectedCategories.length - 1];
      onRemoveCategory(lastCategory);
    } else if (e.key === 'Enter') {
      // Submit on Enter key
      onSubmit();
    }
  };

  return (
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
            // Find the display name for this category
            let displayName = `#${category}`;
            
            // Check if this is a main category that represents "all" subcategories
            const mainCategory = mainCategories.find(mc => mc.id === category);
            if (mainCategory) {
              displayName = `#${category}.all`;
            }
            
            return (
              <Tag.Root
                key={category}
                size="sm"
                variant="solid"
                colorPalette="orange"
                borderRadius="full"
                flexShrink={0}
              >
                <Tag.Label>{displayName}</Tag.Label>
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
        placeholder={selectedCategories.length > 0 ? "" : "Search by category or papers..."}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
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
        onClick={onSubmit}
      >
        <LuSearch />
      </IconButton>
    </Flex>
  );
}

export default SearchBar;