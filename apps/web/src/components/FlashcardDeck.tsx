"use client";

import { useState } from "react";
import type { Flashcard } from "@bangla-learn/types";

export default function FlashcardDeck({ flashcards }: { flashcards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());

  const card = flashcards[index];
  const progress = known.size;

  function next() {
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i + 1) % flashcards.length), 150);
  }

  function prev() {
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i - 1 + flashcards.length) % flashcards.length), 150);
  }

  function markKnown() {
    setKnown((prev) => new Set(prev).add(card.id));
    next();
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{index + 1} / {flashcards.length}</span>
          <span className="text-green-600 font-medium">{progress} known ✓</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="cursor-pointer w-full max-w-sm"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: "220px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-3xl shadow-lg border-2 border-gray-100 flex flex-col items-center justify-center gap-3"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-6xl">{card.emoji}</div>
            <div className="text-4xl font-bold text-gray-900 bangla">{card.bangla}</div>
            <div className="text-sm text-gray-400">tap to reveal</div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-green-50 rounded-3xl shadow-lg border-2 border-green-200 flex flex-col items-center justify-center gap-2"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-5xl">{card.emoji}</div>
            <div className="text-3xl font-extrabold text-green-700">{card.english}</div>
            <div className="text-lg text-gray-500 italic">{card.romanization}</div>
            <div className="text-2xl text-gray-700 bangla mt-1">{card.bangla}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={prev}
          className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Prev
        </button>
        {flipped && (
          <button
            onClick={markKnown}
            className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
          >
            Got it ✓
          </button>
        )}
        <button
          onClick={next}
          className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Category pills */}
      {card.category && (
        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full capitalize">
          {card.category}
        </span>
      )}
    </div>
  );
}
