import React from 'react';
import { X, CheckCircle2, ShieldCheck, BookMarked, Sparkles } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const principles = [
    { title: "1. Citation-First", desc: "Every moral insight is anchored in authentic Parva, Adhyaya, and Shloka references across BORI Critical Edition and classical translations." },
    { title: "2. Compassionate", desc: "Meets human suffering, confusion, and fear with warmth, non-judgmental understanding, and grounded dignity." },
    { title: "3. Transparent", desc: "Explicitly distinguishes between verified primary Sanskrit text and secondary AI situational interpretations." },
    { title: "4. Non-Dogmatic", desc: "Honors the vibrant plurality of perspectives in the epic, contrasting Yudhishthira's righteousness with Draupadi's fierce realism." },
    { title: "5. Scholarly but Approachable", desc: "Offers dual Sanskrit scripts (Devanagari & IAST) with word-by-word glosses, yet frames lessons in accessible everyday language." },
    { title: "6. Safe for Sensitive Questions", desc: "Recognizes emotional distress and immediately provides verified crisis helplines without dismissiveness." },
    { title: "7. Accessible to Non-Experts", desc: "Requires no prior knowledge of Sanskrit or Indian history to find practical guidance for daily life." },
    { title: "8. Respectful of Diverse Traditions", desc: "Cross-references the academic BORI CE with K.M. Ganguli, Bibek Debroy, and Gita Press recensions." },
    { title: "9. Grounded Demarcation", desc: "Never invents quotations or fabricates synthetic verses out of thin air." },
    { title: "10. Ethical Boundaries", desc: "Does not pretend to be a doctor, therapist, lawyer, priest, or divine entity. It helps you reflect, not abdicate your agency." }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-parchment-50 rounded-2xl shadow-2xl border border-parchment-300 overflow-hidden my-8">
        <div className="p-6 bg-gradient-to-r from-parchment-100 to-parchment-200 border-b border-parchment-300 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-vedic-amber" />
              <h3 className="font-display font-bold text-xl text-vedic-indigo">
                How DharmaAI Works
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              The 10 Product Principles Guiding Our Scholarly & AI Architecture
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-parchment-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
            <h5 className="font-semibold text-amber-900 flex items-center gap-1.5">
              <BookMarked className="w-4 h-4 text-amber-700" />
              Non-Impersonation & Scholarly Reflection Notice
            </h5>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              In <strong>Ask Krishna</strong> mode, DharmaAI does not claim to literally be Krishna, speak as a deity, or offer divine prophecies. All responses are philosophical reflections grounded directly in Krishna’s discourses in the Bhagavad Gita (Bhishma Parva) and peace negotiations (Udyoga Parva).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {principles.map((p, idx) => (
              <div key={idx} className="p-3.5 bg-white rounded-xl border border-parchment-200 shadow-sm flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-vedic-amber flex-shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-semibold text-slate-900 text-xs sm:text-sm">{p.title}</h6>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-parchment-100 border-t border-parchment-300 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-vedic-indigo text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
