'use client'
import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Image,
  HStack,
  useBreakpointValue,
  Link,
  IconButton
} from '@chakra-ui/react';
import { LuArrowRight, LuGithub, LuGlasses, LuHeart, LuMail } from 'react-icons/lu';

// Animated Gradient Component
const AnimatedGradient = ({ isDark = true }) => {
  const color1 = isDark ? '#1a202c' : '#292a2bff'; // dark gray to darker gray
  const color2 = isDark ? '#e53e3e' : '#fd7f28'; // red to orange
  const color3 = isDark ? '#131313ff' : '#3f3f3fff'; // light orange/pink
  const color4 = isDark ? '#3f3e3dff' : '#202020ff'; // orange

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      zIndex={-1}
      bg={isDark ? 'gray.900' : 'gray.50'}
      overflow="hidden"
    >
      <style>
        {`
          @keyframes animate {
            0% {
              border-radius: 30% 70% 70% 30% / 30% 30% 70% 60%;
              transform: scale(2) rotate(0deg) translate(10%, 10%);
            }
            100% {
              border-radius: 88% 10% 22% 58% / 73% 56% 34% 77%;
              transform: scale(2) rotate(180deg) translate(10%, -10%);
            }
          }
          
          .gradient-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-wrap: wrap;
            overflow: hidden;
            position: relative;
          }
          
          .gradient-color {
            width: 50%;
            height: 50%;
            border-radius: 30% 80% 75% 40% / 40% 40% 70% 50%;
            animation: animate 8s ease-in-out infinite alternate;
          }
          
          .gradient-color:nth-child(1) {
            background: ${color1};
            animation-direction: reverse;
            animation-delay: -2s;
          }
          
          .gradient-color:nth-child(2) {
            background: ${color2};
            animation-delay: -1s;
          }
          
          .gradient-color:nth-child(3) {
            background: ${color3};
            animation-direction: reverse;
            animation-delay: -3s;
          }
          
          .gradient-color:nth-child(4) {
            background: ${color4};
            animation-delay: -0.5s;
          }
          
          .gradient-backdrop {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            backdrop-filter: blur(120px);
            background: ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
          }
        `}
      </style>
      
      <div className="gradient-container">
        <div className="gradient-color"></div>
        <div className="gradient-color"></div>
        <div className="gradient-color"></div>
        <div className="gradient-color"></div>
        <div className="gradient-backdrop"></div>
      </div>
    </Box>
  );
};

const Homepage = ({ isDark = true }) => {
  const imageSize = useBreakpointValue({ base: '200px', md: '300px', lg: '400px' });
  const titleSize = useBreakpointValue({ base: 'xl', md: '2xl', lg: '3xl' });
  
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 4, md: 8 }}
      position="relative"
    >
      <AnimatedGradient isDark={isDark} />
      
      <VStack 
        gap={8} 
        align="start"
        maxW="800px"
        mx="auto"
        textAlign="center"
        position="relative"
        zIndex={1}
      >
        {/* Logo */}
        <Box
          as="div"
        >
          <Image
            src="/glanxiv_highres.png"
            alt="Glanxiv"
            height={imageSize}
            width="auto"
            objectFit="contain"
            filter="drop-shadow(0 10px 20px rgba(0, 0, 0, 0.25))"
          />
        </Box>
        
        {/* Tagline */}
        <Text
          fontSize={titleSize}
          fontWeight="normal"
          color={isDark ? 'gray.100' : 'gray.800'}
          fontFamily="var(--font-geist)"
          letterSpacing="tight"
          lineHeight="shorter"
          textShadow={isDark 
            ? '0 2px 10px rgba(0, 0, 0, 0.5)' 
            : '0 2px 10px rgba(0, 0, 0, 0.1)'
          }
          maxW="600px"
        >
          your modern, open source, library for research.
        </Text>
        
        {/* CTA Button */}
        <Link href="/library" _hover={{ textDecoration: 'none' }}>
          <Button
            size="lg"
            variant="outline"
            borderColor={isDark ? 'orange.400' : 'orange.500'}
            color={isDark ? 'orange.300' : 'orange.600'}
            bg={isDark 
              ? 'rgba(251, 146, 60, 0.1)' 
              : 'rgba(251, 146, 60, 0.05)'
            }
            backdropFilter="blur(10px)"
            borderRadius="full"
            px={8}
            py={6}
            fontSize="lg"
            fontFamily="var(--font-geist-mono)"
            fontWeight="medium"
            transition="all 0.3s ease"
            _hover={{
              bg: isDark 
                ? 'rgba(251, 146, 60, 0.2)' 
                : 'rgba(251, 146, 60, 0.1)',
              borderColor: isDark ? 'orange.300' : 'orange.400',
              transform: 'translateY(-2px)',
              boxShadow: isDark
                ? '0 10px 25px rgba(251, 146, 60, 0.2)'
                : '0 10px 25px rgba(251, 146, 60, 0.15)'
            }}
            _active={{
              transform: 'translateY(0px)'
            }}
          >
            <HStack gap={3}>
              <Text>let&apos;s get nerdy</Text>
              <LuGlasses/>
              <Box
                as={LuArrowRight}
                transition="transform 0.2s ease"
                _groupHover={{ transform: 'translateX(2px)' }}
              />
            </HStack>
          </Button>
        </Link>
            <HStack gap={4}>
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
                        <IconButton
                          aria-label="GitHub"
                          variant="surface"
                          size="sm"
                          color={isDark ? "gray.400" : "gray.600"}
                          _hover={{
                            color: isDark ? "white" : "gray.900",
                            bg: isDark ? "gray.700" : "gray.100",
                          }}
                          rounded={"full"}
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
                          variant="surface"
                          size="sm"
                          color={isDark ? "gray.400" : "gray.600"}
                          _hover={{
                            color: isDark ? "white" : "gray.900",
                            bg: isDark ? "gray.700" : "gray.100",
                          }}
                          rounded={"full"}
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
    </Box>
  );
};

export default Homepage;