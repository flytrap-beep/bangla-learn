"use client";

import { useState } from "react";
import type { MultipleChoiceExercise as MCType } from "@bangla-learn/types";

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

  return (
    <div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
        Choose the correct answer
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mb-8 bangla">
        {exercise.prompt}
        {exercise.promptBangla && (
          <span className="block text-green-600 mt-1 text-3xl">{exercise.promptBangla}</span>
        )}
      </h2>

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
