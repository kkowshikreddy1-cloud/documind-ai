import React, { useState } from 'react';
import { X, Copy, Check, Bookmark } from 'lucide-react';
import { CorpusItem } from '../../types/mahabharata';

interface SourceViewerModalProps {
  item: CorpusItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmark?: (item: CorpusItem) => void;
  isBookmarked?: boolean;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  item,
  isOpen,
  onClose,
  onBookmark,
  isBookmarked
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'verse' | 'word-gloss' | 'editions' | 'commentary'>('verse');

  if (!isOpen || !item) return null;

  const handleCopyCitation = () => {
    const citationText = `${item.title}\n` +
      `Citation: ${item.citations.boriCE}\n` +
      `Translation (${item.translationSource}): "${item.translationEn}"\n` +
      `Speaker: ${item.speaker} | Listener: ${item.listener}\n` +
      `Parva: ${item.parvaNameEn} (${item.parvaNameSa}), Adhyaya ${item.adhyaya}\n` +
      `Via DharmaAI`;
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-parchment-50 rounded-2xl shadow-2xl border border-parchment-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-parchment-100 to-parchment-200 border-b border-parchment-300 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-vedic-amber/15 text-vedic-amber border border-vedic-amber/30">
                {item.parvaNameEn} ({item.parvaNameSa})
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/70 text-slate-700 border border-parchment-300">
                {item.citations.boriCE}
              </span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-vedic-indigo">
              {item.title}
            </h3>
            <p className="text-xs text-slate-600">
              Speaker: <strong className="text-slate-800">{item.speaker}</strong> • Listener: <strong className="text-slate-800">{item.listener}</strong> • Episode: {item.episodeName}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onBookmark && (
              <button
                onClick={() => onBookmark(item)}
                className={`p-2 rounded-xl border transition-colors ${
                  isBookmarked 
                    ? 'bg-vedic-amber text-white border-vedic-amber' 
                    : 'bg-white text-slate-700 border-parchment-300 hover:bg-parchment-100'
                }`}
                title={isBookmarked ? "Remove Bookmark" : "Save to Bookmarks"}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleCopyCitation}
              className="p-2 rounded-xl bg-white border border-parchment-300 text-slate-700 hover:bg-parchment-100 transition-colors"
              title="Copy Citation"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-parchment-300 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-parchment-300 bg-parchment-100 px-6 gap-2">
          <button
            onClick={() => setActiveTab('verse')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'verse'
                ? 'border-vedic-amber text-vedic-amber font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Sanskrit & Translation
          </button>
          <button
            onClick={() => setActiveTab('word-gloss')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'word-gloss'
                ? 'border-vedic-amber text-vedic-amber font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Word-by-Word Analysis ({item.wordGloss.length})
          </button>
          <button
            onClick={() => setActiveTab('editions')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'editions'
                ? 'border-vedic-amber text-vedic-amber font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Editions & Citations
          </button>
          <button
            onClick={() => setActiveTab('commentary')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'commentary'
                ? 'border-vedic-amber text-vedic-amber font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Commentary & Nuance
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {activeTab === 'verse' && (
            <div className="space-y-6">
              {/* Devanagari */}
              <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
                  Devanagari Recension (Critical Edition)
                </div>
                <div className="font-sanskrit text-lg sm:text-xl text-slate-900 font-medium leading-relaxed whitespace-pre-line">
                  {item.sanskritDevanagari}
                </div>
              </div>

              {/* IAST */}
              <div className="p-4 rounded-xl bg-parchment-100 border border-parchment-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  IAST Transliteration
                </div>
                <div className="font-serif text-base sm:text-lg italic text-slate-800 leading-relaxed whitespace-pre-line">
                  {item.sanskritIAST}
                </div>
              </div>

              {/* Translation */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Authorized English Translation</span>
                  <span className="text-[11px] font-normal text-slate-600">Source: {item.translationSource}</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-parchment-300 shadow-sm text-base leading-relaxed text-slate-900">
                  “{item.translationEn}”
                </div>
              </div>

              {/* Historical Context */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-1">Epic Context:</strong>
                {item.historicalContext}
              </div>
            </div>
          )}

          {activeTab === 'word-gloss' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Scholarly word-by-word anatomical breakdown from classical Sanskrit root meanings:
              </p>
              <div className="overflow-x-auto rounded-xl border border-parchment-300">
                <table className="min-w-full divide-y divide-parchment-200 text-xs sm:text-sm">
                  <thead className="bg-parchment-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Sanskrit Word / Compound</th>
                      <th className="px-4 py-2.5 text-left">Classical Meaning / Gloss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment-200 bg-white">
                    {item.wordGloss.map((w, idx) => (
                      <tr key={idx} className="hover:bg-parchment-50">
                        <td className="px-4 py-2.5 font-serif font-semibold text-vedic-amber text-base">
                          {w.word}
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">
                          {w.meaning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'editions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-parchment-300 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-parchment-200">
                  <div>
                    <h5 className="font-semibold text-slate-900">BORI Critical Edition (Poona)</h5>
                    <p className="text-xs text-slate-500">The authoritative academic critical edition (1919-1966)</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-vedic-amber px-2 py-1 bg-amber-50 rounded">
                    {item.citations.boriCE}
                  </span>
                </div>

                {item.citations.ganguliRef && (
                  <div className="flex items-center justify-between pb-2 border-b border-parchment-200">
                    <div>
                      <h5 className="font-semibold text-slate-900">K.M. Ganguli Translation</h5>
                      <p className="text-xs text-slate-500">Unabridged 18-volume prose translation</p>
                    </div>
                    <span className="font-mono text-xs text-slate-700">
                      {item.citations.ganguliRef}
                    </span>
                  </div>
                )}

                {item.citations.debroyRef && (
                  <div className="flex items-center justify-between pb-2 border-b border-parchment-200">
                    <div>
                      <h5 className="font-semibold text-slate-900">Bibek Debroy Edition</h5>
                      <p className="text-xs text-slate-500">Contemporary 10-volume translation of BORI CE</p>
                    </div>
                    <span className="font-mono text-xs text-slate-700">
                      {item.citations.debroyRef}
                    </span>
                  </div>
                )}

                {item.citations.gitaPressRef && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-slate-900">Gita Press Vulgate Edition</h5>
                      <p className="text-xs text-slate-500">Traditional commentary & devotional recension</p>
                    </div>
                    <span className="font-mono text-xs text-slate-700">
                      {item.citations.gitaPressRef}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'commentary' && (
            <div className="space-y-5">
              <div>
                <h5 className="font-display font-semibold text-slate-900 text-sm mb-1 text-vedic-amber">
                  Philosophical Analysis
                </h5>
                <p className="text-slate-700 leading-relaxed text-sm bg-white p-4 rounded-xl border border-parchment-200">
                  {item.philosophicalCommentary}
                </p>
              </div>

              <div>
                <h5 className="font-display font-semibold text-slate-900 text-sm mb-1 text-vedic-amber">
                  Practical Reflection for Modern Life
                </h5>
                <p className="text-slate-700 leading-relaxed text-sm bg-white p-4 rounded-xl border border-parchment-200">
                  {item.practicalReflection}
                </p>
              </div>

              {item.limitationsAndNuance && (
                <div>
                  <h5 className="font-display font-semibold text-slate-900 text-sm mb-1 text-amber-700">
                    Scholarly Nuance & Boundary Conditions
                  </h5>
                  <p className="text-slate-600 leading-relaxed text-xs bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                    {item.limitationsAndNuance}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-parchment-100 border-t border-parchment-300 flex justify-between items-center text-xs">
          <div className="text-slate-500">
            Source Type: <span className="font-semibold text-slate-700">Verified Canonical Text</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-vedic-indigo text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
