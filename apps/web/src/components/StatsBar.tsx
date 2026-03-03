export function StatsBar({ streak, hearts }: { streak: number; hearts: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1 font-bold text-orange-500">
        <span className="text-lg">🔥</span>
        <span>{streak}</span>
      </div>
      <div className="flex items-center gap-1 font-bold text-red-500">
        <span className="text-lg">❤️</span>
        <span>{hearts}</span>
      </div>
    </div>
  );
}
