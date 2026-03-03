import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { completeLesson } from "@/lib/progress";
import type { Dialect } from "@bangla-learn/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { lessonId, dialect, xpEarned, heartsLost } = body as {
    lessonId: string;
    dialect: Dialect;
    xpEarned: number;
    heartsLost: number;
  };

  if (!lessonId || !dialect || xpEarned == null) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
  }

  await completeLesson({
    userId: session.user.id,
    lessonId,
    dialect,
    xpEarned,
    heartsLost: heartsLost ?? 0,
  });

  return NextResponse.json({ success: true });
}
