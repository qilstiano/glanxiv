import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the scraping status type
interface ScrapingStatus {
  earliest_scraped: string;
  latest_scraped: string;
  last_updated: string;
  total_files: number;
}

function isToday(dateString?: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    
    // Correct path - adjust based on your project structure
    // Since your file is at: C:\Users\qilst\Desktop\glanxiv\glanxiv\scraping\scraping_status.json
    // and the API is at: app/api/scraping/status/route.ts
    const statusFilePath = path.join(process.cwd(), 'scraping', 'scraping_status.json');
    
    console.log('Looking for status file at:', statusFilePath);
    
    // Check if the file exists
    if (!fs.existsSync(statusFilePath)) {
      console.log('Status file not found at:', statusFilePath);
      return NextResponse.json(
        { 
          error: 'Scraping status file not found',
          message: 'The scraping status file does not exist yet. It will be created after the first successful scrape.',
          expected_path: statusFilePath
        },
        { status: 404 }
      );
    }
    
    // Read and parse the status file
    const statusData = fs.readFileSync(statusFilePath, 'utf8');
    const status: ScrapingStatus = JSON.parse(statusData);
    
    // Calculate additional statistics if detailed is requested
    let additionalStats = {};
    if (detailed) {
      const dailyDir = path.join(process.cwd(), 'scraping', 'daily');
      let fileCount = 0;
      let totalSize = 0;
      
      if (fs.existsSync(dailyDir)) {
        const files = fs.readdirSync(dailyDir).filter(file => file.endsWith('.json'));
        fileCount = files.length;
        
        // Calculate total size of all JSON files
        totalSize = files.reduce((sum, file) => {
          const filePath = path.join(dailyDir, file);
          try {
            return sum + fs.statSync(filePath).size;
          } catch {
            return sum;
          }
        }, 0);
      }
      
      additionalStats = {
        file_count: fileCount,
        total_size_bytes: totalSize,
        total_size_mb: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
        status_file_path: statusFilePath
      };
    }

    // Prepare response
    const response = {
      status: {
        earliest_scraped: status.earliest_scraped,
        latest_scraped: status.latest_scraped,
        last_updated: status.last_updated,
        total_files: status.total_files,
        date_range_days: Math.ceil(
          (new Date(status.latest_scraped).getTime() - new Date(status.earliest_scraped).getTime()) / 
          (1000 * 60 * 60 * 24)
        ) + 1
      },
      ...(detailed && { details: additionalStats }),
      timestamps: {
        retrieved: new Date().toISOString()
      }
    };
    
    // Set cache headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vary': 'Accept-Encoding'
      }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to read scraping status',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { earliest_scraped, latest_scraped, total_files } = body;
    
    const statusFilePath = path.join(process.cwd(), 'scraping', 'scraping_status.json');
    
    const status: ScrapingStatus = {
      earliest_scraped: earliest_scraped || new Date().toISOString().split('T')[0],
      latest_scraped: latest_scraped || new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString(),
      total_files: total_files || 0
    };
    
    // Ensure directory exists
    const dirPath = path.dirname(statusFilePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write status file
    fs.writeFileSync(statusFilePath, JSON.stringify(status, null, 2));
    
    return NextResponse.json({
      message: 'Status updated successfully',
      status,
      file_path: statusFilePath
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update scraping status',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}