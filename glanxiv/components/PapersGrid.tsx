// components/PapersGrid.tsx
import { SimpleGrid, Center, Text, For, Box } from '@chakra-ui/react'
import PaperCard from './PaperCard'
import { Paper } from '../app/types'

interface PapersGridProps {
  papers: Paper[]
  isDark: boolean
}

export default function PapersGrid({ papers, isDark }: PapersGridProps) {
  if (papers.length === 0) {
    return (
      <Center py={12}>
        <Text color={isDark ? "gray.400" : "gray.500"} fontSize="lg">
          No papers found. Try a different search term or check back later.
        </Text>
      </Center>
    )
  }

  return (
    <Box>
      <SimpleGrid 
        columns={{ base: 1, sm: 2, md: 3, lg: 3 }} 
        gap={6}
      >
        <For each={papers}>
          {(paper) => (
            <Box key={paper.id}>
              <PaperCard paper={paper} isDark={isDark} />
            </Box>
          )}
        </For>
      </SimpleGrid>
    </Box>
  )
}