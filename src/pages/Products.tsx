import { LayoutGrid, List, MessageCircle, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { search, type SearchFilters } from "../../shared/search";
import { ProductCard } from "../components/ProductCard";
import { Modal } from "../components/ui";
import { useCatalogue } from "../lib/catalogue";
import { usePageMeta } from "../lib/seo";
import { SITE } from "../site";

type Sort = NonNullable<SearchFilters["sort"]>;
const SORTS: { v: Sort; l: string }[] = [
  { v: "relevance", l: "Most relevant" },
  { v: "price-asc", l: "Price: low to high" },
  { v: "price-desc", l: "Price: high to low" },
  { v: "power-desc", l: "Power: high to low" },
  { v: "name", l: "Name A–Z" },
];

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);

export default function Products() {
  const { categorySlug } = useParams();
  const { data, index, loading, error, reload, categoryBySlug, countByCategory } = useCatalogue();
  const [params, setParams] = useSearchParams();
  const routeCategory = categorySlug ? categoryBySlug(categorySlug) : undefined;

  // Text input is local for instant results; URL is updated after a short pause.
  const [q, setQ] = useState(params.get("q") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => setQ(params.get("q") ?? ""), [params]);
  const qTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const updateQ = (v: string) => {
    setQ(v);
    clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => update({ q: v || null }), 350);
  };

  const filters: SearchFilters = {
    q,
    brands: list(params.get("brand")),
    categories: categorySlug ? [categorySlug] : list(params.get("cat")),
    phase: (params.get("phase") as "single" | "three" | null) ?? null,
    minPower: num(params.get("pmin")),
    maxPower: num(params.get("pmax")),
    minPricePaise: num(params.get("rmin")) !== null ? num(params.get("rmin"))! * 100 : null,
    maxPricePaise: num(params.get("rmax")) !== null ? num(params.get("rmax"))! * 100 : null,
    pricedOnly: params.get("priced") === "1",
    sort: (params.get("sort") as Sort) ?? "relevance",
  };
  const view = params.get("view") === "list" ? "list" : "grid";

  function update(patch: Record<string, string | null>) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(patch)) {
          if (v === null || v === "") next.delete(k);
          else next.set(k, v);
        }
        return next;
      },
      { replace: true, preventScrollReset: true, flushSync: true },
    );
  }

  const hits = useMemo(() => search(index, filters), [index, JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  const title = routeCategory ? routeCategory.name : "All products";
  usePageMeta(
    routeCategory ? `${routeCategory.name} — products & prices` : "Solar products catalogue",
    routeCategory?.description ?? "Search solar panels, inverters, optimisers, solar DC cables and street lights by wattage, kW, phase and model. Real manufacturer datasheets.",
  );

  const activeCount =
    filters.brands.length + (categorySlug ? 0 : filters.categories.length) + (filters.phase ? 1 : 0) + (filters.minPower != null || filters.maxPower != null ? 1 : 0) + (filters.minPricePaise != null || filters.maxPricePaise != null ? 1 : 0) + (filters.pricedOnly ? 1 : 0);

  const clearAll = () => {
    setQ("");
    setParams(new URLSearchParams(), { replace: true, preventScrollReset: true });
  };

  if (categorySlug && data && !routeCategory) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-3xl font-semibold">Category not found</h1>
        <Link to="/products" className="btn-primary mt-6">
          Browse all products
        </Link>
      </div>
    );
  }

  const emptyCategory = routeCategory && (countByCategory.get(routeCategory.id) ?? 0) === 0;
  const filterPanel = (
    <FilterPanel filters={filters} categorySlug={categorySlug} update={update} />
  );

  return (
    <div className="container-x py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap gap-1.5">
          <li><Link to="/" className="hover:text-ink">Home</Link> /</li>
          <li>{routeCategory ? <Link to="/products" className="hover:text-ink">Products</Link> : "Products"}{routeCategory && " /"}</li>
          {routeCategory && <li aria-current="page">{routeCategory.name}</li>}
        </ol>
      </nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
          {routeCategory?.description && <p className="mt-2 max-w-2xl text-muted">{routeCategory.description}</p>}
        </div>
        {data && (
          <p className="num text-xs text-subtle">
            Prices last published {new Date(data.publishedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}
      </div>

      {emptyCategory ? (
        <div className="card mt-10 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold">Listings for {routeCategory!.name} are on the way</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">We are adding detailed product listings for this category. Message us with your requirement and we will confirm current options and pricing.</p>
          <a
            className="btn-primary mt-6"
            target="_blank"
            rel="noopener"
            href={`${SITE.whatsappUrl}?text=${encodeURIComponent(`Hello VERDI SOLARR, I would like to enquire about ${routeCategory!.name}.`)}`}
          >
            <MessageCircle className="size-4" /> Enquire on WhatsApp
          </a>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24">{filterPanel}</div>
          </aside>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1 basis-64">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle" />
                <label htmlFor="product-q" className="sr-only">
                  Search within products
                </label>
                <input id="product-q" value={q} onChange={(e) => updateQ(e.target.value)} placeholder="Search model, wattage, kW, spec…" className="field !rounded-full pl-10" data-testid="product-search" />
                {q && (
                  <button type="button" onClick={() => updateQ("")} className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-subtle hover:bg-paper-2" aria-label="Clear search">
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <button type="button" className="btn-ghost lg:hidden" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal className="size-4" /> Filters {activeCount > 0 && <span className="num rounded-full bg-verdi-600 px-1.5 text-[10px] text-white">{activeCount}</span>}
              </button>
              <label htmlFor="sort" className="sr-only">
                Sort
              </label>
              <select id="sort" className="field !w-auto !rounded-full" value={filters.sort} onChange={(e) => update({ sort: e.target.value === "relevance" ? null : e.target.value })}>
                {SORTS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.l}
                  </option>
                ))}
              </select>
              <div className="hidden rounded-full border border-line bg-card p-1 sm:flex" role="group" aria-label="Layout">
                <button type="button" className={`rounded-full p-1.5 ${view === "grid" ? "bg-ink text-paper" : "text-muted"}`} onClick={() => update({ view: null })} aria-pressed={view === "grid"} aria-label="Grid view">
                  <LayoutGrid className="size-4" />
                </button>
                <button type="button" className={`rounded-full p-1.5 ${view === "list" ? "bg-ink text-paper" : "text-muted"}`} onClick={() => update({ view: "list" })} aria-pressed={view === "list"} aria-label="List view">
                  <List className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2">
              <p className="num text-sm text-muted" aria-live="polite" data-testid="result-count">
                {loading ? "Loading catalogue…" : `${hits.length} ${hits.length === 1 ? "product" : "products"}`}
              </p>
              {(activeCount > 0 || q) && (
                <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-xs font-semibold text-verdi-700 hover:underline">
                  <RotateCcw className="size-3" /> Clear all
                </button>
              )}
            </div>

            {error && !data && (
              <div className="card mt-6 p-8 text-center">
                <p className="font-semibold">We couldn’t load the catalogue.</p>
                <p className="mt-1 text-sm text-muted">{error}</p>
                <button type="button" className="btn-primary mt-4" onClick={reload}>
                  Try again
                </button>
              </div>
            )}
            {loading && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card h-96 animate-pulse bg-paper-2" />
                ))}
              </div>
            )}
            {!loading && data && hits.length === 0 && (
              <div className="card mt-6 p-10 text-center">
                <p className="text-lg font-semibold">No products match these filters.</p>
                <p className="mt-1 text-sm text-muted">Try a broader search such as “inverter” or “Wp”, or clear the filters.</p>
                <button type="button" className="btn-ghost mt-5" onClick={clearAll}>
                  Clear all filters
                </button>
              </div>
            )}
            <div className={`mt-4 grid gap-4 ${view === "list" ? "" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
              {hits.map((h) => (
                <ProductCard key={h.item.p.id} product={h.item.p} query={q} layout={view} />
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" fullscreenOnMobile footer={<button type="button" className="btn-primary w-full" onClick={() => setFiltersOpen(false)}>Show {hits.length} products</button>}>
        <div className="p-5">{filterPanel}</div>
      </Modal>
    </div>
  );
}

function FilterPanel({ filters, categorySlug, update }: { filters: SearchFilters; categorySlug?: string; update: (p: Record<string, string | null>) => void }) {
  const { data, countByCategory } = useCatalogue();
  const toggle = (key: "brand" | "cat", current: string[], v: string) => {
    const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
    update({ [key]: next.length ? next.join(",") : null });
  };
  const showPhase = !categorySlug || categorySlug === "solar-inverters";
  return (
    <div className="grid gap-7">
      <fieldset>
        <legend className="eyebrow mb-3">Manufacturer</legend>
        <div className="grid gap-2">
          {(data?.brands ?? []).map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" className="size-4 accent-verdi-600" checked={filters.brands.includes(b.slug)} onChange={() => toggle("brand", filters.brands, b.slug)} />
              {b.name}
            </label>
          ))}
        </div>
      </fieldset>
      {!categorySlug && (
        <fieldset>
          <legend className="eyebrow mb-3">Category</legend>
          <div className="grid gap-2">
            {(data?.categories ?? [])
              .filter((c) => (countByCategory.get(c.id) ?? 0) > 0)
              .map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input type="checkbox" className="size-4 accent-verdi-600" checked={filters.categories.includes(c.slug)} onChange={() => toggle("cat", filters.categories, c.slug)} />
                  <span className="flex-1">{c.name}</span>
                  <span className="num text-xs text-subtle">{countByCategory.get(c.id)}</span>
                </label>
              ))}
          </div>
        </fieldset>
      )}
      {showPhase && (
        <fieldset>
          <legend className="eyebrow mb-3">Inverter phase</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                [null, "Any"],
                ["single", "Single phase"],
                ["three", "Three phase"],
              ] as const
            ).map(([v, l]) => (
              <button key={l} type="button" className={`chip ${filters.phase === v ? "chip-on" : ""}`} aria-pressed={filters.phase === v} onClick={() => update({ phase: v })}>
                {l}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="eyebrow mb-1">Power rating (W)</legend>
        <p className="mb-3 text-[11px] text-subtle">Module Wp, inverter AC W, LED W or optimiser input W</p>
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Minimum power in watts" className="field num" inputMode="numeric" placeholder="Min" defaultValue={filters.minPower ?? ""} onBlur={(e) => update({ pmin: e.target.value || null })} key={`pmin${filters.minPower}`} />
          <input aria-label="Maximum power in watts" className="field num" inputMode="numeric" placeholder="Max" defaultValue={filters.maxPower ?? ""} onBlur={(e) => update({ pmax: e.target.value || null })} key={`pmax${filters.maxPower}`} />
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">Listed price (₹)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Minimum price in rupees" className="field num" inputMode="numeric" placeholder="Min" defaultValue={filters.minPricePaise != null ? filters.minPricePaise / 100 : ""} onBlur={(e) => update({ rmin: e.target.value || null })} key={`rmin${filters.minPricePaise}`} />
          <input aria-label="Maximum price in rupees" className="field num" inputMode="numeric" placeholder="Max" defaultValue={filters.maxPricePaise != null ? filters.maxPricePaise / 100 : ""} onBlur={(e) => update({ rmax: e.target.value || null })} key={`rmax${filters.maxPricePaise}`} />
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" className="size-4 accent-verdi-600" checked={!!filters.pricedOnly} onChange={(e) => update({ priced: e.target.checked ? "1" : null })} />
          Only show listed prices
        </label>
      </fieldset>
    </div>
  );
}
