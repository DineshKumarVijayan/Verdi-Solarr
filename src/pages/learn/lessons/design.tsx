import { useMemo, useState } from "react";
import { Link } from "react-router";
import { relativeOrientationYield } from "../../../../shared/calculators";
import { m } from "../../../components/motion";
import { NumberField, RangeField } from "../../../components/ui";
import { DatasheetDecoder } from "../DatasheetDecoder";
import { MpptCurve } from "../MpptCurve";
import { Block, Callout, Stage, Stat } from "../kit";

/* =============================================================== MPPT */
const STAGES = [
  { n: "DC input", d: "Strings arrive at up to the inverter's max DC voltage." },
  { n: "MPPT tracker", d: "Continuously adjusts the operating voltage to stay at the maximum power point." },
  { n: "DC link", d: "Capacitors hold a stable DC bus voltage." },
  { n: "Inverter bridge", d: "Fast semiconductor switches chop DC into a sine-shaped AC waveform." },
  { n: "Filter & grid sync", d: "Filters smooth the waveform. The inverter matches grid voltage and frequency, and disconnects if the grid fails (anti-islanding)." },
];

export function MpptExplained() {
  const [s, setS] = useState(1);
  return (
    <>
      <Block title="Find the maximum power point" kicker="Interactive I-V curve">
        <MpptCurve />
      </Block>
      <Block title="Inside a grid-tie inverter" kicker="Tap a stage">
        <Stage>
          <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
            {STAGES.map((st, k) => (
              <div key={st.n} className="flex flex-1 items-center gap-2 md:flex-col">
                <button type="button" onClick={() => setS(k)} className={`w-full rounded-2xl border px-3 py-4 text-sm font-semibold transition ${k === s ? "border-sun-400 bg-sun-400 text-ink" : "border-white/15 bg-white/5 hover:border-white/40"}`}>
                  {st.n}
                </button>
                {k < STAGES.length - 1 && (
                  <svg viewBox="0 0 40 10" className="hidden h-3 w-full md:block" aria-hidden="true">
                    <line x1="0" y1="5" x2="40" y2="5" stroke={k < 3 ? "#f9a21b" : "#6db62c"} strokeWidth="2" strokeDasharray="5 4" className="animate-flow" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <m.p key={s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-sm text-paper/80">
            {STAGES[s].d}
          </m.p>
          <svg viewBox="0 0 400 60" className="mt-4 w-full" aria-hidden="true">
            <path d="M0 30 H120" stroke="#f9a21b" strokeWidth="3" />
            <path d={`M140 30 ${Array.from({ length: 12 }, (_, k) => `H${150 + k * 10} V${k % 2 ? 12 : 48}`).join(" ")} H270`} stroke="#cfd8de" strokeWidth="1.5" fill="none" opacity={s >= 3 ? 1 : 0.25} />
            <m.path d={`M280 30 ${Array.from({ length: 60 }, (_, k) => `L${280 + k * 2} ${30 - 18 * Math.sin((k / 60) * Math.PI * 2)}`).join(" ")}`} stroke="#6db62c" strokeWidth="3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: s >= 4 ? 1 : 0 }} />
          </svg>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-paper/50">
            <span>DC</span>
            <span>switched pulses</span>
            <span>grid AC</span>
          </div>
        </Stage>
      </Block>
    </>
  );
}

/* ======================================================= DATASHEET DECODER */
export function DatasheetDecoderLesson() {
  return (
    <>
      <Block>
        <DatasheetDecoder />
      </Block>
      <Block title="Where each value is used" kicker="Design cheat-sheet">
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-paper-2 text-left text-xs text-muted">
              <tr>
                <th className="p-3">Datasheet value</th>
                <th className="p-3">Used for</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Voc + temperature coefficient of Voc", "Maximum modules per string (cold-morning voltage)"],
                ["Vmp", "Keeping the string within the inverter MPPT range"],
                ["Isc", "Fuse, cable and inverter short-circuit current checks"],
                ["Imp", "Inverter input current limit (clipping)"],
                ["Pmax temperature coefficient", "Hot-weather output loss"],
                ["NOCT values", "Realistic field performance"],
                ["Dimensions & weight", "Roof layout and structure design"],
                ["Wind / snow load (Pa)", "Site suitability"],
              ].map(([a, b]) => (
                <tr key={a} className="border-t border-line">
                  <td className="p-3 font-medium">{a}</td>
                  <td className="p-3 text-muted">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm">
          Put it into practice in the <Link className="font-semibold text-verdi-700 underline" to="/solar-tools/kit-builder">kit builder</Link>, which runs these checks with real datasheet values.
        </p>
      </Block>
    </>
  );
}

/* =========================================================== DC/AC RATIO */
export function DcAcRatio() {
  const [ratio, setRatio] = useState(1.25);
  const { pts, clippedPct } = useMemo(() => {
    // clear-day profile, temperature & losses → peak ≈ 0.8 of DC rating reaches inverter
    const pts: { h: number; dc: number }[] = [];
    let total = 0;
    let clipped = 0;
    for (let i = 0; i <= 120; i++) {
      const h = 6 + (i / 120) * 12.5;
      const s = Math.max(0, Math.sin((Math.PI * (h - 6)) / 12.5));
      const dc = ratio * 0.82 * Math.pow(s, 1.2); // per-unit of AC rating
      pts.push({ h, dc });
      total += dc;
      clipped += Math.max(0, dc - 1);
    }
    return { pts, clippedPct: (clipped / total) * 100 };
  }, [ratio]);
  const X = (h: number) => 20 + ((h - 6) / 12.5) * 370;
  const Y = (p: number) => 180 - p * 110;
  return (
    <Block>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Stage>
          <svg viewBox="0 0 400 200" className="w-full" role="img" aria-label={`DC/AC ratio ${ratio.toFixed(2)}, about ${clippedPct.toFixed(1)} percent of energy clipped`}>
            <m.path animate={{ d: `M${pts.map((p) => `${X(p.h)},${Y(p.dc)}`).join(" L")}` }} fill="none" stroke="#f9a21b" strokeWidth="2.5" strokeDasharray="5 4" />
            <m.path animate={{ d: `M${X(6)},180 ${pts.map((p) => `L${X(p.h)},${Y(Math.min(1, p.dc))}`).join(" ")} L${X(18.5)},180 Z` }} fill="#6db62c" opacity="0.35" />
            <m.path animate={{ d: `M${pts.map((p) => `${X(p.h)},${Y(Math.max(1, p.dc))}`).join(" L")} L${X(18.5)},${Y(1)} L${X(6)},${Y(1)} Z` }} fill="#e2453c" opacity="0.5" />
            <line x1="20" x2="390" y1={Y(1)} y2={Y(1)} stroke="#fff" strokeOpacity="0.6" />
            <text x="24" y={Y(1) - 5} fontSize="9" fill="#fff" fontFamily="JetBrains Mono">
              inverter AC limit
            </text>
            <line x1="20" x2="390" y1="180" y2="180" stroke="#ffffff30" />
          </svg>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-paper/70">
            <span>
              <i className="mr-1 inline-block size-2.5 rounded-sm bg-[#f9a21b]" />
              DC available
            </span>
            <span>
              <i className="mr-1 inline-block size-2.5 rounded-sm bg-[#6db62c]" />
              AC delivered
            </span>
            <span>
              <i className="mr-1 inline-block size-2.5 rounded-sm bg-[#e2453c]" />
              clipped
            </span>
          </div>
        </Stage>
        <div className="grid content-start gap-4">
          <RangeField label="DC/AC ratio" value={ratio} min={0.9} max={1.7} step={0.05} onChange={setRatio} format={(v) => v.toFixed(2)} />
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Energy clipped (clear day)" value={`${clippedPct.toFixed(1)}%`} accent />
            <Stat label="Example" value="RENO 3KTLX" sub="3000 W AC · 4200 W max PV → 1.40" />
          </div>
          <Callout>AC capacity is what the grid sees; DC capacity is what the modules can produce. Because modules rarely reach their STC rating (heat, dust, sun angle), moderate oversizing recovers morning and evening energy at the cost of a little clipping at noon. Always stay within the inverter’s datasheet <em>max recommended PV power</em>.</Callout>
          <p className="text-xs text-muted">Illustrative clear-day model. Cloudy days clip less.</p>
        </div>
      </div>
    </Block>
  );
}

/* ====================================================== TILT & ORIENTATION */
export function TiltAndOrientation() {
  const [tilt, setTilt] = useState(13);
  const [az, setAz] = useState(180);
  const rel = useMemo(() => relativeOrientationYield(13, tilt, az), [tilt, az]);
  return (
    <>
      <Block>
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Stage>
            <svg viewBox="0 0 400 220" className="w-full" aria-hidden="true">
              <m.circle r="16" fill="#f9a21b" animate={{ cx: [60, 200, 340], cy: [150, 40, 150] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
              <path d="M40 150 Q200 -60 360 150" fill="none" stroke="#ffffff20" strokeDasharray="4 6" />
              <line x1="60" y1="190" x2="340" y2="190" stroke="#9aa5ad" />
              <m.g animate={{ rotate: -tilt }} style={{ originX: "130px", originY: "190px" }}>
                <rect x="130" y="184" width="150" height="8" rx="2" fill="#1b4f7a" stroke="#6cc2f0" />
              </m.g>
              <text x="300" y="210" fontSize="11" fill="#cfd8de" fontFamily="JetBrains Mono">
                tilt {tilt}°
              </text>
            </svg>
          </Stage>
          <div className="grid content-start gap-4">
            <RangeField label="Tilt" value={tilt} min={0} max={45} onChange={setTilt} format={(v) => `${v}°`} />
            <RangeField label="Facing (azimuth)" value={az} min={90} max={270} step={5} onChange={setAz} format={(v) => `${v}° ${v === 180 ? "South" : v < 180 ? "towards East" : "towards West"}`} />
            <Stat label="Yearly sunlight vs best (Chennai, 13°N)" value={`${(rel * 100).toFixed(0)}%`} accent />
          </div>
        </div>
      </Block>
      <Block title="Rules of thumb" kicker="Quick guide">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Tilt ≈ latitude", "A fixed tilt close to the site latitude maximises annual yield. That is about 13° in Chennai and 28° in Delhi."],
            ["Seasonal mounts", "Summer ≈ latitude − 10–15°, winter ≈ latitude + 10–15° on adjustable structures."],
            ["Never flat", "Keep at least about 10° so rain washes dust off and water doesn’t pool."],
            ["Face south", "In India, south-facing is best. East/west lose a little but spread generation across the day."],
          ].map(([t, d]) => (
            <div key={t} className="card p-4">
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Block>
    </>
  );
}

/* ============================================================== CUF */
export function CufAndPerformance() {
  const [kwp, setKwp] = useState(10);
  const [kwh, setKwh] = useState(15000);
  const cuf = (kwh / (kwp * 8760)) * 100;
  const band = cuf < 13 ? "Below typical rooftop range" : cuf <= 21 ? "Within typical rooftop range" : "Above typical rooftop range. Check the data";
  return (
    <Block>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid content-start gap-4">
          <NumberField label="Installed capacity" unit="kWp" value={kwp} min={0.1} step={0.5} onChange={setKwp} />
          <NumberField label="Energy generated in a year" unit="kWh" value={kwh} min={0} step={100} onChange={setKwh} hint="From the inverter app or meter" />
          <div className="card p-4 font-mono text-sm">
            CUF = {kwh.toLocaleString("en-IN")} ÷ ({kwp} × 8760 h) = <strong>{cuf.toFixed(1)}%</strong>
          </div>
          <Callout>Capacity Utilisation Factor compares actual energy with what the plant would make running at full rated power 24×7. Typical values in India: rooftop about 15–20%, utility scale about 18–25%, and higher with trackers.</Callout>
        </div>
        <Stage className="flex flex-col items-center justify-center">
          <svg viewBox="0 0 240 140" className="w-72" role="img" aria-label={`CUF ${cuf.toFixed(1)} percent`}>
            <path d="M20 120 A100 100 0 0 1 220 120" fill="none" stroke="#ffffff15" strokeWidth="18" />
            <path d="M20 120 A100 100 0 0 1 220 120" fill="none" stroke="#6db62c40" strokeWidth="18" strokeDasharray={`${(Math.PI * 100 * 0.25)} 1000`} strokeDashoffset={-(Math.PI * 100 * 0.5)} />
            <m.line x1="120" y1="120" x2="40" y2="120" stroke="#f9a21b" strokeWidth="4" strokeLinecap="round" style={{ originX: "120px", originY: "120px" }} animate={{ rotate: Math.min(180, (cuf / 30) * 180) }} transition={{ type: "spring", stiffness: 60 }} />
            <circle cx="120" cy="120" r="7" fill="#f9a21b" />
            <text x="20" y="138" fontSize="9" fill="#cfd8de" fontFamily="JetBrains Mono">0%</text>
            <text x="205" y="138" fontSize="9" fill="#cfd8de" fontFamily="JetBrains Mono">30%</text>
          </svg>
          <p className="num mt-2 text-4xl">{cuf.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-paper/70">{band}</p>
          <p className="mt-3 text-xs text-paper/45">Green arc ≈ 15–22% band</p>
        </Stage>
      </div>
    </Block>
  );
}
