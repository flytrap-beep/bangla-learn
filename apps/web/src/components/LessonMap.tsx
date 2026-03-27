import Link from "next/link";
import type { DialectCurriculum, Dialect } from "@bangla-learn/types";
import {
  GreetingIcon, NumbersIcon, FamilyIcon, ColorsIcon, PhrasesIcon,
  PronounIcon, RickshawIcon, TigerIcon, RiceIcon, BookIcon,
  LockIcon, StarIcon, TrophyIcon,
} from "@/components/icons";

type Props = {
  curriculum: DialectCurriculum;
  completedLessonIds: Set<string>;
  dialect: Dialect;
};

function LessonIconComponent({ title, color }: { title: string; color: string }) {
  const t = title.toLowerCase();
  const props = { size: 26, color };
  if (t.includes("hello") || t.includes("greeting") || t.includes("phrase")) return <GreetingIcon {...props} />;
  if (t.includes("how are you") || t.includes("feelings") || t.includes("pronoun")) return <PronounIcon {...props} />;
  if (t.includes("number")) return <NumbersIcon {...props} />;
  if (t.includes("family")) return <FamilyIcon {...props} />;
  if (t.includes("color") || t.includes("colour")) return <ColorsIcon {...props} />;
  if (t.includes("food") || t.includes("eat") || t.includes("rice")) return <RiceIcon {...props} />;
  if (t.includes("animal") || t.includes("tiger")) return <TigerIcon {...props} />;
  if (t.includes("bangladesh")) return <RickshawIcon {...props} />;
  if (t.includes("travel") || t.includes("transport")) return <RickshawIcon {...props} />;
  return <BookIcon {...props} />;
}

export function LessonMap({ curriculum, completedLessonIds, dialect }: Props) {
  return (
    <div className="space-y-10">
      {curriculum.units.map((unit) => {
        const completedInUnit = unit.lessons.filter((l) =>
          completedLessonIds.has(l.id)
        ).length;
        const unitComplete = completedInUnit === unit.lessons.length;

        return (
          <div key={unit.id}>
            {/* Unit header */}
            <div
              className="rounded-3xl p-5 mb-4 text-white relative overflow-hidden"
              style={{ backgroundColor: unit.color }}
            >
              {/* Subtle pattern */}
              <div className="absolute right-4 top-4 text-white opacity-10 text-8xl font-bold bangla select-none">
                {unit.order}
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                    Level {unit.order}
                  </span>
                  {unitComplete && (
                    <span className="bg-white bg-opacity-20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      ✅ Complete
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold">{unit.title}</h2>
                <p className="text-sm opacity-75 mt-1">{unit.description}</p>

                {/* Progress bar */}
                <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2.5">
                  <div
                    className="bg-white rounded-full h-2.5 transition-all duration-700"
                    style={{ width: `${(completedInUnit / unit.lessons.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {completedInUnit}/{unit.lessons.length} lessons done
                  </p>
                  <p className="text-xs opacity-70">
                    {unit.lessons.reduce((sum, l) => sum + l.xpReward, 0)} XP total
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-lesson prep button */}
            {unit.prep && (
              <Link
                href={`/prep/${unit.id}?dialect=${dialect}`}
                className="flex items-center justify-between w-full bg-white border-2 rounded-2xl px-4 py-3 mb-6 shadow-sm hover:shadow-md transition-all duration-200 group"
                style={{ borderColor: unit.color + "60" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: unit.color + "20" }}
                  >
                    📚
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">Before You Start</div>
                    <div className="text-xs text-gray-400">Characters · Grammar · Flashcards</div>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all text-lg">→</span>
              </Link>
            )}

            {/* Lesson nodes — Duolingo-style path */}
            <div className="flex flex-col items-center gap-5">
              {unit.lessons.map((lesson, idx) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                const prevCompleted =
                  idx === 0 || completedLessonIds.has(unit.lessons[idx - 1].id);
                const isLocked = !isCompleted && !prevCompleted;

                const offset =
                  idx % 4 === 0 ? "self-center"
                  : idx % 4 === 1 ? "self-end mr-10"
                  : idx % 4 === 2 ? "self-center"
                  : "self-start ml-10";

                return (
                  <div key={lesson.id} className={`flex flex-col items-center gap-1 ${offset}`}>
                    {isLocked ? (
                      <div className="flex flex-col items-center gap-1">
                        <button
                          disabled
                          className="w-20 h-20 rounded-full border-4 border-gray-200 bg-gray-100 flex flex-col items-center justify-center text-gray-300 cursor-not-allowed shadow-[0_4px_0_#d1d5db]"
                          title="Complete previous lesson to unlock"
                        >
                          <LockIcon size={24} color="#d1d5db" />
                          <span className="text-xs font-bold mt-0.5 opacity-50">L{lesson.order}</span>
                        </button>
                        <span className="text-xs text-gray-300 font-medium">{lesson.title}</span>
                      </div>
                    ) : (
                      <Link href={`/lesson/${lesson.id}?dialect=${dialect}`} className="group flex flex-col items-center gap-1">
                        <div className="relative">
                          <button
                            className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-bold transition-all duration-150 group-hover:-translate-y-1 ${
                              isCompleted
                                ? "text-white shadow-[0_5px_0]"
                                : "bg-white border-gray-300 shadow-[0_5px_0_#d1d5db]"
                            }`}
                            style={
                              isCompleted
                                ? { backgroundColor: unit.color, borderColor: unit.color + "cc", boxShadow: `0 5px 0 ${unit.color}88` }
                                : {}
                            }
                          >
                            {isCompleted
                              ? <StarIcon size={26} color="white" />
                              : <LessonIconComponent title={lesson.title} color={unit.color} />
                            }
                            <span className="text-xs mt-0.5 font-bold" style={{ color: isCompleted ? "white" : unit.color }}>
                              {isCompleted ? `+${lesson.xpReward}` : `L${lesson.order}`}
                            </span>
                          </button>

                          {!isCompleted && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              +{lesson.xpReward} XP
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                            </div>
                          )}
                        </div>
                        <span className={`text-xs font-semibold text-center max-w-[90px] leading-tight ${isCompleted ? "text-green-600" : "text-gray-500"}`}>
                          {lesson.title}
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* Unit complete celebration */}
              {unitComplete && (
                <div
                  className="mt-2 flex items-center gap-3 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-md"
                  style={{ backgroundColor: unit.color }}
                >
                  <TrophyIcon size={28} color="white" />
                  <div>
                    <div>Level {unit.order} Complete!</div>
                    <div className="text-xs opacity-75 font-normal">
                      {unit.lessons.reduce((s, l) => s + l.xpReward, 0)} XP earned
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
