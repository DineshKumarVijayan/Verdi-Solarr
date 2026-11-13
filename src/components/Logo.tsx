/** Typographic placeholder mark until the supplied company logo is added (see README). */
export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="VERDI SOLARR SOLUTION">
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill={dark ? "#fffdf8" : "#0d1813"} />
        <circle cx="20" cy="16" r="5.5" fill="#f5ad2e" className="origin-[20px_16px] animate-pulse-sun" />
        <path d="M9 29 L20 19.5 L31 29" fill="none" stroke="#3aa56c" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className={`block font-display text-[1.05rem] font-bold tracking-tight ${dark ? "text-paper" : "text-ink"}`}>
            VERDI <span className="text-verdi-500">SOLARR</span>
          </span>
          <span className={`mt-1 block font-mono text-[0.55rem] tracking-[0.32em] ${dark ? "text-paper/50" : "text-subtle"}`}>SOLUTION</span>
        </span>
      )}
    </span>
  );
}
