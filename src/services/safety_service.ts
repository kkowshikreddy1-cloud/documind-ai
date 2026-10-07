export interface SafetyCheckResult {
  isDistress: boolean;
  severity: 'none' | 'mild' | 'critical';
  notice?: string;
  helplines?: { name: string; contact: string; countryOrRegion: string }[];
}

const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'want to die',
  'end my life',
  'end it all',
  'self harm',
  'cutting myself',
  'no reason to live',
  'better off dead',
  'hurt myself'
];

export const HELPLINES = [
  { name: 'Kiran (Govt of India Mental Health Helpline)', contact: '1800-599-0019', countryOrRegion: 'India (Toll-Free, 24/7)' },
  { name: 'Tele-MANAS (Govt of India)', contact: '14416 or 1800-891-4416', countryOrRegion: 'India (24/7, Multiple Languages)' },
  { name: 'Vandrevala Foundation Helpline', contact: '+91 9999 666 555', countryOrRegion: 'India (24/7, WhatsApp & Call)' },
  { name: 'AASRA Helpline', contact: '+91 98204 66726', countryOrRegion: 'India (24/7)' },
  { name: 'Suicide & Crisis Lifeline', contact: '988', countryOrRegion: 'United States & Canada (24/7, Call or Text)' },
  { name: 'Befrienders Worldwide', contact: 'befrienders.org', countryOrRegion: 'International Support Directory' }
];

export function checkSafety(query: string): SafetyCheckResult {
  const lower = query.toLowerCase();

  const isCritical = CRISIS_KEYWORDS.some(kw => lower.includes(kw));

  if (isCritical) {
    return {
      isDistress: true,
      severity: 'critical',
      notice: 'We sense you may be carrying immense pain. While the Mahabharata speaks of deep grief and despair, your safety and well-being are paramount. Please connect immediately with a compassionate, trained professional who can support you through this painful moment.',
      helplines: HELPLINES
    };
  }

  return {
    isDistress: false,
    severity: 'none'
  };
}
