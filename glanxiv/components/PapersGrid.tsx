// components/PapersGrid.tsx
import { SimpleGrid, Center, Text, For, Box, Button, VStack } from '@chakra-ui/react'
import PaperCard from './PaperCard'
import { Paper } from '../app/types'
import { useState } from 'react'

interface PapersGridProps {
  papers: Paper[]
  isDark: boolean
  initialVisibleCount?: number
}

export default function PapersGrid({ papers, isDark, initialVisibleCount = 6 }: PapersGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount)
  const visiblePapers = papers.slice(0, visibleCount)

  if (papers.length === 0) {
    return (
      <Center py={12}>
        <Text color={isDark ? "gray.400" : "gray.500"} fontSize="lg">
          No papers found. Try a different search term or check back later.
        </Text>
      </Center>
    )
  }

  const hasMore = visibleCount < papers.length

  return (
    <VStack gap={6} align="stretch">
      <SimpleGrid 
        columns={{ base: 1, sm: 2, md: 3, lg: 3 }} 
        gap={6}
      >
        <For each={visiblePapers}>
          {(paper) => (
            <Box key={paper.id}>
              <PaperCard paper={paper} isDark={isDark} />
            </Box>
          )}
        </For>
      </SimpleGrid>

      {hasMore && (
        <Center>
          <Button
            onClick={() => setVisibleCount(prev => prev + initialVisibleCount)}
            colorPalette="blue"
            variant="outline"
          >
            Load More Papers
          </Button>
        </Center>
      )}
    </VStack>
  )
}
