import { InferenceClient } from '@huggingface/inference';

// Create a singleton client or instantiate inside the functions if environment variables are checked at runtime.
function getClient() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing HUGGINGFACE_API_KEY environment variable.');
  }
  return new InferenceClient(apiKey);
}

const getModel = () => process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

/**
 * Embed a single text string using Hugging Face Inference API.
 * Returns a float array (vector) of the configured embedding dimension.
 */
export async function embedText(text: string): Promise<number[]> {
  const client = getClient();
  const result = await client.featureExtraction({
    model: getModel(),
    inputs: text,
  });
  
  // The SDK might return an array of arrays or flat array depending on the result shape
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0] as number[];
  }
  
  return result as number[];
}

/**
 * Embed multiple texts in batch.
 * More efficient than calling embedText() individually.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const client = getClient();
  const result = await client.featureExtraction({
    model: getModel(),
    inputs: texts,
  });

  return result as number[][];
}
