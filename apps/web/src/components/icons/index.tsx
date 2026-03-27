/**
 * BanglaLearn Custom Icon Set
 * Inspired by Nakshi Kantha embroidery, Bengali script curves, and Bangladeshi culture.
 * All icons are SVG components using stroke-based design with rounded ends.
 */

type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

const defaults = { size: 24, color: "currentColor" };

// ─── Gamification ─────────────────────────────────────────────────────────────

/** Flame — streak tracker. Flowing Bengali-style fire shape */
export function FlameIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Outer flame */}
      <path
        d="M12 3C12 3 7 9 7 13.5C7 16.5 9.2 19 12 19C14.8 19 17 16.5 17 13.5C17 9 12 3 12 3Z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Inner flame */}
      <path
        d="M12 9C12 9 9.5 12.5 9.5 14.5C9.5 15.9 10.6 17 12 17C13.4 17 14.5 15.9 14.5 14.5C14.5 12.5 12 9 12 9Z"
        fill={color} opacity="0.3"
      />
      {/* Nakshi dots at base */}
      <circle cx="10" cy="20.5" r="0.8" fill={color} opacity="0.5" />
      <circle cx="12" cy="21" r="0.8" fill={color} opacity="0.5" />
      <circle cx="14" cy="20.5" r="0.8" fill={color} opacity="0.5" />
    </svg>
  );
}

/** Heart — hearts system. Bangladesh red circle inspired */
export function HeartIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 20C12 20 4 14 4 8.5C4 6 6 4 8.5 4C10 4 11.3 4.8 12 6C12.7 4.8 14 4 15.5 4C18 4 20 6 20 8.5C20 14 12 20 12 20Z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        fill={color} fillOpacity="0.15"
      />
    </svg>
  );
}

/** Nakshi Star — XP points. 8-pointed star from Nakshi Kantha patterns */
export function StarIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* 8-pointed star — Nakshi Kantha motif */}
      <path
        d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5L12 2Z"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        fill={color} fillOpacity="0.2"
      />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </svg>
  );
}

/** Trophy — achievements and completion */
export function TrophyIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Cup body */}
      <path
        d="M8 3H16V12C16 14.2 14.2 16 12 16C9.8 16 8 14.2 8 12V3Z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Handles */}
      <path d="M8 5C8 5 5 5 5 8C5 10 7 10.5 8 10.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 5C16 5 19 5 19 8C19 10 17 10.5 16 10.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Stem */}
      <line x1="12" y1="16" x2="12" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Base */}
      <path d="M9 19H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Nakshi dots on cup */}
      <circle cx="11" cy="9" r="0.7" fill={color} opacity="0.6" />
      <circle cx="13" cy="9" r="0.7" fill={color} opacity="0.6" />
    </svg>
  );
}

/** Lock — locked lesson state */
export function LockIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Shackle */}
      <path
        d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
        stroke={color} strokeWidth="1.8" strokeLinecap="round"
      />
      {/* Body */}
      <rect x="5" y="10" width="14" height="11" rx="3" stroke={color} strokeWidth="1.8" />
      {/* Keyhole */}
      <circle cx="12" cy="15" r="1.5" stroke={color} strokeWidth="1.4" />
      <line x1="12" y1="16.5" x2="12" y2="18.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Check — correct answer / completed */
export function CheckIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 12L10 17L19 7"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/** X — wrong answer / close */
export function XIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** Celebrate — lesson complete */
export function CelebrationIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Star burst */}
      <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M5.6 5.6L7.8 7.8M16.2 16.2L18.4 18.4M5.6 18.4L7.8 16.2M16.2 7.8L18.4 5.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.2" />
    </svg>
  );
}

// ─── Learning Features ─────────────────────────────────────────────────────────

