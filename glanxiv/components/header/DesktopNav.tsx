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
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
}

function DesktopNav({ isDark, selectedCategories, onCategoryChange }: DesktopNavProps) {
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
            variant={selectedCategories.length === 0 ? "solid" : "outline"}
            bg={
              selectedCategories.length === 0 
                ? isDark ? "orange.600" : "orange.500" 
                : "transparent"
            }
            borderColor={isDark ? "gray.600" : "gray.300"}
            color={
              selectedCategories.length === 0 
                ? "white" 
                : isDark ? "gray.300" : "gray.700"
            }
            _hover={{
              bg: selectedCategories.length === 0 
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
                  variant={selectedCategories.includes(category.id) ? "solid" : "outline"}
                  bg={selectedCategories.includes(category.id) ? (isDark ? "orange.600" : "orange.500") : "transparent"}
                  color={selectedCategories.includes(category.id) ? "white" : (isDark ? "gray.300" : "gray.700")}
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
                  bg={isDark ? "rgba(23, 25, 35, 0.95)" : "rgba(255, 255, 255, 0.95)"} 
                  borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                  backdropFilter="blur(12px)"
                  borderRadius="xl"
                  boxShadow={isDark 
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }
                  border="1px solid"
                  maxH="400px"
                  overflowY="auto"
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '2px',
                    },
                  }}
                >
                  {/* All subcategories option */}
                  <Menu.Item 
                    value={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    bg={selectedCategories.includes(category.id) 
                      ? isDark 
                        ? "rgba(251, 146, 60, 0.2)" 
                        : "rgba(251, 146, 60, 0.1)" 
                      : "transparent"
                    }
                    color={isDark ? "white" : "gray.900"}
                    fontFamily="var(--font-geist-mono)"
                    borderRadius="lg"
                    mx={1}
                    my={0.5}
                    _hover={{
                      bg: isDark 
                        ? "rgba(255, 255, 255, 0.1)" 
                        : "rgba(0, 0, 0, 0.05)"
                    }}
                    transition="all 0.2s ease"
                  >
                    #{category.id} (All)
                  </Menu.Item>
                  
                  {category.subcategories.map((subcategory) => (
                    <Menu.Item 
                      key={subcategory.value}
                      value={subcategory.value}
                      onClick={() => onCategoryChange(subcategory.value)}
                      bg={selectedCategories.includes(subcategory.value) 
                        ? isDark 
                          ? "rgba(251, 146, 60, 0.2)" 
                          : "rgba(251, 146, 60, 0.1)" 
                        : "transparent"
                      }
                      color={isDark ? "white" : "gray.900"}
                      fontFamily="var(--font-geist-mono)"
                      borderRadius="lg"
                      mx={1}
                      my={0.5}
                      pl={6}
                      _hover={{
                        bg: isDark 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "rgba(0, 0, 0, 0.05)"
                      }}
                      transition="all 0.2s ease"
                    >
                      #{subcategory.value}
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