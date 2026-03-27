"use client";

import { useState } from "react";
import Link from "next/link";

type Slide =
  | { kind: "welcome" }
  | { kind: "script" }
  | { kind: "character"; symbol: string; romanization: string; type: "vowel" | "consonant"; tip: string; exampleWord: string; exampleRomanization: string; exampleMeaning: string; emoji: string }
  | { kind: "number"; bengaliNumeral: string; digit: number; banglaWord: string; romanization: string; emoji: string }
  | { kind: "word"; bangla: string; romanization: string; meaning: string; emoji: string; breakdown: { symbol: string; romanization: string }[] }
  | { kind: "numbers_intro" }
  | { kind: "done" };

const SLIDES: Slide[] = [
  { kind: "welcome" },
  { kind: "script" },

  // Vowels
  { kind: "character", symbol: "অ", romanization: "o / a", type: "vowel", tip: "Like the 'o' in 'open'. The most common vowel sound.", exampleWord: "অনেক", exampleRomanization: "onek", exampleMeaning: "many", emoji: "🔢" },
  { kind: "character", symbol: "আ", romanization: "aa", type: "vowel", tip: "Like 'a' in 'father' — open your mouth wide!", exampleWord: "আম", exampleRomanization: "aam", exampleMeaning: "mango", emoji: "🥭" },
  { kind: "character", symbol: "ই", romanization: "i", type: "vowel", tip: "Like 'ee' in 'feet' — short and high", exampleWord: "ইলিশ", exampleRomanization: "ilish", exampleMeaning: "hilsa fish", emoji: "🐟" },
  { kind: "character", symbol: "উ", romanization: "u", type: "vowel", tip: "Like 'oo' in 'food' — round your lips", exampleWord: "উট", exampleRomanization: "ut", exampleMeaning: "camel", emoji: "🐪" },
  { kind: "character", symbol: "এ", romanization: "e", type: "vowel", tip: "Like 'e' in 'bed' — mouth half open", exampleWord: "এক", exampleRomanization: "ek", exampleMeaning: "one", emoji: "1️⃣" },
  { kind: "character", symbol: "ও", romanization: "o", type: "vowel", tip: "Like 'o' in 'go' — round and clear", exampleWord: "ওষুধ", exampleRomanization: "oshudh", exampleMeaning: "medicine", emoji: "💊" },

  // Consonants
  { kind: "character", symbol: "ক", romanization: "k", type: "consonant", tip: "Like 'k' in 'kite'. Notice the curved shape with a top line.", exampleWord: "কলা", exampleRomanization: "kola", exampleMeaning: "banana", emoji: "🍌" },
  { kind: "character", symbol: "গ", romanization: "g", type: "consonant", tip: "Like 'g' in 'go'. A voiced version of ক.", exampleWord: "গরু", exampleRomanization: "goru", exampleMeaning: "cow", emoji: "🐄" },
  { kind: "character", symbol: "ম", romanization: "m", type: "consonant", tip: "Like 'm' in 'mother'. Used in আমি (I) and মা (mother).", exampleWord: "মা", exampleRomanization: "ma", exampleMeaning: "mother", emoji: "👩" },
  { kind: "character", symbol: "ন", romanization: "n", type: "consonant", tip: "Like 'n' in 'name'. Very common in Bengali.", exampleWord: "নাম", exampleRomanization: "naam", exampleMeaning: "name", emoji: "🏷️" },
  { kind: "character", symbol: "ব", romanization: "b", type: "consonant", tip: "Like 'b' in 'book'. Used in বাবা (father).", exampleWord: "বাবা", exampleRomanization: "baba", exampleMeaning: "father", emoji: "👨" },
  { kind: "character", symbol: "স", romanization: "sh / s", type: "consonant", tip: "Sounds like 'sh' at start of a word, 's' in the middle.", exampleWord: "সব", exampleRomanization: "shob", exampleMeaning: "everything", emoji: "🌍" },
  { kind: "character", symbol: "হ", romanization: "h", type: "consonant", tip: "Like 'h' in 'hello'. A gentle breath sound.", exampleWord: "হাত", exampleRomanization: "haat", exampleMeaning: "hand", emoji: "✋" },
  { kind: "character", symbol: "ভ", romanization: "bh", type: "consonant", tip: "A soft 'bh' sound — breathe gently while saying 'b'.", exampleWord: "ভালো", exampleRomanization: "bhalo", exampleMeaning: "good", emoji: "👍" },
  { kind: "character", symbol: "র", romanization: "r", type: "consonant", tip: "A soft rolled 'r' — lighter than English 'r'.", exampleWord: "রিকশা", exampleRomanization: "riksha", exampleMeaning: "rickshaw", emoji: "🛺" },
  { kind: "character", symbol: "ল", romanization: "l", type: "consonant", tip: "Like 'l' in 'love'. Used in লাল (red).", exampleWord: "লাল", exampleRomanization: "lal", exampleMeaning: "red", emoji: "🔴" },

  // First words
  {
    kind: "word",
    bangla: "আমি",
    romanization: "Ami",
    meaning: "I / Me",
    emoji: "🙋",
    breakdown: [
      { symbol: "আ", romanization: "aa" },
      { symbol: "ম", romanization: "m" },
      { symbol: "ি", romanization: "i" },
    ],
  },
  {
    kind: "word",
    bangla: "নমস্কার",
    romanization: "Nomoshkar",
    meaning: "Hello",
    emoji: "👋",
    breakdown: [
      { symbol: "ন", romanization: "n" },
      { symbol: "ম", romanization: "m" },
      { symbol: "স্ক", romanization: "shk" },
      { symbol: "ার", romanization: "ar" },
    ],
  },
  {
    kind: "word",
    bangla: "ধন্যবাদ",
    romanization: "Dhonnobad",
    meaning: "Thank you",
    emoji: "🙏",
    breakdown: [
      { symbol: "ধ", romanization: "dh" },
      { symbol: "ন্য", romanization: "nno" },
      { symbol: "বাদ", romanization: "bad" },
    ],
  },

  // Numbers intro
  { kind: "numbers_intro" },

  // Bengali numerals 0-9
  { kind: "number", bengaliNumeral: "০", digit: 0, banglaWord: "শূন্য", romanization: "Shunno", emoji: "⭕" },
  { kind: "number", bengaliNumeral: "১", digit: 1, banglaWord: "এক", romanization: "Ek", emoji: "☝️" },
  { kind: "number", bengaliNumeral: "২", digit: 2, banglaWord: "দুই", romanization: "Dui", emoji: "✌️" },
  { kind: "number", bengaliNumeral: "৩", digit: 3, banglaWord: "তিন", romanization: "Tin", emoji: "🤟" },
  { kind: "number", bengaliNumeral: "৪", digit: 4, banglaWord: "চার", romanization: "Char", emoji: "🖐️" },
  { kind: "number", bengaliNumeral: "৫", digit: 5, banglaWord: "পাঁচ", romanization: "Panch", emoji: "✋" },
  { kind: "number", bengaliNumeral: "৬", digit: 6, banglaWord: "ছয়", romanization: "Chhoy", emoji: "🎲" },
  { kind: "number", bengaliNumeral: "৭", digit: 7, banglaWord: "সাত", romanization: "Shat", emoji: "7️⃣" },
  { kind: "number", bengaliNumeral: "৮", digit: 8, banglaWord: "আট", romanization: "Aat", emoji: "🎱" },
  { kind: "number", bengaliNumeral: "৯", digit: 9, banglaWord: "নয়", romanization: "Noy", emoji: "9️⃣" },
  { kind: "number", bengaliNumeral: "১০", digit: 10, banglaWord: "দশ", romanization: "Dosh", emoji: "🔟" },

  { kind: "done" },
];

