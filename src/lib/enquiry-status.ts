import type { EnquiryStatus } from "../../shared/types";

export const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: "bg-sky-100 text-sky-800",
  contacted: "bg-violet-100 text-violet-800",
  quoted: "bg-sun-100 text-ink",
  won: "bg-verdi-100 text-verdi-800",
  lost: "bg-paper-3 text-muted",
  cancelled: "bg-paper-3 text-muted",
};

/** Customer-facing wording for each enquiry status. */
export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "Received",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Order confirmed",
  lost: "Closed",
  cancelled: "Cancelled",
};
