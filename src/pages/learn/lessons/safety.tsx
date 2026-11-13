import { Check, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { m } from "../../../components/motion";
import { NumberField, RangeField } from "../../../components/ui";
import { Block, Callout, Chips, Stage, Stat } from "../kit";

/* ======================================================== CABLE LOSSES */
// Max DC conductor resistance at 20 °C from the Anchor Solar DC Cable leaflet
const CABLES = { 4: 5.09, 6: 3.39 } as const;

export function CablesAndOhmicLosses() {
  const [size, setSize] = useState<4 | 6>(4);
  const [len, setLen] = useState(30);
  const [amps, setAmps] = useState(14.85);
  const [volts, setVolts] = useState(420);
  const r = (2 * len * CABLES[size]) / 1000; // loop resistance (out + return)
  const loss = amps * amps * r;
  const pct = (loss / (volts * amps)) * 100;
  const heat = Math.min(1, pct / 3);
  return (
    <>
      <Block>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Stage>
            <svg viewBox="0 0 400 170" className="w-full" aria-hidden="true">
              <rect x="10" y="40" width="70" height="90" rx="6" fill="#1b4f7a" stroke="#6cc2f0" />
              <text x="45" y="150" textAnchor="middle" fontSize="9" fill="#cfd8de" fontFamily="JetBrains Mono">STRING</text>
              <rect x="320" y="50" width="70" height="70" rx="10" fill="#f5f7f2" />
              <text x="355" y="140" textAnchor="middle" fontSize="9" fill="#cfd8de" fontFamily="JetBrains Mono">INVERTER</text>
              {[70, 100].map((y, k) => (
                <g key={y}>
                  <m.line x1="80" x2="320" y1={y} y2={y} animate={{ strokeWidth: size === 6 ? 9 : 6, stroke: `rgb(${Math.round(40 + heat * 215)},${Math.round(40 + (1 - heat) * 40)},40)` }} />
                  <line x1="80" x2="320" y1={y} y2={y} stroke={k ? "#111" : "#c0392b"} strokeWidth="3" strokeDasharray="10 8" className="animate-flow" />
                </g>
              ))}
              <m.g animate={{ opacity: heat }}>
                {[140, 200, 260].map((x) => (
                  <m.path key={x} d={`M${x} 60 q6 -12 0 -24 q-6 -12 0 -24`} stroke="#f9a21b" strokeWidth="2" fill="none" animate={{ y: [0, -6, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: x / 300 }} />
                ))}
              </m.g>
              <text x="200" y="125" textAnchor="middle" fontSize="10" fill="#cfd8de" fontFamily="JetBrains Mono">
                {len} m one way · {size} mm² · {CABLES[size]} Ω/km
              </text>
            </svg>
          </Stage>
          <div className="grid content-start gap-4">
            <Chips label="Cable size" value={size} onChange={setSize} options={[{ v: 4, l: "4 mm²" }, { v: 6, l: "6 mm²" }]} />
            <RangeField label="Cable length (one way)" value={len} min={5} max={150} onChange={setLen} format={(v) => `${v} m`} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="String current" unit="A" value={amps} step={0.1} min={0} onChange={setAmps} hint="Imp of TOPCon 620 Wp" />
              <NumberField label="String voltage" unit="V" value={volts} step={10} min={1} onChange={setVolts} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Loop R" value={`${r.toFixed(3)} Ω`} />
              <Stat label="Loss" value={`${loss.toFixed(1)} W`} />
              <Stat label="Of power" value={`${pct.toFixed(2)}%`} accent />
            </div>
          </div>
        </div>
      </Block>
      <Block title="How to keep ohmic losses low" kicker="Design checklist">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["P = I² × R", "Loss grows with the square of current. Higher string voltage and lower current reduce it sharply."],
            ["Size up", "6 mm² has about one third less resistance than 4 mm² (3.39 vs 5.09 Ω/km)."],
            ["Shorten runs", "Place the inverter or DCDB close to the array where practical."],
            ["Solar-rated cable", "Use IS 17293 / EN 50618 cable rated for 1500 V DC, UV and heat."],
            ["Tight connections", "Loose MC4s and lugs add resistance and heat."],
            ["AC side too", "Inverter-to-board AC cable also needs sizing for current and length."],
          ].map(([t, d]) => (
            <div key={t} className="card p-4">
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm">
          <Link className="font-semibold text-verdi-700 underline" to="/category/solar-dc-cables">
            Anchor solar DC cable specifications →
          </Link>
        </p>
      </Block>
    </>
  );
}

/* ================================================================ MC4 */
export function Mc4Connectors() {
  const [good, setGood] = useState(true);
  return (
    <>
      <Block>
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Stage>
            <Chips label="Connection" value={good ? "good" : "bad"} onChange={(v) => setGood(v === "good")} options={[{ v: "good", l: "Correctly mated" }, { v: "bad", l: "Faulty: clip dislodged" }]} />
            <svg viewBox="0 0 400 150" className="mt-4 w-full" aria-label={good ? "Pins fully engaged with spring clip around the contact" : "Spring clip pushed out, pins touching at a small point and heating"}>
              <rect x="20" y="45" width="120" height="60" rx="18" fill="#1b1f22" />
              <rect x="260" y="45" width="120" height="60" rx="18" fill="#1b1f22" />
              <rect x="140" y="55" width="120" height="40" rx="6" fill="#2b3035" />
              <m.rect y="69" height="12" rx="3" fill="#c98b4a" animate={{ x: 90, width: good ? 120 : 98 }} />
              <m.rect y="66" height="18" rx="4" fill="#d9a066" animate={{ x: good ? 205 : 210, width: 100 }} />
              <m.rect y="63" height="24" rx="4" fill="none" stroke={good ? "#6db62c" : "#9aa5ad"} strokeWidth="2" animate={{ x: good ? 190 : 225, width: good ? 34 : 34 }} />
              {!good && <m.circle cx="205" cy="75" r="16" fill="#e2453c" animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.9, 1.2, 0.9] }} transition={{ duration: 1.2, repeat: Infinity }} />}
              <text x="200" y="130" textAnchor="middle" fontSize="10" fill={good ? "#96cf55" : "#ff8b7a"} fontFamily="JetBrains Mono">
                {good ? "full contact · spring clip holds pins tight" : "point contact · resistance ↑ · heat ↑ · arc risk"}
              </text>
            </svg>
          </Stage>
          <div className="grid content-start gap-3">
            {[
              [true, "Crimp with the manufacturer-specified tool and die"],
              [true, "Push until the click. Then tug-test each connection"],
              [true, "Mate only connectors certified compatible (same make and type)"],
              [false, "Never disconnect under load. Isolate first"],
              [false, "Don’t leave connectors lying in water or on the roof surface"],
              [false, "Don’t mix brands, and don’t reuse damaged connectors"],
            ].map(([ok, t]) => (
              <m.div key={String(t)} className="flex gap-3 rounded-2xl border border-line bg-card p-3 text-sm" initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                {ok ? <Check className="size-4 shrink-0 text-verdi-600" /> : <X className="size-4 shrink-0 text-danger" />}
                {String(t)}
              </m.div>
            ))}
          </div>
        </div>
      </Block>
      <Callout tone="warn">A poor MC4 connection is one of the most common causes of hot spots and fires on the DC side. Thermal-imaging connectors during maintenance catches problems early.</Callout>
    </>
  );
}

