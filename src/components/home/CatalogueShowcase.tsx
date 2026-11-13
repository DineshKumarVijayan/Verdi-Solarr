import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AnimatePresence, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import type { PublicProduct } from "../../../shared/types";
import { useCatalogue } from "../../lib/catalogue";
import { m, Reveal } from "../motion";

type Visual = { src: string; cutout: boolean }[];
const VISUALS: Record<string, Visual> = {
  "solar-panels": [
    { src: "/images/products/anchor-mono-perc-bifacial.webp", cutout: true },
    { src: "/images/products/anchor-topcon-panels.webp", cutout: false },
  ],
  "solar-inverters": [
    { src: "/images/products/anchor-reno-inverter.webp", cutout: true },
    { src: "/images/products/anchor-stellar-inverter.webp", cutout: true },
    { src: "/images/products/anchor-lumina-inverter.webp", cutout: true },
  ],
  "power-optimisers": [
    { src: "/images/products/solaredge-s-series-optimizer.webp", cutout: true },
    { src: "/images/products/solaredge-hd-wave-inverter.webp", cutout: true },
  ],
  "solar-dc-cables": [{ src: "/images/products/anchor-solar-dc-cable-section.webp", cutout: false }],
  "solar-street-lights": [{ src: "/images/products/anchor-street-light-day.webp", cutout: false }],
};

function highlights(products: PublicProduct[], slug: string): string[] {
  const nums = (k: string) => products.flatMap((p) => p.specs.filter((s) => s.k === k).map((s) => Number(s.v))).filter((n) => !Number.isNaN(n));
  const range = (k: string, unit: string, div = 1) => {
    const n = nums(k);
    if (!n.length) return null;
    const lo = Math.min(...n) / div;
    const hi = Math.max(...n) / div;
    return lo === hi ? `${lo} ${unit}` : `${lo}–${hi} ${unit}`;
  };
  switch (slug) {
    case "solar-panels":
      return [range("power_wp", "Wp"), `up to ${Math.max(...nums("efficiency_pct"))}% efficient`, "Bifacial", "PERC & N-Type TOPCon"].filter(Boolean) as string[];
    case "solar-inverters":
      return [range("ac_power_w", "kW", 1000), `up to ${Math.max(...nums("max_efficiency_pct"))}% max. eff.`, "Single & three phase", "Dual MPPT options"].filter(Boolean) as string[];
    case "power-optimisers":
      return [range("rated_input_w", "W"), "99.5% max. efficiency", "Module-level MPPT", "IP68"].filter(Boolean) as string[];
    case "solar-dc-cables":
      return ["4 & 6 mm²", "Up to 1500 V DC", "IS 17293:2020", "Tinned copper · XLPO"];
    case "solar-street-lights":
      return [range("led_power_w", "W"), "LiFePO4 battery", "Motion sensor", "AIO & Hybrid"].filter(Boolean) as string[];
    default:
      return [];
  }
}

