import { ClipboardList, Images, LayoutDashboard, Layers, LockKeyhole, LogOut, Package, Settings, ShieldAlert, ShieldCheck, Tags, Users } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState, type FormEvent } from "react";
import { NavLink, Outlet } from "react-router";
import type { AdminIdentity } from "../../../shared/types";
import { Spinner } from "../../components/ui";
import { api, ApiError } from "../../lib/api";
import { usePageMeta } from "../../lib/seo";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/prices", label: "Prices", icon: Tags },
  { to: "/admin/catalogue", label: "Brands & categories", icon: Layers },
  { to: "/admin/field-photos", label: "Field photos", icon: Images },
  { to: "/admin/enquiries", label: "Enquiries", icon: ClipboardList },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/users", label: "Admin users", icon: ShieldCheck, owner: true },
];

const AdminCtx = createContext<AdminIdentity | null>(null);
export const useAdmin = () => useContext(AdminCtx)!;

export default function AdminLayout() {
  usePageMeta("Admin", undefined, { noindex: true });
  const [state, setState] = useState<{ admin?: AdminIdentity; error?: ApiError } | null>(null);

  const check = useCallback(() => {
    api<{ admin: AdminIdentity }>("/api/admin/me")
      .then((r) => setState({ admin: r.admin }))
      .catch((e: ApiError) => setState({ error: e }));
  }, []);
  useEffect(check, [check]);

  if (!state)
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted">
        <Spinner /> Checking your access…
      </div>
    );

  if (state.error?.status === 401) return <AdminLogin onDone={(admin) => setState({ admin })} />;
  if (state.error) {
    return (
      <div className="container-x py-24">
        <div className="card mx-auto max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto size-9 text-sun-500" />
          <h1 className="mt-4 text-2xl font-semibold">Admin unavailable</h1>
          <p className="mt-2 text-sm text-muted">{state.error.message}</p>
          <button type="button" className="btn-ghost mt-6" onClick={check}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const admin = state.admin!;
  const signOut = async () => {
    await api("/api/admin/logout", { method: "POST", body: "{}" }).catch(() => undefined);
    setState({ error: new ApiError(401, "signed_out", "Signed out.") });
  };
  return (
    <AdminCtx.Provider value={admin}>
      <div className="border-b border-line bg-ink text-paper">
        <div className="container-x flex flex-wrap items-center gap-3 py-3">
          <span className="rounded-full bg-sun-400 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-ink uppercase">Admin</span>
          <nav aria-label="Admin" className="scrollbar-none -mx-1 order-last flex min-w-0 basis-full gap-1 overflow-x-auto px-1">
            {NAV.filter((n) => !n.owner || admin.role === "owner").map((n) => (
              <NavLink key={n.to} end={n.end} to={n.to} className={({ isActive }) => `inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${isActive ? "bg-white/10 text-paper" : "text-paper/70 hover:text-paper"}`}>
                <n.icon className="size-4" /> {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-paper/60">
            <span className="hidden sm:inline">
              {admin.displayName ?? admin.email} · <span className="text-paper/90">{admin.role.replace("_", " ")}</span>
            </span>
            <button type="button" onClick={signOut} className="inline-flex items-center gap-1 hover:text-paper" data-testid="admin-sign-out">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>
      <Outlet />
    </AdminCtx.Provider>
  );
}

function AdminLogin({ onDone }: { onDone: (a: AdminIdentity) => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ admin: AdminIdentity }>("/api/admin/login", { method: "POST", body: JSON.stringify({ login, password }) });
      onDone(r.admin);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container-x py-16 sm:py-24">
      <form className="card mx-auto grid max-w-sm gap-4 p-6 sm:p-8" onSubmit={submit} noValidate data-testid="admin-login-form">
        <LockKeyhole className="size-8 text-verdi-600" />
        <div>
          <h1 className="text-2xl font-semibold">Staff sign-in</h1>
          <p className="mt-1 text-sm text-muted">For VERDI staff only.</p>
        </div>
        <div>
          <label htmlFor="al-login" className="label">
            Mobile number
          </label>
          <input id="al-login" type="tel" autoComplete="username" className="field" value={login} onChange={(e) => setLogin(e.target.value)} />
        </div>
        <div>
          <label htmlFor="al-pw" className="label">
            Password
          </label>
          <input id="al-pw" type="password" autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-danger-bg px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary" disabled={busy || !login || !password} data-testid="admin-login-submit">
          {busy && <Spinner className="size-4" />} Sign in
        </button>
        <p className="text-xs text-subtle">Forgot your password? Ask the owner to set a new one in Admin users.</p>
      </form>
    </div>
  );
}