/* ====================================================== PROTECTION / SLD */
const DEVICES = [
  { id: "fuse", box: "DCDB", n: "String fuse / DC MCB", d: "Protects strings and cables from reverse or over-current on the DC side." },
  { id: "dcspd", box: "DCDB", n: "DC SPD", d: "Surge protection device. Diverts lightning-induced surges on the array side to earth." },
  { id: "iso", box: "DCDB", n: "DC isolator", d: "Lets you safely disconnect the array from the inverter for maintenance." },
  { id: "mcb", box: "ACDB", n: "AC MCB / MCCB", d: "Miniature (or moulded-case) circuit breaker. Trips on over-current or short circuit on the inverter output." },
  { id: "rccb", box: "ACDB", n: "RCCB / ELCB", d: "Residual-current / earth-leakage breaker. Trips when current leaks to earth, protecting people from shock." },
  { id: "acspd", box: "ACDB", n: "AC SPD", d: "Clamps surges arriving from the grid side or switching events." },
];

export function AcdbDcdbProtection() {
  const [sel, setSel] = useState("rccb");
  const d = DEVICES.find((x) => x.id === sel)!;
  const Box = ({ name, x }: { name: "DCDB" | "ACDB"; x: number }) => (
    <g>
      <rect x={x} y="40" width="120" height="110" rx="10" fill="#10222e" stroke={name === "DCDB" ? "#f9a21b" : "#6db62c"} strokeWidth="1.5" />
      <text x={x + 60} y="34" textAnchor="middle" fontSize="11" fill="#cfd8de" fontFamily="JetBrains Mono">
        {name}
      </text>
      {DEVICES.filter((v) => v.box === name).map((v, k) => (
        <g key={v.id} role="button" tabIndex={0} onClick={() => setSel(v.id)} onKeyDown={(e) => e.key === "Enter" && setSel(v.id)} className="cursor-pointer">
          <rect x={x + 10} y={50 + k * 32} width="100" height="26" rx="6" fill={v.id === sel ? "#f9a21b" : "#183142"} />
          <text x={x + 60} y={67 + k * 32} textAnchor="middle" fontSize="9" fill={v.id === sel ? "#0a1822" : "#e5ebef"} fontFamily="Inter">
            {v.n.split(" /")[0]}
          </text>
        </g>
      ))}
    </g>
  );
  return (
    <Block>
      <Stage>
        <svg viewBox="0 0 640 190" className="w-full" role="group" aria-label="Single-line diagram. Select a protection device.">
          <rect x="10" y="70" width="70" height="50" rx="4" fill="#1b4f7a" stroke="#6cc2f0" />
          <text x="45" y="138" textAnchor="middle" fontSize="9" fill="#cfd8de" fontFamily="JetBrains Mono">ARRAY</text>
          <line x1="80" y1="95" x2="110" y2="95" stroke="#f9a21b" strokeWidth="3" strokeDasharray="6 5" className="animate-flow" />
          <Box name="DCDB" x={110} />
          <line x1="230" y1="95" x2="265" y2="95" stroke="#f9a21b" strokeWidth="3" strokeDasharray="6 5" className="animate-flow" />
          <rect x="265" y="65" width="70" height="60" rx="10" fill="#f5f7f2" />
          <text x="300" y="138" textAnchor="middle" fontSize="9" fill="#cfd8de" fontFamily="JetBrains Mono">INVERTER</text>
          <line x1="335" y1="95" x2="370" y2="95" stroke="#6db62c" strokeWidth="3" strokeDasharray="6 5" className="animate-flow" />
          <Box name="ACDB" x={370} />
          <line x1="490" y1="95" x2="530" y2="95" stroke="#6db62c" strokeWidth="3" strokeDasharray="6 5" className="animate-flow" />
          <rect x="530" y="70" width="90" height="50" rx="8" fill="#183142" />
          <text x="575" y="99" textAnchor="middle" fontSize="9" fill="#cfd8de" fontFamily="JetBrains Mono">METER/GRID</text>
          <line x1="40" y1="170" x2="600" y2="170" stroke="#6db62c" strokeDasharray="2 4" />
          <text x="320" y="185" textAnchor="middle" fontSize="9" fill="#96cf55" fontFamily="JetBrains Mono">earth bar (frames, SPDs, chassis bonded)</text>
        </svg>
        <m.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-white/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.16em] text-paper/50 uppercase">{d.box}</p>
          <p className="mt-1 text-lg font-semibold">{d.n}</p>
          <p className="mt-1 text-sm text-paper/75">{d.d}</p>
        </m.div>
      </Stage>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <img src="/images/site/inverter-installation-1.webp" alt="Anchor inverter installed between a DC junction box and an AC distribution box" loading="lazy" className="h-56 w-full rounded-2xl object-cover" />
        <div className="grid content-start gap-3">
          <Callout>In this real installation the DC junction box (left) and AC box (right) sit on either side of an Anchor inverter. Cables run in conduit to a common trunking.</Callout>
          <Link to="/category/acdb" className="btn-ghost self-start">
            Enquire about ACDB / DCDB
          </Link>
        </div>
      </div>
    </Block>
  );
}

