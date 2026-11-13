import { ArrowRight, ArrowUpRight, BookOpen, Calculator, ClipboardList, FileText, Layers, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { EnergyFlow } from "../components/EnergyFlow";
import { ProductVisual } from "../components/ProductVisual";
import { SectionHeading } from "../components/ui";
import { useCatalogue } from "../lib/catalogue";
import { usePageMeta } from "../lib/seo";
import { SITE } from "../site";
import type { PublicProduct } from "../../shared/types";

const QUICK = ["620 Wp TOPCon", "550 Wp", "5 kW three phase", "3 kW single phase", "Optimizer", "6 sq mm"];

export default function Home() {
  usePageMeta(
    "VERDI SOLARR SOLUTION — Solar panels, inverters & solar electricals for businesses",
    "B2B supplier of solar panels, inverters, solar DC cables and solar electrical components in Chennai. Browse real datasheets, compare specifications and send a WhatsApp enquiry.",
  );
  const { data, countByCategory, brand, category } = useCatalogue();
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const series = useMemo(() => {
    const m = new Map<string, PublicProduct[]>();
    for (const p of data?.products ?? []) {
      const k = p.seriesKey ?? String(p.id);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(p);
    }
    return [...m.values()];
  }, [data]);

  const datasheetCount = new Set((data?.products ?? []).map((p) => p.datasheet).filter(Boolean)).size;
  const stats = [
    { k: "Product models", v: data ? String(data.products.length) : "—" },
    { k: "Manufacturer datasheets", v: data ? String(datasheetCount) : "—" },
    { k: "Brands", v: data ? String(data.brands.length) : "—" },
    { k: "Product categories", v: data ? String(data.categories.length) : "—" },
  ];

  const cats = data?.categories ?? [];
  const stocked = cats.filter((c) => (countByCategory.get(c.id) ?? 0) > 0);
  const upcoming = cats.filter((c) => (countByCategory.get(c.id) ?? 0) === 0);

  return (
    <>
      {/* ----------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 grid-bg" aria-hidden="true" />
        <div className="absolute -top-40 right-[-10%] size-[620px] rounded-full bg-verdi-500/15 blur-3xl" aria-hidden="true" />
        <div className="container-x relative grid items-center gap-12 pt-14 pb-16 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-24">
          <div className="animate-rise">
            <p className="eyebrow !text-verdi-300">B2B solar supply · Chennai, Tamil Nadu</p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.02] font-semibold sm:text-6xl lg:text-[4.2rem]">
              Solar hardware, <span className="text-sun-400">specified</span> to the last volt.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg">
              Modules, inverters, optimisers and solar electricals for dealers, installers and EPC teams. Every model comes with its real manufacturer datasheet. Build an enquiry and confirm it on WhatsApp.
            </p>
            <form
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] p-1.5 pl-5 focus-within:border-verdi-300"
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
              <input
                id="hero-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try “620 Wp” or “5 kW three phase”"
                className="min-w-0 flex-1 bg-transparent py-2 text-base text-paper outline-none placeholder:text-paper/40"
              />
              <button className="btn-sun" type="submit">
                Search
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK.map((s) => (
                <Link key={s} to={`/products?q=${encodeURIComponent(s)}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-paper/70 transition hover:border-white/30 hover:text-paper">
                  {s}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative rounded-[2rem] border border-white/10 bg-ink-2/80 p-5 shadow-2xl sm:p-7">
            <EnergyFlow />
          </div>
        </div>
        <div className="relative border-t border-white/10">
          <dl className="container-x grid grid-cols-2 divide-white/10 sm:grid-cols-4 sm:divide-x">
            {stats.map((s) => (
              <div key={s.k} className="px-1 py-6 sm:px-6">
                <dt className="font-mono text-[10px] tracking-[0.16em] text-paper/45 uppercase">{s.k}</dt>
                <dd className="num mt-1 text-3xl text-paper">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------ CATEGORIES */}
      <section className="container-x py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="The catalogue" title="Everything between the sun and the switchboard." intro="Browse by category. Every listed model links to its manufacturer datasheet." />
          <Link to="/products" className="btn-ghost">
            All products <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stocked.map((c, i) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className={`group card relative flex flex-col justify-between overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
            >
              <div>
                <p className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</p>
                <h3 className={`mt-2 font-semibold ${i === 0 ? "text-3xl" : "text-xl"}`}>{c.name}</h3>
                <p className="mt-2 text-sm text-muted">{c.description}</p>
              </div>
              {i === 0 && (
                <svg viewBox="0 0 260 120" className="pointer-events-none mt-6 w-full max-w-md self-end text-ink" aria-hidden="true">
                  {Array.from({ length: 3 }).map((_, r) =>
                    Array.from({ length: 6 }).map((_, k) => (
                      <g key={`${r}${k}`} transform={`translate(${k * 42 + r * 8} ${r * 38}) skewX(-12)`}>
                        <rect width="38" height="34" rx="2" fill="#1d3b5c" opacity={0.55 + ((r + k) % 3) * 0.15} />
                        <path d="M0 11.3H38M0 22.6H38M12.6 0V34M25.3 0V34" stroke="#fffdf8" strokeOpacity="0.18" />
                      </g>
                    )),
                  )}
                  <circle cx="246" cy="14" r="10" fill="#f5ad2e" />
                </svg>
              )}
              <div className="mt-6 flex items-center justify-between">
                <span className="num text-sm text-verdi-700">{countByCategory.get(c.id)} models</span>
                <ArrowUpRight className="size-5 text-subtle transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
              </div>
            </Link>
          ))}
        </div>
        {upcoming.length > 0 && (
          <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-line p-5">
            <p className="text-sm font-semibold">Also supplied on enquiry</p>
            <p className="mt-1 text-xs text-muted">Detailed listings for these categories are being added. Ask us about current availability.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {upcoming.map((c) => (
                <Link key={c.id} to={`/category/${c.slug}`} className="chip">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- SERIES RAIL */}
      <section className="border-y border-line/70 bg-paper-2/60 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Product families" title="One datasheet, every rating." intro="Each family is listed variant by variant, so every model has its own price and specification." />
        </div>
        <div className="container-x mt-10">
          <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
            {series.map((group) => {
              const p = group[0];
              const variants = group.map((g) => g.variant).filter(Boolean);
              return (
                <Link key={p.seriesKey ?? p.id} to={`/products/${p.slug}`} className="group card flex w-[78%] shrink-0 snap-start flex-col p-3 sm:w-[340px]">
                  <ProductVisual product={p} categorySlug={category(p.categoryId)?.slug ?? ""} />
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
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- HOW IT WORKS */}
      <section className="container-x py-20">
        <SectionHeading eyebrow="How enquiries work" title="From shortlist to quotation in three steps." align="center" />
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: Layers, t: "Shortlist", d: "Search by wattage, kW, phase or model. Open the actual manufacturer datasheet without leaving the page." },
            { icon: ClipboardList, t: "Build your enquiry", d: "Add products and quantities. We re-check every listed price against our live database before you send." },
            { icon: MessageCircle, t: "Confirm on WhatsApp", d: "Review a ready-made message and send it to us on WhatsApp. We confirm final pricing, taxes, availability and delivery." },
          ].map((s, i) => (
            <li key={s.t} className="card relative p-6">
              <span className="num absolute top-5 right-6 text-5xl text-paper-3">{i + 1}</span>
              <s.icon className="size-6 text-verdi-600" />
              <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* -------------------------------------------------- TOOLS / LEARN */}
      <section className="container-x grid gap-4 pb-20 lg:grid-cols-2">
        <Link to="/solar-tools" className="group relative overflow-hidden rounded-[2rem] bg-ink p-8 text-paper sm:p-10">
          <div className="absolute inset-0 grid-bg" aria-hidden="true" />
          <div className="relative">
            <Calculator className="size-7 text-sun-400" />
            <h2 className="mt-5 text-3xl font-semibold">Solar tools that do the maths.</h2>
            <p className="mt-3 max-w-md text-paper/65">Appliance load, system size, savings, roof fit, battery backup, losses and a kit builder that uses real catalogue products. Everything runs in your browser.</p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sun-300">
              Open the toolkit <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
        <Link to="/learn" className="group relative overflow-hidden rounded-[2rem] border border-line bg-verdi-50 p-8 sm:p-10">
          <BookOpen className="size-7 text-verdi-600" />
          <h2 className="mt-5 text-3xl font-semibold">Learn solar, visually.</h2>
          <p className="mt-3 max-w-md text-muted">TOPCon vs PERC, MPPT, reading a datasheet, ACDB vs DCDB, earthing and degradation, with interactive diagrams instead of long articles.</p>
          <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-verdi-700">
            Visit the Learning Hub <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      {/* ------------------------------------------------------ TRUST BAND */}
      <section className="border-t border-line/70 bg-card">
        <div className="container-x grid gap-8 py-14 md:grid-cols-3">
          {[
            { icon: FileText, t: "Real datasheets", d: "Specifications are transcribed from manufacturer PDFs, and you can open the original in one click." },
            { icon: ShieldCheck, t: "Honest pricing", d: "Listed prices come from our live database and are re-checked before every enquiry. Final quotes are confirmed by our team." },
            { icon: MessageCircle, t: "Talk to a person", d: `Speak to ${SITE.contactPerson} on ${SITE.phoneDisplay} or WhatsApp for project quantities and delivery.` },
          ].map((x) => (
            <div key={x.t} className="flex gap-4">
              <x.icon className="mt-1 size-5 shrink-0 text-verdi-600" />
              <div>
                <h3 className="font-semibold">{x.t}</h3>
                <p className="mt-1 text-sm text-muted">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
