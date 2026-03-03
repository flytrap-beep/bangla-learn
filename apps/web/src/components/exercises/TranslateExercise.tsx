"use client";

import { useState } from "react";
import type { TranslateToEnglishExercise, TranslateToBanglaExercise } from "@bangla-learn/types";

type Props = {
  exercise: TranslateToEnglishExercise | TranslateToBanglaExercise;
  locked: boolean;
  onAnswer: (correct: boolean) => void;
};

export function TranslateExercise({ exercise, locked, onAnswer }: Props) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isToEnglish = exercise.type === "translate_to_english";

  function normalize(str: string) {
    return str.trim().toLowerCase().replace(/[.,!?]/g, "");
  }

  function handleSubmit() {
    if (!input.trim() || submitted) return;
    setSubmitted(true);
    const correct = normalize(input) === normalize(exercise.answer);
    onAnswer(correct);
  }

  return (
    <div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
        {isToEnglish ? "Translate to English" : "Translate to Bengali"}
      </p>

      {isToEnglish ? (
        <div className="mb-8">
          <p className="text-4xl font-bold text-gray-900 bangla mb-2">
            {(exercise as TranslateToEnglishExercise).bangla}
          </p>
          <p className="text-gray-400 text-sm italic">
            {(exercise as TranslateToEnglishExercise).romanization}
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {(exercise as TranslateToBanglaExercise).english}
          </p>
          <p className="text-gray-400 text-sm">
            Romanization: {(exercise as TranslateToBanglaExercise).romanization}
          </p>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={locked}
          placeholder={isToEnglish ? "Type in English..." : "Type in Bengali script or romanization..."}
          className={`w-full border-2 rounded-2xl py-4 px-5 text-lg focus:outline-none transition-colors ${
            submitted
              ? normalize(input) === normalize(exercise.answer)
                ? "border-green-400 bg-green-50 text-green-800"
                : "border-red-400 bg-red-50 text-red-800"
              : "border-gray-200 focus:border-blue-400"
          } ${isToEnglish ? "" : "bangla"}`}
        />
        {submitted && normalize(input) !== normalize(exercise.answer) && (
          <p className="mt-2 text-sm text-red-600">
            Correct answer: <strong className="bangla">{exercise.answer}</strong>
          </p>
        )}
      </div>

      {!locked && (
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="btn-primary mt-6 w-full disabled:opacity-50"
        >
          Check
        </button>
      )}
    </div>
  );
}
