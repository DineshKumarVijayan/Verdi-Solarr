import { Download, ExternalLink, FileText } from "lucide-react";
import { createContext, lazy, Suspense, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Modal, Spinner } from "./ui";

const PdfViewer = lazy(() => import("./PdfViewer"));

interface Open {
  url: string;
  title: string;
}
const Ctx = createContext<(url: string, title: string) => void>(() => {});

/** App-level datasheet modal: opening it never navigates, so filters & scroll position are preserved. */
export function DatasheetProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<Open | null>(null);
  const open = useCallback((url: string, title: string) => setDoc({ url, title }), []);
  const close = useCallback(() => setDoc(null), []);
  const fileName = useMemo(() => doc?.url.split("/").pop() ?? "datasheet.pdf", [doc]);

  return (
    <Ctx.Provider value={open}>
      {children}
      <Modal
        open={!!doc}
        onClose={close}
        title={doc?.title ?? "Datasheet"}
        description="Manufacturer datasheet (PDF)"
        size="full"
        fullscreenOnMobile
        footer={
          doc && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">Source: manufacturer document. Specifications may change without notice.</p>
              <div className="flex gap-2">
                <a href={doc.url} target="_blank" rel="noopener" className="btn-ghost btn-sm">
                  <ExternalLink className="size-3.5" /> Open in new tab
                </a>
                <a href={doc.url} download={fileName} className="btn-primary btn-sm">
                  <Download className="size-3.5" /> Download
                </a>
              </div>
            </div>
          )
        }
      >
        {doc && (
          <div className="h-[72dvh] max-sm:h-full">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center gap-3 text-muted">
                  <Spinner /> Preparing viewer…
                </div>
              }
            >
              <PdfViewer url={doc.url} />
            </Suspense>
          </div>
        )}
      </Modal>
    </Ctx.Provider>
  );
}

export const useDatasheet = () => useContext(Ctx);

export function DatasheetButton({ url, title, variant = "ghost", label = "Preview datasheet" }: { url: string | null; title: string; variant?: "ghost" | "dark" | "link"; label?: string }) {
  const open = useDatasheet();
  if (!url) return null;
  const cls = variant === "dark" ? "btn-dark" : variant === "link" ? "inline-flex items-center gap-1.5 text-sm font-semibold text-verdi-700 hover:underline" : "btn-ghost";
  return (
    <button type="button" className={cls} onClick={() => open(url, title)} data-testid="preview-datasheet">
      <FileText className="size-4" /> {label}
    </button>
  );
}
