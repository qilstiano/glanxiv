'use client'

import React, { useState } from 'react';
import {
  Drawer,
  Portal,
  VStack,
  HStack,
  Button,
  IconButton,
  Text,
  Input,
  Flex,
  Tag,
  Wrap,
  WrapItem,
  Box,
} from '@chakra-ui/react';
import { LuX, LuSearch, LuBookOpen, LuChevronRight, LuChevronDown, LuUser } from "react-icons/lu";
import { mainCategories } from '../data/categories';

interface MobileDrawerProps {
  isDark: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  selectedCategories: string[];
  onCategoryChange: (category: string[]) => void; // Change from onCategoriesChange
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

function MobileDrawer({
  isDark,
  isDrawerOpen,
  setIsDrawerOpen,
  selectedCategories,
  onCategoryChange,
  searchTerm,
  onSearchChange
}: MobileDrawerProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isCategoryExpanded = (categoryId: string) => expandedCategories.includes(categoryId);

  const handleCategoryToggle = (categoryValue: string) => {
    if (selectedCategories.includes(categoryValue)) {
      onCategoryChange(selectedCategories.filter(cat => cat !== categoryValue));
    } else {
      onCategoryChange([...selectedCategories, categoryValue]);
    }
  };

  const removeCategory = (categoryValue: string) => {
    onCategoryChange(selectedCategories.filter(cat => cat !== categoryValue));
  };

  return (
    <Drawer.Root open={isDrawerOpen} onOpenChange={(e) => setIsDrawerOpen(e.open)} size={"lg"}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg={isDark ? "gray.900" : "white"} color={isDark ? "white" : "gray.900"}>
            <Drawer.Header borderBottomWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Drawer.Title fontFamily="var(--font-geist)">Menu</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <IconButton
                  aria-label="Close menu"
                  variant="ghost"
                  size="sm"
                  position="absolute"
                  right={2}
                  top={2}
                  color={isDark ? "gray.300" : "gray.700"}
                >
                  <LuX />
                </IconButton>
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body> 
              <VStack gap={4} align="stretch" mt={4}>
                {/* Search Input */}
                <Box position="relative">
                  <Input 
                    placeholder="Search papers or #category..." 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    borderRadius="full"
                    borderColor={isDark ? "gray.600" : "gray.300"}
                    _hover={{ borderColor: isDark ? "gray.500" : "gray.400" }}
                    _focus={{ 
                      borderColor: isDark ? "blue.400" : "blue.500", 
                      boxShadow: "none" 
                    }}
                    size="sm"
                    bg={isDark ? "gray.800" : "gray.50"}
                    color={isDark ? "white" : "gray.900"}
                    _placeholder={{ color: isDark ? "gray.400" : "gray.500" }}
                    pr={10}
                  />
                  <IconButton
                    aria-label="Search papers"
                    position="absolute"
                    right={1}
                    top={1}
                    color={isDark ? "gray.400" : "gray.500"}
                    borderRadius="full"
                    size="xs"
                    fontSize="14px"
                    _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                    bg="transparent"
                  >
                    <LuSearch />
                  </IconButton>
                </Box>

                {/* Selected categories display */}
                {selectedCategories.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.700"} mb={2}>
                      Selected Categories
                    </Text>
                    <Wrap gap={2}>
                      {selectedCategories.map((category) => (
                        <WrapItem key={category}>
                          <Tag.Root
                            size="sm"
                            variant="solid"
                            colorPalette="orange"
                          >
                            <Tag.Label>#{category}</Tag.Label>
                            <Tag.EndElement>
                              <Tag.CloseTrigger onClick={() => removeCategory(category)} />
                            </Tag.EndElement>
                          </Tag.Root>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {/* All Categories Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  justifyContent="flex-start"
                  color={isDark ? "gray.300" : "gray.700"}
                  fontFamily="var(--font-geist-mono)"
                  onClick={() => {
                    handleCategoryToggle('all');
                    setIsDrawerOpen(false);
                  }}
                  bg={selectedCategories.includes('all') ? (isDark ? "orange.600" : "orange.100") : "transparent"}
                  _hover={{
                    bg: isDark ? "gray.700" : "gray.100"
                  }}
                >
                  <HStack>
                    <LuBookOpen />
                    <Text>#all (All Categories)</Text>
                  </HStack>
                </Button>

                {/* Quick categories */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.700"} mb={2}>
                    Popular Categories
                  </Text>
                  
                  <Wrap gap={2}>
                    {['cs.AI', 'cs.LG', 'cs.CV', 'math', 'physics'].map((cat) => (
                      <WrapItem key={cat}>
                        <Button
                          size="sm"
                          variant={selectedCategories.includes(cat) ? "solid" : "outline"}
                          bg={selectedCategories.includes(cat) ? (isDark ? "orange.600" : "orange.500") : "transparent"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          color={selectedCategories.includes(cat) ? "white" : (isDark ? "gray.300" : "gray.700")}
                          _hover={{
                            bg: selectedCategories.includes(cat) 
                              ? (isDark ? "orange.500" : "orange.600") 
                              : (isDark ? "gray.700" : "gray.100")
                          }}
                          onClick={() => {
                            handleCategoryToggle(cat);
                          }}
                          fontFamily="var(--font-geist-mono)"
                          borderRadius="full"
                        >
                          #{cat}
                        </Button>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>

                {/* All categories organized by main category */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.700"} mb={2}>
                    All Categories
                  </Text>

                  {mainCategories.map((category) => (
                    <VStack key={category.id} align="stretch" gap={2} mb={4}>
                      <HStack justify="space-between">
                        <Text 
                          fontSize="xs" 
                          fontWeight="bold" 
                          color={isDark ? "orange.400" : "orange.600"}
                          fontFamily="var(--font-geist)"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          {category.name}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => toggleCategory(category.id)}
                          color={isDark ? "gray.400" : "gray.600"}
                        >
                          {isCategoryExpanded(category.id) ? <LuChevronDown /> : <LuChevronRight />}
                        </Button>
                      </HStack>
                      
                      {isCategoryExpanded(category.id) && (
                        <Wrap gap={1}>
                          {/* Main category button */}
                          <WrapItem>
                            <Button
                              size="xs"
                              variant={selectedCategories.includes(category.id) ? "solid" : "outline"}
                              bg={selectedCategories.includes(category.id) ? (isDark ? "orange.600" : "orange.500") : "transparent"}
                              color={selectedCategories.includes(category.id) ? "white" : (isDark ? "gray.400" : "gray.600")}
                              fontFamily="var(--font-geist-mono)"
                              onClick={() => handleCategoryToggle(category.id)}
                              _hover={{
                                bg: isDark ? "gray.700" : "gray.100"
                              }}
                              borderRadius="full"
                              fontSize="xs"
                            >
                              #{category.id}
                            </Button>
                          </WrapItem>
                          
                          {/* Subcategories */}
                          {category.subcategories.map((subcategory) => (
                            <WrapItem key={subcategory.value}>
                              <Button
                                size="xs"
                                variant={selectedCategories.includes(subcategory.value) ? "solid" : "outline"}
                                bg={selectedCategories.includes(subcategory.value) ? (isDark ? "orange.600" : "orange.500") : "transparent"}
                                color={selectedCategories.includes(subcategory.value) ? "white" : (isDark ? "gray.400" : "gray.600")}
                                fontFamily="var(--font-geist-mono)"
                                onClick={() => handleCategoryToggle(subcategory.value)}
                                _hover={{
                                  bg: isDark ? "gray.700" : "gray.100"
                                }}
                                borderRadius="full"
                                fontSize="xs"
                              >
                                #{subcategory.value}
                              </Button>
                            </WrapItem>
                          ))}
                        </Wrap>
                      )}
                    </VStack>
                  ))}
                </Box>

                {/* Sign in button for mobile */}
                <Button 
                  variant="outline" 
                  size="sm"
                  color={isDark ? "gray.300" : "gray.700"}
                  borderColor={isDark ? "gray.600" : "gray.300"}
                  _hover={{ bg: isDark ? "gray.700" : "gray.100" }}
                  mt={4}
                >
                  <HStack>
                    <LuUser size={18} />
                    <Text>Sign in</Text>
                  </HStack>
                </Button>
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default MobileDrawer;