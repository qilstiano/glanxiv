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
import { ExternalLink, GripVertical, Eye, EyeOff, MoonStar, Sun, Expand } from 'lucide-react'
import { Paper } from '../app/types'
import { useState, useRef, useEffect } from 'react'

// Import react-katex for LaTeX rendering
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

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
    ['#ff6b6b', '#4ecdc4', '#1dd1a1'],
    ['#45b7d1', '#96ceb4', '#00c6ff'],
    ['#feca57', '#ff9ff3', '#f368e0'],
    ['#54a0ff', '#5f27cd', '#48dbfb'],
    ['#00d2d3', '#54a0ff', '#6a11cb'],
    ['#ff9ff3', '#f368e0', '#c56cf0'],
    ['#48dbfb', '#0abde3', '#10ac84'],
    ['#10ac84', '#1dd1a1', '#11998e'],
    ['#ee5a24', '#ff9ff3', '#ff7e5f'],
    ['#c56cf0', '#ffb8b8', '#fc5c7d'],
  ]

  return colors[Math.floor(Math.random() * colors.length)]
}

// Enhanced LaTeX parser component with better error handling
const EnhancedLatexText = ({ text, isDark, fontSize = "sm", ...props }: { 
  text: string; 
  isDark: boolean;
  fontSize?: string;
  [key: string]: any;
}) => {
  if (!text) return null;

  try {
    // Enhanced regex patterns for various LaTeX formats
    const patterns = [
      // Display math: \[...\] or $$...$$
      /(\\\[.*?\\\]|\$\$.*?\$\$)/gs,
      // Inline math: \(...\) or $...$
      /(\\\(.*?\\\)|\$.*?\$)/gs,
      // Common LaTeX environments
      /(\\begin\{.*?\}.*?\\end\{.*?\})/gs,
    ];

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Process each pattern
    patterns.forEach((pattern) => {
      const matches = [...text.matchAll(pattern)];
      
      matches.forEach((match) => {
        const [fullMatch] = match;
        const matchIndex = text.indexOf(fullMatch, lastIndex);
        
        if (matchIndex > lastIndex) {
          // Add text before the match
          elements.push(text.slice(lastIndex, matchIndex));
        }
        
        try {
          let cleanedMath = fullMatch;
          
          // Clean different LaTeX delimiters
          if (cleanedMath.startsWith('\\[') && cleanedMath.endsWith('\\]')) {
            cleanedMath = cleanedMath.slice(2, -2);
            elements.push(
              <Box key={`${matchIndex}-block`} my={1}>
                <BlockMath math={cleanedMath} />
              </Box>
            );
          } 
          else if (cleanedMath.startsWith('$$') && cleanedMath.endsWith('$$')) {
            cleanedMath = cleanedMath.slice(2, -2);
            elements.push(
              <Box key={`${matchIndex}-block`} my={1}>
                <BlockMath math={cleanedMath} />
              </Box>
            );
          }
          else if (cleanedMath.startsWith('\\(') && cleanedMath.endsWith('\\)')) {
            cleanedMath = cleanedMath.slice(2, -2);
            elements.push(<InlineMath key={`${matchIndex}-inline`} math={cleanedMath} />);
          }
          else if (cleanedMath.startsWith('$') && cleanedMath.endsWith('$')) {
            cleanedMath = cleanedMath.slice(1, -1);
            elements.push(<InlineMath key={`${matchIndex}-inline`} math={cleanedMath} />);
          }
          else {
            // Handle LaTeX environments
            elements.push(
              <Box key={`${matchIndex}-env`} my={1}>
                <BlockMath math={cleanedMath} />
              </Box>
            );
          }
        } catch (error) {
          // Fallback to raw text if KaTeX parsing fails
          elements.push(fullMatch);
        }
        
        lastIndex = matchIndex + fullMatch.length;
      });
    });

    // Add any remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return (
      <Text 
        fontSize={fontSize} 
        color={isDark ? "gray.300" : "gray.600"}
        lineHeight="1.4"
        {...props}
      >
        {elements.length > 0 ? elements : text}
      </Text>
    );
  } catch (error) {
    // Fallback for any parsing errors
    return (
      <Text 
        fontSize={fontSize} 
        color={isDark ? "gray.300" : "gray.600"}
        lineHeight="1.4"
        {...props}
      >
        {text}
      </Text>
    );
  }
};

// Enhanced title component with LaTeX support
const EnhancedLatexTitle = ({ title, isDark, ...props }: { 
  title: string; 
  isDark: boolean;
  [key: string]: any;
}) => {
  return (
    <Text
      color="white"
      fontWeight="bold"
      fontSize="lg"
      lineHeight="1.2"
      textShadow="0 1px 2px rgba(0,0,0,0.2)"
      _hover={{ textDecoration: 'none' }}
      fontFamily="var(--font-instrument-serif)"
      {...props}
    >
      <EnhancedLatexText text={title} isDark={isDark} fontSize="lg" />
    </Text>
  );
};