/** Book — grammar, lessons. Bengali manuscript style with matra line */
export function BookIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Open book */}
      <path
        d="M12 6C12 6 9 4.5 6 5V19C9 18.5 12 20 12 20C12 20 15 18.5 18 19V5C15 4.5 12 6 12 6Z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Spine */}
      <line x1="12" y1="6" x2="12" y2="20" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Matra lines (Bengali text lines) */}
      <line x1="8" y1="9" x2="11" y2="9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="12" x2="11" y2="12" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="15" x2="11" y2="15" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="13" y1="9" x2="16" y2="9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="13" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Matra (top line) on left page — Bengali script motif */}
      <line x1="7.5" y1="7.5" x2="11" y2="7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Flashcard — word cards with flip action */
export function FlashcardIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Back card */}
      <rect x="5" y="6" width="14" height="13" rx="3" stroke={color} strokeWidth="1.5" strokeDasharray="2 1.5" opacity="0.4" />
      {/* Front card */}
      <rect x="3" y="4" width="14" height="13" rx="3" stroke={color} strokeWidth="1.8" fill="white" />
      {/* Bengali ক on card — cultural motif */}
      <text x="10" y="13.5" fontFamily="serif" fontSize="9" fill={color} textAnchor="middle" opacity="0.7">ক</text>
      {/* Matra line */}
      <line x1="6" y1="7.5" x2="14" y2="7.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Target/Bowl — Letter Bowl practice game. Dhol (Bengali drum) inspired */
export function TargetIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Outer ring */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      {/* Middle ring */}
      <circle cx="12" cy="12" r="5.5" stroke={color} strokeWidth="1.6" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="2" fill={color} />
      {/* Nakshi dots */}
      <circle cx="12" cy="3.5" r="0.8" fill={color} opacity="0.5" />
      <circle cx="12" cy="20.5" r="0.8" fill={color} opacity="0.5" />
      <circle cx="3.5" cy="12" r="0.8" fill={color} opacity="0.5" />
      <circle cx="20.5" cy="12" r="0.8" fill={color} opacity="0.5" />
    </svg>
  );
}

/** Alphabet — Bengali character learning. ক with matra */
export function AlphabetIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Matra (horizontal headline of Bengali script) */}
      <line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      {/* Stylised ক shape */}
      <path
        d="M9 6C9 6 9 13 9 16M9 11H14M14 6C14 6 14 9 16 12C18 15 17 18 15 18"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Small decorative dots — Nakshi style */}
      <circle cx="7" cy="19.5" r="0.9" fill={color} opacity="0.5" />
      <circle cx="12" cy="20.5" r="0.9" fill={color} opacity="0.5" />
      <circle cx="17" cy="19.5" r="0.9" fill={color} opacity="0.5" />
    </svg>
  );
}

/** Numbers — Bengali numeral ১. */
export function NumbersIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Matra line */}
      <line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      {/* Bengali ১ shape */}
      <path
        d="M12 6C12 6 10 8 8 9M12 6V18"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Bengali ২ shape beside it */}
      <path
        d="M15 9C15 9 17 8 17 10C17 12 15 13 15 13H17"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Base dots */}
      <circle cx="9" cy="20" r="0.9" fill={color} opacity="0.5" />
      <circle cx="12" cy="20.8" r="0.9" fill={color} opacity="0.5" />
      <circle cx="15" cy="20" r="0.9" fill={color} opacity="0.5" />
    </svg>
  );
}

// ─── Cultural Icons ────────────────────────────────────────────────────────────

/** Rickshaw — Bangladesh's iconic transport */
export function RickshawIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 24" fill="none" className={className}>
      {/* Passenger hood/canopy */}
      <path
        d="M6 11C6 11 7 5 13 4C19 3 21 7 21 7"
        stroke={color} strokeWidth="1.8" strokeLinecap="round"
      />
      {/* Hood panels */}
      <path d="M6 11H21V15H6V11Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      {/* Body/chassis */}
      <path d="M3 15H24V18H3V15Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      {/* Seat decoration — Nakshi pattern dots */}
      <circle cx="10" cy="13" r="0.7" fill={color} opacity="0.6" />
      <circle cx="13.5" cy="13" r="0.7" fill={color} opacity="0.6" />
      <circle cx="17" cy="13" r="0.7" fill={color} opacity="0.6" />
      {/* Rear wheel */}
      <circle cx="7" cy="19.5" r="3" stroke={color} strokeWidth="1.6" />
      <circle cx="7" cy="19.5" r="1" fill={color} opacity="0.4" />
      {/* Front wheel */}
      <circle cx="20" cy="19.5" r="3" stroke={color} strokeWidth="1.6" />
      <circle cx="20" cy="19.5" r="1" fill={color} opacity="0.4" />
      {/* Pedal connection */}
      <line x1="3" y1="18" x2="3" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Lotus — national flower of Bangladesh, used for completion/beauty */
