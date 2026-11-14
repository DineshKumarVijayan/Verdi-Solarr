import { AlertTriangle, Check, History, Pencil, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { formatPaise, gstLabel } from "../../../shared/money";
import { GST_RATES, paiseToRupeeInput, rupeesToPaise } from "../../../shared/schemas";
import type { AdminPriceRow, PriceHistoryRow } from "../../../shared/types";
import { Modal, Spinner, useToast } from "../../components/ui";
import { api, ApiError } from "../../lib/api";
import { useCatalogue } from "../../lib/catalogue";
import { useAdmin } from "./AdminLayout";

const UNITS = ["per piece", "per metre", "per 500 m coil", "per 2000 m drum", "per set", "per kit"];
const dt = (s: string) => (s ? new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");

export default function Prices() {
  const admin = useAdmin();
  const canEdit = admin.role !== "viewer";
  const { data } = useCatalogue();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [rows, setRows] = useState<AdminPriceRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminPriceRow | null>(null);
  const brandF = params.get("brand") ?? "";
  const catF = params.get("category") ?? "";
  const missing = params.get("missing") === "1";

  const load = useCallback(() => {
    const sp = new URLSearchParams();
    if (params.get("q")) sp.set("q", params.get("q")!);
    if (brandF) sp.set("brand", brandF);
    if (catF) sp.set("category", catF);
    if (missing) sp.set("missing", "1");
    sp.set("limit", "200");
    setError(null);
    api<{ rows: AdminPriceRow[]; total: number }>(`/api/admin/prices?${sp}`)
      .then((r) => {
        setRows(r.rows);
        setTotal(r.total);
      })
      .catch((e: ApiError) => setError(e.message));
  }, [params, brandF, catF, missing]);

  useEffect(load, [load]);

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const set = (k: string, v: string | null) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        if (v) n.set(k, v);
        else n.delete(k);
        return n;
      },
      { replace: true },
    );

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Price management</h1>
          <p className="mt-1 text-sm text-muted">Prices are stored in rupees and paise. Saved prices appear on the public site within about a minute.</p>
        </div>
        <button type="button" className="btn-ghost btn-sm" onClick={load}>
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1 basis-60">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle" />
          <input
            aria-label="Search products"
            className="field !rounded-full pl-10"
            placeholder="Search name, SKU or model"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              clearTimeout(timer.current);
              const v = e.target.value;
              timer.current = setTimeout(() => set("q", v.trim() || null), 350);
            }}
            data-testid="admin-search"
          />
        </div>
        <select aria-label="Manufacturer" className="field !w-auto !rounded-full" value={brandF} onChange={(e) => set("brand", e.target.value || null)}>
          <option value="">All manufacturers</option>
          {data?.brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
        <select aria-label="Category" className="field !w-auto !rounded-full" value={catF} onChange={(e) => set("category", e.target.value || null)}>
          <option value="">All categories</option>
          {data?.categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="chip cursor-pointer">
          <input type="checkbox" className="accent-verdi-600" checked={missing} onChange={(e) => set("missing", e.target.checked ? "1" : null)} />
          Missing price only
        </label>
      </div>

      {error && <p className="mt-6 rounded-xl bg-danger-bg p-4 text-sm text-danger">{error}</p>}
      {!rows && !error && (
        <div className="mt-10 flex justify-center">
          <Spinner />
        </div>
      )}
      {rows && (
        <>
          <p className="num mt-4 text-xs text-muted">{total} products</p>
          <div className="card relative mt-2 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-paper-2/70 text-left text-xs text-muted">
                <tr>
                  <th className="p-3 font-semibold">Product</th>
                  <th className="p-3 font-semibold">Selling price</th>
                  <th className="p-3 font-semibold">MRP</th>
                  <th className="p-3 font-semibold">GST</th>
                  <th className="p-3 font-semibold">Last change</th>
                  <th className="p-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.productId} className="border-t border-line/70 align-top" data-testid="admin-price-row">
                    <td className="p-3">
                      <p className="font-medium">{r.name}</p>
                      <p className="num text-xs text-muted">
                        {r.sku} · {r.brand} · {r.category}
                        {!r.isActive && <span className="ml-1 rounded bg-paper-3 px-1">archived</span>}
                      </p>
                    </td>
                    <td className="num p-3">
                      {r.sellingPaise === null ? <span className="text-sun-600">Not set</span> : formatPaise(r.sellingPaise)}
                      <span className="block text-[11px] text-subtle">{r.unit}</span>
                    </td>
                    <td className="num p-3">{r.mrpPaise === null ? "—" : formatPaise(r.mrpPaise)}</td>
                    <td className="p-3 text-xs">{gstLabel(r)}</td>
                    <td className="p-3 text-xs text-muted">
                      {r.updatedBy === "seed" ? "Imported" : r.updatedBy}
                      <span className="block">{dt(r.updatedAt)}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button type="button" className="btn-ghost btn-sm" onClick={() => setEditing(r)} aria-label={`${canEdit ? "Edit" : "View"} price for ${r.name}`}>
                        {canEdit ? <Pencil className="size-3.5" /> : <History className="size-3.5" />} {canEdit ? "Edit" : "History"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <p className="p-8 text-center text-sm text-muted">No products match.</p>}
          </div>
        </>
      )}

      {editing && (
        <PriceEditor
          row={editing}
          canEdit={canEdit}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setRows((rs) => rs?.map((r) => (r.productId === saved.productId ? saved : r)) ?? null);
            setEditing(saved);
          }}
        />
      )}
    </div>
  );
}

