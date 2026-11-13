import { useEffect, useState } from "react";

/**
 * Interactive hero visual: drag the time of day and watch an indicative 5 kWp
 * rooftop system respond (sun position → DC output → AC to the building/grid).
 * Clear-sky bell curve for illustration only.
 */
export function EnergyFlow() {
  const [hour, setHour] = useState(11.5);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setHour((h) => (h >= 18.4 ? 6 : +(h + 0.05).toFixed(2))), 90);
    return () => clearInterval(id);
  }, [auto]);

  const t = (hour - 6) / 12.5; // 0..1 across daylight
  const elev = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, t))));
  const dcKw = +(5 * 0.82 * Math.pow(elev, 1.25)).toFixed(2);
  const acKw = +(dcKw * 0.975).toFixed(2);
  const sunX = 40 + t * 400;
  const sunY = 190 - elev * 150;
  const active = dcKw > 0.05;
  const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60) % 60).padStart(2, "0")}`;

  return (
    <figure className="relative">
      <svg viewBox="0 0 480 330" className="w-full" role="img" aria-label={`Illustration: at ${fmt(hour)} an indicative 5 kWp system produces about ${dcKw} kW DC and ${acKw} kW AC.`}>
        <defs>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#ffe0a3" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f5ad2e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="panelGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#1d3b5c" />
            <stop offset="1" stopColor="#24507c" />
          </linearGradient>
        </defs>
        {/* sun path */}
        <path d="M40 190 Q240 -110 440 190" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeDasharray="3 6" />
        <circle cx={sunX} cy={sunY} r={46} fill="url(#sunGlow)" opacity={0.3 + elev * 0.7} />
        <circle cx={sunX} cy={sunY} r={13} fill="#f5ad2e" opacity={0.4 + elev * 0.6} />
        {/* rays to panel */}
        {active && <line x1={sunX} y1={sunY} x2="150" y2="214" stroke="#f5ad2e" strokeOpacity={0.15 + elev * 0.4} strokeWidth="2" strokeDasharray="6 6" className="animate-flow" />}
        {/* roof + panels */}
        <path d="M70 262 L170 196 L270 262 Z" fill="#15251d" stroke="#ffffff" strokeOpacity="0.15" />
        <g transform="translate(80 209) skewY(-33.5)">
          {Array.from({ length: 3 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => (
              <rect key={`${r}${c}`} x={c * 22} y={r * 14 + 6} width="20" height="12" rx="1.5" fill="url(#panelGrad)" stroke="#3aa56c" strokeOpacity={0.3 + elev * 0.7} strokeWidth="0.8" />
            )),
          )}
        </g>
        <rect x="70" y="262" width="200" height="50" fill="#13241c" stroke="#ffffff" strokeOpacity="0.12" />
        <rect x="150" y="280" width="30" height="32" fill="#0d1813" />
        {/* DC line */}
        <path d="M250 250 H318" stroke="#f5ad2e" strokeWidth="3" strokeDasharray="8 8" opacity={active ? 1 : 0.15} className={active ? "animate-flow" : ""} />
        {/* inverter */}
        <rect x="318" y="226" width="54" height="56" rx="9" fill="#f6f4ee" />
        <rect x="333" y="242" width="24" height="18" rx="4" fill="#0d1813" />
        <text x="345" y="255" textAnchor="middle" fontSize="8" fill="#3aa56c" fontFamily="JetBrains Mono, monospace">
          {active ? "ON" : "ZZ"}
        </text>
        {/* AC line to grid */}
        <path d="M372 254 H420 V170" stroke="#3aa56c" strokeWidth="3" fill="none" strokeDasharray="8 8" opacity={active ? 1 : 0.15} className={active ? "animate-flow" : ""} />
        {/* pylon */}
        <path d="M420 170 L405 230 M420 170 L435 230 M410 190 H430 M407 210 H433" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
        <text x="420" y="160" textAnchor="middle" fontSize="9" fill="#ffffff" fillOpacity="0.5" fontFamily="JetBrains Mono, monospace">
          GRID
        </text>
        {/* labels */}
        <g fontFamily="JetBrains Mono, monospace">
          <text x="250" y="240" fontSize="9" fill="#f5ad2e">DC</text>
          <text x="384" y="246" fontSize="9" fill="#3aa56c">AC</text>
        </g>
      </svg>

      <figcaption className="mt-2 grid grid-cols-3 gap-2 text-paper">
        {[
          { k: "Time", v: fmt(hour) },
          { k: "DC output", v: `${dcKw.toFixed(2)} kW` },
          { k: "AC to load / grid", v: `${acKw.toFixed(2)} kW` },
        ].map((x) => (
          <div key={x.k} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="font-mono text-[9px] tracking-[0.16em] text-paper/45 uppercase">{x.k}</p>
            <p className="num text-base">{x.v}</p>
          </div>
        ))}
      </figcaption>
      <div className="mt-3 flex items-center gap-3">
        <label htmlFor="tod" className="font-mono text-[10px] tracking-[0.16em] text-paper/50 uppercase">
          Time of day
        </label>
        <input
          id="tod"
          type="range"
          min={6}
          max={18.5}
          step={0.05}
          value={hour}
          onChange={(e) => {
            setAuto(false);
            setHour(Number(e.target.value));
          }}
          className="flex-1"
        />
      </div>
      <p className="mt-2 text-[11px] text-paper/40">Illustrative 5 kWp clear-day profile. Real output depends on site, weather and system design.</p>
    </figure>
  );
}
