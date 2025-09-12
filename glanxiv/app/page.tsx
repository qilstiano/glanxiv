'use client'

import { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import Header from '../components/Header'
import ErrorDisplay from '../components/ErrorDisplay'
import PapersGrid from '../components/PapersGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import { Paper } from './types'

// Sample data fallback
const sampleData: Paper[] = [
  {
    id: "http://arxiv.org/abs/2509.09680v1",
    title: "FLUX-Reason-6M & PRISM-Bench: A Million-Scale Text-to-Image Reasoning Dataset and Comprehensive Benchmark",
    authors: ["Rongyao Fang", "Aldrich Yu", "Chengqi Duan", "Linjiang Huang", "Shuai Bai", "Yuxuan Cai", "Kun Wang", "Si Liu", "Xihui Liu", "Hongsheng Li"],
    abstract: "The advancement of open-source text-to-image (T2I) models has been hindered by the absence of large-scale, reasoning-focused datasets and comprehensive evaluation benchmarks. To address this gap, we introduce FLUX-Reason-6M, a comprehensive dataset containing 6 million text-to-image pairs with detailed reasoning annotations. This dataset enables fine-grained evaluation of T2I models' ability to understand and generate images based on complex textual descriptions involving spatial relationships, object interactions, and abstract concepts.",
    pdf_url: "http://arxiv.org/pdf/2509.09680v1",
    published: "2025-09-11T17:59:59+00:00",
    categories: ["cs.CV", "cs.CL", "cs.AI"],
    primary_category: "cs.CV"
  },
  {
    id: "http://arxiv.org/abs/2509.09681v1", 
    title: "Neural Architecture Search for Efficient Vision Transformers",
    authors: ["Sarah Chen", "Michael Rodriguez", "Jennifer Kim"],
    abstract: "Vision Transformers (ViTs) have achieved remarkable performance in computer vision tasks, but their computational complexity remains a significant challenge for deployment in resource-constrained environments. We propose a novel neural architecture search (NAS) approach specifically designed for discovering efficient ViT architectures that maintain high accuracy while reducing computational overhead.",
    pdf_url: "http://arxiv.org/pdf/2509.09681v1",
    published: "2025-09-11T16:30:00+00:00", 
    categories: ["cs.CV", "cs.LG"],
    primary_category: "cs.CV"
  },
  // Add more sample papers as needed
]

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
    </Box>
  )
}