function PriceEditor({ row, canEdit, onClose, onSaved }: { row: AdminPriceRow; canEdit: boolean; onClose: () => void; onSaved: (r: AdminPriceRow) => void }) {
  const toast = useToast();
  const [base, setBase] = useState(row);
  const [selling, setSelling] = useState(paiseToRupeeInput(row.sellingPaise));
  const [mrp, setMrp] = useState(paiseToRupeeInput(row.mrpPaise));
  const [gstRate, setGstRate] = useState<string>(row.gstRate === null ? "" : String(row.gstRate));
  const [gstIncluded, setGstIncluded] = useState(row.gstIncluded);
  const [unit, setUnit] = useState(row.unit);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflict, setConflict] = useState<AdminPriceRow | null>(null);
  const [history, setHistory] = useState<PriceHistoryRow[] | null>(null);

  const loadHistory = useCallback(() => {
    api<{ history: PriceHistoryRow[] }>(`/api/admin/prices/${row.productId}/history`)
      .then((r) => setHistory(r.history))
      .catch(() => setHistory([]));
  }, [row.productId]);
  useEffect(loadHistory, [loadHistory]);

  const resetTo = (r: AdminPriceRow) => {
    setBase(r);
    setSelling(paiseToRupeeInput(r.sellingPaise));
    setMrp(paiseToRupeeInput(r.mrpPaise));
    setGstRate(r.gstRate === null ? "" : String(r.gstRate));
    setGstIncluded(r.gstIncluded);
    setUnit(r.unit);
    setConflict(null);
  };

  const save = async () => {
    const e: Record<string, string> = {};
    const sp = rupeesToPaise(selling);
    const mp = rupeesToPaise(mrp);
    if (Number.isNaN(sp)) e.selling = "Enter a valid amount, e.g. 12499 or 12499.50";
    if (Number.isNaN(mp)) e.mrp = "Enter a valid amount";
    if (!e.selling && !e.mrp && sp !== null && mp !== null && sp > mp) e.selling = "Selling price cannot exceed MRP";
    if (sp === 0) e.selling = "Use an empty value for “price on request”, not 0";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const res = await api<{ row: AdminPriceRow; catalogueVersion: number | null }>(`/api/admin/prices/${row.productId}`, {
        method: "PUT",
        body: JSON.stringify({
          sellingPricePaise: sp,
          mrpPaise: mp,
          gstIncluded,
          gstRate: gstRate === "" ? null : Number(gstRate),
          priceUnit: unit,
          expectedVersion: base.version,
          reason,
        }),
      });
      // Only now — after the database confirmed the commit — report success.
      toast(`Saved ${res.row.name}. Live on the website within about a minute.`, "success");
      setReason("");
      resetTo(res.row);
      onSaved(res.row);
      loadHistory();
    } catch (err) {
      const ae = err as ApiError;
      if (ae.status === 409) {
        const cur = (ae.details as { current?: AdminPriceRow } | undefined)?.current ?? null;
        setConflict(cur);
      } else if (ae.status === 422 && Array.isArray(ae.details)) {
        const fe: Record<string, string> = {};
        for (const d of ae.details as { path: string; message: string }[]) fe[d.path === "mrpPaise" ? "mrp" : "selling"] = d.message;
        setErrors(fe);
      } else {
        toast(ae.message ?? "Save failed. Nothing was changed.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={row.name} description={`${row.sku} · ${row.brand}`} size="lg" fullscreenOnMobile>
      <div className="grid gap-6 p-5 md:grid-cols-[1.1fr_1fr]">
        <form
          className="grid content-start gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          {conflict && (
            <div className="rounded-xl border border-sun-300 bg-sun-100 p-3 text-sm" role="alert">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="size-4 text-sun-600" /> Someone else changed this price
              </p>
              <p className="mt-1 text-xs">
                Latest: <strong className="num">{formatPaise(conflict.sellingPaise)}</strong> by {conflict.updatedBy} at {dt(conflict.updatedAt)}. Your edit was not saved.
              </p>
              <button type="button" className="btn-dark btn-sm mt-2" onClick={() => resetTo(conflict)}>
                Load latest and re-apply
              </button>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-sell" className="label">
                Selling price (₹)
              </label>
              <input id="p-sell" className={`field num ${errors.selling ? "!border-danger" : ""}`} inputMode="decimal" placeholder="Empty = price on request" value={selling} onChange={(e) => setSelling(e.target.value)} disabled={!canEdit} aria-invalid={!!errors.selling} data-testid="price-input" />
              {errors.selling && <p className="mt-1 text-xs text-danger">{errors.selling}</p>}
            </div>
            <div>
              <label htmlFor="p-mrp" className="label">
                MRP (₹, optional)
              </label>
              <input id="p-mrp" className={`field num ${errors.mrp ? "!border-danger" : ""}`} inputMode="decimal" value={mrp} onChange={(e) => setMrp(e.target.value)} disabled={!canEdit} aria-invalid={!!errors.mrp} />
              {errors.mrp && <p className="mt-1 text-xs text-danger">{errors.mrp}</p>}
            </div>
            <div>
              <label htmlFor="p-gst" className="label">
                GST rate
              </label>
              <select id="p-gst" className="field" value={gstRate} onChange={(e) => setGstRate(e.target.value)} disabled={!canEdit}>
                <option value="">Not specified (“as applicable”)</option>
                {GST_RATES.map((r) => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-unit" className="label">
                Price unit
              </label>
              <select id="p-unit" className="field" value={unit} onChange={(e) => setUnit(e.target.value)} disabled={!canEdit}>
                {[...new Set([unit, ...UNITS])].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" className="size-4 accent-verdi-600" checked={gstIncluded} onChange={(e) => setGstIncluded(e.target.checked)} disabled={!canEdit} />
            Selling price includes GST
          </label>
          <div>
            <label htmlFor="p-reason" className="label">
              Reason for change (optional)
            </label>
            <input id="p-reason" className="field" maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Manufacturer price revision Nov 2026" disabled={!canEdit} />
          </div>
          <div className="rounded-xl bg-paper-2 p-3 text-xs text-muted">
            Customers will see:{" "}
            <strong className="num text-ink">
              {(() => {
                const p = rupeesToPaise(selling);
                return p === null || Number.isNaN(p) ? "Price on request" : formatPaise(p);
              })()}
            </strong>{" "}
            {unit} · {gstLabel({ gstIncluded, gstRate: gstRate === "" ? null : Number(gstRate) })}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={saving} data-testid="save-price">
                {saving ? <Spinner className="size-4" /> : <Check className="size-4" />} Save price
              </button>
              <button type="button" className="btn-ghost" onClick={onClose} data-testid="cancel-price">
                Cancel
              </button>
            </div>
          )}
          <p className="text-[11px] text-subtle">
            Version <span className="num">{base.version}</span> · last changed {base.updatedBy === "seed" ? "at import" : `by ${base.updatedBy}`} · {dt(base.updatedAt)}
          </p>
        </form>
        <section aria-label="Price history">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <History className="size-4" /> Price history
          </h3>
          {!history ? (
            <Spinner className="mt-4 size-4" />
          ) : history.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No changes recorded yet.</p>
          ) : (
            <ol className="mt-3 grid gap-3 border-l border-line pl-4" data-testid="price-history">
              {history.map((h) => (
                <li key={h.historyId} className="relative text-sm">
                  <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-verdi-500" />
                  <p className="num">
                    {formatPaise(h.oldPricePaise)} → <strong>{formatPaise(h.newPricePaise)}</strong>
                  </p>
                  <p className="text-xs text-muted">
                    {h.changedBy} · {dt(h.changedAt)}
                  </p>
                  {h.reason && <p className="text-xs text-ink/70">“{h.reason}”</p>}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </Modal>
  );
}
