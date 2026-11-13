import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import type { PublicProduct } from "../../shared/types";
import { m } from "./motion";
import { isCutout, ProductImage, ProductVisual } from "./ProductVisual";
import { Modal } from "./ui";

/** Product image gallery with thumbnails and a high-resolution zoomable preview. */
export function ProductGallery({ product, categorySlug }: { product: PublicProduct; categorySlug: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const imgs = product.images;
  if (imgs.length === 0) return <ProductVisual product={product} categorySlug={categorySlug} size="hero" label="Illustration · product photo coming soon" />;
  const cur = imgs[Math.min(i, imgs.length - 1)];

  return (
    <div className="grid gap-3">
      <button type="button" onClick={() => setOpen(true)} className="group relative block w-full cursor-zoom-in text-left" aria-label="Open high-resolution image" data-testid="gallery-main">
        <AnimatePresence mode="wait">
          <m.div key={cur.url} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <ProductImage url={cur.url} alt={cur.alt ?? product.name} className="aspect-[4/3]" eager />
          </m.div>
        </AnimatePresence>
        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-medium text-paper opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-3.5" /> View large
        </span>
      </button>
      {imgs.length > 1 && (
        <div className="flex gap-2" role="tablist" aria-label="Product images">
          {imgs.map((im, k) => (
            <button
              key={im.url}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={im.alt ?? `Image ${k + 1}`}
              onClick={() => setI(k)}
              className={`w-20 overflow-hidden rounded-xl ring-2 transition ${k === i ? "ring-verdi-500" : "ring-transparent opacity-70 hover:opacity-100"}`}
            >
              <ProductImage url={im.url} alt="" className="aspect-square" />
            </button>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => { setOpen(false); setZoom(null); }} title={product.name} description={cur.alt ?? undefined} size="full" fullscreenOnMobile>
        <div className={`relative h-[75dvh] overflow-hidden max-sm:h-full ${isCutout(cur.url) ? "bg-[radial-gradient(circle_at_50%_30%,#fff,#e6ece2)]" : "bg-ink"}`}>
          <img
            src={cur.url}
            alt={cur.alt ?? product.name}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom(zoom ? null : { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            className={`size-full object-contain p-6 transition-transform duration-300 ${zoom ? "scale-[2.2] cursor-zoom-out" : "cursor-zoom-in"}`}
            style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
          <button type="button" onClick={() => setZoom(zoom ? null : { x: 50, y: 50 })} className="btn-dark btn-sm absolute right-4 bottom-4" aria-label={zoom ? "Zoom out" : "Zoom in"}>
            {zoom ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />} {zoom ? "Zoom out" : "Zoom in"}
          </button>
          {imgs.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              {imgs.map((im, k) => (
                <button key={im.url} type="button" onClick={() => { setI(k); setZoom(null); }} className={`size-3 rounded-full ${k === i ? "bg-verdi-500" : "bg-subtle/60"}`} aria-label={`Show image ${k + 1}`} />
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
