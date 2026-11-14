/** VERDI brand mark (supplied logo emblem) + wordmark. `dark` = on dark backgrounds. */
export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-2 sm:gap-2.5" aria-label="VERDI Solarr Solution">
      <img
        src="/brand/verdi-mark.png"
        alt=""
        width={40}
        height={41}
        className="size-9 shrink-0 sm:size-10 transition-transform duration-700 ease-out group-hover:rotate-[30deg]"
        decoding="async"
      />
      {!compact && (
        <span className="leading-none max-[339px]:hidden">
          <span className={`block font-display text-[1.2rem] font-bold tracking-[0.04em] ${dark ? "text-paper" : "text-[#4f4f4f]"}`}>VERDI</span>
          <span className={`mt-0.5 block text-[0.68rem] font-semibold tracking-[0.02em] ${dark ? "text-paper/60" : "text-[#5a5a5a]"}`}>Solarr Solution</span>
        </span>
      )}
    </span>
  );
}
