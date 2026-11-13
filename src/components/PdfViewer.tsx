// Lazy-loaded (separate chunk) — pdf.js is only downloaded when a customer opens a datasheet.
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy, type RenderTask } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Minus, Plus, Scan } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "./ui";

GlobalWorkerOptions.workerSrc = workerUrl;

interface PageInfo {
  w: number;
  h: number;
}

export default function PdfViewer({ url, onError }: { url: string; onError?: (msg: string) => void }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1); // 1 = fit width
  const [current, setCurrent] = useState(1);
  const [width, setWidth] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  // Load document
  useEffect(() => {
    let cancelled = false;
    setDoc(null);
    setPages([]);
    setError(null);
    const task = getDocument({
      url,
      enableXfa: false,
      cMapUrl: "/pdfjs/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "/pdfjs/standard_fonts/",
      wasmUrl: "/pdfjs/wasm/",
      iccUrl: "/pdfjs/iccs/",
    });
    task.promise
      .then(async (d) => {
        if (cancelled) return void d.cleanup();
        const infos: PageInfo[] = [];
        for (let i = 1; i <= d.numPages; i++) {
          const p = await d.getPage(i);
          const vp = p.getViewport({ scale: 1 });
          infos.push({ w: vp.width, h: vp.height });
        }
        if (cancelled) return;
        setDoc(d);
        setPages(infos);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        const msg = e?.name === "MissingPDFException" || /404|Missing/i.test(e?.message ?? "") ? "The datasheet file could not be found." : "The datasheet could not be displayed.";
        setError(msg);
        onError?.(msg);
      });
    return () => {
      cancelled = true;
      task.destroy().catch(() => undefined);
    };
  }, [url, onError]);

  // Track container width for fit-to-width rendering
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const kids = Array.from(el.querySelectorAll<HTMLElement>("[data-page]"));
    const mid = el.scrollTop + el.clientHeight / 3;
    for (const k of kids) {
      if (k.offsetTop + k.offsetHeight > mid) {
        setCurrent(Number(k.dataset.page));
        break;
      }
    }
  }, []);

  const pageWidth = Math.max(240, (width - 32) * zoom);

  return (
    <div className="flex h-full min-h-[60dvh] flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line/70 bg-paper-2/70 px-3 py-2">
        <p className="num text-xs text-muted" aria-live="polite">
          {pages.length ? `Page ${current} / ${pages.length}` : "Loading…"}
        </p>
        <div className="flex items-center gap-1" role="group" aria-label="Zoom">
          <button type="button" className="btn-ghost btn-sm !p-2" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="Zoom out">
            <Minus className="size-4" />
          </button>
          <span className="num w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
          <button type="button" className="btn-ghost btn-sm !p-2" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Zoom in">
            <Plus className="size-4" />
          </button>
          <button type="button" className="btn-ghost btn-sm !p-2" onClick={() => setZoom(1)} aria-label="Fit to width">
            <Scan className="size-4" />
          </button>
        </div>
      </div>
      <div ref={scroller} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-auto bg-ink-3/95 p-4" tabIndex={0} aria-label="Datasheet pages">
        {error && (
          <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-card p-5 text-center text-sm">
            <p className="font-semibold">{error}</p>
            <p className="mt-1 text-muted">Try “Open in new tab” or “Download” instead.</p>
          </div>
        )}
        {!error && !doc && (
          <div className="flex h-60 items-center justify-center gap-3 text-paper/80">
            <Spinner /> <span className="text-sm">Loading manufacturer datasheet…</span>
          </div>
        )}
        {doc && width > 0 && (
          <div className="flex flex-col items-center gap-4">
            {pages.map((p, i) => (
              <PdfPage key={i} doc={doc} pageNumber={i + 1} info={p} cssWidth={pageWidth} root={scroller} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PdfPage({ doc, pageNumber, info, cssWidth, root }: { doc: PDFDocumentProxy; pageNumber: number; info: PageInfo; cssWidth: number; root: React.RefObject<HTMLDivElement | null> }) {
  const holder = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(pageNumber <= 2);
  const [rendered, setRendered] = useState(false);
  const cssHeight = (cssWidth * info.h) / info.w;

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { root: root.current, rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  useEffect(() => {
    if (!visible) return;
    let task: RenderTask | null = null;
    let cancelled = false;
    setRendered(false);
    const t = setTimeout(async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled || !canvasRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const scale = (cssWidth / info.w) * dpr;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      task = page.render({ canvas, viewport });
      try {
        await task.promise;
        if (!cancelled) setRendered(true);
      } catch {
        /* cancelled on zoom */
      }
    }, 60);
    return () => {
      cancelled = true;
      clearTimeout(t);
      task?.cancel();
    };
  }, [visible, doc, pageNumber, cssWidth, info.w]);

  return (
    <div ref={holder} data-page={pageNumber} className="relative shrink-0 overflow-hidden rounded-md bg-white shadow-lg" style={{ width: cssWidth, height: cssHeight }}>
      <canvas ref={canvasRef} style={{ width: cssWidth, height: cssHeight }} aria-label={`Page ${pageNumber}`} role="img" />
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center text-subtle">
          <Spinner />
        </div>
      )}
    </div>
  );
}
