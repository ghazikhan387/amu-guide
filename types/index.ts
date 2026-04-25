export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface Suggestion {
  id: string;
  text: string;
  icon: string;
  category: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  embedding: number[];
  source_file: string;
  chunk_index: number;
  created_at: string;
}

export interface MatchedChunk {
  id: string;
  content: string;
  source_file: string;
  similarity: number;
}

export interface ChatRequest {
  query: string;
  history: Pick<Message, 'role' | 'content'>[];
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}
