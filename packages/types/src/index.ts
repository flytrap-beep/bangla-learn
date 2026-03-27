// ─── Dialects ────────────────────────────────────────────────────────────────

export type Dialect = "standard" | "sylheti" | "barisali" | "chittagonian";

export const DIALECTS: Record<Dialect, { label: string; nativeLabel: string; region: string; flagEmoji: string }> = {
  standard: {
    label: "Standard Bengali",
    nativeLabel: "শুদ্ধ বাংলা",
    region: "Bangladesh & West Bengal",
    flagEmoji: "🇧🇩",
  },
  sylheti: {
    label: "Sylheti",
    nativeLabel: "সিলটি",
    region: "Sylhet, UK diaspora",
    flagEmoji: "🏙️",
  },
  barisali: {
    label: "Barisali",
    nativeLabel: "বরিশালি",
    region: "Barisal Division",
    flagEmoji: "🌊",
  },
  chittagonian: {
    label: "Chittagonian",
    nativeLabel: "চাটগাঁইয়া",
    region: "Chittagong Division",
    flagEmoji: "⛵",
  },
};

// ─── Exercises ────────────────────────────────────────────────────────────────

export type MultipleChoiceExercise = {
  type: "multiple_choice";
  id: string;
  prompt: string;           // The question text
  promptBangla?: string;    // Bengali word/phrase to show
  romanization?: string;    // Pronunciation guide
  imageKey?: string;        // Key for WordPicture illustration
  options: string[];
  correct: number; // index into options
  audio?: string;
  xp: number;
};

export type TranslateToEnglishExercise = {
  type: "translate_to_english";
  id: string;
  bangla: string;
  romanization: string;
  answer: string;
  audio?: string;
  xp: number;
};

export type TranslateToBanglaExercise = {
  type: "translate_to_bangla";
  id: string;
  english: string;
  answer: string; // Bengali script answer
  romanization: string;
  xp: number;
};

export type MatchPairsExercise = {
  type: "match_pairs";
  id: string;
  pairs: { bangla: string; english: string; romanization: string }[];
  xp: number;
};

export type LetterTraceExercise = {
  type: "letter_trace";
  id: string;
  character: string;      // Bengali script: অ, আ, ক…
  romanization: string;   // pronunciation: "o/a", "k"…
  exampleWord?: string;   // e.g. "আম (mango)"
  strokeHint?: string;    // e.g. "Start at the top, curve right"
  xp: number;
};

export type FillBlankExercise = {
  type: "fill_blank";
  id: string;
  sentence: string; // use ___ for blank
  blank: string; // correct fill
  romanization: string;
  options: string[];
  xp: number;
};

export type Exercise =
  | MultipleChoiceExercise
  | TranslateToEnglishExercise
  | TranslateToBanglaExercise
  | MatchPairsExercise
  | FillBlankExercise
  | LetterTraceExercise;

// ─── Lessons ─────────────────────────────────────────────────────────────────

export type Lesson = {
  id: string;
  title: string;
  description: string;
  unit: number;
  order: number; // position within unit
  xpReward: number; // total XP for completing
  exercises: Exercise[];
  isQuiz?: boolean;   // if true, romanization is hidden (test real knowledge)
  isTrace?: boolean;  // if true, this is a letter-tracing lesson
};

// ─── Unit Prep (Characters, Grammar, Flashcards) ─────────────────────────────

export type Character = {
  symbol: string;       // Bengali script: অ
  romanization: string; // how to pronounce: "o/a"
  type: "vowel" | "consonant";
  exampleWord?: string;       // Bengali word using it
  exampleMeaning?: string;    // English meaning
};

export type GrammarPoint = {
  title: string;
  explanation: string;
  examples: { bangla: string; romanization: string; english: string }[];
};

export type Flashcard = {
  id: string;
  bangla: string;
  romanization: string;
  english: string;
  emoji?: string;       // visual picture substitute (optional)
  category?: string;
};

export type UnitPrep = {
  characters: Character[];
  grammar: GrammarPoint[];
  flashcards: Flashcard[];
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  order: number;
  color: string; // hex color for unit theming
  lessons: Lesson[];
  prep?: UnitPrep;
};

export type DialectCurriculum = {
  dialect: Dialect;
  units: Unit[];
};

// ─── User / Progress ─────────────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
};

export type LessonProgress = {
  lessonId: string;
  dialect: Dialect;
  completed: boolean;
  xpEarned: number;
  completedAt: Date | null;
};

export type UserStats = {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  hearts: number;
  completedLessons: number;
};

// ─── API Response types ───────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CompleteLesson = {
  lessonId: string;
  dialect: Dialect;
  xpEarned: number;
  heartsLost: number;
};
