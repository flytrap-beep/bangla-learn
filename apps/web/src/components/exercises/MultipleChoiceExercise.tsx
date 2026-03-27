"use client";

import { useState } from "react";
import type { MultipleChoiceExercise as MCType } from "@bangla-learn/types";
import { WordPicture } from "@/components/WordPicture";

type Props = {
  exercise: MCType;
  locked: boolean;
  onAnswer: (correct: boolean) => void;
};

export function MultipleChoiceExercise({ exercise, locked, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(idx: number) {
    if (locked || selected !== null) return;
    setSelected(idx);
    onAnswer(idx === exercise.correct);
  }

  const hasPicture = !!exercise.imageKey;

  return (
    <div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
        Choose the correct answer
      </p>

      {hasPicture ? (
        /* ── Picture layout ────────────────────────────────────── */
        <div className="text-center mb-6">
          <WordPicture imageKey={exercise.imageKey!} />
          {exercise.promptBangla && (
            <div className="text-4xl font-extrabold text-gray-900 bangla leading-tight">
              {exercise.promptBangla}
            </div>
          )}
          {exercise.romanization && (
            <div className="text-base text-gray-400 italic mt-1">
              ({exercise.romanization})
            </div>
          )}
          <p className="text-lg font-semibold text-gray-600 mt-3">{exercise.prompt}</p>
        </div>
      ) : (
        /* ── Text-only layout (backwards compatible) ───────────── */
        <h2 className="text-2xl font-bold text-gray-900 mb-8 bangla">
          {exercise.prompt}
          {exercise.promptBangla && (
            <span className="block text-green-600 mt-1 text-3xl">{exercise.promptBangla}</span>
          )}
        </h2>
      )}

      <div className="space-y-3">
        {exercise.options.map((option, idx) => {
          let btnClass = "choice-btn";
          if (selected !== null) {
            if (idx === exercise.correct) btnClass += " correct";
            else if (idx === selected && selected !== exercise.correct)
              btnClass += " incorrect";
          }

          return (
            <button
              key={idx}
              className={btnClass}
              onClick={() => handleSelect(idx)}
              disabled={locked}
            >
              <span className="bangla">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
