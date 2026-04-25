/**
 * AMU Assistant — Knowledge Base Ingestion Script
 *
 * Usage: npx tsx scripts/ingest.ts
 *
 * This script:
 * 1. Reads all .md files from /data/knowledge/
 * 2. Parses frontmatter and strips markdown
 * 3. Splits content into overlapping chunks (~512 tokens)
 * 4. Embeds each chunk via Hugging Face API
 * 5. Upserts chunks into Supabase documents table
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

// Dynamic imports after env is loaded
const { createClient } = await import('@supabase/supabase-js');

// ============================================
// Configuration
// ============================================
const KNOWLEDGE_DIR = path.resolve(process.cwd(), 'data/knowledge');
const CHUNK_SIZE = 512; // Target tokens per chunk (approximated by words)
const CHUNK_OVERLAP = 50; // Overlap tokens between chunks
const HF_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction';

// ============================================
// Helpers
// ============================================

/**
 * Strip markdown syntax to get plain text
 */
function stripMarkdown(content: string): string {
  return content
    // Remove frontmatter
    .replace(/^---[\s\S]*?---\n*/m, '')
    // Remove headers
    .replace(/#{1,6}\s+/g, '')
    // Remove bold/italic
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove blockquotes
    .replace(/^\s*>\s*/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Collapse multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Split text into overlapping chunks
 * Respects section boundaries (double newlines) as natural split points
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  if (words.length <= chunkSize) {
    return [words.join(' ')];
  }

  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(' ');
    chunks.push(chunk);

    if (end >= words.length) break;
    start = end - overlap;
  }

  return chunks;
}

/**
 * Embed text using Hugging Face API
 */
async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

  if (!apiKey) {
    throw new Error('Missing HUGGINGFACE_API_KEY');
  }

  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return Array.isArray(result[0]) ? result[0] : result;
}

/**
 * Embed texts in batch with rate limiting
 */
async function embedBatch(texts: string[], batchSize: number = 5): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(batch.map(embedText));
    embeddings.push(...batchEmbeddings);

    // Rate limiting: wait 500ms between batches
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    process.stdout.write(`  Embedded ${Math.min(i + batchSize, texts.length)}/${texts.length} chunks\r`);
  }

  console.log('');
  return embeddings;
}

// ============================================
// Main Ingestion Logic
// ============================================
async function main() {
  console.log('🚀 AMU Assistant — Knowledge Base Ingestion');
  console.log('==========================================\n');

  // Validate environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!process.env.HUGGINGFACE_API_KEY) {
    console.error('❌ Missing HUGGINGFACE_API_KEY');
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Read all markdown files
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`❌ Knowledge directory not found: ${KNOWLEDGE_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    console.error('❌ No .md files found in knowledge directory');
    process.exit(1);
  }

  console.log(`📁 Found ${files.length} knowledge files\n`);

  const startTime = Date.now();
  let totalChunks = 0;

  for (const file of files) {
    const filePath = path.join(KNOWLEDGE_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');

    console.log(`📄 Processing: ${file}`);

    // 1. Parse frontmatter
    const { content } = matter(raw);

    // 2. Strip markdown
    const plainText = stripMarkdown(content);

    if (!plainText.trim()) {
      console.log(`  ⚠️  Empty content, skipping`);
      continue;
    }

    // 3. Chunk text
    const chunks = chunkText(plainText, CHUNK_SIZE, CHUNK_OVERLAP);
    console.log(`  📝 Created ${chunks.length} chunks`);

    // 4. Embed chunks
    console.log(`  🔄 Embedding chunks...`);
    const embeddings = await embedBatch(chunks);

    // 5. Delete existing chunks for this file
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('source_file', file);

    if (deleteError) {
      console.error(`  ❌ Error deleting old chunks: ${deleteError.message}`);
      continue;
    }

    // 6. Prepare records for upsert
    const records = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
      source_file: file,
      chunk_index: index,
    }));

    // 7. Batch upsert into Supabase
    const { error: insertError } = await supabase
      .from('documents')
      .insert(records);

    if (insertError) {
      console.error(`  ❌ Error inserting chunks: ${insertError.message}`);
      continue;
    }

    console.log(`  ✅ Upserted ${chunks.length} chunks for ${file}`);
    totalChunks += chunks.length;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n==========================================');
  console.log(`✅ Ingestion complete!`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Total chunks: ${totalChunks}`);
  console.log(`   Time taken: ${elapsed}s`);
  console.log('==========================================');
}

main().catch((error) => {
  console.error('❌ Ingestion failed:', error);
  process.exit(1);
});
