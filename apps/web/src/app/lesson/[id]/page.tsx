import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLesson } from "@bangla-learn/content";
import type { Dialect } from "@bangla-learn/types";
import { LessonPlayer } from "@/components/LessonPlayer";
import Link from "next/link";

type Props = {
  params: { id: string };
  searchParams: { dialect?: string };
};

export default async function LessonPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dialect = (searchParams.dialect ?? "standard") as Dialect;
  const lesson = getLesson(dialect, params.id);

  if (!lesson) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
        <Link
          href={`/learn?dialect=${dialect}`}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-gray-800">{lesson.title}</h1>
        </div>
      </header>

      {/* Lesson Player (client component) */}
      <LessonPlayer lesson={lesson} dialect={dialect} userId={session.user.id} />
    </div>
  );
}
