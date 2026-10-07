import React, { useState } from 'react';
import { 
  Copy, Check, Bookmark, ThumbsUp, ThumbsDown, RotateCcw, 
  BookOpen, Sparkles, AlertTriangle 
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectFollowUp: (prompt: string) => void;
  onRegenerate?: () => void;
  onBookmarkGuidance?: (message: ChatMessageType) => void;
  onViewSourceByCitation?: (citationId: string) => void;
  isBookmarked?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectFollowUp,
  onRegenerate,
  onBookmarkGuidance,
  onViewSourceByCitation,
  isBookmarked
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(message.feedback || null);

  const isAssistant = message.sender === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    setFeedback(type);
    message.feedback = type;
  };

  return (
    <div className={`flex flex-col space-y-2.5 ${isAssistant ? 'items-start' : 'items-end'} max-w-3xl mx-auto w-full`}>
      {/* Message Bubble */}
      <div
        className={`rounded-2xl p-5 sm:p-6 transition-all text-xs sm:text-sm leading-relaxed shadow-sm ${
          isAssistant
            ? 'bg-white border border-parchment-300 text-slate-900 rounded-tl-sm w-full'
            : 'bg-vedic-indigo text-white rounded-tr-sm max-w-[85%] sm:max-w-[75%]'
        }`}
      >
        {/* Header Indicator */}
        {isAssistant && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-parchment-200">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-vedic-amber flex items-center justify-center font-bold text-xs">
                ॐ
              </div>
              <span className="font-display font-semibold text-xs text-vedic-indigo">
                DharmaAI Scholarly Guidance
              </span>
            </div>
            {message.guidance?.confidence && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {message.guidance.confidence.toUpperCase()} CONFIDENCE
              </span>
            )}
          </div>
        )}

        {/* Safety notice if present */}
        {message.guidance?.safetyNotice && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Caring Note:</strong>
              {message.guidance.safetyNotice}
            </div>
          </div>
        )}

        {/* Main Content (Formatted markdown-style text) */}
        <div className="whitespace-pre-line space-y-3 font-sans">
          {message.content}
        </div>

        {/* Inline Citation Badges */}
        {isAssistant && message.guidance?.citations && message.guidance.citations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-parchment-200 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Primary Sourced References:
            </span>
            <div className="flex flex-wrap gap-2">
              {message.guidance.citations.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => onViewSourceByCitation && onViewSourceByCitation(c.id)}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors group"
                >
                  <BookOpen className="w-3 h-3 text-vedic-amber" />
                  <span>{c.boriCE}</span>
                  <span className="text-[10px] text-slate-500 font-sans group-hover:text-amber-900">
                    ({c.speaker} to {c.listener})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assistant Action Toolbar */}
        {isAssistant && (
          <div className="mt-4 pt-3 border-t border-parchment-200 flex items-center justify-between text-slate-500 text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                title="Copy response"
                className="p-1.5 rounded-lg hover:bg-parchment-100 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onBookmarkGuidance && (
                <button
                  onClick={() => onBookmarkGuidance(message)}
                  title={isBookmarked ? "Saved" : "Save this reflection"}
                  className={`p-1.5 rounded-lg hover:bg-parchment-100 transition-colors flex items-center gap-1 text-[11px] ${
                    isBookmarked ? 'text-vedic-amber font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-vedic-amber' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              )}

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  title="Regenerate response"
                  className="p-1.5 rounded-lg hover:bg-parchment-100 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleFeedback('helpful')}
                title="Helpful response"
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === 'helpful' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-parchment-100 text-slate-400'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback('unhelpful')}
                title="Not helpful"
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === 'unhelpful' ? 'bg-red-100 text-red-800' : 'hover:bg-parchment-100 text-slate-400'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Follow-Up Chips */}
      {isAssistant && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 max-w-full">
          {message.suggestedFollowUps.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSelectFollowUp(chip)}
              className="px-3 py-1.5 rounded-xl bg-white border border-parchment-300 hover:border-vedic-amber hover:text-vedic-amber text-slate-700 text-xs font-medium shadow-subtle hover:shadow transition-all text-left flex items-center gap-1.5 group"
            >
              <Sparkles className="w-3 h-3 text-vedic-amber" />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
