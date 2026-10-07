import React from 'react';
import { Search, MessageSquare, Bookmark, Settings, Info, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentMode: 'quick-search' | 'chat' | 'ask-krishna' | 'library';
  onSelectMode: (mode: 'quick-search' | 'chat' | 'ask-krishna' | 'library') => void;
  onOpenSettings: () => void;
  onOpenHowItWorks: () => void;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenSettings,
  onOpenHowItWorks,
  bookmarkCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-parchment-100/90 backdrop-blur-md border-b border-parchment-300 shadow-subtle transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onSelectMode('quick-search')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vedic-amber to-vedic-crimson flex items-center justify-center text-white shadow-vedic group-hover:scale-105 transition-transform">
              <span className="font-serif font-bold text-xl">ॐ</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-xl sm:text-2xl tracking-wide text-vedic-indigo">
                  Dharma<span className="text-vedic-amber">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-vedic-amber/15 text-vedic-amber border border-vedic-amber/30">
                  BORI CE Citation-First
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Mahabharata Wisdom & Ethical Reflection
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-parchment-200/80 p-1.5 rounded-xl border border-parchment-300">
            <button
              type="button"
              onClick={() => onSelectMode('quick-search')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentMode === 'quick-search'
                  ? 'bg-white text-vedic-indigo shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-vedic-amber" />
              <span>Quick Search</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMode('chat')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentMode === 'chat'
                  ? 'bg-white text-vedic-indigo shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-vedic-terracotta" />
              <span>Chat</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMode('ask-krishna')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentMode === 'ask-krishna'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${currentMode === 'ask-krishna' ? 'text-white' : 'text-amber-600'}`} />
              <span>Ask Krishna</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => onSelectMode('library')}
              title="Saved Library & Bookmarks"
              className={`relative p-2 rounded-xl border transition-colors ${
                currentMode === 'library'
                  ? 'bg-vedic-amber text-white border-vedic-amber'
                  : 'text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white border-parchment-300'
              }`}
            >
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-vedic-crimson text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bookmarkCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenHowItWorks}
              title="How This Works & Principles"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white border border-parchment-300 transition-colors"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings & Display Preferences"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white border border-parchment-300 transition-colors"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
