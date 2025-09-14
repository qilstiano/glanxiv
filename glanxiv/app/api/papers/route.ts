import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dailyDir = path.join(process.cwd(), 'scraping', 'daily');
    if (!fs.existsSync(dailyDir)) {
      return NextResponse.json({ error: 'Daily folder not found' }, { status: 404 });
    }

    const files = fs.readdirSync(dailyDir).filter(f => f.endsWith('.json'));
    const allPapers = [];

    for (const file of files) {
      const filePath = path.join(dailyDir, file);
      const fileData = fs.readFileSync(filePath, 'utf8');
      try {
        const json = JSON.parse(fileData);
        allPapers.push(...json);
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e);
      }
    }

    return NextResponse.json(allPapers);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
