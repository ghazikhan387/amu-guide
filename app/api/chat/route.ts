import { NextRequest, NextResponse } from 'next/server';
import { retrieveChunks, buildContext } from '@/lib/retrieval';
import { generateAnswer } from '@/lib/generation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, history = [] } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "query" field.' },
        { status: 400 }
      );
    }

    console.log(`[/api/chat] Query: "${query.substring(0, 100)}..."`);

    // 1. Retrieve relevant document chunks
    let chunks;
    try {
      chunks = await retrieveChunks(query, 5, 0.25);
    } catch (retrievalError) {
      console.error('[/api/chat] Retrieval error:', retrievalError);
      return NextResponse.json(
        {
          answer:
            "I'm having trouble accessing my knowledge base right now. Please try again in a moment.",
          sources: [],
        },
        { status: 200 }
      );
    }

    console.log(`[/api/chat] Retrieved ${chunks.length} chunks`);

    // 2. Build context from retrieved chunks
    const context = buildContext(chunks);
    const sources = [...new Set(chunks.map((c) => c.source_file))];

    // 3. Generate answer using the LLM
    let answer: string;
    try {
      answer = await generateAnswer(context, query, history);
    } catch (generationError) {
      console.error('[/api/chat] Generation error:', generationError);
      return NextResponse.json(
        {
          answer:
            "I'm sorry, the AI model is currently unavailable. Please try again shortly. In the meantime, you can visit [amu.ac.in](https://www.amu.ac.in) for information.",
          sources: [],
        },
        { status: 200 }
      );
    }

    // 4. Return the response
    return NextResponse.json({
      answer,
      sources,
    });
  } catch (error) {
    console.error('[/api/chat] Unexpected error:', error);
    return NextResponse.json(
      {
        answer:
          'An unexpected error occurred. Please try again.',
        sources: [],
      },
      { status: 200 }
    );
  }
}
