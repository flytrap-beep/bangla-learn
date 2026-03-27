"use client";

import { useState } from "react";
import type { UnitPrep } from "@bangla-learn/types";
import FlashcardDeck from "@/components/FlashcardDeck";
import { AlphabetIcon, BookIcon, FlashcardIcon } from "@/components/icons";

const TABS = [
  { id: "characters", label: "Characters", Icon: AlphabetIcon },
  { id: "grammar", label: "Grammar", Icon: BookIcon },
  { id: "flashcards", label: "Flashcards", Icon: FlashcardIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function PrepTabs({
  prep,
  unitColor,
}: {
  prep: UnitPrep;
  unitColor: string;
}) {
  const [tab, setTab] = useState<TabId>("characters");

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Tab buttons */}
      <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-1 ${
              tab === t.id ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
            style={tab === t.id ? { backgroundColor: unitColor } : {}}
          >
            <t.Icon size={18} color={tab === t.id ? "white" : "#9ca3af"} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "characters" && (
        <CharacterWalkthrough characters={prep.characters} unitColor={unitColor} />
      )}

      {tab === "grammar" && (
        <div className="space-y-4">
          {prep.grammar.map((point, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 text-base">{point.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{point.explanation}</p>
              <div className="space-y-2">
                {point.examples.map((ex, j) => (
                  <div key={j} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-lg font-bold text-gray-900 bangla">{ex.bangla}</div>
                    <div className="text-sm text-gray-500 italic">{ex.romanization}</div>
                    <div className="text-sm font-medium mt-1" style={{ color: unitColor }}>{ex.english}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "flashcards" && (
        <FlashcardDeck flashcards={prep.flashcards} />
      )}
    </div>
  );
}

function CharacterWalkthrough({
  characters,
  unitColor,
}: {
  characters: UnitPrep["characters"];
  unitColor: string;
}) {
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const char = characters[index];
  const progress = seen.size;

  function go(i: number) {
    setIndex(i);
    setSeen((prev) => new Set(prev).add(i));
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{index + 1} of {characters.length} characters</span>
          <span>{progress} seen</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress / characters.length) * 100}%`, backgroundColor: unitColor }}
          />
        </div>
      </div>

      {/* Character card */}
      <div className="w-full bg-white rounded-3xl border-2 border-gray-100 shadow-md p-6 text-center">
        {/* Type badge */}
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4"
          style={{
            backgroundColor: unitColor + "20",
            color: unitColor,
          }}
        >
          {char.type}
        </span>

        {/* Big character */}
        <div
          className="w-36 h-36 mx-auto rounded-3xl flex items-center justify-center mb-4 shadow-inner"
          style={{ backgroundColor: unitColor + "15" }}
        >
          <span
            className="text-8xl font-bold bangla"
            style={{ color: unitColor }}
          >
            {char.symbol}
          </span>
        </div>

        {/* Romanization */}
        <div className="text-2xl font-extrabold text-gray-900 mb-1">
          Say: "{char.romanization}"
        </div>

        {/* Example word */}
        {char.exampleWord && (
          <div className="mt-4 bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-bold">Example word</p>
            <div className="text-2xl font-bold bangla text-gray-900">{char.exampleWord}</div>
            <div className="text-sm text-gray-400 italic">{char.exampleMeaning}</div>
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={() => go(Math.max(0, index - 1))}
          disabled={index === 0}
          className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 disabled:opacity-30 transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={() => go(Math.min(characters.length - 1, index + 1))}
          disabled={index === characters.length - 1}
          className="flex-1 py-3 rounded-2xl text-white font-bold transition-colors"
          style={{ backgroundColor: unitColor }}
        >
          Next →
        </button>
      </div>

      {/* Character dots */}
      <div className="flex gap-2 flex-wrap justify-center">
        {characters.map((c, i) => (
          <button
            key={c.symbol}
            onClick={() => go(i)}
            className={`w-9 h-9 rounded-xl text-sm font-bold bangla transition-all duration-150 border-2 ${
              i === index
                ? "text-white border-transparent scale-110 shadow-md"
                : seen.has(i)
                ? "border-transparent text-white opacity-60"
                : "bg-gray-100 border-gray-200 text-gray-500"
            }`}
            style={
              i === index
                ? { backgroundColor: unitColor }
                : seen.has(i)
                ? { backgroundColor: unitColor }
                : {}
            }
          >
            {c.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