// Preprocessing function to handle common LaTeX patterns that might be missing delimiters
const preprocessLatex = (text: string): string => {
  if (!text) return text;
  
  // Common patterns that might need delimiters added
  const patterns = [
    // Greek letters and common symbols
    /\\[a-zA-Z]+/g,
    // Subscripts: x_2, x_{abc}
    /[a-zA-Z]_\{?[0-9a-zA-Z]+\}?/g,
    // Superscripts: x^2, x^{abc}
    /[a-zA-Z]\^\{?[0-9a-zA-Z]+\}?/g,
    // Fractions: \frac{a}{b}
    /\\frac\{.*?\}\{.*?\}/g,
    // Matrices and arrays
    /\\begin\{.*matrix\}.*?\\end\{.*matrix\}/gs,
  ];

  let processed = text;
  
  // For very mathematical text, we might need to add $ delimiters around obvious math
  const hasMathContent = patterns.some(pattern => pattern.test(text));
  
  if (hasMathContent && !text.includes('$') && !text.includes('\\[')) {
    // This is a heuristic - if it looks like math but has no delimiters, wrap it
    processed = `$${text}$`;
  }
  
  return processed;
};

export default function PaperCard({ paper, isDark }: PaperCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [gradient] = useState(getRandomGradient())
  const [splitPosition, setSplitPosition] = useState(50)
  const [isResizing, setIsResizing] = useState(false)
  const [isPdfDarkMode, setIsPdfDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pdf-theme') === 'dark';
    }
    return false;
  });
  const [showSummary, setShowSummary] = useState(true)
  const dialogRef = useRef<HTMLDivElement>(null)
  
  const getProxyUrl = (url: string) => {
    return `https://corsproxy.io/?${encodeURIComponent(url)}`;
  };

  const handleSwitchTheme = (theme: string) => {
    const isDark = theme === 'dark';
    setIsPdfDarkMode(isDark);
    localStorage.setItem('pdf-theme', theme);
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const getTruncatedAbstract = () => {
    if (!paper.abstract || paper.abstract.length <= 300) return paper.abstract;
    
    const truncated = paper.abstract.substring(0, 300);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclamation = truncated.lastIndexOf('!');
    
    const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
    
    if (lastSentenceEnd > 100) {
      return paper.abstract.substring(0, lastSentenceEnd + 1) + '..';
    }
    
    return paper.abstract.substring(0, 200) + '...';
  };

  const displayAbstract = getTruncatedAbstract();
  const processedTitle = preprocessLatex(paper.title);
  const processedAbstract = preprocessLatex(displayAbstract || '');
  const processedFullAbstract = preprocessLatex(paper.abstract || '');
  
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !dialogRef.current) return;
      
      const dialogRect = dialogRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - dialogRect.left) / dialogRect.width) * 100;
      
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

  const toggleSummary = () => {
    setShowSummary(!showSummary);
    if (showSummary) {
      setSplitPosition(100);
    } else {
      setSplitPosition(50);
    }
  };

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

        /* Improved Katex styling */
        .katex {
          font-size: 1.05em !important;
        }

        .katex-display {
          margin: 0.8em 0 !important;
          overflow-x: auto;
          overflow-y: hidden;
        }

        .katex-display > .katex {
          display: inline-block;
          white-space: nowrap;
        }

        /* Better inline math alignment */
        .katex .base {
          vertical-align: middle;
        }
      `}</style>

      <Card.Root 
        bg={isDark ? "gray.800" : "white"} 
        _hover={{ transform: 'translateY(-4px)' }} 
        transition="all 0.2s"
        overflow="hidden"
        height="auto"
        minHeight="320px"
        maxHeight="500px"
      >
        {/* Title with gradient background */}
        <Box 
          position="relative"
          h="120px"
          background={`linear-gradient(to right, ${gradient[0]}, ${gradient[1]}, ${gradient[2]})`}
          p={4}
          display="flex"
          alignItems="flex-end"
          cursor="pointer"
          onClick={handleTitleClick}
        >
          <EnhancedLatexTitle title={processedTitle} isDark={isDark} />
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
                color="white"
              >
                <Tag.Label>#{paper.primary_category}</Tag.Label>
              </Tag.Root>
              {paper.categories?.filter(cat => cat !== paper.primary_category).slice(0, 2).map((category, index) => (
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
              {paper.categories?.length > 3 && (
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

            {/* Abstract with enhanced LaTeX support */}
            <EnhancedLatexText text={processedAbstract} isDark={isDark} />

            {/* Authors and date */}
            <VStack align="start" gap={1} w="full">
              <Text 
                fontSize="xs" 
                color={isDark ? "gray.400" : "gray.500"}
                fontStyle="italic"
                lineHeight="1.2"
              >
                by {paper.authors?.slice(0, 3).join(', ') || 'Unknown authors'}
              </Text>
              <Text 
                fontSize="xs" 
                color={isDark ? "gray.500" : "gray.400"}
                fontFamily="var(--font-geist-mono)"
              >
                {paper.published ? new Date(paper.published).toLocaleDateString() : 'Date unknown'}
              </Text>
            </VStack>

            {/* Expand button and Visit arXiv button */}
            <HStack w="full" justify="space-between" mt={2}>
              {paper.abstract && paper.abstract.length > 200 && (
                <Button
                  variant={isDark ? "outline" : "solid"}
                  size="sm"
                  colorPalette={"gray"}
                  onClick={() => setIsExpanded(true)}
                  color={isDark ? "orange" : "black"}
                >
                  <Expand size={14} color={isDark ? "orange" : "black"}/>
                  Read more
                </Button>
              )}
              
              <Button
                as="a"
                size="sm"
                variant={isDark ? "outline" : "solid"}
                ml="auto"
                color={isDark ? "white" : "gray"}
                colorPalette={"gray"}
                _hover={{ textDecoration: 'underline' }}
                rel="noopener noreferrer"
              >
                <ExternalLink size={16} />
                <a href={paper.pdf_url} target="_blank">arXiv</a>
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Expanded view dialog */}
      <Dialog.Root 
        open={isExpanded} 
        onOpenChange={() => setIsExpanded(false)}>
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
                background={isDark ? "black" : "white"}
                pr={10}
                py={3}
                px={4}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <EnhancedLatexTitle 
                  title={processedTitle} 
                  isDark={isDark}
                  fontSize="xl"
                  color={isDark ? "white" : "gray.900"}
                  flex="1"
                  mr={4}
                />
                
                {/* Header controls */}
                <HStack gap={5}>
                  <IconButton
                    variant="plain"
                    size="sm"
                    onClick={togglePdfDarkMode}
                    aria-label={isPdfDarkMode ? "Light mode" : "Dark mode"}
                    title={isPdfDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {isPdfDarkMode ? <Sun size={16} color="#df7b1eff"/> : <MoonStar size={16} color="#588fe2ff"/>}
                    {isPdfDarkMode ? <Text color="#df7b1eff" fontFamily="var(--font-geist-mono)"> Light </Text> : <Text color="#588fe2ff" fontFamily="var(--font-geist-mono)"> Dark </Text> }
                  </IconButton>
                  
                  <IconButton
                    variant="plain"
                    size="md"
                    onClick={toggleSummary}
                    aria-label={showSummary ? "Hide summary" : "Show summary"}
                    title={showSummary ? "Hide summary" : "Show summary"}
                  >
                    {showSummary ? <EyeOff size={16} /> : <Eye size={16} />}
                    <Text fontFamily="var(--font-geist-mono)"> Toggle summary </Text>
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
                        width="8px"
                        height="50px"
                        borderRadius="full"
                        bg={isDark ? "gray.500" : "gray.400"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                      >
                        <GripVertical />
                      </Box>
                    </Box>
                  )}
                  
                  {/* Paper details with LaTeX support */}
                  {showSummary && (
                    <Box 
                      flex={isMobile ? 1 : `0 0 ${splitPosition}%`}
                      p={6} 
                      overflowY="auto" 
                      h="full"
                      fontFamily="var(--font-geist)"
                      minW={isMobile ? "100%" : "30%"}
                    >
                      <VStack align="start" gap={4} h="full">
                        <HStack gap={2} flexWrap="wrap">
                          {paper.categories?.map((category, index) => (
                            <Tag.Root 
                              key={index}
                              size="sm"
                              colorPalette={category === paper.primary_category ? "blue" : "gray"}
                              borderRadius="full"
                              fontFamily="var(--font-geist-mono)"
                              color="white"
                            >
                              <Tag.Label>#{category}</Tag.Label>
                            </Tag.Root>
                          ))}
                        </HStack>
                        
                        {/* Full abstract with LaTeX support */}
                        <EnhancedLatexText 
                          text={processedFullAbstract} 
                          isDark={isDark}
                          lineHeight="1.6"
                          fontFamily="var(--font-geist)"
                        />
                        
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
                            {paper.authors?.join(', ') || 'Unknown authors'}
                          </Text>
                          
                          <Text 
                            fontSize="xs" 
                            color={isDark ? "gray.500" : "gray.400"}
                            fontFamily="var(--font-geist-mono)"
                            mt={2}
                          >
                            Published: {paper.published ? new Date(paper.published).toLocaleDateString() : 'Date unknown'}
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
                          <a href={paper.pdf_url} target="_blank">Open PDF in new tab</a>

                        </Button>
                      </VStack>
                    </Box>
                  )}
                  
                  {/* PDF preview */}
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
                    className={isPdfDarkMode ? "pdf-dark-mode" : ""}
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