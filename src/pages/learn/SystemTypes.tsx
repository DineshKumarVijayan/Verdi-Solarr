import { useState } from "react";

type Mode = "on-grid" | "off-grid" | "hybrid";

const INFO: Record<Mode, { title: string; points: string[]; outage: string }> = {
  "on-grid": {
    title: "On-grid (grid-tie)",
    points: ["Panels → grid-tie inverter → your loads, with surplus exported to the grid (net/gross metering).", "No battery, so it is the lowest-cost and simplest system.", "Most rooftop and C&I systems in India use this design."],
    outage: "During a power cut the inverter switches off (anti-islanding protection) so line workers stay safe.",
  },
  "off-grid": {
    title: "Off-grid",
    points: ["Panels → charge controller / off-grid inverter → battery bank → loads.", "No grid connection, so the battery must be sized for nights and cloudy days.", "Used where the grid is unavailable or unreliable."],
    outage: "There is no grid to lose. Supply lasts as long as the stored energy does.",
  },
  hybrid: {
    title: "Hybrid",
    points: ["Grid-connected, with a hybrid inverter and battery.", "Solar powers loads first, then charges the battery, then exports.", "Combines bill savings with backup for critical loads."],
    outage: "Backed-up loads keep running from the battery (and solar) during an outage.",
  },
};

export function SystemTypes() {
  const [mode, setMode] = useState<Mode>("on-grid");
  const [outage, setOutage] = useState(false);
  const info = INFO[mode];
  const gridOn = mode !== "off-grid" && !outage;
  const invOn = mode === "on-grid" ? gridOn : true;
  const battery = mode !== "on-grid";
  const flow = (on: boolean) => (on ? "animate-flow" : "");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-3xl bg-ink p-4 sm:p-6">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="System type">
          {(Object.keys(INFO) as Mode[]).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => setMode(m)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${mode === m ? "bg-sun-400 text-ink" : "text-paper/70 hover:text-paper"}`}>
              {INFO[m].title}
            </button>
          ))}
          {mode !== "off-grid" && (
            <label className="ml-auto flex items-center gap-2 text-xs text-paper/70">
              <input type="checkbox" checked={outage} onChange={(e) => setOutage(e.target.checked)} className="accent-sun-400" /> Simulate power cut
            </label>
          )}
        </div>
        <svg viewBox="0 0 420 220" className="mt-4 w-full" role="img" aria-label={`${info.title} energy flow diagram`}>
          <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#f6f4ee" fillOpacity="0.7" textAnchor="middle">
            {/* panels */}
            <rect x="20" y="30" width="70" height="44" rx="4" fill="#1d3b5c" stroke="#3aa56c" />
            <text x="55" y="92">PANELS</text>
            {/* inverter */}
            <rect x="170" y="30" width="70" height="50" rx="8" fill={invOn ? "#f6f4ee" : "#3a4a42"} />
            <text x="205" y="98">{mode === "on-grid" ? "GRID-TIE INV." : mode === "off-grid" ? "OFF-GRID INV." : "HYBRID INV."}</text>
            {/* loads */}
            <rect x="330" y="30" width="70" height="50" rx="8" fill="#15251d" stroke="#ffffff" strokeOpacity="0.3" />
            <text x="365" y="98">LOADS</text>
            <circle cx="365" cy="55" r="9" fill={invOn || (battery && outage) ? "#f5ad2e" : "#3a4a42"} />
            {/* grid */}
            {mode !== "off-grid" && (
              <>
                <path d="M365 140 l-12 50 M365 140 l12 50 M357 160 h16 M355 175 h20" stroke="#ffffff" strokeOpacity={gridOn ? 0.6 : 0.2} />
                <text x="365" y="210">{gridOn ? "GRID" : "GRID (OFF)"}</text>
                <path d="M240 70 C 300 70 300 150 352 150" fill="none" stroke="#3aa56c" strokeWidth="2.5" strokeDasharray="6 6" opacity={gridOn ? 1 : 0.15} className={flow(gridOn)} />
              </>
            )}
            {/* battery */}
            {battery && (
              <>
                <rect x="170" y="150" width="70" height="36" rx="6" fill="#15251d" stroke="#f5ad2e" />
                <rect x="176" y="158" width={outage || mode === "off-grid" ? 34 : 56} height="20" rx="3" fill="#3aa56c" />
                <text x="205" y="204">BATTERY</text>
                <path d="M205 80 V150" stroke="#f5ad2e" strokeWidth="2.5" strokeDasharray="6 6" className={flow(true)} />
              </>
            )}
          </g>
          <path d="M90 52 H170" stroke="#f5ad2e" strokeWidth="2.5" strokeDasharray="6 6" opacity={invOn ? 1 : 0.15} className={flow(invOn)} />
          <path d="M240 52 H330" stroke="#3aa56c" strokeWidth="2.5" strokeDasharray="6 6" opacity={invOn ? 1 : 0.15} className={flow(invOn)} />
        </svg>
      </div>
      <div>
        <h4 className="text-xl font-semibold">{info.title}</h4>
        <ul className="mt-3 grid gap-2 text-sm text-ink/80">
          {info.points.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-verdi-500" />
              {p}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-paper-2 p-3 text-sm">
          <strong>Power cut?</strong> {info.outage}
        </p>
      </div>
    </div>
  );
}
