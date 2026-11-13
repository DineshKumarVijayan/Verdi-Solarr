import { useMemo, useState } from "react";
import { Link } from "react-router";
import { m } from "../../../components/motion";
import { useCatalogue } from "../../../lib/catalogue";
import { Degradation } from "../Degradation";
import { Block, Callout, Chips, Stage, Stat } from "../kit";

/* ===================================================== CELL TECHNOLOGIES */
const COMPARE = [
  {
    id: "pn",
    tab: "P-Type vs N-Type",
    a: { name: "P-Type", points: ["Silicon doped with boron (one electron fewer than silicon)", "Light-induced degradation (boron–oxygen LID) is a known challenge", "Proven, mature technology. Most PERC cells are P-type", "Anchor Mono PERC: −0.309 %/°C, 0.6%/yr warranted degradation"] },
    b: { name: "N-Type", points: ["Silicon doped with phosphorus (one electron more)", "Not susceptible to boron–oxygen LID. The TOPCon datasheet states zero LID loss", "Typically lower temperature coefficient and yearly degradation", "Anchor TOPCon: −0.29 %/°C, 0.4%/yr warranted degradation"] },
  },
  {
    id: "mono-poly",
    tab: "Mono vs Poly",
    a: { name: "Polycrystalline", points: ["Silicon cast in moulds from many crystals", "Blue, flecked appearance", "Lower efficiency", "Largely replaced in new projects"] },
    b: { name: "Monocrystalline", points: ["Grown as a single crystal (Czochralski process)", "Uniform dark appearance", "Higher efficiency per area", "Basis of PERC and TOPCon cells"] },
  },
  {
    id: "perc-topcon",
    tab: "PERC vs TOPCon",
    a: { name: "PERC", points: ["Passivated Emitter and Rear Cell", "A rear passivation layer reflects light back and reduces recombination", "Anchor 540–555 Wp: up to 21.52%", "2% first year, then 0.6%/yr"] },
    b: { name: "TOPCon", points: ["Tunnel Oxide Passivated Contact", "Ultra-thin oxide plus doped polysilicon at the rear cuts recombination further", "Anchor 600–630 Wp: up to 23.32%", "1% first year, then 0.4%/yr"] },
  },
];

const LADDER = [
  { name: "Thin film (CdTe / CIGS / a-Si)", lo: 10, hi: 19, note: "Lower efficiency, needs more area" },
  { name: "Polycrystalline (P-type)", lo: 15, hi: 18, note: "Legacy" },
  { name: "Mono PERC (P-type)", lo: 20, hi: 21.8, note: "Anchor 555 Wp: 21.52%", mark: 21.52 },
  { name: "N-Type TOPCon", lo: 22, hi: 23.8, note: "Anchor 630 Wp: 23.32%", mark: 23.32 },
  { name: "Heterojunction (HJT)", lo: 22, hi: 24, note: "N-type + amorphous silicon layers" },
  { name: "Back-contact (IBC / BC)", lo: 22, hi: 24.5, note: "All contacts at the rear" },
];

