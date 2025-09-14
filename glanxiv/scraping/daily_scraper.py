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
        logging.FileHandler("daily_scraper.log"),
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

def fetch_daily_papers() -> List[Dict[str, Any]]:
    """
    Fetch arXiv papers for the current day only.
    """
    utc_now = datetime.now(timezone.utc)
    logger.info(f"Starting daily arXiv scraper for {utc_now.date()}...")
    
    # Create directory for daily files
    script_dir = os.path.dirname(os.path.abspath(__file__))
    daily_dir = os.path.join(script_dir, "daily")
    os.makedirs(daily_dir, exist_ok=True)
    
    # Fetch papers for today
    day_papers = fetch_papers_for_day(utc_now)
    
    # Save today's papers
    if day_papers:
        day_filename = os.path.join(daily_dir, f"{utc_now.strftime('%Y-%m-%d')}.json")
        save_partial_results(day_papers, day_filename)
        
        # Also update the latest.json file
        latest_filename = os.path.join(script_dir, "public", "data", "latest.json")
        save_partial_results(day_papers, latest_filename)
    
    return day_papers

if __name__ == "__main__":
    try:
        papers = fetch_daily_papers()
        logger.info(f"Daily scrape completed. Fetched {len(papers)} papers.")
    except Exception as e:
        logger.error(f"Unexpected error in daily scraper: {e}")