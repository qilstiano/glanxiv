#!/usr/bin/env python3
import json
import os
import glob
from datetime import datetime, timedelta
import re

def update_status():
    daily_dir = 'daily'
    status_file = 'scraping_status.json'
    current_directory = os.getcwd()
    status_file = os.path.join(current_directory, 'glanxiv', 'scraping', status_file)
    daily_dir = os.path.join(current_directory, 'glanxiv', 'scraping', 'daily')
    print(f"current dir: {daily_dir}")
    
    # Get all JSON files in daily directory
    json_files = glob.glob(os.path.join(daily_dir, '*.json'))
    
    if not json_files:
        print("No JSON files found in daily directory")
        return
    
    # Extract dates from filenames (assuming format like YYYY-MM-DD.json)
    dates = []
    date_pattern = re.compile(r'(\d{4}-\d{2}-\d{2})\.json$')
    
    for file_path in json_files:
        match = date_pattern.search(file_path)
        if match:
            dates.append(match.group(1))
    
    if not dates:
        print("No valid date files found")
        return
    
    # Sort dates
    dates.sort()
    earliest_date = dates[0]
    latest_date = dates[-1]
    
    # Read existing status or create new
    if os.path.exists(status_file):
        with open(status_file, 'r') as f:
            status = json.load(f)
    else:
        status = {
            "earliest_scraped": earliest_date,
            "latest_scraped": latest_date,
            "last_updated": datetime.now().isoformat()
        }
    
    # Update dates if new extremes are found
    if earliest_date < status.get("earliest_scraped", "9999-99-99"):
        status["earliest_scraped"] = earliest_date
    
    if latest_date > status.get("latest_scraped", "0000-00-00"):
        status["latest_scraped"] = latest_date
    
    status["last_updated"] = datetime.now().isoformat()
    status["total_files"] = len(json_files)
    
    # Write updated status
    with open(status_file, 'w') as f:
        json.dump(status, f, indent=2)
    
    print(f"Status updated: earliest={status['earliest_scraped']}, latest={status['latest_scraped']}")

if __name__ == "__main__":
    update_status()