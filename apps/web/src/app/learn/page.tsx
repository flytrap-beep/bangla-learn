import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLessonProgress } from "@/lib/progress";
import { getCurriculum } from "@bangla-learn/content";
import type { Dialect } from "@bangla-learn/types";
import { DIALECTS } from "@bangla-learn/types";
import Link from "next/link";
import { LessonMap } from "@/components/LessonMap";
import { DialectSwitcher } from "@/components/DialectSwitcher";
import { StatsBar } from "@/components/StatsBar";
import { db } from "@/lib/db";
import { TargetIcon, AlphabetIcon, RickshawIcon } from "@/components/icons";

type SearchParams = { dialect?: string };

export default async function LearnPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dialect = (searchParams.dialect ?? "standard") as Dialect;
  const validDialects = Object.keys(DIALECTS) as Dialect[];
  const activeDialect = validDialects.includes(dialect) ? dialect : "standard";

  const [progress, streak, hearts] = await Promise.all([
    getLessonProgress(session.user.id, activeDialect),
    db.userStreak.findUnique({ where: { userId: session.user.id } }),
    db.userHeart.findUnique({ where: { userId: session.user.id } }),
  ]);

  const curriculum = getCurriculum(activeDialect);
  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId)
  );

  const isFirstTime = completedLessonIds.size === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🇧🇩</span>
            <span className="text-lg font-extrabold text-green-500">BanglaLearn</span>
          </Link>
          <StatsBar
            streak={streak?.current ?? 0}
            hearts={hearts?.hearts ?? 5}
          />
          <Link
            href="/profile"
            className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors text-sm font-bold text-gray-600"
          >
            {session.user.name?.[0]?.toUpperCase() ?? "?"}
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Absolute beginner banner */}
        {isFirstTime && (
          <Link
            href="/intro"
            className="flex items-center gap-4 rounded-2xl p-4 mb-6 text-white shadow-md hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #006A4E, #00523c)" }}
          >
            <RickshawIcon size={40} color="white" />
            <div className="flex-1">
              <div className="font-extrabold text-base">New to Bengali?</div>
              <div className="text-green-200 text-sm">Start with the alphabet intro — learn every character first</div>
            </div>
            <div className="text-2xl opacity-70">→</div>
          </Link>
        )}

        {/* Practice shortcut */}
        <div className="flex gap-2 mb-6">
          <Link
            href="/practice"
            className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border-2 border-gray-100 shadow-sm hover:border-green-300 hover:shadow-md transition-all text-sm font-bold text-gray-700"
          >
            <TargetIcon size={28} color="#006A4E" />
            <div>
              <div>Letter Bowl</div>
              <div className="text-xs text-gray-400 font-normal">Practice characters</div>
            </div>
          </Link>
          <Link
            href="/intro"
            className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border-2 border-gray-100 shadow-sm hover:border-green-300 hover:shadow-md transition-all text-sm font-bold text-gray-700"
          >
            <AlphabetIcon size={28} color="#006A4E" />
            <div>
              <div>Alphabet</div>
              <div className="text-xs text-gray-400 font-normal">Review intro</div>
            </div>
          </Link>
        </div>

        {/* Dialect Switcher */}
        <DialectSwitcher activeDialect={activeDialect} />

        {/* Unit/Lesson Map */}
        <LessonMap
          curriculum={curriculum}
          completedLessonIds={completedLessonIds}
          dialect={activeDialect}
        />
      </div>
    </div>
  );
}
