'use client'

import React from 'react';
import {
  Flex,
  Input,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { LuSearch } from "react-icons/lu";

interface SearchBarProps {
  isDark: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  isMobile?: boolean;
  isScrolled?: boolean;
  onFocus?: () => void;
}

function SearchBar({
  isDark,
  searchTerm,
  onSearchChange,
  selectedCategory,
  isMobile = false,
  isScrolled = false,
  onFocus
}: SearchBarProps) {
  return (
    <Flex align="center" position="relative" width="full" className="search-container">
      <Input 
        placeholder="#cs.AI or search papers..." 
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={onFocus}
        borderRadius="full"
        borderColor={isDark ? "gray.600" : "gray.300"}
        _hover={{ borderColor: isDark ? "gray.500" : "gray.400" }}
        _focus={{ 
          borderColor: isDark ? "blue.400" : "blue.500", 
          boxShadow: "none" 
        }}
        pl={selectedCategory !== 'all' ? 12 : 4}
        pr={10}
        size={isMobile ? "sm" : "md"}
        bg={isDark ? "gray.800" : "gray.50"}
        color={isDark ? "white" : "gray.900"}
        _placeholder={{ color: isDark ? "gray.400" : "gray.500" }}
      />
      
      {selectedCategory !== 'all' && (
        <Box
          position="absolute"
          left={4}
          top="50%"
          transform="translateY(-50%)"
          bg={isDark ? "orange.600" : "orange.500"}
          color="white"
          px={2}
          py={0.5}
          borderRadius="md"
          fontSize="xs"
          fontWeight="medium"
          zIndex={1}
        >
          #{selectedCategory}
        </Box>
      )}
      
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
      >
        <LuSearch />
      </IconButton>
    </Flex>
  );
}

export default SearchBar;