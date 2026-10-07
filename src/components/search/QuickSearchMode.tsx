import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Filter, Clock, X, ArrowRight, BookOpen, ShieldAlert } from 'lucide-react';
import { SearchResult, FilterOptions } from '../../types/guidance';
import { CorpusItem } from '../../types/mahabharata';
import { guidanceEngine } from '../../services/guidance_engine';
import { storageService } from '../../services/storage_service';
import { checkSafety } from '../../services/safety_service';
import { EXAMPLE_PROMPTS } from '../../data/example_prompts';
import { SearchFilters } from './SearchFilters';
import { ResultCard } from './ResultCard';

interface QuickSearchModeProps {
  onViewSource: (item: CorpusItem) => void;
  onShare: (item: CorpusItem) => void;
  onToggleBookmark: (item: CorpusItem) => void;
  onOpenSafetyModal: () => void;
  isBookmarked: (id: string) => boolean;
  initialQuery?: string;
}

export const QuickSearchMode: React.FC<QuickSearchModeProps> = ({
  onViewSource,
  onShare,
  onToggleBookmark,
  onOpenSafetyModal,
  isBookmarked,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [activeSafetyWarning, setActiveSafetyWarning] = useState<string | null>(null);

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(storageService.getSearchHistory());
  }, []);

  // Perform search whenever query or filters change
  useEffect(() => {
    const executedResults = guidanceEngine.search(query, filters);
    setResults(executedResults);
    const safety = checkSafety(query);
    setActiveSafetyWarning(safety.isDistress && safety.notice ? safety.notice : null);
  }, [query, filters]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      storageService.addSearchHistory(query);
      setSearchHistory(storageService.getSearchHistory());
    }
  };

  const handleSelectExample = (exampleQuery: string) => {
    setQuery(exampleQuery);
    storageService.addSearchHistory(exampleQuery);
    setSearchHistory(storageService.getSearchHistory());
  };

  const handleSelectHistory = (historyItem: string) => {
    setQuery(historyItem);
  };

  const handleToggleVoice = () => {
    if (!isVoiceListening) {
      setIsVoiceListening(true);
      // Voice input simulation / Web Speech API placeholder
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'en-US';
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            setIsVoiceListening(false);
          };
          recognition.onerror = () => {
            setIsVoiceListening(false);
          };
          recognition.onend = () => {
            setIsVoiceListening(false);
          };
          recognition.start();
        } catch {
          setTimeout(() => {
            setIsVoiceListening(false);
            setQuery("How do I choose between duty and desire?");
          }, 2500);
        }
      } else {
        // Fallback simulation
        setTimeout(() => {
          setIsVoiceListening(false);
          setQuery("I am afraid of failing and cannot take action");
        }, 2000);
      }
    } else {
      setIsVoiceListening(false);
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Intro Banner */}
      <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-vedic-indigo tracking-tight">
          Mahabharata Scholarly Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Query ethical principles, verses, characters, and dialogues cross-referenced with the BORI Critical Edition.
        </p>
      </div>

      {/* Central Google-style Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-vedic rounded-2xl bg-white border-2 border-parchment-300 focus-within:border-vedic-amber transition-all">
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5 text-vedic-amber" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by dilemma, theme, verse (e.g. 'fear of failure', 'Vidura on anger', 'Bhagavad Gita 2.47')..."
            className="w-full py-4 pl-3 pr-28 rounded-2xl bg-transparent text-slate-900 text-sm sm:text-base focus:outline-none placeholder:text-slate-400 font-sans"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            title={isVoiceListening ? "Listening..." : "Voice Input (Speech recognition)"}
            className={`p-2.5 mr-2 rounded-xl transition-all ${
              isVoiceListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-500 hover:text-vedic-indigo hover:bg-parchment-100'
            }`}
          >
            {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`relative px-3.5 py-2 mr-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isFilterOpen || activeFilterCount > 0
                ? 'bg-vedic-amber text-white shadow-sm'
                : 'bg-parchment-100 text-slate-700 hover:bg-parchment-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-vedic-crimson text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </form>

        {isVoiceListening && (
          <div className="absolute -bottom-8 left-4 text-xs font-medium text-red-600 flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            Listening to your speech... (speak naturally)
          </div>
        )}
      </div>

      {/* Sensitive Content / Safety Alert */}
      {activeSafetyWarning && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-red-950">Compassionate Support Notice:</strong>
              <p className="text-red-900/90 text-xs mt-0.5">{activeSafetyWarning}</p>
            </div>
          </div>
          <button
            onClick={onOpenSafetyModal}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex-shrink-0 transition-colors shadow-sm"
          >
            View Free Helplines
          </button>
        </div>
      )}

      {/* Filter Drawer */}
      <SearchFilters
        filters={filters}
        onChangeFilters={setFilters}
        onResetFilters={() => setFilters({})}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Example Dilemmas & Prompts */}
      {!query && (
        <div className="space-y-4 pt-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Explore Common Life Dilemmas
            </span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelectExample(ex.query)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-parchment-300 text-slate-700 hover:border-vedic-amber hover:text-vedic-amber text-xs font-medium shadow-subtle hover:shadow transition-all text-left flex items-center gap-1.5 group"
                >
                  <span>{ex.query}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-vedic-amber transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Recent Searches
                </span>
                <button
                  onClick={() => {
                    storageService.clearSearchHistory();
                    setSearchHistory([]);
                  }}
                  className="text-[11px] text-slate-400 hover:text-vedic-crimson"
                >
                  Clear history
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {searchHistory.slice(0, 6).map((h, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectHistory(h)}
                    className="px-2.5 py-1 rounded-lg bg-parchment-200/60 hover:bg-parchment-300 text-slate-700 text-xs transition-colors"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-parchment-200 pb-2">
          <span>
            Showing <strong className="text-slate-800">{results.length}</strong> verified Mahabharata reference{results.length !== 1 ? 's' : ''}
            {query && <span> for “<strong className="text-slate-800">{query}</strong>”</span>}
          </span>
          <span className="text-[11px]">Ranked by Contextual & Semantic Relevance</span>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-parchment-300 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-parchment-400 mx-auto" />
            <h4 className="font-display font-semibold text-slate-800 text-base">No Direct Verses Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search terms or clearing specific filters. You can also explore themes like Dharma, Duty, Anger, or Forgiveness.
            </p>
            <button
              onClick={() => { setQuery(''); setFilters({}); }}
              className="px-4 py-2 bg-parchment-200 hover:bg-parchment-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
            >
              Reset Filters & Query
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <ResultCard
                key={result.item.id}
                result={result}
                onViewSource={onViewSource}
                onShare={onShare}
                onToggleBookmark={onToggleBookmark}
                isBookmarked={isBookmarked(result.item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
