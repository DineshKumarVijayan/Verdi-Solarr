// =============================================================================
// VERDI SOLARR SOLUTION — Phase 1 catalogue source (seed data for D1)
// -----------------------------------------------------------------------------
// Every technical value below is transcribed from the manufacturer PDF named in
// `datasheet`. Nothing here is invented. NO PRICES are defined here: prices live
// only in D1 (ProductPrices) and are entered by an administrator.
//
// This file is used by:
//   - scripts/generate-seed.mjs  -> seed/seed.sql (idempotent upsert into D1)
//   - scripts/prerender.mjs      -> static SEO HTML for product/category pages
// After the initial import, D1 is the authoritative source. Re-running the seed
// never overwrites prices and never deletes rows.
// =============================================================================

export const brands = [
  {
    slug: "anchor-by-panasonic",
    name: "Anchor by Panasonic",
    description:
      "Solar modules, string inverters, solar DC cables and solar street lights from Panasonic Life Solutions India Pvt. Ltd. (PLSIND).",
  },
  {
    slug: "solaredge",
    name: "SolarEdge",
    description: "Module-level power optimisers and HD-Wave single-phase inverters from SolarEdge Technologies.",
  },
];

// Database-driven categories. Order = SortOrder.
export const categories = [
  { slug: "solar-panels", name: "Solar Panels", description: "Monocrystalline PERC and N-Type TOPCon bifacial PV modules." },
  { slug: "solar-inverters", name: "Solar Inverters", description: "Single-phase and three-phase grid-tie string inverters." },
  { slug: "power-optimisers", name: "Power Optimisers", description: "Module-level DC optimisers for SolarEdge systems." },
  { slug: "acdb", name: "ACDB", description: "AC distribution boxes for the inverter-to-grid side." },
  { slug: "dcdb", name: "DCDB", description: "DC distribution / combiner boxes for the array-to-inverter side." },
  { slug: "solar-dc-cables", name: "Solar DC Cables", description: "UV-resistant, halogen-free cables rated for PV DC voltage." },
  { slug: "ac-cables", name: "AC Cables", description: "AC wiring from the inverter to the distribution board." },
  { slug: "single-core-cables", name: "Single Core Cables", description: "Single-core building and panel wiring." },
  { slug: "earthing-solutions", name: "Earthing Solutions", description: "Earthing kits and accessories for PV systems." },
  { slug: "lightning-arresters", name: "Lightning Arresters", description: "Lightning protection for rooftop and ground-mount arrays." },
  { slug: "copper-bonded-rods", name: "Copper Bonded Rods", description: "Copper bonded earthing electrodes." },
  { slug: "earthing-compound", name: "Earthing Compound", description: "Backfill compound to lower earth resistance." },
  { slug: "mc4-connectors", name: "MC4 Connectors", description: "PV connectors for module and string interconnection." },
  { slug: "solar-street-lights", name: "Solar Street Lights", description: "All-in-one and hybrid solar LED street lights." },
  { slug: "solar-accessories", name: "Solar Accessories", description: "Mounting, wiring and installation accessories." },
];

const ANCHOR_MAKER_NOTE = "Manufactured for and under quality control by Panasonic Life Solutions India Pvt. Ltd.";

/**
 * Series = a datasheet family. Each variant becomes one Product row (its own price).
 * spec tuple: [key, label, value, unit?, group?]
 * `group` is used to organise the spec table on product pages.
 */
