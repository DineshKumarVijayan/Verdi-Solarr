import {
  Activity,
  Atom,
  BadgeCheck,
  BarChart3,
  BatteryCharging,
  Cable,
  Compass,
  Factory,
  FileSearch,
  FlipHorizontal2,
  Gauge,
  HelpCircle,
  Landmark,
  Layers,
  Plug,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SplitSquareHorizontal,
  SunMedium,
  Triangle,
  TrendingUp,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import data from "../../../data/lessons.json";

export interface LessonMeta {
  slug: string;
  group: string;
  icon: string;
  minutes: number;
  title: string;
  summary: string;
  takeaways: string[];
  related: string[];
}

export const GROUPS = data.groups as { id: string; name: string; color: string }[];
export const LESSONS = data.lessons as LessonMeta[];

export const ICONS: Record<string, LucideIcon> = {
  Activity, Atom, BadgeCheck, BarChart3, BatteryCharging, Cable, Compass, Factory, FileSearch, FlipHorizontal2, Gauge, HelpCircle, Landmark,
  Layers, Plug, ShieldAlert, ShieldCheck, Sparkles, SplitSquareHorizontal, SunMedium, Triangle, TrendingUp, Workflow, Zap,
};

const basics = () => import("./lessons/basics");
const modules = () => import("./lessons/modules");
const design = () => import("./lessons/design");
const safety = () => import("./lessons/safety");
const ownership = () => import("./lessons/ownership");
const pick = <T extends Record<string, unknown>>(loader: () => Promise<T>, key: keyof T) => lazy(() => loader().then((m) => ({ default: m[key] as ComponentType })));

export const LESSON_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  "how-solar-cells-work": pick(basics, "HowSolarCellsWork"),
  "sand-to-solar-panel": pick(basics, "SandToSolarPanel"),
  "solar-energy-flow": pick(basics, "SolarEnergyFlow"),
  "peak-sun-hours": pick(basics, "PeakSunHours"),
  "cell-technologies": pick(modules, "CellTechnologies"),
  "half-cut-cells-busbars": pick(modules, "HalfCutCellsBusbars"),
  "bifacial-modules": pick(modules, "BifacialModules"),
  "module-efficiency": pick(modules, "ModuleEfficiency"),
  "degradation-and-defects": pick(modules, "DegradationAndDefects"),
  "mppt-explained": pick(design, "MpptExplained"),
  "datasheet-decoder": pick(design, "DatasheetDecoderLesson"),
  "dc-ac-ratio": pick(design, "DcAcRatio"),
  "tilt-and-orientation": pick(design, "TiltAndOrientation"),
  "cuf-and-performance": pick(design, "CufAndPerformance"),
  "cables-and-ohmic-losses": pick(safety, "CablesAndOhmicLosses"),
  "mc4-connectors": pick(safety, "Mc4Connectors"),
  "acdb-dcdb-protection": pick(safety, "AcdbDcdbProtection"),
  "earthing-and-commissioning": pick(safety, "EarthingAndCommissioning"),
  "power-factor-kw-kva": pick(safety, "PowerFactor"),
  "pm-surya-ghar-subsidy": pick(ownership, "PmSuryaGhar"),
  "battery-backup": pick(ownership, "BatteryBackup"),
  maintenance: pick(ownership, "Maintenance"),
  "myths-vs-facts": pick(ownership, "MythsVsFacts"),
  "warranty-registration": pick(ownership, "WarrantyRegistration"),
};

const KEY = "verdi.learn.done.v1";
export function readDone(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}
export function markDone(slug: string) {
  try {
    const s = readDone();
    s.add(slug);
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

export const GROUP_STYLE: Record<string, string> = {
  sun: "from-sun-300 to-sun-500 text-ink",
  sky: "from-sky-300 to-sky-500 text-white",
  verdi: "from-verdi-300 to-verdi-600 text-white",
  danger: "from-[#ff8b7a] to-[#c0392b] text-white",
  ink: "from-ink-3 to-ink text-paper",
};
