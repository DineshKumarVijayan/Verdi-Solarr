import { useMemo, useState } from "react";
import { Link } from "react-router";
import { EnergyFlow } from "../../../components/EnergyFlow";
import { m } from "../../../components/motion";
import { RangeField } from "../../../components/ui";
import { SystemTypes } from "../SystemTypes";
import { Block, Callout, Stage, Stat, StepPlayer } from "../kit";

/* ============================================================ HOW CELLS WORK */
export function HowSolarCellsWork() {
  const steps = [
    { title: "Sunlight arrives", text: "Light is made of packets of energy called photons. An anti-reflective coating helps more of them enter the silicon instead of bouncing off." },
    { title: "Electron–hole pairs form", text: "A photon with enough energy knocks an electron loose from a silicon atom, leaving a positive 'hole' behind." },
    { title: "The junction separates them", text: "Where n-type silicon meets p-type silicon, a built-in electric field (the depletion zone) pushes electrons towards the n-side and holes towards the p-side." },
    { title: "Current flows through the load", text: "Metal contacts collect the electrons. They travel through the external circuit, power the load, and recombine with holes at the back contact. This is direct current (DC)." },
  ];
  return (
    <>
      <Block>
        <StepPlayer steps={steps} render={(i) => <CellDiagram step={i} />} />
      </Block>
      <Block title="Inside a cell" kicker="Anatomy">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Anti-reflective coating", "Gives cells their dark blue/black look and reduces reflection."],
            ["Fingers & busbars", "Thin printed metal lines that collect current from the surface."],
            ["n-type / p-type silicon", "Silicon doped with phosphorus (n) or boron (p) to create the junction."],
            ["Back contact", "Completes the circuit; in bifacial cells it is a grid, so light also enters from behind."],
          ].map(([t, d], k) => (
            <m.div key={t} className="card p-4" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: k * 0.08 }}>
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </m.div>
          ))}
        </div>
      </Block>
    </>
  );
}

