import { ArrowRight, CheckCircle2, Clock, Search } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { m } from "../components/motion";
import { usePageMeta } from "../lib/seo";
import { GROUP_STYLE, GROUPS, ICONS, LESSONS, readDone } from "./learn/registry";

export default function Learn() {
  usePageMeta(
    "Solar Learning Hub — interactive solar lessons",
    "24 interactive, animated solar lessons: how cells work, TOPCon vs PERC, half-cut and bifacial modules, MPPT, datasheets, cable losses, earthing, PM Surya Ghar subsidy and more.",
  );
  const [group, setGroup] = useState<string>("all");
  const [q, setQ] = useState("");
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => setDone(readDone()), []);

  const list = useMemo(
    () => LESSONS.filter((l) => (group === "all" || l.group === group) && (!q.trim() || `${l.title} ${l.summary}`.toLowerCase().includes(q.trim().toLowerCase()))),
    [group, q],
  );
  const pct = Math.round((done.size / LESSONS.length) * 100);
  const next = LESSONS.find((l) => !done.has(l.slug)) ?? LESSONS[0];

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 grid-bg" aria-hidden="true" />
        <Orbit />
        <div className="container-x relative grid items-center gap-10 py-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <m.p className="eyebrow !text-verdi-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Solar Learning Hub
            </m.p>
            <m.h1 className="mt-3 text-4xl leading-tight font-semibold sm:text-6xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              Learn solar by <span className="bg-linear-to-r from-sun-300 to-verdi-300 bg-clip-text text-transparent">playing with it.</span>
            </m.h1>
            <m.p className="mt-4 max-w-xl text-paper/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              {LESSONS.length} bite-sized, animated lessons. Drag sliders, flip cards and step through diagrams, using real numbers from the datasheets in our catalogue.
            </m.p>
            <m.div className="mt-7 flex flex-wrap items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Link to={`/learn/${next.slug}`} className="btn-sun">
                {done.size ? "Continue learning" : "Start with lesson 1"} <ArrowRight className="size-4" />
              </Link>
              <span className="text-sm text-paper/60">Next: {next.title}</span>
            </m.div>
          </div>
          <m.div className="mx-auto flex flex-col items-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <svg viewBox="0 0 160 160" className="size-48" role="img" aria-label={`${pct}% of lessons completed`}>
              <circle cx="80" cy="80" r="66" fill="none" stroke="#ffffff14" strokeWidth="12" />
              <m.circle cx="80" cy="80" r="66" fill="none" stroke="url(#lg)" strokeWidth="12" strokeLinecap="round" transform="rotate(-90 80 80)" strokeDasharray={2 * Math.PI * 66} initial={{ strokeDashoffset: 2 * Math.PI * 66 }} animate={{ strokeDashoffset: 2 * Math.PI * 66 * (1 - pct / 100) }} transition={{ duration: 1.2, delay: 0.5 }} />
              <defs>
                <linearGradient id="lg">
                  <stop offset="0" stopColor="#f9a21b" />
                  <stop offset="1" stopColor="#6db62c" />
                </linearGradient>
              </defs>
              <text x="80" y="82" textAnchor="middle" fontSize="30" fill="#fff" fontFamily="JetBrains Mono">
                {done.size}/{LESSONS.length}
              </text>
              <text x="80" y="104" textAnchor="middle" fontSize="10" fill="#cfd8de" fontFamily="Inter">
                lessons completed
              </text>
            </svg>
          </m.div>
        </div>
      </section>

      {/* filters */}
      <div className="sticky top-16 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
        <div className="container-x flex flex-wrap items-center gap-2 py-3">
          <div className="scrollbar-none flex flex-1 gap-1.5 overflow-x-auto" role="tablist" aria-label="Lesson topics">
            {[{ id: "all", name: "All lessons" }, ...GROUPS].map((g) => (
              <button key={g.id} role="tab" type="button" aria-selected={group === g.id} onClick={() => setGroup(g.id)} className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${group === g.id ? "text-paper" : "text-ink/70 hover:text-ink"}`}>
                {group === g.id && <m.span layoutId="learn-tab" className="absolute inset-0 rounded-full bg-ink" />}
                <span className="relative">{g.name}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
            <input aria-label="Search lessons" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons" className="field !rounded-full !py-2 pl-9" />
          </div>
        </div>
      </div>

      {/* grid */}
      <div className="container-x py-12">
        <m.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((l, i) => {
              const Icon = ICONS[l.icon] ?? CheckCircle2;
              const g = GROUPS.find((x) => x.id === l.group)!;
              const n = LESSONS.indexOf(l) + 1;
              return (
                <m.div key={l.slug} layout initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: Math.min(i, 8) * 0.04 }}>
                  <Link to={`/learn/${l.slug}`} className="group card relative flex h-full flex-col overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]" data-testid="lesson-card">
                    <div className="flex items-start justify-between">
                      <m.span className={`grid size-12 place-items-center rounded-2xl bg-linear-to-br ${GROUP_STYLE[g.color]}`} whileHover={{ rotate: [0, -10, 10, 0], scale: 1.08 }}>
                        <Icon className="size-6" />
                      </m.span>
                      {done.has(l.slug) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-verdi-50 px-2 py-1 text-xs font-semibold text-verdi-700">
                          <CheckCircle2 className="size-3.5" /> Done
                        </span>
                      ) : (
                        <span className="num text-xs text-subtle">{String(n).padStart(2, "0")}</span>
                      )}
                    </div>
                    <p className="mt-4 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">{g.name}</p>
                    <h2 className="mt-1 text-lg leading-snug font-semibold">{l.title}</h2>
                    <p className="mt-2 flex-1 text-sm text-muted">{l.summary}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-subtle">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" /> {l.minutes} min · interactive
                      </span>
                      <ArrowRight className="size-4 transition group-hover:translate-x-1 group-hover:text-verdi-600" />
                    </div>
                    <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-linear-to-r from-sun-400 to-verdi-500 transition-transform duration-500 group-hover:scale-x-100" />
                  </Link>
                </m.div>
              );
            })}
          </AnimatePresence>
        </m.div>
        {list.length === 0 && <p className="py-16 text-center text-muted">No lessons match “{q}”.</p>}
      </div>
    </div>
  );
}

function Orbit() {
  return (
    <div className="pointer-events-none absolute top-1/2 right-[-120px] hidden size-[560px] -translate-y-1/2 lg:block" aria-hidden="true">
      {[200, 270, 340].map((r, k) => (
        <m.div key={r} className="absolute top-1/2 left-1/2 rounded-full border border-white/10" style={{ width: r * 1.6, height: r * 1.6, marginLeft: -r * 0.8, marginTop: -r * 0.8 }} animate={{ rotate: k % 2 ? -360 : 360 }} transition={{ duration: 40 + k * 15, repeat: Infinity, ease: "linear" }}>
          <span className={`absolute -top-2 left-1/2 size-4 rounded-full ${k === 0 ? "bg-sun-400" : k === 1 ? "bg-verdi-400" : "bg-sky-400"} shadow-[0_0_20px_currentColor]`} />
        </m.div>
      ))}
      <div className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sun-400/30 blur-2xl" />
    </div>
  );
}
