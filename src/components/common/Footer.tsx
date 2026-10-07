import React from 'react';
import { ShieldAlert, BookOpen, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onOpenHowItWorks: () => void;
  onOpenSafetyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHowItWorks, onOpenSafetyModal }) => {
  return (
    <footer className="mt-16 border-t border-parchment-300 bg-parchment-100/60 py-10 text-slate-600 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="w-5 h-5 text-vedic-amber" />
              <h4 className="font-display font-semibold text-vedic-indigo text-base">Citation-First Scholarly Grounding</h4>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Every verse and teaching in DharmaAI is cross-referenced with the Bhandarkar Oriental Research Institute (BORI) Critical Edition, K.M. Ganguli unabridged translation, and Bibek Debroy recension.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <HeartHandshake className="w-5 h-5 text-amber-600" />
              <h4 className="font-display font-semibold text-vedic-indigo text-base">Non-Dogmatic Reflection</h4>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              DharmaAI does not impersonate deities or claim divine authority. It serves as an intellectual and ethical mirror reflecting life dilemmas through the timeless tapestry of the Mahabharata.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-vedic-crimson" />
              <h4 className="font-display font-semibold text-vedic-indigo text-base">Important Ethical Notice</h4>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs mb-2">
              DharmaAI does not provide medical, legal, psychological, or psychiatric advice. If you or someone you know is in emotional crisis, support is available 24/7.
            </p>
            <button
              onClick={onOpenSafetyModal}
              className="text-vedic-crimson font-medium underline hover:text-red-700 text-xs"
            >
              View Free Crisis & Mental Health Helplines
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-parchment-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DharmaAI. Designed for contemplative inquiry and ethical self-discovery.</p>
          <div className="flex items-center space-x-4">
            <button onClick={onOpenHowItWorks} className="hover:text-vedic-indigo underline">
              Product Principles
            </button>
            <span>•</span>
            <button onClick={onOpenSafetyModal} className="hover:text-vedic-indigo underline">
              Safety & Crisis Resources
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