function CellDiagram({ step }: { step: number }) {
  const photons = [70, 130, 190, 250];
  return (
    <svg viewBox="0 0 420 300" className="w-full" role="img" aria-label="Cross-section of a solar cell showing photons creating electron-hole pairs">
      <defs>
        <radialGradient id="bulb">
          <stop offset="0" stopColor="#ffe1a6" />
          <stop offset="1" stopColor="#f9a21b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* layers */}
      <rect x="40" y="96" width="260" height="10" fill="#0b8bd4" opacity="0.8" />
      <rect x="40" y="106" width="260" height="56" fill="#1b4f7a" />
      <m.rect x="40" y="162" width="260" height="20" fill="#f9a21b" animate={{ opacity: step >= 2 ? [0.35, 0.8, 0.35] : 0.3 }} transition={{ duration: 1.6, repeat: Infinity }} />
      <rect x="40" y="182" width="260" height="70" fill="#7a3d52" />
      <rect x="40" y="252" width="260" height="10" fill="#9aa5ad" />
      {[80, 150, 220].map((x) => (
        <rect key={x} x={x} y="88" width="8" height="10" fill="#cfd8de" />
      ))}
      <g fontFamily="JetBrains Mono" fontSize="9" fill="#fff">
        <text x="48" y="138">n-type silicon</text>
        <text x="48" y="176" fill="#0a1822">depletion zone (electric field)</text>
        <text x="48" y="222">p-type silicon</text>
        <text x="48" y="282" fill="#9aa5ad">back contact</text>
      </g>
      {/* photons */}
      {photons.map((x, k) => (
        <m.circle key={x} cx={x} r="4" fill="#ffd35c" initial={{ cy: 0, opacity: 0 }} animate={step >= 0 ? { cy: [0, 168], opacity: [0, 1, 1, 0] } : {}} transition={{ duration: 1.6, delay: k * 0.35, repeat: Infinity, repeatDelay: 0.4 }} />
      ))}
      {/* electron-hole pairs */}
      {step >= 1 &&
        [205, 255].map((x, k) => (
          <g key={x}>
            <m.circle cx={x} r="6" fill="#2aa3e6" initial={{ cy: 172 }} animate={step >= 2 ? { cy: [172, 112] } : { cy: 172 }} transition={{ duration: 1.2, delay: k * 0.3, repeat: Infinity, repeatDelay: 0.6 }} />
            <m.circle cx={x + 16} r="6" fill="none" stroke="#ff7a59" strokeWidth="2.5" initial={{ cy: 172 }} animate={step >= 2 ? { cy: [172, 240] } : { cy: 172 }} transition={{ duration: 1.2, delay: k * 0.3, repeat: Infinity, repeatDelay: 0.6 }} />
          </g>
        ))}
      {/* external circuit */}
      <path d="M300 93 H370 V60" fill="none" stroke="#cfd8de" strokeWidth="3" />
      <path d="M300 257 H370 V100" fill="none" stroke="#cfd8de" strokeWidth="3" />
      {step >= 3 && <path d="M300 93 H370 V60" fill="none" stroke="#2aa3e6" strokeWidth="3" strokeDasharray="6 8" className="animate-flow" />}
      {step >= 3 && <path d="M370 100 V257 H300" fill="none" stroke="#2aa3e6" strokeWidth="3" strokeDasharray="6 8" className="animate-flow" />}
      <circle cx="370" cy="80" r="16" fill={step >= 3 ? "#f9a21b" : "#3a4a55"} />
      {step >= 3 && <m.circle cx="370" cy="80" r="40" fill="url(#bulb)" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }} />}
      <text x="392" y="84" textAnchor="start" fontSize="9" fill="#cfd8de" fontFamily="JetBrains Mono">
        LOAD
      </text>
      <g fontFamily="Inter" fontSize="10" fill="#cfd8de">
        <circle cx="250" cy="283" r="5" fill="#2aa3e6" />
        <text x="260" y="287">electron</text>
        <circle cx="325" cy="283" r="5" fill="none" stroke="#ff7a59" strokeWidth="2" />
        <text x="335" y="287">hole</text>
      </g>
    </svg>
  );
}

/* ========================================================== SAND TO PANEL */
const JOURNEY = [
  { title: "Quartz sand", text: "Silica (SiO₂) from quartz is reduced in arc furnaces to metallurgical-grade silicon, about 98–99% pure." },
  { title: "Polysilicon", text: "Chemical purification produces solar-grade polysilicon of extremely high purity, in chunks." },
  { title: "Ingot (Czochralski)", text: "Polysilicon is melted with a dopant. A seed crystal is dipped and slowly pulled while rotating, growing a single-crystal (monocrystalline) ingot." },
  { title: "Wafers", text: "The ingot is squared and sliced with diamond wire into wafers thinner than a fingernail." },
  { title: "Solar cells", text: "Wafers are textured, doped to form the p–n junction, given an anti-reflective coating and screen-printed metal contacts, fired, then tested and graded." },
  { title: "Module", text: "Cells are strung together and laminated between glass and encapsulant (and a back glass or backsheet), then framed and fitted with a junction box." },
];

export function SandToSolarPanel() {
  return (
    <>
      <Block>
        <StepPlayer steps={JOURNEY} render={(i) => <JourneyVisual step={i} />} interval={4200} />
      </Block>
      <Block title="Why it matters to buyers" kicker="Specifying">
        <div className="grid gap-3 sm:grid-cols-3">
          <Callout tone="tip">Cell technology (PERC, TOPCon) decides efficiency, degradation and temperature behaviour. See <Link className="font-semibold underline" to="/learn/cell-technologies">cell technologies</Link>.</Callout>
          <Callout>Laminate build (dual glass vs transparent backsheet) affects weight, durability and bifacial gain.</Callout>
          <Callout tone="warn">Handling damage during manufacture or transport can cause micro-cracks. See <Link className="font-semibold underline" to="/learn/degradation-and-defects">defects</Link>.</Callout>
        </div>
      </Block>
    </>
  );
}

