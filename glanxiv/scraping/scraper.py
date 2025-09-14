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
        logger.info(f"Saved data to {filename}")
    except Exception as e:
        logger.error(f"Failed to save results: {e}")

def fetch_papers_for_day(day_date: datetime) -> List[Dict[str, Any]]:
    """
    Fetch arXiv papers for a specific day.
    
    Args:
        day_date: The date to fetch papers for
    """
    # Calculate date range for the specific day
    start_date = day_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_date = start_date + timedelta(days=1)
    
    # Format dates for arXiv query
    start_str = start_date.strftime("%Y%m%d%H%M")
    end_str = end_date.strftime("%Y%m%d%H%M")
    
    query = f"submittedDate:[{start_str} TO {end_str}]"
    logger.info(f"Fetching papers for {start_date.date()}")
    
    # Use the Client API
    client = arxiv.Client()
    search = arxiv.Search(
        query=query,
        max_results=1000,
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending
    )
    
    papers = []
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
            papers.append(paper)
        
        logger.info(f"Fetched {len(papers)} papers for {start_date.date()}")
        return papers
                
    except arxiv.UnexpectedEmptyPageError as e:
        # Handle empty page errors specifically
        logger.warning(f"Empty page for {start_date.date()}, skipping...")
        return []
    except Exception as e:
        logger.error(f"Error fetching papers for {start_date.date()}: {e}")
        return []

def fetch_arxiv_papers_day_by_day(days: int = 90) -> List[Dict[str, Any]]:
    """
    Fetch arXiv papers day by day to handle failures gracefully.
    
    Args:
        days: Number of days to go back
    """
    all_papers = []
    utc_now = datetime.now(timezone.utc)
    
    # Create directory for daily files
    daily_dir = f"public/data/daily/{utc_now.strftime('%Y-%m-%d')}"
    os.makedirs(daily_dir, exist_ok=True)
    
    # Process each day individually
    for day_offset in range(days):
        day_date = datetime.now() - timedelta(days=day_offset)
        day_filename = f"{daily_dir}/{day_date.strftime('%Y-%m-%d')}.json"
        
        # Skip if we already have data for this day
        if os.path.exists(day_filename):
            logger.info(f"Already processed {day_date.date()}, skipping...")
            try:
                with open(day_filename, "r", encoding="utf-8") as f:
                    day_papers = json.load(f)
                all_papers.extend(day_papers)
                continue
            except Exception as e:
                logger.error(f"Error loading existing data for {day_date.date()}: {e}")
        
        # Fetch papers for this day
        day_papers = fetch_papers_for_day(day_date)
        
        # Save day's papers immediately
        if day_papers:
            save_partial_results(day_papers, day_filename)
            all_papers.extend(day_papers)
        
        # Wait a bit between days to be nice to the API
        if day_offset < days - 1:
            logger.info("Waiting 3 seconds before next day...")
            time.sleep(3)
    
    return all_papers

if __name__ == "__main__":
    utc_now = datetime.now(timezone.utc)
    logger.info("Starting arXiv scraper...")

    # Fetch papers from last 90 days using day-by-day approach
    try:
        papers = fetch_arxiv_papers_day_by_day(days=90)
        logger.info(f"Total papers fetched: {len(papers)}")
        
        # Save combined results
        os.makedirs("public/data", exist_ok=True)
        filename = f"public/data/{utc_now.strftime('%Y-%m-%d')}.json"

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(papers, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(papers)} papers to {filename}")
            
    except Exception as e:
        logger.error(f"Unexpected error in main: {e}")
        # Save whatever we have if main fails
        if 'papers' in locals():
            save_partial_results(papers, f"public/data/{utc_now.strftime('%Y-%m-%d')}_emergency.json")