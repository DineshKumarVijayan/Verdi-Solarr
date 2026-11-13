// Indicative compatibility checks for the Kit Builder, using ONLY values present in
// the manufacturer datasheets. Never a substitute for engineering design / certification.

import type { PublicProduct } from "./types";
import { parseNum } from "./search";

export type Level = "ok" | "warn" | "error" | "info";
export interface Check {
  level: Level;
  title: string;
  detail: string;
}

const spec = (p: PublicProduct | undefined, k: string) => p?.specs.find((s) => s.k === k)?.v;
const n = (p: PublicProduct | undefined, k: string) => {
  const v = spec(p, k);
  return v === undefined ? null : parseNum(v);
};
/** "26/13" -> [26, 13]; "65–550" -> [65, 550] */
export function numbers(v: string | undefined): number[] {
  if (!v) return [];
  return (v.match(/\d+(\.\d+)?/g) ?? []).map(Number);
}

export interface KitInput {
  module?: PublicProduct;
  moduleQty: number;
  inverter?: PublicProduct;
  inverterQty: number;
  inverterBrandSlug?: string;
  optimiser?: PublicProduct;
  modulesPerString: number;
  strings: number;
  minCellC: number; // coldest expected cell temperature (morning)
  maxCellC: number; // hottest expected cell temperature
}

