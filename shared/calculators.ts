// Pure, client-side solar maths. All results are INDICATIVE estimates for
// education and enquiry preparation — not engineering design or financial advice.

export interface ApplianceRow {
  name: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
}

export function applianceDailyWh(r: ApplianceRow): number {
  return Math.max(0, r.watts) * Math.max(0, r.quantity) * Math.max(0, Math.min(24, r.hoursPerDay));
}

export function consumptionSummary(rows: ApplianceRow[], tariffPerKwh: number, daysPerMonth = 30) {
  const perRow = rows.map((r) => ({ name: r.name, dailyKwh: applianceDailyWh(r) / 1000 }));
  const dailyKwh = perRow.reduce((s, r) => s + r.dailyKwh, 0);
  const monthlyKwh = dailyKwh * daysPerMonth;
  return { perRow, dailyKwh, monthlyKwh, monthlyCost: monthlyKwh * Math.max(0, tariffPerKwh) };
}

/**
 * Required PV capacity (kWp) for a monthly consumption.
 * specificYield = kWh generated per kWp per day *after* typical system losses.
 * 4.0 is a conservative indicative figure for much of South India; actual values vary by site.
 */
export function requiredCapacityKwp(monthlyKwh: number, specificYield = 4.0, daysPerMonth = 30): number {
  if (monthlyKwh <= 0 || specificYield <= 0) return 0;
  return monthlyKwh / (specificYield * daysPerMonth);
}

export function modulesNeeded(capacityKwp: number, moduleWp: number): number {
  if (capacityKwp <= 0 || moduleWp <= 0) return 0;
  return Math.ceil((capacityKwp * 1000) / moduleWp);
}

export interface SavingsInput {
  capacityKwp: number;
  specificYield: number; // kWh/kWp/day
  monthlyConsumptionKwh: number;
  tariffPerKwh: number; // ₹ saved per self-consumed / net-metered kWh
  exportTariffPerKwh: number; // ₹ credited for surplus kWh (0 if none)
  systemCostRupees?: number | null;
  annualDegradationPct?: number;
}

export function savingsEstimate(i: SavingsInput) {
  const monthlyGen = Math.max(0, i.capacityKwp) * Math.max(0, i.specificYield) * 30;
  const offset = Math.min(monthlyGen, Math.max(0, i.monthlyConsumptionKwh));
  const surplus = Math.max(0, monthlyGen - offset);
  const monthlySavings = offset * i.tariffPerKwh + surplus * i.exportTariffPerKwh;
  const annualSavings = monthlySavings * 12;
  const payback = i.systemCostRupees && annualSavings > 0 ? i.systemCostRupees / annualSavings : null;
  // 25-year cumulative savings with linear degradation (tariff held flat — conservative).
  const d = (i.annualDegradationPct ?? 0.5) / 100;
  let lifetime = 0;
  for (let y = 0; y < 25; y++) lifetime += annualSavings * Math.max(0, 1 - d * y);
  return { monthlyGen, annualGen: monthlyGen * 12, offset, surplus, monthlySavings, annualSavings, payback, lifetime25: lifetime };
}

export interface RoofInput {
  roofLengthM: number;
  roofWidthM: number;
  edgeSetbackM: number; // clearance from parapet / edge
  moduleLengthMm: number;
  moduleWidthMm: number;
  moduleWp: number;
  rowGapM: number; // walkway / shadow gap between rows
}

/** Fit modules in a simple rectangular grid; tries portrait and landscape and returns the better layout. */
export function roofLayout(r: RoofInput) {
  const L = Math.max(0, r.roofLengthM - 2 * r.edgeSetbackM);
  const W = Math.max(0, r.roofWidthM - 2 * r.edgeSetbackM);
  const ml = r.moduleLengthMm / 1000;
  const mw = r.moduleWidthMm / 1000;
  const fit = (along: number, across: number) => {
    // modules side-by-side along L (no gap within a row), rows across W separated by rowGap
    const perRow = along > 0 ? Math.floor(L / along) : 0;
    const rows = across > 0 ? Math.floor((W + r.rowGapM) / (across + r.rowGapM)) : 0;
    return { perRow, rows, count: perRow * rows };
  };
  const portrait = fit(mw, ml);
  const landscape = fit(ml, mw);
  const best = portrait.count >= landscape.count ? { ...portrait, orientation: "portrait" as const } : { ...landscape, orientation: "landscape" as const };
  return {
    ...best,
    usableAreaM2: L * W,
    capacityKwp: (best.count * r.moduleWp) / 1000,
  };
}

export interface BatteryInput {
  capacityAh: number;
  voltage: number;
  usablePct: number; // depth of discharge, e.g. 80 for LiFePO4, 50 for lead-acid
  inverterEfficiencyPct: number;
  loadWatts: number;
}

export function batteryRuntimeHours(b: BatteryInput): { usableWh: number; hours: number } {
  const usableWh = Math.max(0, b.capacityAh) * Math.max(0, b.voltage) * (Math.min(100, Math.max(0, b.usablePct)) / 100);
  const delivered = usableWh * (Math.min(100, Math.max(0, b.inverterEfficiencyPct)) / 100);
  return { usableWh, hours: b.loadWatts > 0 ? delivered / b.loadWatts : 0 };
}

