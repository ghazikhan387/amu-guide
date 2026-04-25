import * as fs from 'fs';
import * as path from 'path';

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

import { createServerClient } from '../lib/supabase';
import { embedText } from '../lib/embeddings';
import { retrieveChunks } from '../lib/retrieval';

async function main() {
  try {
    const supabase = createServerClient();
    
    const q = 'vice chancellor';
    
    console.log('Testing retrieveChunks with q:', q);
    const chunks = await retrieveChunks(q, 5, 0.5);
    console.log(`Found ${chunks.length} chunks`);
    
    // Test raw query
    const queryEmbedding = await embedText(q);
    const { data: d1, error: e1 } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: 5,
      match_threshold: -1,
    });
    console.log('Raw RPC match count (threshold -1):', d1?.length, e1);
    
    if (d1 && Array.isArray(d1)) {
      console.log('Top similarities:', d1.map((x: any) => x.similarity));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
