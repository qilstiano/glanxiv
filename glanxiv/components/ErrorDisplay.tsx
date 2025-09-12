import { Box, Container, Text } from '@chakra-ui/react'

interface ErrorDisplayProps {
  error: string | null
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null
  
  return (
    <Box bg="red.50" borderBottomWidth="1px" py={2}>
      <Container maxW="7xl">
        <Text color="red.600" fontSize="sm">
          {error} (showing sample data)
        </Text>
      </Container>
    </Box>
  )
}