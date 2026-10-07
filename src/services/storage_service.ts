import { BookmarkItem, AppSettings, Conversation } from '../types/chat';

const BOOKMARKS_KEY = 'dharma_ai_bookmarks';
const HISTORY_KEY = 'dharma_ai_search_history';
const CONVERSATIONS_KEY = 'dharma_ai_conversations';
const SETTINGS_KEY = 'dharma_ai_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  scriptDisplay: 'both',
  preferredTranslation: 'BORI CE',
  sensitiveContentFilter: 'standard',
  theme: 'parchment'
};

export const storageService = {
  getBookmarks(): BookmarkItem[] {
    try {
      const data = localStorage.getItem(BOOKMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveBookmark(bookmark: BookmarkItem): void {
    const bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.id === bookmark.id);
    if (existingIndex >= 0) {
      bookmarks[existingIndex] = bookmark;
    } else {
      bookmarks.unshift(bookmark);
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  },

  removeBookmark(id: string): void {
    const bookmarks = this.getBookmarks().filter(b => b.id !== id);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  },

  isBookmarked(id: string): boolean {
    return this.getBookmarks().some(b => b.id === id);
  },

  getSearchHistory(): string[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [
        "How do I choose between duty and desire?",
        "I feel betrayed by someone I trusted",
        "Fear of failure in action",
        "Dealing with unprovoked anger"
      ];
    } catch {
      return [];
    }
  },

  addSearchHistory(query: string): void {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    let history = this.getSearchHistory().filter(q => q.toLowerCase() !== clean.toLowerCase());
    history.unshift(clean);
    if (history.length > 15) history = history.slice(0, 15);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  clearSearchHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  },

  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(CONVERSATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveConversation(conv: Conversation): void {
    const convs = this.getConversations();
    const index = convs.findIndex(c => c.id === conv.id);
    if (index >= 0) {
      convs[index] = conv;
    } else {
      convs.unshift(conv);
    }
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
  },

  deleteConversation(id: string): void {
    const convs = this.getConversations().filter(c => c.id !== id);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
  },

  clearConversations(): void {
    localStorage.removeItem(CONVERSATIONS_KEY);
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
