import React, { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { LuGithub, LuStar } from 'react-icons/lu';
import './GithubButton.css'; // We'll create this CSS file

interface GithubButtonProps {
  username: string;
  repo: string;
  isScrolled?: boolean;
  localIsDark?: boolean;
}

interface GitHubRepoResponse {
  stargazers_count: number;
}

const GithubButton: React.FC<GithubButtonProps> = ({ 
  username = "qilstiano", 
  repo = "glanxiv", 
  isScrolled = false, 
  localIsDark = true 
}) => {
  const [starCount, setStarCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStarCount = async (): Promise<void> => {
      try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}`);
        const data: GitHubRepoResponse = await response.json();
        setStarCount(data.stargazers_count || 0);
      } catch (error) {
        console.error('Error fetching star count:', error);
        setStarCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStarCount();
  }, [username, repo]);

  const handleClick = (): void => {
    window.open(`https://github.com/${username}/${repo}`, '_blank');
  };

  return (
    <Box display={{ base: 'none', md: 'block' }} className="github-button-container">
      <Box
        as="button"
        onClick={handleClick}
        className="glow-button"
        sx={{
          padding: isScrolled ? '6px 12px' : '8px 16px',
          fontSize: isScrolled ? '14px' : '16px',
        }}
      >
        <Box className="btn-inner">
          <Box gap={2} display="flex">
            <LuGithub size={18}/>
            <LuStar size={18} />
          </Box>
          <Text ml={1} color="rgba(255,255,255,0.7)">
            {loading ? "..." : starCount}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default GithubButton;