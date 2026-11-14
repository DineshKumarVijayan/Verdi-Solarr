import { AlertTriangle, HelpCircle } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Modal } from "./ui";

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for deletes and discards (red button). */
  tone?: "danger" | "default";
}

type ConfirmFn = (o: ConfirmOptions) => Promise<boolean>;
const Ctx = createContext<ConfirmFn | null>(null);

/** In-app confirmation dialog (replaces the browser's confirm()). Usage: if (!(await confirm({...}))) return; */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (o) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setOpts(o);
      }),
    [],
  );
  const done = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  };
  const danger = opts?.tone === "danger";

  return (
    <Ctx.Provider value={confirm}>
      {children}
      <Modal
        open={!!opts}
        onClose={() => done(false)}
        title={opts?.title ?? ""}
        hideTitle
        size="sm"
        footer={
          <div className="flex w-full justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => done(false)} data-testid="confirm-cancel">
              {opts?.cancelLabel ?? "Cancel"}
            </button>
            <button type="button" className={danger ? "btn-primary !bg-danger hover:!bg-danger/90" : "btn-primary"} onClick={() => done(true)} autoFocus data-testid="confirm-ok">
              {opts?.confirmLabel ?? "OK"}
            </button>
          </div>
        }
      >
        {opts && (
          <div className="flex gap-4 px-6 pt-6 pb-2">
            <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${danger ? "bg-danger-bg text-danger" : "bg-verdi-50 text-verdi-700"}`}>
              {danger ? <AlertTriangle className="size-5" /> : <HelpCircle className="size-5" />}
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-ink">{opts.title}</h2>
              {opts.message && <div className="mt-1.5 text-sm leading-relaxed text-muted">{opts.message}</div>}
            </div>
          </div>
        )}
      </Modal>
    </Ctx.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const c = useContext(Ctx);
  if (!c) throw new Error("useConfirm outside ConfirmProvider");
  return c;
}

/** "You have unsaved changes" prompt. Resolves true when it is fine to leave. */
export function useConfirmDiscard() {
  const confirm = useConfirm();
  return useCallback(
    (dirty: boolean) =>
      dirty
        ? confirm({ title: "Discard unsaved changes?", message: "The changes you made on this page have not been saved and will be lost.", confirmLabel: "Discard changes", cancelLabel: "Keep editing", tone: "danger" })
        : Promise.resolve(true),
    [confirm],
  );
}
