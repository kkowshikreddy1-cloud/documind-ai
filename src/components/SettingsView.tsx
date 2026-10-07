import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Cpu, ShieldCheck, Check, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          DocuMind Platform Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure multimodal API credentials, document OCR engines, and database configurations.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Gemini API Key */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            Google Gemini API Key
          </label>
          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty to use built-in deterministic demo reasoner)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              {saved ? <Check className="w-4 h-4" /> : 'Save Key'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Never hardcoded. Configured via <code>GEMINI_API_KEY</code> environment variable or backend config.
          </p>
        </div>

        {/* Multimodal Model Selection */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Active Multimodal Model
          </label>
          <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Ultra Low Latency VLM)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Multimodal Document Analysis)</option>
            <option value="local-engine">Local Deterministic Reasoning Core</option>
          </select>
        </div>

        {/* Database & Storage */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Storage & Extraction Engine
          </label>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-1">
            <p><strong>Database:</strong> SQLite local persistent store (<code>documind.db</code>)</p>
            <p><strong>PDF Parser:</strong> PyMuPDF 1.28 + pdfplumber 0.11</p>
            <p><strong>Visual Renderer:</strong> 150 DPI RGB PyMuPDF Pixmap</p>
          </div>
        </div>
      </div>
    </div>
  );
};
