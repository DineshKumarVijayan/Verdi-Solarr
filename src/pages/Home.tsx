import { ArrowRight, ArrowUpRight, BookOpen, Calculator, ClipboardList, Droplets, FileText, Flame, Layers, Search, ShieldCheck, Wind } from "lucide-react";
import { useMotionValue, useSpring, useTransform } from "motion/react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { PublicProduct } from "../../shared/types";
import { CountUp, m, Reveal, Stagger, StaggerItem } from "../components/motion";
import { ProductImage } from "../components/ProductVisual";
import { SectionHeading } from "../components/ui";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { useCatalogue } from "../lib/catalogue";
import { usePageMeta } from "../lib/seo";
import { SITE } from "../site";

const QUICK = ["620 Wp TOPCon", "550 Wp", "5 kW three phase", "3 kW single phase", "Optimizer", "6 sq mm"];

const CATEGORY_IMAGE: Record<string, string> = {
  "solar-panels": "/images/site/metal-roof-install.webp",
  "solar-inverters": "/images/site/inverter-installation-1.webp",
  "power-optimisers": "/images/products/solaredge-s-series-optimizer.webp",
  "solar-dc-cables": "/images/products/anchor-solar-dc-cable-section.webp",
  "solar-street-lights": "/images/products/anchor-street-light-night.webp",
};

const FIELD = [
  { src: "/images/site/rooftop-elevated-structure.webp", caption: "Elevated rooftop structure", cls: "row-span-2" },
  { src: "/images/site/inverter-installation-2.webp", caption: "Anchor inverter with DC & AC junction boxes", cls: "" },
  { src: "/images/site/metal-roof-clamp.webp", caption: "Mounting on a metal-sheet roof", cls: "row-span-2" },
  { src: "/images/site/acdb-boxes.webp", caption: "Solar ACDB enclosures", cls: "" },
  { src: "/images/site/rooftop-chennai.webp", caption: "Residential rooftop array, Chennai", cls: "sm:col-span-2" },
  { src: "/images/site/anchor-module-pallets.webp", caption: "Anchor by Panasonic modules, palletised", cls: "row-span-2" },
];

const HEADLINE = ["Solar", "hardware,", "specified", "to", "the", "last", "volt."];

