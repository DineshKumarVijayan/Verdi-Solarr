import { useMemo, useState } from "react";

/**
 * Interactive I-V / P-V curve for one real module (Anchor N-Type TOPCon 620 Wp, STC values
 * from the datasheet: Voc 49.34 V, Isc 15.63 A, Vmp 41.76 V, Imp 14.85 A).
 * The curve uses a simple exponential fit through those points — indicative shape only.
 */
const VOC = 49.34;
const ISC = 15.63;
const VMP = 41.76;
const IMP = 14.85;

// Fit I = Isc * (1 - C1 * (exp(V / (C2 * Voc)) - 1))  (standard simplified model)
const C2 = (VMP / VOC - 1) / Math.log(1 - IMP / ISC);
const C1 = (1 - IMP / ISC) * Math.exp(-VMP / (C2 * VOC));
const current = (v: number) => Math.max(0, ISC * (1 - C1 * (Math.exp(v / (C2 * VOC)) - 1)));

export function MpptCurve() {
  const [irr, setIrr] = useState(1000);
  const [v, setV] = useState(30);
  const scaleI = irr / 1000;

  const pts = useMemo(() => {
    const out: { v: number; i: number; p: number }[] = [];
    for (let x = 0; x <= VOC; x += 0.25) {
      const i = current(x) * scaleI;
      out.push({ v: x, i, p: x * i });
    }
    return out;
  }, [scaleI]);
  const mpp = pts.reduce((a, b) => (b.p > a.p ? b : a));
  const i = current(v) * scaleI;
  const p = v * i;
  const W = 360;
  const H = 200;
  const x = (vv: number) => 30 + (vv / 52) * (W - 40);
  const yI = (ii: number) => H - 20 - (ii / 17) * (H - 40);
  const yP = (pp: number) => H - 20 - (pp / 700) * (H - 40);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="card p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`I-V and P-V curve. At ${v.toFixed(1)} volts the module delivers ${p.toFixed(0)} watts; the maximum power point is ${mpp.p.toFixed(0)} watts at ${mpp.v.toFixed(1)} volts.`}>
          <line x1="30" y1={H - 20} x2={W - 10} y2={H - 20} stroke="#d9d4c4" />
          <line x1="30" y1="10" x2="30" y2={H - 20} stroke="#d9d4c4" />
          <polyline points={pts.map((q) => `${x(q.v)},${yI(q.i)}`).join(" ")} fill="none" stroke="#1d3b5c" strokeWidth="2" />
          <polyline points={pts.map((q) => `${x(q.v)},${yP(q.p)}`).join(" ")} fill="none" stroke="#e2920f" strokeWidth="2" />
          <circle cx={x(mpp.v)} cy={yP(mpp.p)} r="5" fill="#1f8752" />
          <text x={x(mpp.v) + 8} y={yP(mpp.p) - 6} fontSize="9" fill="#1f8752" fontFamily="JetBrains Mono">
            MPP
          </text>
          <line x1={x(v)} y1="10" x2={x(v)} y2={H - 20} stroke="#0d1813" strokeDasharray="3 3" />
          <circle cx={x(v)} cy={yP(p)} r="4" fill="#0d1813" />
          <g fontSize="8" fill="#5d665f" fontFamily="JetBrains Mono">
            <text x={W - 12} y={H - 6} textAnchor="end">Voltage (V)</text>
            <text x="34" y="18">Current (A) — blue · Power (W) — amber</text>
          </g>
        </svg>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Operating voltage <span className="num font-normal">{v.toFixed(1)} V</span>
            <input type="range" className="mt-1 w-full" min={0} max={VOC} step={0.1} value={v} onChange={(e) => setV(Number(e.target.value))} />
          </label>
          <label className="text-xs font-semibold">
            Irradiance <span className="num font-normal">{irr} W/m²</span>
            <input type="range" className="mt-1 w-full" min={200} max={1000} step={50} value={irr} onChange={(e) => setIrr(Number(e.target.value))} />
          </label>
        </div>
      </div>
      <div>
        <dl className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-paper-2 p-3">
            <dt className="text-[10px] text-subtle uppercase">Your point</dt>
            <dd className="num text-lg">{p.toFixed(0)} W</dd>
          </div>
          <div className="rounded-xl bg-verdi-50 p-3">
            <dt className="text-[10px] text-subtle uppercase">MPP</dt>
            <dd className="num text-lg text-verdi-700">{mpp.p.toFixed(0)} W</dd>
          </div>
          <div className="rounded-xl bg-paper-2 p-3">
            <dt className="text-[10px] text-subtle uppercase">Captured</dt>
            <dd className="num text-lg">{((p / mpp.p) * 100).toFixed(0)}%</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-ink/80">
          A module’s power is <strong>voltage × current</strong>. Too low a voltage wastes the voltage you could have used, and too high a voltage makes the current collapse. The <strong>maximum power point</strong> sits at the knee of the curve. An inverter’s <strong>MPPT</strong> keeps adjusting the operating voltage to stay there as sunlight and temperature change.
        </p>
        <p className="mt-3 text-xs text-muted">Curve shape fitted to the STC values of the Anchor N-Type TOPCon 620 Wp datasheet. For learning only.</p>
      </div>
    </div>
  );
}
