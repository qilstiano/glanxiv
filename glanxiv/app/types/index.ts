// app/types/index.ts
export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  pdf_url: string;
  published: string;
  categories: string[];
  primary_category: string;
}

export interface DatabasePaper {
  id: number;
  arxiv_id: string;
  title: string;
  abstract: string;
  pdf_url: string;
  published: string;
  primary_category: string;
  created_at: string;
  updated_at: string;
  authors: string[];
  categories: string[];
}