import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, MessageSquare, Trash2, Send, Sparkles, 
  Menu, X 
} from 'lucide-react';
import { Conversation, ChatMessage as ChatMessageType, BookmarkItem } from '../../types/chat';
import { CorpusItem } from '../../types/mahabharata';
import { guidanceEngine } from '../../services/guidance_engine';
import { storageService } from '../../services/storage_service';
import { MAHABHARATA_CORPUS } from '../../data/mahabharata_corpus';
import { ChatMessage } from './ChatMessage';

interface ChatModeProps {
  onViewSource: (item: CorpusItem) => void;
  onBookmarkItem: (item: BookmarkItem) => void;
  isBookmarked: (id: string) => boolean;
  initialQuery?: string;
}

const DEFAULT_FOLLOW_UPS = [
  "Explain this in simple words.",
  "Show the original verse.",
  "What can I do today?",
  "Tell me another Mahabharata example.",
  "How is this different from avoiding responsibility?",
  "What are the limitations of this teaching?"
];

export const ChatMode: React.FC<ChatModeProps> = ({
  onViewSource,
  onBookmarkItem,
  isBookmarked,
  initialQuery
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or load conversations
  useEffect(() => {
    const saved = storageService.getConversations().filter(c => c.mode === 'chat');
    if (saved.length > 0) {
      setConversations(saved);
      setActiveConvId(saved[0].id);
    } else {
      createNewConversation();
    }
  }, []);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, conversations, isLoading]);

  const activeConversation = conversations.find(c => c.id === activeConvId);

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: `chat-${Date.now()}`,
      title: "New Reflection",
      mode: 'chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: `Pranam. I am DharmaAI. I help you reflect on ethical, personal, and life dilemmas using authentic stories, verses, and dialogues from the Mahabharata.\n\nWhat challenge, decision, or state of mind is on your heart today?`,
          timestamp: Date.now(),
          suggestedFollowUps: [
            "I feel betrayed by someone I trusted",
            "How do I choose between duty and desire?",
            "I am afraid of failing and cannot take action",
            "How do I control sudden anger?"
          ]
        }
      ]
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConvId(newConv.id);
    storageService.saveConversation(newConv);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading || !activeConvId) return;

    setInputMessage('');
    const userMsg: ChatMessageType = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: Date.now()
    };

    // Update conversation with user message
    const currentConv = conversations.find(c => c.id === activeConvId);
    if (!currentConv) return;

    let updatedTitle = currentConv.title;
    if (currentConv.messages.length <= 1) {
      // Auto generate title from first query
      updatedTitle = text.length > 32 ? text.slice(0, 32) + '...' : text;
    }

    const convWithUser: Conversation = {
      ...currentConv,
      title: updatedTitle,
      updatedAt: Date.now(),
      messages: [...currentConv.messages, userMsg]
    };

    const updatedConvs = conversations.map(c => c.id === activeConvId ? convWithUser : c);
    setConversations(updatedConvs);
    storageService.saveConversation(convWithUser);

    // Trigger AI response synthesis
    setIsLoading(true);
    setTimeout(() => {
      const guidance = guidanceEngine.generateGuidance(
        text,
        'chat',
        convWithUser.messages.map(m => ({ role: m.sender, content: m.content }))
      );

      // Choose contextual follow-ups
      const chosenFollowUps = DEFAULT_FOLLOW_UPS.slice(0, 4);

      const assistantMsg: ChatMessageType = {
        id: `msg-a-${Date.now()}`,
        sender: 'assistant',
        content: guidance.answer,
        timestamp: Date.now(),
        guidance,
        suggestedFollowUps: chosenFollowUps
      };

      const finalConv: Conversation = {
        ...convWithUser,
        updatedAt: Date.now(),
        messages: [...convWithUser.messages, assistantMsg]
      };

      setConversations(prev => prev.map(c => c.id === activeConvId ? finalConv : c));
      storageService.saveConversation(finalConv);
      setIsLoading(false);
    }, 600);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.deleteConversation(id);
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeConvId === id) {
      if (remaining.length > 0) {
        setActiveConvId(remaining[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to clear all chat history?")) {
      storageService.clearConversations();
      setConversations([]);
      createNewConversation();
    }
  };

  const handleBookmarkGuidance = (msg: ChatMessageType) => {
    if (msg.guidance) {
      const bItem: BookmarkItem = {
        id: `bm-${msg.id}`,
        savedAt: Date.now(),
        type: 'response',
        guidanceResponse: msg.guidance,
        userQuery: msg.content.slice(0, 60),
        notes: msg.guidance.summary
      };
      onBookmarkItem(bItem);
    }
  };

  const handleViewSourceByCitation = (citationId: string) => {
    const item = MAHABHARATA_CORPUS.find(c => c.citations.id === citationId || citationId.includes(c.id));
    if (item) {
      onViewSource(item);
    } else {
      onViewSource(MAHABHARATA_CORPUS[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex rounded-2xl border border-parchment-300 bg-parchment-100/40 shadow-warm overflow-hidden relative">
      {/* Sidebar for Conversations */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-parchment-50 border-r border-parchment-300 p-4 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Top header in sidebar */}
          <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
            <span className="font-display font-semibold text-sm text-vedic-indigo">
              Conversations
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              createNewConversation();
              setSidebarOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-vedic-indigo text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Conversation
          </button>

          {/* Conversations List */}
          <div className="space-y-1.5 pt-2">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setSidebarOpen(false);
                  }}
                  className={`group w-full p-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? 'bg-white text-vedic-amber shadow-sm border border-parchment-300 font-semibold'
                      : 'text-slate-600 hover:bg-parchment-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-vedic-amber' : 'text-slate-400'}`} />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clear All Footer */}
        {conversations.length > 1 && (
          <div className="pt-3 border-t border-parchment-200 text-center">
            <button
              onClick={handleClearAllHistory}
              className="text-[11px] text-slate-400 hover:text-red-600 transition-colors"
            >
              Clear all conversations
            </button>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-parchment-50/50">
        {/* Chat Header Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-parchment-300 bg-white/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-600 hover:bg-parchment-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base text-vedic-indigo">
                {activeConversation?.title || "Dharma Reflection"}
              </h2>
              <span className="text-[10px] text-slate-500">
                Multi-turn dialogue grounded in classical verses
              </span>
            </div>
          </div>

          <button
            onClick={createNewConversation}
            className="text-xs text-vedic-amber hover:text-amber-800 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeConversation?.messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSelectFollowUp={(prompt) => handleSendMessage(prompt)}
              onRegenerate={() => handleSendMessage(msg.content)}
              onBookmarkGuidance={handleBookmarkGuidance}
              onViewSourceByCitation={handleViewSourceByCitation}
              isBookmarked={msg.guidance ? isBookmarked(`bm-${msg.id}`) : false}
            />
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs p-4 bg-white rounded-2xl border border-parchment-200 max-w-md animate-pulse">
              <Sparkles className="w-4 h-4 text-vedic-amber animate-spin" />
              <span>Consulting the Mahabharata corpus and synthesizing reflection...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-parchment-300">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for guidance, share an ethical dilemma, or request a verse..."
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-parchment-50 border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-vedic-amber text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 rounded-xl transition-all ${
                inputMessage.trim() && !isLoading
                  ? 'bg-vedic-amber text-white hover:bg-amber-600 shadow-md'
                  : 'bg-parchment-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
