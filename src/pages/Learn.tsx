import { ArrowRight, ExternalLink, RotateCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { usePageMeta } from "../lib/seo";
import { DatasheetDecoder } from "./learn/DatasheetDecoder";
import { Degradation } from "./learn/Degradation";
import { MpptCurve } from "./learn/MpptCurve";
import { SystemTypes } from "./learn/SystemTypes";

const CHAPTERS = [
  { id: "basics", label: "How solar works" },
  { id: "systems", label: "On-grid · Off-grid · Hybrid" },
  { id: "modules", label: "Module technology" },
  { id: "inverters", label: "Inverters & MPPT" },
  { id: "datasheets", label: "Reading datasheets" },
  { id: "bos", label: "ACDB · DCDB · Cables · MC4" },
  { id: "earthing", label: "Earthing & protection" },
  { id: "performance", label: "Degradation & losses" },
  { id: "maintenance", label: "Maintenance" },
  { id: "myths", label: "Myths vs facts" },
  { id: "warranty", label: "Warranty registration" },
];

export default function Learn() {
  usePageMeta(
    "Solar Learning Hub — TOPCon vs PERC, MPPT, datasheets, ACDB/DCDB",
    "Visual, interactive solar explanations: how panels and inverters work, on-grid vs hybrid, TOPCon vs PERC, bifacial modules, MPPT, datasheet terms, cables, earthing, degradation and myths.",
  );
  return (
    <div>
      <section className="border-b border-line/70 bg-verdi-50/60">
        <div className="container-x py-14">
          <p className="eyebrow">Solar Learning Hub</p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">Understand the hardware before you specify it.</h1>
          <p className="mt-4 max-w-2xl text-muted">Short, accurate explanations with interactive diagrams. Real numbers come from the manufacturer datasheets in our catalogue.</p>
        </div>
      </section>
      <nav aria-label="Chapters" className="sticky top-16 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
        <ul className="container-x scrollbar-none flex gap-1.5 overflow-x-auto py-2.5">
          {CHAPTERS.map((c) => (
            <li key={c.id} className="shrink-0">
              <a href={`#${c.id}`} className="chip">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-x grid gap-20 py-14">
        <Chapter id="basics" n="01" title="How solar panels work" lead="Light in, direct current out.">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Photons arrive", "Sunlight carries energy in packets called photons."],
              ["Electrons are freed", "In the silicon cell, absorbed photons free electrons. The cell's built-in electric field (the p–n junction) pushes them one way."],
              ["DC flows", "Metal contacts collect the electrons as direct current (DC). Cells are wired in series inside the module to build voltage."],
              ["Inverter converts", "An inverter turns DC into grid-compatible AC (230 V single phase or 400 V three phase in India)."],
            ].map(([t, d], i) => (
              <div key={t} className="card p-5">
                <p className="num text-xs text-verdi-600">STEP {i + 1}</p>
                <h4 className="mt-2 font-semibold">{t}</h4>
                <p className="mt-1.5 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </Chapter>

        <Chapter id="systems" n="02" title="On-grid vs off-grid vs hybrid" lead="Same panels, three very different system designs. Toggle each one and simulate a power cut.">
          <SystemTypes />
        </Chapter>

        <Chapter id="modules" n="03" title="Module technology, compared" lead="The terms on every module datasheet, explained side by side.">
          <CompareTabs />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Fact title="Bifacial modules">
              Bifacial modules also capture light reflected onto their rear side. The datasheet’s <em>bifaciality factor</em> (80 ± 5% for the Anchor TOPCon, 75 ± 5% for the Anchor PERC) is rear-side power divided by front-side power. Actual gain depends on ground reflectivity, mounting height and row spacing. White or light surfaces and elevated structures help most.
            </Fact>
            <Fact title="Module efficiency">
              Efficiency = Pmax ÷ (area × 1000 W/m²). The 630 Wp TOPCon module (2382 × 1134 mm) reaches 23.32%. Higher efficiency puts more watts on limited roof space, but every rated watt produces similar energy under the same conditions.
            </Fact>
          </div>
        </Chapter>

        <Chapter id="inverters" n="04" title="How solar inverters work, and MPPT" lead="Drag the operating voltage and find the maximum power point yourself.">
          <MpptCurve />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Fact title="String inverters">Modules are wired in series “strings” into each MPPT input. With dual-MPPT inverters (e.g. Anchor INO, Stellar, Lumina) two roof faces or shading conditions can be tracked independently.</Fact>
            <Fact title="Module-level optimisers">In a series string the weakest module limits the others. SolarEdge power optimisers perform MPPT on every module and feed a fixed-voltage inverter, which reduces mismatch losses from shading, soiling or tolerances.</Fact>
            <Fact title="Single vs three phase">Single-phase inverters (RENO, INO, SE3000H/4000H) suit homes with single-phase supply. Three-phase units (Stellar 3–15 kW, Lumina 20–25 kW) balance output across phases for larger connections.</Fact>
          </div>
        </Chapter>

        <Chapter id="datasheets" n="05" title="Understanding datasheets" lead="Pick a term to see what it means and a real value from a catalogue datasheet.">
          <DatasheetDecoder />
        </Chapter>

        <Chapter id="bos" n="06" title="ACDB vs DCDB, solar cables and MC4 connectors" lead="The balance-of-system parts that keep a plant safe.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card overflow-hidden">
              <div className="bg-sun-100 px-5 py-3 text-sm font-semibold">DCDB: DC distribution box</div>
              <p className="p-5 text-sm text-ink/80">Sits between the panel strings and the inverter (DC side). It typically houses DC fuses or MCBs, DC surge protection devices (SPD) and an isolator, and it protects strings and lets you safely disconnect the array.</p>
            </div>
            <div className="card overflow-hidden">
              <div className="bg-verdi-100 px-5 py-3 text-sm font-semibold">ACDB: AC distribution box</div>
              <p className="p-5 text-sm text-ink/80">Sits between the inverter and the building’s distribution board or meter (AC side). It typically houses an MCB/MCCB, AC SPD and often an RCD, which protect the inverter output and give a safe AC isolation point.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Fact title="Solar DC cable basics">
              PV strings need cable rated for high DC voltage, UV, heat and decades outdoors. The Anchor Solar DC Cable is made to IS 17293:2020 (aligned with EN 50618 / IEC 62930): tinned copper, XLPO insulation, up to 1500 V DC. A 4 mm² cable is rated 52 A free in air, and 6 mm² is rated 66 A. Larger sizes also reduce voltage drop on long runs.{" "}
              <Link className="font-semibold text-verdi-700 underline" to="/category/solar-dc-cables">
                View cables
              </Link>
            </Fact>
            <Fact title="MC4 connectors">
              MC4-type connectors join module leads and string cables with a locked, weather-sealed contact. Crimp with the correct tool, never mate connectors from different manufacturers unless they are certified compatible, and never disconnect under load. A poor connector is a common cause of hot spots and arcing.
            </Fact>
          </div>
        </Chapter>

        <Chapter id="earthing" n="07" title="Earthing and protection" lead="Earthing, lightning protection and surge protection do different jobs.">
          <div className="grid gap-4 md:grid-cols-3">
            <Fact title="Equipment earthing">Module frames, structures and inverter bodies are bonded to earth so that a fault cannot leave metal parts live. Copper bonded rods with earthing compound keep earth resistance low and stable over time.</Fact>
            <Fact title="Lightning arresters">A lightning arrester (air terminal) gives a direct strike a preferred path to a <em>dedicated</em> earth pit, away from the array wiring. It is sized by its protection zone over the array.</Fact>
            <Fact title="Surge protection (SPD)">Surges induced by nearby strikes or switching are clamped by DC and AC SPDs in the DCDB/ACDB. The Stellar inverters list Type II DC and AC surge protection built in, and external SPDs add another layer.</Fact>
          </div>
          <p className="mt-4 text-xs text-muted">Earthing and lightning protection must be designed to applicable standards and site soil conditions by a qualified professional.</p>
        </Chapter>

        <Chapter id="performance" n="08" title="Degradation and solar losses" lead="Modules slowly lose output, and real systems lose energy along the way.">
          <Degradation />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] bg-ink p-6 text-paper">
            <p className="max-w-xl text-sm text-paper/75">Dust, shading, heat, cabling and conversion each take a share. The loss explorer shows how they combine into the system’s performance ratio.</p>
            <Link to="/solar-tools/losses" className="btn-sun">
              Open the loss explorer <ArrowRight className="size-4" />
            </Link>
          </div>
        </Chapter>

        <Chapter id="maintenance" n="09" title="Solar panel maintenance" lead="Simple routines protect yield and warranties.">
          <ul className="grid gap-3 md:grid-cols-2">
            {[
              "Clean modules with soft water and a non-abrasive brush, early morning or evening when the glass is cool. No pressure washers or detergents unless the manufacturer allows them.",
              "Inspect for cracked glass, discoloured cells, damaged cables, and loose or melted MC4 connectors.",
              "Check the inverter display or app for faults and compare daily generation against previous weeks.",
              "Keep inverter ventilation clear. Natural-convection units need free airflow.",
              "Test earthing resistance and check SPD status indicators periodically.",
              "Follow the manufacturer’s installation manual and warranty conditions.",
            ].map((t) => (
              <li key={t} className="card flex gap-3 p-4 text-sm">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-verdi-500" />
                {t}
              </li>
            ))}
          </ul>
        </Chapter>

        <Chapter id="myths" n="10" title="Myths vs facts" lead="Tap a card to flip it.">
          <Myths />
        </Chapter>

        <Chapter id="warranty" n="11" title="Registering an Anchor by Panasonic warranty" lead="End customers register through Panasonic’s online warranty platform.">
          <ol className="grid gap-3 md:grid-cols-4">
            {[
              ["Open the portal", "Visit solarwarranty.lsin.panasonic.com."],
              ["Customer details", "Enter the end customer’s name, address, phone, email, state, pincode and purchase date exactly as on the invoice, and upload the invoice (JPEG, PNG or PDF, max 10 MB)."],
              ["Product details", "Choose the category and product code, then enter quantity and serial numbers (comma-separated for up to 5; use the Excel bulk upload for more)."],
              ["Submit & track", "Accept the terms and submit. You get a request ID by message and email. Use it with your mobile number to track the status and download the certificate."],
            ].map(([t, d], i) => (
              <li key={t} className="card p-5">
                <p className="num text-xs text-verdi-600">STEP {i + 1}</p>
                <h4 className="mt-2 font-semibold">{t}</h4>
                <p className="mt-1.5 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm">
            <a className="inline-flex items-center gap-1 font-semibold text-verdi-700 hover:underline" href="https://solarwarranty.lsin.panasonic.com/" target="_blank" rel="noopener">
              Go to the Panasonic solar warranty portal <ExternalLink className="size-3.5" />
            </a>
            <span className="block text-xs text-muted">Registration must be in the end user’s name, not a distributor, dealer or installer. Terms are set by the manufacturer.</span>
          </p>
        </Chapter>
      </div>
    </div>
  );
}

function Chapter({ id, n, title, lead, children }: { id: string; n: string; title: string; lead: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-32">
      <div className="mb-6 flex items-baseline gap-4">
        <span className="num text-sm text-subtle">{n}</span>
        <div>
          <h2 id={`${id}-h`} className="text-3xl font-semibold">
            {title}
          </h2>
          <p className="mt-1 text-muted">{lead}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Fact({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-5">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">{children}</p>
    </div>
  );
}

const COMPARISONS = [
  {
    id: "mono-poly",
    tab: "Mono vs Poly",
    a: { name: "Monocrystalline", points: ["Cut from a single silicon crystal", "Uniform dark appearance", "Higher efficiency per area", "The mainstream technology for today’s modules"] },
    b: { name: "Polycrystalline", points: ["Cast from many crystals", "Blue, flecked appearance", "Lower efficiency per area", "Largely replaced by mono in new projects"] },
  },
  {
    id: "p-n",
    tab: "P-Type vs N-Type",
    a: { name: "P-Type", points: ["Boron-doped silicon base", "Prone to light-induced degradation (boron–oxygen LID)", "Basis of most PERC cells", "Example: Anchor Mono PERC, −0.309 %/°C"] },
    b: { name: "N-Type", points: ["Phosphorus-doped silicon base", "No boron–oxygen LID (the TOPCon datasheet states zero LID loss)", "Typically better temperature behaviour", "Example: Anchor TOPCon, −0.29 %/°C"] },
  },
  {
    id: "perc-topcon",
    tab: "PERC vs TOPCon",
    a: { name: "PERC", points: ["Passivated Emitter and Rear Cell", "A rear passivation layer reflects light back and reduces losses", "Anchor 540–555 Wp: up to 21.52%", "Warranty: 2% first year, 0.6%/yr after"] },
    b: { name: "TOPCon", points: ["Tunnel Oxide Passivated Contact", "Ultra-thin oxide plus doped polysilicon contact cuts recombination", "Anchor 600–630 Wp: up to 23.32%", "Warranty: 1% first year, 0.4%/yr after"] },
  },
];

function CompareTabs() {
  const [i, setI] = useState(0);
  const c = COMPARISONS[i];
  return (
    <div className="card overflow-hidden">
      <div className="flex gap-1 border-b border-line bg-paper-2/60 p-1.5" role="tablist" aria-label="Technology comparisons">
        {COMPARISONS.map((x, j) => (
          <button key={x.id} role="tab" type="button" aria-selected={i === j} onClick={() => setI(j)} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${i === j ? "bg-card shadow-sm" : "text-muted hover:text-ink"}`}>
            {x.tab}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2" role="tabpanel">
        {[c.a, c.b].map((s, k) => (
          <div key={s.name} className={`p-6 ${k === 1 ? "border-t border-line md:border-t-0 md:border-l" : ""}`}>
            <h4 className="text-xl font-semibold">{s.name}</h4>
            <ul className="mt-3 grid gap-2 text-sm">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className={`mt-2 size-1.5 shrink-0 rounded-full ${k === 1 ? "bg-verdi-500" : "bg-sun-500"}`} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-6 py-3 text-xs text-muted">
        Compare the actual modules:{" "}
        <Link className="font-semibold text-verdi-700 underline" to="/category/solar-panels">
          Solar panels
        </Link>
      </div>
    </div>
  );
}

const MYTHS = [
  ["Solar panels don’t work on cloudy days.", "They produce less, but they still produce from diffuse light. The I-V curve scales with irradiance and does not switch off."],
  ["A hotter, sunnier day always means more power.", "Heat reduces output. At about 0.3 %/°C, a 60 °C module makes roughly 10% less than its STC rating."],
  ["Panel wattage must never exceed the inverter rating.", "Datasheets allow DC oversizing. For example, the 3 kW RENO 3KTLX lists a 4200 W maximum recommended PV power."],
  ["On-grid systems keep running during power cuts.", "Grid-tie inverters must shut down when the grid fails (anti-islanding). You need a hybrid or off-grid design for backup."],
  ["Any cable works for the DC side.", "PV strings need solar DC cable rated for high DC voltage, UV and heat, such as cable made to IS 17293 / EN 50618."],
  ["Solar panels need no maintenance.", "Dust and bird droppings reduce yield, and connectors and earthing need periodic checks."],
  ["A higher-wattage panel is always more efficient.", "Wattage depends on size too. Efficiency measures watts per square metre."],
  ["MC4 connectors from any brand are interchangeable.", "Cross-mating different makes can cause poor contact and overheating unless they are certified as compatible."],
];

function Myths() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MYTHS.map(([myth, fact], i) => {
        const on = flipped.has(i);
        return (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            onClick={() =>
              setFlipped((s) => {
                const n = new Set(s);
                if (n.has(i)) n.delete(i);
                else n.add(i);
                return n;
              })
            }
            className={`flex min-h-52 flex-col rounded-[var(--radius-card)] p-5 text-left transition ${on ? "bg-verdi-700 text-white" : "border border-line bg-card hover:shadow-[var(--shadow-soft)]"}`}
          >
            <span className={`font-mono text-[10px] tracking-[0.18em] uppercase ${on ? "text-verdi-200" : "text-danger"}`}>{on ? "Fact" : "Myth"}</span>
            <span className="mt-3 flex-1 text-[15px] leading-snug font-medium">{on ? fact : myth}</span>
            <span className={`mt-4 inline-flex items-center gap-1 text-xs ${on ? "text-white/70" : "text-muted"}`}>
              <RotateCw className="size-3" /> {on ? "Back to myth" : "Reveal the fact"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
