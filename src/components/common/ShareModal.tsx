import React, { useState } from 'react';
import { X, Copy, Check, Share2, Link as LinkIcon } from 'lucide-react';
import { CorpusItem } from '../../types/mahabharata';
import { GuidanceResponse } from '../../types/guidance';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  corpusItem?: CorpusItem;
  guidanceResponse?: GuidanceResponse;
  userQuery?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  corpusItem,
  guidanceResponse,
  userQuery
}) => {
  const [copiedType, setCopiedType] = useState<'link' | 'citation' | 'markdown' | null>(null);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const getCitationText = () => {
    if (corpusItem) {
      return `"${corpusItem.translationEn}"\n— ${corpusItem.title} (${corpusItem.citations.boriCE})\nShared via DharmaAI`;
    }
    if (guidanceResponse) {
      const topCitation = guidanceResponse.citations[0];
      return `${guidanceResponse.answer}\n\nPrimary Citation: ${topCitation ? topCitation.boriCE : 'Mahabharata'}\nShared via DharmaAI`;
    }
    return `Reflect on wisdom from the Mahabharata at DharmaAI: ${currentUrl}`;
  };

  const getMarkdownText = () => {
    if (corpusItem) {
      return `### ${corpusItem.title}\n\n` +
        `> ${corpusItem.translationEn}\n\n` +
        `- **Citation:** ${corpusItem.citations.boriCE}\n` +
        `- **Parva:** ${corpusItem.parvaNameEn} (${corpusItem.parvaNameSa})\n` +
        `- **Speaker / Listener:** ${corpusItem.speaker} to ${corpusItem.listener}\n` +
        `- **Practical Reflection:** ${corpusItem.practicalReflection}\n\n` +
        `*Source: DharmaAI*`;
    }
    if (guidanceResponse) {
      return `### DharmaAI Consultation: "${userQuery || 'Life Reflection'}"\n\n` +
        `${guidanceResponse.answer}\n\n` +
        `**Citations:**\n` +
        guidanceResponse.citations.map(c => `- ${c.boriCE}: ${c.contextSummary}`).join('\n') +
        `\n\n*Generated via DharmaAI*`;
    }
    return currentUrl;
  };

  const handleCopy = (text: string, type: 'link' | 'citation' | 'markdown') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-parchment-50 rounded-2xl shadow-2xl border border-parchment-300 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-parchment-200">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-vedic-amber" />
            <h3 className="font-display font-bold text-lg text-vedic-indigo">
              Share Reflection & Citation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-parchment-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-700">
          <p className="text-slate-600">
            Share this verified Mahabharata wisdom with friends, students, or study groups.
          </p>

          <div className="p-3 bg-white rounded-xl border border-parchment-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-vedic-amber" /> Page Link
              </span>
              <button
                onClick={() => handleCopy(currentUrl, 'link')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-parchment-200 hover:bg-parchment-300 text-slate-800 transition-colors flex items-center gap-1"
              >
                {copiedType === 'link' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === 'link' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-slate-500 truncate text-[11px] font-mono bg-parchment-50 p-1.5 rounded">
              {currentUrl}
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-parchment-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Concise Citation Card</span>
              <button
                onClick={() => handleCopy(getCitationText(), 'citation')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-parchment-200 hover:bg-parchment-300 text-slate-800 transition-colors flex items-center gap-1"
              >
                {copiedType === 'citation' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === 'citation' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-slate-600 text-xs italic bg-parchment-50 p-2 rounded max-h-20 overflow-y-auto">
              {getCitationText()}
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-parchment-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Formatted Markdown</span>
              <button
                onClick={() => handleCopy(getMarkdownText(), 'markdown')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-parchment-200 hover:bg-parchment-300 text-slate-800 transition-colors flex items-center gap-1"
              >
                {copiedType === 'markdown' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === 'markdown' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-slate-500 text-[11px]">
              Ready to paste into Notion, Obsidian, WhatsApp, or study notes.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
