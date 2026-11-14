import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { RegisterInput } from "../../shared/admin-schemas";
import type { AdminIdentity, CustomerProfile } from "../../shared/types";
import { api } from "./api";

interface AccountState {
  customer: CustomerProfile | null;
  /** True until we know whether a session exists. */
  checking: boolean;
  login: (login: string, password: string) => Promise<CustomerProfile>;
  register: (input: RegisterInput) => Promise<CustomerProfile>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setCustomer: (c: CustomerProfile | null) => void;
}

const Ctx = createContext<AccountState | null>(null);

const post = (path: string, body?: unknown) => api<{ customer: CustomerProfile }>(path, { method: "POST", body: JSON.stringify(body ?? {}) });

/** The session cookie is HttpOnly; a non-secret hint cookie tells us whether asking the server is worthwhile. */
/** True while an admin (staff) session may exist in this browser (hint cookie set at admin sign-in). */
export const staffSignedIn = () => typeof document !== "undefined" && /(?:^|;\s*)vs_staff=1/.test(document.cookie);

/**
 * Signed-in admin (staff) for the public header. Asks the server only when the hint cookie is
 * present, and again whenever that changes (sign-in / sign-out in the admin area).
 */
export function useStaff(): { staff: AdminIdentity | null; signOut: () => Promise<void> } {
  const hint = staffSignedIn();
  const [staff, setStaff] = useState<AdminIdentity | null>(null);
  useEffect(() => {
    if (!hint) {
      setStaff(null);
      return;
    }
    let live = true;
    api<{ admin: AdminIdentity }>("/api/admin/me")
      .then((r) => live && setStaff(r.admin))
      .catch(() => {
        document.cookie = "vs_staff=; Path=/; Max-Age=0";
        if (live) setStaff(null);
      });
    return () => {
      live = false;
    };
  }, [hint]);
  const signOut = useCallback(async () => {
    await api("/api/admin/logout", { method: "POST", body: "{}" }).catch(() => undefined);
    document.cookie = "vs_staff=; Path=/; Max-Age=0";
    setStaff(null);
  }, []);
  return { staff, signOut };
}

const mightBeSignedIn = () => typeof document !== "undefined" && /(?:^|;\s*)vs_signed_in=1/.test(document.cookie);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [checking, setChecking] = useState(mightBeSignedIn);

  const refresh = useCallback(async () => {
    try {
      const r = await api<{ customer: CustomerProfile | null }>("/api/account/me");
      setCustomer(r.customer);
    } catch {
      /* offline: keep current state */
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (mightBeSignedIn()) void refresh(); // anonymous visitors never call the Worker
  }, [refresh]);

  const value = useMemo<AccountState>(
    () => ({
      customer,
      checking,
      setCustomer,
      refresh,
      login: async (login, password) => {
        const r = await post("/api/account/login", { login, password });
        setCustomer(r.customer);
        return r.customer;
      },
      register: async (input) => {
        const r = await post("/api/account/register", input);
        setCustomer(r.customer);
        return r.customer;
      },
      logout: async () => {
        await api("/api/account/logout", { method: "POST", body: "{}" }).catch(() => undefined);
        setCustomer(null);
      },
    }),
    [customer, checking, refresh],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAccount = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAccount outside AccountProvider");
  return c;
};
