"use client";

import { useState } from "react";
import type { FillBlankExercise as FBType } from "@bangla-learn/types";

type Props = {
  exercise: FBType;
  locked: boolean;
  onAnswer: (correct: boolean) => void;
};

export function FillBlankExercise({ exercise, locked, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const parts = exercise.sentence.split("___");

  function handleSelect(option: string) {
    if (locked || selected !== null) return;
    setSelected(option);
    onAnswer(option === exercise.blank);
  }

  return (
    <div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
        Fill in the blank
      </p>

      {/* Sentence with blank */}
      <div className="text-2xl font-bold text-gray-900 mb-2 bangla flex flex-wrap items-center gap-2">
        <span>{parts[0]}</span>
        <span
          className={`inline-block min-w-[80px] px-3 py-1 border-b-4 text-center rounded-lg transition-colors ${
            selected
              ? selected === exercise.blank
                ? "border-green-400 bg-green-100 text-green-800"
                : "border-red-400 bg-red-100 text-red-800"
              : "border-gray-400 bg-gray-100 text-gray-500"
          }`}
        >
          {selected ?? "___"}
        </span>
        {parts[1] && <span>{parts[1]}</span>}
      </div>

      <p className="text-sm text-gray-400 italic mb-8">{exercise.romanization}</p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {exercise.options.map((option) => {
          let cls = "choice-btn";
          if (selected !== null) {
            if (option === exercise.blank) cls += " correct";
            else if (option === selected) cls += " incorrect";
          }
          return (
            <button
              key={option}
              className={cls}
              onClick={() => handleSelect(option)}
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