export default function IntroSlides() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const progress = ((index + 1) / SLIDES.length) * 100;

  function next() {
    if (index < SLIDES.length - 1) setIndex((i) => i + 1);
  }
  function prev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="h-2 bg-gray-100">
        <div
          className="h-2 bg-green-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3">
        <button
          onClick={prev}
          disabled={index === 0}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-2xl"
        >
          ←
        </button>
        <span className="text-sm text-gray-400 font-medium">
          {index + 1} / {SLIDES.length}
        </span>
        <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
          Skip
        </Link>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-lg mx-auto w-full">
        {slide.kind === "welcome" && <WelcomeSlide />}
        {slide.kind === "script" && <ScriptSlide />}
        {slide.kind === "character" && <CharacterSlide slide={slide} key={slide.symbol} />}
        {slide.kind === "numbers_intro" && <NumbersIntroSlide />}
        {slide.kind === "number" && <NumberSlide slide={slide} key={slide.digit} />}
        {slide.kind === "word" && <WordSlide slide={slide} key={slide.bangla} />}
        {slide.kind === "done" && <DoneSlide />}
      </div>

      {/* Next button */}
      {slide.kind !== "done" && (
        <div className="px-6 pb-10 max-w-lg mx-auto w-full">
          <button onClick={next} className="btn-primary w-full text-center text-lg">
            {index === 0 ? "Let's go! 🛺" : "Got it →"}
          </button>
        </div>
      )}
    </div>
  );
}