export function kitChecks(k: KitInput): Check[] {
  const out: Check[] = [];
  const m = k.module;
  const inv = k.inverter;
  if (!m || !inv) return [{ level: "info", title: "Choose a module and an inverter", detail: "Checks appear once both are selected." }];

  const wp = n(m, "power_wp") ?? 0;
  const voc = n(m, "voc_v");
  const vmp = n(m, "vmp_v");
  const isc = n(m, "isc_a");
  const imp = n(m, "imp_a");
  const tcVoc = n(m, "temp_coeff_voc"); // %/°C (negative)
  const dcW = wp * k.moduleQty;
  const acW = (n(inv, "ac_power_w") ?? 0) * k.inverterQty;
  const maxPv = (n(inv, "max_pv_power_w") ?? 0) * k.inverterQty;

  if (acW > 0) {
    const ratio = dcW / acW;
    out.push({
      level: ratio > 1.5 ? "warn" : "ok",
      title: `DC/AC ratio ${ratio.toFixed(2)}`,
      detail: `${(dcW / 1000).toFixed(2)} kWp of modules on ${(acW / 1000).toFixed(2)} kW of inverter AC capacity.`,
    });
  }
  if (maxPv > 0) {
    out.push(
      dcW > maxPv
        ? { level: "error", title: "Exceeds max. recommended PV power", detail: `${dcW} W of modules is above the datasheet limit of ${maxPv} W for the selected inverter(s).` }
        : { level: "ok", title: "Within max. recommended PV power", detail: `${dcW} W ≤ ${maxPv} W (inverter datasheet).` },
    );
  }

  const usedModules = k.modulesPerString * k.strings;
  if (usedModules !== k.moduleQty) {
    out.push({ level: "warn", title: "String layout doesn’t match quantity", detail: `${k.strings} string(s) × ${k.modulesPerString} = ${usedModules} modules, but ${k.moduleQty} are selected.` });
  }

  const isSolarEdge = k.inverterBrandSlug === "solaredge";
  if (isSolarEdge) {
    const opt = k.optimiser;
    if (!opt) {
      out.push({ level: "error", title: "Power optimisers required", detail: "SolarEdge HD-Wave inverters are designed to work with SolarEdge power optimisers (one per module for S-series)." });
    } else {
      const rated = n(opt, "rated_input_w") ?? 0;
      const vocMax = n(opt, "max_input_voc_v");
      out.push(
        wp > rated
          ? { level: "error", title: "Module too large for optimiser", detail: `${wp} Wp module exceeds the ${spec(opt, "rated_input_w")} W rated input of ${opt.model}.` }
          : { level: "ok", title: "Optimiser rating OK", detail: `${wp} Wp ≤ ${rated} W rated input (${opt.model}).` },
      );
      if (voc !== null && vocMax !== null && tcVoc !== null) {
        const vocCold = voc * (1 + (tcVoc / 100) * (k.minCellC - 25));
        out.push(
          vocCold > vocMax
            ? { level: "error", title: "Module Voc too high for optimiser", detail: `Cold Voc ≈ ${vocCold.toFixed(1)} V exceeds ${vocMax} V absolute max. input.` }
            : { level: "ok", title: "Optimiser input voltage OK", detail: `Cold Voc ≈ ${vocCold.toFixed(1)} V ≤ ${vocMax} V.` },
        );
      }
      const min = /B$/.test(opt.model ?? "") ? 6 : 8;
      if (k.modulesPerString < min || k.modulesPerString > 25) {
        out.push({ level: "error", title: "Optimiser string length", detail: `With single-phase HD-Wave inverters the optimiser datasheet lists ${min}–25 optimisers per string; you have ${k.modulesPerString}.` });
      } else {
        out.push({ level: "ok", title: "Optimiser string length OK", detail: `${k.modulesPerString} per string (datasheet: ${min}–25 for single-phase).` });
      }
    }
    return out;
  }

  // Conventional string inverter checks
  const maxDc = n(inv, "max_dc_voltage_v");
  const mppt = numbers(spec(inv, "mppt_range_v"));
  const mpptMin = mppt.length >= 2 ? mppt[0] : null;
  const mpptMax = mppt.length >= 2 ? mppt[1] : mppt.length === 1 ? mppt[0] : null;
  const mpptCount = n(inv, "mppt_count") ?? 1;
  const iscLimits = numbers(spec(inv, "max_isc_a"));
  const inLimits = numbers(spec(inv, "max_input_current_a"));

  if (voc !== null && tcVoc !== null && maxDc !== null) {
    const vocCold = voc * (1 + (tcVoc / 100) * (k.minCellC - 25)) * k.modulesPerString;
    out.push(
      vocCold > maxDc
        ? { level: "error", title: "String voltage too high", detail: `Cold-morning string Voc ≈ ${vocCold.toFixed(0)} V at ${k.minCellC} °C exceeds the inverter’s ${maxDc} V max. DC voltage. Use fewer modules per string.` }
        : { level: "ok", title: "Max. DC voltage OK", detail: `Cold string Voc ≈ ${vocCold.toFixed(0)} V ≤ ${maxDc} V.` },
    );
  }
  if (vmp !== null && tcVoc !== null && mpptMin !== null) {
    const vmpHot = vmp * (1 + (tcVoc / 100) * (k.maxCellC - 25)) * k.modulesPerString;
    const vmpCold = vmp * (1 + (tcVoc / 100) * (k.minCellC - 25)) * k.modulesPerString;
    if (vmpHot < mpptMin) out.push({ level: "warn", title: "String voltage may fall below MPPT range", detail: `Hot string Vmp ≈ ${vmpHot.toFixed(0)} V is below the ${mpptMin} V MPPT minimum. Add modules per string.` });
    else if (mpptMax !== null && vmpCold > mpptMax) out.push({ level: "warn", title: "String voltage above MPPT range", detail: `Cold string Vmp ≈ ${vmpCold.toFixed(0)} V is above the ${mpptMax} V MPPT maximum.` });
    else out.push({ level: "ok", title: "Within MPPT voltage range", detail: `String Vmp ≈ ${vmpHot.toFixed(0)}–${vmpCold.toFixed(0)} V inside ${mpptMin}–${mpptMax} V.` });
  }
  if (isc !== null && iscLimits.length) {
    const lim = Math.min(...iscLimits);
    out.push(
      isc > lim
        ? { level: "error", title: "Module Isc above inverter limit", detail: `Module Isc ${isc} A exceeds the ${lim} A max. short-circuit current per MPPT (lowest-rated input).` }
        : { level: "ok", title: "Short-circuit current OK", detail: `Module Isc ${isc} A ≤ ${lim} A per MPPT.` },
    );
  }
  if (imp !== null && inLimits.length) {
    const lim = Math.min(...inLimits);
    if (imp > lim) out.push({ level: "warn", title: "Current clipping likely", detail: `Module Imp ${imp} A is above the ${lim} A max. input current per MPPT, so some power will be clipped at high irradiance.` });
  }
  const totalMppt = mpptCount * k.inverterQty;
  if (k.strings > totalMppt * Math.max(1, ...numbers(spec(inv, "strings_per_mppt")))) {
    out.push({ level: "warn", title: "More strings than inputs", detail: `${k.strings} strings for ${totalMppt} MPPT input(s). Check the inverter’s strings per MPPT.` });
  }
  return out;
}
