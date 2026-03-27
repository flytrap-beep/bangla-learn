"use client";

import {
  GreetingIcon, PronounIcon, FamilyIcon,
  RickshawIcon, HilsaIcon, TigerIcon, RiceIcon, BoatIcon, LotusIcon,
} from "@/components/icons";

const BG: Record<string, string> = {
  greeting:   "#e6f7ee",
  goodbye:    "#e8eaf6",
  thankyou:   "#fff3e0",
  morning:    "#fffde7",
  howareyou:  "#e3f2fd",
  imfine:     "#f1f8e9",
  self:       "#f3e5f5",
  you:        "#e8eaf6",
  good:       "#e8f5e9",
  mother:     "#fce4ec",
  father:     "#e3f2fd",
  brother:    "#fff3e0",
  sister:     "#fce4ec",
  rickshaw:   "#e6f7ee",
  fish:       "#e3f2fd",
  tiger:      "#fff3e0",
  rice:       "#e8f5e9",
  boat:       "#e3f2fd",
  lotus:      "#fce4ec",
  cow:        "#fffde7",
  banana:     "#fffde7",
};

export function WordPicture({ imageKey }: { imageKey: string }) {
  const bg = BG[imageKey] ?? "#f9fafb";
  return (
    <div
      className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center mb-5 shadow-sm"
      style={{ backgroundColor: bg }}
    >
      <PictureContent imageKey={imageKey} />
    </div>
  );
}

function PictureContent({ imageKey }: { imageKey: string }) {
  switch (imageKey) {
    case "greeting":  return <GreetingIcon size={60} color="#006A4E" />;
    case "goodbye":   return <GreetingIcon size={60} color="#3949AB" />;
    case "thankyou":  return <HeartSvg />;
    case "morning":   return <SunSvg />;
    case "howareyou": return <QuestionFaceSvg />;
    case "imfine":    return <HappyFaceSvg />;
    case "self":      return <PronounIcon size={60} color="#7B1FA2" />;
    case "you":       return <ArrowSvg />;
    case "good":      return <ThumbsUpSvg />;
    case "mother":    return <FamilyIcon size={60} color="#E91E63" />;
    case "father":    return <FamilyIcon size={60} color="#1565C0" />;
    case "brother":   return <FamilyIcon size={60} color="#E65100" />;
    case "sister":    return <FamilyIcon size={60} color="#AD1457" />;
    case "rickshaw":  return <RickshawIcon size={60} color="#006A4E" />;
    case "fish":      return <HilsaIcon size={60} color="#0288D1" />;
    case "tiger":     return <TigerIcon size={60} color="#E65100" />;
    case "rice":      return <RiceIcon size={60} color="#388E3C" />;
    case "boat":      return <BoatIcon size={60} color="#0288D1" />;
    case "lotus":     return <LotusIcon size={60} color="#E91E63" />;
    case "cow":       return <CowSvg />;
    case "banana":    return <BananaSvg />;
    default:          return null;
  }
}

// ── Custom SVG illustrations ──────────────────────────────────────────────────

function SunSvg() {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      {rays.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={30 + 17 * Math.cos(rad)} y1={30 + 17 * Math.sin(rad)}
            x2={30 + 25 * Math.cos(rad)} y2={30 + 25 * Math.sin(rad)}
            stroke="#FFB300" strokeWidth="2.5" strokeLinecap="round"
          />
        );
      })}
      <circle cx="30" cy="30" r="13" fill="#FFD700" />
      <circle cx="25" cy="27" r="2" fill="#E65100" />
      <circle cx="35" cy="27" r="2" fill="#E65100" />
      <path d="M23 35 Q30 42 37 35" stroke="#E65100" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function HappyFaceSvg() {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      <circle cx="30" cy="30" r="24" fill="#FFF9C4" stroke="#F9A825" strokeWidth="2" />
      <circle cx="22" cy="26" r="2.5" fill="#5D4037" />
      <circle cx="38" cy="26" r="2.5" fill="#5D4037" />
      <circle cx="17" cy="35" r="4" fill="#FFCDD2" opacity="0.7" />
      <circle cx="43" cy="35" r="4" fill="#FFCDD2" opacity="0.7" />
      <path d="M18 36 Q30 50 42 36" stroke="#F9A825" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function QuestionFaceSvg() {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      <circle cx="30" cy="28" r="20" fill="#BBDEFB" stroke="#1565C0" strokeWidth="2" />
      <circle cx="23" cy="25" r="2.5" fill="#1565C0" />
      <circle cx="37" cy="25" r="2.5" fill="#1565C0" />
      {/* raised eyebrows — curious look */}
      <path d="M20 19 Q23 16 26 19" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M34 19 Q37 16 40 19" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* open/curious mouth */}
      <path d="M25 33 Q30 38 35 33" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* question mark below */}
      <text x="30" y="56" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1565C0">?</text>
    </svg>
  );
}

function HeartSvg() {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      <path
        d="M30 50 C16 38 4 32 4 20 C4 12 10 6 18 6 C22 6 26 8 30 14 C34 8 38 6 42 6 C50 6 56 12 56 20 C56 32 44 38 30 50Z"
        fill="#EF5350" stroke="#C62828" strokeWidth="1.5"
      />
      <path d="M18 16 Q14 22 16 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  );
}

function ArrowSvg() {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      <path
        d="M8 28 L38 28 L38 22 L52 30 L38 38 L38 32 L8 32 Z"
        fill="#C5CAE9" stroke="#3949AB" strokeWidth="2" strokeLinejoin="round"
      />
    </svg>
  );
}

function ThumbsUpSvg() {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      {/* thumb */}
      <path
        d="M36 28 L38 12 Q40 6 34 6 Q30 6 29 12 L28 28 L16 28 L16 52 L44 52 L44 28 Z"
        fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" strokeLinejoin="round"
      />
      <line x1="16" y1="34" x2="44" y2="34" stroke="#388E3C" strokeWidth="1.5" opacity="0.5" />
      <line x1="16" y1="40" x2="44" y2="40" stroke="#388E3C" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function CowSvg() {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      {/* head */}
      <ellipse cx="30" cy="30" rx="20" ry="22" fill="white" stroke="#795548" strokeWidth="2" />
      {/* ears */}
      <ellipse cx="11" cy="20" rx="5" ry="7" fill="#FFCCBC" stroke="#795548" strokeWidth="1.5" />
      <ellipse cx="49" cy="20" rx="5" ry="7" fill="#FFCCBC" stroke="#795548" strokeWidth="1.5" />
      {/* horns */}
      <path d="M14 14 Q10 6 16 9" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M46 14 Q50 6 44 9" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* eyes */}
      <circle cx="22" cy="24" r="4" fill="#5D4037" />
      <circle cx="38" cy="24" r="4" fill="#5D4037" />
      <circle cx="23" cy="23" r="1.5" fill="white" />
      <circle cx="39" cy="23" r="1.5" fill="white" />
      {/* snout */}
      <ellipse cx="30" cy="40" rx="10" ry="8" fill="#FFCCBC" stroke="#795548" strokeWidth="1.5" />
      <circle cx="27" cy="41" r="2" fill="#A1887F" />
      <circle cx="33" cy="41" r="2" fill="#A1887F" />
    </svg>
  );
}

function BananaSvg() {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      <path
        d="M14 52 Q4 28 18 12 Q32 -2 48 8 Q44 22 30 38 Q22 48 14 52Z"
        fill="#FFD600" stroke="#F9A825" strokeWidth="2"
      />
      <path d="M22 14 Q32 8 44 14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* stem */}
      <path d="M48 8 Q56 4 54 12" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
