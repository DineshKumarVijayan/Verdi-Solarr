import { ArrowRight, Building2, ClipboardList, FileWarning, History, ImageOff, Images, Layers, Package, Plus, Settings, Tags, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { formatPaise } from "../../../shared/money";
import type { AdminDashboard } from "../../../shared/types";
import { Spinner } from "../../components/ui";
import { api, ApiError } from "../../lib/api";
import { useAdmin } from "./AdminLayout";

const dt = (s: string) => new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default function Dashboard() {
  const admin = useAdmin();
  const [d, setD] = useState<AdminDashboard | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    api<AdminDashboard>("/api/admin/dashboard")
      .then(setD)
      .catch((e: ApiError) => setErr(e.message));
  }, []);

  if (err) return <p className="container-x py-10 text-danger">{err}</p>;
  if (!d)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );

  const max = Math.max(1, ...d.categories.map((c) => c.count));
  const tiles = [
    { icon: ClipboardList, label: "New enquiries", value: d.newEnquiries, sub: "awaiting follow-up", warn: d.newEnquiries > 0, to: "/admin/enquiries?status=new" },
    { icon: Users, label: "Customer accounts", value: d.customers, sub: "registered customers", to: "/admin/customers" },
    { icon: Package, label: "Active products", value: d.activeProducts, sub: d.inactiveProducts ? `${d.inactiveProducts} hidden` : "none hidden", to: "/admin/products" },
    { icon: Building2, label: "Manufacturers", value: d.brands, sub: "active brands", to: "/admin/catalogue" },
    { icon: Tags, label: "Missing prices", value: d.missingPrices, sub: "shown as “price on request”", warn: d.missingPrices > 0, to: "/admin/prices?missing=1" },
    { icon: ImageOff, label: "Missing images", value: d.missingImages, sub: "using illustrations", warn: d.missingImages > 0, to: "/admin/products" },
    { icon: FileWarning, label: "Missing datasheets", value: d.missingDatasheets, sub: "products without PDF", warn: d.missingDatasheets > 0, to: "/admin/products" },
  ];

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-semibold">Welcome{admin.displayName ? `, ${admin.displayName}` : ""}</h1>
      <p className="mt-1 text-sm text-muted">
        Public catalogue version <span className="num">{d.catalogueVersion ?? "—"}</span>
        {d.cataloguePublishedAt ? ` · published ${dt(d.cataloguePublishedAt)}` : " · will publish on next visit"}
      </p>

      {(admin.role === "owner" || admin.role === "admin") && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/admin/products/new" className="btn-primary btn-sm">
            <Plus className="size-4" /> Add product
          </Link>
          <Link to="/admin/catalogue" className="btn-ghost btn-sm">
            <Layers className="size-4" /> Add brand or category
          </Link>
          <Link to="/admin/field-photos" className="btn-ghost btn-sm">
            <Images className="size-4" /> Field photos
          </Link>
          <Link to="/admin/settings" className="btn-ghost btn-sm">
            <Settings className="size-4" /> Contact details & links
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => {
          const body = (
            <>
              <t.icon className={`size-5 ${t.warn ? "text-sun-500" : "text-verdi-600"}`} />
              <p className="num mt-3 text-3xl">{t.value}</p>
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-xs text-muted">{t.sub}</p>
            </>
          );
          return t.to ? (
            <Link key={t.label} to={t.to} className={`card p-5 transition hover:shadow-[var(--shadow-lift)] ${t.warn ? "!border-sun-300" : ""}`}>
              {body}
            </Link>
          ) : (
            <div key={t.label} className={`card p-5 ${t.warn ? "!border-sun-300" : ""}`}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="font-semibold">Products by category</h2>
          <ul className="mt-4 grid gap-2.5">
            {d.categories.map((c) => (
              <li key={c.slug} className="grid grid-cols-[1fr_auto] items-center gap-x-3 text-sm">
                <span className="truncate">{c.name}</span>
                <span className="num text-xs text-muted">{c.count}</span>
                <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-paper-2">
                  <span className="block h-full rounded-full bg-verdi-500" style={{ width: `${(c.count / max) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recently updated prices</h2>
            <Link to="/admin/prices" className="text-xs font-semibold text-verdi-700 hover:underline">
              Manage <ArrowRight className="inline size-3" />
            </Link>
          </div>
          {d.recentPrices.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No prices have been entered yet. Start in Price Management.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {d.recentPrices.map((r) => (
                <li key={r.productId} className="text-sm">
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="text-xs text-muted">
                    <span className="num text-ink">{formatPaise(r.sellingPaise)}</span> · {r.updatedBy} · {dt(r.updatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <History className="size-4" /> Recent activity
          </h2>
          {d.recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No administrative activity recorded yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {d.recentActivity.map((a) => (
                <li key={a.auditId} className="text-sm">
                  <p className="font-medium">
                    {a.action} <span className="text-muted">· {a.entityType} #{a.entityId}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {a.adminIdentity} · {dt(a.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
