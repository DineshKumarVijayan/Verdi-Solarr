import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { formatPaise } from "../../shared/money";
import { search } from "../../shared/search";
import { useCatalogue } from "../lib/catalogue";
import { Highlight } from "./Highlight";
import { Modal } from "./ui";

const SUGGESTIONS = ["620 Wp", "TOPCon", "5 kW three phase", "single phase", "optimizer", "6 sq mm", "street light"];

/** Instant command-palette search (Ctrl/⌘+K). Pure client-side over the cached catalogue. */
export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { index, category } = useCatalogue();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => (q.trim() ? search(index, { q, brands: [], categories: [] }).slice(0, 8) : []), [index, q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);
  useEffect(() => setActive(0), [q]);

  const go = (to: string) => {
    onClose();
    nav(to);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active < hits.length && hits[active]) go(`/products/${hits[active].item.p.slug}`);
      else go(`/products?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Search products" hideTitle size="lg">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Search className="size-5 text-subtle" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search by product, model, wattage, kW, brand…"
          className="w-full bg-transparent py-1 text-base outline-none placeholder:text-subtle"
          role="combobox"
          aria-expanded={hits.length > 0}
          aria-controls={listId}
          aria-activedescendant={hits.length ? `${listId}-${active}` : undefined}
          aria-label="Search products"
          data-testid="palette-input"
        />
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:block">ESC</kbd>
      </div>
      <div className="max-h-[60dvh] overflow-y-auto p-2">
        {!q.trim() && (
          <div className="p-3">
            <p className="eyebrow mb-3">Try</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => setQ(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {q.trim() && hits.length === 0 && <p className="p-6 text-center text-sm text-muted">No products match “{q}”. Try a wattage like “550 Wp” or a model number.</p>}
        <ul id={listId} role="listbox" aria-label="Search results">
          {hits.map((h, i) => (
            <li
              key={h.item.p.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(`/products/${h.item.p.slug}`)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-verdi-50" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  <Highlight text={h.item.p.name} query={q} />
                </p>
                <p className="truncate text-xs text-muted">
                  {h.item.brand} · {category(h.item.p.categoryId)?.name} {h.item.p.model ? `· ${h.item.p.model}` : ""}
                </p>
              </div>
              <span className="num shrink-0 text-xs text-ink/70">{h.item.p.price.sellingPaise !== null ? formatPaise(h.item.p.price.sellingPaise) : "On request"}</span>
              {i === active && <CornerDownLeft className="size-3.5 shrink-0 text-subtle" />}
            </li>
          ))}
        </ul>
        {q.trim() && (
          <button
            type="button"
            onClick={() => go(`/products?q=${encodeURIComponent(q)}`)}
            onMouseEnter={() => setActive(hits.length)}
            className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-verdi-700 ${active === hits.length ? "bg-verdi-50" : ""}`}
          >
            See all results with filters <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </Modal>
  );
}
