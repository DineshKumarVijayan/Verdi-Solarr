import { ArrowRight, Search } from "lucide-react";
import { AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSite } from "../../lib/site";
import { CountUp, m } from "../motion";
import { WhatsAppIcon } from "../WhatsAppIcon";

const HEADLINE = ["Solar", "hardware,", "specified", "to", "the", "last", "volt."];
const QUICK = ["620 Wp TOPCon", "550 Wp", "5 kW three phase", "3 kW single phase", "Optimizer", "6 sq mm"];
const SHOWCASE = [
  { img: "/images/products/anchor-stellar-inverter.webp", name: "Anchor Stellar", spec: "3–15 kW · three phase · 98.6% max.", to: "/products?q=stellar" },
  { img: "/images/products/anchor-reno-inverter.webp", name: "Anchor RENO", spec: "1–3.3 kW · single phase · IP65", to: "/products?q=reno" },
  { img: "/images/products/anchor-mono-perc-bifacial.webp", name: "Mono PERC bifacial", spec: "540–555 Wp · up to 21.52%", to: "/products?q=perc" },
  { img: "/images/products/solaredge-s-series-optimizer.webp", name: "SolarEdge S-Series", spec: "440–650 W optimisers · 99.5%", to: "/products?q=optimizer" },
  { img: "/images/products/anchor-lumina-inverter.webp", name: "Anchor Lumina", spec: "20–25 kW · export control", to: "/products?q=lumina" },
];

