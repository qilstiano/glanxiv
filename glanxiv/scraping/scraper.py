import arxiv
import json
from datetime import datetime, timedelta, timezone
import os
import logging
import time
import argparse
from typing import List, Dict, Any, Tuple

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
        max_results=2000,  # Increased to handle more papers
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

def get_existing_dates(daily_dir: str) -> set:
    """Get set of dates that already have data files."""
    existing_dates = set()
    if os.path.exists(daily_dir):
        for filename in os.listdir(daily_dir):
            if filename.endswith('.json'):
                try:
                    date_str = filename.split('.')[0]
                    existing_dates.add(date_str)
                except:
                    continue
    return existing_dates

def fetch_arxiv_papers_day_by_day(start_date: datetime = None, 
                                 end_date: datetime = None,
                                 days: int = None,
                                 daily_dir: str = None) -> List[Dict[str, Any]]:
    """
    Fetch arXiv papers day by day to handle failures gracefully.
    
    Args:
        start_date: Start date for scraping (inclusive)
        end_date: End date for scraping (inclusive)
        days: Number of days to go back from today (alternative to date range)
        daily_dir: Directory to store daily files
    """
    utc_now = datetime.now(timezone.utc)
    
    # Determine date range
    if days is not None:
        # Use days parameter
        end_date = utc_now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = end_date - timedelta(days=days-1)
    elif start_date and end_date:
        # Use provided date range
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        # Default to today only
        start_date = utc_now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date
    
    # Ensure daily_dir is set
    if daily_dir is None:
        daily_dir = f"scraping/daily/{utc_now.strftime('%Y-%m-%d')}"
    
    # Create directory for daily files
    os.makedirs(daily_dir, exist_ok=True)
    
    # Get existing dates to avoid re-scraping
    existing_dates = get_existing_dates(daily_dir)
    
    all_papers = []
    current_date = start_date
    total_days = (end_date - start_date).days + 1
    
    logger.info(f"Processing {total_days} days from {start_date.date()} to {end_date.date()}")
    
    # Process each day individually
    for day_num in range(total_days):
        current_date = start_date + timedelta(days=day_num)
        day_filename = f"{daily_dir}/{current_date.strftime('%Y-%m-%d')}.json"
        
        # Skip if we already have data for this day
        if current_date.strftime('%Y-%m-%d') in existing_dates:
            logger.info(f"Already processed {current_date.date()}, skipping...")
            try:
                with open(day_filename, "r", encoding="utf-8") as f:
                    day_papers = json.load(f)
                all_papers.extend(day_papers)
                continue
            except Exception as e:
                logger.error(f"Error loading existing data for {current_date.date()}: {e}")
        
        # Fetch papers for this day
        day_papers = fetch_papers_for_day(current_date)
        
        # Save day's papers immediately
        if day_papers:
            save_partial_results(day_papers, day_filename)
            all_papers.extend(day_papers)
        else:
            # Save empty array to mark this day as processed
            save_partial_results([], day_filename)
        
        # Wait a bit between days to be nice to the API
        if day_num < total_days - 1:
            logger.info("Waiting 3 seconds before next day...")
            time.sleep(3)
    
    return all_papers

def parse_date(date_str: str) -> datetime:
    """Parse date string in YYYY-MM-DD format."""
    return datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)

def main():
    """Main function with command line arguments."""
    parser = argparse.ArgumentParser(description="arXiv paper scraper")
    parser.add_argument("--days", type=int, help="Number of days to scrape back from today")
    parser.add_argument("--start-date", type=str, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end-date", type=str, help="End date (YYYY-MM-DD)")
    parser.add_argument("--daily", action="store_true", help="Scrape only today's papers")
    parser.add_argument("--output-dir", type=str, help="Custom output directory")
    
    args = parser.parse_args()
    
    utc_now = datetime.now(timezone.utc)
    logger.info("Starting arXiv scraper...")
    
    # Set output directory
    if args.output_dir:
        daily_dir = args.output_dir
    else:
        daily_dir = f"scraping/daily"
    
    # Determine scraping mode
    if args.daily:
        # Scrape only today
        start_date = utc_now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date
        days = None
    elif args.days:
        # Scrape last N days
        days = args.days
        start_date = None
        end_date = None
    elif args.start_date and args.end_date:
        # Scrape custom date range
        start_date = parse_date(args.start_date)
        end_date = parse_date(args.end_date)
        days = None
    else:
        # Default: scrape today only
        start_date = utc_now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date
        days = None
    
    # Fetch papers
    try:
        papers = fetch_arxiv_papers_day_by_day(
            start_date=start_date,
            end_date=end_date,
            days=days,
            daily_dir=daily_dir
        )
        
        logger.info(f"Total papers fetched: {len(papers)}")
        
        # Save combined results if we scraped multiple days
        if (args.days and args.days > 1) or (args.start_date and args.end_date and args.start_date != args.end_date):
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

if __name__ == "__main__":
    main()