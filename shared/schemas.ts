import { z } from "zod";

/** Upper sanity bound: ₹10 crore per unit, expressed in paise. Guards against typos. */
export const MAX_PAISE = 10_000_000_000;

const paise = z
  .number()
  .int("Amount must be whole paise")
  .min(0, "Price cannot be negative")
  .max(MAX_PAISE, "Price is unrealistically large");

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const PriceUpdateSchema = z
  .object({
    sellingPricePaise: paise.nullable(),
    mrpPaise: paise.nullable(),
    gstIncluded: z.boolean(),
    gstRate: z.union([z.literal(0), z.literal(5), z.literal(12), z.literal(18), z.literal(28)]).nullable(),
    priceUnit: z.string().trim().min(1).max(40),
    expectedVersion: z.number().int().min(1),
    reason: z.string().trim().max(200).optional().default(""),
  })
  .strict()
  .refine((v) => v.mrpPaise === null || v.sellingPricePaise === null || v.sellingPricePaise <= v.mrpPaise, {
    message: "Selling price cannot exceed MRP",
    path: ["sellingPricePaise"],
  });
export type PriceUpdate = z.infer<typeof PriceUpdateSchema>;

export const RevalidateSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: z.number().int().positive(),
            quantity: z.number().int().min(1).max(100000),
            seenVersion: z.number().int().min(0).optional(),
            seenSellingPaise: z.number().int().min(0).nullable().optional(),
          })
          .strict(),
      )
      .min(1)
      .max(50),
  })
  .strict();
export type RevalidateRequest = z.infer<typeof RevalidateSchema>;

export const EnquiryCustomerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  business: z.string().trim().max(120).optional().default(""),
  mobile: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s-]{8,15}\d$/, "Enter a valid mobile number"),
  location: z.string().trim().min(2, "Please enter a delivery location").max(120),
  comments: z.string().trim().max(1000).optional().default(""),
});
export type EnquiryCustomer = z.infer<typeof EnquiryCustomerSchema>;

/**
 * Parse a rupee amount typed by an admin ("12,499.50", "₹ 800") into integer paise.
 * Returns null for empty input and NaN for invalid input (so callers can show an error).
 */
export function rupeesToPaise(input: string): number | null {
  const s = input.replace(/[,\s₹]/g, "");
  if (s === "") return null;
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(s)) return NaN;
  const [whole, frac = ""] = s.split(".");
  return Number(whole) * 100 + Number((frac + "00").slice(0, 2));
}

export function paiseToRupeeInput(paise: number | null): string {
  if (paise === null) return "";
  const whole = Math.floor(paise / 100);
  const frac = paise % 100;
  return frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, "0")}`;
}
