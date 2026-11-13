// Shared building blocks for interactive lessons.
import { Pause, Play } from "lucide-react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { m, Reveal } from "../../components/motion";

export function Block({ title, kicker, children }: { title?: string; kicker?: string; children: ReactNode }) {
  return (
    <Reveal as="section" className="mt-14 first:mt-0">
      {kicker && <p className="eyebrow">{kicker}</p>}
      {title && <h2 className="mt-1.5 text-2xl font-semibold sm:text-3xl">{title}</h2>}
      <div className={title ? "mt-5" : ""}>{children}</div>
    </Reveal>
  );
}

export function Callout({ tone = "info", children }: { tone?: "info" | "warn" | "tip"; children: ReactNode }) {
  const c = tone === "warn" ? "border-sun-300 bg-sun-100/70" : tone === "tip" ? "border-verdi-200 bg-verdi-50" : "border-sky-300/50 bg-sky-100/60";
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${c}`}>{children}</div>;
}

export function Stage({ children, dark = true, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) {
  return <div className={`relative overflow-hidden rounded-3xl ${dark ? "bg-ink text-paper" : "card"} p-4 sm:p-6 ${className}`}>{children}</div>;
}

export function Stat({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}>
      <p className={`text-[10px] tracking-[0.14em] uppercase ${accent ? "text-paper/55" : "text-subtle"}`}>{label}</p>
      <m.p key={String(value)} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="num mt-1 text-2xl leading-tight">
        {value}
      </m.p>
      {sub && <p className={`mt-0.5 text-xs ${accent ? "text-paper/55" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}

/** Step-through explainer with optional autoplay. `render(step)` draws the visual for the active step. */
export function StepPlayer({ steps, render, interval = 3800 }: { steps: { title: string; text: ReactNode }[]; render: (i: number) => ReactNode; interval?: number }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(!reduce);
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setI((x) => (x + 1) % steps.length), interval);
    return () => clearTimeout(id);
  }, [i, playing, steps.length, interval]);
  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      <Stage className="min-h-[300px]">{render(i)}</Stage>
      <div className="flex flex-col">
        <ol className="grid gap-2">
          {steps.map((s, k) => (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => {
                  setI(k);
                  setPlaying(false);
                }}
                aria-current={k === i ? "step" : undefined}
                className={`relative w-full overflow-hidden rounded-2xl border p-4 text-left transition ${k === i ? "border-verdi-400 bg-verdi-50" : "border-line bg-card hover:border-ink/30"}`}
              >
                {k === i && playing && <m.span key={`bar${i}`} className="absolute bottom-0 left-0 h-0.5 bg-verdi-500" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: interval / 1000, ease: "linear" }} />}
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span className={`num grid size-6 place-items-center rounded-full text-xs ${k === i ? "bg-verdi-600 text-white" : "bg-paper-2"}`}>{k + 1}</span>
                  {s.title}
                </p>
                <AnimatePresence initial={false}>
                  {k === i && (
                    <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="pt-2 text-sm leading-relaxed text-ink/75">{s.text}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="btn-ghost btn-sm mt-3 self-start" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />} {playing ? "Pause" : "Auto-play"}
        </button>
      </div>
    </div>
  );
}

export function Chips<T extends string | number>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={String(o.v)} type="button" role="radio" aria-checked={o.v === value} onClick={() => onChange(o.v)} className={`chip ${o.v === value ? "chip-on" : ""}`}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function FlipCards({ items, frontLabel = "Myth", backLabel = "Fact" }: { items: [string, string][]; frontLabel?: string; backLabel?: string }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([front, back], i) => {
        const on = open.has(i);
        return (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            onClick={() =>
              setOpen((s) => {
                const n = new Set(s);
                if (n.has(i)) n.delete(i);
                else n.add(i);
                return n;
              })
            }
            className="group h-56 [perspective:1200px]"
          >
            <m.div className="relative size-full [transform-style:preserve-3d]" animate={{ rotateY: on ? 180 : 0 }} transition={{ type: "spring", stiffness: 120, damping: 16 }}>
              <div className="absolute inset-0 flex flex-col rounded-[var(--radius-card)] border border-line bg-card p-5 text-left [backface-visibility:hidden] group-hover:shadow-[var(--shadow-lift)]">
                <span className="font-mono text-[10px] tracking-[0.18em] text-danger uppercase">{frontLabel}</span>
                <span className="mt-3 flex-1 text-[15px] leading-snug font-medium">{front}</span>
                <span className="text-xs text-muted">Tap to reveal →</span>
              </div>
              <div className="absolute inset-0 flex flex-col rounded-[var(--radius-card)] bg-verdi-700 p-5 text-left text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="font-mono text-[10px] tracking-[0.18em] text-verdi-200 uppercase">{backLabel}</span>
                <span className="mt-3 flex-1 text-[15px] leading-snug">{back}</span>
                <span className="text-xs text-white/70">Tap to flip back</span>
              </div>
            </m.div>
          </button>
        );
      })}
    </div>
  );
}
