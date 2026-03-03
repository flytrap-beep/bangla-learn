import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserStats } from "@/lib/progress";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const stats = await getUserStats(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/learn" className="text-gray-400 hover:text-gray-600">
            ←
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* User info */}
        <div className="card p-6 flex items-center gap-5 mb-6">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p className="text-xl font-bold text-gray-900">{session.user.name}</p>
            <p className="text-gray-500 text-sm">{session.user.email}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-5 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <p className="text-3xl font-extrabold text-orange-500">{stats.currentStreak}</p>
            <p className="text-sm text-gray-500 mt-1">Day Streak</p>
          </div>
          <div className="card p-5 text-center">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-3xl font-extrabold text-yellow-500">{stats.totalXp}</p>
            <p className="text-sm text-gray-500 mt-1">Total XP</p>
          </div>
          <div className="card p-5 text-center">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-3xl font-extrabold text-blue-500">{stats.completedLessons}</p>
            <p className="text-sm text-gray-500 mt-1">Lessons Done</p>
          </div>
          <div className="card p-5 text-center">
            <div className="text-4xl mb-2">❤️</div>
            <p className="text-3xl font-extrabold text-red-500">{stats.hearts}</p>
            <p className="text-sm text-gray-500 mt-1">Hearts</p>
          </div>
        </div>

        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Longest streak</p>
          <p className="text-2xl font-bold text-gray-800">
            🏆 {stats.longestStreak} days
          </p>
        </div>
      </div>
    </div>
  );
}