function JourneyVisual({ step }: { step: number }) {
  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <div className="flex gap-1.5">
        {JOURNEY.map((j, k) => (
          <div key={j.title} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <m.div className="h-full bg-sun-400" initial={false} animate={{ width: k <= step ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
          </div>
        ))}
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <svg viewBox="0 0 300 200" className="w-full max-w-md" aria-hidden="true">
          {step === 0 && (
            <m.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <path d="M40 170 Q150 40 260 170 Z" fill="#e8d7a8" />
              {Array.from({ length: 40 }).map((_, k) => (
                <circle key={k} cx={70 + ((k * 37) % 160)} cy={120 + ((k * 17) % 45)} r="2" fill="#c9b27a" />
              ))}
            </m.g>
          )}
          {step === 1 &&
            [
              [90, 120],
              [140, 100],
              [190, 125],
              [120, 150],
              [170, 150],
            ].map(([x, y], k) => (
              <m.polygon key={k} points={`${x},${y - 22} ${x + 24},${y - 6} ${x + 18},${y + 20} ${x - 12},${y + 18} ${x - 20},${y - 4}`} fill="#8a96a3" stroke="#cfd8de" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: k * 0.12 }} />
            ))}
          {step === 2 && (
            <g>
              <path d="M95 150 Q150 200 205 150 V120 H95 Z" fill="#c0392b" opacity="0.6" />
              <m.rect x="135" width="30" rx="8" fill="#aeb8c2" initial={{ y: 118, height: 10 }} animate={{ y: 30, height: 98 }} transition={{ duration: 3.6, ease: "easeOut" }} />
              <line x1="150" y1="0" x2="150" y2="32" stroke="#cfd8de" strokeWidth="2" />
              <m.path d="M120 140 q30 -18 60 0" stroke="#f9a21b" strokeWidth="3" fill="none" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <text x="150" y="190" textAnchor="middle" fill="#cfd8de" fontSize="10" fontFamily="JetBrains Mono">
                ~1414 °C melt · crystal pulled & rotated
              </text>
            </g>
          )}
          {step === 3 &&
            Array.from({ length: 8 }).map((_, k) => (
              <m.rect key={k} y="60" width="70" height="80" rx="10" fill="#7f8b96" stroke="#cfd8de" initial={{ x: 115, opacity: 0 }} animate={{ x: 30 + k * 30, opacity: 1, rotate: -8 }} transition={{ delay: k * 0.08 }} />
            ))}
          {step === 4 && (
            <m.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <rect x="95" y="45" width="110" height="110" rx="12" fill="#1b4f7a" />
              {Array.from({ length: 14 }).map((_, k) => (
                <m.line key={k} x1="100" x2="200" y1={52 + k * 7.5} y2={52 + k * 7.5} stroke="#9fb3c4" strokeWidth="0.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: k * 0.05 }} />
              ))}
              {[125, 150, 175].map((x) => (
                <m.line key={x} x1={x} x2={x} y1="47" y2="153" stroke="#e5ebef" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }} />
              ))}
            </m.g>
          )}
          {step === 5 && (
            <g>
              {[
                ["Glass", "#bfe3f5", 0],
                ["Encapsulant", "#e9edf0", 1],
                ["Cells", "#1b4f7a", 2],
                ["Encapsulant", "#e9edf0", 3],
                ["Back glass / backsheet", "#cfd8de", 4],
              ].map(([n, c, k]) => (
                <m.g key={String(k)} initial={{ y: 0 }} animate={{ y: [0, (Number(k) - 2) * 18, (Number(k) - 2) * 18, 0] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}>
                  <polygon points={`70,${100 + Number(k) * 6} 210,${100 + Number(k) * 6} 240,${80 + Number(k) * 6} 100,${80 + Number(k) * 6}`} fill={String(c)} stroke="#0a1822" strokeWidth="0.5" />
                  <text x="248" y={86 + Number(k) * 6 + (Number(k) - 2) * 0} fontSize="8" fill="#cfd8de" fontFamily="Inter">
                    {n}
                  </text>
                </m.g>
              ))}
            </g>
          )}
        </svg>
      </div>
      <p className="text-center font-mono text-[11px] tracking-[0.16em] text-paper/60 uppercase">
        Stage {step + 1} / {JOURNEY.length} · {JOURNEY[step].title}
      </p>
    </div>
  );
}

