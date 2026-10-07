# Mahabharata Corpus Schema & Citation Standard (DharmaAI)

This document establishes the scholarly data schema, canonical structure, citation conventions, and taxonomy used by **DharmaAI** for textual retrieval and AI interpretation.

---

## 1. Canonical Structure of the Mahabharata

The Mahabharata is traditionally divided into 18 major books (*Parvas*), accompanied by the *Harivamsa* appendix (*Khila*).

| # | Parva Name | Sanskrit | Core Themes & Significant Sections |
|---|---|---|---|
| 01 | **Adi Parva** | आदिपर्व | Origins, lineages, Shakuntala-Dushyanta, Kacha-Devayani, Burning of the Khandava forest. |
| 02 | **Sabha Parva** | सभापर्व | Assembly hall, Maya Danava's construction, Rajasuya sacrifice, the Dyuta (game of dice), Draupadi's disrobing. |
| 03 | **Vana (Aranyaka) Parva** | वनपर्व | Forest exile, teachings of Markandeya, Nala-Damayanti, Savitri-Satyavan, Yaksha Prashna. |
| 04 | **Virata Parva** | विराटपर्व | Incognito year in Matsya kingdom, Kichaka's death, Battle of the Cattle Raid. |
| 05 | **Udyoga Parva** | उद्योगपर्व | Preparations for war, peace missions, Vidura Niti, Sanat-Sujata dialogue, Krishna Sandhana. |
| 06 | **Bhishma Parva** | भीष्मपर्व | First 10 days of war, **Bhagavad Gita** (Adhyayas 23–40 in BORI CE / BG 1–18), Fall of Bhishma upon bed of arrows. |
| 07 | **Drona Parva** | द्रोणपर्व | Days 11–15 of war, Chakra Vyuha, Abhimanyu's death, Drona's fall, Jayadratha's defeat. |
| 08 | **Karna Parva** | कर्णपर्व | Days 16–17 of war, Karna as commander, duel with Arjuna, Karna's defeat. |
| 09 | **Shalya Parva** | शल्यपर्व | Day 18 of war, Shalya's demise, mace duel between Bhima and Duryodhana at Dvaipayana lake. |
| 10 | **Sauptika Parva** | सौप्तिकपर्व | Ashvatthama's nocturnal massacre of the Pandava camp, release of Brahmashira weapon. |
| 11 | **Stri Parva** | स्त्रीपर्व | Lamentations of women on the battlefield, Gandhari's curse on Krishna, funeral rites. |
| 12 | **Shanti Parva** | शान्तिपर्व | Post-war despondency of Yudhishthira, Bhishma's discourses on **Rajadharma** (governance), **Apaddharma** (calamity ethics), and **Mokshadharma** (liberation). |
| 13 | **Anushasana Parva** | अनुशासनपर्व | Bhishma's final discourses on Dana (charity), Shraddha, Ahimsa, and Vishnu Sahasranama. |
| 14 | **Ashvamedhika Parva** | आश्वमेधिकपर्व | Horse sacrifice, Anugita (Krishna's second discourse to Arjuna), Arjuna's world campaign. |
| 15 | **Ashramavasika Parva** | आश्रमावासिकपर्व | Retirement of Dhritarashtra, Gandhari, and Kunti to the forest, their demise in forest fire. |
| 16 | **Mausala Parva** | मौसलपर्व | Destruction of the Vrishni clan, submersion of Dvaraka, demise of Balarama and Krishna. |
| 17 | **Mahaprasthanika Parva** | महाप्रस्थानिकपर्व | Pandavas' final pilgrimage to the Himalayas, fall of Draupadi and brothers, Yudhishthira and the faithful dog. |
| 18 | **Svargarohana Parva** | स्वर्गारोहणपर्व | Yudhishthira's ascent to heaven, trial of hell, ultimate reconciliation in the celestial realm. |
| 19 | **Harivamsa (Appendix)** | हरिवंश | The genealogy and early exploits of Krishna (traditionally treated as the 19th book). |

---

## 2. Citation Conventions

DharmaAI implements a unified citation standard cross-referencing major editions:

### Primary Identifier: BORI Critical Edition (BORI CE)
Prepared by the Bhandarkar Oriental Research Institute (Pune, 1919–1966).
Format:
```
MBh. [Parva:2-digit].[Adhyaya:3-digit].[Shloka:3-digit]
Example: MBh. 06.024.047 (Bhagavad Gita 2.47 in BORI CE)
```

### Secondary Editions Cross-Referenced:
1. **K. M. Ganguli Translation (KM Ganguli)**:
   - First unabridged English prose translation (1883–1896).
   - Format: `KM Ganguli: [Parva Name], Section [Roman/Arabic Numeral]`.
2. **Bibek Debroy Translation (Debroy)**:
   - Modern unabridged English translation based directly on BORI CE (Penguin, 2010–2014).
   - Format: `Debroy: Vol. [1-10], [Parva Name] [Chapter:Verse]`.
3. **Gita Press Edition (Gorakhpur)**:
   - Widely circulating Vulgate text (traditional Neelakantha commentary tradition).
   - Format: `Gita Press: [Parva Name] [Chapter:Verse]`.

---

## 3. Data Schema (TypeScript Interfaces)

```ts
export type ParvaNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;

export interface CorpusItem {
  id: string; // e.g. "mbh-06-024-047"
  type: "verse" | "dialogue" | "episode" | "commentary" | "teaching";
  parvaNumber: ParvaNumber;
  parvaNameEn: string;
  parvaNameSa: string;
  adhyaya: number;
  shlokaStart: number;
  shlokaEnd?: number;
  
  // Speakers & Listeners
  speaker: string;
  listener: string;
  historicalContext: string;
  
  // Text representations
  sanskritDevanagari: string;
  sanskritIAST: string;
  wordGloss: { word: string; meaning: string }[];
  translationEn: string;
  translationSource: "BORI CE" | "K.M. Ganguli" | "Bibek Debroy" | "Gita Press";
  
  // Cross-edition citations
  citations: {
    boriCE: string;
    ganguliSection?: string;
    debroyRef?: string;
    gitaPressRef?: string;
  };
  
  // Scholarly metadata
  themes: ThemeTag[];
  emotionalContexts: EmotionalTag[];
  moralConcepts: MoralTag[];
  characters: string[];
  
  // Commentary & modern application
  philosophicalCommentary: string;
  practicalReflection: string;
  limitationsAndNuance?: string;
  suggestedAction: string;
}

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
```

---

## 4. Ethical & AI Interpretation Policy

1. **Separation of Text vs. Interpretation**:
   - Any direct verse or dialogue is explicitly marked as `sourceType: "verified"`.
   - Any modern cognitive reframing, coaching prompt, or situational mapping is explicitly identified as `sourceType: "interpretive"`.
2. **Anti-Dogmatism & Plurality**:
   - Multiple perspectives within the epic are acknowledged (e.g. Draupadi's critique of passivity vs. Yudhishthira's defense of Dharma as its own reward).
3. **No Divine Impersonation**:
   - When answering in *Ask Krishna* mode, the system never generates first-person claims of godhood or divine commandment. It reflects on Krishna's words from the Bhagavad Gita and peace dialogues with philosophical humility.