export const series = [
  // ---------------------------------------------------------------- MODULES
  {
    key: "anchor-topcon-600-630",
    brand: "anchor-by-panasonic",
    category: "solar-panels",
    name: "N-Type TOPCon Dual Glass Bifacial Module",
    modelPattern: "PE-132-XXXTHGB-G12R",
    datasheet: "/datasheets/anchor-n-type-topcon-bifacial-600-630wp.pdf",
    featured: true,
    short: "132 half-cell N-Type TOPCon dual-glass bifacial module, 600–630 Wp, up to 23.32% efficiency.",
    description:
      "A 132 half-cell N-Type TOPCon module with dual-glass bifacial construction, built for ground-mount and commercial & industrial projects. The datasheet lists a -0.29 %/°C power temperature coefficient, zero LID loss for N-Type TOPCon, PID resistance, and a bifaciality factor of 80% ± 5%. The datasheet marks it as available in DCR. " +
      ANCHOR_MAKER_NOTE +
      " Manufactured by Premier Energies Global Environment Private Limited.",
    highlights: [
      "Up to 23.32% module efficiency (630 Wp)",
      "12-year product warranty, 30-year performance warranty",
      "1% first-year, 0.4% annual degradation (linear warranty)",
      "Bifaciality factor 80% ± 5%",
      "Tested for 2400 Pa wind / 5400 Pa snow load",
      "Available in DCR (per datasheet)",
    ],
    shared: [
      ["cell_technology", "Cell technology", "N-Type TOPCon, G12R 210.0 × 182.3 mm", null, "Mechanical"],
      ["cell_count", "Number of cells", "132 (11×6 || 11×6)", null, "Mechanical"],
      ["dimensions_mm", "Dimensions", "2382 × 1134 × 35", "mm", "Mechanical"],
      ["weight_kg", "Weight", "33.5", "kg", "Mechanical"],
      ["front_glass", "Front glass", "2.0 mm anti-reflection coating", null, "Mechanical"],
      ["rear_cover", "Rear cover", "2.0 mm heat-strengthened glass", null, "Mechanical"],
      ["frame", "Frame", "Anodized aluminium alloy", null, "Mechanical"],
      ["junction_box", "Junction box", "3 split, IP68 rated", null, "Mechanical"],
      ["output_cables", "Output cables", "4.0 mm², 400 mm length", null, "Mechanical"],
      ["connectors", "Connectors", "MC4 compatible", null, "Mechanical"],
      ["max_system_voltage_v", "Maximum system voltage", "1500", "V DC", "Electrical (STC)"],
      ["max_series_fuse_a", "Maximum series fuse rating", "30", "A", "Electrical (STC)"],
      ["power_tolerance", "Power tolerance", "0 ~ +5", "Wp", "Electrical (STC)"],
      ["operating_temp", "Operating temperature", "-40 ~ +85", "°C", "Electrical (STC)"],
      ["temp_coeff_pmax", "Temperature coefficient of Pmax", "-0.29", "%/°C", "Temperature"],
      ["temp_coeff_voc", "Temperature coefficient of Voc", "-0.25", "%/°C", "Temperature"],
      ["temp_coeff_isc", "Temperature coefficient of Isc", "+0.045", "%/°C", "Temperature"],
      ["bifaciality", "Bifaciality factor", "80 ± 5", "%", "Warranty & quality"],
      ["product_warranty", "Product warranty", "12", "years", "Warranty & quality"],
      ["performance_warranty", "Performance warranty", "30", "years", "Warranty & quality"],
      ["first_year_degradation", "First-year degradation", "1", "%", "Warranty & quality"],
      ["annual_degradation", "Annual degradation", "0.4", "%", "Warranty & quality"],
      ["pieces_per_pallet", "Pieces per pallet", "31", null, "Packaging"],
      ["pieces_per_container", "Pieces per 40FT container", "620", null, "Packaging"],
    ],
    variants: [
      [600, 41.03, 48.79, 14.63, 15.6, 22.21, 452.8],
      [605, 41.21, 48.93, 14.68, 15.61, 22.4, 456.5],
      [610, 41.39, 49.06, 14.74, 15.62, 22.58, 460.3],
      [615, 41.57, 49.2, 14.79, 15.62, 22.76, 464],
      [620, 41.76, 49.34, 14.85, 15.63, 22.95, 467.8],
      [625, 41.94, 49.47, 14.9, 15.64, 23.13, 471.6],
      [630, 42.13, 49.61, 14.96, 15.65, 23.32, 475.4],
    ].map(([wp, vmp, voc, imp, isc, eff, noct]) => ({
      variant: `${wp} Wp`,
      sku: `VS-ANC-TOPCON-${wp}`,
      specs: moduleSpecs({ wp, vmp, voc, imp, isc, eff, noct }),
    })),
  },
  {
    key: "anchor-perc-540-555",
    brand: "anchor-by-panasonic",
    category: "solar-panels",
    name: "Mono PERC Bifacial Module (Transparent Backsheet)",
    modelPattern: "RSBXXXWC",
    datasheet: "/datasheets/anchor-mono-perc-bifacial-540-555wp.pdf",
    featured: true,
    short: "144 half-cut Mono PERC bifacial module with transparent backsheet, 540–555 Wp, up to 21.52% efficiency.",
    description:
      "A 144 half-cut cell Mono PERC bifacial module with a transparent backsheet, suited to residential and commercial & industrial installations. The datasheet lists resistance to LID and PID, an IP68 junction box, and a bifaciality factor of 75% ± 5%. " +
      ANCHOR_MAKER_NOTE +
      " Manufactured by Rayzon Solar Limited.",
    highlights: [
      "Up to 21.52% module efficiency (555 Wp)",
      "12-year product warranty, 30-year performance warranty",
      "2% first-year, 0.6% annual degradation (linear warranty)",
      "Bifaciality factor 75% ± 5%",
      "Tested for 2400 Pa wind / 5400 Pa snow load",
    ],
    shared: [
      ["cell_technology", "Cell technology", "Mono PERC bifacial, 91 × 182 mm", null, "Mechanical"],
      ["cell_count", "Number of cells", "144 (12×6 || 12×6)", null, "Mechanical"],
      ["dimensions_mm", "Dimensions", "2278 × 1133 × 40", "mm", "Mechanical"],
      ["weight_kg", "Weight", "27.2 ± 5%", "kg", "Mechanical"],
      ["front_glass", "Front glass", "3.2 mm ARC-coated low-iron tempered glass", null, "Mechanical"],
      ["rear_cover", "Rear cover", "Transparent backsheet", null, "Mechanical"],
      ["frame", "Frame", "Anodized aluminium alloy", null, "Mechanical"],
      ["junction_box", "Junction box", "3 split, IP68 rated", null, "Mechanical"],
      ["output_cables", "Output cables", "4.0 mm², (−) 300 mm and (+) 300 mm", null, "Mechanical"],
      ["connectors", "Connectors", "MC4 compatible", null, "Mechanical"],
      ["max_system_voltage_v", "Maximum system voltage", "1500", "V DC", "Electrical (STC)"],
      ["max_series_fuse_a", "Maximum series fuse rating", "25", "A", "Electrical (STC)"],
      ["power_tolerance", "Power tolerance", "0 ~ +5", "Wp", "Electrical (STC)"],
      ["operating_temp", "Operating temperature", "-40 ~ +85", "°C", "Electrical (STC)"],
      ["temp_coeff_pmax", "Temperature coefficient of Pmax", "-0.309", "%/°C", "Temperature"],
      ["temp_coeff_voc", "Temperature coefficient of Voc", "-0.237", "%/°C", "Temperature"],
      ["temp_coeff_isc", "Temperature coefficient of Isc", "+0.0442", "%/°C", "Temperature"],
      ["bifaciality", "Bifaciality factor", "75 ± 5", "%", "Warranty & quality"],
      ["product_warranty", "Product warranty", "12", "years", "Warranty & quality"],
      ["performance_warranty", "Performance warranty", "30", "years", "Warranty & quality"],
      ["first_year_degradation", "First-year degradation", "2", "%", "Warranty & quality"],
      ["annual_degradation", "Annual degradation", "0.6", "%", "Warranty & quality"],
      ["pieces_per_pallet", "Pieces per pallet", "27", null, "Packaging"],
      ["pieces_per_container", "Pieces per 40FT container", "594", null, "Packaging"],
    ],
    variants: [
      [540, 41.86, 49.78, 12.91, 13.53, 20.94],
      [545, 42.01, 49.91, 12.98, 13.59, 21.13],
      [550, 42.14, 50.06, 13.06, 13.65, 21.32],
      [555, 42.28, 50.2, 13.13, 13.71, 21.52],
    ].map(([wp, vmp, voc, imp, isc, eff]) => ({
      variant: `${wp} Wp`,
      sku: `VS-ANC-PERC-${wp}`,
      specs: moduleSpecs({ wp, vmp, voc, imp, isc, eff }),
    })),
  },

  // -------------------------------------------------------------- INVERTERS
  {
    key: "anchor-reno",
    brand: "anchor-by-panasonic",
    category: "solar-inverters",
    name: "RENO Residential Single-Phase PV Inverter",
    modelPattern: "1K~3.3KTLX",
    datasheet: "/datasheets/anchor-reno-1k-3-3ktlx.pdf",
    short: "Compact single-phase grid-tie inverter, 1–3.3 kW, single MPPT, up to 97.6% efficiency, IP65.",
    description:
      "A lightweight, low-noise single-phase grid-tie inverter for residential rooftops. Plug & play with quick configuration through an OLED display, natural convection cooling and an IP65 enclosure for outdoor installation. " +
      ANCHOR_MAKER_NOTE,
    highlights: ["Up to 97.6% maximum efficiency", "OLED display, Wi-Fi + app (Wi-Fi optional)", "IP65, natural convection, ≤25 dB(A)", "10-year warranty"],
    shared: [
      ["phase", "Grid connection", "Single phase", null, "Output (AC)"],
      ["nominal_ac_voltage", "Nominal AC voltage (range)", "230 (180–280)", "V", "Output (AC)"],
      ["ac_frequency", "AC grid frequency (range)", "50 (45–55)", "Hz", "Output (AC)"],
      ["power_factor", "Adjustable power factor", "0.8 leading … 0.8 lagging", null, "Output (AC)"],
      ["thdi", "THDi", "<3", "%", "Output (AC)"],
      ["mppt_count", "Number of MPPT", "1", null, "Input (DC)"],
      ["strings_per_mppt", "PV strings per MPPT", "1", null, "Input (DC)"],
      ["max_input_current_a", "Max. input current per MPPT", "13", "A", "Input (DC)"],
      ["max_isc_a", "Max. short-circuit current per MPPT", "16", "A", "Input (DC)"],
      ["mppt_efficiency", "MPPT efficiency", "99.9", "%", "Efficiency"],
      ["dimensions_mm", "Dimensions (W/H/D)", "274 / 254 / 138", "mm", "General"],
      ["protection", "Protection degree", "IP65", null, "General"],
      ["cooling", "Cooling", "Natural convection", null, "General"],
      ["topology", "Topology", "Transformerless", null, "General"],
      ["operating_temp", "Operating temperature", "-25 … +60", "°C", "General"],
      ["noise", "Noise emission (typical)", "≤25", "dB(A)", "General"],
      ["dc_connection", "DC connection", "H4", null, "General"],
      ["display", "Display", "OLED + LED / Wi-Fi + App", null, "General"],
      ["interfaces", "Interfaces RS485 / USB / Wi-Fi / GPRS", "Yes / Yes / Optional / Optional", null, "General"],
      ["warranty", "Warranty", "10", "years", "General"],
      ["standards", "Standards", "IEC 61000, IEC 61727, IEC 62116, IEC 60068, IEC 61683, IEC 62109", null, "General"],
    ],
    variants: [
      ["1KTLX", 1000, 1400, 500, 50, 180, "50–500", 4.8, 97.4, 96.5, "6"],
      ["2KTLX", 2000, 2800, 500, 50, 360, "50–500", 9.5, 97.4, 97.0, "6"],
      ["3KTLX", 3000, 4200, 550, 80, 360, "65–550", 14.3, 97.6, 97.1, "6.2"],
      ["3.3KTLX", 3300, 4290, 550, 80, 360, "65–550", 14.3, 97.6, 97.1, "6.2"],
    ].map(([model, ac, pv, vmax, vstart, vnom, mpp, iout, eff, euro, kg]) => ({
      variant: model,
      model,
      sku: `VS-ANC-RENO-${model.replace(".", "")}`,
      specs: [
        ["ac_power_w", "AC nominal power", String(ac), "W", "Output (AC)"],
        ["ac_apparent_va", "Max. AC apparent power", String(ac), "VA", "Output (AC)"],
        ["max_output_current_a", "Max. output current", String(iout), "A", "Output (AC)"],
        ["max_pv_power_w", "Max. recommended PV power (module STC)", String(pv), "W", "Input (DC)"],
        ["max_dc_voltage_v", "Max. DC voltage", String(vmax), "V", "Input (DC)"],
        ["start_voltage_v", "Start voltage", String(vstart), "V", "Input (DC)"],
        ["nominal_dc_voltage_v", "Nominal voltage", String(vnom), "V", "Input (DC)"],
        ["mppt_range_v", "MPP voltage range", mpp, "V", "Input (DC)"],
        ["max_efficiency_pct", "Max. efficiency", String(eff), "%", "Efficiency"],
        ["euro_efficiency_pct", "European efficiency", String(euro), "%", "Efficiency"],
        ["weight_kg", "Weight", kg, "kg", "General"],
      ],
    })),
  },
  {
    key: "anchor-ino",
    brand: "anchor-by-panasonic",
    category: "solar-inverters",
    name: "INO Residential Single-Phase PV Inverter",
    modelPattern: "4.2K~6KTLX",
    datasheet: "/datasheets/anchor-ino-4-2k-6ktlx.pdf",
    short: "Single-phase grid-tie inverter, 4.2–6 kW, dual MPPT for better shade performance, up to 98.4% efficiency.",
    description:
      "A single-phase residential grid-tie inverter with dual MPPT for better performance on partially shaded or split-orientation roofs. Plug & play with OLED configuration and an IP65 enclosure. " +
      ANCHOR_MAKER_NOTE,
    highlights: ["Dual MPPT for better shade performance", "Up to 98.4% maximum efficiency", "IP65, natural convection", "10-year warranty"],
    shared: [
      ["phase", "Grid connection", "Single phase", null, "Output (AC)"],
      ["nominal_ac_voltage", "Nominal AC voltage (range)", "230 (180–280)", "V", "Output (AC)"],
      ["ac_frequency", "AC grid frequency (range)", "50 (45–55)", "Hz", "Output (AC)"],
      ["power_factor", "Adjustable power factor", "0.8 leading … 0.8 lagging", null, "Output (AC)"],
      ["thdi", "THDi", "<3", "%", "Output (AC)"],
      ["max_dc_voltage_v", "Max. DC voltage", "550", "V", "Input (DC)"],
      ["nominal_dc_voltage_v", "Nominal voltage", "360", "V", "Input (DC)"],
      ["mppt_range_v", "MPPT voltage range", "80–550", "V", "Input (DC)"],
      ["mppt_count", "Number of MPPT", "2", null, "Input (DC)"],
      ["strings_per_mppt", "PV strings per MPPT", "1", null, "Input (DC)"],
      ["max_input_current_a", "Max. input current per MPPT", "12.5", "A", "Input (DC)"],
      ["max_isc_a", "Max. short-circuit current per MPPT", "16", "A", "Input (DC)"],
      ["max_efficiency_pct", "Max. efficiency", "98.4", "%", "Efficiency"],
      ["euro_efficiency_pct", "European efficiency", "97.5", "%", "Efficiency"],
      ["mppt_efficiency", "MPPT efficiency", "99.9", "%", "Efficiency"],
      ["dimensions_mm", "Dimensions (W/H/D)", "375 / 350 / 160", "mm", "General"],
      ["weight_kg", "Weight", "10.8", "kg", "General"],
      ["protection", "Protection degree", "IP65", null, "General"],
      ["cooling", "Cooling", "Natural convection", null, "General"],
      ["topology", "Topology", "Transformerless", null, "General"],
      ["operating_temp", "Operating temperature", "-25 … +60", "°C", "General"],
      ["noise", "Noise emission (typical)", "35", "dB(A)", "General"],
      ["display", "Display", "OLED + LED / Wi-Fi + App", null, "General"],
      ["warranty", "Warranty", "10", "years", "General"],
      ["standards", "Standards", "IEC 61000, IEC 61727, IEC 62116, IEC 60068, IEC 61683, IEC 62109", null, "General"],
    ],
    variants: [
      ["4.2KTLX", 4200, 5880, 19],
      ["5KTLX", 5000, 7000, 22.7],
      ["6KTLX", 6000, 8100, 27.2],
    ].map(([model, ac, pv, iout]) => ({
      variant: model,
      model,
      sku: `VS-ANC-INO-${model.replace(".", "")}`,
      specs: [
        ["ac_power_w", "AC nominal power", String(ac), "W", "Output (AC)"],
        ["ac_apparent_va", "Max. AC apparent power", String(ac), "VA", "Output (AC)"],
        ["max_output_current_a", "Max. output current", String(iout), "A", "Output (AC)"],
        ["max_pv_power_w", "Max. recommended PV power (module STC)", String(pv), "W", "Input (DC)"],
      ],
    })),
  },
  {
    key: "anchor-stellar",
    brand: "anchor-by-panasonic",
    category: "solar-inverters",
    name: "Stellar Three-Phase Grid-Tie Inverter",
    modelPattern: "3K~15KTL3X",
    datasheet: "/datasheets/anchor-stellar-3k-15ktl3x.pdf",
    featured: true,
    short: "Three-phase grid-tie inverter, 3–15 kW, dual MPPT, up to 98.6% efficiency, IP66, designed for C5 corrosion protection.",
    description:
      "A three-phase (3W+N+PE) grid-tie string inverter for homes, shops and small C&I rooftops. Dual MPPT for better shade performance, an IP66 enclosure designed for C5 corrosion protection, plug & play OLED configuration and 25 years of data storage over cloud (per datasheet). " +
      ANCHOR_MAKER_NOTE,
    highlights: ["Dual MPPT", "Up to 98.6% maximum efficiency", "IP66, designed for C5 corrosion protection", "25 years data storage over cloud", "10-year warranty"],
    shared: [
      ["phase", "Grid connection", "Three phase (3W+N+PE)", null, "Output (AC)"],
      ["nominal_ac_voltage", "Nominal AC voltage (range)", "230/400 (340–440)", "V", "Output (AC)"],
      ["ac_frequency", "AC grid frequency (range)", "50 (45–55)", "Hz", "Output (AC)"],
      ["power_factor", "Power factor", "0.8 leading … 0.8 lagging", null, "Output (AC)"],
      ["thdi", "THDi", "<3", "%", "Output (AC)"],
      ["max_dc_voltage_v", "Max. DC voltage", "1100", "V", "Input (DC)"],
      ["start_voltage_v", "Initial voltage", "200", "V", "Input (DC)"],
      ["nominal_dc_voltage_v", "Nominal voltage", "580", "V", "Input (DC)"],
      ["mppt_range_v", "MPPT voltage range (as printed)", "1000", "V", "Input (DC)"],
      ["mppt_count", "Number of independent MPPT", "2", null, "Input (DC)"],
      ["mppt_efficiency", "MPPT efficiency", "99.9", "%", "Efficiency"],
      ["protection", "Degree of protection", "IP66", null, "General"],
      ["cooling", "Cooling", "Natural convection", null, "General"],
      ["topology", "Topology", "Transformerless", null, "General"],
      ["operating_temp", "Operating temperature", "-25 … +60", "°C", "General"],
      ["dc_connection", "DC connection", "H4", null, "General"],
      ["display", "Display", "OLED + LED / Wi-Fi + App", null, "General"],
      ["warranty", "Warranty", "10", "years", "General"],
      ["standards", "Standards", "IEC 61000, IEC 61727, IEC 62116, IEC 60068, IEC 61683, IEC 62109", null, "General"],
    ],
    variants: [
      ["3KTL3X", 3000, 3300, 4500, 5.0, "98.3", "97.5", "12.5", "425 / 387 / 147", "1", "13", "16"],
      ["4KTL3X", 4000, 4400, 6000, 6.7, "98.3", "97.5", "12.5", "425 / 387 / 147", "1", "13", "16"],
      ["5KTL3X", 5000, 5500, 7500, 8.3, "98.3", "97.5", "12.5", "425 / 387 / 147", "1", "13", "16"],
      ["6KTL3X", 6000, 6600, 9000, 10.0, "98.3", "97.5", "12.5", "425 / 387 / 147", "1", "13", "16"],
      ["8KTL3X", 8000, 8800, 12000, 13.3, "98.6", "98.1", "14", "425 / 387 / 178", "1", "13", "16"],
      ["9KTL3X", 9000, 9900, 13500, 15.0, "98.6", "98.1", "14", "425 / 387 / 178", "1", "13", "16"],
      ["10KTL3X", 10000, 11000, 15000, 16.7, "98.6", "98.1", "14", "425 / 387 / 178", "1", "13", "16"],
      ["12KTL3X", 12000, 13200, 18000, 20, "98.6", "98.2", "16", "425 / 387 / 178", "2/1", "26/13", "32/16"],
      ["15KTL3X", 15000, 16500, 22500, 25, "98.6", "98.2", "16", "425 / 387 / 178", "2/1", "26/13", "32/16"],
    ].map(([model, ac, va, pv, iout, eff, euro, kg, dims, strings, iin, isc]) => ({
      variant: model,
      model: `STELLAR-${model}`,
      sku: `VS-ANC-STELLAR-${model}`,
      specs: [
        ["ac_power_w", "AC nominal power", String(ac), "W", "Output (AC)"],
        ["ac_apparent_va", "Max. AC apparent power", String(va), "VA", "Output (AC)"],
        ["max_output_current_a", "Max. output current", String(iout), "A", "Output (AC)"],
        ["max_pv_power_w", "Max. recommended PV power (module STC)", String(pv), "W", "Input (DC)"],
        ["strings_per_mppt", "PV strings per MPPT", strings, null, "Input (DC)"],
        ["max_input_current_a", "Max. input current per MPPT", iin, "A", "Input (DC)"],
        ["max_isc_a", "Max. short-circuit current per MPPT", isc, "A", "Input (DC)"],
        ["max_efficiency_pct", "Max. efficiency", eff, "%", "Efficiency"],
        ["euro_efficiency_pct", "Euro efficiency", euro, "%", "Efficiency"],
        ["weight_kg", "Weight", kg, "kg", "General"],
        ["dimensions_mm", "Dimensions (W/H/D)", dims, "mm", "General"],
      ],
    })),
  },
  {
    key: "anchor-lumina",
    brand: "anchor-by-panasonic",
    category: "solar-inverters",
    name: "Lumina Three-Phase Grid-Tied PV Inverter",
    modelPattern: "20K~25KTL3X",
    datasheet: "/datasheets/anchor-lumina-20k-25ktl3x.pdf",
    short: "Three-phase grid-tied inverter, 20–25 kW, dual MPPT, export control, smart air cooling, IP65.",
    description:
      "A three-phase grid-tied inverter for commercial and industrial rooftops, with dual MPPT, an export control feature, smart air cooling, an IP65 enclosure and 25 years of data storage over cloud (per datasheet). " +
      ANCHOR_MAKER_NOTE,
    highlights: ["Dual MPPT", "Export control feature available", "Up to 98.75% max. efficiency (table value)", "IP65, smart air cooling", "10-year warranty"],
    shared: [
      ["phase", "Grid connection", "Three phase (3W+N+PE)", null, "Output (AC)"],
      ["nominal_ac_voltage", "Nominal AC voltage (range)", "230/400 (340–440)", "V", "Output (AC)"],
      ["ac_frequency", "AC grid frequency (range)", "50 (45–55)", "Hz", "Output (AC)"],
      ["power_factor", "Adjustable power factor", "0.8 leading … 0.8 lagging", null, "Output (AC)"],
      ["thdi", "THDi", "<3", "%", "Output (AC)"],
      ["max_dc_voltage_v", "Max. DC voltage", "1100", "V", "Input (DC)"],
      ["start_voltage_v", "Start voltage", "250", "V", "Input (DC)"],
      ["nominal_dc_voltage_v", "Nominal voltage", "580", "V", "Input (DC)"],
      ["mppt_range_v", "MPPT voltage range", "160–1000", "V", "Input (DC)"],
      ["mppt_count", "Number of MPPT", "2", null, "Input (DC)"],
      ["max_efficiency_pct", "Max. efficiency", "98.75", "%", "Efficiency"],
      ["euro_efficiency_pct", "European efficiency", "98.6", "%", "Efficiency"],
      ["mppt_efficiency", "MPPT efficiency", "99.9", "%", "Efficiency"],
      ["dimensions_mm", "Dimensions (W/H/D)", "525 / 395 / 222", "mm", "General"],
      ["weight_kg", "Weight", "23", "kg", "General"],
      ["protection", "Protection degree", "IP65", null, "General"],
      ["cooling", "Cooling", "Smart air cooling", null, "General"],
      ["topology", "Topology", "Transformerless", null, "General"],
      ["operating_temp", "Operating temperature", "-25 … +60", "°C", "General"],
      ["noise", "Noise emission (typical)", "40", "dB(A)", "General"],
      ["dc_connection", "DC connection", "H4", null, "General"],
      ["ac_connection", "AC connection", "Cable gland + OT terminal", null, "General"],
      ["warranty", "Warranty", "10", "years", "General"],
      ["standards", "Standards", "IEC 61000, IEC 61727, IEC 62116, IEC 60068, IEC 61683, IEC 62109", null, "General"],
    ],
    variants: [
      ["20KTL3X", 20000, 22000, 30000, 31.9, "2", "25", "32"],
      ["25KTL3X", 25000, 27700, 37500, 40.2, "2/3", "25/37.5", "32/48"],
    ].map(([model, ac, va, pv, iout, strings, iin, isc]) => ({
      variant: model,
      model,
      sku: `VS-ANC-LUMINA-${model}`,
      specs: [
        ["ac_power_w", "Rated AC output power", String(ac), "W", "Output (AC)"],
        ["ac_apparent_va", "Max. AC apparent power", String(va), "VA", "Output (AC)"],
        ["max_output_current_a", "Max. output current", String(iout), "A", "Output (AC)"],
        ["max_pv_power_w", "Max. recommended PV power (module STC)", String(pv), "W", "Input (DC)"],
        ["strings_per_mppt", "PV strings per MPPT", strings, null, "Input (DC)"],
        ["max_input_current_a", "Max. input current per MPPT", iin, "A", "Input (DC)"],
        ["max_isc_a", "Max. short-circuit current per MPPT", isc, "A", "Input (DC)"],
      ],
    })),
  },
  {
    key: "solaredge-hd-wave",
    brand: "solaredge",
    category: "solar-inverters",
    name: "Single Phase Inverter with HD-Wave Technology (India)",
    modelPattern: "SE3000H / SE4000H",
    datasheet: "/datasheets/solaredge-se3000h-se5000h-hd-wave.pdf",
    short: "Fixed-voltage single-phase inverter designed to work with SolarEdge power optimisers; 99.2% max. efficiency.",
    description:
      "A fixed-voltage single-phase inverter with HD-Wave technology, specifically designed to work with SolarEdge power optimisers. Commissioning is done from a smartphone using the SolarEdge SetApp. Built-in module-level monitoring and integrated arc fault protection. Note: the SE5000H on the same datasheet is marked “Only for Sri Lanka” and is therefore not listed here.",
    highlights: ["99.2% maximum inverter efficiency", "Requires SolarEdge power optimisers", "Built-in module-level monitoring", "Integrated arc fault protection", "12–25 year warranty (per datasheet)"],
    shared: [
      ["phase", "Grid connection", "Single phase", null, "Output (AC)"],
      ["nominal_ac_voltage", "AC output voltage (nominal)", "220/230", "V", "Output (AC)"],
      ["ac_voltage_range", "AC output voltage range", "184–264.5", "V", "Output (AC)"],
      ["ac_frequency", "AC frequency (nominal)", "50/60 ± 5", "Hz", "Output (AC)"],
      ["thdi", "Total harmonic distortion", "<3", "%", "Output (AC)"],
      ["power_factor", "Power factor", "1, adjustable -0.9 to 0.9", null, "Output (AC)"],
      ["max_dc_voltage_v", "Maximum input voltage", "480", "V DC", "Input (DC)"],
      ["nominal_dc_voltage_v", "Nominal DC input voltage", "380", "V DC", "Input (DC)"],
      ["max_efficiency_pct", "Maximum inverter efficiency", "99.2", "%", "Efficiency"],
      ["euro_efficiency_pct", "European weighted efficiency", "98.8", "%", "Efficiency"],
      ["night_consumption", "Nighttime power consumption", "< 2.5", "W", "Efficiency"],
      ["interfaces", "Communication interfaces", "RS485, Ethernet, Wi-Fi (external antenna required)", null, "General"],
      ["arc_fault", "Arc fault protection", "Integrated, user configurable (UL1699B)", null, "General"],
      ["dimensions_mm", "Dimensions (H × W × D)", "280 × 370 × 142", "mm", "General"],
      ["noise", "Noise", "< 25", "dBA", "General"],
      ["cooling", "Cooling", "Natural convection", null, "General"],
      ["operating_temp", "Operating temperature", "-40 to +60", "°C", "General"],
      ["protection", "Protection rating", "IP65 – outdoor and indoor", null, "General"],
      ["warranty", "Warranty", "12–25", "years", "General"],
      ["safety", "Safety standard", "IEC-62109-1/2", null, "General"],
    ],
    variants: [
      ["SE3000H", 3000, 6000, 9, 14, "1 × MC4", "7.8"],
      ["SE4000H", 4000, 8000, 11.5, 18.5, "2 × MC4 pair", "9"],
    ].map(([model, ac, dc, iin, iout, dcin, kg]) => ({
      variant: model,
      model,
      sku: `VS-SE-${model}`,
      specs: [
        ["ac_power_w", "Rated AC power output", String(ac), "VA", "Output (AC)"],
        ["max_output_current_a", "Max. continuous output current", String(iout), "A", "Output (AC)"],
        ["max_pv_power_w", "Maximum DC power", String(dc), "W", "Input (DC)"],
        ["max_input_current_a", "Maximum input current", String(iin), "A DC", "Input (DC)"],
        ["dc_connection", "DC input", dcin, null, "General"],
        ["weight_kg", "Weight", kg, "kg", "General"],
      ],
    })),
  },

  // ------------------------------------------------------------- OPTIMISERS
  {
    key: "solaredge-s-series",
    brand: "solaredge",
    category: "power-optimisers",
    name: "S-Series Residential Power Optimizer",
    modelPattern: "S440 / S500 / S500B / S650B",
    datasheet: "/datasheets/solaredge-s-series-power-optimizer.pdf",
    short: "Module-level power optimiser for SolarEdge residential inverters; 99.5% max. efficiency, 25-year warranty.",
    description:
      "Module-level DC power optimisers, specifically designed to work with SolarEdge residential inverters. They mitigate module mismatch loss (manufacturing tolerance to partial shading), provide module-level voltage shutdown for installer and firefighter safety, and are compatible with bifacial PV modules. Modules with up to +5% power tolerance are allowed; the module's STC rating must not exceed the optimiser's rated input power.",
    highlights: ["99.5% maximum efficiency, 98.6% weighted", "Module-level safety voltage: 1 ± 0.1 V per optimiser", "Compatible with bifacial modules", "IP68, MC4 connectors", "25-year warranty"],
    shared: [
      ["max_efficiency_pct", "Maximum efficiency", "99.5", "%", "Input"],
      ["weighted_efficiency_pct", "Weighted efficiency", "98.6", "%", "Input"],
      ["max_output_current_a", "Maximum output current", "15", "A DC", "Output"],
      ["safety_voltage", "Safety output voltage per optimiser", "1 ± 0.1", "V DC", "Output"],
      ["max_system_voltage_v", "Maximum allowed system voltage", "1000", "V DC", "Installation"],
      ["connectors", "Input / output connector", "MC4 / MC4", null, "Installation"],
      ["output_wire", "Output wire length", "(+) 2.3, (−) 0.10", "m", "Installation"],
      ["operating_temp", "Operating temperature", "-40 to +85", "°C", "Installation"],
      ["protection", "Protection rating", "IP68", null, "Installation"],
      ["warranty", "Warranty", "25", "years", "Installation"],
    ],
    variants: [
      ["S440", 440, 60, "8–60", 14.5, 60, "129 × 155 × 30", 720],
      ["S500", 500, 60, "8–60", 15, 60, "129 × 155 × 30", 720],
      ["S500B", 500, 125, "12.5–105", 15, 80, "129 × 165 × 45", 790],
      ["S650B", 650, 85, "12.5–85", 15, 80, "129 × 165 × 45", 790],
    ].map(([model, w, voc, mppt, isc, vout, dims, g]) => ({
      variant: model,
      model,
      sku: `VS-SE-${model}`,
      specs: [
        ["rated_input_w", "Rated input DC power", String(w), "W", "Input"],
        ["max_input_voc_v", "Absolute max. input voltage (Voc)", String(voc), "V DC", "Input"],
        ["mppt_range_v", "MPPT operating range", mppt, "V DC", "Input"],
        ["max_module_isc_a", "Max. Isc of connected module", String(isc), "A DC", "Input"],
        ["max_output_voltage_v", "Maximum output voltage", String(vout), "V DC", "Output"],
        ["dimensions_mm", "Dimensions (W × L × H)", dims, "mm", "Installation"],
        ["weight_g", "Weight", String(g), "g", "Installation"],
      ],
    })),
  },

  // ----------------------------------------------------------------- CABLES
  {
    key: "anchor-solar-dc-cable",
    brand: "anchor-by-panasonic",
    category: "solar-dc-cables",
    name: "Solar DC Cable",
    modelPattern: "IS 17293:2020",
    datasheet: "/datasheets/anchor-solar-dc-cable.pdf",
    featured: true,
    short: "BIS-certified solar DC cable, up to 1500 V DC, Class 5 tinned copper, XLPO insulation and sheath.",
    description:
      "BIS-certified solar DC cable manufactured as per IS 17293:2020 and aligned with IEC 62930 and EN 50618. Class 5 flexible tinned copper conductor with XLPO insulation and sheath: halogen-free, flame retardant, with high UV, ozone and weather resistance. Typical applications: PV module to string, string box to inverter, rooftop and utility-scale plants. " +
      "Panasonic Life Solutions India Pvt. Ltd.",
    highlights: ["Mandatory BIS/ISI (Solar DC Cable QCO 2023)", "Up to 1500 V DC", "Halogen-free, flame retardant, low smoke", "Short-circuit temperature up to 250 °C", "25+ years service life (per leaflet)"],
    shared: [
      ["standard", "Standard", "IS 17293:2020; aligned with IEC 62930, EN 50618", null, "General"],
      ["voltage_rating", "Voltage rating", "Up to 1500", "V DC", "General"],
      ["temperature_range", "Temperature range", "-40 to +90", "°C", "General"],
      ["conductor", "Conductor", "Class 5 flexible tinned copper", null, "General"],
      ["insulation", "Insulation & sheath", "XLPO", null, "General"],
      ["packaging", "Packaging", "500 m coil / 2000 m drum", null, "General"],
      ["colours", "Colours available", "Black, Red, Black with red strips", null, "General"],
      ["insulation_thickness_mm", "Nominal insulation thickness", "0.7", "mm", "Construction"],
      ["sheath_thickness_mm", "Nominal sheath thickness", "0.8", "mm", "Construction"],
    ],
    variants: [
      ["4 sq mm", "4.0", "6.6", 52, 49, 41, "5.09"],
      ["6 sq mm", "6.0", "7.2", 66, 63, 53, "3.39"],
    ].map(([variant, area, dia, air, surf, touch, res]) => ({
      variant,
      model: `${area} mm²`,
      sku: `VS-ANC-DCCABLE-${area.replace(".0", "")}`,
      priceUnit: "per metre",
      specs: [
        ["cross_section_sqmm", "Nominal cross-sectional area", area, "mm²", "Construction"],
        ["cable_diameter_mm", "Cable diameter", dia, "mm", "Construction"],
        ["ampacity_free_air_a", "Current capacity — single cable free in air", String(air), "A", "Current rating"],
        ["ampacity_surface_a", "Current capacity — single cable on a surface", String(surf), "A", "Current rating"],
        ["ampacity_touching_a", "Current capacity — two loaded cables touching", String(touch), "A", "Current rating"],
        ["dc_resistance", "Max. DC conductor resistance at 20 °C", res, "Ω/km", "Current rating"],
      ],
    })),
  },

  // ---------------------------------------------------------- STREET LIGHTS
  {
    key: "anchor-aio-street-light",
    brand: "anchor-by-panasonic",
    category: "solar-street-lights",
    name: "All-in-One / Hybrid Solar LED Street Light",
    modelPattern: "AIO / Hybrid AIO",
    datasheet: "/datasheets/anchor-solar-street-lights-brochure.pdf",
    short: "All-in-one solar LED street light with monocrystalline panel, LiFePO4 battery and Panasonic motion sensor.",
    description:
      "A compact lighting solution that combines a monocrystalline solar panel, LED luminaire, LiFePO4 battery and a Panasonic PIR motion sensor in one unit. The Hybrid AIO version also runs on grid AC power once the stored solar energy is exhausted. Model A delivers 120 lm/W and Model B 150 lm/W. Please state AIO or Hybrid and Model A or B in your enquiry.",
    highlights: ["Monocrystalline solar panel, 3.2 mm toughened glass", "LiFePO4 battery, more than 2000 cycles", "Panasonic motion sensor, up to 12 m detection", "2 days (24 h) autonomy with dimming", "LED life 50,000 h, IP65"],
    shared: [
      ["cct", "Colour temperature & CRI", "5500–6500 K, CRI > 70", null, "Luminaire"],
      ["efficacy", "Typical luminous efficacy", "Model A: 120 / Model B: 150", "lm/W", "Luminaire"],
      ["battery_type", "Battery type", "Lithium ferro phosphate (LiFePO4), with BMS", null, "Battery"],
      ["battery_voltage", "Battery rated voltage", "12.8", "V", "Battery"],
      ["autonomy", "Battery backup with dimming", "2 days (24 hours)", null, "Battery"],
      ["controller", "Charge controller", "MPPT algorithm based; DC driver efficiency > 92%", null, "Electronics"],
      ["sensor", "Motion sensor", "Panasonic long-distance detection, 12 m", null, "Electronics"],
      ["panel_thickness", "Panel thickness", "60", "mm", "Solar module"],
    ],
    variants: [
      [12, "1440", "1800", 30, "775 × 340", 12, 10, "5"],
      [15, "1800", "2250", 40, "775 × 340", 18, 12, "5"],
      [20, "2400", "3000", 50, "920 × 340", 18, 14, "5"],
      [24, "2880", "3600", 60, "1060 × 340", 24, 15, "5"],
      [30, "3600", "4500", 75, "1280 × 340", 30, 17, "6"],
      [40, "4800", "6000", 100, "1065 × 505", 36, 25, "6"],
      [50, "6000", "7500", 125, "1250 × 505", 50, 28, "6 to 8"],
      [60, "7200", "9000", 150, "1550 × 505", 54, 32, "6 to 8"],
    ].map(([w, la, lb, pv, dims, ah, kg, h]) => ({
      variant: `${w} W`,
      model: `${w}W LED`,
      sku: `VS-ANC-AIO-${w}W`,
      specs: [
        ["led_power_w", "Light output", String(w), "W", "Luminaire"],
        ["lumens", "Typical luminous flux", `A: ${la} / B: ${lb}`, "lm", "Luminaire"],
        ["module_wp", "Solar module power", String(pv), "Wp", "Solar module"],
        ["module_dims", "Solar module dimensions (L × W)", dims, "mm", "Solar module"],
        ["battery_ah", "Battery capacity", String(ah), "Ah", "Battery"],
        ["weight_kg", "Weight", String(kg), "kg", "General"],
        ["mount_height", "Recommended installation height", h, "m", "General"],
      ],
    })),
  },
];

