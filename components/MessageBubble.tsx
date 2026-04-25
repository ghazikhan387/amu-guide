import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

export default function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`animate-message-in flex items-start gap-3 px-4 py-2 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-200 dark:bg-surface-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-surface-600 dark:text-surface-300"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amu-500 to-amu-600 text-xs font-bold text-white shadow-sm">
          A
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[80%] sm:max-w-[70%] ${
          isUser ? 'chat-bubble-user' : 'chat-bubble-bot'
        } px-4 py-3 text-sm leading-relaxed sm:text-[15px]`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="bot-message-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Source badges for bot messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-surface-200 pt-2 dark:border-surface-700">
            <span className="text-xs text-surface-400">Sources:</span>
            {message.sources.map((source) => (
              <span
                key={source}
                className="rounded-full bg-amu-50 px-2 py-0.5 text-xs font-medium text-amu-600 dark:bg-amu-900 dark:text-amu-300"
              >
                {source.replace('.md', '')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
