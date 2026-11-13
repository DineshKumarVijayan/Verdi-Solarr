import { ArrowRight, BookOpen, Calculator, ClipboardList, FileText, Layers, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import type { PublicProduct } from "../../shared/types";
import { CatalogueShowcase } from "../components/home/CatalogueShowcase";
import { Hero } from "../components/home/Hero";
import { VideoBand } from "../components/home/VideoBand";
import { m, Reveal, Stagger, StaggerItem } from "../components/motion";
import { ProductImage } from "../components/ProductVisual";
import { SectionHeading } from "../components/ui";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { useCatalogue } from "../lib/catalogue";
import { usePageMeta } from "../lib/seo";
import { SITE } from "../site";

export default function Home() {
  usePageMeta(
    "VERDI SOLARR SOLUTION — Solar panels, inverters & solar electricals for businesses",
    "B2B supplier of solar panels, inverters, solar DC cables and solar electrical components in Chennai. Browse real datasheets, compare specifications and send a WhatsApp enquiry.",
  );
  const { data, brand } = useCatalogue();

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

  return (
    <>
      <Hero stats={stats} />
      <CatalogueShowcase />

      {/* product families rail */}
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
                <m.div key={p.seriesKey ?? p.id} className="w-[78%] shrink-0 snap-start sm:w-[300px]" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: gi * 0.06 }}>
                  <Link to={`/products/${p.slug}`} className="group card flex h-full flex-col p-3 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                    {p.images[0] ? <ProductImage url={p.images[0].url} alt={p.images[0].alt ?? p.name} /> : <div className="aspect-[4/3] rounded-2xl bg-paper-2" />}
                    <div className="flex flex-1 flex-col p-2 pt-4">
                      <p className="eyebrow !text-[0.62rem] !text-muted">{brand(p.brandId)?.name}</p>
                      <h3 className="mt-1.5 font-semibold">{p.seriesName}</h3>
                      <p className="num mt-auto pt-3 text-xs text-verdi-700">
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

      <VideoBand />

      {/* how enquiries work */}
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

      {/* tools / learn */}
      <section className="container-x grid gap-4 pb-20 lg:grid-cols-2">
        <Reveal>
          <Link to="/solar-tools" className="group relative block h-full overflow-hidden rounded-[2rem] bg-ink p-8 text-paper sm:p-10">
            <img src="/images/site/metal-roof-rails.webp" alt="" className="absolute inset-0 size-full object-cover opacity-25 transition duration-700 group-hover:scale-105" />
            <div className="relative">
              <Calculator className="size-7 text-sun-400" />
              <h2 className="mt-5 text-3xl font-semibold">Solar tools that do the maths.</h2>
              <p className="mt-3 max-w-md text-paper/70">Appliance load, system size, savings, roof fit, battery backup, losses and a kit builder that uses real catalogue products.</p>
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
            <p className="mt-3 max-w-md text-muted">24 animated lessons: solar cells, TOPCon vs PERC, MPPT, bifacial gain, cable losses, earthing, PM Surya Ghar and more.</p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-verdi-700">
              Visit the Learning Hub <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </Reveal>
      </section>

      {/* trust band */}
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
