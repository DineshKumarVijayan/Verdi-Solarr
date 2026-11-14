import { X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Accessible modal built on the native <dialog> element:
 * - showModal() makes the rest of the page inert and traps focus
 * - Escape closes (cancel event), focus returns to the opener
 * - background scrolling is locked while open
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  fullscreenOnMobile = false,
  hideTitle = false,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  fullscreenOnMobile?: boolean;
  hideTitle?: boolean;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCloseEvt = () => {
      document.documentElement.style.overflow = "";
      const el = opener.current as HTMLElement | null;
      if (el && typeof el.focus === "function") el.focus({ preventScroll: true });
    };
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener("close", onCloseEvt);
    d.addEventListener("cancel", onCancel);
    return () => {
      d.removeEventListener("close", onCloseEvt);
      d.removeEventListener("cancel", onCancel);
    };
  }, [onClose]);

  useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );

  const widths = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl", full: "sm:max-w-[min(1200px,96vw)]" }[size];
  const mobile = fullscreenOnMobile ? "max-sm:m-0 max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:w-screen max-sm:max-w-none max-sm:rounded-none" : "w-[calc(100vw-1.5rem)]";

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className={`m-auto max-h-[92dvh] overflow-hidden rounded-3xl bg-card p-0 text-ink shadow-[var(--shadow-lift)] backdrop:bg-transparent ${widths} ${mobile} sm:w-full`}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // click on backdrop
      }}
    >
      {open && (
        <div className="flex max-h-[inherit] flex-col max-sm:h-full">
          <div className={`flex items-start justify-between gap-4 border-b border-line/70 px-5 py-4 ${hideTitle ? "sr-only" : ""}`}>
            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-0.5 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} className="btn-ghost btn-sm shrink-0 !p-2" aria-label="Close dialog">
              <X className="size-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-t border-line/70 px-5 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

// ---------------------------------------------------------------- toasts
interface Toast {
  id: number;
  message: ReactNode;
  tone: "info" | "success" | "error";
}
const ToastCtx = createContext<(message: ReactNode, tone?: Toast["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: ReactNode, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] lg:bottom-4 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-rise rounded-2xl px-4 py-3 text-sm font-medium shadow-[var(--shadow-lift)] ${
              t.tone === "error" ? "bg-danger text-white" : t.tone === "success" ? "bg-verdi-700 text-white" : "bg-ink text-paper"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

export function Spinner({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SectionHeading({ eyebrow, title, intro, align = "left", dark = false }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; align?: "left" | "center"; dark?: boolean }) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className={`eyebrow ${dark ? "!text-verdi-300" : ""}`}>{eyebrow}</p>}
      <h2 className={`mt-2 text-3xl font-semibold sm:text-4xl ${dark ? "text-paper" : ""}`}>{title}</h2>
      {intro && <p className={`mt-3 text-base leading-relaxed ${dark ? "text-paper/70" : "text-muted"}`}>{intro}</p>}
    </div>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-sun-300/60 bg-sun-100/60 px-3.5 py-2.5 text-xs leading-relaxed text-ink/75">{children}</p>;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  id,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  id?: string;
  hint?: string;
}) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div>
      <label htmlFor={fid} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={fid}
          type="number"
          inputMode="decimal"
          className={`field num ${unit ? "pr-14" : ""}`}
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const n = e.target.valueAsNumber;
            onChange(Number.isFinite(n) ? n : 0);
          }}
        />
        {unit && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-subtle">{unit}</span>}
      </div>
      {hint && <p className="mt-1 text-[11px] text-subtle">{hint}</p>}
    </div>
  );
}

export function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (n: number) => string;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-ink/80">
          {label}
        </label>
        <span className="num text-sm text-ink">{format ? format(value) : value}</span>
      </div>
      <input id={id} type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
