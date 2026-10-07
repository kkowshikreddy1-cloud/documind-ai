import React, { useState } from 'react';
import { 
  Bookmark, Download, Trash2, FileText, Check, ArrowRight 
} from 'lucide-react';
import { BookmarkItem } from '../../types/chat';
import { CorpusItem } from '../../types/mahabharata';

interface SavedLibraryProps {
  bookmarks: BookmarkItem[];
  onRemoveBookmark: (id: string) => void;
  onViewSource: (item: CorpusItem) => void;
}

export const SavedLibrary: React.FC<SavedLibraryProps> = ({
  bookmarks,
  onRemoveBookmark,
  onViewSource
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'corpus-item' | 'response'>('all');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const filteredBookmarks = bookmarks.filter(b => {
    if (activeFilter === 'all') return true;
    return b.type === activeFilter;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dharma_ai_library_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess('Exported JSON successfully');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportMarkdown = () => {
    let md = `# DharmaAI — Saved Study Library & Reflections\n`;
    md += `*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    bookmarks.forEach((b, index) => {
      md += `## ${index + 1}. ${b.corpusItem?.title || b.userQuery || 'Saved Reflection'}\n\n`;
      if (b.corpusItem) {
        md += `> ${b.corpusItem.translationEn}\n\n`;
        md += `- **Citation:** ${b.corpusItem.citations.boriCE}\n`;
        md += `- **Speaker / Listener:** ${b.corpusItem.speaker} to ${b.corpusItem.listener} in ${b.corpusItem.parvaNameEn}\n`;
        md += `- **Practical Reflection:** ${b.corpusItem.practicalReflection}\n`;
        md += `- **Suggested Action:** ${b.corpusItem.suggestedAction}\n\n`;
      } else if (b.guidanceResponse) {
        md += `### Dilemma: "${b.userQuery}"\n\n`;
        md += `${b.guidanceResponse.answer}\n\n`;
        if (b.guidanceResponse.journalingQuestion) {
          md += `**Journaling Prompt:** *${b.guidanceResponse.journalingQuestion}*\n\n`;
        }
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `dharma_ai_reflections_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess('Exported Markdown journal');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Export toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-parchment-300">
        <div>
          <h1 className="font-display font-bold text-2xl text-vedic-indigo flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-vedic-amber" />
            Your Saved Wisdom Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {bookmarks.length} bookmarked verse{bookmarks.length !== 1 ? 's' : ''} and contemplative reflection{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          {downloadSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {downloadSuccess}
            </span>
          )}

          <button
            onClick={handleExportMarkdown}
            disabled={bookmarks.length === 0}
            className="px-3.5 py-2 rounded-xl bg-white border border-parchment-300 hover:border-vedic-amber text-slate-700 hover:text-vedic-amber text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> Export Markdown
          </button>

          <button
            onClick={handleExportJSON}
            disabled={bookmarks.length === 0}
            className="px-3.5 py-2 rounded-xl bg-white border border-parchment-300 hover:border-vedic-amber text-slate-700 hover:text-vedic-amber text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'all'
              ? 'bg-vedic-amber text-white shadow-sm'
              : 'bg-white text-slate-600 border border-parchment-300 hover:bg-parchment-100'
          }`}
        >
          All Items ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveFilter('corpus-item')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'corpus-item'
              ? 'bg-vedic-amber text-white shadow-sm'
              : 'bg-white text-slate-600 border border-parchment-300 hover:bg-parchment-100'
          }`}
        >
          Verses & Passages
        </button>
        <button
          onClick={() => setActiveFilter('response')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'response'
              ? 'bg-vedic-amber text-white shadow-sm'
              : 'bg-white text-slate-600 border border-parchment-300 hover:bg-parchment-100'
          }`}
        >
          Guidance & Reflections
        </button>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-parchment-300 p-8 space-y-3">
          <Bookmark className="w-12 h-12 text-parchment-300 mx-auto" />
          <h3 className="font-display font-semibold text-slate-800 text-base">Your Library is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bookmark verses from Quick Search or save reflections from Ask Krishna to compile your personal philosophical journal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookmarks.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-parchment-300 p-5 shadow-warm hover:shadow-vedic transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                    {b.type === 'corpus-item' ? 'Primary Verse' : 'Guidance Reflection'}
                  </span>
                  <button
                    onClick={() => onRemoveBookmark(b.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove from Library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {b.corpusItem && (
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-slate-900 text-base">
                      {b.corpusItem.title}
                    </h3>
                    <p className="italic text-slate-700 text-xs line-clamp-3 bg-parchment-50 p-2.5 rounded-lg font-serif">
                      “{b.corpusItem.translationEn}”
                    </p>
                    <span className="font-mono text-[11px] text-vedic-amber block font-semibold">
                      {b.corpusItem.citations.boriCE}
                    </span>
                  </div>
                )}

                {b.guidanceResponse && (
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-slate-900 text-sm">
                      Dilemma: “{b.userQuery}”
                    </h3>
                    <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                      {b.guidanceResponse.answer}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-parchment-200 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Saved {new Date(b.savedAt).toLocaleDateString()}
                </span>
                {b.corpusItem && (
                  <button
                    onClick={() => onViewSource(b.corpusItem!)}
                    className="text-vedic-amber hover:text-amber-800 font-semibold flex items-center gap-1 text-xs"
                  >
                    View Source Context <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