export function LotusIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Center petal */}
      <path d="M12 18C12 18 12 11 12 8C12 5 14 3 16 4C18 5 17 9 12 18Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
      <path d="M12 18C12 18 12 11 12 8C12 5 10 3 8 4C6 5 7 9 12 18Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
      {/* Side petals */}
      <path d="M12 18C12 18 6 15 5 12C4 9 6 7 8 8C10 9 12 18 12 18Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
      <path d="M12 18C12 18 18 15 19 12C20 9 18 7 16 8C14 9 12 18 12 18Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
      {/* Water surface */}
      <path d="M5 19C8 18 16 18 19 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="12" cy="15" r="1.2" fill={color} />
    </svg>
  );
}

/** Hilsa Fish (Ilish) — national fish, used for practice/game */
export function HilsaIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Body */}
      <path
        d="M4 12C4 12 8 7 14 8C19 9 21 12 21 12C21 12 19 15 14 16C8 17 4 12 4 12Z"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
        fill={color} fillOpacity="0.1"
      />
      {/* Tail */}
      <path d="M4 12C4 12 2 9 1 12C2 15 4 12 4 12Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Eye */}
      <circle cx="17.5" cy="11.5" r="1.2" stroke={color} strokeWidth="1.2" />
      <circle cx="17.5" cy="11.5" r="0.4" fill={color} />
      {/* Scale dots — Nakshi style */}
      <circle cx="10" cy="11" r="0.8" fill={color} opacity="0.4" />
      <circle cx="12.5" cy="11" r="0.8" fill={color} opacity="0.4" />
      <circle cx="11" cy="13" r="0.8" fill={color} opacity="0.4" />
      {/* Dorsal fin */}
      <path d="M10 8C10 8 12 5 14 7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Nouka (Boat) — traditional Bengali boat */
export function BoatIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Hull */}
      <path
        d="M3 14C3 14 4 18 12 18C20 18 21 14 21 14H3Z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        fill={color} fillOpacity="0.1"
      />
      {/* Mast */}
      <line x1="12" y1="4" x2="12" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Sail */}
      <path d="M12 5C12 5 8 8 9 13H12V5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.2" />
      {/* Water ripple */}
      <path d="M3 20C6 19 9 21 12 20C15 19 18 21 21 20" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Bengal Tiger paw — animals/wildlife */
export function TigerIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Paw pad */}
      <ellipse cx="12" cy="15" rx="5" ry="4" stroke={color} strokeWidth="1.7" fill={color} fillOpacity="0.12" />
      {/* Toe pads */}
      <ellipse cx="8" cy="10" rx="2" ry="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
      <ellipse cx="12" cy="9" rx="2" ry="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
      <ellipse cx="16" cy="10" rx="2" ry="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
    </svg>
  );
}

/** Rice — food/paddy field */
export function RiceIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Bowl */}
      <path d="M5 13C5 13 5 18 12 18C19 18 19 13 19 13H5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
      <path d="M5 13H19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Steam curls */}
      <path d="M9 10C9 10 8 8 9 6C10 4 9 2 9 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M12 10C12 10 11 8 12 6C13 4 12 2 12 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M15 10C15 10 14 8 15 6C16 4 15 2 15 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Rice grains */}
      <ellipse cx="9" cy="15" rx="1.2" ry="0.7" fill={color} opacity="0.5" />
      <ellipse cx="12" cy="15.5" rx="1.2" ry="0.7" fill={color} opacity="0.5" />
      <ellipse cx="15" cy="15" rx="1.2" ry="0.7" fill={color} opacity="0.5" />
    </svg>
  );
}

