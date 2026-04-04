export { standardCurriculum } from "./dialects/standard";
export { sylhetiCurriculum } from "./dialects/sylheti";
export { barisaliCurriculum } from "./dialects/barisali";
export { chittagonianCurriculum } from "./dialects/chittagonian";
export { rajshahiCurriculum } from "./dialects/rajshahi";
export { khulnaCurriculum } from "./dialects/khulna";

import { standardCurriculum } from "./dialects/standard";
import { sylhetiCurriculum } from "./dialects/sylheti";
import { barisaliCurriculum } from "./dialects/barisali";
import { chittagonianCurriculum } from "./dialects/chittagonian";
import { rajshahiCurriculum } from "./dialects/rajshahi";
import { khulnaCurriculum } from "./dialects/khulna";
import type { Dialect, DialectCurriculum, Lesson } from "@bangla-learn/types";

export const allCurricula: Record<Dialect, DialectCurriculum> = {
  standard: standardCurriculum,
  sylheti: sylhetiCurriculum,
  barisali: barisaliCurriculum,
  chittagonian: chittagonianCurriculum,
  rajshahi: rajshahiCurriculum,
  khulna: khulnaCurriculum,
};

export function getCurriculum(dialect: Dialect): DialectCurriculum {
  return allCurricula[dialect];
}

export function getLesson(dialect: Dialect, lessonId: string): Lesson | undefined {
  const curriculum = allCurricula[dialect];
  for (const unit of curriculum.units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getAllLessonIds(dialect: Dialect): string[] {
  const curriculum = allCurricula[dialect];
  return curriculum.units.flatMap((u) => u.lessons.map((l) => l.id));
}
