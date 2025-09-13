'use client'

import React from 'react';
import {
  Box,
  Button,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { mainCategories } from '../data/categories';

interface CategoryDropdownProps {
  isDark: boolean;
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  showCategoryDropdown: boolean;
  setShowCategoryDropdown: (show: boolean) => void;
  searchTerm: string;
}

function CategoryDropdown({
  isDark,
  selectedCategories,
  onCategoryChange,
  showCategoryDropdown,
  searchTerm
}: CategoryDropdownProps) {
  if (!showCategoryDropdown) return null;

  const handleCategorySelect = (category: string) => {
    // Handle .all variants by converting them to main category IDs
    const processedCategory = category.endsWith('.all') 
      ? category.replace('.all', '') 
      : category;
    
    onCategoryChange(processedCategory);
    // Keep dropdown open for multi-select
  };

  // Filter categories based on search
  const filteredCategories = mainCategories.map(category => ({
    ...category,
    subcategories: category.subcategories.filter(subcat =>
      subcat.value.toLowerCase().includes(searchTerm.replace('#', '').toLowerCase()) ||
      subcat.label.toLowerCase().includes(searchTerm.replace('#', '').toLowerCase()) ||
      category.name.toLowerCase().includes(searchTerm.replace('#', '').toLowerCase())
    )
  })).filter(category => 
    category.subcategories.length > 0 || 
    category.name.toLowerCase().includes(searchTerm.replace('#', '').toLowerCase()) ||
    category.id.toLowerCase().includes(searchTerm.replace('#', '').toLowerCase())
  );

  return (
    <Box
      position="absolute"
      top="100%"
      left={0}
      right={0}
      mt={2}
      bg={isDark ? "rgba(26, 32, 44, 0.95)" : "rgba(255, 255, 255, 0.95)"}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.1)"}
      boxShadow="xl"
      zIndex={1000}
      p={4}
      maxH="400px"
      overflowY="auto"
      backdropFilter="blur(10px)"
      css={{
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          bg: isDark ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.05)",
          borderRadius: "full",
        },
        "&::-webkit-scrollbar-thumb": {
          bg: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
          borderRadius: "full",
        },
      }}
    >
      <VStack align="stretch" gap={4}>
        {/* All Categories Button */}
        <Button
          size="sm"
          variant={selectedCategories.length === 0 ? "solid" : "outline"}
          bg={selectedCategories.length === 0 ? (isDark ? "orange.600" : "orange.500") : "transparent"}
          color={selectedCategories.length === 0 ? "white" : (isDark ? "gray.300" : "gray.700")}
          onClick={() => handleCategorySelect('all')}
          fontFamily="var(--font-geist-mono)"
          borderRadius="md"
          justifyContent="flex-start"
          _hover={{
            bg: selectedCategories.length === 0 
              ? (isDark ? "orange.500" : "orange.600") 
              : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)")
          }}
        >
          #all (All Categories)
        </Button>

        {/* Main Categories with Subcategories */}
        {filteredCategories.map((category) => (
          <Box key={category.id}>
            {/* Main Category Header */}
            <Text
              fontSize="sm"
              fontWeight="bold"
              color={isDark ? "gray.300" : "gray.700"}
              mb={2}
              fontFamily="var(--font-geist)"
              pl={2}
            >
              {category.name}
            </Text>

            {/* Subcategories Grid */}
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={2} mb={4}>
              {/* All subcategories for this main category */}
              <Button
                key={`${category.id}-all`}
                size="sm"
                variant={selectedCategories.includes(category.id) ? "solid" : "outline"}
                bg={selectedCategories.includes(category.id) ? (isDark ? "blue.600" : "blue.500") : "transparent"}
                color={selectedCategories.includes(category.id) ? "white" : (isDark ? "gray.300" : "gray.700")}
                onClick={() => handleCategorySelect(`${category.id}.all`)}
                fontFamily="var(--font-geist-mono)"
                borderRadius="md"
                whiteSpace="normal"
                textAlign="left"
                height="auto"
                py={2}
                fontSize="xs"
                _hover={{
                  bg: selectedCategories.includes(category.id)
                    ? (isDark ? "blue.500" : "blue.600")
                    : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)")
                }}
              >
                {selectedCategories.includes(category.id) ? "✓ " : ""}#{category.id}.all
              </Button>

              {/* Individual Subcategories */}
              {category.subcategories.map((subcategory) => (
                <Button
                  key={subcategory.value}
                  size="sm"
                  variant={selectedCategories.includes(subcategory.value) ? "solid" : "outline"}
                  bg={selectedCategories.includes(subcategory.value) ? (isDark ? "orange.600" : "orange.500") : "transparent"}
                  color={selectedCategories.includes(subcategory.value) ? "white" : (isDark ? "gray.300" : "gray.700")}
                  onClick={() => handleCategorySelect(subcategory.value)}
                  fontFamily="var(--font-geist-mono)"
                  borderRadius="md"
                  whiteSpace="normal"
                  textAlign="left"
                  height="auto"
                  py={2}
                  fontSize="xs"
                  _hover={{
                    bg: selectedCategories.includes(subcategory.value)
                      ? (isDark ? "orange.500" : "orange.600")
                      : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)")
                  }}
                >
                  {selectedCategories.includes(subcategory.value) ? "✓ " : ""}#{subcategory.value}
                </Button>
              ))}
            </SimpleGrid>
          </Box>
        ))}

        {/* No results message */}
        {filteredCategories.length === 0 && (
          <Text color={isDark ? "gray.400" : "gray.500"} textAlign="center" py={4}>
            No categories found matching &quot;{searchTerm}&quot;
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default CategoryDropdown;