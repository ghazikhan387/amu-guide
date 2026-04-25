import { Message } from '@/types';
import { InferenceClient } from '@huggingface/inference';

const SYSTEM_PROMPT = `You are AMU Assistant, a helpful chatbot that answers questions about Aligarh Muslim University (AMU). Use ONLY the context provided below to answer the user's question. If the answer is not in the context, say "I don't have information about that. Please check the official AMU website at amu.ac.in."

Answer in clear, concise English. Do not make up information. Format your response with proper paragraphs and use bullet points or numbered lists when listing multiple items.`;

const FALLBACK_MESSAGE =
  "I don't have enough information to answer that question accurately. Please check the official AMU website at [amu.ac.in](https://www.amu.ac.in) for the most up-to-date details, or try rephrasing your question.";

function getClient() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing HUGGINGFACE_API_KEY environment variable.');
  }
  return new InferenceClient(apiKey);
}

// Mistral is no longer free-tier supported for text-gen, we use a highly reliable supported model
const getModel = () => process.env.HF_GENERATION_MODEL || 'Qwen/Qwen2.5-Coder-32B-Instruct';

/**
 * Build messages array for the chat completion API
 */
function buildMessages(
  context: string,
  query: string,
  history: Pick<Message, 'role' | 'content'>[]
) {
  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  // Add recent conversation history
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
  }

  // Add the current query with context
  let finalContent = `Current question: ${query}`;
  if (context) {
    finalContent = `Context:\n${context}\n\n${finalContent}`;
  }
  messages.push({ role: 'user', content: finalContent });

  return messages;
}

export async function generateAnswer(
  context: string,
  query: string,
  history: Pick<Message, 'role' | 'content'>[]
): Promise<string> {
  if (!context || context.trim().length === 0) {
    return FALLBACK_MESSAGE;
  }

  try {
    const client = getClient();
    const messages = buildMessages(context, query, history);

    const result = await client.chatCompletion({
      model: getModel(),
      messages,
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.95,
    });

    if (result.choices && result.choices.length > 0 && result.choices[0].message?.content) {
      return result.choices[0].message.content.trim();
    }
  } catch (error) {
    console.error('HF Generation API error:', error);
    throw new Error('Generation model unavailable');
  }

  return FALLBACK_MESSAGE;
}

export async function generateAnswerStream(
  context: string,
  query: string,
  history: Pick<Message, 'role' | 'content'>[]
): Promise<ReadableStream<Uint8Array>> {
  if (!context || context.trim().length === 0) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(FALLBACK_MESSAGE));
        controller.close();
      },
    });
  }

  const messages = buildMessages(context, query, history);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const client = getClient();
        
        for await (const chunk of client.chatCompletionStream({
          model: getModel(),
          messages,
          max_tokens: 512,
          temperature: 0.7,
          top_p: 0.95,
        })) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (error) {
        console.error('HF Generation stream error:', error);
        controller.error(error);
      }
    },
  });
}