export function CatalogueShowcase() {
  const { data, countByCategory } = useCatalogue();
  const cats = (data?.categories ?? []).filter((c) => (countByCategory.get(c.id) ?? 0) > 0);
  const upcoming = (data?.categories ?? []).filter((c) => (countByCategory.get(c.id) ?? 0) === 0);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = cats[Math.min(i, Math.max(cats.length - 1, 0))];

  useEffect(() => {
    if (paused || cats.length < 2) return;
    const id = setTimeout(() => setI((x) => (x + 1) % cats.length), 5200);
    return () => clearTimeout(id);
  }, [i, paused, cats.length]);

  const products = useMemo(() => (data?.products ?? []).filter((p) => p.categoryId === active?.id), [data, active]);
  const chips = active ? highlights(products, active.slug) : [];
  const visuals = active ? VISUALS[active.slug] ?? [] : [];

  // 3D tilt + spotlight
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-9, 9]), { stiffness: 120, damping: 18 });
  const spot = useMotionTemplate`radial-gradient(420px circle at ${useTransform(px, (v) => `${v * 100}%`)} ${useTransform(py, (v) => `${v * 100}%`)}, rgba(249,162,27,0.22), transparent 60%)`;

  if (!active) return null;
  return (
    <section className="relative overflow-hidden py-20" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">The catalogue</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Everything between the sun and the switchboard.</h2>
          </div>
          <Link to="/products" className="btn-ghost">
            All {data?.products.length} products <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* category rail */}
          <div className="grid content-start gap-2" role="tablist" aria-label="Product categories">
            {cats.map((c, k) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={k === i}
                onClick={() => setI(k)}
                onMouseEnter={() => setI(k)}
                className="group relative overflow-hidden rounded-2xl px-5 py-4 text-left"
              >
                {k === i && <m.span layoutId="cat-active" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                <span className="relative flex items-center gap-4">
                  <span className={`num text-sm ${k === i ? "text-sun-300" : "text-subtle"}`}>{String(k + 1).padStart(2, "0")}</span>
                  <span className="flex-1">
                    <span className={`block text-lg font-semibold transition ${k === i ? "text-paper" : "text-ink group-hover:translate-x-1"}`}>{c.name}</span>
                    <span className={`num block text-xs ${k === i ? "text-paper/60" : "text-muted"}`}>{countByCategory.get(c.id)} models</span>
                  </span>
                  <ArrowUpRight className={`size-5 transition ${k === i ? "rotate-45 text-sun-300" : "text-subtle opacity-0 group-hover:opacity-100"}`} />
                </span>
                {k === i && !paused && <m.span key={`p${i}`} className="absolute bottom-0 left-0 h-0.5 bg-sun-400" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 5.2, ease: "linear" }} />}
              </button>
            ))}
          </div>

          {/* stage */}
          <m.div
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 1400 }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              px.set((e.clientX - r.left) / r.width);
              py.set((e.clientY - r.top) / r.height);
            }}
            onPointerLeave={() => {
              px.set(0.5);
              py.set(0.5);
            }}
            className="relative min-h-[460px] overflow-hidden rounded-[2.2rem] bg-[radial-gradient(120%_100%_at_70%_20%,#183142_0%,#0a1822_60%)] text-paper shadow-[var(--shadow-lift)]"
          >
            <div className="absolute inset-0 grid-bg" aria-hidden="true" />
            <m.div className="absolute inset-0" style={{ background: spot }} aria-hidden="true" />
            {/* giant ghost label */}
            <AnimatePresence mode="wait">
              <m.p
                key={active.slug + "-ghost"}
                className="pointer-events-none absolute -bottom-4 left-6 font-display text-[clamp(3rem,9vw,7.5rem)] leading-none font-bold whitespace-nowrap text-white/[0.05]"
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ duration: 0.6 }}
                aria-hidden="true"
              >
                {active.name}
              </m.p>
            </AnimatePresence>
            {/* orbit ring */}
            <m.div className="absolute top-1/2 right-[18%] size-[380px] -translate-y-1/2 rounded-full border border-dashed border-white/10" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} aria-hidden="true">
              <span className="absolute -top-1.5 left-1/2 size-3 rounded-full bg-sun-400 shadow-[0_0_18px_#f9a21b]" />
            </m.div>

            <div className="relative grid h-full gap-6 p-7 sm:p-10 md:grid-cols-[1fr_1.1fr]">
              <AnimatePresence mode="wait">
                <m.div key={active.slug} className="flex flex-col justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.45 }}>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-sun-300 uppercase">{countByCategory.get(active.id)} models · datasheets included</p>
                  <h3 className="mt-2 text-3xl font-semibold sm:text-4xl">{active.name}</h3>
                  <p className="mt-3 max-w-sm text-paper/70">{active.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {chips.map((c, k) => (
                      <m.span key={c} className="num rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs backdrop-blur" initial={{ opacity: 0, scale: 0.7, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15 + k * 0.08, type: "spring", stiffness: 260, damping: 18 }}>
                        {c}
                      </m.span>
                    ))}
                  </div>
                  <Link to={`/category/${active.slug}`} className="btn-sun mt-7 self-start">
                    Explore {active.name.toLowerCase()} <ArrowRight className="size-4" />
                  </Link>
                </m.div>
              </AnimatePresence>

              <div className="relative min-h-[280px] [transform-style:preserve-3d]">
                <AnimatePresence>
                  {visuals.map((v, k) => {
                    const n = visuals.length;
                    const offset = (k - (n - 1) / 2) * (n > 2 ? 26 : 34);
                    return v.cutout ? (
                      <m.img
                        key={active.slug + v.src}
                        src={v.src}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 m-auto max-h-[78%] max-w-[62%] object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]"
                        style={{ zIndex: n - Math.abs(k - (n - 1) / 2) }}
                        initial={{ opacity: 0, x: 120, rotate: 12, scale: 0.8 }}
                        animate={{ opacity: 1, x: `${offset}%`, rotate: (k - (n - 1) / 2) * 5, scale: k === Math.floor(n / 2) ? 1 : 0.86, y: [0, -10, 0] }}
                        exit={{ opacity: 0, x: -120, rotate: -10, scale: 0.8, transition: { duration: 0.35 } }}
                        transition={{ type: "spring", stiffness: 90, damping: 16, delay: k * 0.08, y: { duration: 4 + k, repeat: Infinity, ease: "easeInOut" } }}
                      />
                    ) : (
                      <m.div
                        key={active.slug + v.src}
                        className="absolute inset-0 m-auto h-[78%] w-[86%] overflow-hidden rounded-3xl border border-white/15 shadow-2xl"
                        style={{ zIndex: k + 1 }}
                        initial={{ opacity: 0, x: 120, rotate: 8 }}
                        animate={{ opacity: 1, x: `${offset * 0.6}%`, rotate: n > 1 ? (k ? 4 : -4) : -3, y: [0, -8, 0] }}
                        exit={{ opacity: 0, x: -120, transition: { duration: 0.35 } }}
                        transition={{ type: "spring", stiffness: 90, damping: 16, delay: k * 0.1, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
                      >
                        <img src={v.src} alt="" loading="lazy" className="size-full object-cover" />
                        <div className="hero-glint absolute inset-0" />
                      </m.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </m.div>
        </div>

        {/* BOS marquee */}
        {upcoming.length > 0 && (
          <Reveal className="marquee mt-8 overflow-hidden rounded-2xl border border-line bg-card py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <div className="marquee-track flex gap-3" style={{ ["--marquee-duration" as string]: "38s" }}>
              {[...upcoming, ...upcoming].map((c, k) => (
                <Link key={k} to={`/category/${c.slug}`} className="chip shrink-0 !px-4 !py-2 !text-sm transition hover:-translate-y-0.5 hover:!border-verdi-500" tabIndex={k >= upcoming.length ? -1 : 0} aria-hidden={k >= upcoming.length}>
                  <span className="size-1.5 rounded-full bg-sun-400" /> {c.name} <span className="text-subtle">· on enquiry</span>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
