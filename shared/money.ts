const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** Format integer paise as Indian rupees, e.g. 1249950 -> "₹12,499.5". */
export function formatPaise(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) return "Price on request";
  return inr.format(paise / 100);
}

/** Integer-safe line total (paise × qty stays an exact integer well below 2^53). */
export function lineTotalPaise(unitPaise: number, qty: number): number {
  return unitPaise * qty;
}

export function gstLabel(p: { gstIncluded: boolean; gstRate: number | null }): string {
  if (p.gstIncluded) return p.gstRate !== null ? `incl. ${p.gstRate}% GST` : "incl. GST";
  return p.gstRate !== null ? `+ ${p.gstRate}% GST` : "+ GST as applicable";
}
