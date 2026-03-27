import LetterBowl from "./LetterBowl";
import Link from "next/link";

export const metadata = {
  title: "Letter Bowl — BanglaLearn",
  description: "Practice Bengali characters and numbers with a quick-fire quiz game.",
};

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-xl">✕</Link>
        <div className="flex-1 text-center">
          <span className="font-extrabold text-gray-900">🎯 Letter Bowl</span>
        </div>
        <div className="w-6" />
      </header>
      <LetterBowl />
    </div>
  );
}
