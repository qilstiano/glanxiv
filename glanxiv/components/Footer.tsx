// components/Footer.tsx
'use client'

import React from 'react';
import {
  Box,
  Flex,
  Grid,
  Text,
  Link,
  IconButton,
  useBreakpointValue,
  VStack,
  HStack,
  Image,
} from '@chakra-ui/react';
import { 
  LuGithub, 
  LuMail,
  LuHeart
} from "react-icons/lu";


// Footer data
const footerLinks = {
  product: [
    { label: 'Why glanxiv?', href: '#why' },
    { label: 'API', href: '#api' },
  ],
  resources: [
    { label: 'Documentation', href: '#docs' },
    { label: 'Forum', href: '#forum' },
    { label: 'Contributing', href: '#contributing' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Legal', href: '#legal' },
  ],
};

interface FooterProps {
  isDark: boolean;
}

function Footer({ isDark }: FooterProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return (
    <Box 
      as="footer"
      bg={isDark ? "gray.900" : "gray.50"}
      color={isDark ? "gray.300" : "gray.800"}
      borderTopWidth="1px"
      borderTopColor={isDark ? "gray.700" : "gray.200"}
      px={{ base: 4, md: 8 }}
      fontFamily="var(--font-geist)"
    >
      <Box maxW="7xl" mx="auto">
        {/* Logo at the top center */}
        <Flex justify="center" mb={8}>
          <Box>
            <Image 
              src="/glanxiv.png" 
              alt="Glanxiv" 
              height={isMobile ? 20 : 24}
              width="auto"
            />
          </Box>
        </Flex>
        
        {/* Main footer content - Centered */}
        <Grid 
          templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} 
          gap={8}
          mb={12}
          justifyItems="center" // Changed from conditional to always center
        >
          {/* Product links */}
          <VStack align="center" gap={3}> {/* Changed to always center */}
            <Text 
              fontWeight="semibold" 
              color={isDark ? "white" : "black"}
              mb={2}
              fontSize="lg"
              fontFamily="var(--font-geist-mono)"
            >
              Product
            </Text>
            {footerLinks.product.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                fontSize="md"
                color={isDark ? "gray.300" : "gray.700"}
                textAlign="center"
                _hover={{ 
                  color: isDark ? "orange.300" : "orange.600",
                  textDecoration: "none"
                }}
              >
                {link.label}
              </Link>
            ))}
          </VStack>
          
          {/* Resources links */}
          <VStack align="center" gap={3}> {/* Changed to always center */}
            <Text 
              fontWeight="semibold" 
              color={isDark ? "white" : "black"}
              mb={2}
              fontSize="lg"
              fontFamily="var(--font-geist-mono)"
            >
              Resources
            </Text>
            {footerLinks.resources.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                fontSize="md"
                color={isDark ? "gray.300" : "gray.700"}
                textAlign="center"
                _hover={{ 
                  color: isDark ? "orange.300" : "orange.600",
                  textDecoration: "none"
                }}
              >
                {link.label}
              </Link>
            ))}
          </VStack>
          
          {/* Company links */}
          <VStack align="center" gap={3}> {/* Changed to always center */}
            <Text 
              fontWeight="semibold" 
              color={isDark ? "white" : "black"}
              mb={2}
              fontSize="lg"
              fontFamily="var(--font-geist-mono)"
            >
              Others
            </Text>
            {footerLinks.company.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                fontSize="md"
                color={isDark ? "gray.300" : "gray.700"}
                textAlign="center"
                _hover={{ 
                  color: isDark ? "orange.300" : "orange.600",
                  textDecoration: "none"
                }}
              >
                {link.label}
              </Link>
            ))}
          </VStack>
        </Grid>
        
        {/* Social links and description */}
        <VStack gap={4} mb={8} align="center">
                    <Text 
            fontSize="xs" 
            maxW="500px" 
            textAlign="center"
            color={isDark ? "gray.400" : "gray.600"}
            fontFamily="var(--font-geist-mono)"
          >
            Thank you to arXiv for use of its open access interoperability.
          </Text>
          
          <HStack gap={4}>
            <IconButton
              aria-label="GitHub"
              variant="ghost"
              size="sm"
              color={isDark ? "gray.400" : "gray.600"}
              _hover={{
                color: isDark ? "white" : "gray.900",
                bg: isDark ? "gray.700" : "gray.100",
              }}
            >
              <a
                href="https://github.com/qilstiano/glanxiv"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex" }}
              >
                <LuGithub />
              </a>
            </IconButton>

            <IconButton
              aria-label="Contact"
              variant="ghost"
              size="sm"
              color={isDark ? "gray.400" : "gray.600"}
              _hover={{
                color: isDark ? "white" : "gray.900",
                bg: isDark ? "gray.700" : "gray.100",
              }}
            >
              <a
                href="mailto:qilstianooo@gmail.com"
                style={{ display: "flex" }}
              >
                <LuMail />
              </a>
            </IconButton>
          </HStack>
          
        </VStack>
        
        {/* Bottom section */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align="center"
          py={6}
          borderTopWidth="1px"
          borderTopColor={isDark ? "gray.700" : "gray.200"}
          gap={4}
        >
          <Text 
            fontSize="sm" 
            display="flex" 
            alignItems="center"
            color={isDark ? "gray.400" : "gray.600"}
          >
            Made with <LuHeart style={{ color: '#e53e3e', margin: '0 0.25rem' }} /> by 
            <Link 
              href="https://github.com/qilstiano" 
              target="_blank"
              rel="noopener noreferrer"
              ml={1}
              fontWeight="medium"
              color={isDark ? "orange.300" : "orange.600"}
              _hover={{ textDecoration: "none" }}
            >
              qilstiano
            </Link>
          </Text>
          
          <HStack gap={6}>
            <Link
              href="#privacy"
              fontSize="sm"
              color={isDark ? "gray.400" : "gray.600"}
              _hover={{ 
                color: isDark ? "orange.300" : "orange.600",
                textDecoration: "none"
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#terms"
              fontSize="sm"
              color={isDark ? "gray.400" : "gray.600"}
              _hover={{ 
                color: isDark ? "orange.300" : "orange.600",
                textDecoration: "none"
              }}
            >
              Terms of Service
            </Link>
            <Text 
              fontSize="sm"
              color={isDark ? "gray.400" : "gray.600"}
            >
              © {new Date().getFullYear()} glanxiv
            </Text>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}

export default Footer;