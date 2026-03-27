import { FlameIcon, HeartIcon } from "@/components/icons";

export function StatsBar({ streak, hearts }: { streak: number; hearts: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5 font-bold text-orange-500">
        <FlameIcon size={20} color="#f97316" />
        <span>{streak}</span>
      </div>
      <div className="flex items-center gap-1.5 font-bold text-bdred-500">
        <HeartIcon size={20} color="#F42A41" />
        <span>{hearts}</span>
      </div>
    </div>
  );
}
