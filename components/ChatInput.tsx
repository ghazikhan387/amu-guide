'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              isLoading
                ? 'AMU Assistant is thinking...'
                : 'Ask about AMU — admissions, departments, campus life...'
            }
            rows={1}
            className="w-full resize-none rounded-2xl border border-surface-200 bg-white px-4 py-3 pr-12 text-sm leading-relaxed text-surface-900 placeholder-surface-400 shadow-sm outline-none transition-all duration-200 focus:border-amu-400 focus:ring-2 focus:ring-amu-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-white dark:placeholder-surface-500 dark:focus:border-amu-500 dark:focus:ring-amu-900 sm:text-[15px]"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amu-500 to-amu-600 text-white shadow-md transition-all duration-200 hover:from-amu-600 hover:to-amu-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-md"
        >
          {isLoading ? (
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          )}
        </button>
      </div>

      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-surface-400 dark:text-surface-500">
        AMU Assistant can make mistakes. Verify important information at{' '}
        <a
          href="https://www.amu.ac.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amu-500 hover:underline dark:text-amu-400"
        >
          amu.ac.in
        </a>
      </p>
    </div>
  );
}
