"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Item = {
  symbol: string;
  romanization: string;
  meaning: string;
  emoji: string;
  category: "vowel" | "consonant" | "number";
};

const ALL_ITEMS: Item[] = [
  // Vowels
  { symbol: "অ", romanization: "o / a", meaning: "first vowel", emoji: "🔤", category: "vowel" },
  { symbol: "আ", romanization: "aa", meaning: "long A sound", emoji: "🥭", category: "vowel" },
  { symbol: "ই", romanization: "i", meaning: "EE sound", emoji: "🐟", category: "vowel" },
  { symbol: "উ", romanization: "u", meaning: "OO sound", emoji: "🐪", category: "vowel" },
  { symbol: "এ", romanization: "e", meaning: "E sound", emoji: "1️⃣", category: "vowel" },
  { symbol: "ও", romanization: "o", meaning: "long O sound", emoji: "💊", category: "vowel" },
  // Consonants
  { symbol: "ক", romanization: "k", meaning: "banana কলা", emoji: "🍌", category: "consonant" },
  { symbol: "গ", romanization: "g", meaning: "cow গরু", emoji: "🐄", category: "consonant" },
  { symbol: "ম", romanization: "m", meaning: "mother মা", emoji: "👩", category: "consonant" },
  { symbol: "ন", romanization: "n", meaning: "name নাম", emoji: "🏷️", category: "consonant" },
  { symbol: "ব", romanization: "b", meaning: "father বাবা", emoji: "👨", category: "consonant" },
  { symbol: "স", romanization: "sh / s", meaning: "everything সব", emoji: "🌍", category: "consonant" },
  { symbol: "হ", romanization: "h", meaning: "hand হাত", emoji: "✋", category: "consonant" },
  { symbol: "ভ", romanization: "bh", meaning: "good ভালো", emoji: "👍", category: "consonant" },
  { symbol: "র", romanization: "r", meaning: "rickshaw রিকশা", emoji: "🛺", category: "consonant" },
  { symbol: "ল", romanization: "l", meaning: "red লাল", emoji: "🔴", category: "consonant" },
  // Numbers
  { symbol: "০", romanization: "Shunno", meaning: "Zero", emoji: "⭕", category: "number" },
  { symbol: "১", romanization: "Ek", meaning: "One", emoji: "☝️", category: "number" },
  { symbol: "২", romanization: "Dui", meaning: "Two", emoji: "✌️", category: "number" },
  { symbol: "৩", romanization: "Tin", meaning: "Three", emoji: "🤟", category: "number" },
  { symbol: "৪", romanization: "Char", meaning: "Four", emoji: "🖐️", category: "number" },
  { symbol: "৫", romanization: "Panch", meaning: "Five", emoji: "✋", category: "number" },
  { symbol: "৬", romanization: "Chhoy", meaning: "Six", emoji: "🎲", category: "number" },
  { symbol: "৭", romanization: "Shat", meaning: "Seven", emoji: "7️⃣", category: "number" },
  { symbol: "৮", romanization: "Aat", meaning: "Eight", emoji: "🎱", category: "number" },
  { symbol: "৯", romanization: "Noy", meaning: "Nine", emoji: "9️⃣", category: "number" },
];

type Mode = "characters" | "numbers" | "both";
type GameState = "menu" | "playing" | "finished";
type QuestionType = "symbol-to-romanization" | "romanization-to-symbol";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getWrongOptions(correct: Item, pool: Item[], count = 3): Item[] {
  const wrongs = pool.filter((i) => i.symbol !== correct.symbol);
  return shuffle(wrongs).slice(0, count);
}

