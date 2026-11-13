import { formatPaise, gstLabel } from "../../shared/money";
import type { PublicPrice } from "../../shared/types";

export function PriceTag({ price, size = "md" }: { price: PublicPrice; size?: "sm" | "md" | "lg" }) {
  if (price.sellingPaise === null) {
    return (
      <div>
        <p className={`font-semibold text-ink ${size === "lg" ? "text-2xl" : "text-base"}`}>Price on request</p>
        <p className="text-xs text-muted">Send an enquiry for current pricing</p>
      </div>
    );
  }
  const showMrp = price.mrpPaise !== null && price.mrpPaise > price.sellingPaise;
  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={`num font-semibold text-ink ${size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl"}`}>{formatPaise(price.sellingPaise)}</span>
        <span className="text-xs text-muted">{price.unit}</span>
      </p>
      <p className="text-xs text-muted">
        {gstLabel(price)}
        {showMrp && (
          <>
            {" · "}MRP <span className="num line-through">{formatPaise(price.mrpPaise)}</span>
          </>
        )}
      </p>
    </div>
  );
}
