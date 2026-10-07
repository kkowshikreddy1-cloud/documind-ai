import React from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { PARVAS } from '../../data/mahabharata_corpus';
import { FilterOptions } from '../../types/guidance';
import { ThemeTag, ContentType } from '../../types/mahabharata';

interface SearchFiltersProps {
  filters: FilterOptions;
  onChangeFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const THEMES: ThemeTag[] = [
  "Dharma", "Duty", "Grief", "Anger", "Forgiveness",
  "Loyalty", "Justice", "Leadership", "Truth", "Karma",
  "Detachment", "Courage", "Friendship", "Family", "Patience"
];

const CHARACTERS = [
  "Krishna", "Arjuna", "Yudhishthira", "Bhishma", "Vidura",
  "Draupadi", "Karna", "Abhimanyu", "Dhritarashtra", "Sanjaya"
];

const CONTENT_TYPES: { type: ContentType; label: string }[] = [
  { type: "verse", label: "Verses (Shlokas)" },
  { type: "dialogue", label: "Dialogues (Samvada)" },
  { type: "episode", label: "Narrative Episodes (Upakhyana)" },
  { type: "teaching", label: "Ethical Teachings (Niti)" },
  { type: "commentary", label: "Philosophical Commentaries" }
];

const EDITIONS: ("BORI CE" | "K.M. Ganguli" | "Bibek Debroy" | "Gita Press")[] = [
  "BORI CE",
  "K.M. Ganguli",
  "Bibek Debroy",
  "Gita Press"
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const hasActiveFilters = Boolean(
    filters.parvaNumber ||
    filters.character ||
    filters.theme ||
    filters.contentType ||
    filters.edition
  );

  return (
    <div className="bg-white rounded-2xl border border-parchment-300 shadow-warm p-5 mb-6 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
        <div className="flex items-center space-x-2 text-vedic-indigo">
          <Filter className="w-4 h-4 text-vedic-amber" />
          <h4 className="font-display font-bold text-sm">Scholarly Search Filters</h4>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-slate-500 hover:text-vedic-crimson flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-parchment-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs">
        {/* Parva / Book */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Parva (Book)</label>
          <select
            value={filters.parvaNumber || ''}
            onChange={(e) => onChangeFilters({ ...filters, parvaNumber: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full p-2 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-1 focus:ring-vedic-amber text-slate-800 text-xs"
          >
            <option value="">All 18 Parvas</option>
            {PARVAS.map((p) => (
              <option key={p.number} value={p.number}>
                {p.number}. {p.nameEn} ({p.nameSa})
              </option>
            ))}
          </select>
        </div>

        {/* Character */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Character</label>
          <select
            value={filters.character || ''}
            onChange={(e) => onChangeFilters({ ...filters, character: e.target.value || undefined })}
            className="w-full p-2 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-1 focus:ring-vedic-amber text-slate-800 text-xs"
          >
            <option value="">All Characters</option>
            {CHARACTERS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Theme */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Theme</label>
          <select
            value={filters.theme || ''}
            onChange={(e) => onChangeFilters({ ...filters, theme: (e.target.value as ThemeTag) || undefined })}
            className="w-full p-2 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-1 focus:ring-vedic-amber text-slate-800 text-xs"
          >
            <option value="">All Themes</option>
            {THEMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Content Type */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Content Type</label>
          <select
            value={filters.contentType || ''}
            onChange={(e) => onChangeFilters({ ...filters, contentType: (e.target.value as ContentType) || undefined })}
            className="w-full p-2 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-1 focus:ring-vedic-amber text-slate-800 text-xs"
          >
            <option value="">All Content Types</option>
            {CONTENT_TYPES.map((ct) => (
              <option key={ct.type} value={ct.type}>{ct.label}</option>
            ))}
          </select>
        </div>

        {/* Edition */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Translation Edition</label>
          <select
            value={filters.edition || ''}
            onChange={(e) => onChangeFilters({ ...filters, edition: (e.target.value as any) || undefined })}
            className="w-full p-2 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-1 focus:ring-vedic-amber text-slate-800 text-xs"
          >
            <option value="">All Editions</option>
            {EDITIONS.map((ed) => (
              <option key={ed} value={ed}>{ed}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
