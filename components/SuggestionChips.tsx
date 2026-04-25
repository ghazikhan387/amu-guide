import { Suggestion } from '@/types';

interface SuggestionChipsProps {
  suggestions: Suggestion[];
  onSelect: (text: string) => void;
}

export default function SuggestionChips({
  suggestions,
  onSelect,
}: SuggestionChipsProps) {
  return (
    <div className="animate-fade-in grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion.text)}
          className="suggestion-chip group text-left"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{suggestion.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amu-500 dark:text-amu-400">
              {suggestion.category}
            </span>
          </div>
          <p className="text-sm leading-snug text-surface-700 transition-colors group-hover:text-surface-900 dark:text-surface-300 dark:group-hover:text-white">
            {suggestion.text}
          </p>
        </button>
      ))}
    </div>
  );
}
