import { CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { PASSWORD_MIN } from "../../../shared/admin-schemas";
import type { AdminIdentity } from "../../../shared/types";
import { Spinner } from "../../components/ui";
import { api, ApiError } from "../../lib/api";

/** Staff sign-in, with "Change password" (also used for the first sign-in with a temporary password). */
export function AdminLogin({ onDone, notice }: { onDone: (a: AdminIdentity) => void; notice?: string | null }) {
  const [mode, setMode] = useState<"signin" | "change">("signin");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(notice ?? null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ admin: AdminIdentity }>("/api/admin/login", { method: "POST", body: JSON.stringify({ login, password }) });
      onDone(r.admin);
    } catch (err) {
      if (err instanceof ApiError && err.code === "password_change_required") {
        setInfo("Welcome! You signed in with a temporary password. Please choose your own password to continue.");
        setMode("change");
      } else setError(err instanceof ApiError ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  if (mode === "change")
    return (
      <Shell icon={<KeyRound className="size-8 text-verdi-600" />} title="Change password" intro="Enter your mobile number, your current (or temporary) password and a new password.">
        {info && <p className="rounded-xl bg-verdi-50 px-3 py-2 text-sm text-verdi-800">{info}</p>}
        <ChangePasswordForm
          initialLogin={login}
          initialCurrent={password}
          onDone={onDone}
          onCancel={() => {
            setMode("signin");
            setInfo(null);
            setPassword("");
          }}
        />
      </Shell>
    );

  return (
    <Shell icon={<LockKeyhole className="size-8 text-verdi-600" />} title="Staff sign-in" intro="For VERDI staff only.">
      <form className="grid gap-4" onSubmit={submit} noValidate data-testid="admin-login-form">
        {info && <p className="rounded-xl bg-sun-100 px-3 py-2 text-sm text-ink" role="status">{info}</p>}
        <div>
          <label htmlFor="al-login" className="label">
            Mobile number
          </label>
          <input id="al-login" type="tel" inputMode="tel" autoComplete="username" className="field" value={login} onChange={(e) => setLogin(e.target.value)} />
        </div>
        <PasswordField id="al-pw" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        {error && (
          <p role="alert" className="rounded-xl bg-danger-bg px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary" disabled={busy || !login || !password} data-testid="admin-login-submit">
          {busy && <Spinner className="size-4" />} Sign in
        </button>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <button type="button" className="font-semibold text-verdi-700 underline" onClick={() => (setMode("change"), setInfo(null), setError(null))} data-testid="admin-change-password-link">
            Change password
          </button>
          <span className="text-subtle">Forgot it? Ask the owner for a temporary password.</span>
        </div>
      </form>
    </Shell>
  );
}

function Shell({ icon, title, intro, children }: { icon: ReactNode; title: string; intro: string; children: ReactNode }) {
  return (
    <div className="container-x py-16 sm:py-24">
      <div className="card mx-auto grid max-w-sm gap-4 p-6 sm:p-8">
        {icon}
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{intro}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PasswordField({ id, label, value, onChange, autoComplete, hint, testId }: { id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string; hint?: string; testId?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} className="field pr-11" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
        <button type="button" className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-paper-2" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)}>
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}

const strength = (p: string) => [p.length >= PASSWORD_MIN, /[A-Za-z]/.test(p) && /\d/.test(p), p.length >= 12 || /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;

/** Mobile + current password + new password (twice). Signs in on success and signs out other devices. */
export function ChangePasswordForm({ initialLogin = "", initialCurrent = "", lockLogin = false, onDone, onCancel }: { initialLogin?: string; initialCurrent?: string; lockLogin?: boolean; onDone: (a: AdminIdentity) => void; onCancel?: () => void }) {
  const [login, setLogin] = useState(initialLogin);
  const [current, setCurrent] = useState(initialCurrent);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const s = strength(next);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < PASSWORD_MIN) return setError(`Use at least ${PASSWORD_MIN} characters.`);
    if (next !== confirm) return setError("The new passwords do not match.");
    if (next === current) return setError("Choose a password different from the current one.");
    setBusy(true);
    try {
      const r = await api<{ admin: AdminIdentity }>("/api/admin/password", { method: "POST", body: JSON.stringify({ login, currentPassword: current, newPassword: next }) });
      setDone(true);
      setTimeout(() => onDone(r.admin), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change the password.");
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <p className="flex items-center gap-2 rounded-xl bg-verdi-50 px-3 py-3 text-sm font-medium text-verdi-800" role="status">
        <CheckCircle2 className="size-5" /> Password changed. Other devices have been signed out.
      </p>
    );

  return (
    <form className="grid gap-4" onSubmit={submit} noValidate data-testid="admin-change-password-form">
      {!lockLogin && (
        <div>
          <label htmlFor="cp-login" className="label">
            Mobile number
          </label>
          <input id="cp-login" type="tel" inputMode="tel" autoComplete="username" className="field" value={login} onChange={(e) => setLogin(e.target.value)} />
        </div>
      )}
      <PasswordField id="cp-current" label="Current or temporary password" value={current} onChange={setCurrent} autoComplete="current-password" />
      <div>
        <PasswordField id="cp-new" label="New password" value={next} onChange={setNext} autoComplete="new-password" testId="cp-new" />
        <div className="mt-2 flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i < s ? (s === 1 ? "bg-danger" : s === 2 ? "bg-sun-400" : "bg-verdi-500") : "bg-line"}`} />
          ))}
        </div>
        <p className="mt-1 text-xs text-subtle">At least {PASSWORD_MIN} characters. Mixing letters, numbers and a symbol makes it stronger.</p>
      </div>
      <PasswordField id="cp-confirm" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" testId="cp-confirm" />
      {error && (
        <p role="alert" className="rounded-xl bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        {onCancel && (
          <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
            {lockLogin ? "Cancel" : "Back to sign-in"}
          </button>
        )}
        <button type="submit" className="btn-primary flex-1" disabled={busy || !login || !current || !next || !confirm} data-testid="cp-submit">
          {busy && <Spinner className="size-4" />} Change password
        </button>
      </div>
    </form>
  );
}