export function CellTechnologies() {
  const [i, setI] = useState(0);
  const c = COMPARE[i];
  return (
    <>
      <Block>
        <div className="card overflow-hidden">
          <div className="flex gap-1 border-b border-line bg-paper-2/60 p-1.5" role="tablist">
            {COMPARE.map((x, j) => (
              <button key={x.id} role="tab" type="button" aria-selected={i === j} onClick={() => setI(j)} className={`relative flex-1 rounded-xl px-3 py-2 text-sm font-medium ${i === j ? "" : "text-muted hover:text-ink"}`}>
                {i === j && <m.span layoutId="cmp-tab" className="absolute inset-0 rounded-xl bg-card shadow-sm" />}
                <span className="relative">{x.tab}</span>
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2">
            {[c.a, c.b].map((s, k) => (
              <m.div key={c.id + s.name} initial={{ opacity: 0, x: k ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`p-6 ${k ? "border-t border-line md:border-t-0 md:border-l" : ""}`}>
                <h3 className="text-xl font-semibold">{s.name}</h3>
                <ul className="mt-3 grid gap-2 text-sm">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className={`mt-2 size-1.5 shrink-0 rounded-full ${k ? "bg-verdi-500" : "bg-sun-500"}`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </m.div>
            ))}
          </div>
        </div>
      </Block>
      <Block title="The efficiency ladder" kicker="Typical commercial module efficiency">
        <Stage>
          <div className="grid gap-4">
            {LADDER.map((l, k) => (
              <div key={l.name} className="grid items-center gap-2 sm:grid-cols-[230px_1fr]">
                <div>
                  <p className="text-sm font-semibold">{l.name}</p>
                  <p className="text-xs text-paper/55">{l.note}</p>
                </div>
                <div className="relative h-7 rounded-full bg-white/5">
                  <m.div
                    className="absolute inset-y-1 rounded-full bg-linear-to-r from-sky-500 to-verdi-400"
                    style={{ left: `${((l.lo - 8) / 18) * 100}%` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${((l.hi - l.lo) / 18) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: k * 0.12, duration: 0.8 }}
                  />
                  {l.mark && (
                    <m.span className="absolute -top-1 grid h-9 w-1 place-items-center rounded bg-sun-400" style={{ left: `${((l.mark - 8) / 18) * 100}%` }} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: 1 }} />
                  )}
                </div>
              </div>
            ))}
            <div className="flex justify-between pl-0 font-mono text-[10px] text-paper/45 sm:pl-[238px]">
              {[8, 12, 16, 20, 24].map((v) => (
                <span key={v}>{v}%</span>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-paper/50">Approximate ranges, which vary by manufacturer and year. Amber markers show real modules in our catalogue.</p>
        </Stage>
      </Block>
    </>
  );
}

/* ========================================================= HALF-CUT CELLS */
export function HalfCutCellsBusbars() {
  const [half, setHalf] = useState(true);
  const I = half ? 0.5 : 1;
  return (
    <>
      <Block>
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Stage>
            <Chips label="Cell type" value={half ? "half" : "full"} onChange={(v) => setHalf(v === "half")} options={[{ v: "full", l: "Full cells" }, { v: "half", l: "Half-cut cells" }]} />
            <svg viewBox="0 0 400 210" className="mt-4 w-full" aria-hidden="true">
              <rect x="20" y="20" width="360" height="150" rx="6" fill="#10222e" stroke="#2aa3e6" strokeOpacity="0.4" />
              {Array.from({ length: half ? 12 : 6 }).map((_, c) =>
                Array.from({ length: half ? 6 : 3 }).map((_, r) => {
                  const w = half ? 28 : 56;
                  const h = half ? 23 : 46;
                  return <rect key={`${c}-${r}`} x={26 + c * (w + 1.5) + (half && c >= 6 ? 6 : 0)} y={26 + r * (h + 1.5)} width={w} height={h} rx="2" fill="#1b4f7a" />;
                }),
              )}
              {half && <line x1="200" x2="200" y1="20" y2="170" stroke="#f9a21b" strokeWidth="2" strokeDasharray="4 4" />}
              {/* current arrows */}
              <m.path d="M20 190 H380" stroke="#f9a21b" strokeLinecap="round" animate={{ strokeWidth: half ? 4 : 10 }} strokeDasharray="14 10" className="animate-flow" />
              <text x="200" y="207" textAnchor="middle" fontSize="10" fill="#cfd8de" fontFamily="JetBrains Mono">
                current per cell string: {half ? "½ I" : "I"}
              </text>
            </svg>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-paper/60">Heat in ribbons</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <m.div className="h-full bg-linear-to-r from-sun-300 to-danger" animate={{ width: `${I * I * 100}%` }} />
              </div>
            </div>
          </Stage>
          <div className="grid content-start gap-3">
            <Stat label="Relative I²R loss in cell interconnects" value={`${Math.round(I * I * 100)}%`} sub={half ? "Current halved, loss ≈ quarter per string" : "Reference: full-size cells"} accent />
            <Callout>Power lost in a conductor is P = I² × R. Halving the current through each cell string cuts that loss to about a quarter, so modules run cooler and slightly more efficiently.</Callout>
            <Callout tone="tip">The module is also split into upper and lower halves that work in parallel, so shade on one half affects less of the output.</Callout>
          </div>
        </div>
      </Block>
      <Block title="Busbars and fingers" kicker="Zoom into a cell">
        <Stage className="grid items-center gap-6 sm:grid-cols-[260px_1fr]">
          <m.svg viewBox="0 0 200 200" className="w-full max-w-60" whileHover={{ scale: 1.08 }} aria-label="Solar cell with busbars and fingers">
            <rect x="10" y="10" width="180" height="180" rx="10" fill="#1b4f7a" />
            {Array.from({ length: 30 }).map((_, k) => (
              <line key={k} x1="14" x2="186" y1={16 + k * 5.8} y2={16 + k * 5.8} stroke="#9fb3c4" strokeWidth="0.5" />
            ))}
            {[46, 82, 118, 154].map((x) => (
              <rect key={x} x={x} y="10" width="4" height="180" fill="#eef3f6" />
            ))}
          </m.svg>
          <div className="grid gap-3 text-sm">
            <p>
              <strong className="text-sun-300">Fingers</strong>: hair-thin printed lines that collect electrons from the cell surface.
            </p>
            <p>
              <strong className="text-sun-300">Busbars</strong>: wider strips that gather current from the fingers. Modern multi-busbar (MBB) designs use many thin busbars to shorten current paths and reduce shading.
            </p>
          </div>
        </Stage>
      </Block>
    </>
  );
}

/* ================================================================ BIFACIAL */
const SURFACES = [
  { v: "grass", l: "Grass / soil", albedo: "≈ 0.15–0.25" },
  { v: "concrete", l: "Concrete roof", albedo: "≈ 0.25–0.35" },
  { v: "white", l: "White membrane / sand", albedo: "≈ 0.4–0.8" },
] as const;
// Datasheet BIFACIAL GAIN table, Anchor N-Type TOPCon (Pmax front → total)
const GAIN_TABLE: Record<number, [number, number, number]> = {
  600: [630, 690, 750],
  610: [640.5, 701.5, 762.5],
  620: [651, 713, 775],
  630: [661.5, 724.5, 787.5],
};

export function BifacialModules() {
  const [surface, setSurface] = useState<(typeof SURFACES)[number]["v"]>("concrete");
  const [wp, setWp] = useState(620);
  const [gainIdx, setGainIdx] = useState(1);
  const reflect = surface === "grass" ? 0.35 : surface === "concrete" ? 0.6 : 1;
  const total = GAIN_TABLE[wp][gainIdx];
  return (
    <Block>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Stage>
          <svg viewBox="0 0 400 230" className="w-full" aria-label="Direct sunlight hits the front, reflected light hits the back">
            <circle cx="60" cy="40" r="20" fill="#f9a21b" />
            {[0, 1, 2].map((k) => (
              <m.line key={k} x1={75 + k * 8} y1={55 + k * 4} x2={195 + k * 30} y2={105 + k * 5} stroke="#ffd35c" strokeWidth="2.5" strokeDasharray="8 6" className="animate-flow" />
            ))}
            <g transform="rotate(-14 260 110)">
              <rect x="160" y="100" width="200" height="12" rx="2" fill="#1b4f7a" stroke="#6cc2f0" />
            </g>
            <line x1="200" y1="118" x2="200" y2="200" stroke="#9aa5ad" strokeWidth="4" />
            <line x1="330" y1="88" x2="330" y2="200" stroke="#9aa5ad" strokeWidth="4" />
            <m.rect x="0" y="200" width="400" height="30" animate={{ fill: surface === "white" ? "#e9eef0" : surface === "concrete" ? "#9aa5ad" : "#3f6b2a" }} />
            {[0, 1, 2].map((k) => (
              <m.line key={k} x1={210 + k * 40} y1="198" x2={225 + k * 40} y2="125" stroke="#ffd35c" strokeWidth="2" strokeDasharray="6 6" className="animate-flow" animate={{ opacity: reflect }} />
            ))}
            <text x="20" y="225" fontSize="10" fill="#0a1822" fontFamily="JetBrains Mono">
              albedo {SURFACES.find((s) => s.v === surface)!.albedo}
            </text>
          </svg>
          <div className="mt-3">
            <Chips label="Ground surface" value={surface} onChange={setSurface} options={SURFACES.map((s) => ({ v: s.v, l: s.l }))} />
          </div>
        </Stage>
        <div className="grid content-start gap-4">
          <p className="text-sm font-semibold">From the Anchor TOPCon datasheet’s bifacial gain table:</p>
          <Chips label="Front rating" value={wp} onChange={setWp} options={Object.keys(GAIN_TABLE).map((k) => ({ v: Number(k), l: `${k} Wp` }))} />
          <Chips label="Rear-side gain" value={gainIdx} onChange={setGainIdx} options={[{ v: 0, l: "+5%" }, { v: 1, l: "+15%" }, { v: 2, l: "+25%" }]} />
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Front only (STC)" value={`${wp} W`} />
            <Stat label="With rear gain" value={`${total} W`} accent sub={`+${(total - wp).toFixed(1)} W`} />
          </div>
          <Callout tone="tip">Actual rear gain depends on ground reflectivity, mounting height, tilt and row spacing. Elevated structures over light surfaces benefit most. Bifaciality factor: 80 ± 5% (TOPCon), 75 ± 5% (PERC).</Callout>
          <Link to="/category/solar-panels" className="text-sm font-semibold text-verdi-700 hover:underline">
            See bifacial modules →
          </Link>
        </div>
      </div>
    </Block>
  );
}

/* ====================================================== MODULE EFFICIENCY */
export function ModuleEfficiency() {
  const { data } = useCatalogue();
  const modules = (data?.products ?? []).filter((p) => p.specs.some((s) => s.k === "power_wp"));
  const [id, setId] = useState<number | null>(null);
  const mod = modules.find((x) => x.id === id) ?? modules[modules.length - 1];
  const calc = useMemo(() => {
    if (!mod) return null;
    const wp = Number(mod.specs.find((s) => s.k === "power_wp")?.v);
    const dims = (mod.specs.find((s) => s.k === "dimensions_mm")?.v ?? "").split("×").map((x) => Number(x.trim()));
    const area = (dims[0] / 1000) * (dims[1] / 1000);
    const eff = (wp / (area * 1000)) * 100;
    const stated = Number(mod.specs.find((s) => s.k === "efficiency_pct")?.v);
    return { wp, dims, area, eff, stated };
  }, [mod]);
  if (!mod || !calc) return null;
  return (
    <Block>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid content-start gap-4">
          <label className="label" htmlFor="eff-mod">
            Pick a module from our catalogue
          </label>
          <select id="eff-mod" className="field" value={mod.id} onChange={(e) => setId(Number(e.target.value))}>
            {modules.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <div className="card p-5 font-mono text-sm leading-7">
            <p>η = Pmax ÷ (Area × 1000 W/m²)</p>
            <p className="text-muted">
              Area = {calc.dims[0]} mm × {calc.dims[1]} mm = {calc.area.toFixed(3)} m²
            </p>
            <p className="text-muted">
              η = {calc.wp} ÷ ({calc.area.toFixed(3)} × 1000)
            </p>
            <p className="text-lg text-ink">= {calc.eff.toFixed(2)}%</p>
          </div>
          <Callout>Datasheet value: {calc.stated.toFixed(2)}%. The small difference comes from rounding and dimension tolerance. Cell efficiency is higher than module efficiency because the frame, gaps between cells and interconnections produce no power.</Callout>
        </div>
        <Stage className="flex flex-col items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-64" aria-label={`Efficiency gauge ${calc.eff.toFixed(1)} percent`}>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#ffffff15" strokeWidth="16" />
            <m.circle cx="100" cy="100" r="80" fill="none" stroke="url(#effg)" strokeWidth="16" strokeLinecap="round" transform="rotate(-90 100 100)" strokeDasharray={2 * Math.PI * 80} animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - calc.eff / 30) }} transition={{ duration: 1 }} />
            <defs>
              <linearGradient id="effg">
                <stop offset="0" stopColor="#0b8bd4" />
                <stop offset="1" stopColor="#6db62c" />
              </linearGradient>
            </defs>
            <text x="100" y="100" textAnchor="middle" fontSize="30" fill="#fff" fontFamily="JetBrains Mono">
              {calc.eff.toFixed(1)}%
            </text>
            <text x="100" y="124" textAnchor="middle" fontSize="10" fill="#cfd8de" fontFamily="Inter">
              of 30% scale
            </text>
          </svg>
          <p className="mt-2 text-sm text-paper/70">{calc.wp} W from {calc.area.toFixed(2)} m²</p>
        </Stage>
      </div>
    </Block>
  );
}

/* ============================================== DEGRADATION & DEFECTS */
const DEFECTS = [
  { n: "Potential-induced degradation (PID)", c: "High voltage between cells and the earthed frame drives leakage currents, often worse with heat and humidity.", impact: 90, fix: "PID-resistant modules and encapsulants, correct earthing, string-voltage monitoring." },
  { n: "Micro-cracks", c: "Rough handling, transport or lamination stress cracks cells, disconnecting areas over time.", impact: 55, fix: "Careful handling, EL inspection, never stand on modules." },
  { n: "Hot spots", c: "Shaded or damaged cells become loads and heat up locally.", impact: 40, fix: "Avoid persistent partial shade, use bypass diodes, inspect thermally." },
  { n: "Delamination", c: "Moisture ingress separates the laminate layers.", impact: 55, fix: "Quality encapsulation and sealing, wet-leakage-tested modules." },
  { n: "Snail trails", c: "Discoloured lines along micro-cracks caused by moisture reactions.", impact: 15, fix: "Usually a symptom of micro-cracks. Inspect further." },
  { n: "Glass breakage / edge chipping", c: "Mechanical impact or poor clamping.", impact: 100, fix: "Correct clamp torque and positions per the installation manual." },
];

export function DegradationAndDefects() {
  const [sel, setSel] = useState(0);
  const d = DEFECTS[sel];
  return (
    <>
      <Block title="Warranted degradation, year by year" kicker="Linear performance warranty">
        <Degradation />
      </Block>
      <Block title="Defects that steal energy" kicker="Pick a defect">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid gap-2">
            {DEFECTS.map((x, k) => (
              <button key={x.n} type="button" onClick={() => setSel(k)} className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${k === sel ? "border-danger/40 bg-danger-bg" : "border-line bg-card hover:border-ink/30"}`}>
                {x.n}
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-paper-2">
                  <span className="block h-full bg-danger" style={{ width: `${x.impact}%` }} />
                </span>
              </button>
            ))}
          </div>
          <Stage>
            <m.div key={sel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-xl font-semibold">{d.n}</h3>
              <p className="mt-3 text-sm text-paper/75">{d.c}</p>
              <p className="mt-4 text-xs tracking-[0.14em] text-paper/50 uppercase">Severity (relative)</p>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10">
                <m.div className="h-full bg-linear-to-r from-sun-300 to-danger" initial={{ width: 0 }} animate={{ width: `${d.impact}%` }} transition={{ duration: 0.7 }} />
              </div>
              <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm">
                <strong className="text-verdi-300">Prevention:</strong> {d.fix}
              </p>
            </m.div>
          </Stage>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_320px]">
          <Callout tone="tip">
            N-type TOPCon cells avoid boron–oxygen LID and are generally less sensitive to PID than P-type PERC. Both Anchor datasheets list PID resistance. Panasonic also describes extended wet-leakage (24 h), glow-wire (900–1000 °C) and wind-load (3800 Pa) testing.
          </Callout>
          <img src="/images/site/panasonic-wet-leakage-test.webp" alt="Module in an extended wet leakage test tank" loading="lazy" className="h-40 w-full rounded-2xl object-cover" />
        </div>
      </Block>
    </>
  );
}
