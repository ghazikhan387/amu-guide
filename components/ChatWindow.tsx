'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { suggestions as suggestionData, welcomeMessage } from '@/config/suggestions';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SuggestionChips from './SuggestionChips';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestionClick: (text: string) => void;
}

export default function ChatWindow({
  messages,
  isLoading,
  onSuggestionClick,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
    >
      <div className="mx-auto max-w-3xl">
        {isEmpty ? (
          /* ===== Welcome Screen ===== */
          <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center px-4 py-12">
            {/* AMU Logo / Icon */}
            <div className="animate-pulse-glow mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amu-500 to-amu-600 shadow-xl">
              <span className="text-3xl font-bold text-white">A</span>
            </div>

            {/* Welcome Text */}
            <h2 className="mb-2 text-center text-2xl font-bold text-surface-900 dark:text-white sm:text-3xl">
              {welcomeMessage.title}
            </h2>
            <p className="mb-10 max-w-md text-center text-sm leading-relaxed text-surface-500 dark:text-surface-400 sm:text-base">
              {welcomeMessage.subtitle}
            </p>

            {/* Suggestion Chips */}
            <div className="w-full max-w-xl">
              <SuggestionChips
                suggestions={suggestionData}
                onSelect={onSuggestionClick}
              />
            </div>
          </div>
        ) : (
          /* ===== Message Thread ===== */
          <div className="space-y-1 py-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