function WelcomeSlide() {
  return (
    <div className="text-center">
      <div className="text-8xl mb-4">🇧🇩</div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        Welcome to <span className="text-green-500">Bengali</span>
      </h1>
      <p className="text-gray-500 text-lg mb-6">
        Bengali (বাংলা) is spoken by over{" "}
        <strong className="text-green-500">230 million people</strong> — one of the most spoken languages on Earth.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { emoji: "🇧🇩", label: "Bangladesh" },
          { emoji: "🇮🇳", label: "West Bengal" },
          { emoji: "🌍", label: "Worldwide" },
        ].map((item) => (
          <div key={item.label} className="bg-green-50 rounded-2xl p-3 text-center">
            <div className="text-3xl mb-1">{item.emoji}</div>
            <div className="text-xs text-gray-600 font-medium">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-500 text-left space-y-2">
        <div className="flex items-center gap-2">🔤 <span>Learn the <strong>Bengali alphabet</strong> step by step</span></div>
        <div className="flex items-center gap-2">🔢 <span>Learn <strong>Bengali numbers</strong> (their own numerals!)</span></div>
        <div className="flex items-center gap-2">💬 <span>Say your <strong>first words</strong> before lesson 1</span></div>
      </div>
    </div>
  );
}

function ScriptSlide() {
  return (
    <div className="text-center w-full">
      <div className="text-5xl mb-4">✍️</div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-3">The Bengali Script</h2>
      <p className="text-gray-500 mb-5 text-sm leading-relaxed">
        Bengali has its own unique alphabet — totally different from English, but very consistent. Once you learn the rules, everything makes sense.
      </p>

      <div className="space-y-3 mb-5 text-left">
        {[
          { icon: "➡️", title: "Left to right", desc: "Same direction as English — easy!" },
          { icon: "〰️", title: "The headline (মাত্রা)", desc: "Most letters hang from a top horizontal line" },
          { icon: "🔡", title: "50 characters", desc: "11 vowels + 39 consonants — you'll learn the most important ones" },
          { icon: "🔢", title: "Own number system", desc: "Bengali has its own digits: ০ ১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯" },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <div>
              <div className="font-bold text-gray-900 text-sm">{item.title}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        {["অ", "আ", "ক", "ম", "১", "২"].map((ch) => (
          <div key={ch} className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <span className="text-xl font-bold bangla text-green-700">{ch}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CharacterSlide({ slide }: { slide: Extract<Slide, { kind: "character" }> }) {
  const [revealed, setRevealed] = useState(false);
  const isVowel = slide.type === "vowel";

  return (
    <div className="text-center w-full">
      <span
        className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4"
        style={{
          backgroundColor: isVowel ? "#f0fdf4" : "#eff6ff",
          color: isVowel ? "#006A4E" : "#1d4ed8",
        }}
      >
        {isVowel ? "🔵 Vowel" : "🟠 Consonant"}
      </span>

      <div className="w-44 h-44 mx-auto bg-green-50 rounded-3xl flex items-center justify-center mb-5 border-4 border-green-200 shadow-lg">
        <span className="text-9xl font-bold bangla text-green-700">{slide.symbol}</span>
      </div>

      <div className="text-3xl font-extrabold text-gray-900 mb-1">"{slide.romanization}"</div>
      <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">{slide.tip}</p>

      <button
        onClick={() => setRevealed(true)}
        className={`w-full rounded-2xl p-4 border-2 transition-all duration-300 ${
          revealed ? "bg-green-50 border-green-300" : "bg-gray-50 border-dashed border-gray-300 hover:border-green-300"
        }`}
      >
        {revealed ? (
          <div className="flex items-center justify-center gap-4">
            <span className="text-5xl">{slide.emoji}</span>
            <div className="text-left">
              <div className="text-2xl font-bold bangla text-gray-900">{slide.exampleWord}</div>
              <div className="text-sm text-gray-400 italic">{slide.exampleRomanization}</div>
              <div className="text-sm font-bold text-green-600 mt-1">= {slide.exampleMeaning}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm font-medium py-1">
            👆 Tap to see a word that uses{" "}
            <span className="bangla text-green-600 font-bold text-lg">{slide.symbol}</span>
          </div>
        )}
      </button>
    </div>
  );
}

function NumbersIntroSlide() {
  return (
    <div className="text-center w-full">
      <div className="text-6xl mb-4">🔢</div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Bengali Numbers</h2>
      <p className="text-gray-500 mb-5 text-sm leading-relaxed">
        Bengali has its own set of numerals — completely different from 1 2 3! You&apos;ll see them on signs, money, and books in Bangladesh.
      </p>

      {/* Side-by-side comparison */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-5">
        <div className="grid grid-cols-6 gap-2">
          {[
            { en: "0", bn: "০" }, { en: "1", bn: "১" }, { en: "2", bn: "২" },
            { en: "3", bn: "৩" }, { en: "4", bn: "৪" }, { en: "5", bn: "৫" },
          ].map((n) => (
            <div key={n.en} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{n.en}</span>
              <div className="w-10 h-10 bg-white rounded-xl border-2 border-green-200 flex items-center justify-center shadow-sm">
                <span className="text-xl font-bold bangla text-green-700">{n.bn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-gray-400 text-sm">
        Each number also has a <strong className="text-gray-600">word form</strong> — just like how we say &quot;five&quot; instead of &quot;5&quot;. We&apos;ll learn both! 📖
      </p>
    </div>
  );
}

function NumberSlide({ slide }: { slide: Extract<Slide, { kind: "number" }> }) {
  const [showWord, setShowWord] = useState(false);

  return (
    <div className="text-center w-full">
      <div className="text-sm text-gray-400 font-medium mb-3 uppercase tracking-wide">Bengali Number</div>

      {/* Big numeral */}
      <div className="w-44 h-44 mx-auto rounded-3xl flex flex-col items-center justify-center mb-5 border-4 shadow-lg"
        style={{ backgroundColor: "#006A4E15", borderColor: "#006A4E40" }}>
        <span className="text-8xl font-bold bangla text-green-700">{slide.bengaliNumeral}</span>
        <span className="text-2xl text-gray-400 mt-1">= {slide.digit}</span>
      </div>

      {/* Word form */}
      <button
        onClick={() => setShowWord(true)}
        className={`w-full rounded-2xl p-4 border-2 transition-all duration-300 mb-4 ${
          showWord ? "bg-green-50 border-green-300" : "bg-gray-50 border-dashed border-gray-300 hover:border-green-300"
        }`}
      >
        {showWord ? (
          <div className="flex items-center justify-center gap-4">
            <span className="text-4xl">{slide.emoji}</span>
            <div className="text-left">
              <div className="text-3xl font-bold bangla text-gray-900">{slide.banglaWord}</div>
              <div className="text-lg text-gray-500 italic">{slide.romanization}</div>
              <div className="text-sm font-bold text-green-600 mt-1">= {slide.digit} in Bengali</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm py-1">
            👆 Tap to see how to <strong>say</strong> {slide.digit} in Bengali
          </div>
        )}
      </button>
    </div>
  );
}

function WordSlide({ slide }: { slide: Extract<Slide, { kind: "word" }> }) {
  return (
    <div className="text-center w-full">
      <div className="text-7xl mb-3">{slide.emoji}</div>
      <div className="text-sm text-gray-400 font-bold uppercase tracking-wide mb-2">Your first word!</div>
      <div className="text-6xl font-extrabold bangla text-gray-900 mb-2">{slide.bangla}</div>
      <div className="text-lg text-gray-500 italic mb-1">{slide.romanization}</div>
      <div className="text-2xl font-bold text-green-600 mb-6">{slide.meaning}</div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-3">Built from these characters:</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {slide.breakdown.map((part, i) => (
            <div key={i} className="flex flex-col items-center gap-1 bg-white rounded-xl p-3 border-2 border-gray-100 shadow-sm min-w-[56px]">
              <span className="text-2xl font-bold bangla text-green-700">{part.symbol}</span>
              <span className="text-xs text-gray-400">{part.romanization}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DoneSlide() {
  return (
    <div className="text-center">
      <div className="text-8xl mb-4">🎉</div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3">You&apos;re ready!</h2>
      <p className="text-gray-500 text-lg mb-6">
        You&apos;ve learned Bengali characters, numbers, and your first words. Time to put them to use!
      </p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { emoji: "🔤", label: `${16} characters` },
          { emoji: "🔢", label: "Numbers 0–10" },
          { emoji: "💬", label: "3 first words" },
        ].map((s) => (
          <div key={s.label} className="bg-green-50 rounded-2xl p-3 text-center border border-green-100">
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="text-xs font-bold text-green-700">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Link href="/login" className="btn-primary w-full text-center block text-lg">
          🛺 Start Unit 1 →
        </Link>
        <Link href="/practice" className="btn-secondary w-full text-center block">
          🎯 Practice letters first
        </Link>
      </div>
    </div>
  );
}
