import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCurriculum } from "@bangla-learn/content";
import type { Dialect } from "@bangla-learn/types";
import { DIALECTS } from "@bangla-learn/types";
import Link from "next/link";
import PrepTabs from "./PrepTabs";

interface Props {
  params: { unitId: string };
  searchParams: { dialect?: string };
}

export default async function PrepPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const dialect = (searchParams.dialect ?? "standard") as Dialect;
  if (!DIALECTS[dialect]) redirect("/learn");

  const curriculum = getCurriculum(dialect);
  const unit = curriculum.units.find((u) => u.id === params.unitId);
  if (!unit) notFound();
  if (!unit.prep) redirect(`/learn?dialect=${dialect}`);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link
          href={`/learn?dialect=${dialect}`}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
        >
          ✕
        </Link>
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-400">Unit {unit.order}</div>
          <div className="font-bold text-gray-900">{unit.title}</div>
        </div>
        <div className="w-8" />
      </header>

      {/* Unit badge */}
      <div className="flex justify-center pt-8 pb-4">
        <div
          className="px-6 py-3 rounded-2xl text-white font-bold text-lg shadow-md"
          style={{ backgroundColor: unit.color }}
        >
          {unit.title}
        </div>
      </div>

      {/* Tabs content */}
      <PrepTabs prep={unit.prep} unitColor={unit.color} />

      {/* Start Unit CTA */}
      <div className="max-w-lg mx-auto px-6 pb-12 pt-6">
        <Link
          href={`/learn?dialect=${dialect}`}
          className="block w-full text-center py-4 rounded-2xl text-white font-bold text-lg shadow-md transition-opacity hover:opacity-90"
          style={{ backgroundColor: unit.color }}
        >
          Start Unit →
        </Link>
      </div>
    </div>
  );
}
