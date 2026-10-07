import { GuidanceResponse } from './guidance';
import { CorpusItem } from './mahabharata';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  guidance?: GuidanceResponse;
  suggestedFollowUps?: string[];
  feedback?: 'helpful' | 'unhelpful';
}

export interface Conversation {
  id: string;
  title: string;
  mode: 'chat' | 'ask-krishna';
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface BookmarkItem {
  id: string;
  savedAt: number;
  type: 'corpus-item' | 'response' | 'conversation';
  corpusItem?: CorpusItem;
  guidanceResponse?: GuidanceResponse;
  userQuery?: string;
  notes?: string;
  tags?: string[];
}

export interface AppSettings {
  scriptDisplay: 'iast' | 'devanagari' | 'both' | 'english_only';
  preferredTranslation: 'BORI CE' | 'K.M. Ganguli' | 'Bibek Debroy' | 'Gita Press';
  sensitiveContentFilter: 'strict' | 'standard' | 'minimal';
  theme: 'parchment' | 'vedic-gold' | 'dark-slate';
  geminiApiKey?: string;
}
