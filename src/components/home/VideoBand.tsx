import { ArrowRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { FIELD_PHOTOS } from "../../pages/field-data";
import { m } from "../motion";

/** Full-bleed looping drone footage with a field-photo filmstrip teaser. */
export function VideoBand() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  // Only load/play when on screen (saves bandwidth); never autoplay with reduced motion.
  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) v.src = "/media/rooftop-array-aerial.mp4";
          v.play().then(() => setPlaying(true)).catch(() => undefined);
        } else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper">
      <video ref={ref} className="absolute inset-0 -z-20 size-full object-cover" poster="/media/rooftop-array-aerial-poster.webp" muted loop playsInline preload="none" aria-hidden="true" onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,24,34,0.85)_0%,rgba(10,24,34,0.35)_45%,rgba(10,24,34,0.92)_100%)]" />
      <div className="container-x py-20 sm:py-28">
        <m.p className="eyebrow !text-sun-300" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          In the field
        </m.p>
        <m.h2 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold sm:text-6xl" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          Every array starts with the <span className="text-sun-300">right specification.</span>
        </m.h2>
        <m.div className="mt-8 flex flex-wrap items-center gap-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Link to="/in-the-field" className="btn-sun">
            View field gallery <ArrowRight className="size-4" />
          </Link>
          <button
            type="button"
            className="btn-ghost-dark btn-sm"
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              if (!v.src) v.src = "/media/rooftop-array-aerial.mp4";
              if (v.paused) v.play().catch(() => undefined);
              else v.pause();
            }}
            aria-label={playing ? "Pause background video" : "Play background video"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />} {playing ? "Pause" : "Play"} video
          </button>
        </m.div>
      </div>
      <div className="marquee relative pb-10 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee-track flex gap-4" style={{ ["--marquee-duration" as string]: "55s" }}>
          {[...FIELD_PHOTOS, ...FIELD_PHOTOS].map((f, k) => (
            <Link key={k} to="/in-the-field" tabIndex={k >= FIELD_PHOTOS.length ? -1 : 0} aria-hidden={k >= FIELD_PHOTOS.length} className="group relative h-40 w-60 shrink-0 overflow-hidden rounded-2xl border border-white/15 sm:h-48 sm:w-72">
              <img src={f.src} alt={f.caption} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/90 to-transparent p-3 pt-8 text-xs font-medium">{f.caption}</span>
            </Link>
          ))}
        </div>
      </div>
      <p className="absolute top-3 right-4 text-[9px] text-paper/40">Video: Nova lv / Pexels</p>
    </section>
  );
}
