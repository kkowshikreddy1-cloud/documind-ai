import React, { useState } from 'react';
import { X, Settings, ShieldCheck, Book, Palette, Key, Check, RotateCcw } from 'lucide-react';
import { AppSettings } from '../../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetAllData
}) => {
  const [current, setCurrent] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(current);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-parchment-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-parchment-100 to-parchment-200 border-b border-parchment-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-vedic-amber" />
            <h3 className="font-display font-bold text-lg text-vedic-indigo">
              Application & Scholarly Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-parchment-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700">
          {/* Sanskrit Script Preference */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-900 flex items-center gap-1.5">
              <Book className="w-4 h-4 text-vedic-amber" /> Sanskrit Script Display
            </label>
            <p className="text-xs text-slate-500">
              Choose how original verses are rendered in study drawers and citation cards.
            </p>
            <select
              value={current.scriptDisplay}
              onChange={(e) => setCurrent({ ...current, scriptDisplay: e.target.value as any })}
              className="w-full p-2.5 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-vedic-amber text-xs sm:text-sm"
            >
              <option value="both">Both (Devanagari + IAST Romanized Transliteration)</option>
              <option value="devanagari">Devanagari Only (संस्कृतम्)</option>
              <option value="iast">IAST Roman Transliteration Only</option>
              <option value="english_only">English Translation Only</option>
            </select>
          </div>

          {/* Preferred Translation Edition */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-900">
              Primary Academic Translation Edition
            </label>
            <select
              value={current.preferredTranslation}
              onChange={(e) => setCurrent({ ...current, preferredTranslation: e.target.value as any })}
              className="w-full p-2.5 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-vedic-amber text-xs sm:text-sm"
            >
              <option value="BORI CE">BORI Critical Edition (Bhandarkar Oriental Research Inst.)</option>
              <option value="Bibek Debroy">Bibek Debroy Complete Translation (Unabridged 10 Vol.)</option>
              <option value="K.M. Ganguli">K.M. Ganguli Classical Translation (1883-1896)</option>
              <option value="Gita Press">Gita Press Vulgate Edition (Traditional Neelakantha)</option>
            </select>
          </div>

          {/* Sensitive Content & Crisis Filter */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-vedic-amber" /> Safety & Sensitive Content Guardrail
            </label>
            <p className="text-xs text-slate-500">
              Sensitivity level for detecting emotional crisis, grief, and mental distress.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['strict', 'standard', 'minimal'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCurrent({ ...current, sensitiveContentFilter: lvl })}
                  className={`p-2 rounded-xl border text-center capitalize text-xs font-medium transition-all ${
                    current.sensitiveContentFilter === lvl
                      ? 'bg-vedic-amber text-white border-vedic-amber shadow-sm'
                      : 'bg-parchment-50 text-slate-700 border-parchment-300 hover:bg-parchment-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Palette */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-900 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-vedic-amber" /> Visual Aesthetic Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'parchment', name: 'Warm Parchment' },
                { id: 'vedic-gold', name: 'Vedic Gold' },
                { id: 'dark-slate', name: 'Contemplative Slate' }
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setCurrent({ ...current, theme: th.id as any })}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                    current.theme === th.id
                      ? 'bg-vedic-indigo text-white border-vedic-indigo shadow-sm'
                      : 'bg-parchment-50 text-slate-700 border-parchment-300 hover:bg-parchment-100'
                  }`}
                >
                  {th.name}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Gemini API Key */}
          <div className="space-y-2 pt-2 border-t border-parchment-200">
            <label className="block font-semibold text-slate-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-vedic-amber" /> Custom Gemini API Key (Optional)
            </label>
            <p className="text-xs text-slate-500">
              DharmaAI runs out-of-the-box using high-fidelity scholarly corpus algorithms. Provide a personal Gemini key if you wish to enable custom live model inference.
            </p>
            <input
              type="password"
              value={current.geminiApiKey || ''}
              onChange={(e) => setCurrent({ ...current, geminiApiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full p-2.5 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-vedic-amber text-xs font-mono"
            />
          </div>

          {/* Danger Zone: Clear Local Data */}
          <div className="pt-4 border-t border-parchment-200">
            <button
              onClick={() => {
                if (confirm("Reset all bookmarks, search history, and conversation logs?")) {
                  onResetAllData();
                  onClose();
                }
              }}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Local Library & Chat History
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-parchment-100 border-t border-parchment-300 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Settings stored locally on this device
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-parchment-300 hover:bg-parchment-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-vedic-indigo hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-green-400" /> : null}
              <span>{savedSuccess ? 'Saved' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
