import { MAHABHARATA_CORPUS } from '../data/mahabharata_corpus';
import { CorpusItem, ThemeTag, ContentType } from '../types/mahabharata';
import { GuidanceResponse, SearchResult, FilterOptions } from '../types/guidance';
import { checkSafety } from './safety_service';

export const guidanceEngine = {
  /**
   * Search and rank items from the Mahabharata corpus with multifaceted filters
   */
  search(query: string, filters?: FilterOptions): SearchResult[] {
    const rawTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
    
    // Map keywords to emotional contexts
    const emotionMappings: Record<string, string[]> = {
      betrayal: ['betrayal', 'trust', 'betrayed', 'cheat', 'disloyal', 'backstab', 'shakuni', 'deceit'],
      fear_of_failure: ['fail', 'failure', 'afraid', 'fear', 'anxiety', 'paralysis', 'scared', 'uncertainty', 'hesitate'],
      grief_loss: ['grief', 'loss', 'died', 'death', 'lost', 'mourning', 'sadness', 'sorrow', 'crying'],
      anger_conflict: ['anger', 'angry', 'rage', 'fight', 'conflict', 'insult', 'revenge', 'furious', 'temper'],
      confusion_ethical: ['confused', 'dharma', 'right', 'wrong', 'ethical', 'moral', 'dilemma', 'choice', 'decision'],
      insult_humiliation: ['insult', 'humiliation', 'disrespected', 'mocked', 'shamed', 'ridiculed'],
      imposter_syndrome: ['imposter', 'worthless', 'incapable', 'doubt', 'confidence', 'comparison'],
      desire_vs_duty: ['duty', 'desire', 'want', 'temptation', 'career', 'passion', 'obligation', 'responsibility']
    };

    const identifiedEmotions: string[] = [];
    for (const [emotion, words] of Object.entries(emotionMappings)) {
      if (words.some(w => rawTokens.includes(w) || query.toLowerCase().includes(w))) {
        identifiedEmotions.push(emotion);
      }
    }

    const scoredItems: { item: CorpusItem; score: number; matchReasons: string[] }[] = [];

    for (const item of MAHABHARATA_CORPUS) {
      let score = 0;
      const matchReasons: string[] = [];

      // Filter checks
      if (filters?.parvaNumber && item.parvaNumber !== filters.parvaNumber) {
        continue;
      }
      if (filters?.character && !item.characters.some(c => c.toLowerCase() === filters.character?.toLowerCase())) {
        continue;
      }
      if (filters?.theme && !item.themes.includes(filters.theme)) {
        continue;
      }
      if (filters?.contentType && item.type !== filters.contentType) {
        continue;
      }
      if (filters?.edition && item.translationSource !== filters.edition) {
        continue;
      }

      // Emotional context match
      const matchingEmotions = item.emotionalContexts.filter(e => identifiedEmotions.includes(e));
      if (matchingEmotions.length > 0) {
        score += matchingEmotions.length * 35;
        matchReasons.push(`Matches emotional state: ${matchingEmotions.join(', ').replace(/_/g, ' ')}`);
      }

      // Query token matches in title, translation, commentary, themes, characters
      const titleLower = item.title.toLowerCase();
      const translationLower = item.translationEn.toLowerCase();
      const commentaryLower = item.philosophicalCommentary.toLowerCase();
      const episodeLower = item.episodeName.toLowerCase();

      for (const token of rawTokens) {
        if (titleLower.includes(token)) {
          score += 25;
          matchReasons.push(`Title mentions '${token}'`);
        }
        if (item.themes.some(t => t.toLowerCase().includes(token))) {
          score += 20;
          matchReasons.push(`Direct theme match: '${token}'`);
        }
        if (item.characters.some(c => c.toLowerCase().includes(token))) {
          score += 25;
          matchReasons.push(`Features character: '${token}'`);
        }
        if (episodeLower.includes(token)) {
          score += 15;
          matchReasons.push(`Episode relevance: '${token}'`);
        }
        if (translationLower.includes(token)) {
          score += 10;
        }
        if (commentaryLower.includes(token)) {
          score += 8;
        }
      }

      // Exact phrase match bonus
      if (query.trim().length > 5 && (translationLower.includes(query.toLowerCase()) || commentaryLower.includes(query.toLowerCase()))) {
        score += 40;
        matchReasons.push("Exact textual alignment");
      }

      // If no search token query provided, base score allows browsing
      if (rawTokens.length === 0) {
        score = 10;
        matchReasons.push("Curated canonical teaching");
      }

      if (score > 0) {
        // Deduplicate match reasons
        const uniqueReasons = Array.from(new Set(matchReasons)).slice(0, 3);
        scoredItems.push({
          item,
          score,
          matchReasons: uniqueReasons.length > 0 ? uniqueReasons : ["Relevant thematic context in Mahabharata"]
        });
      }
    }

    // Sort descending by score
    scoredItems.sort((a, b) => b.score - a.score);

    return scoredItems.map(({ item, score, matchReasons }) => ({
      item,
      relevanceScore: Math.min(100, score),
      matchReasons,
      shortAnswer: item.practicalReflection.split('.')[0] + '.',
      suggestedAction: item.suggestedAction
    }));
  },

  /**
   * Synthesize a GuidanceResponse conforming strictly to the AI contract
   */
  generateGuidance(
    query: string,
    mode: 'quick-search' | 'chat' | 'ask-krishna',
    contextHistory?: { role: string; content: string }[],
    filters?: FilterOptions
  ): GuidanceResponse {
    // 1. Safety check
    const safety = checkSafety(query);
    const searchResults = this.search(query, filters);
    const topResult = searchResults[0] || {
      item: MAHABHARATA_CORPUS[0],
      relevanceScore: 70,
      matchReasons: ["Foundational ethical reflection from the Gita"],
      shortAnswer: MAHABHARATA_CORPUS[0].practicalReflection.split('.')[0] + '.',
      suggestedAction: MAHABHARATA_CORPUS[0].suggestedAction
    };

    const primaryItem = topResult.item;
    const citations = [primaryItem.citations];
    if (searchResults[1]) {
      citations.push(searchResults[1].item.citations);
    }

    // 2. Mode-Specific Response Synthesis
    if (mode === 'quick-search') {
      return {
        mode: 'quick-search',
        answer: `${primaryItem.translationEn}\n\n${primaryItem.philosophicalCommentary}`,
        summary: primaryItem.practicalReflection,
        reflections: [
          primaryItem.practicalReflection,
          `Mahabharata Context: In ${primaryItem.parvaNameEn} (${primaryItem.episodeName}), ${primaryItem.speaker} counsels ${primaryItem.listener}.`,
          `Philosophical Dimension: ${primaryItem.philosophicalCommentary}`
        ],
        suggestedActions: [
          primaryItem.suggestedAction,
          "Reflect on how much of this dilemma is within your direct control vs outside conditions."
        ],
        journalingQuestion: primaryItem.journalingPrompt,
        safetyNotice: safety.notice,
        sourceType: 'verified',
        citations,
        relatedResults: searchResults.slice(0, 5),
        confidence: searchResults.length > 0 && topResult.relevanceScore > 40 ? 'high' : 'medium',
        limitations: [
          primaryItem.limitationsAndNuance || "This ancient context serves as an ethical mirror, not a substitute for legal, medical, or professional advice.",
          "Different recensions and commentaries may offer alternative interpretations."
        ]
      };
    }

    if (mode === 'ask-krishna') {
      // Follows strictly the 7-step reflective structure
      const acknowledgement = `I hear the weight of what you are carrying. In the human journey of the Mahabharata, even the greatest warriors and seekers found themselves in this exact crucible of confusion, grief, and vulnerability.`;
      
      const reflectionOnProblem = `When you confront this situation, the mind instinctively oscillates between wanting to escape the discomfort and reacting with haste. In ${primaryItem.parvaNameEn}, ${primaryItem.listener} stood before ${primaryItem.speaker} with the very same turmoil: caught between emotional pain and the demand for rightful action.`;

      const philosophicalPrinciple = `The teaching here centers on ${primaryItem.themes.join(' and ')}. As expressed in ${primaryItem.citations.boriCE}: "${primaryItem.translationEn}" The core principle is that inner equanimity is not born from controlling all circumstances, but from aligning your consciousness with what is true and noble within your present reach.`;

      const sourceCitationIntro = `[Cited Source: ${primaryItem.citations.boriCE} — ${primaryItem.speaker} to ${primaryItem.listener} in ${primaryItem.episodeName}]`;

      const practicalNextStep = `Practical Step Forward: ${primaryItem.suggestedAction}`;

      const fullAnswer = `${acknowledgement}\n\n${reflectionOnProblem}\n\n${sourceCitationIntro}\n\n${philosophicalPrinciple}\n\n${practicalNextStep}`;

      return {
        mode: 'ask-krishna',
        answer: fullAnswer,
        summary: `Reflective guidance on ${primaryItem.themes[0] || 'Dharma'} drawn from ${primaryItem.citations.boriCE}.`,
        reflections: [
          `Compassionate acknowledgment of your dilemma.`,
          `Historical parallel: ${primaryItem.speaker}'s counsel to ${primaryItem.listener}.`,
          primaryItem.philosophicalCommentary
        ],
        suggestedActions: [
          primaryItem.suggestedAction,
          "Take a slow breath and separate immediate ethical responsibility from long-term anxiety."
        ],
        journalingQuestion: primaryItem.journalingPrompt || "What is the most honest and courageous next step I can take today?",
        safetyNotice: safety.notice,
        sourceType: 'interpretive',
        citations,
        relatedResults: searchResults.slice(1, 4),
        confidence: 'high',
        limitations: [
          "This guidance is an interpretive reflection inspired by teachings from the Mahabharata; it is not a divine decree or personalized psychotherapy.",
          primaryItem.limitationsAndNuance || "Contextual differences between ancient narrative and modern circumstances should be weighed carefully."
        ]
      };
    }

    // mode === 'chat'
    const isFollowUpVerseRequest = query.toLowerCase().includes('verse') || query.toLowerCase().includes('original');
    const isFollowUpSimple = query.toLowerCase().includes('simple') || query.toLowerCase().includes('explain');
    const isActionRequest = query.toLowerCase().includes('today') || query.toLowerCase().includes('do');

    let chatAnswer = "";
    if (isFollowUpVerseRequest) {
      chatAnswer = `Here is the canonical Sanskrit verse for **${primaryItem.title}** from **${primaryItem.citations.boriCE}**:\n\n` +
        `**Devanagari:**\n> ${primaryItem.sanskritDevanagari.replace(/\n/g, '\n> ')}\n\n` +
        `**IAST Transliteration:**\n*${primaryItem.sanskritIAST.replace(/\n/g, '*\n*')}*\n\n` +
        `**English Translation:**\n"${primaryItem.translationEn}"\n\n` +
        `*(Speaker: ${primaryItem.speaker}, Listener: ${primaryItem.listener}, Parva: ${primaryItem.parvaNameEn})*`;
    } else if (isFollowUpSimple) {
      chatAnswer = `In simple, everyday terms:\n\n` +
        `1. **The Core Point:** ${primaryItem.practicalReflection}\n` +
        `2. **The Ancient Parallel:** Just as ${primaryItem.listener} felt overwhelmed during ${primaryItem.episodeName}, your feeling is completely understandable.\n` +
        `3. **What Matters Now:** Do not exhaust yourself fighting what has already occurred. Direct your focus exclusively to the immediate decision within your jurisdiction.`;
    } else if (isActionRequest) {
      chatAnswer = `Here is a concrete way to practice this teaching today:\n\n` +
        `**Action:** ${primaryItem.suggestedAction}\n\n` +
        `**Anchor Verse:** *${primaryItem.citations.boriCE}*\n` +
        `"${primaryItem.translationEn}"\n\n` +
        `Whenever self-doubt strikes today, remember: ${topResult.shortAnswer}`;
    } else {
      chatAnswer = `Regarding your reflection: *" ${query} "*\n\n` +
        `In the **${primaryItem.parvaNameEn}** (${primaryItem.episodeName}), ${primaryItem.speaker} addresses this exact challenge with ${primaryItem.listener}.\n\n` +
        `**The Teaching (${primaryItem.citations.boriCE}):**\n` +
        `"${primaryItem.translationEn}"\n\n` +
        `**Practical Meaning:** ${primaryItem.philosophicalCommentary}\n\n` +
        `**Next Step:** ${primaryItem.practicalReflection}`;
    }

    return {
      mode: 'chat',
      answer: chatAnswer,
      summary: primaryItem.practicalReflection,
      reflections: [
        `Mahabharata reference: ${primaryItem.citations.boriCE}`,
        primaryItem.practicalReflection
      ],
      suggestedActions: [
        primaryItem.suggestedAction
      ],
      journalingQuestion: primaryItem.journalingPrompt,
      safetyNotice: safety.notice,
      sourceType: 'verified',
      citations,
      relatedResults: searchResults.slice(1, 3),
      confidence: 'high',
      limitations: [
        "Guidance provided as an educational, ethical reflection grounded in classical texts."
      ]
    };
  }
};
