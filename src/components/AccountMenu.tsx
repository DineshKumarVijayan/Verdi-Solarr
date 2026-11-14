import { Award, ClipboardList, LayoutDashboard, LogIn, LogOut, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { staffSignedIn, useAccount } from "../lib/account";
import { m } from "./motion";

/**
 * Account menu: customer sign-in / account, plus a discreet staff section.
 * Staff sign in on /admin with their mobile number and password.
 */
export function AccountMenu({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const { customer, logout } = useAccount();
  const ref = useRef<HTMLDivElement>(null);
  const staff = staffSignedIn();

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
        aria-label={customer ? `Account menu for ${customer.name}` : "Account menu"}
        title={customer ? customer.name : staff ? "Signed in as staff" : "Sign in"}
        data-testid="account-menu"
        className={`rounded-full p-2.5 transition ${dark ? "hover:bg-white/10" : "hover:bg-paper-2"}`}
      >
        {customer ? (
          <span className="grid size-5 place-items-center rounded-full bg-verdi-500 text-[11px] font-bold text-white" data-testid="signed-in-badge">
            {customer.name.trim()[0]?.toUpperCase()}
          </span>
        ) : staff ? (
          <span className="grid size-5 place-items-center rounded-full bg-ink text-paper ring-1 ring-white/30" data-testid="staff-badge">
            <ShieldCheck className="size-3.5" />
          </span>
        ) : (
          <UserRound className="size-5" />
        )}
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
            {customer ? (
              <>
                <div className="px-3 pt-2 pb-2">
                  <p className="truncate text-sm font-semibold">{customer.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <Award className="size-3.5 text-sun-500" /> {customer.points.toLocaleString("en-IN")} reward points
                  </p>
                </div>
                <Link role="menuitem" to="/account" className={item} onClick={() => setOpen(false)} data-testid="my-account-link">
                  <ClipboardList className="size-4 text-verdi-600" /> My enquiries & points
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className={`${item} w-full`}
                  onClick={async () => {
                    setOpen(false);
                    await logout();
                  }}
                >
                  <LogOut className="size-4 text-subtle" /> Sign out
                </button>
              </>
            ) : (
              <>
                <p className="px-3 pt-2 pb-1.5 font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Customers</p>
                <Link role="menuitem" to="/account" className={item} onClick={() => setOpen(false)} data-testid="customer-signin-link">
                  <LogIn className="size-4 text-verdi-600" /> Sign in
                </Link>
                <Link role="menuitem" to="/account?mode=register" className={item} onClick={() => setOpen(false)}>
                  <UserPlus className="size-4 text-subtle" /> Create an account
                </Link>
              </>
            )}
            <div className="my-1.5 border-t border-line" />
            <p className="px-3 pt-1 pb-1.5 font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">VERDI staff{staff ? " · signed in" : ""}</p>
            <a role="menuitem" href="/admin" className={item} data-testid="admin-signin-link">
              <LayoutDashboard className={`size-4 ${staff ? "text-verdi-600" : "text-subtle"}`} /> {staff ? "Admin dashboard" : "Staff / admin sign-in"}
            </a>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
