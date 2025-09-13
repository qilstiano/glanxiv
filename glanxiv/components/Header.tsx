// components/Header.tsx
'use client'

import React, { useState, useEffect } from 'react';
import GithubButton from './GithubButton';
import {
  Image,
  Box,
  Flex,
  Input,
  Button,
  IconButton,
  Drawer,
  Portal,
  VStack,
  useBreakpointValue,
  Text,
} from '@chakra-ui/react';
import { 
  LuSearch, 
  LuGithub, 
  LuSun, 
  LuMoon, 
  LuUser,
  LuMenu, 
  LuX,
  LuBookOpen
} from "react-icons/lu";
import { motion, AnimatePresence } from 'motion/react';

// Category data for arXiv
const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'cs.CV', label: 'Computer Vision' },
  { value: 'cs.LG', label: 'Machine Learning' },
  { value: 'cs.AI', label: 'Artificial Intelligence' },
  { value: 'cs.CL', label: 'Computation & Language' },
  { value: 'cs.NE', label: 'Neural and Evolutionary Computing' },
  { value: 'cs.RO', label: 'Robotics' },
  { value: 'cs.SY', label: 'Systems and Control' },
];

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

function Header({ isDark, onToggleTheme, selectedCategory, onCategoryChange, searchTerm, onSearchChange }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ 
          height: isScrolled ? (isMobile ? 70 : 80) : (isMobile ? 100 : 120),
          borderRadius: isScrolled ? (isMobile ? 12 : 16) : 0,
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          backgroundColor: isScrolled 
            ? isDark ? 'rgba(23, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.9)'
            : isDark ? 'gray.900' : 'white',
          boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
          border: isScrolled ? `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` : 'none',
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{
          position: 'fixed',
          top: isScrolled ? (isMobile ? 8 : 12) : 0,
          left: isScrolled ? (isMobile ? 8 : 12) : 0,
          right: isScrolled ? (isMobile ? 8 : 12) : 0,
          zIndex: 1000,
          width: isScrolled ? (isMobile ? 'calc(100% - 16px)' : 'calc(100% - 24px)') : '100%',
          overflow: 'visible',
        }}
      >
        <Box as="nav" w="full" bg="transparent" h="full">
          <Flex direction="column" h="full">
            {/* Main Row: Logo, Search, Actions */}
            <Flex 
              justify="space-between" 
              align="center" 
              px={{ base: 4, md: 6 }} 
              py={{ base: 1, md: 2 }}
              flex="1"
              maxW="7xl" 
              mx="auto"
              w="full"
              position="relative"
            >
              {/* Left: Mobile Menu + Logo */}
              <Flex align="center" gap={3} flexShrink={0}>
                {/* Mobile Menu Button */}
                {isMobile && (
                  <IconButton
                    aria-label="Open menu"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDrawerOpen(true)}
                    color={isDark ? "gray.300" : "gray.700"}
                    _hover={{ bg: isDark ? "gray.700" : "gray.100" }}
                  >
                    <LuMenu />
                  </IconButton>
                )}
                
                {/* Logo */}
                <Flex align="center" gap={2}>
                  <motion.div
                    animate={{ 
                      scale: isScrolled ? (isMobile ? 0.8 : 0.9) : 1 
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Image 
                      src="/glanxiv_highres.png" 
                      alt="Glanxiv" 
                      h={{ 
                        base: isScrolled ? "32px" : "36px", 
                        md: isScrolled ? "36px" : "40px" 
                      }} 
                      w="auto" 
                    />
                  </motion.div>
                  <Text 
                    fontSize={{ base: "lg", md: "xl" }}
                    fontWeight="bold"
                    color={isDark ? "white" : "gray.900"}
                    fontFamily="var(--font-geist)"
                  >
                  </Text>
                </Flex>
              </Flex>

              {/* Search Bar - Desktop and non-scrolled mobile */}
              <AnimatePresence>
                {(!isScrolled || !isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                      flex: isMobile ? 1 : 2, 
                      paddingLeft: isMobile ? 12 : 20, 
                      paddingRight: isMobile ? 12 : 20,
                      position: 'relative'
                    }}
                  >
                    <Flex align="center" position="relative">
                      <Input 
                        placeholder="Search papers, authors, abstracts..." 
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        borderRadius="full"
                        borderColor={isDark ? "gray.600" : "gray.300"}
                        _hover={{ borderColor: isDark ? "gray.500" : "gray.400" }}
                        _focus={{ 
                          borderColor: isDark ? "blue.400" : "blue.500", 
                          boxShadow: "none" 
                        }}
                        pl={4}
                        pr={10}
                        size={isMobile ? "sm" : "md"}
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
                        size={isMobile ? "xs" : "sm"}
                        fontSize={isMobile ? "14px" : "16px"}
                        _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                        bg="transparent"
                      >
                        <LuSearch />
                      </IconButton>
                    </Flex>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right: Actions */}
              <Flex align="center" gap={2} justify="flex-end" flexShrink={0}>
                {/* GitHub Button with Star Count - Hidden on mobile */}
                <GithubButton username={'qilstiano'} repo={'glanxiv'}/>
                
                {/* Theme Toggle */}
                <IconButton
                  aria-label="Toggle theme"
                  variant="ghost"
                  size="sm"
                  onClick={onToggleTheme}
                  color={isDark ? "gray.300" : "gray.700"}
                  _hover={{ bg: isDark ? "gray.700" : "gray.100" }}
                >
                  {isDark ? <LuSun size={18} /> : <LuMoon size={18} />}
                </IconButton>

                {/* Sign In Button - Hidden on mobile */}
                <Box display={{ base: 'none', md: 'block' }}>
                  <Button 
                    variant="outline" 
                    size={isScrolled ? "xs" : "sm"}
                    color={isDark ? "gray.300" : "gray.700"}
                    borderColor={isDark ? "gray.600" : "gray.300"}
                    _hover={{ bg: isDark ? "gray.700" : "gray.100" }}
                  >
                    <LuUser size={18} />
                    Sign in
                  </Button>
                </Box>
              </Flex>

              {/* Centered Search Bar for Mobile when Scrolled */}
              {isMobile && isScrolled && (
                <Flex 
                  position="absolute"
                  left="0"
                  right="0"
                  top="0"
                  bottom="0"
                  justify="center"
                  align="center"
                  pointerEvents="none"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                      width: '70%', 
                      maxWidth: '300px',
                      pointerEvents: 'auto'
                    }}
                  >
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
                        width="100%"
                        pl={4}
                        pr={10}
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
                        zIndex={1}
                      >
                        <LuSearch />
                      </IconButton>
                    </Flex>
                  </motion.div>
                </Flex>
              )}
            </Flex>

            {/* Bottom Row: Category Navigation (Desktop Only) */}
            {!isScrolled && !isMobile && (
              <Box 
                borderTopWidth="1px"
                borderTopColor={isDark ? "gray.700" : "gray.200"}
                overflow="visible"
              >
                <Box 
                  py={3}
                  px={6}
                  maxW="7xl" 
                  mx="auto"
                  overflowX="auto"
                  css={{
                    '&::-webkit-scrollbar': {
                      height: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: isDark ? '#374151' : '#e5e7eb',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: isDark ? '#6b7280' : '#9ca3af',
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
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        size="sm"
                        rounded="full"
                        variant={selectedCategory === category.value ? "solid" : "outline"}
                        colorPalette={selectedCategory === category.value ? "blue" : "gray"}
                        bg={
                          selectedCategory === category.value 
                            ? isDark ? "orange.600" : "orange.500" 
                            : "transparent"
                        }
                        borderColor={isDark ? "gray.600" : "gray.300"}
                        color={
                          selectedCategory === category.value 
                            ? "white" 
                            : isDark ? "gray.300" : "gray.700"
                        }
                        _hover={{
                          bg: selectedCategory === category.value 
                            ? isDark ? "orange.500" : "orange.600" 
                            : isDark ? "gray.700" : "gray.100"
                        }}
                        onClick={() => onCategoryChange(category.value)}
                        fontFamily="var(--font-geist-mono)"
                        fontSize="sm"
                        flexShrink={0}
                      >
                        #{category.value}
                      </Button>
                    ))}
                  </Flex>
                </Box>
              </Box>
            )}
          </Flex>
        </Box>
      </motion.div>

      <Box h={{ 
        base: isScrolled ? '80px' : '120px', 
        md: isScrolled ? '120px' : '140px'
      }} />

      <Drawer.Root open={isDrawerOpen} onOpenChange={(e) => setIsDrawerOpen(e.open)}>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content bg={isDark ? "gray.900" : "white"} color={isDark ? "white" : "gray.900"} fontFamily="var(--font-geist)">
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
                  {/* User Actions */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    justifyContent="flex-start"
                    color={isDark ? "gray.300" : "gray.700"}
                  >
                    <LuUser />
                    Sign In
                  </Button>

                  {/* Categories */}
                  <Text fontSize="sm" fontWeight="medium" color={isDark ? "gray.400" : "gray.500"} pl={2}>
                    Categories
                  </Text>
                  {categories.map((category) => (
                    <Button
                      key={category.value}
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                      fontFamily="var(--font-geist-mono)"
                      color={isDark ? "gray.300" : "gray.700"}
                      onClick={() => {
                        onCategoryChange(category.value);
                        setIsDrawerOpen(false);
                      }}
                      bg={selectedCategory === category.value ? (isDark ? "blue.600" : "blue.100") : "transparent"}
                    >
                      <LuBookOpen />
                      {category.label}
                    </Button>
                  ))}
                </VStack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
}

export default Header;