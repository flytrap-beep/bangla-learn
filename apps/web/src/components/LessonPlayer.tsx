"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lesson, Dialect, Exercise } from "@bangla-learn/types";
import { MultipleChoiceExercise } from "./exercises/MultipleChoiceExercise";
import { TranslateExercise } from "./exercises/TranslateExercise";
import { MatchPairsExercise } from "./exercises/MatchPairsExercise";
import { FillBlankExercise } from "./exercises/FillBlankExercise";

type Props = {
  lesson: Lesson;
  dialect: Dialect;
  userId: string;
};

type ExerciseState = "answering" | "correct" | "incorrect";

export function LessonPlayer({ lesson, dialect, userId }: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<ExerciseState>("answering");
  const [heartsLost, setHeartsLost] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercises = lesson.exercises;
  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex) / exercises.length) * 100;

  function handleAnswer(correct: boolean) {
    setState(correct ? "correct" : "incorrect");
    if (correct) {
      setXpEarned((prev) => prev + currentExercise.xp);
    } else {
      setHeartsLost((prev) => prev + 1);
    }
  }

  async function handleNext() {
    setState("answering");
    if (currentIndex + 1 >= exercises.length) {
      // Lesson complete — save progress
      await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          dialect,
          xpEarned,
          heartsLost,
        }),
      });
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Lesson Complete!
        </h2>
        <p className="text-gray-500 mb-8">
          You earned <strong className="text-yellow-500">+{xpEarned} XP</strong>
          {heartsLost > 0 && (
            <span className="text-red-400 ml-2">
              (lost {heartsLost} ❤️)
            </span>
          )}
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => router.push(`/learn?dialect=${dialect}`)}
            className="btn-primary w-full"
          >
            Continue
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setState("answering");
              setHeartsLost(0);
              setXpEarned(0);
              setFinished(false);
            }}
            className="btn-secondary w-full"
          >
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 min-h-[90vh] flex flex-col">
      {/* Progress bar */}
      <div className="h-3 bg-gray-100 rounded-full mb-10 overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Exercise */}
      <div className="flex-1">
        <ExerciseRenderer
          exercise={currentExercise}
          state={state}
          onAnswer={handleAnswer}
        />
      </div>

      {/* Footer feedback */}
      {state !== "answering" && (
        <div
          className={`fixed bottom-0 left-0 right-0 p-6 border-t-4 ${
            state === "correct"
              ? "bg-green-50 border-green-400"
              : "bg-red-50 border-red-400"
          }`}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              {state === "correct" ? (
                <p className="text-green-600 font-extrabold text-lg">
                  ✓ Correct! +{currentExercise.xp} XP
                </p>
              ) : (
                <div>
                  <p className="text-red-600 font-extrabold text-lg">✗ Incorrect</p>
                  <p className="text-red-500 text-sm mt-1">
                    Keep trying — you lost 1 ❤️
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleNext}
              className={state === "correct" ? "btn-primary" : "btn-danger"}
            >
              {currentIndex + 1 >= exercises.length ? "Finish" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseRenderer({
  exercise,
  state,
  onAnswer,
}: {
  exercise: Exercise;
  state: ExerciseState;
  onAnswer: (correct: boolean) => void;
}) {
  switch (exercise.type) {
    case "multiple_choice":
      return (
        <MultipleChoiceExercise
          exercise={exercise}
          locked={state !== "answering"}
          onAnswer={onAnswer}
        />
      );
    case "translate_to_english":
    case "translate_to_bangla":
      return (
        <TranslateExercise
          exercise={exercise}
          locked={state !== "answering"}
          onAnswer={onAnswer}
        />
      );
    case "match_pairs":
      return (
        <MatchPairsExercise
          exercise={exercise}
          locked={state !== "answering"}
          onAnswer={onAnswer}
        />
      );
    case "fill_blank":
      return (
        <FillBlankExercise
          exercise={exercise}
          locked={state !== "answering"}
          onAnswer={onAnswer}
        />
      );
    default:
      return null;
  }
}
