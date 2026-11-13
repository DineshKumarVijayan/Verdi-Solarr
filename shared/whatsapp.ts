import { formatPaise, gstLabel, lineTotalPaise } from "./money";
import type { EnquiryCustomer } from "./schemas";

export const WHATSAPP_NUMBER = "918939277997";

export interface EnquiryLine {
  name: string;
  brand: string | null;
  model: string | null;
  quantity: number;
  unitPaise: number | null;
  unit: string;
  gstIncluded: boolean;
  gstRate: number | null;
}

export function enquiryTotalPaise(lines: EnquiryLine[]): { total: number; priced: number } {
  let total = 0;
  let priced = 0;
  for (const l of lines) {
    if (l.unitPaise !== null) {
      total += lineTotalPaise(l.unitPaise, l.quantity);
      priced++;
    }
  }
  return { total, priced };
}

export function buildEnquiryMessage(customer: EnquiryCustomer, lines: EnquiryLine[], now = new Date()): string {
  const out: string[] = [];
  out.push("*Product enquiry — VERDI SOLARR SOLUTION*");
  out.push(`Date: ${now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`);
  out.push("");
  out.push(`Name: ${customer.name}`);
  if (customer.business) out.push(`Business: ${customer.business}`);
  out.push(`Mobile: ${customer.mobile}`);
  out.push(`Delivery location: ${customer.location}`);
  out.push("");
  out.push("*Products*");
  lines.forEach((l, i) => {
    out.push(`${i + 1}. ${l.name}`);
    const meta = [l.brand, l.model ? `Model: ${l.model}` : null].filter(Boolean).join(" · ");
    if (meta) out.push(`   ${meta}`);
    if (l.unitPaise !== null) {
      out.push(
        `   Qty: ${l.quantity} × ${formatPaise(l.unitPaise)} ${l.unit} (${gstLabel(l)}) = ${formatPaise(lineTotalPaise(l.unitPaise, l.quantity))}`,
      );
    } else {
      out.push(`   Qty: ${l.quantity} · Price: on request`);
    }
  });
  const { total, priced } = enquiryTotalPaise(lines);
  if (priced > 0) {
    out.push("");
    out.push(`*Indicative total (listed prices${priced < lines.length ? ", priced items only" : ""}): ${formatPaise(total)}*`);
  }
  if (customer.comments) {
    out.push("");
    out.push("*Additional requirements*");
    out.push(customer.comments);
  }
  out.push("");
  out.push(
    "_Listed prices are indicative. Final prices, taxes, availability and delivery terms are subject to confirmation by VERDI SOLARR SOLUTION._",
  );
  return out.join("\n");
}

export function whatsappUrl(message: string, number = WHATSAPP_NUMBER): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
