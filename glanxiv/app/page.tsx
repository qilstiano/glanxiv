'use client'

import { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import Header from '../components/Header'
import ErrorDisplay from '../components/ErrorDisplay'
import PapersGrid from '../components/PapersGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import { Paper } from './types'
import Footer from '@/components/Footer'

// Sample data fallback
const sampleData: Paper[] = []

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        console.log(`Fetching data for: ${today}`)
        
        const response = await fetch(`data/${today}.json`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Data fetched successfully:', data.length, 'papers')
          
          const validatedData = data.map((paper: Paper) => ({
            id: paper.id || '',
            title: paper.title || '',
            authors: paper.authors || [],
            abstract: paper.abstract || '',
            pdf_url: paper.pdf_url || '',
            published: paper.published || '',
            categories: paper.categories || [],
            primary_category: paper.primary_category || ''
          }))
          
          setPapers(validatedData)
          setError(null)
        } else {
          console.error('Failed to fetch data:', response.status, response.statusText)
          setError(`Failed to load data: ${response.status} ${response.statusText}`)
          setPapers(sampleData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setPapers(sampleData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter papers based on search term and selected category
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
      paper.categories.includes(selectedCategory) || 
      paper.primary_category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Box 
      minH="100vh" 
      bg={isDark ? "gray.900" : "gray.50"}
      color={isDark ? "white" : "gray.900"}
      fontFamily="var(--font-geist)"
      transition="all 0.3s ease"
    >
      <Header 
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <ErrorDisplay error={error} />

      <Box py={8} px={{ base: 4, md: 6 }} maxW="7xl" mx="auto">
        <PapersGrid papers={filteredPapers} isDark={isDark} />
      </Box>
      <Footer isDark={isDark}/>
    </Box>
  )
}