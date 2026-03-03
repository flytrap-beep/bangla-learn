"use client";

import { useState } from "react";
import type { MatchPairsExercise as MPType } from "@bangla-learn/types";

type Props = {
  exercise: MPType;
  locked: boolean;
  onAnswer: (correct: boolean) => void;
};

export function MatchPairsExercise({ exercise, locked, onAnswer }: Props) {
  const [selectedBangla, setSelectedBangla] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({}); // bangla idx -> english idx
  const [errors, setErrors] = useState<number[]>([]);

  const shuffledEnglish = [...exercise.pairs.map((_, i) => i)].sort(
    () => Math.random() - 0.5
  );
  const [englishOrder] = useState(shuffledEnglish);

  function handleBanglaClick(idx: number) {
    if (locked || matched[idx] !== undefined) return;
    setSelectedBangla(idx === selectedBangla ? null : idx);
  }

  function handleEnglishClick(englishIdx: number) {
    if (locked || selectedBangla === null) return;
    // Check if this english is already matched
    const alreadyMatched = Object.values(matched).includes(englishIdx);
    if (alreadyMatched) return;

    const isCorrect = englishIdx === selectedBangla;
    if (isCorrect) {
      const newMatched = { ...matched, [selectedBangla]: englishIdx };
      setMatched(newMatched);
      setSelectedBangla(null);

      if (Object.keys(newMatched).length === exercise.pairs.length) {
        onAnswer(true);
      }
    } else {
      setErrors((prev) => [...prev, selectedBangla]);
      onAnswer(false);
      setSelectedBangla(null);
      setTimeout(() => setErrors((prev) => prev.filter((e) => e !== selectedBangla)), 800);
    }
  }

  return (
    <div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
        Match the pairs
      </p>
      <h2 className="text-xl font-bold text-gray-700 mb-8">
        Tap a Bengali word, then its English meaning
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Bengali column */}
        <div className="space-y-3">
          {exercise.pairs.map((pair, idx) => {
            const isMatched = matched[idx] !== undefined;
            const isSelected = selectedBangla === idx;
            const isError = errors.includes(idx);

            return (
              <button
                key={idx}
                onClick={() => handleBanglaClick(idx)}
                disabled={isMatched || locked}
                className={`w-full py-3 px-4 rounded-2xl border-2 border-b-4 font-semibold text-sm transition-all bangla ${
                  isMatched
                    ? "bg-green-100 border-green-300 text-green-700 cursor-default"
                    : isError
                    ? "bg-red-100 border-red-300 text-red-700"
                    : isSelected
                    ? "bg-blue-100 border-blue-400 text-blue-800"
                    : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
                }`}
              >
                {pair.bangla}
              </button>
            );
          })}
        </div>

        {/* English column (shuffled) */}
        <div className="space-y-3">
          {englishOrder.map((pairIdx) => {
            const pair = exercise.pairs[pairIdx];
            const isMatched = Object.values(matched).includes(pairIdx);

            return (
              <button
                key={pairIdx}
                onClick={() => handleEnglishClick(pairIdx)}
                disabled={isMatched || locked || selectedBangla === null}
                className={`w-full py-3 px-4 rounded-2xl border-2 border-b-4 font-semibold text-sm transition-all ${
                  isMatched
                    ? "bg-green-100 border-green-300 text-green-700 cursor-default"
                    : selectedBangla !== null && !isMatched
                    ? "bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                    : "bg-white border-gray-200 text-gray-500"
                }`}
              >
                {pair.english}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
