// Decorative CSS animations only run while they can be seen.
// Mark a section with data-pause-offscreen: off-screen it gets class "anim-paused" (see styles.css).
// (Pausing during active scrolling was measured too: it cost more than it saved, so it is not used.)

export function startOffscreenPausing(): void {
  if (typeof IntersectionObserver === "undefined") return;
  const visible = new Set<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        e.target.classList.toggle("anim-paused", !e.isIntersecting);
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
    },
    { rootMargin: "100px 0px" },
  );
  const seen = new WeakSet<Element>();
  const scan = () => {
    for (const el of document.querySelectorAll("[data-pause-offscreen]")) {
      if (!seen.has(el)) {
        seen.add(el);
        io.observe(el);
      }
    }
    for (const el of visible) if (!el.isConnected) visible.delete(el);
  };
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });

}
