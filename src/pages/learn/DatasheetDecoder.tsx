import { useState } from "react";
import { Link } from "react-router";

export const DECODER_TERMS = [
  { k: "Pmax", name: "Maximum power (Pmax)", unit: "Wp", example: "620 Wp (Anchor TOPCon 620)", text: "The module's rated output at Standard Test Conditions (STC): 1000 W/m² irradiance, 25 °C cell temperature, AM 1.5 spectrum. Real rooftops are usually hotter, so output is normally a little lower." },
  { k: "Voc", name: "Open-circuit voltage (Voc)", unit: "V", example: "49.34 V (TOPCon 620)", text: "The voltage with nothing connected and no current flowing. It is the highest voltage the module produces, and it rises on cold mornings, so string Voc must stay below the inverter's maximum DC voltage at the coldest expected temperature." },
  { k: "Isc", name: "Short-circuit current (Isc)", unit: "A", example: "15.63 A (TOPCon 620)", text: "The current when the terminals are shorted (zero voltage). It is used to size fuses and cables and to check the inverter's maximum short-circuit current per MPPT input." },
  { k: "Vmp", name: "Voltage at max power (Vmp)", unit: "V", example: "41.76 V (TOPCon 620)", text: "The voltage at which the module delivers Pmax. The string's Vmp should sit inside the inverter's MPPT voltage range across hot and cold conditions." },
  { k: "Imp", name: "Current at max power (Imp)", unit: "A", example: "14.85 A (TOPCon 620)", text: "The current at the maximum power point. If Imp is higher than the inverter's maximum input current per MPPT, the inverter limits (clips) the current and some power is lost." },
  { k: "Eff", name: "Module efficiency", unit: "%", example: "23.32% (TOPCon 630) vs 21.52% (PERC 555)", text: "The share of sunlight on the module area converted to electricity. Higher efficiency means more watts from the same roof area. It does not mean more energy per rated watt." },
  { k: "TcP", name: "Temperature coefficient of Pmax", unit: "%/°C", example: "−0.29 %/°C (TOPCon) vs −0.309 %/°C (PERC)", text: "How much power is lost for each °C the cell is above 25 °C. At a 60 °C cell temperature, a −0.29 %/°C module loses about 10% versus STC. Smaller (closer to zero) is better in hot climates." },
  { k: "TcV", name: "Temperature coefficient of Voc", unit: "%/°C", example: "−0.25 %/°C (TOPCon 600–630)", text: "How Voc changes with temperature. It is negative, so Voc rises as the module gets colder. Use it to calculate the maximum string voltage." },
  { k: "NOCT", name: "NOCT ratings", unit: "", example: "467.8 W at NOCT (TOPCon 620)", text: "Performance at Nominal Operating Cell Temperature conditions (800 W/m², 20 °C ambient, 1 m/s wind). This is closer to real-world operation than STC." },
  { k: "Bif", name: "Bifaciality factor", unit: "%", example: "80 ± 5% (TOPCon) vs 75 ± 5% (PERC)", text: "Rear-side Pmax divided by front-side Pmax. The actual bifacial gain depends on ground reflectivity (albedo), mounting height and row spacing." },
  { k: "MPPT", name: "MPPT voltage range (inverter)", unit: "V", example: "80–550 V (Anchor INO 4.2–6KTLX)", text: "The DC voltage window in which the inverter can track maximum power. Design strings so their operating voltage stays inside it." },
  { k: "VdcMax", name: "Max. DC input voltage (inverter)", unit: "V", example: "1100 V (Stellar 3–15KTL3X)", text: "The absolute limit for the inverter's DC input. Cold-morning string Voc must never exceed it." },
  { k: "PVmax", name: "Max. recommended PV power", unit: "W", example: "4200 W for the 3 kW RENO 3KTLX", text: "Inverter datasheets often allow more DC (panel) power than the AC rating. This DC/AC oversizing is normal and improves morning and evening yield within the manufacturer's limit." },
];

export function DatasheetDecoder() {
  const [active, setActive] = useState(DECODER_TERMS[0].k);
  const t = DECODER_TERMS.find((x) => x.k === active)!;
  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-col md:overflow-visible" role="tablist" aria-label="Datasheet terms">
        {DECODER_TERMS.map((x) => (
          <button key={x.k} type="button" role="tab" aria-selected={x.k === active} onClick={() => setActive(x.k)} className={`shrink-0 rounded-xl px-3 py-2 text-left text-sm transition ${x.k === active ? "bg-ink text-paper" : "bg-card hover:bg-paper-2"}`}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="card p-6" role="tabpanel">
        <p className="eyebrow">Decoded</p>
        <h4 className="mt-2 text-2xl font-semibold">{t.name}</h4>
        <p className="mt-3 leading-relaxed text-ink/80">{t.text}</p>
        <div className="mt-5 rounded-xl bg-paper-2 p-4">
          <p className="text-[10px] tracking-wider text-subtle uppercase">From a real datasheet</p>
          <p className="num mt-1 text-lg">{t.example}</p>
        </div>
        <Link to="/products?q=TOPCon" className="mt-4 inline-block text-sm font-semibold text-verdi-700 hover:underline">
          See these values on product pages →
        </Link>
      </div>
    </div>
  );
}
