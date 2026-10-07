export type ParvaNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;

export type ContentType = "verse" | "dialogue" | "episode" | "commentary" | "teaching";

export type ThemeTag =
  | "Dharma"
  | "Duty"
  | "Grief"
  | "Anger"
  | "Forgiveness"
  | "Loyalty"
  | "Justice"
  | "Leadership"
  | "Truth"
  | "Karma"
  | "Detachment"
  | "Courage"
  | "Friendship"
  | "Family"
  | "Fate vs Free Will"
  | "Patience"
  | "Desire";

export type EmotionalTag =
  | "betrayal"
  | "fear_of_failure"
  | "grief_loss"
  | "anger_conflict"
  | "confusion_ethical"
  | "insult_humiliation"
  | "imposter_syndrome"
  | "loneliness"
  | "guilt_remorse"
  | "desire_vs_duty";

export interface WordGloss {
  word: string;
  meaning: string;
}

export interface Citation {
  id: string;
  parvaNumber: ParvaNumber;
  parvaNameEn: string;
  parvaNameSa: string;
  adhyaya: number;
  shlokaStart: number;
  shlokaEnd?: number;
  boriCE: string;
  ganguliRef?: string;
  debroyRef?: string;
  gitaPressRef?: string;
  speaker: string;
  listener: string;
  contextSummary: string;
}

export interface CorpusItem {
  id: string;
  title: string;
  type: ContentType;
  parvaNumber: ParvaNumber;
  parvaNameEn: string;
  parvaNameSa: string;
  adhyaya: number;
  shlokaStart: number;
  shlokaEnd?: number;
  
  speaker: string;
  listener: string;
  episodeName: string;
  historicalContext: string;
  
  sanskritDevanagari: string;
  sanskritIAST: string;
  wordGloss: WordGloss[];
  translationEn: string;
  translationSource: "BORI CE" | "K.M. Ganguli" | "Bibek Debroy" | "Gita Press";
  
  citations: Citation;
  
  themes: ThemeTag[];
  emotionalContexts: EmotionalTag[];
  characters: string[];
  
  relevanceExplanation?: string;
  philosophicalCommentary: string;
  practicalReflection: string;
  limitationsAndNuance?: string;
  suggestedAction: string;
  journalingPrompt?: string;
}

export interface ParvaMetadata {
  number: ParvaNumber;
  nameEn: string;
  nameSa: string;
  shortDesc: string;
  totalChaptersEstimate: number;
}
