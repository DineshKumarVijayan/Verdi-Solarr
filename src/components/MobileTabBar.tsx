import { ClipboardList, Home, LayoutGrid, Phone } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { useBasket } from "../lib/basket";
import { useSite } from "../lib/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * App-style bottom navigation on phones/tablets (< lg). Replaces the floating Call/WhatsApp
 * buttons there, so nothing covers the content. Hidden in the admin area.
 */
export function MobileTabBar() {
  const basket = useBasket();
  const SITE = useSite();
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  const tab = "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium";
  const navCls = ({ isActive }: { isActive: boolean }) => `${tab} ${isActive ? "text-verdi-700" : "text-muted"}`;
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] lg:hidden" data-testid="tab-bar">
      <div className="mx-auto flex max-w-lg items-stretch">
        <NavLink to="/" end className={navCls}>
          <Home className="size-5" /> Home
        </NavLink>
        <NavLink to="/products" className={navCls}>
          <LayoutGrid className="size-5" /> Products
        </NavLink>
        <NavLink to="/enquiry" className={navCls} aria-label={`Enquiry basket, ${basket.count} items`}>
          <span className="relative">
            <ClipboardList className="size-5" />
            {basket.count > 0 && <span className="num absolute -top-1.5 -right-2.5 grid min-w-4 place-items-center rounded-full bg-sun-400 px-1 text-[9px] font-bold text-ink">{basket.count}</span>}
          </span>
          Enquiry
        </NavLink>
        <a href={SITE.whatsappUrl} target="_blank" rel="noopener" className={`${tab} text-[#1f9e4f]`}>
          <WhatsAppIcon className="size-5" /> WhatsApp
        </a>
        <a href={SITE.phoneHref} className={`${tab} text-sky-700`}>
          <Phone className="size-5" /> Call
        </a>
      </div>
    </nav>
  );
}
