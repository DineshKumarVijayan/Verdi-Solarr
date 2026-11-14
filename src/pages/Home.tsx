import { ArrowRight, BookOpen, Calculator, ClipboardList, FileText, Layers, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { CatalogueShowcase } from "../components/home/CatalogueShowcase";
import { Hero } from "../components/home/Hero";
import { VideoBand } from "../components/home/VideoBand";
import { Reveal, Stagger, StaggerItem } from "../components/motion";
import { SectionHeading } from "../components/ui";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { useCatalogue } from "../lib/catalogue";
import { usePageMeta } from "../lib/seo";
import { useSite } from "../lib/site";

export default function Home() {
  const SITE = useSite();
  usePageMeta(
    "VERDI SOLARR SOLUTION — Solar panels, inverters & solar electricals for businesses",
    "B2B supplier of solar panels, inverters, solar DC cables and solar electrical components in Chennai. Browse real datasheets, compare specifications and send a WhatsApp enquiry.",
  );
  const { data } = useCatalogue();

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

      <VideoBand />

      {/* how enquiries work */}
      <section className="container-x py-12 sm:py-20">
        <Reveal>
          <SectionHeading eyebrow="How enquiries work" title="From shortlist to quotation in three steps." align="center" />
        </Reveal>
        <Stagger className="scrollbar-none -mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mt-12 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {[
            { icon: Layers, t: "Shortlist", d: "Search by wattage, kW, phase or model. Open the actual manufacturer datasheet without leaving the page." },
            { icon: ClipboardList, t: "Build your enquiry", d: "Add products and quantities. We re-check every listed price against our live database before you send." },
            { icon: WhatsAppIcon, t: "Confirm on WhatsApp", d: "Review a ready-made message and send it to us on WhatsApp. We confirm final pricing, taxes, availability and delivery." },
          ].map((s, i) => (
            <StaggerItem key={s.t} className="w-[82%] shrink-0 snap-start md:w-auto">
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
      <section className="container-x grid gap-4 pb-12 sm:pb-20 lg:grid-cols-2">
        <Reveal>
          <Link to="/solar-tools" className="group relative block h-full overflow-hidden rounded-[2rem] bg-ink p-6 text-paper sm:p-10">
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
          <Link to="/learn" className="group relative block h-full overflow-hidden rounded-[2rem] border border-line bg-verdi-50 p-6 sm:p-10">
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
        <Stagger className="container-x scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto py-10 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:py-14">
          {[
            { icon: FileText, t: "Real datasheets", d: "Specifications are transcribed from manufacturer PDFs, and you can open the original in one click." },
            { icon: ShieldCheck, t: "Honest pricing", d: "Listed prices come from our live database and are re-checked before every enquiry. Final quotes are confirmed by our team." },
            { icon: WhatsAppIcon, t: "Talk to a person", d: `Call or WhatsApp us on ${SITE.phoneDisplay} for project quantities and delivery.` },
          ].map((x) => (
            <StaggerItem key={x.t} className="w-[80%] shrink-0 snap-start md:w-auto">
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
