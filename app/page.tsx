'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/types';
import Navbar from '@/components/Navbar';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isLoading) return;

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Build history for the API
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text, history }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Add bot response
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
          sources: data.sources,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error('Chat error:', error);

        // Add error message
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            "I'm sorry, I encountered an error while processing your question. Please try again in a moment. If the issue persists, check the official AMU website at [amu.ac.in](https://www.amu.ac.in).",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex h-full flex-col bg-surface-50 dark:bg-surface-950">
      <Navbar onNewChat={handleNewChat} hasMessages={messages.length > 0} />
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSuggestionClick={sendMessage}
      />
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
