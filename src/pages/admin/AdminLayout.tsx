import { LayoutDashboard, LogOut, ShieldAlert, Tags } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router";
import type { AdminIdentity } from "../../../shared/types";
import { Spinner } from "../../components/ui";
import { api, ApiError } from "../../lib/api";
import { usePageMeta } from "../../lib/seo";

const AdminCtx = createContext<AdminIdentity | null>(null);
export const useAdmin = () => useContext(AdminCtx)!;

export default function AdminLayout() {
  usePageMeta("Admin", undefined, { noindex: true });
  const [state, setState] = useState<{ admin?: AdminIdentity; error?: ApiError } | null>(null);

  useEffect(() => {
    api<{ admin: AdminIdentity }>("/api/admin/me")
      .then((r) => setState({ admin: r.admin }))
      .catch((e: ApiError) => setState({ error: e }));
  }, []);

  if (!state)
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted">
        <Spinner /> Checking your access…
      </div>
    );

  if (state.error) {
    const e = state.error;
    const title = e.status === 401 ? "Please sign in" : e.status === 403 ? "Access denied" : e.status === 503 ? "Admin sign-in not configured" : "Admin unavailable";
    return (
      <div className="container-x py-24">
        <div className="card mx-auto max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto size-9 text-sun-500" />
          <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted">{e.message}</p>
          <div className="mt-6 flex justify-center gap-2">
            {e.status === 401 && (
              <button type="button" className="btn-primary" onClick={() => window.location.assign("/admin")}>
                Sign in
              </button>
            )}
            {e.status === 403 && (
              <a className="btn-ghost" href="/cdn-cgi/access/logout">
                Sign in with another account
              </a>
            )}
            <a className="btn-ghost" href="/">
              Back to website
            </a>
          </div>
        </div>
      </div>
    );
  }

  const admin = state.admin!;
  return (
    <AdminCtx.Provider value={admin}>
      <div className="border-b border-line bg-ink text-paper">
        <div className="container-x flex flex-wrap items-center gap-3 py-3">
          <span className="rounded-full bg-sun-400 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-ink uppercase">Admin</span>
          <nav aria-label="Admin" className="flex gap-1">
            <NavLink end to="/admin" className={({ isActive }) => `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${isActive ? "bg-white/10" : "text-paper/70 hover:text-paper"}`}>
              <LayoutDashboard className="size-4" /> Dashboard
            </NavLink>
            <NavLink to="/admin/prices" className={({ isActive }) => `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${isActive ? "bg-white/10" : "text-paper/70 hover:text-paper"}`}>
              <Tags className="size-4" /> Prices
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-paper/60">
            <span className="hidden sm:inline">
              {admin.email} · <span className="text-paper/90">{admin.role.replace("_", " ")}</span>
            </span>
            <a href="/cdn-cgi/access/logout" className="inline-flex items-center gap-1 hover:text-paper">
              <LogOut className="size-3.5" /> Sign out
            </a>
          </div>
        </div>
      </div>
      <Outlet />
    </AdminCtx.Provider>
  );
}