export default function LetterBowl() {
  const [mode, setMode] = useState<Mode>("characters");
  const [gameState, setGameState] = useState<GameState>("menu");
  const [questionType, setQuestionType] = useState<QuestionType>("symbol-to-romanization");
  const [questions, setQuestions] = useState<Item[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [options, setOptions] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answerState, setAnswerState] = useState<"idle" | "correct" | "wrong">("idle");

  const buildOptions = useCallback((correct: Item, pool: Item[]) => {
    const wrongs = getWrongOptions(correct, pool);
    return shuffle([correct, ...wrongs]);
  }, []);

  function startGame() {
    const pool =
      mode === "characters"
        ? ALL_ITEMS.filter((i) => i.category !== "number")
        : mode === "numbers"
        ? ALL_ITEMS.filter((i) => i.category === "number")
        : ALL_ITEMS;
    const shuffled = shuffle(pool);
    const qs = shuffled.slice(0, Math.min(10, shuffled.length));
    setQuestions(qs);
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setAnswerState("idle");
    setOptions(buildOptions(qs[0], pool));
    setGameState("playing");
  }

  function handleAnswer(item: Item) {
    if (answerState !== "idle") return;
    const correct = questions[qIndex];
    const isCorrect = item.symbol === correct.symbol;
    setSelected(item.symbol);
    setAnswerState(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const newStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      const next = qIndex + 1;
      if (next >= questions.length) {
        setGameState("finished");
      } else {
        const pool =
          mode === "characters"
            ? ALL_ITEMS.filter((i) => i.category !== "number")
            : mode === "numbers"
            ? ALL_ITEMS.filter((i) => i.category === "number")
            : ALL_ITEMS;
        setQIndex(next);
        setOptions(buildOptions(questions[next], pool));
        setSelected(null);
        setAnswerState("idle");
      }
    }, 900);
  }

  if (gameState === "menu") {
    return (
      <div className="max-w-md mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="text-center">
          <div className="text-6xl mb-3">🎯</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Letter Bowl</h1>
          <p className="text-gray-500 text-sm">
            See a Bengali character — pick what it says. Quick-fire, 10 rounds, beat your streak!
          </p>
        </div>

        {/* Mode selector */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">What to practice</p>
          <div className="grid grid-cols-3 gap-2">
            {(["characters", "numbers", "both"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-3 px-2 rounded-2xl border-2 font-bold text-sm transition-all ${
                  mode === m
                    ? "bg-green-500 border-green-500 text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-600 hover:border-green-300"
                }`}
              >
                {m === "characters" ? "🔤 Letters" : m === "numbers" ? "🔢 Numbers" : "🌟 Both"}
              </button>
            ))}
          </div>
        </div>

        {/* Question direction */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Question style</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: "symbol-to-romanization", label: "অ → abc", desc: "See Bengali, pick sound" },
              { id: "romanization-to-symbol", label: "abc → অ", desc: "See sound, pick Bengali" },
            ] as { id: QuestionType; label: string; desc: string }[]).map((q) => (
              <button
                key={q.id}
                onClick={() => setQuestionType(q.id)}
                className={`py-3 px-3 rounded-2xl border-2 font-bold text-sm transition-all text-left ${
                  questionType === q.id
                    ? "bg-green-500 border-green-500 text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-600 hover:border-green-300"
                }`}
              >
                <div>{q.label}</div>
                <div className={`text-xs font-normal mt-0.5 ${questionType === q.id ? "text-green-100" : "text-gray-400"}`}>{q.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={startGame} className="btn-primary w-full text-lg text-center">
          Start Game →
        </button>

        <Link href="/intro" className="btn-secondary w-full text-center block text-sm">
          ← Back to intro
        </Link>
      </div>
    );
  }

  if (gameState === "finished") {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct === 100 ? "Perfect! 🏆" : pct >= 80 ? "Great job! 🌟" : pct >= 60 ? "Good effort! 👍" : "Keep practising! 💪";
    return (
      <div className="max-w-md mx-auto px-6 py-10 text-center flex flex-col gap-5">
        <div className="text-7xl">{pct === 100 ? "🏆" : pct >= 80 ? "🌟" : "💪"}</div>
        <h2 className="text-3xl font-extrabold text-gray-900">{grade}</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Score", value: `${score}/${questions.length}` },
            { label: "Accuracy", value: `${pct}%` },
            { label: "Best streak", value: `${bestStreak} 🔥` },
          ].map((s) => (
            <div key={s.label} className="bg-green-50 rounded-2xl p-3 border border-green-100">
              <div className="text-xl font-extrabold text-green-700">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={startGame} className="btn-primary w-full text-lg text-center">
          Play Again 🔄
        </button>
        <Link href="/login" className="btn-secondary w-full text-center block">
          Start Lessons →
        </Link>
      </div>
    );
  }

  // Playing
  const current = questions[qIndex];
  const isSymbolQuestion = questionType === "symbol-to-romanization";

  return (
    <div className="max-w-md mx-auto px-6 py-6 flex flex-col gap-5">
      {/* HUD */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm font-bold">
          <span className="text-green-600">✅ {score}</span>
          <span className="text-orange-500">🔥 {streak}</span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i < qIndex ? "bg-green-500 w-4" : i === qIndex ? "bg-green-300 w-6" : "bg-gray-200 w-4"
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-400">{qIndex + 1}/{questions.length}</div>
      </div>

      {/* Question */}
      <div
        className={`rounded-3xl p-6 text-center transition-all duration-300 ${
          answerState === "correct"
            ? "bg-green-50 border-4 border-green-400"
            : answerState === "wrong"
            ? "bg-red-50 border-4 border-red-300"
            : "bg-white border-4 border-gray-100 shadow-md"
        }`}
      >
        {answerState !== "idle" && (
          <div className={`text-sm font-bold mb-2 ${answerState === "correct" ? "text-green-600" : "text-red-500"}`}>
            {answerState === "correct" ? "✅ Correct!" : `❌ It was "${current.romanization}"`}
          </div>
        )}
        <div className="text-sm text-gray-400 mb-3 font-medium">
          {isSymbolQuestion ? "What sound does this make?" : "Which character says this?"}
        </div>
        {isSymbolQuestion ? (
          <div className="text-8xl font-bold bangla text-gray-900">{current.symbol}</div>
        ) : (
          <div>
            <div className="text-4xl font-extrabold text-gray-900">{current.romanization}</div>
            <div className="text-lg text-gray-400 mt-1">{current.meaning}</div>
          </div>
        )}
        <div className="text-3xl mt-3">{current.emoji}</div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isCorrectOpt = opt.symbol === current.symbol;
          const isSelectedOpt = opt.symbol === selected;
          let cls = "bg-white border-gray-200 text-gray-800 hover:border-green-400 hover:bg-green-50";
          if (answerState !== "idle") {
            if (isCorrectOpt) cls = "bg-green-100 border-green-500 text-green-900";
            else if (isSelectedOpt) cls = "bg-red-100 border-red-400 text-red-900";
            else cls = "bg-white border-gray-100 text-gray-400 opacity-60";
          }
          return (
            <button
              key={opt.symbol}
              onClick={() => handleAnswer(opt)}
              disabled={answerState !== "idle"}
              className={`p-4 rounded-2xl border-2 font-bold text-center transition-all duration-150 ${cls}`}
            >
              {isSymbolQuestion ? (
                <span className="text-lg">{opt.romanization}</span>
              ) : (
                <span className="text-4xl bangla">{opt.symbol}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
