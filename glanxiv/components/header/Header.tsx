'use client'

import React, { useState, useEffect } from 'react';
import GithubButton from './GithubButton';
import {
  Image,
  Box,
  Flex,
  Button,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { 
  LuSun, 
  LuMoon, 
  LuUser,
  LuMenu,
} from "react-icons/lu";
import { motion, AnimatePresence } from 'motion/react';

// Import components
import SearchBar from './SearchBar';
import CategoryDropdown from './CategoryDropdown';
import DesktopNav from './DesktopNav';
import MobileDrawer from './MobileDrawer';
import { allCategories } from '../data/categories';

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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (term: string) => {
    onSearchChange(term);
    
    // Show dropdown when user types #
    if (term.startsWith('#')) {
      setShowCategoryDropdown(true);
    }
    
    // Auto-select category if it matches exactly
    if (term.startsWith('#') && term.length > 1) {
      const categoryValue = term.slice(1);
      const categoryExists = allCategories.some(cat => cat.value === categoryValue);
      
      if (categoryExists) {
        onCategoryChange(categoryValue);
      }
    }
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{ 
          height: isScrolled ? (isMobile ? 60 : 70) : (isMobile ? 80 : 100),
          borderRadius: isScrolled ? (isMobile ? 12 : 16) : 0,
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          backgroundColor: isScrolled 
            ? isDark ? 'rgba(23, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.9)'
            : isDark ? 'rgba(23, 25, 35, 0.9)' : 'white',
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
              py={{ base: 3, md: 4 }}
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
                    <Box position="relative">
                      <SearchBar
                        isDark={isDark}
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        selectedCategory={selectedCategory}
                        isMobile={isMobile}
                        onFocus={() => setShowCategoryDropdown(true)}
                      />
                      <CategoryDropdown
                        isDark={isDark}
                        selectedCategory={selectedCategory}
                        onCategoryChange={onCategoryChange}
                        showCategoryDropdown={showCategoryDropdown}
                        setShowCategoryDropdown={setShowCategoryDropdown}
                        searchTerm={searchTerm}
                      />
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right: Actions */}
              <Flex align="center" gap={2} justify="flex-end" flexShrink={0}>
                <GithubButton username={'qilstiano'} repo={'glanxiv'}/>
                
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
                    <Box position="relative">
                      <SearchBar
                        isDark={isDark}
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        selectedCategory={selectedCategory}
                        isMobile={true}
                        isScrolled={true}
                        onFocus={() => setShowCategoryDropdown(true)}
                      />
                      <CategoryDropdown
                        isDark={isDark}
                        selectedCategory={selectedCategory}
                        onCategoryChange={onCategoryChange}
                        showCategoryDropdown={showCategoryDropdown}
                        setShowCategoryDropdown={setShowCategoryDropdown}
                        searchTerm={searchTerm}
                      />
                    </Box>
                  </motion.div>
                </Flex>
              )}
            </Flex>

            {/* Bottom Row: Category Navigation (Desktop Only) */}
            {!isScrolled && !isMobile && (
              <DesktopNav 
                isDark={isDark}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
              />
            )}
          </Flex>
        </Box>
      </motion.div>

      {/* Spacer - Fixed height calculation */}
      <Box h={{ 
        base: isScrolled ? '100px' : '120px', 
        md: isScrolled ? '90px' : '100px'
      }} />

      {/* Mobile Drawer Menu */}
      <MobileDrawer
        isDark={isDark}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
    </>
  );
}

export default Header;