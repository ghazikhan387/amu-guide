export default function TypingIndicator() {
  return (
    <div className="animate-message-in flex items-start gap-3 px-4 py-2">
      {/* Bot Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amu-500 to-amu-600 text-xs font-bold text-white shadow-sm">
        A
      </div>

      {/* Typing Dots */}
      <div className="chat-bubble-bot inline-flex items-center gap-1 px-5 py-3">
        <span
          className="inline-block h-2 w-2 rounded-full bg-amu-400 animate-typing-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-amu-400 animate-typing-bounce"
          style={{ animationDelay: '200ms' }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-amu-400 animate-typing-bounce"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  );
}
