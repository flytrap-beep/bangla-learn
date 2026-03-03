import Link from "next/link";
import type { DialectCurriculum, Dialect } from "@bangla-learn/types";

type Props = {
  curriculum: DialectCurriculum;
  completedLessonIds: Set<string>;
  dialect: Dialect;
};

export function LessonMap({ curriculum, completedLessonIds, dialect }: Props) {
  return (
    <div className="space-y-10">
      {curriculum.units.map((unit) => {
        const completedInUnit = unit.lessons.filter((l) =>
          completedLessonIds.has(l.id)
        ).length;

        return (
          <div key={unit.id}>
            {/* Unit header */}
            <div
              className="rounded-2xl p-5 mb-6 text-white"
              style={{ backgroundColor: unit.color }}
            >
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                Unit {unit.order}
              </p>
              <h2 className="text-xl font-extrabold">{unit.title}</h2>
              <p className="text-sm opacity-80 mt-1">{unit.description}</p>
              <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{
                    width: `${(completedInUnit / unit.lessons.length) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs mt-1 opacity-70">
                {completedInUnit}/{unit.lessons.length} lessons
              </p>
            </div>

            {/* Lesson nodes — Duolingo-style path */}
            <div className="flex flex-col items-center gap-4">
              {unit.lessons.map((lesson, idx) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                // First lesson of unit always unlocked; others unlock after previous
                const prevCompleted =
                  idx === 0 ||
                  completedLessonIds.has(unit.lessons[idx - 1].id);
                const isLocked = !isCompleted && !prevCompleted;

                // Alternate left/right for zigzag layout
                const offset = idx % 4 === 0
                  ? "self-center"
                  : idx % 4 === 1
                  ? "self-end mr-8"
                  : idx % 4 === 2
                  ? "self-center"
                  : "self-start ml-8";

                return (
                  <div key={lesson.id} className={offset}>
                    {isLocked ? (
                      <button
                        disabled
                        className="w-20 h-20 rounded-full border-4 border-gray-200 bg-gray-100 flex flex-col items-center justify-center text-gray-400 cursor-not-allowed shadow-[0_4px_0_#d1d5db]"
                        title="Complete previous lesson to unlock"
                      >
                        <span className="text-2xl">🔒</span>
                        <span className="text-xs font-bold mt-1">
                          L{lesson.order}
                        </span>
                      </button>
                    ) : (
                      <Link
                        href={`/lesson/${lesson.id}?dialect=${dialect}`}
                        className="group relative block"
                      >
                        <button
                          className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-bold shadow-[0_4px_0] transition-all duration-150 group-hover:-translate-y-1 ${
                            isCompleted
                              ? "bg-green-500 border-green-600 text-white shadow-[0_4px_0_#3d9900]"
                              : "bg-white border-gray-300 text-gray-700 shadow-[0_4px_0_#d1d5db] group-hover:border-green-400"
                          }`}
                        >
                          <span className="text-2xl">
                            {isCompleted ? "⭐" : "📖"}
                          </span>
                          <span className="text-xs mt-1">
                            L{lesson.order}
                          </span>
                        </button>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {lesson.title}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
