import Link from "next/link";
import { auth } from "@/lib/auth";
import { DIALECTS } from "@bangla-learn/types";
import type { Dialect } from "@bangla-learn/types";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🇧🇩</span>
          <span className="text-xl font-extrabold text-green-600">BanglaLearn</span>
        </div>
        <div className="flex gap-3">
          {session ? (
            <Link href="/learn" className="btn-primary py-2 px-6 text-sm">
              Continue Learning
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary py-2 px-6 text-sm">
                Log In
              </Link>
              <Link href="/login" className="btn-primary py-2 px-6 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-16 max-w-3xl mx-auto">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Learn{" "}
          <span className="text-green-500 bangla">বাংলা</span>
          <br />
          Your Way
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          The only app that teaches Bengali across{" "}
          <strong>4 regional dialects</strong>.
          <br />
          Free, fun, and built for beginners.
        </p>
        <p className="text-gray-400 text-sm mb-10">
          Because Duolingo doesn&apos;t have Bengali — but we do.
        </p>
        <Link href={session ? "/learn" : "/login"} className="btn-primary text-lg inline-block">
          {session ? "Continue Learning" : "Start for Free"}
        </Link>
      </section>

      {/* Dialect Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Choose Your Dialect
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(DIALECTS) as Dialect[]).map((dialect) => {
            const info = DIALECTS[dialect];
            return (
              <Link
                key={dialect}
                href={session ? `/learn?dialect=${dialect}` : "/login"}
                className="card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="text-4xl mb-3">{info.flagEmoji}</div>
                <h3 className="font-bold text-gray-900 mb-1">{info.label}</h3>
                <p className="text-lg font-semibold text-green-600 bangla mb-2">
                  {info.nativeLabel}
                </p>
                <p className="text-sm text-gray-500">{info.region}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
            Everything You Need to Learn Bengali
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🔥", title: "Daily Streaks", desc: "Build a habit with streak tracking" },
              { icon: "❤️", title: "Hearts System", desc: "Learn carefully — lose hearts on mistakes" },
              { icon: "⭐", title: "XP & Progress", desc: "Earn XP and level up your Bengali" },
              { icon: "🗣️", title: "4 Dialects", desc: "Standard, Sylheti, Barisali & Chittagonian" },
              { icon: "📝", title: "5 Exercise Types", desc: "Multiple choice, translation, matching & more" },
              { icon: "📱", title: "Mobile App", desc: "Learn on the go with our Expo mobile app" },
            ].map((f) => (
              <div key={f.title} className="card p-6 text-center">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-gray-400 text-sm">
        Made with ❤️ for the Bengali-speaking community worldwide
      </footer>
    </main>
  );
}
