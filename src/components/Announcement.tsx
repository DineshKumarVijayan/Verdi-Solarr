import { ArrowRight, Sparkles, Sun, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useSite } from "../lib/site";

const DISMISS_KEY = "verdi.announcement.closed";

/**
 * Admin-managed announcement (Admin → Settings → Announcement bar). Shown only when the admin has
 * entered text; several messages can be separated with "|". Runs as a scrolling ribbon (static when
 * the visitor prefers reduced motion). Visitors can close it for the rest of their visit.
 */
export function Announcement() {
  const SITE = useSite();
  const text = SITE.announcement.trim();
  const [closed, setClosed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === text;
    } catch {
      return false;
    }
  });
  if (!text || closed) return null;

  const messages = text
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const link = SITE.announcementLink;
  // enough copies to fill wide screens; the track is duplicated once more for a seamless loop
  const reps = Math.max(2, Math.ceil(8 / messages.length));
  const seconds = Math.max(18, Math.round(messages.join(" ").length * reps * 0.22));

  const run = (key: string, hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined} key={key}>
      {Array.from({ length: reps }, (_, r) =>
        messages.map((msg, i) => (
          <span key={`${r}-${i}`} className="flex items-center gap-3 px-5 whitespace-nowrap">
            <Sun className="size-3.5 shrink-0 text-sun-400 motion-safe:animate-[spin_9s_linear_infinite]" />
            <span>{msg}</span>
            {link && (
              <span className="inline-flex items-center gap-1 font-semibold text-sun-300">
                View <ArrowRight className="size-3.5" />
              </span>
            )}
          </span>
        )),
      )}
    </div>
  );

  const track = (
    <div className="flex w-max motion-safe:animate-[marquee_var(--d)_linear_infinite] group-hover:[animation-play-state:paused]" style={{ ["--d" as string]: `${seconds}s` }}>
      {run("a", false)}
      {run("b", true)}
    </div>
  );

  const wrap = (children: ReactNode) =>
    !link ? (
      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
    ) : link.startsWith("/") ? (
      <Link to={link} className="min-w-0 flex-1 overflow-hidden">
        {children}
      </Link>
    ) : (
      <a href={link} target="_blank" rel="noopener" className="min-w-0 flex-1 overflow-hidden">
        {children}
      </a>
    );

  return (
    <div
      className="group relative isolate flex h-9 items-center overflow-hidden bg-[linear-gradient(90deg,#0a1822_0%,#0f3d2a_35%,#14532d_50%,#0f3d2a_65%,#0a1822_100%)] text-[13px] font-medium text-paper"
      data-testid="announcement"
      role="region"
      aria-label="Announcement"
    >
      {/* moving sheen + sun-gold underline */}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(110deg,transparent_35%,rgba(250,204,21,0.16)_50%,transparent_65%)] bg-[length:250%_100%] motion-safe:animate-[sweep_6s_ease-in-out_infinite]" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sun-400 to-transparent" />

      <span className="relative z-10 ml-3 flex shrink-0 items-center gap-1.5 rounded-full bg-sun-400 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-ink uppercase shadow-[0_0_18px_rgba(250,204,21,0.45)]">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full rounded-full bg-ink/60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-1.5 rounded-full bg-ink" />
        </span>
        <Sparkles className="size-3" /> New
      </span>
      {/* soft fade at the edges */}
      <div className="relative min-w-0 flex-1 [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">{wrap(track)}</div>
      <p className="sr-only">{messages.join(". ")}</p>
      <button
        type="button"
        aria-label="Close announcement"
        className="relative z-10 mr-2 grid size-7 shrink-0 place-items-center rounded-full text-paper/70 transition hover:bg-white/10 hover:text-paper"
        onClick={() => {
          try {
            sessionStorage.setItem(DISMISS_KEY, text);
          } catch {
            /* private mode: close for this page view only */
          }
          setClosed(true);
        }}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