// ─── Lesson Category Icons ─────────────────────────────────────────────────────

/** Wave hand — greetings lesson */
export function GreetingIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Hand */}
      <path
        d="M7 11V5.5C7 4.7 7.7 4 8.5 4C9.3 4 10 4.7 10 5.5V10M10 10V4.5C10 3.7 10.7 3 11.5 3C12.3 3 13 3.7 13 4.5V10M13 10V5.5C13 4.7 13.7 4 14.5 4C15.3 4 16 4.7 16 5.5V12"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M7 11C7 11 4.5 11 4.5 13.5C4.5 17 7 21 12 21C16.5 21 19 17.5 19 14V12C19 11.2 18.3 10.5 17.5 10.5C16.7 10.5 16 11.2 16 12"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Shine lines — waving motion */}
      <path d="M20 6L21.5 4.5M20.5 9H22.5M20 12L21.5 13.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Family — two adults and child, Bengali style */
export function FamilyIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Adult 1 head */}
      <circle cx="7" cy="5" r="2.5" stroke={color} strokeWidth="1.6" />
      {/* Adult 1 body */}
      <path d="M4 20V12C4 10.3 5.3 9 7 9C8.7 9 10 10.3 10 12V20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Adult 2 head */}
      <circle cx="17" cy="5" r="2.5" stroke={color} strokeWidth="1.6" />
      {/* Adult 2 body */}
      <path d="M14 20V12C14 10.3 15.3 9 17 9C18.7 9 20 10.3 20 12V20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Child head */}
      <circle cx="12" cy="8" r="1.8" stroke={color} strokeWidth="1.5" />
      {/* Child body */}
      <path d="M10 20V15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Palette — colors lesson */
export function ColorsIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Palette shape */}
      <path
        d="M12 3C7 3 3 7 3 12C3 14.5 4.5 16.5 7 17.5C8.5 18 9 17 9 16C9 15 9.5 14 11 14H13C16.3 14 19 11.3 19 8C19 5.2 16.5 3 12 3Z"
        stroke={color} strokeWidth="1.7" strokeLinecap="round"
      />
      {/* Color dots on palette */}
      <circle cx="8" cy="9" r="1.3" fill={color} />
      <circle cx="12" cy="7" r="1.3" fill={color} opacity="0.7" />
      <circle cx="15.5" cy="9.5" r="1.3" fill={color} opacity="0.5" />
      <circle cx="14.5" cy="13" r="1.3" fill={color} opacity="0.3" />
      {/* Thumb hole */}
      <circle cx="6" cy="15" r="1.5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/** Speech bubble — phrases/conversation */
export function PhrasesIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Main bubble */}
      <path
        d="M4 4H20C21.1 4 22 4.9 22 6V15C22 16.1 21.1 17 20 17H13L8 21V17H4C2.9 17 2 16.1 2 15V6C2 4.9 2.9 4 4 4Z"
        stroke={color} strokeWidth="1.7" strokeLinejoin="round"
      />
      {/* Matra text lines inside bubble */}
      <line x1="6" y1="9" x2="18" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="12.5" x2="14" y2="12.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Pronoun — person silhouette */
export function PronounIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="6" r="3.5" stroke={color} strokeWidth="1.8" />
      <path d="M5 21V17C5 14.2 8.1 12 12 12C15.9 12 19 14.2 19 17V21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Pointer arrow */}
      <path d="M3 9H1M1 9L2.5 7.5M1 9L2.5 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

/** Travel/Transport — vehicle */
export function TravelIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return <RickshawIcon size={size} color={color} className={className} />;
}

/** Default lesson — open book with Bengali character */
export function LessonIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return <BookIcon size={size} color={color} className={className} />;
}

// ─── Navigation ────────────────────────────────────────────────────────────────

/** Arrow right */
export function ArrowRightIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12H19M13 6L19 12L13 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Arrow left */
export function ArrowLeftIcon({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5M11 18L5 12L11 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
