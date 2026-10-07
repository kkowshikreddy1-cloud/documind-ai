import React, { useState } from 'react';
import { 
  BookOpen, ChevronDown, ChevronUp, Bookmark, Share2, 
  ThumbsUp, ThumbsDown, Sparkles, Compass, Check 
} from 'lucide-react';
import { SearchResult } from '../../types/guidance';
import { CorpusItem } from '../../types/mahabharata';

interface ResultCardProps {
  result: SearchResult;
  onViewSource: (item: CorpusItem) => void;
  onShare: (item: CorpusItem) => void;
  onToggleBookmark: (item: CorpusItem) => void;
  isBookmarked: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onViewSource,
  onShare,
  onToggleBookmark,
  isBookmarked
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { item, matchReasons, shortAnswer, suggestedAction, relevanceScore } = result;

  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    setFeedback(type);
    setToastMessage(type === 'helpful' ? 'Thank you for your feedback!' : 'We will improve our retrieval ranking.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <article className="bg-white rounded-2xl border border-parchment-300 shadow-warm hover:shadow-vedic transition-all overflow-hidden flex flex-col relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-lg flex items-center gap-1.5 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-vedic-amber" />
          {toastMessage}
        </div>
      )}

      {/* Card Header */}
      <div className="p-5 sm:p-6 pb-4 border-b border-parchment-200 bg-gradient-to-r from-parchment-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              {item.parvaNameEn} ({item.parvaNameSa})
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-parchment-100 text-slate-700 border border-parchment-200">
              {item.citations.boriCE}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 capitalize">
              {item.type}
            </span>
          </div>

          {/* Relevance / Confidence Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="text-[11px] text-slate-500">Match Quality:</span>
            <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
              relevanceScore > 75 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {relevanceScore}% High Relevance
            </span>
          </div>
        </div>

        <h3 className="font-display font-bold text-lg sm:text-xl text-vedic-indigo hover:text-vedic-amber transition-colors cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          {item.title}
        </h3>

        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2">
          <span>Speaker: <strong className="text-slate-700">{item.speaker}</strong></span>
          <span>•</span>
          <span>Listener: <strong className="text-slate-700">{item.listener}</strong></span>
          <span>•</span>
          <span>Episode: {item.episodeName}</span>
        </div>

        {/* Why it matches */}
        {matchReasons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {matchReasons.map((reason, idx) => (
              <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-parchment-200/70 text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-vedic-amber" /> {reason}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Body — The 4 Required Sections */}
      <div className="p-5 sm:p-6 space-y-4 flex-1 text-xs sm:text-sm text-slate-800">
        {/* Section 1: Most Relevant Teaching */}
        <section className="space-y-1.5">
          <h4 className="text-[11px] font-bold text-vedic-amber uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Most Relevant Teaching
          </h4>
          <blockquote className="p-3.5 rounded-xl bg-amber-50/40 border-l-4 border-vedic-amber text-slate-900 italic font-serif text-sm sm:text-base leading-relaxed">
            “{item.translationEn}”
          </blockquote>
        </section>

        {/* Section 2: Related Episode */}
        <section className="space-y-1">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Related Episode
          </h4>
          <p className="text-slate-700 text-xs leading-relaxed">
            {item.historicalContext}
          </p>
        </section>

        {/* Section 3: Practical Reflection */}
        <section className="space-y-1.5">
          <h4 className="text-[11px] font-bold text-vedic-terracotta uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Practical Reflection
          </h4>
          <p className="text-slate-800 leading-relaxed font-medium">
            {item.practicalReflection}
          </p>
          <div className="p-3 bg-parchment-100 rounded-xl text-slate-800 text-xs border border-parchment-200 flex items-start gap-2">
            <strong className="text-vedic-amber flex-shrink-0">Action Step:</strong>
            <span>{suggestedAction}</span>
          </div>
        </section>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="pt-4 border-t border-parchment-200 space-y-4 animate-fade-in">
            {/* Sanskrit Snippet */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-sanskrit text-sm sm:text-base leading-relaxed whitespace-pre-line text-slate-800">
              {item.sanskritDevanagari}
            </div>

            {/* In-depth Philosophical Commentary */}
            <div>
              <h5 className="font-semibold text-slate-900 text-xs mb-1">Deep Philosophical Commentary:</h5>
              <p className="text-slate-700 leading-relaxed text-xs">
                {item.philosophicalCommentary}
              </p>
            </div>

            {item.journalingPrompt && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs">
                <strong className="block mb-1 font-semibold text-purple-900">Journaling Inquiry:</strong>
                {item.journalingPrompt}
              </div>
            )}
          </div>
        )}

        {/* Section 4: Source & Citation */}
        <section className="pt-3 border-t border-parchment-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Source:</span>
            <span className="font-mono text-[11px] text-vedic-indigo font-bold">{item.citations.boriCE}</span>
            <span className="text-[10px] text-slate-400">({item.translationSource})</span>
          </div>
          
          <button
            onClick={() => onViewSource(item)}
            className="text-vedic-amber hover:text-amber-800 font-semibold text-xs flex items-center gap-1 hover:underline"
          >
            View Source Context & Sanskrit Glossary →
          </button>
        </section>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 sm:px-6 py-3 bg-parchment-100 border-t border-parchment-300 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium py-1 px-2 rounded-lg hover:bg-white/60 transition-colors"
        >
          {isExpanded ? (
            <>Less detail <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>More detail & commentary <ChevronDown className="w-4 h-4" /></>
          )}
        </button>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(item)}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark this result"}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked 
                ? 'bg-vedic-amber text-white border-vedic-amber' 
                : 'bg-white text-slate-600 hover:text-slate-900 border-parchment-300 hover:bg-parchment-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Share Button */}
          <button
            onClick={() => onShare(item)}
            title="Share Citation"
            className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-slate-900 border border-parchment-300 hover:bg-parchment-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Feedback Thumbs */}
          <div className="flex items-center border border-parchment-300 rounded-lg bg-white overflow-hidden ml-1">
            <button
              onClick={() => handleFeedback('helpful')}
              title="This result was helpful"
              className={`p-1.5 transition-colors ${
                feedback === 'helpful' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-parchment-100'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-parchment-200" />
            <button
              onClick={() => handleFeedback('unhelpful')}
              title="Not relevant to my dilemma"
              className={`p-1.5 transition-colors ${
                feedback === 'unhelpful' ? 'bg-red-100 text-red-800' : 'text-slate-500 hover:bg-parchment-100'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