function moduleSpecs({ wp, vmp, voc, imp, isc, eff, noct }) {
  const s = [
    ["power_wp", "Nominal maximum power (Pmax)", String(wp), "Wp", "Electrical (STC)"],
    ["vmp_v", "Optimum operating voltage (Vmp)", vmp.toFixed(2), "V", "Electrical (STC)"],
    ["voc_v", "Open circuit voltage (Voc)", voc.toFixed(2), "V", "Electrical (STC)"],
    ["imp_a", "Optimum operating current (Imp)", imp.toFixed(2), "A", "Electrical (STC)"],
    ["isc_a", "Short circuit current (Isc)", isc.toFixed(2), "A", "Electrical (STC)"],
    ["efficiency_pct", "Module efficiency", eff.toFixed(2), "%", "Electrical (STC)"],
  ];
  if (noct) s.push(["noct_pmax_w", "Pmax at NOCT", String(noct), "W", "Electrical (NOCT)"]);
  return s;
}


/**
 * Product images (manufacturer imagery). Sources: images embedded in the supplied manufacturer
 * datasheet PDFs, and the Panasonic TOPCon 620/625 Wp poster supplied by the business.
 * First image = primary. Stored as static assets; D1 holds only the references.
 */
export const seriesImages = {
  "anchor-topcon-600-630": [{ src: "/images/products/anchor-topcon-panels.webp", alt: "Anchor by Panasonic N-Type TOPCon dual-glass bifacial modules" }],
  "anchor-perc-540-555": [{ src: "/images/products/anchor-mono-perc-bifacial.webp", alt: "Anchor by Panasonic Mono PERC bifacial module, front view" }],
  "anchor-reno": [{ src: "/images/products/anchor-reno-inverter.webp", alt: "Anchor RENO single-phase residential PV inverter" }],
  "anchor-ino": [{ src: "/images/products/anchor-ino-inverter.webp", alt: "Anchor INO single-phase residential PV inverter" }],
  "anchor-stellar": [{ src: "/images/products/anchor-stellar-inverter.webp", alt: "Anchor Stellar three-phase grid-tie inverter" }],
  "anchor-lumina": [{ src: "/images/products/anchor-lumina-inverter.webp", alt: "Anchor Lumina three-phase grid-tied inverter" }],
  "solaredge-hd-wave": [{ src: "/images/products/solaredge-hd-wave-inverter.webp", alt: "SolarEdge single-phase inverter with HD-Wave technology" }],
  "solaredge-s-series": [
    { src: "/images/products/solaredge-s-series-optimizer.webp", alt: "SolarEdge S-Series power optimizer" },
    { src: "/images/products/solaredge-s-series-optimizer-drawing.webp", alt: "SolarEdge S-Series power optimizer dimension drawing" },
  ],
  "anchor-solar-dc-cable": [
    { src: "/images/products/anchor-solar-dc-cable-coil.webp", alt: "Anchor by Panasonic solar DC cable coil" },
    { src: "/images/products/anchor-solar-dc-cable-section.webp", alt: "Anchor by Panasonic solar DC cable with tinned copper conductor" },
  ],
  "anchor-aio-street-light": [
    { src: "/images/products/anchor-street-light-day.webp", alt: "Anchor all-in-one solar LED street lights" },
    { src: "/images/products/anchor-street-light-night.webp", alt: "Anchor solar LED street light illuminating a path at night" },
  ],
};