export default function Home() {
  usePageMeta(
    "VERDI SOLARR SOLUTION — Solar panels, inverters & solar electricals for businesses",
    "B2B supplier of solar panels, inverters, solar DC cables and solar electrical components in Chennai. Browse real datasheets, compare specifications and send a WhatsApp enquiry.",
  );
  const { data, countByCategory, brand } = useCatalogue();
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const series = useMemo(() => {
    const mp = new Map<string, PublicProduct[]>();
    for (const p of data?.products ?? []) {
      const k = p.seriesKey ?? String(p.id);
      if (!mp.has(k)) mp.set(k, []);
      mp.get(k)!.push(p);
    }
    return [...mp.values()];
  }, [data]);

  const datasheetCount = new Set((data?.products ?? []).map((p) => p.datasheet).filter(Boolean)).size;
  const stats = [
    { k: "Product models", v: data?.products.length ?? 45 },
    { k: "Manufacturer datasheets", v: datasheetCount || 10 },
    { k: "Brands", v: data?.brands.length ?? 2 },
    { k: "Product categories", v: data?.categories.length ?? 15 },
  ];
  const cats = data?.categories ?? [];
  const stocked = cats.filter((c) => (countByCategory.get(c.id) ?? 0) > 0);
  const upcoming = cats.filter((c) => (countByCategory.get(c.id) ?? 0) === 0);

  // pointer parallax for the hero showcase
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const frameX = useTransform(sx, (v) => v * -10);
  const frameY = useTransform(sy, (v) => v * -10);
  const floatX = useTransform(sx, (v) => v * 22);
  const floatY = useTransform(sy, (v) => v * 22);

  return (
    <>
      {/* ------------------------------------------------------------- HERO */}
      <section
        className="relative isolate overflow-hidden bg-ink text-paper"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
      >
        <m.img
          src="/images/site/rooftop-chennai.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 size-full object-cover opacity-55"
          initial={{ scale: 1.18 }}
          animate={{ scale: 1.04 }}
          transition={{ duration: 18, ease: "easeOut" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(10,24,34,0.97)_0%,rgba(10,24,34,0.88)_42%,rgba(10,24,34,0.55)_70%,rgba(10,24,34,0.75)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_85%_10%,rgba(249,162,27,0.28),transparent_60%)]" />
        <div className="hero-sweep absolute inset-0 -z-10" aria-hidden="true" />

        <div className="container-x relative grid items-center gap-12 pt-14 pb-14 lg:min-h-[640px] lg:grid-cols-[1.08fr_1fr] lg:pt-16">
          <div>
            <m.p className="eyebrow !text-verdi-300" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              B2B solar supply · Chennai, Tamil Nadu
            </m.p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.02] font-semibold sm:text-6xl lg:text-[4.3rem]">
              {HEADLINE.map((w, i) => (
                <m.span
                  key={i}
                  className={`mr-[0.22em] inline-block ${w === "specified" ? "bg-linear-to-r from-sun-300 to-sun-500 bg-clip-text text-transparent" : ""}`}
                  initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  {w}
                </m.span>
              ))}
            </h1>
            <m.p className="mt-6 max-w-xl text-base leading-relaxed text-paper/75 sm:text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              Anchor by Panasonic and SolarEdge modules, inverters, optimisers and solar electricals for dealers, installers and EPC teams. Every model comes with its real manufacturer datasheet. Build an enquiry and confirm it on WhatsApp.
            </m.p>
            <m.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] p-1.5 pl-5 backdrop-blur-md focus-within:border-verdi-300"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                nav(`/products${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
              }}
            >
              <Search className="size-5 shrink-0 text-paper/50" />
              <label htmlFor="hero-q" className="sr-only">
                Search products
              </label>
              <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “620 Wp” or “5 kW three phase”" className="min-w-0 flex-1 bg-transparent py-2 text-base text-paper outline-none placeholder:text-paper/45" />
              <button className="btn-sun" type="submit">
                Search
              </button>
            </m.form>
            <m.div className="mt-4 flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              {QUICK.map((s) => (
                <Link key={s} to={`/products?q=${encodeURIComponent(s)}`} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-paper/75 backdrop-blur transition hover:border-white/40 hover:text-paper">
                  {s}
                </Link>
              ))}
            </m.div>
            <m.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
              <Link to="/products" className="btn-primary">
                Browse catalogue <ArrowRight className="size-4" />
              </Link>
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener" className="btn-ghost-dark">
                <WhatsAppIcon className="size-4" /> WhatsApp {SITE.phoneDisplay}
              </a>
            </m.div>
          </div>

          {/* showcase: real photo + floating HD product cut-outs */}
          <div className="relative mx-auto hidden w-full max-w-[520px] sm:block" aria-hidden="true">
            <m.div style={{ x: frameX, y: frameY }} initial={{ opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.3, duration: 0.9 }} className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] border border-white/15 shadow-2xl">
              <m.img src="/images/site/rooftop-elevated-structure.webp" alt="" className="size-full object-cover" animate={{ scale: [1.02, 1.12, 1.02] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
              <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent" />
              <div className="hero-glint absolute inset-0" />
              <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-paper/60 uppercase">In the field</p>
                  <p className="text-lg font-semibold">Elevated rooftop array</p>
                </div>
                <span className="rounded-full bg-sun-400 px-3 py-1 text-xs font-bold text-ink">Chennai</span>
              </div>
            </m.div>
            <m.div style={{ x: floatX, y: floatY }} className="absolute -bottom-10 -left-14 w-[46%]">
              <m.img
                src="/images/products/anchor-stellar-inverter.webp"
                alt=""
                className="w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0, y: [0, -12, 0] }}
                transition={{ opacity: { delay: 0.8 }, x: { delay: 0.8, duration: 0.8 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
              />
            </m.div>
            <m.div
              style={{ x: floatX, y: floatY }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="absolute -top-6 -right-6 flex w-60 items-center gap-3 rounded-2xl border border-white/15 bg-ink/70 p-3 backdrop-blur-xl"
            >
              <img src="/images/products/anchor-topcon-panels.webp" alt="" className="size-14 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-semibold">N-Type TOPCon</p>
                <p className="num text-xs text-paper/70">600–630 Wp · up to 23.32%</p>
              </div>
            </m.div>
            <m.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.35 }} className="absolute top-[38%] -right-8 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
              <p className="font-mono text-[10px] tracking-[0.16em] text-paper/60 uppercase">Max. efficiency</p>
              <p className="num text-2xl text-sun-300">98.6%</p>
              <p className="text-[11px] text-paper/60">Stellar 8–15 kW</p>
            </m.div>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-ink/40 backdrop-blur">
          <dl className="container-x grid grid-cols-2 divide-white/10 sm:grid-cols-4 sm:divide-x">
            {stats.map((s) => (
              <div key={s.k} className="px-1 py-6 sm:px-6">
                <dt className="font-mono text-[10px] tracking-[0.16em] text-paper/50 uppercase">{s.k}</dt>
                <dd className="num mt-1 text-3xl text-paper">
                  <CountUp to={s.v} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------- CATEGORIES */}
      <section className="container-x py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="The catalogue" title="Everything between the sun and the switchboard." intro="Browse by category. Every listed model links to its manufacturer datasheet." />
          <Link to="/products" className="btn-ghost">
            All products <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <Stagger className="mt-10 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stocked.map((c, i) => {
            const img = CATEGORY_IMAGE[c.slug];
            const cutout = img?.includes("optimizer.");
            return (
              <StaggerItem key={c.id} className={i === 0 ? "sm:col-span-2 sm:row-span-2" : stocked.length % 2 === 0 && i === stocked.length - 1 ? "sm:col-span-2" : ""}>
                <Link to={`/category/${c.slug}`} className="group relative flex h-full flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-ink p-5 text-paper shadow-[var(--shadow-soft)]">
                  {img && (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className={`absolute inset-0 size-full transition duration-700 ease-out group-hover:scale-110 ${cutout ? "bg-[radial-gradient(circle_at_50%_30%,#fff,#dfe7da)] object-contain p-10" : "object-cover"}`}
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-transparent opacity-90 transition group-hover:opacity-100" />
                  <div className="relative">
                    <p className="num text-xs text-paper/60">{String(i + 1).padStart(2, "0")} · {countByCategory.get(c.id)} models</p>
                    <h3 className={`mt-1 font-semibold ${i === 0 ? "text-3xl" : "text-xl"}`}>{c.name}</h3>
                    <p className="mt-1 max-w-sm text-sm text-paper/70">{c.description}</p>
                  </div>
                  <span className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white/15 backdrop-blur transition group-hover:rotate-45 group-hover:bg-sun-400 group-hover:text-ink">
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
        {upcoming.length > 0 && (
          <Reveal className="mt-6 grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-card md:grid-cols-[280px_1fr]">
            <img src="/images/site/acdb-boxes.webp" alt="Solar ACDB enclosures" loading="lazy" className="h-44 w-full object-cover md:h-full" />
            <div className="p-6">
              <p className="font-semibold">Balance-of-system parts, supplied on enquiry</p>
              <p className="mt-1 text-sm text-muted">Detailed listings for these categories are being added. Ask us about current availability.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {upcoming.map((c) => (
                  <Link key={c.id} to={`/category/${c.slug}`} className="chip transition hover:-translate-y-0.5">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* ----------------------------------------------------- SERIES RAIL */}
      <section className="border-y border-line/70 bg-paper-2/60 py-20">
        <Reveal className="container-x">
          <SectionHeading eyebrow="Product families" title="One datasheet, every rating." intro="Each family is listed variant by variant, so every model has its own price and specification." />
        </Reveal>
        <div className="container-x mt-10">
          <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
            {series.map((group, gi) => {
              const p = group[0];
              const variants = group.map((g) => g.variant).filter(Boolean);
              return (
                <m.div key={p.seriesKey ?? p.id} className="w-[78%] shrink-0 snap-start sm:w-[320px]" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: gi * 0.06 }}>
                  <Link to={`/products/${p.slug}`} className="group card flex h-full flex-col p-3 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                    {p.images[0] ? <ProductImage url={p.images[0].url} alt={p.images[0].alt ?? p.name} /> : <div className="aspect-[4/3] rounded-2xl bg-paper-2" />}
                    <div className="flex flex-1 flex-col p-2 pt-4">
                      <p className="eyebrow !text-[0.62rem] !text-muted">{brand(p.brandId)?.name}</p>
                      <h3 className="mt-1.5 font-semibold">{p.seriesName}</h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted">{p.short}</p>
                      <p className="num mt-auto pt-4 text-xs text-verdi-700">
                        {group.length} {group.length === 1 ? "model" : "models"} · {variants[0]}
                        {variants.length > 1 ? ` – ${variants[variants.length - 1]}` : ""}
                      </p>
                    </div>
                  </Link>
                </m.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- IN THE FIELD */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeading eyebrow="In the field" title="Hardware that lives on Indian rooftops." intro="Heat, monsoon rain, coastal air. Here is how these products look installed and in stock." />
        </Reveal>
        <Stagger className="mt-10 grid grid-flow-row-dense auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[210px] lg:grid-cols-4">
          {FIELD.map((f) => (
            <StaggerItem key={f.src} className={f.cls}>
              <figure className="group relative h-full overflow-hidden rounded-2xl bg-ink">
                <img src={f.src} alt={f.caption} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-110" />
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-linear-to-t from-ink/90 to-transparent p-3 pt-10 text-sm font-medium text-paper opacity-90 transition group-hover:translate-y-0 group-hover:opacity-100">
                  {f.caption}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------------------------------------------------- QUALITY */}
      <section className="relative overflow-hidden bg-ink py-20 text-paper">
        <div className="absolute inset-0 grid-bg" aria-hidden="true" />
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading dark eyebrow="Manufacturer quality testing" title="Tested beyond the standard." intro="Panasonic publishes details of extra testing on its solar modules. Here is what they state." />
            <ul className="mt-8 grid gap-4">
              {[
                { icon: Droplets, t: "Extended wet leakage test", d: "Modules submerged for 24 hours, against an industry practice of 1–2 hours, to verify insulation under moisture." },
                { icon: Flame, t: "Glow wire test at 900–1000 °C", d: "Glass, junction box and connector materials tested above the typical 750–850 °C (IEC 60695-2)." },
                { icon: Wind, t: "Extended wind load at 3800 Pa", d: "Mechanical robustness tested above the 2400 Pa commonly used." },
              ].map((x, i) => (
                <m.li key={x.t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                  <x.icon className="mt-0.5 size-5 shrink-0 text-sky-300" />
                  <div>
                    <p className="font-semibold">{x.t}</p>
                    <p className="mt-0.5 text-sm text-paper/65">{x.d}</p>
                  </div>
                </m.li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-paper/45">Source: Panasonic Life Solutions India product safety & quality brochure.</p>
          </Reveal>
          <div className="relative grid grid-cols-2 gap-4">
            <m.img src="/images/site/panasonic-wet-leakage-test.webp" alt="Solar module undergoing an extended wet leakage test in a water tank" loading="lazy" className="aspect-[4/5] w-full rounded-3xl object-cover" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
            <m.img src="/images/site/panasonic-monsoon-rooftop.webp" alt="Solar modules on a rooftop in monsoon rain" loading="lazy" className="mt-12 aspect-[4/5] w-full rounded-3xl object-cover" initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- HOW IT WORKS */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeading eyebrow="How enquiries work" title="From shortlist to quotation in three steps." align="center" />
        </Reveal>
        <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: Layers, t: "Shortlist", d: "Search by wattage, kW, phase or model. Open the actual manufacturer datasheet without leaving the page." },
            { icon: ClipboardList, t: "Build your enquiry", d: "Add products and quantities. We re-check every listed price against our live database before you send." },
            { icon: WhatsAppIcon, t: "Confirm on WhatsApp", d: "Review a ready-made message and send it to us on WhatsApp. We confirm final pricing, taxes, availability and delivery." },
          ].map((s, i) => (
            <StaggerItem key={s.t}>
              <div className="card relative h-full p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <span className="num absolute top-5 right-6 text-5xl text-paper-3">{i + 1}</span>
                <s.icon className="size-6 text-verdi-600" />
                <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* -------------------------------------------------- TOOLS / LEARN */}
      <section className="container-x grid gap-4 pb-20 lg:grid-cols-2">
        <Reveal>
          <Link to="/solar-tools" className="group relative block h-full overflow-hidden rounded-[2rem] bg-ink p-8 text-paper sm:p-10">
            <img src="/images/site/metal-roof-rails.webp" alt="" className="absolute inset-0 size-full object-cover opacity-25 transition duration-700 group-hover:scale-105" />
            <div className="relative">
              <Calculator className="size-7 text-sun-400" />
              <h2 className="mt-5 text-3xl font-semibold">Solar tools that do the maths.</h2>
              <p className="mt-3 max-w-md text-paper/70">Appliance load, system size, savings, roof fit, battery backup, losses and a kit builder that uses real catalogue products. Everything runs in your browser.</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sun-300">
                Open the toolkit <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <Link to="/learn" className="group relative block h-full overflow-hidden rounded-[2rem] border border-line bg-verdi-50 p-8 sm:p-10">
            <BookOpen className="size-7 text-verdi-600" />
            <h2 className="mt-5 text-3xl font-semibold">Learn solar, visually.</h2>
            <p className="mt-3 max-w-md text-muted">Animated lessons on solar cells, TOPCon vs PERC, MPPT, half-cut cells, bifacial gain, cable losses, earthing, PM Surya Ghar and more.</p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-verdi-700">
              Visit the Learning Hub <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </Reveal>
      </section>

      {/* ------------------------------------------------------ TRUST BAND */}
      <section className="border-t border-line/70 bg-card">
        <Stagger className="container-x grid gap-8 py-14 md:grid-cols-3">
          {[
            { icon: FileText, t: "Real datasheets", d: "Specifications are transcribed from manufacturer PDFs, and you can open the original in one click." },
            { icon: ShieldCheck, t: "Honest pricing", d: "Listed prices come from our live database and are re-checked before every enquiry. Final quotes are confirmed by our team." },
            { icon: WhatsAppIcon, t: "Talk to a person", d: `Speak to ${SITE.contactPerson} on ${SITE.phoneDisplay} or WhatsApp for project quantities and delivery.` },
          ].map((x) => (
            <StaggerItem key={x.t}>
              <div className="flex gap-4">
                <x.icon className="mt-1 size-5 shrink-0 text-verdi-600" />
                <div>
                  <h3 className="font-semibold">{x.t}</h3>
                  <p className="mt-1 text-sm text-muted">{x.d}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
