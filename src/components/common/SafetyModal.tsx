import React from 'react';
import { X, HeartHandshake, ShieldCheck } from 'lucide-react';
import { HELPLINES } from '../../services/safety_service';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
        {/* Header with warm compassionate tone */}
        <div className="p-6 bg-red-50 border-b border-red-100 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                You Are Not Alone
              </h3>
              <p className="text-xs text-red-700 font-medium">
                Compassionate Human Support & Crisis Resources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-red-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700">
          <p className="leading-relaxed">
            The Mahabharata teaches that emotional sorrow, profound overwhelm, and despair are part of the human journey. However, philosophical reflection cannot replace immediate, caring, professional human support when acute distress arises.
          </p>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
            <h5 className="font-semibold text-amber-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Confidential, Free & Available 24/7
            </h5>
            <p className="text-xs text-amber-800">
              These helplines are staffed by trained, empathetic professionals who will listen without judgment.
            </p>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {HELPLINES.map((hl, idx) => (
              <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-colors">
                <div>
                  <h6 className="font-semibold text-slate-900 text-xs sm:text-sm">{hl.name}</h6>
                  <span className="text-[11px] text-slate-500">{hl.countryOrRegion}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs sm:text-sm text-vedic-amber bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {hl.contact}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 italic pt-2">
            Disclaimer: DharmaAI is an educational cultural and philosophical reflection application. It is not licensed to provide psychotherapy, psychological intervention, or medical advice.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
