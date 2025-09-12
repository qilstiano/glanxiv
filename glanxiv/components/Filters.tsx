// components/Filters.tsx
import { HStack, Text } from '@chakra-ui/react'

interface FiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  paperCount: number
  isDark: boolean
}

export default function Filters({
  paperCount,
  isDark
}: FiltersProps) {
  return (
    <HStack justify="space-between" align="center" mb={6}>
      <Text 
        color={isDark ? "gray.400" : "gray.600"} 
        fontSize="sm"
        fontFamily="var(--font-geist-mono)"
      >
        Showing {paperCount} papers from {new Date().toLocaleDateString()}
      </Text>
    </HStack>
  )
}