/* ============================================================ EARTHING */
export function EarthingAndCommissioning() {
  const [cont, setCont] = useState({ chassis: false, spd: false, frame: false });
  const [en, setEn] = useState(0.8);
  const [res, setRes] = useState(2.4);
  const [spdOk, setSpdOk] = useState(true);
  const rating = res <= 1 ? { t: "Excellent", c: "text-verdi-300" } : res <= 5 ? { t: "Acceptable", c: "text-sun-300" } : { t: "Needs improvement", c: "text-[#ff8b7a]" };
  const done = Object.values(cont).filter(Boolean).length + (en <= 2 ? 1 : 0) + (res <= 5 ? 1 : 0) + (spdOk ? 1 : 0);
  return (
    <Block>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="grid content-start gap-4">
          <div className="card p-5">
            <p className="text-sm font-semibold">1 · Continuity to earth bar (≈ 0 Ω)</p>
            <div className="mt-3 grid gap-2">
              {(
                [
                  ["chassis", "Inverter chassis → earth bar"],
                  ["spd", "SPD earth → earth bar"],
                  ["frame", "PV module frames / structure → earth bar"],
                ] as const
              ).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2.5 text-sm">
                  <input type="checkbox" className="size-4 accent-verdi-600" checked={cont[k]} onChange={(e) => setCont({ ...cont, [k]: e.target.checked })} /> {l}
                </label>
              ))}
            </div>
          </div>
          <div className="card grid gap-3 p-5">
            <p className="text-sm font-semibold">2 · Voltage test at the MCB/SPD panel</p>
            <NumberField label="Earth → Neutral" unit="V AC" value={en} step={0.1} min={0} onChange={setEn} hint="Expect about 0–2 V. Live–Earth and Live–Neutral should both read about 230 V" />
            <p className="text-sm font-semibold">3 · Earth resistance (clamp / earth tester)</p>
            <NumberField label="Measured" unit="Ω" value={res} step={0.1} min={0} onChange={setRes} />
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" className="size-4 accent-verdi-600" checked={spdOk} onChange={(e) => setSpdOk(e.target.checked)} /> 4 · SPD indicator shows green (healthy)
            </label>
          </div>
        </div>
        <Stage>
          <p className="font-mono text-[10px] tracking-[0.16em] text-paper/50 uppercase">Commissioning sheet</p>
          <div className="mt-3 flex items-end gap-3">
            <p className="num text-5xl">{done}/6</p>
            <p className="pb-2 text-sm text-paper/60">checks passed</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <m.div className="h-full bg-verdi-400" animate={{ width: `${(done / 6) * 100}%` }} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-paper/55">Earth resistance</p>
              <p className="num text-2xl">{res.toFixed(1)} Ω</p>
              <p className={`text-sm font-semibold ${rating.c}`}>{rating.t}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-paper/55">Earth–Neutral</p>
              <p className="num text-2xl">{en.toFixed(1)} V</p>
              <p className={`text-sm font-semibold ${en <= 2 ? "text-verdi-300" : "text-[#ff8b7a]"}`}>{en <= 2 ? "OK" : "Investigate neutral / earth"}</p>
            </div>
          </div>
          <p className="mt-5 text-xs text-paper/50">Common field targets: ≤ 1 Ω excellent, 1–5 Ω acceptable, &gt; 5 Ω improve. Always follow the project design and applicable standards (e.g. IS 3043), and keep the lightning-arrester earth pit separate where specified.</p>
        </Stage>
      </div>
      <p className="mt-4 text-sm">
        Products:{" "}
        <Link className="font-semibold text-verdi-700 underline" to="/category/earthing-solutions">
          earthing
        </Link>{" "}
        ·{" "}
        <Link className="font-semibold text-verdi-700 underline" to="/category/copper-bonded-rods">
          copper bonded rods
        </Link>{" "}
        ·{" "}
        <Link className="font-semibold text-verdi-700 underline" to="/category/lightning-arresters">
          lightning arresters
        </Link>
      </p>
    </Block>
  );
}