/** Cell temperature estimate from ambient using NOCT method. */
export function cellTemperature(ambientC: number, irradiance = 1000, noctC = 45): number {
  return ambientC + ((noctC - 20) / 800) * irradiance;
}

export interface LossInput {
  soilingPct: number;
  shadingPct: number;
  ambientC: number;
  tempCoeffPctPerC: number; // negative, e.g. -0.29
  inverterEfficiencyPct: number;
  dcCablePct: number;
  acCablePct: number;
  mismatchPct: number;
}

/** Multiplicative loss chain -> performance ratio. */
export function lossWaterfall(i: LossInput) {
  const tCell = cellTemperature(i.ambientC);
  const tempLossPct = Math.max(0, -i.tempCoeffPctPerC * (tCell - 25));
  const steps = [
    { label: "Soiling / dust", pct: i.soilingPct },
    { label: "Shading", pct: i.shadingPct },
    { label: `Temperature (cell ≈ ${tCell.toFixed(0)} °C)`, pct: tempLossPct },
    { label: "Module mismatch", pct: i.mismatchPct },
    { label: "DC cabling", pct: i.dcCablePct },
    { label: "Inverter conversion", pct: 100 - i.inverterEfficiencyPct },
    { label: "AC cabling", pct: i.acCablePct },
  ];
  let remaining = 100;
  const rows = steps.map((s) => {
    const lost = remaining * (Math.min(100, Math.max(0, s.pct)) / 100);
    remaining -= lost;
    return { ...s, lost, remaining };
  });
  return { rows, performanceRatio: remaining / 100, cellTemp: tCell };
}

const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Relative annual irradiation on a tilted plane vs. the best orientation (indicative).
 * Simple clear-sky model: hourly sun positions on 12 representative days, beam + isotropic diffuse.
 * azimuth: 0 = North, 90 = East, 180 = South, 270 = West.
 */
export function annualPlaneIrradiation(latitudeDeg: number, tiltDeg: number, azimuthDeg: number): number {
  const lat = rad(latitudeDeg);
  const beta = rad(tiltDeg);
  const gamma = rad(azimuthDeg - 180); // 0 = due south (northern hemisphere convention)
  let total = 0;
  for (let m = 0; m < 12; m++) {
    const n = 15 + m * 30.4;
    const decl = rad(23.45 * Math.sin(rad((360 * (284 + n)) / 365)));
    for (let h = 5; h <= 19; h += 0.5) {
      const hourAngle = rad(15 * (h - 12));
      const sinAlt = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle);
      if (sinAlt <= 0.02) continue;
      const alt = Math.asin(sinAlt);
      // solar azimuth measured from south, positive west
      let az = Math.acos(Math.min(1, Math.max(-1, (sinAlt * Math.sin(lat) - Math.sin(decl)) / (Math.cos(alt) * Math.cos(lat)))));
      if (hourAngle < 0) az = -az;
      const airMass = 1 / (sinAlt + 0.50572 * Math.pow(rad(6.07995) + alt, -1.6364));
      const dni = 1353 * Math.pow(0.7, Math.pow(airMass, 0.678));
      const cosInc = Math.cos(alt) * Math.sin(beta) * Math.cos(az - gamma) + sinAlt * Math.cos(beta);
      const beam = dni * Math.max(0, cosInc);
      const diffuse = 0.12 * dni * ((1 + Math.cos(beta)) / 2);
      total += (beam + diffuse) * 0.5;
    }
  }
  return total;
}

export function relativeOrientationYield(latitudeDeg: number, tiltDeg: number, azimuthDeg: number): number {
  let best = 0;
  for (let t = 0; t <= 40; t += 2) best = Math.max(best, annualPlaneIrradiation(latitudeDeg, t, 180));
  return annualPlaneIrradiation(latitudeDeg, tiltDeg, azimuthDeg) / best;
}

/** Module power at a given cell temperature using the Pmax temperature coefficient. */
export function powerAtTemperature(pmaxStc: number, tempCoeffPctPerC: number, cellC: number): number {
  return pmaxStc * (1 + (tempCoeffPctPerC / 100) * (cellC - 25));
}

/** Cold-morning string Voc check: Voc rises as temperature falls. */
export function stringVocAtTemp(vocStc: number, tempCoeffVocPctPerC: number, cellC: number, modulesInSeries: number): number {
  return vocStc * (1 + (tempCoeffVocPctPerC / 100) * (cellC - 25)) * modulesInSeries;
}

/** PM Surya Ghar residential CFA (as published 2024): ₹30,000/kW up to 2 kW, ₹18,000 for the 3rd kW, capped at ₹78,000. Verify current rules on pmsuryaghar.gov.in. */
export function residentialSubsidy(kw: number): number {
  const first = Math.min(kw, 2) * 30000;
  const third = Math.min(Math.max(kw - 2, 0), 1) * 18000;
  return Math.min(78000, Math.round(first + third));
}
