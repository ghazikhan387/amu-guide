import { Message } from '@/types';

const HF_API_URL = 'https://api-inference.huggingface.co/models';

const SYSTEM_PROMPT = `You are AMU Assistant, a helpful chatbot that answers questions about Aligarh Muslim University (AMU). Use ONLY the context provided below to answer the user's question. If the answer is not in the context, say "I don't have information about that. Please check the official AMU website at amu.ac.in."

Answer in clear, concise English. Do not make up information. Format your response with proper paragraphs and use bullet points or numbered lists when listing multiple items.`;

const FALLBACK_MESSAGE =
  "I don't have enough information to answer that question accurately. Please check the official AMU website at [amu.ac.in](https://www.amu.ac.in) for the most up-to-date details, or try rephrasing your question.";

/**
 * Build the full prompt for the generation model.
 * Uses Mistral instruct format: [INST] ... [/INST]
 */
function buildPrompt(
  context: string,
  query: string,
  history: Pick<Message, 'role' | 'content'>[]
): string {
  let prompt = `<s>[INST] ${SYSTEM_PROMPT}\n\n`;

  if (context) {
    prompt += `Context:\n${context}\n\n`;
  }

  // Include recent conversation history (last 6 messages max)
  const recentHistory = history.slice(-6);
  if (recentHistory.length > 0) {
    prompt += 'Previous conversation:\n';
    for (const msg of recentHistory) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      prompt += `${role}: ${msg.content}\n`;
    }
    prompt += '\n';
  }

  prompt += `Current question: ${query} [/INST]`;

  return prompt;
}

/**
 * Generate an answer using the Hugging Face Inference API.
 * Returns the generated text as a string.
 */
export async function generateAnswer(
  context: string,
  query: string,
  history: Pick<Message, 'role' | 'content'>[]
): Promise<string> {
  // If no context was retrieved, return the fallback message
  if (!context || context.trim().length === 0) {
    return FALLBACK_MESSAGE;
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model =
    process.env.HF_GENERATION_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

  if (!apiKey) {
    throw new Error('Missing HUGGINGFACE_API_KEY environment variable.');
  }

  const prompt = buildPrompt(context, query, history);

  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.15,
        return_full_text: false,
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`HF Generation API error (${response.status}):`, errorText);
    throw new Error(`Generation model unavailable (${response.status})`);
  }

  const result = await response.json();

  // HF Inference API returns [{ generated_text: "..." }]
  if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
    return result[0].generated_text.trim();
  }

  return FALLBACK_MESSAGE;
}

/**
 * Generate a streaming answer using the Hugging Face Inference API.
 * Returns a ReadableStream of text tokens.
 */
export async function generateAnswerStream(
  context: string,
  query: string,
  history: Pick<Message, 'role' | 'content'>[]
): Promise<ReadableStream<Uint8Array>> {
  // If no context was retrieved, return a stream with the fallback message
  if (!context || context.trim().length === 0) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(FALLBACK_MESSAGE));
        controller.close();
      },
    });
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model =
    process.env.HF_GENERATION_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

  if (!apiKey) {
    throw new Error('Missing HUGGINGFACE_API_KEY environment variable.');
  }

  const prompt = buildPrompt(context, query, history);

  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.15,
        return_full_text: false,
      },
      stream: true,
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`HF Generation API error (${response.status}):`, errorText);
    throw new Error(`Generation model unavailable (${response.status})`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async pull(controller) {
      if (!reader) {
        controller.close();
        return;
      }

      try {
        const { done, value } = await reader.read();

        if (done) {
          controller.close();
          return;
        }

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter((line) => line.startsWith('data:'));

        for (const line of lines) {
          const jsonStr = line.slice(5).trim();
          if (jsonStr === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const token = parsed.token?.text || '';
            if (token) {
              controller.enqueue(encoder.encode(token));
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
