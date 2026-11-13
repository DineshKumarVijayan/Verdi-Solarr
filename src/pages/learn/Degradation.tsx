import { useState } from "react";

/** Linear performance warranty curves taken from the two Anchor module datasheets. */
const LINES = [
  { name: "N-Type TOPCon (600–630 Wp)", first: 1, annual: 0.4, color: "#1f8752" },
  { name: "Mono PERC bifacial (540–555 Wp)", first: 2, annual: 0.6, color: "#e2920f" },
];
const warranted = (first: number, annual: number, year: number) => (year === 0 ? 100 : 100 - first - annual * (year - 1));

export function Degradation() {
  const [year, setYear] = useState(25);
  const W = 360;
  const H = 180;
  const x = (y: number) => 34 + (y / 30) * (W - 44);
  const y = (pct: number) => 12 + ((100 - pct) / 25) * (H - 36);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="card p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Warranted output after ${year} years`}>
          {[100, 90, 80].map((p) => (
            <g key={p}>
              <line x1="34" x2={W - 10} y1={y(p)} y2={y(p)} stroke="#e2ded1" />
              <text x="28" y={y(p) + 3} fontSize="8" textAnchor="end" fill="#848b84" fontFamily="JetBrains Mono">
                {p}%
              </text>
            </g>
          ))}
          {LINES.map((l) => (
            <polyline key={l.name} fill="none" stroke={l.color} strokeWidth="2.2" points={Array.from({ length: 31 }, (_, i) => `${x(i)},${y(warranted(l.first, l.annual, i))}`).join(" ")} />
          ))}
          <line x1={x(year)} x2={x(year)} y1="8" y2={H - 20} stroke="#0d1813" strokeDasharray="3 3" />
          <text x={x(year)} y={H - 6} fontSize="8" textAnchor="middle" fill="#0d1813" fontFamily="JetBrains Mono">
            year {year}
          </text>
        </svg>
        <label className="mt-2 block text-xs font-semibold">
          Year <span className="num font-normal">{year}</span>
          <input type="range" min={1} max={30} value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-1 w-full" />
        </label>
      </div>
      <div className="grid content-start gap-3">
        {LINES.map((l) => (
          <div key={l.name} className="rounded-xl border border-line p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="size-2.5 rounded-full" style={{ background: l.color }} /> {l.name}
            </p>
            <p className="num mt-1 text-2xl">{warranted(l.first, l.annual, year).toFixed(1)}%</p>
            <p className="text-xs text-muted">
              warranted after year {year} ({l.first}% first year, {l.annual}%/year after)
            </p>
          </div>
        ))}
        <p className="text-xs text-muted">From the manufacturers’ linear performance warranty figures. Actual degradation varies, and warranty terms apply.</p>
      </div>
    </div>
  );
}
