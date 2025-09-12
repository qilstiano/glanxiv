import arxiv
import json
from datetime import datetime, timedelta, timezone
import os

def fetch_arxiv_papers(category="cs.CV", days=1):
    """Fetch arXiv papers from the last N days for a given category."""
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Format dates for arXiv query
    start_str = start_date.strftime("%Y%m%d%H%M")
    end_str = end_date.strftime("%Y%m%d%H%M")
    
    # Build query: category + date range
    query = f"cat:{category} AND submittedDate:[{start_str} TO {end_str}]"
    
    # Search arXiv
    search = arxiv.Search(
        query=query,
        max_results=100,
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending
    )
    
    papers = []
    for result in search.results():
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
    
    return papers

if __name__ == "__main__":

    utc_now = datetime.now(timezone.utc)

    # Fetch papers from last 7 days
    papers = fetch_arxiv_papers(category="cs.CV", days=7)
    
    # Create data directory if it doesn't exist
    os.makedirs("public/data", exist_ok=True)
    
    # Save to JSON file
    filename = f"public/data/{utc_now.strftime('%Y-%m-%d')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(papers, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(papers)} papers to {filename}")