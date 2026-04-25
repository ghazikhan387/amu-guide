import { createServerClient } from './supabase';
import { embedText } from './embeddings';
import { MatchedChunk } from '@/types';

/**
 * Retrieve the most relevant document chunks for a given query.
 * Embeds the query → calls Supabase match_documents RPC → returns top-k results.
 */
export async function retrieveChunks(
  query: string,
  topK: number = 5,
  threshold: number = 0.5
): Promise<MatchedChunk[]> {
  // 1. Embed the user's query
  const queryEmbedding = await embedText(query);

  // 2. Search for matching documents in Supabase
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: topK,
    match_threshold: threshold,
  });

  if (error) {
    console.error('Supabase retrieval error:', error);
    throw new Error(`Failed to retrieve documents: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data as MatchedChunk[];
}

/**
 * Build the context string from retrieved chunks.
 * Used to inject relevant knowledge into the generation prompt.
 */
export function buildContext(chunks: MatchedChunk[]): string {
  if (chunks.length === 0) {
    return '';
  }

  return chunks
    .map(
      (chunk, i) =>
        `[Source: ${chunk.source_file}] (Relevance: ${(chunk.similarity * 100).toFixed(1)}%)\n${chunk.content}`
    )
    .join('\n\n---\n\n');
}