/* ========================================================= ENERGY FLOW */
export function SolarEnergyFlow() {
  return (
    <>
      <Block title="A day on a rooftop" kicker="Drag the clock">
        <Stage>
          <div className="mx-auto max-w-2xl">
            <EnergyFlow />
          </div>
        </Stage>
      </Block>
      <Block title="Three ways to connect a system" kicker="Toggle the system type">
        <SystemTypes />
      </Block>
    </>
  );
}

/* ======================================================== PEAK SUN HOURS */
export function PeakSunHours() {
  const [psh, setPsh] = useState(5);
  const [kwp, setKwp] = useState(5);
  const pr = 0.78;
  // Gaussian-ish curve whose area (in kWh/m²) equals psh
  const pts = useMemo(() => {
    const sigma = 2.4;
    const peak = (psh / (sigma * Math.sqrt(2 * Math.PI))) * 1000; // W/m²
    return Array.from({ length: 61 }, (_, i) => {
      const h = 5 + (i / 60) * 14;
      return { h, w: peak * Math.exp(-((h - 12) ** 2) / (2 * sigma ** 2)) };
    });
  }, [psh]);
  const X = (h: number) => 30 + ((h - 5) / 14) * 360;
  const Y = (w: number) => 190 - (w / 1200) * 170;
  const rectW = (psh / 14) * 360;
  return (
    <>
      <Block>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Stage>
            <svg viewBox="0 0 410 215" className="w-full" role="img" aria-label={`Irradiance curve equal in area to ${psh} peak sun hours`}>
              <line x1="30" x2="395" y1={Y(1000)} y2={Y(1000)} stroke="#f9a21b" strokeDasharray="4 4" opacity="0.6" />
              <text x="34" y={Y(1000) - 5} fontSize="9" fill="#f9a21b" fontFamily="JetBrains Mono">
                1000 W/m²
              </text>
              <m.rect animate={{ x: X(12) - rectW / 2, width: rectW }} y={Y(1000)} height={190 - Y(1000)} fill="#f9a21b" opacity="0.22" />
              <m.path animate={{ d: `M${pts.map((p) => `${X(p.h)},${Y(p.w)}`).join(" L")}` }} fill="none" stroke="#6cc2f0" strokeWidth="2.5" />
              <line x1="30" x2="395" y1="190" y2="190" stroke="#ffffff40" />
              {[6, 9, 12, 15, 18].map((h) => (
                <text key={h} x={X(h)} y="205" textAnchor="middle" fontSize="9" fill="#cfd8de" fontFamily="JetBrains Mono">
                  {h}:00
                </text>
              ))}
            </svg>
            <p className="mt-2 text-xs text-paper/60">Blue: sunlight through the day. Amber box: the same energy squeezed into “peak” hours at 1000 W/m². Equal areas.</p>
          </Stage>
          <div className="grid content-start gap-4">
            <RangeField label="Peak sun hours (site)" value={psh} min={3} max={6.5} step={0.1} onChange={setPsh} format={(v) => `${v.toFixed(1)} h`} />
            <RangeField label="System size" value={kwp} min={1} max={50} step={1} onChange={setKwp} format={(v) => `${v} kWp`} />
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Daily energy" value={`${(kwp * psh * pr).toFixed(1)} kWh`} sub={`× PR ${pr}`} accent />
              <Stat label="Per month" value={`${Math.round(kwp * psh * pr * 30)} kWh`} />
            </div>
            <Callout>Daily kWh ≈ kWp × peak sun hours × performance ratio (losses from heat, dust, wiring and conversion). Try the <Link to="/solar-tools/sizing" className="font-semibold underline">sizing tool</Link>.</Callout>
          </div>
        </div>
      </Block>
    </>
  );
}