/* ========================================================= POWER FACTOR */
export function PowerFactor() {
  const [pf, setPf] = useState(0.85);
  const [kw, setKw] = useState(10);
  const kva = kw / pf;
  const kvar = Math.sqrt(Math.max(0, kva * kva - kw * kw));
  const W = 260;
  const scale = W / Math.max(kva, 1) / 1.05;
  const bx = kw * scale;
  const by = kvar * scale;
  return (
    <Block>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Stage>
          <svg viewBox="0 0 320 230" className="w-full" aria-label={`Power triangle: ${kw} kW, ${kva.toFixed(1)} kVA, ${kvar.toFixed(1)} kVAR`}>
            <m.path animate={{ d: `M30 200 L${30 + bx} 200 L${30 + bx} ${200 - by} Z` }} fill="#0b8bd420" stroke="none" />
            <m.line x1="30" y1="200" animate={{ x2: 30 + bx }} y2="200" stroke="#6db62c" strokeWidth="5" strokeLinecap="round" />
            <m.line animate={{ x1: 30 + bx, x2: 30 + bx, y2: 200 - by }} y1="200" stroke="#f9a21b" strokeWidth="5" strokeLinecap="round" />
            <m.line x1="30" y1="200" animate={{ x2: 30 + bx, y2: 200 - by }} stroke="#2aa3e6" strokeWidth="5" strokeLinecap="round" />
            <text x="40" y="220" fontSize="11" fill="#96cf55" fontFamily="JetBrains Mono">real {kw} kW</text>
            <m.text animate={{ x: Math.min(250, 34 + bx) }} y={Math.max(30, 200 - by / 2)} fontSize="11" fill="#fec659" fontFamily="JetBrains Mono">
              reactive {kvar.toFixed(1)} kVAR
            </m.text>
            <m.text x="40" animate={{ y: Math.max(20, 190 - by / 2 - 10) }} fontSize="11" fill="#6cc2f0" fontFamily="JetBrains Mono">
              apparent {kva.toFixed(1)} kVA
            </m.text>
          </svg>
        </Stage>
        <div className="grid content-start gap-4">
          <RangeField label="Power factor" value={pf} min={0.5} max={1} step={0.01} onChange={setPf} format={(v) => v.toFixed(2)} />
          <RangeField label="Real power" value={kw} min={1} max={50} onChange={setKw} format={(v) => `${v} kW`} />
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Apparent power" value={`${kva.toFixed(1)} kVA`} accent />
            <Stat label="Current @ 230 V (1-ph)" value={`${((kva * 1000) / 230).toFixed(0)} A`} />
          </div>
          <Callout>PF = kW ÷ kVA. Transformers and generators are rated in kVA; motors and loads in kW. At low PF, more current flows for the same useful work, which means more cable heating and possible utility penalties. Capacitor banks and APFC panels improve PF. Our inverters list an adjustable power factor of 0.8 leading to 0.8 lagging.</Callout>
        </div>
      </div>
    </Block>
  );
}
