import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Define TypeScript interfaces
interface PaperData {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  pdf_url: string;
  published: string;
  categories: string[];
  primary_category: string;
}

interface PaperResult {
  id: number;
}

interface AuthorResult {
  id: number;
}

interface CategoryResult {
  id: number;
}

// Database connection with correct SSL configuration
let sql: postgres.Sql;

async function initializeDatabaseConnection(): Promise<void> {
  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    console.log('Testing database connection...');
    
    sql = postgres(connectionString, {
      max: 20,
      idle_timeout: 20,
      connect_timeout: 30,
      ssl: 'require',
      transform: {
        undefined: null,
      },
      onnotice: () => {},
      connection: {
        application_name: 'arxiv-import-script',
      }
    });

    console.log('✅ Database connection established');
    
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connection test successful');
    
  } catch (error) {
    console.error('❌ Failed to create database connection:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function importJsonToPostgres(): Promise<void> {
  await initializeDatabaseConnection();

  const dataDir = path.resolve(process.cwd(), 'scraping', 'daily');
  
  console.log('Looking for data in:', dataDir);
  
  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Data directory not found: ${dataDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
  
  if (files.length === 0) {
    console.error('❌ No JSON files found in data directory');
    process.exit(1);
  }
  
  console.log(`✅ Found ${files.length} JSON files to process`);
  
  try {
    await createTables();
    await ensureConstraints(); // Add this to ensure constraints exist
    
    let totalProcessed = 0;
    let totalErrors = 0;
    
    for (const file of files) {
      console.log(`\n📄 Processing ${file}...`);
      
      try {
        const filePath = path.join(dataDir, file);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const papers: PaperData[] = JSON.parse(fileData);
        
        console.log(`📊 Found ${papers.length} papers in ${file}`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const paper of papers) {
          try {
            await upsertPaper(paper);
            successCount++;
            
            if (successCount % 50 === 0) {
              console.log(`   Processed ${successCount}/${papers.length} papers from ${file}...`);
            }
          } catch (error) {
            console.error(`   ❌ Error processing paper ${paper.id}:`, error instanceof Error ? error.message : 'Unknown error');
            errorCount++;
            
            // If it's a constraint error, try the fallback insert
            if (error instanceof Error && error.message.includes('constraint')) {
              console.log('   🟡 Trying fallback insert...');
              try {
                await insertPaperFallback(paper);
                successCount++;
                errorCount--;
                console.log('   ✅ Fallback insert successful');
              } catch (fallbackError) {
                console.error('   ❌ Fallback insert also failed:', fallbackError instanceof Error ? fallbackError.message : 'Unknown error');
              }
            }
          }
        }
        
        console.log(`✅ Completed ${file}: ${successCount} successful, ${errorCount} failed`);
        totalProcessed += successCount;
        totalErrors += errorCount;
        
      } catch (error) {
        console.error(`❌ Error processing file ${file}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log(`\n🎉 Import completed! Total: ${totalProcessed} successful, ${totalErrors} failed`);
    
  } catch (error) {
    console.error('❌ Database error:', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    if (sql) {
      await sql.end();
      console.log('🔌 Database connection closed');
    }
  }
}

async function ensureConstraints(): Promise<void> {
  console.log('Ensuring constraints exist...');
  
  try {
    // Check if papers table has arxiv_id unique constraint
    const hasArxivIdConstraint = await sql`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'papers' 
      AND constraint_name = 'papers_arxiv_id_key'
    `;
    
    if (hasArxivIdConstraint.length === 0) {
      console.log('Adding unique constraint to papers.arxiv_id...');
      await sql`ALTER TABLE papers ADD CONSTRAINT papers_arxiv_id_key UNIQUE (arxiv_id)`;
    }
    
    // Check if authors table has name unique constraint
    const hasAuthorNameConstraint = await sql`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'authors' 
      AND constraint_name = 'authors_name_key'
    `;
    
    if (hasAuthorNameConstraint.length === 0) {
      console.log('Adding unique constraint to authors.name...');
      await sql`ALTER TABLE authors ADD CONSTRAINT authors_name_key UNIQUE (name)`;
    }
    
    // Check if categories table has name unique constraint
    const hasCategoryNameConstraint = await sql`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'categories' 
      AND constraint_name = 'categories_name_key'
    `;
    
    if (hasCategoryNameConstraint.length === 0) {
      console.log('Adding unique constraint to categories.name...');
      await sql`ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name)`;
    }
    
    console.log('✅ All constraints verified');
  } catch (error) {
    console.error('❌ Error ensuring constraints:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function createTables(): Promise<void> {
  console.log('Creating tables if they don\'t exist...');
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS papers (
        id SERIAL PRIMARY KEY,
        arxiv_id TEXT NOT NULL,
        title TEXT NOT NULL,
        abstract TEXT,
        pdf_url TEXT,
        published TIMESTAMPTZ,
        primary_category TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS authors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS paper_authors (
        paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
        author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
        author_order INTEGER,
        PRIMARY KEY (paper_id, author_id)
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS paper_categories (
        paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (paper_id, category_id)
      )
    `;
    
    console.log('✅ Tables created/verified');
  } catch (error) {
    console.error('❌ Error creating tables:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function upsertPaper(paperData: PaperData): Promise<void> {
  const arxivId = paperData.id.split('/').pop() || paperData.id;
  
  await sql.begin(async (sql) => {
    // Upsert paper
    const paperResult = await sql<PaperResult[]>`
      INSERT INTO papers (arxiv_id, title, abstract, pdf_url, published, primary_category, updated_at)
      VALUES (${arxivId}, ${paperData.title}, ${paperData.abstract}, ${paperData.pdf_url}, ${paperData.published}, ${paperData.primary_category}, NOW())
      ON CONFLICT (arxiv_id) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        abstract = EXCLUDED.abstract,
        pdf_url = EXCLUDED.pdf_url,
        published = EXCLUDED.published,
        primary_category = EXCLUDED.primary_category,
        updated_at = NOW()
      RETURNING id
    `;
    
    const paperId = paperResult[0].id;
    
    // Process authors
    for (let order = 0; order < paperData.authors.length; order++) {
      const authorName = paperData.authors[order];
      
      // Upsert author
      const authorResult = await sql<AuthorResult[]>`
        INSERT INTO authors (name) 
        VALUES (${authorName})
        ON CONFLICT (name) 
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      
      const authorId = authorResult[0].id;
      
      // Link author to paper
      await sql`
        INSERT INTO paper_authors (paper_id, author_id, author_order)
        VALUES (${paperId}, ${authorId}, ${order})
        ON CONFLICT (paper_id, author_id) 
        DO UPDATE SET author_order = EXCLUDED.author_order
      `;
    }
    
    // Process categories
    const uniqueCategories = [...new Set([paperData.primary_category, ...paperData.categories])];
    
    for (const categoryName of uniqueCategories) {
      if (!categoryName) continue;
      
      // Upsert category
      const categoryResult = await sql<CategoryResult[]>`
        INSERT INTO categories (name) 
        VALUES (${categoryName})
        ON CONFLICT (name) 
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      
      const categoryId = categoryResult[0].id;
      
      // Link category to paper
      await sql`
        INSERT INTO paper_categories (paper_id, category_id)
        VALUES (${paperId}, ${categoryId})
        ON CONFLICT (paper_id, category_id) DO NOTHING
      `;
    }
  });
}

// Fallback function for when constraints don't exist
async function insertPaperFallback(paperData: PaperData): Promise<void> {
  const arxivId = paperData.id.split('/').pop() || paperData.id;
  
  await sql.begin(async (sql) => {
    // First check if paper exists
    const existingPaper = await sql<PaperResult[]>`
      SELECT id FROM papers WHERE arxiv_id = ${arxivId}
    `;
    
    let paperId: number;
    
    if (existingPaper.length > 0) {
      // Update existing paper
      paperId = existingPaper[0].id;
      await sql`
        UPDATE papers SET
          title = ${paperData.title},
          abstract = ${paperData.abstract},
          pdf_url = ${paperData.pdf_url},
          published = ${paperData.published},
          primary_category = ${paperData.primary_category},
          updated_at = NOW()
        WHERE id = ${paperId}
      `;
      
      // Remove existing associations
      await sql`DELETE FROM paper_authors WHERE paper_id = ${paperId}`;
      await sql`DELETE FROM paper_categories WHERE paper_id = ${paperId}`;
    } else {
      // Insert new paper
      const paperResult = await sql<PaperResult[]>`
        INSERT INTO papers (arxiv_id, title, abstract, pdf_url, published, primary_category)
        VALUES (${arxivId}, ${paperData.title}, ${paperData.abstract}, ${paperData.pdf_url}, ${paperData.published}, ${paperData.primary_category})
        RETURNING id
      `;
      paperId = paperResult[0].id;
    }
    
    // Process authors
    for (let order = 0; order < paperData.authors.length; order++) {
      const authorName = paperData.authors[order];
      
      // Check if author exists
      let authorResult = await sql<AuthorResult[]>`
        SELECT id FROM authors WHERE name = ${authorName}
      `;
      
      let authorId: number;
      
      if (authorResult.length > 0) {
        authorId = authorResult[0].id;
      } else {
        // Insert new author
        const newAuthorResult = await sql<AuthorResult[]>`
          INSERT INTO authors (name) VALUES (${authorName}) RETURNING id
        `;
        authorId = newAuthorResult[0].id;
      }
      
      // Link author to paper
      await sql`
        INSERT INTO paper_authors (paper_id, author_id, author_order)
        VALUES (${paperId}, ${authorId}, ${order})
        ON CONFLICT (paper_id, author_id) 
        DO UPDATE SET author_order = EXCLUDED.author_order
      `;
    }
    
    // Process categories
    const uniqueCategories = [...new Set([paperData.primary_category, ...paperData.categories])];
    
    for (const categoryName of uniqueCategories) {
      if (!categoryName) continue;
      
      // Check if category exists
      let categoryResult = await sql<CategoryResult[]>`
        SELECT id FROM categories WHERE name = ${categoryName}
      `;
      
      let categoryId: number;
      
      if (categoryResult.length > 0) {
        categoryId = categoryResult[0].id;
      } else {
        // Insert new category
        const newCategoryResult = await sql<CategoryResult[]>`
          INSERT INTO categories (name) VALUES (${categoryName}) RETURNING id
        `;
        categoryId = newCategoryResult[0].id;
      }
      
      // Link category to paper
      await sql`
        INSERT INTO paper_categories (paper_id, category_id)
        VALUES (${paperId}, ${categoryId})
        ON CONFLICT (paper_id, category_id) DO NOTHING
      `;
    }
  });
}

// Run the import
importJsonToPostgres()
  .then(() => {
    console.log('✅ Import completed successfully');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('❌ Import failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  });