// dust motes (deterministic positions so SSR/prerender & client agree)
const MOTES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 53) % 100}%`,
  top: `${55 + ((i * 29) % 40)}%`,
  size: 2 + (i % 3),
  d: `${7 + (i % 5) * 1.6}s`,
  delay: `${(i % 7) * 0.9}s`,
  dx: `${((i % 2 ? 1 : -1) * (20 + (i % 4) * 15))}px`,
}));

export function Hero({ stats }: { stats: { k: string; v: number }[] }) {
  const SITE = useSite();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % SHOWCASE.length), 3600);
    return () => clearInterval(id);
  }, []);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const bgX = useTransform(sx, (v) => v * -18);
  const bgY = useTransform(sy, (v) => v * -10);
  const cardX = useTransform(sx, (v) => v * 16);
  const cardY = useTransform(sy, (v) => v * 16);
  const item = SHOWCASE[idx];

  return (
    <section
      className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-ink text-paper"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      {/* HD photograph: aerial solar farm at golden hour (mirrored so the sun sits behind the content's right side) */}
      <m.div className="absolute -inset-6 -z-30" style={{ x: bgX, y: bgY }}>
        <m.picture initial={{ scale: 1.22, opacity: 0 }} animate={{ scale: 1.04, opacity: 1 }} transition={{ scale: { duration: 14, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 1.4 } }} className="block size-full">
          <source media="(max-width: 640px)" srcSet="/media/hero-solar-farm-golden-1200.webp" />
          <img src="/media/hero-solar-farm-golden-2400.webp" alt="" fetchPriority="high" className="size-full -scale-x-100 object-cover object-[center_60%]" />
        </m.picture>
      </m.div>
      {/* sun glow + rotating rays at the sun's position */}
      <div className="pointer-events-none absolute top-[27%] left-[57%] -z-20 hidden size-[900px] -translate-x-1/2 -translate-y-1/2 sm:block" aria-hidden="true">
        <div className="sun-rays absolute inset-0 rounded-full" />
        <m.div className="absolute inset-[38%] rounded-full bg-[radial-gradient(circle,rgba(255,236,190,0.9),rgba(249,162,27,0.35)_45%,transparent_70%)] mix-blend-screen" animate={{ scale: [1, 1.15, 1], opacity: [0.75, 1, 0.75] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
      </div>
      {/* panel glint sweep */}
      <div className="pointer-events-none absolute inset-x-[20%] top-[66%] bottom-[4%] -z-20 overflow-hidden mix-blend-screen" aria-hidden="true">
        <div className="hero-glint absolute inset-0 opacity-80" />
      </div>
      {/* dust motes */}
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        {MOTES.map((p, i) => (
          <span
            key={i}
            className="mote absolute rounded-full bg-sun-200/80 blur-[0.5px]"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size, ["--d" as string]: p.d, ["--delay" as string]: p.delay, ["--dx" as string]: p.dx }}
          />
        ))}
      </div>
      {/* legibility gradients */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,24,34,0.92)_0%,rgba(10,24,34,0.72)_38%,rgba(10,24,34,0.15)_68%,rgba(10,24,34,0.1)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-ink/35 xl:hidden" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,24,34,0.55)_0%,transparent_22%,transparent_60%,rgba(10,24,34,0.95)_100%)]" />

      <div className="container-x relative flex flex-1 items-center py-14">
        <div className="grid w-full items-end gap-10 xl:grid-cols-[1.25fr_1fr]">
          <div>
            <m.p className="eyebrow !text-sun-300" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              B2B solar supply · Chennai, Tamil Nadu
            </m.p>
            <h1 className="mt-4 text-[2.7rem] leading-[1.02] font-semibold drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-[4.6rem]">
              {HEADLINE.map((w, i) => (
                <m.span
                  key={i}
                  className={`mr-[0.22em] inline-block ${w === "specified" ? "bg-linear-to-r from-sun-200 via-sun-300 to-sun-500 bg-clip-text text-transparent [filter:drop-shadow(0_2px_14px_rgba(0,0,0,0.75))]" : ""}`}
                  initial={{ opacity: 0, y: 36, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.45 + i * 0.08, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  {w}
                </m.span>
              ))}
            </h1>
            <m.p className="mt-6 max-w-xl text-base leading-relaxed text-paper/80 sm:text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
              Anchor by Panasonic and SolarEdge modules, inverters, optimisers and solar electricals for dealers, installers and EPC teams, with real manufacturer datasheets for every model.
            </m.p>
            <m.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25 }}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-white/20 bg-ink/40 p-1.5 pl-5 shadow-2xl backdrop-blur-xl focus-within:border-sun-300"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                nav(`/products${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
              }}
            >
              <Search className="size-5 shrink-0 text-paper/60" />
              <label htmlFor="hero-q" className="sr-only">
                Search products
              </label>
              <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “620 Wp” or “5 kW three phase”" className="min-w-0 flex-1 bg-transparent py-2 text-base text-paper outline-none placeholder:text-paper/50" />
              <button className="btn-sun" type="submit">
                Search
              </button>
            </m.form>
            <m.div className="mt-4 flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
              {QUICK.map((s) => (
                <Link key={s} to={`/products?q=${encodeURIComponent(s)}`} className="rounded-full border border-white/20 bg-ink/30 px-3 py-1 text-xs text-paper/85 backdrop-blur transition hover:border-sun-300 hover:text-paper">
                  {s}
                </Link>
              ))}
            </m.div>
            <m.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              <Link to="/products" className="btn-sun">
                Browse catalogue <ArrowRight className="size-4" />
              </Link>
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener" className="btn-ghost-dark backdrop-blur">
                <WhatsAppIcon className="size-4" /> WhatsApp {SITE.phoneDisplay}
              </a>
            </m.div>
          </div>

          {/* floating glass product card cycling through real product cut-outs */}
          <m.div style={{ x: cardX, y: cardY }} className="hidden justify-self-end xl:block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.9 }}>
            <Link to={item.to} className="group block w-[340px] rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl transition hover:bg-white/15">
              <div className="relative h-56">
                <div className="absolute inset-x-10 bottom-2 h-6 rounded-[50%] bg-black/40 blur-xl" />
                <AnimatePresence mode="wait">
                  <m.img
                    key={item.img}
                    src={item.img}
                    alt={item.name}
                    className="absolute inset-0 m-auto max-h-full max-w-[85%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                    initial={{ opacity: 0, y: 30, rotate: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: [0, -8, 0], rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.92, transition: { duration: 0.25 } }}
                    transition={{ opacity: { duration: 0.4 }, rotate: { duration: 0.6 }, scale: { duration: 0.6 }, y: { duration: 3.2, ease: "easeInOut" } }}
                  />
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                <m.div key={item.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-sun-200 uppercase">In the catalogue</p>
                  <p className="mt-1 text-lg font-semibold">{item.name}</p>
                  <p className="num text-xs text-paper/70">{item.spec}</p>
                </m.div>
              </AnimatePresence>
              <div className="mt-4 flex gap-1.5">
                {SHOWCASE.map((s, k) => (
                  <span key={s.name} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                    {k === idx && <m.span className="block h-full bg-sun-300" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3.6, ease: "linear" }} />}
                    {k < idx && <span className="block h-full bg-sun-300/60" />}
                  </span>
                ))}
              </div>
            </Link>
          </m.div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-ink/50 backdrop-blur-md">
        <dl className="container-x grid grid-cols-2 divide-white/10 sm:grid-cols-4 sm:divide-x">
          {stats.map((s) => (
            <div key={s.k} className="px-1 py-5 sm:px-6">
              <dt className="font-mono text-[10px] tracking-[0.16em] text-paper/55 uppercase">{s.k}</dt>
              <dd className="num mt-1 text-3xl text-paper">
                <CountUp to={s.v} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
