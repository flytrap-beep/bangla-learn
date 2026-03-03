"use client";

import Link from "next/link";
import { DIALECTS } from "@bangla-learn/types";
import type { Dialect } from "@bangla-learn/types";

export function DialectSwitcher({ activeDialect }: { activeDialect: Dialect }) {
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
        Dialect
      </p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(DIALECTS) as Dialect[]).map((dialect) => {
          const info = DIALECTS[dialect];
          const isActive = dialect === activeDialect;
          return (
            <Link
              key={dialect}
              href={`/learn?dialect=${dialect}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border-2 transition-all ${
                isActive
                  ? "bg-green-500 border-green-500 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-green-300"
              }`}
            >
              <span>{info.flagEmoji}</span>
              <span>{info.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
