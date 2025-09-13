import arxiv
import json
from datetime import datetime, timedelta, timezone
import os
import logging
import time
from typing import List, Dict, Any

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scraper.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def fetch_arxiv_papers(days: int = 90) -> List[Dict[str, Any]]:
    """Fetch arXiv papers from the last N days for all categories using the new Client API."""
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Format dates for arXiv query
    start_str = start_date.strftime("%Y%m%d%H%M")
    end_str = end_date.strftime("%Y%m%d%H%M")
    
    # Build query: date range only (no category filter)
    query = f"submittedDate:[{start_str} TO {end_str}]"
    
    logger.info(f"Fetching papers from {start_date} to {end_date}")
    logger.info(f"Query: {query}")
    
    # Use the new Client API
    client = arxiv.Client()
    search = arxiv.Search(
        query=query,
        max_results=5000,  # Increased to get more papers
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending
    )
    
    papers = []
    try:
        # Use the client to get results
        for result in client.results(search):
            paper = {
                "id": result.entry_id,
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "abstract": result.summary,
                "pdf_url": result.pdf_url,
                "published": result.published.isoformat(),
                "categories": result.categories,
                "primary_category": result.primary_category
            }
            papers.append(paper)
            
            # Log progress every 100 papers
            if len(papers) % 100 == 0:
                logger.info(f"Fetched {len(papers)} papers so far...")
                
    except Exception as e:
        logger.error(f"Error fetching papers: {e}")
        logger.info(f"Successfully fetched {len(papers)} papers before error")
    
    return papers

def fetch_in_chunks(days: int = 90, chunk_size: int = 30) -> List[Dict[str, Any]]:
    """
    Fetch papers in smaller chunks to avoid API limits and empty page errors.
    
    Args:
        days: Total days to fetch
        chunk_size: Number of days per chunk
    """
    all_papers = []
    utc_now = datetime.now(timezone.utc)
    os.makedirs("public/data", exist_ok=True)
    
    # Calculate number of chunks
    num_chunks = (days + chunk_size - 1) // chunk_size
    
    for i in range(num_chunks):
        # Calculate chunk dates
        end_date = datetime.now() - timedelta(days=i * chunk_size)
        start_date = end_date - timedelta(days=min(chunk_size, days - i * chunk_size))
        
        # Format dates for arXiv query
        start_str = start_date.strftime("%Y%m%d%H%M")
        end_str = end_date.strftime("%Y%m%d%H%M")
        
        query = f"submittedDate:[{start_str} TO {end_str}]"
        logger.info(f"Fetching chunk {i+1}/{num_chunks}: {start_date} to {end_date}")
        
        client = arxiv.Client()
        search = arxiv.Search(
            query=query,
            max_results=2000,
            sort_by=arxiv.SortCriterion.SubmittedDate,
            sort_order=arxiv.SortOrder.Descending
        )
        
        chunk_papers = []
        try:
            for result in client.results(search):
                paper = {
                    "id": result.entry_id,
                    "title": result.title,
                    "authors": [author.name for author in result.authors],
                    "abstract": result.summary,
                    "pdf_url": result.pdf_url,
                    "published": result.published.isoformat(),
                    "categories": result.categories,
                    "primary_category": result.primary_category
                }
                chunk_papers.append(paper)
            
            logger.info(f"Fetched {len(chunk_papers)} papers from chunk {i+1}")
            all_papers.extend(chunk_papers)
            
            if i < num_chunks - 1:
                logger.info("Waiting 5 seconds before next chunk...")
                time.sleep(5)
                
        except Exception as e:
            # Save what we have so far
            logger.error(f"Fatal error fetching chunk {i+1}: {e}")
            logger.info(f"Saving {len(all_papers)} papers collected so far before waiting...")
            
            filename = f"public/data/{utc_now.strftime('%Y-%m-%d')}_partial.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(all_papers, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Saved partial data to {filename}. Waiting 60 seconds before retry...")
            time.sleep(60)  # Wait before retrying
            logger.info("Retrying chunk after wait...")
            
            # Retry logic: try the same chunk again
            try:
                for result in client.results(search):
                    paper = {
                        "id": result.entry_id,
                        "title": result.title,
                        "authors": [author.name for author in result.authors],
                        "abstract": result.summary,
                        "pdf_url": result.pdf_url,
                        "published": result.published.isoformat(),
                        "categories": result.categories,
                        "primary_category": result.primary_category
                    }
                    chunk_papers.append(paper)
                
                logger.info(f"Fetched {len(chunk_papers)} papers from chunk {i+1} after retry")
                all_papers.extend(chunk_papers)
            except Exception as retry_e:
                logger.error(f"Second attempt failed for chunk {i+1}: {retry_e}")
                logger.info(f"Skipping chunk {i+1} and continuing...")
                continue

    return all_papers

if __name__ == "__main__":
    utc_now = datetime.now(timezone.utc)
    logger.info("Starting arXiv scraper...")

    # Fetch papers from last 90 days (3 months) using chunked approach
    try:
        papers = fetch_in_chunks(days=90, chunk_size=30)
        logger.info(f"Total papers fetched: {len(papers)}")
        
        # Create data directory if it doesn't exist
        os.makedirs("/data", exist_ok=True)
        
        # Save to JSON file
        filename = f"/data/{utc_now.strftime('%Y-%m-%d')}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(papers, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(papers)} papers to {filename}")
        
    except Exception as e:
        logger.error(f"Unexpected error in main: {e}")