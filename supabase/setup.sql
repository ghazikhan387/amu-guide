-- ============================================
-- AMU Assistant — Supabase Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the documents table for storing knowledge chunks
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content     TEXT NOT NULL,
  embedding   VECTOR(384),            -- matches all-MiniLM-L6-v2 output dimension
  source_file TEXT NOT NULL,           -- e.g. 'admissions.md'
  chunk_index INT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Drop the old ivfflat index if it exists (it causes recall issues on small datasets with lists=100)
DROP INDEX IF EXISTS documents_embedding_idx;

-- 4. Create an HNSW index for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON documents
  USING hnsw (embedding vector_cosine_ops);

-- 5. Create the match_documents RPC function for semantic search
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(384),
  match_count     INT DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id          UUID,
  content     TEXT,
  source_file TEXT,
  similarity  FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.source_file,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Enable Row Level Security (RLS) on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 6. Create a policy that allows reading documents for everyone (public chatbot)
DROP POLICY IF EXISTS "Allow public read access on documents" ON documents;
CREATE POLICY "Allow public read access on documents"
  ON documents
  FOR SELECT
  USING (true);

-- 7. Create a policy for service role to manage documents (insert/update/delete)
DROP POLICY IF EXISTS "Allow service role full access on documents" ON documents;
CREATE POLICY "Allow service role full access on documents"
  ON documents
  FOR ALL
  USING (true)
  WITH CHECK (true);
