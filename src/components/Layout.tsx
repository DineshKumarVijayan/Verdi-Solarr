import { ClipboardList, GitCompareArrows, Mail, MapPin, Menu, Phone, Search, X } from "lucide-react";
import { AccountMenu } from "./AccountMenu";
import { ContactFabs } from "./ContactFabs";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from "react-router";
import { useBasket } from "../lib/basket";
import { useCatalogue } from "../lib/catalogue";
import { useCompare } from "../lib/compare";
import { SITE } from "../site";
import { Logo } from "./Logo";
import { SearchPalette } from "./SearchPalette";

const NAV = [
  { to: "/products", label: "Products" },
  { to: "/learn", label: "Learn" },
  { to: "/solar-tools", label: "Solar Tools" },
  { to: "/contact", label: "Contact" },
];

export function Layout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const basket = useBasket();
  const compare = useCompare();
  const loc = useLocation();
  const isHome = loc.pathname === "/";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setMenuOpen(false), [loc.pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-[70] rounded-lg bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isHome ? "border-white/10 bg-ink/85 text-paper" : "border-line/70 bg-paper/85"}`}>
        <div className="container-x flex h-16 items-center gap-4">
          <Link to="/" aria-label="VERDI SOLARR SOLUTION — home" className="shrink-0">
            <Logo dark={isHome} />
          </Link>
          <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    isActive ? (isHome ? "bg-white/10" : "bg-ink text-paper") : isHome ? "text-paper/75 hover:text-paper" : "text-ink/70 hover:text-ink"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-sm lg:flex ${isHome ? "border-white/15 text-paper/70 hover:border-white/35" : "border-line bg-card text-muted hover:border-ink/30"}`}
              data-testid="open-search"
            >
              <Search className="size-4" /> Search products
              <kbd className="ml-4 rounded border border-current/20 px-1.5 font-mono text-[10px] opacity-70">Ctrl K</kbd>
            </button>
            <button type="button" onClick={() => setPaletteOpen(true)} className={`rounded-full p-2.5 lg:hidden ${isHome ? "hover:bg-white/10" : "hover:bg-paper-2"}`} aria-label="Search products">
              <Search className="size-5" />
            </button>
            {compare.ids.length > 0 && (
              <Link to="/compare" className={`relative rounded-full p-2.5 ${isHome ? "hover:bg-white/10" : "hover:bg-paper-2"}`} aria-label={`Compare ${compare.ids.length} products`}>
                <GitCompareArrows className="size-5" />
                <span className="num absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-verdi-500 text-[10px] font-bold text-white">{compare.ids.length}</span>
              </Link>
            )}
            <AccountMenu dark={isHome} />
            <Link
              to="/enquiry"
              className={`relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold ${isHome ? "bg-sun-400 text-ink hover:bg-sun-300" : "bg-ink text-paper hover:bg-ink-3"}`}
              aria-label={`Enquiry basket, ${basket.count} items`}
              data-testid="basket-link"
            >
              <ClipboardList className="size-4" />
              <span className="hidden sm:inline">Enquiry</span>
              <span className="num rounded-full bg-black/15 px-1.5 text-xs" data-testid="basket-count">
                {basket.count}
              </span>
            </Link>
            <button type="button" className={`rounded-full p-2.5 md:hidden ${isHome ? "hover:bg-white/10" : "hover:bg-paper-2"}`} onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label="Menu">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" aria-label="Mobile" className={`border-t md:hidden ${isHome ? "border-white/10" : "border-line"}`}>
            <ul className="container-x grid gap-1 py-3">
              {[{ to: "/", label: "Home" }, ...NAV, { to: "/compare", label: "Compare" }, { to: "/admin", label: "Staff / admin sign-in" }].map((n) => (
                <li key={n.to}>
                  <NavLink to={n.to} end reloadDocument={n.to === "/admin"} className={({ isActive }) => `block rounded-xl px-3 py-3 text-base font-medium ${isActive ? "bg-verdi-600 text-white" : ""}`}>
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <ContactFabs />
      <SearchPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ScrollRestoration />
    </div>
  );
}

function Footer() {
  const { data } = useCatalogue();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-paper/75">
      <div className="container-x grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo dark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            B2B supplier of solar panels, inverters and solar electrical components for dealers, installers, EPC contractors and businesses.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={SITE.whatsappUrl} target="_blank" rel="noopener" className="btn-sun btn-sm">
              <WhatsAppIcon className="size-3.5" /> WhatsApp us
            </a>
            <a href={SITE.phoneHref} className="btn-ghost-dark btn-sm">
              <Phone className="size-3.5" /> Call
            </a>
          </div>
        </div>
        <div className="md:col-span-3">
          <h2 className="font-mono text-[0.7rem] tracking-[0.18em] text-paper/45 uppercase">Products</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {(data?.categories ?? []).slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link to={`/category/${c.slug}`} className="hover:text-paper">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="font-mono text-[0.7rem] tracking-[0.18em] text-paper/45 uppercase">Explore</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li><Link to="/learn" className="hover:text-paper">Solar Learning Hub</Link></li>
            <li><Link to="/learn/myths-vs-facts" className="hover:text-paper">Myths vs Facts</Link></li>
            <li><Link to="/solar-tools" className="hover:text-paper">Solar Tools</Link></li>
            <li><Link to="/solar-tools/kit-builder" className="hover:text-paper">Kit Builder</Link></li>
            <li><Link to="/compare" className="hover:text-paper">Compare products</Link></li>
            <li><Link to="/enquiry" className="hover:text-paper">Enquiry basket</Link></li>
          </ul>
        </div>
        <address className="not-italic md:col-span-3">
          <h2 className="font-mono text-[0.7rem] tracking-[0.18em] text-paper/45 uppercase">Contact</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-verdi-300" />
              <span>
                {SITE.address.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-verdi-300" />
              <a href={SITE.phoneHref} className="hover:text-paper">
                {SITE.phoneDisplay} ({SITE.contactPerson})
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-verdi-300" />
              <a href={`mailto:${SITE.email}`} className="break-all hover:text-paper">
                {SITE.email}
              </a>
            </li>
          </ul>
        </address>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. Brand names and trademarks belong to their respective owners. Specifications are taken from manufacturer datasheets.
          </p>
          <Link to="/admin" reloadDocument className="hover:text-paper/80" rel="nofollow">
            Staff sign-in
          </Link>
        </div>
      </div>
    </footer>
  );
}
