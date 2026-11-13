import { LayoutDashboard, LogIn, Tags, UserRound } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { m } from "./motion";

/**
 * Discreet staff menu. Links use full page loads so Cloudflare Access can
 * intercept /admin at the edge and show its sign-in screen.
 */
export function AccountMenu({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const item = "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-paper-2";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Staff account menu"
        title="Staff sign-in"
        data-testid="account-menu"
        className={`rounded-full p-2.5 transition ${dark ? "hover:bg-white/10" : "hover:bg-paper-2"}`}
      >
        <UserRound className="size-5" />
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-2xl border border-line bg-card p-1.5 text-ink shadow-[var(--shadow-lift)]"
          >
            <p className="px-3 pt-2 pb-1.5 font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">VERDI staff</p>
            <a role="menuitem" href="/admin" className={item} data-testid="admin-signin-link">
              <LogIn className="size-4 text-verdi-600" /> Staff / admin sign-in
            </a>
            <a role="menuitem" href="/admin" className={item}>
              <LayoutDashboard className="size-4 text-subtle" /> Admin dashboard
            </a>
            <a role="menuitem" href="/admin/prices" className={item}>
              <Tags className="size-4 text-subtle" /> Price management
            </a>
            <p className="px-3 pt-1 pb-2 text-[11px] leading-snug text-subtle">Sign-in is protected by Cloudflare Access. Only authorised staff emails can enter.</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
