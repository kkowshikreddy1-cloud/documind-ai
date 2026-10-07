export interface ExamplePrompt {
  id: string;
  category: string;
  query: string;
  mode: 'quick-search' | 'chat' | 'ask-krishna';
  theme: string;
}

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: "ex-1",
    category: "Personal & Emotional",
    query: "I feel betrayed by someone I trusted.",
    mode: "ask-krishna",
    theme: "Forgiveness"
  },
  {
    id: "ex-2",
    category: "Duty & Dilemma",
    query: "How do I choose between my duty and what I personally want?",
    mode: "ask-krishna",
    theme: "Duty"
  },
  {
    id: "ex-3",
    category: "Fear & Action",
    query: "I am afraid of failing and cannot take action.",
    mode: "quick-search",
    theme: "Courage"
  },
  {
    id: "ex-4",
    category: "Interpersonal Conflict",
    query: "How should I respond to someone who constantly insults me?",
    mode: "chat",
    theme: "Patience"
  },
  {
    id: "ex-5",
    category: "Emotional Mastery",
    query: "I am struggling to control my anger.",
    mode: "chat",
    theme: "Anger"
  },
  {
    id: "ex-6",
    category: "Grief & Healing",
    query: "How can I recover after losing someone important?",
    mode: "ask-krishna",
    theme: "Grief"
  },
  {
    id: "ex-7",
    category: "Ethical Confusion",
    query: "I feel confused about what is right in a difficult workplace situation.",
    mode: "quick-search",
    theme: "Dharma"
  },
  {
    id: "ex-8",
    category: "Leadership & Work",
    query: "How should a leader balance kindness with firmness?",
    mode: "quick-search",
    theme: "Leadership"
  }
];
