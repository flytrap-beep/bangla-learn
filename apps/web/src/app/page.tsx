import Link from "next/link";
import { auth } from "@/lib/auth";
import { DIALECTS } from "@bangla-learn/types";
import type { Dialect } from "@bangla-learn/types";
import {
  RickshawIcon, TigerIcon, LotusIcon, RiceIcon, BoatIcon, HilsaIcon,
  AlphabetIcon, FlashcardIcon, BookIcon, FlameIcon, HeartIcon,
} from "@/components/icons";

const CULTURAL_ICONS = [
  { Icon: RickshawIcon, label: "Rickshaw" },
  { Icon: TigerIcon, label: "Bengal Tiger" },
  { Icon: LotusIcon, label: "Water Lily" },
  { Icon: RiceIcon, label: "Rice" },
  { Icon: BoatIcon, label: "Nouka Boat" },
  { Icon: HilsaIcon, label: "Hilsa Fish" },
];

const FEATURES = [
  { Icon: AlphabetIcon, title: "Alphabet First", desc: "Learn every character before your first lesson" },
  { Icon: FlashcardIcon, title: "Flashcards", desc: "Words with pictures — see it, say it, remember it" },
  { Icon: BookIcon, title: "Grammar Made Easy", desc: "Simple rules explained in plain English" },
  { Icon: FlameIcon, title: "Daily Streaks", desc: "Build a habit with streak tracking" },
  { Icon: HeartIcon, title: "Hearts System", desc: "Learn carefully — lose hearts on mistakes" },
  { Icon: RickshawIcon, title: "4 Dialects", desc: "Standard, Sylheti, Barisali & Chittagonian" },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🇧🇩</span>
          <span className="text-xl font-extrabold text-green-500">BanglaLearn</span>
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

      {/* Hero — Bangladesh flag-inspired */}
      <section className="relative overflow-hidden">
        {/* Green band + red circle — subtle flag nod */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-bdred-50 pointer-events-none" />
        <div className="relative text-center px-6 py-16 max-w-3xl mx-auto">
          <div className="text-7xl mb-4">🇧🇩</div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            শিখুন{" "}
            <span className="text-green-500 bangla">বাংলা</span>
            <br />
            <span className="text-gray-700">from Zero</span>
          </h1>
          <p className="text-xl text-gray-600 mb-3">
            The only app that teaches Bengali across{" "}
            <strong>4 regional dialects</strong>.
          </p>
          <p className="text-gray-400 text-sm mb-2">
            No experience needed — start from the very first letter.
          </p>
          <p className="text-gray-400 text-sm mb-10">
            Spoken by <strong className="text-green-500">230 million</strong> people worldwide 🌍
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={session ? "/learn" : "/intro"}
              className="btn-primary text-lg inline-block"
            >
              🛺 Start for Free
            </Link>
            {!session && (
              <Link href="/login" className="btn-secondary text-lg inline-block">
                Log In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Cultural icons strip */}
      <section className="bg-green-500 py-4 overflow-hidden">
        <div className="flex justify-center gap-8 flex-wrap px-6">
          {CULTURAL_ICONS.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={32} color="white" />
              <span className="text-xs text-green-100 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Dialect Cards */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Choose Your Dialect
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Bangladesh has many regional voices — learn yours
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(DIALECTS) as Dialect[]).map((dialect) => {
            const info = DIALECTS[dialect];
            return (
              <Link
                key={dialect}
                href={session ? `/learn?dialect=${dialect}` : "/intro"}
                className="card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer border-2 hover:border-green-200"
              >
                <div className="text-4xl mb-3">{info.flagEmoji}</div>
                <h3 className="font-bold text-gray-900 mb-1">{info.label}</h3>
                <p className="text-lg font-semibold text-green-500 bangla mb-2">
                  {info.nativeLabel}
                </p>
                <p className="text-sm text-gray-500">{info.region}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Beginner callout */}
      <section className="bg-green-500 py-12 px-6">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="text-5xl mb-4">🛺</div>
          <h2 className="text-2xl font-extrabold mb-3">Never seen Bengali before?</h2>
          <p className="text-green-100 mb-6">
            Our step-by-step intro teaches you the alphabet from scratch —
            one character at a time, with pictures and pronunciation.
          </p>
          <Link
            href="/intro"
            className="inline-block bg-white text-green-600 font-bold py-3 px-8 rounded-2xl shadow-[0_4px_0_#003d2d] hover:bg-green-50 transition-colors"
          >
            Start the Alphabet Intro →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
            Everything You Need to Learn Bengali
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Icon size={40} color="#006A4E" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-8 px-6">
        <div className="text-2xl mb-2">🇧🇩</div>
        <p className="text-gray-400 text-sm">
          Made with ❤️ for the Bengali-speaking community worldwide
        </p>
        <p className="text-gray-300 text-xs mt-1 bangla">আমরা বাংলা ভালোবাসি</p>
      </footer>
    </main>
  );
}
