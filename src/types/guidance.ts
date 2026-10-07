import { Citation, CorpusItem, ContentType, ThemeTag } from './mahabharata';

export interface SearchResult {
  item: CorpusItem;
  relevanceScore: number;
  matchReasons: string[];
  shortAnswer: string;
  suggestedAction: string;
}

export interface GuidanceResponse {
  mode: "quick-search" | "chat" | "ask-krishna";
  answer: string;
  summary?: string;
  reflections?: string[];
  suggestedActions?: string[];
  journalingQuestion?: string;
  safetyNotice?: string;
  sourceType: "verified" | "demo" | "interpretive";
  citations: Citation[];
  relatedResults?: SearchResult[];
  confidence: "high" | "medium" | "low";
  limitations?: string[];
}

export interface FilterOptions {
  parvaNumber?: number;
  character?: string;
  theme?: ThemeTag;
  contentType?: ContentType;
  edition?: "BORI CE" | "K.M. Ganguli" | "Bibek Debroy" | "Gita Press";
  searchQuery?: string;
}
