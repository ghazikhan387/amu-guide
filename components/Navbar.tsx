'use client';

interface NavbarProps {
  onNewChat: () => void;
  hasMessages: boolean;
}

export default function Navbar({ onNewChat, hasMessages }: NavbarProps) {
  return (
    <nav className="glass-navbar sticky top-0 z-50 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amu-500 to-amu-600 shadow-md">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-surface-900 dark:text-white">
              AMU Assistant
            </h1>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Aligarh Muslim University Guide
            </p>
          </div>
        </div>

        {/* New Chat Button */}
        {hasMessages && (
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-700 shadow-sm transition-all duration-200 hover:border-amu-300 hover:bg-amu-50 hover:text-amu-600 active:scale-95 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-amu-400 dark:hover:bg-surface-700 dark:hover:text-amu-300"
          >
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
            >
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
            </svg>
            New Chat
          </button>
        )}
      </div>
    </nav>
  );
}
