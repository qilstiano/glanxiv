'use client'

import React from 'react';
import {
  Box,
  Flex,
  Button,
  Menu,
} from '@chakra-ui/react';
import { LuChevronDown } from "react-icons/lu";
import { mainCategories } from '../data/categories';

interface DesktopNavProps {
  isDark: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

function DesktopNav({ isDark, selectedCategory, onCategoryChange }: DesktopNavProps) {
  return (
    <Box 
      borderTopWidth="1px"
      borderTopColor={isDark ? "gray.700" : "gray.200"}
      overflow="visible"
      bg={isDark ? 'rgba(23, 25, 35, 0.9)' : "white"}
    >
      <Box 
        py={1}
        px={6}
        maxW="7xl" 
        mx="auto"
        overflowX="auto"
        css={{
          '&::-webkit-scrollbar': {
            height: '2px',
          },
          '&::-webkit-scrollbar-track': {
            background: isDark ? '#374151' : '#e5e7eb',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? '#e3541bff' : '#625c5aff',
            borderRadius: '2px',
          },
        }}
      >
        <Flex 
          gap={2} 
          flexWrap="nowrap"
          justify="flex-start"
          minW="max-content"
        >
          <Button
            size="sm"
            rounded="full"
            variant={selectedCategory === 'all' ? "solid" : "outline"}
            bg={
              selectedCategory === 'all' 
                ? isDark ? "orange.600" : "orange.500" 
                : "transparent"
            }
            borderColor={isDark ? "gray.600" : "gray.300"}
            color={
              selectedCategory === 'all' 
                ? "white" 
                : isDark ? "gray.300" : "gray.700"
            }
            _hover={{
              bg: selectedCategory === 'all' 
                ? isDark ? "orange.500" : "orange.600" 
                : isDark ? "gray.700" : "gray.100"
            }}
            onClick={() => onCategoryChange('all')}
            fontFamily="var(--font-geist-mono)"
            fontSize="sm"
            flexShrink={0}
          >
            #all
          </Button>

          {mainCategories.map((category) => (
            <Menu.Root key={category.id} positioning={{ placement: "bottom-start" }}>
              <Menu.Trigger asChild>
                <Button
                  size="sm"
                  rounded="full"
                  variant="outline"
                  color={isDark ? "gray.300" : "gray.700"}
                  _hover={{ bg: isDark ? "gray.700" : "gray.100" }}
                  fontFamily="var(--font-geist-mono)"
                  fontSize="sm"
                  flexShrink={0}
                >
                  #{category.id} <LuChevronDown />
                </Button>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content 
                  bg={"transparent"} 
                  borderColor={isDark ? "gray.600" : "gray.300"}
                  maxH="400px"
                  overflowY="auto"
                >
                  {category.subcategories.map((subcategory) => (
                    <Menu.Item 
                      key={subcategory.value}
                      value={subcategory.value}
                      onClick={() => onCategoryChange(subcategory.value)}
                      bg={"transparent"}
                      fontFamily="var(--font-geist-mono)"
                      pl={6}
                    >
                      └── #{subcategory.value}
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

export default DesktopNav;