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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🇧🇩</span>
            <span className="text-lg font-extrabold text-green-600">BanglaLearn</span>
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
