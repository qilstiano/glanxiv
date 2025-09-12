// components/PaperCard.tsx
import {
  Card,
  VStack,
  HStack,
  Text,
  Tag,
  Box,
  Portal,
  Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  Button,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react'
import { ExternalLink, ChevronDown, ChevronUp, GripVertical, Eye, EyeOff, MoonStar , Sun, Moon } from 'lucide-react'
import { Paper } from '../app/types'
import { useState, useRef, useEffect } from 'react'

// Import react-pdf-viewer
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PaperCardProps {
  paper: Paper
  isDark: boolean
}

// Function to generate random gradient colors
const getRandomGradient = () => {
  const colors = [
    ['#ff6b6b', '#4ecdc4'],
    ['#45b7d1', '#96ceb4'],
    ['#feca57', '#ff9ff3'],
    ['#54a0ff', '#5f27cd'],
    ['#00d2d3', '#54a0ff'],
    ['#ff9ff3', '#f368e0'],
    ['#48dbfb', '#0abde3'],
    ['#10ac84', '#1dd1a1'],
    ['#ee5a24', '#ff9ff3'],
    ['#c56cf0', '#ffb8b8']
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export default function PaperCard({ paper, isDark }: PaperCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [gradient] = useState(getRandomGradient())
  const [splitPosition, setSplitPosition] = useState(50) // 50% split
  const [isResizing, setIsResizing] = useState(false)
  const [isPdfDarkMode, setIsPdfDarkMode] = useState(() => {
    // Initialize from localStorage if available, otherwise default to false
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pdf-theme') === 'dark';
    }
    return false;
  });
  const [showSummary, setShowSummary] = useState(true)
  const dialogRef = useRef<HTMLDivElement>(null)
  
  // helper to bypass CORS
  const getProxyUrl = (url: string) => {
    // Use a CORS proxy service
    return `https://corsproxy.io/?${encodeURIComponent(url)}`;
  };

  const handleSwitchTheme = (theme: string) => {
    const isDark = theme === 'dark';
    setIsPdfDarkMode(isDark);
    localStorage.setItem('pdf-theme', theme);
  };

  
  // Create PDF viewer plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Extract more sentences from abstract instead of using placeholder
  const getTruncatedAbstract = () => {
    if (paper.abstract.length <= 300) return paper.abstract;
    
    // Find a good truncation point after approximately 200 characters
    const truncated = paper.abstract.substring(0, 300);
    // Find the last sentence end within the truncated text
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclamation = truncated.lastIndexOf('!');
    
    const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
    
    if (lastSentenceEnd > 100) { // Ensure we have at least some content
      return paper.abstract.substring(0, lastSentenceEnd + 1) + '..';
    }
    
    // If no good sentence end found, just truncate at 200 chars
    return paper.abstract.substring(0, 200) + '...';
  };

  const displayAbstract = getTruncatedAbstract();
  
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !dialogRef.current) return;
      
      const dialogRect = dialogRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - dialogRect.left) / dialogRect.width) * 100;
      
      // Limit split position between 30% and 70% (minimum 30% for PDF, 70% for summary)
      const clampedPosition = Math.max(30, Math.min(70, newPosition));
      setSplitPosition(clampedPosition);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(true);
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the title click
    // Let the default link behavior happen (open PDF in new tab)
  };

  // Toggle summary visibility
  const toggleSummary = () => {
    setShowSummary(!showSummary);
    if (showSummary) {
      setSplitPosition(100); // Show only PDF when summary is hidden
    } else {
      setSplitPosition(50); // Reset to default split when showing summary
    }
  };

  // Toggle PDF dark mode
  const togglePdfDarkMode = () => {
    const newTheme = isPdfDarkMode ? 'light' : 'dark';
    handleSwitchTheme(newTheme);
  };

  return (
    <>
      <style jsx global>{`
        .pdf-dark-mode .rpv-core__viewer {
          filter: invert(1) hue-rotate(180deg);
        }

        .pdf-dark-mode .rpv-core__viewer img {
          filter: invert(1) hue-rotate(180deg);
        }
      `}</style>

      <Card.Root 
        bg={isDark ? "gray.800" : "white"} 
        shadow="md" 
        _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }} 
        transition="all 0.2s"
        overflow="hidden"
        height="auto"
        minHeight="320px"
        maxHeight="400px"
      >
        {/* Title with gradient background */}
        <Box 
          position="relative"
          h="120px"
          background={`linear-gradient(to right, ${gradient[0]}, ${gradient[1]})`}
          p={4}
          display="flex"
          alignItems="flex-end"
          cursor="pointer"
          onClick={handleTitleClick}
        >
          <Text
            color="white"
            fontWeight="bold"
            fontSize="lg"
            lineHeight="1.2"
            textShadow="0 1px 2px rgba(0,0,0,0.2)"
            _hover={{ textDecoration: 'none' }}
            fontFamily="var(--font-instrument-serif)"
          >
            {paper.title}
          </Text>
        </Box>

        <Card.Body pt={4}>
          <VStack align="start" gap={3}>
            {/* Categories */}
            <HStack gap={2} flexWrap="wrap">
              <Tag.Root 
                size="sm" 
                colorPalette="blue"
                borderRadius="full"
                fontFamily="var(--font-geist-mono)"
                color={isDark ? "white" : "gray.800"}
              >
                <Tag.Label>#{paper.primary_category}</Tag.Label>
              </Tag.Root>
              {paper.categories.filter(cat => cat !== paper.primary_category).slice(0, 2).map((category, index) => (
                <Tag.Root 
                  key={index}
                  size="sm"
                  variant="outline"
                  colorPalette="gray"
                  opacity={0.7}
                  borderRadius="full"
                  fontFamily="var(--font-geist-mono)"
                  color={isDark ? "gray.300" : "gray.600"}
                >
                  <Tag.Label>#{category}</Tag.Label>
                </Tag.Root>
              ))}
              {paper.categories.length > 3 && (
                <Tag.Root 
                  size="sm"
                  variant="outline"
                  colorPalette="gray"
                  opacity={0.5}
                  borderRadius="full"
                  fontFamily="var(--font-geist-mono)"
                  color={isDark ? "gray.400" : "gray.500"}
                >
                  <Tag.Label>+{paper.categories.length - 3}</Tag.Label>
                </Tag.Root>
              )}
            </HStack>

            {/* Abstract */}
            <Text 
              fontSize="sm" 
              color={isDark ? "gray.300" : "gray.600"}
              lineHeight="1.4"
            >
              {displayAbstract}
            </Text>

            {/* Authors and date */}
            <VStack align="start" gap={1} w="full">
              <Text 
                fontSize="xs" 
                color={isDark ? "gray.400" : "gray.500"}
                fontStyle="italic"
                lineHeight="1.2"
              >
                by {paper.authors.slice(0, 3).join(', ')}
                {paper.authors.length > 3 && ` et al.`}
              </Text>
              <Text 
                fontSize="xs" 
                color={isDark ? "gray.500" : "gray.400"}
                fontFamily="var(--font-geist-mono)"
              >
                {new Date(paper.published).toLocaleDateString()}
              </Text>
            </VStack>

            {/* Expand button and Visit arXiv button */}
            <HStack w="full" justify="space-between" mt={2}>
              {paper.abstract.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  color={isDark ? "gray.400" : "gray.500"}
                >
                  <ChevronDown size={14} />
                  Read more
                </Button>
              )}
              
              <Button
                as="a"
                size="sm"
                variant="surface"
                colorPalette="blue"
                ml="auto"
              >
                <ExternalLink size={16} />
                <a href={paper.pdf_url}>arXiv</a>
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Expanded view dialog */}
      <Dialog.Root open={isExpanded} onOpenChange={() => setIsExpanded(false)}>
        <Portal>
          <DialogBackdrop bg="blackAlpha.700"/>
          <DialogPositioner>
            <DialogContent 
              ref={dialogRef}
              maxW={isMobile ? "95vw" : "8xl"} 
              maxH="85vh"
              h="85vh"
              minH="85vh"
              bg={isDark ? "gray.900" : "white"}
              borderColor={isDark ? "gray.700" : "gray.200"}
              p={0}
              overflow="hidden"
            >
              <DialogHeader 
                borderBottomWidth="1px" 
                borderColor={isDark ? "gray.700" : "gray.200"}
                pr={10}
                py={3}
                px={4}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text 
                  fontSize="xl" 
                  fontWeight="bold"
                  fontFamily="var(--font-instrument-serif)"
                  color={isDark ? "white" : "gray.900"}
                  flex="1"
                  mr={4}
                >
                  {paper.title}
                </Text>
                
                {/* Header controls */}
                <HStack>
                  {/* Toggle PDF dark mode */}
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={togglePdfDarkMode}
                    aria-label={isPdfDarkMode ? "Light mode" : "Dark mode"}
                    title={isPdfDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {isPdfDarkMode ? <Sun size={16} /> : <MoonStar size={16} />}
                  </IconButton>
                  
                  {/* Toggle summary visibility */}
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={toggleSummary}
                    aria-label={showSummary ? "Hide summary" : "Show summary"}
                    title={showSummary ? "Hide summary" : "Show summary"}
                  >
                    {showSummary ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </HStack>
              </DialogHeader>
              <DialogBody p={0} overflow="hidden" h="calc(85vh - 60px)">
                <HStack 
                  align="start" 
                  h="full" 
                  flexDirection={isMobile ? "column" : "row"}
                  position="relative"
                >
                  {/* Resize handle with grip icon */}
                  {!isMobile && showSummary && (
                    <Box
                      position="absolute"
                      left={`${splitPosition}%`}
                      top={0}
                      bottom={0}
                      width="12px"
                      cursor="col-resize"
                      zIndex={10}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      onMouseDown={() => setIsResizing(true)}
                      ml="-6px"
                    >
                      <Box
                        width="4px"
                        height="24px"
                        borderRadius="full"
                        bg={isDark ? "gray.500" : "gray.400"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                      >
                        <GripVertical size={12} />
                      </Box>
                    </Box>
                  )}
                  
                  {/* Paper details - conditionally rendered based on showSummary state */}
                  {showSummary && (
                    <Box 
                      flex={isMobile ? 1 : `0 0 ${splitPosition}%`}
                      p={6} 
                      overflowY="auto" 
                      h="full"
                      fontFamily="var(--font-geist)"
                      minW={isMobile ? "100%" : "30%"} // Minimum width for summary
                    >
                      <VStack align="start" gap={4} h="full">
                        <HStack gap={2} flexWrap="wrap">
                          {paper.categories.map((category, index) => (
                            <Tag.Root 
                              key={index}
                              size="sm"
                              colorPalette={category === paper.primary_category ? "blue" : "gray"}
                              borderRadius="full"
                              fontFamily="var(--font-geist-mono)"
                              color={isDark ? "white" : "gray.300"}
                            >
                              <Tag.Label>#{category}</Tag.Label>
                            </Tag.Root>
                          ))}
                        </HStack>
                        
                        <Text 
                          color={isDark ? "gray.300" : "gray.600"}
                          lineHeight="1.6"
                          fontFamily="var(--font-geist)"
                          whiteSpace="pre-line"
                        >
                          {paper.abstract}
                        </Text>
                        
                        <VStack align="start" gap={1} mt="auto" pt={4}>
                          <Text 
                            fontSize="sm" 
                            fontWeight="medium"
                            color={isDark ? "gray.200" : "gray.700"}
                            fontFamily="var(--font-geist)"
                          >
                            Authors
                          </Text>
                          <Text 
                            fontSize="sm" 
                            color={isDark ? "gray.400" : "gray.600"}
                            fontFamily="var(--font-geist)"
                          >
                            {paper.authors.join(', ')}
                          </Text>
                          
                          <Text 
                            fontSize="xs" 
                            color={isDark ? "gray.500" : "gray.400"}
                            fontFamily="var(--font-geist-mono)"
                            mt={2}
                          >
                            Published: {new Date(paper.published).toLocaleDateString()}
                          </Text>
                        </VStack>
                        
                        <Button 
                          as="a"
                          rel="noopener noreferrer"
                          colorPalette="blue"
                          fontFamily="var(--font-geist)"
                          mt={4}
                        >
                          <ExternalLink size={14} />
                          <a href={paper.pdf_url}>Open PDF in new tab</a>
                        </Button>
                      </VStack>
                    </Box>
                  )}
                  
                  {/* PDF preview - takes full remaining space */}
                  <Box 
                    flex={1}
                    bg={isDark ? "gray.800" : "gray.100"}
                    display="flex"
                    flexDirection="column"
                    borderLeftWidth={isMobile || !showSummary ? "0px" : "1px"}
                    borderTopWidth={isMobile ? "1px" : "0px"}
                    borderColor={isDark ? "gray.700" : "gray.200"}
                    h="full"
                    position="relative"
                    minH={isMobile ? "40vh" : "auto"}
                    minW={isMobile ? "100%" : "45%"}
                    className={isPdfDarkMode ? "pdf-dark-mode" : ""} // Add this line
                  >
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                      <Viewer
                        fileUrl={getProxyUrl(paper.pdf_url)}
                        plugins={[defaultLayoutPluginInstance]}
                        theme={isPdfDarkMode ? 'light' : 'light'}
                        onSwitchTheme={handleSwitchTheme}
                      />
                    </Worker>
                  </Box>
                </HStack>
              </DialogBody>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}