/** Flatten series → product rows (used by seed + prerender). */
export function flattenProducts() {
  const out = [];
  for (const s of series) {
    for (const v of s.variants) {
      const slugBase = `${s.brand === "solaredge" ? "solaredge" : "anchor"}-${s.name}-${v.variant}`;
      const slug = slugify(slugBase);
      const model = v.model ?? s.modelPattern;
      const groupOrder = [];
      const specs = [...s.shared, ...v.specs];
      // Order: variant specs first within their group, then shared.
      for (const sp of specs) if (!groupOrder.includes(sp[4])) groupOrder.push(sp[4]);
      out.push({
        sku: v.sku,
        slug,
        name: `${s.name} ${v.variant}`,
        seriesKey: s.key,
        seriesName: s.name,
        variant: v.variant,
        brand: s.brand,
        category: s.category,
        model,
        modelPattern: s.modelPattern,
        short: s.short,
        description: s.description,
        highlights: s.highlights,
        datasheet: s.datasheet,
        images: seriesImages[s.key] ?? [],
        featured: !!s.featured,
        priceUnit: v.priceUnit ?? "per piece",
        specs: [...v.specs, ...s.shared].map(([key, label, value, unit, group], i) => ({
          key,
          label,
          value,
          unit: unit ?? null,
          group: group ?? "General",
          sort: groupOrder.indexOf(group ?? "General") * 100 + i,
        })),
      });
    }
  }
  return out;
}

export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/\./g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
