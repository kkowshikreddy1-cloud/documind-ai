import React, { useState } from 'react';
import { 
  Sparkles, BookOpen, Compass, PenTool, Bookmark, Share2, 
  Copy, Check, ArrowRight, ShieldCheck, Heart 
} from 'lucide-react';
import { GuidanceResponse } from '../../types/guidance';
import { CorpusItem } from '../../types/mahabharata';
import { BookmarkItem } from '../../types/chat';
import { guidanceEngine } from '../../services/guidance_engine';
import { EXAMPLE_PROMPTS } from '../../data/example_prompts';
import { MAHABHARATA_CORPUS } from '../../data/mahabharata_corpus';

interface AskKrishnaModeProps {
  onViewSource: (item: CorpusItem) => void;
  onBookmarkItem: (item: BookmarkItem) => void;
  onShareGuidance: (guidance: GuidanceResponse, query: string) => void;
  initialQuery?: string;
}

export const AskKrishnaMode: React.FC<AskKrishnaModeProps> = ({
  onViewSource,
  onBookmarkItem,
  onShareGuidance,
  initialQuery = ''
}) => {
  const [dilemma, setDilemma] = useState(initialQuery);
  const [currentResponse, setCurrentResponse] = useState<GuidanceResponse | null>(null);
  const [activeQuery, setActiveQuery] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (customText?: string) => {
    const text = (customText || dilemma).trim();
    if (!text || isReflecting) return;

    setIsReflecting(true);
    setActiveQuery(text);
    setIsSaved(false);

    setTimeout(() => {
      const guidance = guidanceEngine.generateGuidance(text, 'ask-krishna');
      setCurrentResponse(guidance);
      setIsReflecting(false);
    }, 700);
  };

  const handleCopy = () => {
    if (!currentResponse) return;
    navigator.clipboard.writeText(`${currentResponse.answer}\n\nJournaling Prompt: ${currentResponse.journalingQuestion}\nVia DharmaAI`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveBookmark = () => {
    if (!currentResponse) return;
    const bItem: BookmarkItem = {
      id: `krishna-bm-${Date.now()}`,
      savedAt: Date.now(),
      type: 'response',
      guidanceResponse: currentResponse,
      userQuery: activeQuery,
      notes: currentResponse.summary
    };
    onBookmarkItem(bItem);
    setIsSaved(true);
  };

  const primaryCitation = currentResponse?.citations[0];
  const matchedCorpusItem = primaryCitation 
    ? MAHABHARATA_CORPUS.find(c => c.citations.id === primaryCitation.id || primaryCitation.boriCE.includes(c.citations.boriCE)) || MAHABHARATA_CORPUS[0]
    : MAHABHARATA_CORPUS[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in">
      {/* Sanctum Banner & Mandatory Identity Labels */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Guidance Inspired by Krishna’s Teachings</span>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-vedic-indigo">
          The Contemplative Sanctum
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Reflect on duty, relationships, grief, or inner turmoil through calm, grounded philosophical wisdom drawn directly from the Bhagavad Gita and epic discourses.
        </p>

        {/* Clear non-impersonation badge */}
        <div className="text-[11px] text-slate-500 bg-white/70 py-1.5 px-3 rounded-lg border border-parchment-200 inline-block">
          <ShieldCheck className="w-3 h-3 inline mr-1 text-slate-400" />
          Scholarly interpretation based on cited Mahabharata sources • Non-impersonation policy
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl border-2 border-amber-200/80 shadow-vedic p-5 sm:p-6 space-y-4">
        <label className="block font-display font-bold text-sm text-slate-900">
          Present Your Dilemma or Turmoil for Reflection:
        </label>
        <textarea
          rows={3}
          value={dilemma}
          onChange={(e) => setDilemma(e.target.value)}
          placeholder="e.g. 'I feel deeply betrayed by someone I loved', 'I am caught between family duty and my creative calling', 'I feel paralyzed by fear of failure'..."
          className="w-full p-4 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 text-xs sm:text-sm leading-relaxed placeholder:text-slate-400"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-slate-500">
            Tone: Calm • Grounded • Reflective • Non-judgmental
          </span>
          <button
            onClick={() => handleSubmit()}
            disabled={!dilemma.trim() || isReflecting}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              dilemma.trim() && !isReflecting
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg'
                : 'bg-parchment-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isReflecting ? "Contemplating..." : "Seek Philosophical Guidance"}</span>
          </button>
        </div>
      </div>

      {/* Suggested prompts if empty */}
      {!currentResponse && (
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block text-center">
            Or Reflect on Common Dilemmas
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EXAMPLE_PROMPTS.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setDilemma(p.query);
                  handleSubmit(p.query);
                }}
                className="p-3.5 rounded-xl bg-white border border-parchment-300 hover:border-amber-400 hover:bg-amber-50/30 text-left text-xs text-slate-700 font-medium transition-all flex items-center justify-between group shadow-subtle"
              >
                <span>“{p.query}”</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Structured 7-Step Response Container */}
      {currentResponse && (
        <div className="bg-white rounded-3xl border-2 border-amber-300/70 shadow-vedic overflow-hidden animate-fade-in space-y-6 p-6 sm:p-8">
          {/* Top Bar with Badge & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-parchment-200">
            <div>
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                Philosophical Reflection
              </span>
              <h3 className="font-display font-bold text-lg sm:text-xl text-vedic-indigo">
                Reflection on: “{activeQuery}”
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Copy Reflection"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSaveBookmark}
                className="p-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Bookmark Reflection"
              >
                <Bookmark className="w-3.5 h-3.5 text-vedic-amber" />
                <span className="hidden sm:inline">Save</span>
              </button>

              <button
                onClick={() => onShareGuidance(currentResponse, activeQuery)}
                className="p-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Share Reflection"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* 1. Compassionate Acknowledgement */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
            <Heart className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <h4 className="font-display font-bold text-amber-900">
                1. Compassionate Acknowledgement
              </h4>
              <p className="text-slate-800 leading-relaxed">
                I hear the weight of what you are carrying. In the human tapestry of the Mahabharata, even the greatest souls stood in this exact crossroads of pain, uncertainty, and grief. You are not weak for feeling this; you are human.
              </p>
            </div>
          </div>

          {/* 2. Reflection on the Problem */}
          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-display font-bold text-vedic-indigo text-sm uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Reflection on the Dilemma</span>
            </h4>
            <p className="text-slate-700 leading-relaxed bg-parchment-50 p-4 rounded-xl border border-parchment-200">
              When encountering this trial, the human impulse is either to flee into numbness or retaliate impulsively. In the epic, when Arjuna saw his world fracture before him, Krishna did not mock his tears nor rush him with superficial platitudes. He helped him untangle what was genuinely within his sovereign jurisdiction from what belonged to fate.
            </p>
          </div>

          {/* 3. Relevant Philosophical Principle */}
          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-display font-bold text-vedic-amber text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>3. Philosophical Principle</span>
            </h4>
            <p className="text-slate-800 leading-relaxed">
              {matchedCorpusItem.philosophicalCommentary}
            </p>
          </div>

          {/* 4. Mahabharata Source & Sanskrit Verse */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-display font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-700" />
                4. Mahabharata Source Reference
              </span>
              <span className="font-mono text-xs text-amber-800 bg-white px-2.5 py-1 rounded-md border border-amber-200 font-semibold">
                {matchedCorpusItem.citations.boriCE}
              </span>
            </div>

            <blockquote className="italic font-serif text-slate-900 text-sm sm:text-base border-l-4 border-amber-500 pl-4 py-1 leading-relaxed">
              “{matchedCorpusItem.translationEn}”
            </blockquote>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Speaker: <strong className="text-slate-700">{matchedCorpusItem.speaker}</strong> to <strong className="text-slate-700">{matchedCorpusItem.listener}</strong> in {matchedCorpusItem.parvaNameEn}
              </span>
              <button
                onClick={() => onViewSource(matchedCorpusItem)}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
              >
                Inspect Sanskrit & Word-by-Word Gloss →
              </button>
            </div>
          </div>

          {/* 5. Practical Next Step */}
          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-display font-bold text-vedic-terracotta text-sm uppercase tracking-wider flex items-center gap-1.5">
              <span>5. Practical Next Step for Today</span>
            </h4>
            <div className="p-4 rounded-xl bg-white border border-parchment-300 shadow-sm text-slate-800 font-medium">
              {matchedCorpusItem.suggestedAction}
            </div>
          </div>

          {/* 6. Journaling Question */}
          {matchedCorpusItem.journalingPrompt && (
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs sm:text-sm space-y-1.5">
              <h4 className="font-display font-bold text-purple-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <PenTool className="w-3.5 h-3.5 text-purple-700" />
                6. Reflective Journaling Inquiry
              </h4>
              <p className="italic text-purple-950 font-serif text-sm">
                “{matchedCorpusItem.journalingPrompt}”
              </p>
              <span className="text-[11px] text-purple-700 block pt-1">
                Take 5 minutes with a notebook to write your unedited answer.
              </span>
            </div>
          )}

          {/* 7. Limitations & Boundary Nuance */}
          <div className="pt-4 border-t border-parchment-200 text-[11px] text-slate-500 space-y-1">
            <strong className="text-slate-700">7. Interpretive Boundary:</strong>
            <p>
              This guidance is an ethical mirror from classical literature. It does not replace professional psychotherapy or medical care. Use your independent discernment when translating epic lessons to your modern context.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
