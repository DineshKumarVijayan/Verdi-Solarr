import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { residentialSubsidy } from "../../../../shared/calculators";
import { m, Stagger, StaggerItem } from "../../../components/motion";
import { NumberField, RangeField } from "../../../components/ui";
import { Block, Callout, Chips, FlipCards, Stage, Stat, StepPlayer } from "../kit";

/* ===================================================== PM SURYA GHAR */
export function PmSuryaGhar() {
  const [type, setType] = useState<"home" | "rwa">("home");
  const [units, setUnits] = useState(250);
  const [kw, setKw] = useState(3);
  const [houses, setHouses] = useState(40);
  const suggested = units <= 150 ? "1–2 kW" : units <= 300 ? "2–3 kW" : "Above 3 kW";
  const subsidy = type === "home" ? residentialSubsidy(kw) : Math.round(Math.min(kw, 500, houses * 3) * 18000);
  return (
    <>
      <Block>
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="grid content-start gap-4">
            <Chips label="Applicant" value={type} onChange={setType} options={[{ v: "home", l: "Residential household" }, { v: "rwa", l: "GHS / RWA (common facilities)" }]} />
            {type === "home" ? (
              <>
                <RangeField label="Average monthly consumption" value={units} min={50} max={800} step={10} onChange={setUnits} format={(v) => `${v} units`} />
                <p className="text-sm">
                  Suggested rooftop size: <strong>{suggested}</strong>
                </p>
                <RangeField label="Planned system size" value={kw} min={1} max={10} step={0.5} onChange={setKw} format={(v) => `${v} kW`} />
              </>
            ) : (
              <>
                <RangeField label="Common-facility system size" value={kw} min={5} max={600} step={5} onChange={setKw} format={(v) => `${v} kW`} />
                <NumberField label="Houses in the society" value={houses} min={1} onChange={(v) => setHouses(Math.max(1, Math.round(v)))} hint="Limit: 3 kW per house, up to 500 kW total" />
              </>
            )}
          </div>
          <Stage>
            <p className="font-mono text-[10px] tracking-[0.16em] text-paper/50 uppercase">Estimated central financial assistance</p>
            <m.p key={subsidy} initial={{ scale: 0.9, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="num mt-2 text-5xl text-sun-300">
              ₹{subsidy.toLocaleString("en-IN")}
            </m.p>
            {type === "home" && (
              <div className="mt-6 grid gap-2">
                {[
                  ["First 2 kW", Math.min(kw, 2) * 30000, "₹30,000 per kW"],
                  ["3rd kW", Math.min(Math.max(kw - 2, 0), 1) * 18000, "₹18,000 per kW"],
                  ["Above 3 kW", 0, "No additional (capped at ₹78,000)"],
                ].map(([l, v, n]) => (
                  <div key={String(l)} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                    <span>
                      {l} <span className="text-xs text-paper/50">· {n}</span>
                    </span>
                    <span className="num">₹{Number(v).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
            {type === "rwa" && <p className="mt-4 text-sm text-paper/70">₹18,000 per kW for common facilities including EV charging, up to 500 kW (at 3 kW per house).</p>}
          </Stage>
        </div>
      </Block>
      <Block title="Suitable plant size" kicker="From the scheme guidance">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sun-100 text-left">
              <tr>
                <th className="p-3">Average monthly consumption</th>
                <th className="p-3">Suitable rooftop capacity</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["0–150 units", "1–2 kW"],
                ["150–300 units", "2–3 kW"],
                ["> 300 units", "Above 3 kW"],
              ].map(([a, b]) => (
                <tr key={a} className={`border-t border-line ${suggested === b ? "bg-verdi-50 font-semibold" : ""}`}>
                  <td className="p-3">{a}</td>
                  <td className="p-3">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Callout tone="warn">
            Subsidy amounts, eligibility (including additional support for special-category states), DCR module requirements and the application process are set by the Government of India and can change. Always confirm on the official portal{" "}
            <a className="inline-flex items-center gap-1 font-semibold underline" href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener">
              pmsuryaghar.gov.in <ExternalLink className="size-3" />
            </a>{" "}
            before planning. Our DCR-marked modules are listed under <Link className="font-semibold underline" to="/products?q=TOPCon">TOPCon</Link>.
          </Callout>
        </div>
      </Block>
    </>
  );
}

/* ======================================================= BATTERY BACKUP */
export function BatteryBackup() {
  const [load, setLoad] = useState(310);
  const [v, setV] = useState(48);
  const [ah, setAh] = useState(200);
  const [dod, setDod] = useState(80);
  const [eff, setEff] = useState(90);
  const kwh = (v * ah) / 1000;
  const usable = kwh * (dod / 100);
  const delivered = usable * (eff / 100);
  const hours = load > 0 ? (delivered * 1000) / load : 0;
  const steps = [
    { title: "Add up the backed-up load", text: <>Example: 2 fans × 75 W + 4 LED × 15 W + laptop 100 W = 310 W.</> },
    { title: "Battery energy", text: <>kWh = V × Ah ÷ 1000. A 48 V, 200 Ah bank = 9.6 kWh.</> },
    { title: "Usable part (depth of discharge)", text: <>Lead-acid ≈ 50% usable, lithium ≈ 80–90%. 9.6 × 0.8 = 7.68 kWh.</> },
    { title: "Inverter & battery efficiency", text: <>About 85–90%. 7.68 × 0.9 ≈ 6.9 kWh delivered. Backup = 6.9 kWh ÷ 0.31 kW ≈ 22 h.</> },
  ];
  return (
    <>
      <Block>
        <StepPlayer
          steps={steps}
          render={(i) => (
            <div className="flex h-full flex-col justify-center gap-4">
              {[
                { l: "Load", v: `${load} W`, on: i >= 0 },
                { l: "Battery energy", v: `${kwh.toFixed(2)} kWh`, on: i >= 1 },
                { l: "Usable", v: `${usable.toFixed(2)} kWh`, on: i >= 2 },
                { l: "Delivered", v: `${delivered.toFixed(2)} kWh`, on: i >= 3 },
              ].map((r) => (
                <m.div key={r.l} animate={{ opacity: r.on ? 1 : 0.25, x: r.on ? 0 : -10 }} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span className="text-sm text-paper/70">{r.l}</span>
                  <span className="num text-xl">{r.v}</span>
                </m.div>
              ))}
              <m.div animate={{ opacity: i >= 3 ? 1 : 0.2 }} className="rounded-2xl bg-sun-400 px-4 py-3 text-ink">
                <span className="text-sm font-semibold">Backup ≈ </span>
                <span className="num text-2xl">{hours.toFixed(1)} h</span>
              </m.div>
            </div>
          )}
        />
      </Block>
      <Block title="Try your own numbers" kicker="Calculator">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <NumberField label="Load" unit="W" value={load} min={1} onChange={setLoad} />
          <NumberField label="Battery voltage" unit="V" value={v} min={1} onChange={setV} />
          <NumberField label="Capacity" unit="Ah" value={ah} min={1} onChange={setAh} />
          <NumberField label="Depth of discharge" unit="%" value={dod} min={10} max={100} onChange={setDod} />
          <NumberField label="Efficiency" unit="%" value={eff} min={50} max={100} onChange={setEff} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Usable energy" value={`${usable.toFixed(2)} kWh`} />
          <Stat label="Delivered energy" value={`${delivered.toFixed(2)} kWh`} />
          <Stat label="Estimated backup" value={`${hours.toFixed(1)} h`} accent />
        </div>
        <p className="mt-3 text-xs text-muted">Indicative only. VERDI does not currently list batteries, so ask us if you need one.</p>
      </Block>
    </>
  );
}

/* ========================================================= MAINTENANCE */
const TASKS = [
  ["Clean the glass", "Soft water and a non-abrasive brush, early morning or evening when modules are cool. No pressure washers or harsh detergents unless the manufacturer allows them."],
  ["Inspect visually", "Look for cracked glass, discoloured cells, damaged cables, and loose or melted MC4 connectors."],
  ["Watch generation", "Compare daily kWh in the inverter app against previous weeks. A sudden drop means investigate."],
  ["Keep inverters breathing", "Natural-convection inverters need clear airflow around them."],
  ["Check protection", "SPD indicators green, breakers healthy, earthing resistance re-measured periodically."],
  ["Follow the manual", "Installation manuals and warranty terms define cleaning and handling rules."],
];

export function Maintenance() {
  const [done, setDone] = useState<Set<number>>(new Set());
  return (
    <Block>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
          <m.div className="h-full bg-verdi-500" animate={{ width: `${(done.size / TASKS.length) * 100}%` }} />
        </div>
        <span className="num text-sm">
          {done.size}/{TASKS.length}
        </span>
      </div>
      <Stagger className="grid gap-3 md:grid-cols-2">
        {TASKS.map(([t, d], k) => (
          <StaggerItem key={t}>
            <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${done.has(k) ? "border-verdi-300 bg-verdi-50" : "border-line bg-card"}`}>
              <input
                type="checkbox"
                className="mt-1 size-4 accent-verdi-600"
                checked={done.has(k)}
                onChange={() =>
                  setDone((s) => {
                    const n = new Set(s);
                    if (n.has(k)) n.delete(k);
                    else n.add(k);
                    return n;
                  })
                }
              />
              <span>
                <span className="font-semibold">{t}</span>
                <span className="mt-1 block text-sm text-muted">{d}</span>
              </span>
            </label>
          </StaggerItem>
        ))}
      </Stagger>
    </Block>
  );
}

/* ================================================================ MYTHS */
const MYTHS: [string, string][] = [
  ["Solar panels don’t work on cloudy days.", "They produce less, but they still produce from diffuse light. Output scales with irradiance and does not switch off."],
  ["A hotter, sunnier day always means more power.", "Heat reduces output. At about −0.3 %/°C, a 60 °C module makes roughly 10% less than its STC rating."],
  ["Panel watts must never exceed the inverter rating.", "Datasheets allow DC oversizing. The 3 kW RENO 3KTLX lists 4200 W maximum recommended PV power."],
  ["On-grid systems keep running in a power cut.", "Grid-tie inverters must shut down when the grid fails (anti-islanding). Backup needs a hybrid or off-grid design."],
  ["Any cable works on the DC side.", "Strings need solar DC cable rated for high DC voltage, UV and heat, such as IS 17293 / EN 50618."],
  ["Solar needs no maintenance.", "Dust, bird droppings and loose connectors cut yield. Periodic cleaning and checks matter."],
  ["Higher wattage always means higher efficiency.", "Wattage also depends on size. Efficiency measures watts per square metre."],
  ["MC4 connectors from any brand are interchangeable.", "Cross-mating can cause poor contact and overheating unless the makers certify compatibility."],
  ["Flat panels on a flat roof are fine.", "A tilt of at least about 10° helps rain clean the glass and improves yield."],
];
export function MythsVsFacts() {
  return (
    <Block>
      <FlipCards items={MYTHS} />
    </Block>
  );
}

/* ============================================================== WARRANTY */
export function WarrantyRegistration() {
  const steps = [
    { title: "Open the portal", text: <>Visit solarwarranty.lsin.panasonic.com.</> },
    { title: "Customer details", text: <>Enter the end customer’s name, address, phone, email, state, pincode and purchase date exactly as on the invoice. Upload the invoice (JPEG, PNG or PDF, max 10 MB).</> },
    { title: "Product details", text: <>Choose the category (modules, inverters, street lights) and product code. Enter the quantity and serial numbers: comma-separated for up to 5, or the Excel bulk-upload template for more.</> },
    { title: "Submit & track", text: <>Accept the terms and submit. A request ID arrives by message and email. Use it with your mobile number to check status and download the certificate.</> },
  ];
  return (
    <Block>
      <StepPlayer
        steps={steps}
        render={(i) => (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <m.p key={i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="num text-7xl text-sun-300">
              {i + 1}
            </m.p>
            <p className="text-xl font-semibold">{steps[i].title}</p>
            <a href="https://solarwarranty.lsin.panasonic.com/" target="_blank" rel="noopener" className="btn-sun btn-sm">
              Open warranty portal <ExternalLink className="size-3.5" />
            </a>
          </div>
        )}
      />
      <p className="mt-4 text-xs text-muted">Registration must be in the end user’s name, not a distributor, dealer or installer. Terms are set by the manufacturer.</p>
    </Block>
  );
}
