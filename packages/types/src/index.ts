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
  prompt: string;
  promptBangla?: string;
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
  | FillBlankExercise;

// ─── Lessons ─────────────────────────────────────────────────────────────────

export type Lesson = {
  id: string;
  title: string;
  description: string;
  unit: number;
  order: number; // position within unit
  xpReward: number; // total XP for completing
  exercises: Exercise[];
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  order: number;
  color: string; // hex color for unit theming
  lessons: Lesson[];
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
