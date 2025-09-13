'use client'

import React from 'react';
import {
  Box,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import { allCategories } from '../data/categories';

interface CategoryDropdownProps {
  isDark: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showCategoryDropdown: boolean;
  setShowCategoryDropdown: (show: boolean) => void;
  searchTerm: string;
}

function CategoryDropdown({
  isDark,
  selectedCategory,
  onCategoryChange,
  showCategoryDropdown,
  setShowCategoryDropdown,
  searchTerm
}: CategoryDropdownProps) {
  if (!showCategoryDropdown) return null;

  return (
    <Box
      position="absolute"
      top="100%"
      left={0}
      right={0}
      mt={2}
      bg={isDark ? "gray.800" : "white"}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={isDark ? "gray.600" : "gray.300"}
      boxShadow="lg"
      zIndex={1000}
      p={4}
      maxH="400px"
      overflowY="auto"
    >
      <SimpleGrid columns={{ base: 2, md: 3 }} gap={3}>
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? "solid" : "outline"}
          bg={selectedCategory === 'all' ? (isDark ? "orange.600" : "orange.500") : "transparent"}
          color={selectedCategory === 'all' ? "white" : (isDark ? "gray.300" : "gray.700")}
          onClick={() => {
            onCategoryChange('all');
            setShowCategoryDropdown(false);
          }}
          fontFamily="var(--font-geist-mono)"
          borderRadius="md"
        >
          #all
        </Button>
        
        {allCategories
          .filter(cat => 
            cat.value !== 'all' && 
            cat.value.toLowerCase().includes(searchTerm.replace('#', '').toLowerCase())
          )
          .map((category) => (
            <Button
              key={category.value}
              size="sm"
              variant={selectedCategory === category.value ? "solid" : "outline"}
              bg={selectedCategory === category.value ? (isDark ? "orange.600" : "orange.500") : "transparent"}
              color={selectedCategory === category.value ? "white" : (isDark ? "gray.300" : "gray.700")}
              onClick={() => {
                onCategoryChange(category.value);
                setShowCategoryDropdown(false);
              }}
              fontFamily="var(--font-geist-mono)"
              borderRadius="md"
              whiteSpace="normal"
              textAlign="left"
              height="auto"
              py={2}
            >
              #{category.value}
            </Button>
          ))
        }
      </SimpleGrid>
    </Box>
  );
}

export default CategoryDropdown;