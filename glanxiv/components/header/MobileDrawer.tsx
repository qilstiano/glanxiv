'use client'

import React from 'react';
import {
  Drawer,
  Portal,
  VStack,
  HStack,
  Button,
  IconButton,
  Text,
  Menu,
  Input,
  Flex,
} from '@chakra-ui/react';
import { LuX, LuSearch, LuBookOpen, LuChevronRight } from "react-icons/lu";
import { mainCategories } from '../data/categories';

interface MobileDrawerProps {
  isDark: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

function MobileDrawer({
  isDark,
  isDrawerOpen,
  setIsDrawerOpen,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange
}: MobileDrawerProps) {
  return (
    <Drawer.Root open={isDrawerOpen} onOpenChange={(e) => setIsDrawerOpen(e.open)} size={"lg"}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg={isDark ? "gray.900" : "white"} color={isDark ? "white" : "gray.900"}>
            <Drawer.Header borderBottomWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
              <Drawer.Title fontFamily="var(--font-geist)">Categories</Drawer.Title>
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
                <Flex align="center" position="relative">
                  <Input 
                    placeholder="Search papers..." 
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
                  />
                  <IconButton
                    aria-label="Search papers"
                    position="absolute"
                    right={1}
                    color={isDark ? "gray.400" : "gray.500"}
                    borderRadius="full"
                    size="xs"
                    fontSize="14px"
                    _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                    bg="transparent"
                  >
                    <LuSearch />
                  </IconButton>
                </Flex>

                <Button
                  variant="ghost"
                  size="sm"
                  justifyContent="flex-start"
                  color={isDark ? "gray.300" : "gray.700"}
                  fontFamily="var(--font-geist-mono)"
                  onClick={() => {
                    onCategoryChange('all');
                    setIsDrawerOpen(false);
                  }}
                  bg={selectedCategory === 'all' ? (isDark ? "blue.600" : "blue.100") : "transparent"}
                >
                  <LuBookOpen />
                  #all (All Categories)
                </Button>

                {mainCategories.map((category) => (
                  <Menu.Root key={category.id} positioning={{ placement: "right-start" }}>
                    <Menu.Trigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        justifyContent="space-between"
                        color={isDark ? "gray.300" : "gray.700"}
                        fontFamily="var(--font-geist-mono)"
                        w="full"
                      >
                        <HStack>
                          <LuBookOpen />
                          <Text>#{category.id} ({category.name})</Text>
                        </HStack>
                        <LuChevronRight />
                      </Button>
                    </Menu.Trigger>
                    <Menu.Positioner>
                      <Menu.Content 
                        bg={isDark ? "gray.800" : "white"} 
                        borderColor={isDark ? "gray.600" : "gray.300"}
                        maxH="400px"
                        overflowY="auto"
                      >
                        <Menu.Item
                          value={category.id}
                          onClick={() => {
                            onCategoryChange(category.id);
                            setIsDrawerOpen(false);
                          }}
                          bg={selectedCategory === category.id ? (isDark ? "blue.600" : "blue.100") : "transparent"}
                          fontFamily="var(--font-geist-mono)"
                        >
                          #{category.id} (All {category.name})
                        </Menu.Item>
                        
                        {category.subcategories.map((subcategory) => (
                          <Menu.Item
                            key={subcategory.value}
                            value={subcategory.value}
                            onClick={() => {
                              onCategoryChange(subcategory.value);
                              setIsDrawerOpen(false);
                            }}
                            bg={selectedCategory === subcategory.value ? (isDark ? "blue.600" : "blue.100") : "transparent"}
                            fontFamily="var(--font-geist-mono)"
                          >
                            |____ #{subcategory.value}
                          </Menu.Item>
                        ))}
                      </Menu.Content>
                    </Menu.Positioner>
                  </Menu.Root>
                ))}
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default MobileDrawer;