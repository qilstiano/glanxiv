import { Center, VStack, Spinner, Text } from '@chakra-ui/react'
import { useState } from 'react'

export default function LoadingSpinner() {

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
  
  const [gradient] = useState(getRandomGradient())
  return (
    <Center h="100vh" background={`linear-gradient(to right, ${gradient[0]}, ${gradient[1]})`}>
      <VStack fontFamily="var(--font-instrument-serif)">
        <Spinner size="xl" />
        <Text >Loading latest research...</Text>
      </VStack>
    </Center>
  )
}