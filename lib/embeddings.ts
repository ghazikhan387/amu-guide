const HF_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction';

/**
 * Embed a single text string using Hugging Face Inference API.
 * Returns a float array (vector) of the configured embedding dimension.
 */
export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

  if (!apiKey) {
    throw new Error('Missing HUGGINGFACE_API_KEY environment variable.');
  }

  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text,
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HF Embedding API error (${response.status}): ${errorText}`
    );
  }

  const result = await response.json();

  // The API returns a nested array for single input: [[0.1, 0.2, ...]]
  // or a flat array [0.1, 0.2, ...] depending on the model
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0];
  }

  return result;
}

/**
 * Embed multiple texts in batch.
 * More efficient than calling embedText() individually.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

  if (!apiKey) {
    throw new Error('Missing HUGGINGFACE_API_KEY environment variable.');
  }

  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: texts,
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HF Embedding API error (${response.status}): ${errorText}`
    );
  }

  return await response.json();
}
