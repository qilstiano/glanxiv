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
# Reduce verbosity of arxiv library logs
logging.getLogger('arxiv').setLevel(logging.WARNING)

def save_partial_results(papers: List[Dict[str, Any]], filename: str) -> None:
    """Save partial results to a file."""
    try:
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(papers, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved partial data to {filename}")
    except Exception as e:
        logger.error(f"Failed to save partial results: {e}")

def fetch_arxiv_papers_in_chunks(days: int = 90, chunk_size: int = 30) -> List[Dict[str, Any]]:
    """
    Fetch arXiv papers in smaller chunks to avoid API limits and empty page errors.
    
    Args:
        days: Total days to fetch
        chunk_size: Number of days per chunk
    """
    all_papers = []
    utc_now = datetime.now(timezone.utc)
    partial_filename = f"public/data/{utc_now.strftime('%Y-%m-%d')}_partial.json"
    
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
        logger.info(f"Fetching chunk {i+1}/{num_chunks}: {start_date.date()} to {end_date.date()}")
        
        # Use the new Client API correctly
        client = arxiv.Client()
        search = arxiv.Search(
            query=query,
            max_results=2000,
            sort_by=arxiv.SortCriterion.SubmittedDate,
            sort_order=arxiv.SortOrder.Descending
        )
        
        chunk_papers = []
        try:
            # Use client.results() instead of search.results()
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
            
            # Save progress after each successful chunk
            save_partial_results(all_papers, partial_filename)
            
            if i < num_chunks - 1:
                logger.info("Waiting 5 seconds before next chunk...")
                time.sleep(5)
                
        except arxiv.UnexpectedEmptyPageError as e:
            # Handle empty page errors specifically
            logger.warning(f"Empty page in chunk {i+1}, continuing with next chunk...")
            continue
        except Exception as e:
            # Save what we have so far immediately
            logger.error(f"Error fetching chunk {i+1}: {e}")
            save_partial_results(all_papers, partial_filename)
            
            logger.info("Waiting 60 seconds before retry...")
            time.sleep(60)
            
            # Retry logic
            try:
                logger.info(f"Retrying chunk {i+1}...")
                chunk_papers = []
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
                save_partial_results(all_papers, partial_filename)
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
        papers = fetch_arxiv_papers_in_chunks(days=90, chunk_size=30)
        logger.info(f"Total papers fetched: {len(papers)}")
        
        os.makedirs("public/data", exist_ok=True)
        filename = f"public/data/{utc_now.strftime('%Y-%m-%d')}.json"

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(papers, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(papers)} papers to {filename}")
        
        # Remove partial file if full run completed successfully
        partial_filename = f"public/data/{utc_now.strftime('%Y-%m-%d')}_partial.json"
        if os.path.exists(partial_filename):
            os.remove(partial_filename)
            logger.info(f"Removed partial file {partial_filename}")
            
    except Exception as e:
        logger.error(f"Unexpected error in main: {e}")
        # Save whatever we have if main fails
        if 'papers' in locals():
            save_partial_results(papers, f"public/data/{utc_now.strftime('%Y-%m-%d')}_emergency.json")