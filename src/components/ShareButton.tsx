import { Briefcase, Camera, Check, Copy, Mail, Send, Share2, Users } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { m } from "./motion";
import { useToast } from "./ui";
import { WhatsAppIcon } from "./WhatsAppIcon";

const MENU_W = 224;
const MENU_H = 340;

/**
 * Share a product (or any page). On phones it opens the native share sheet, which lists every
 * installed app (WhatsApp, Instagram, Gmail, Telegram…). Elsewhere it shows a menu of share links.
 * The menu is rendered in a portal with fixed positioning, so cards with overflow-hidden can't clip it,
 * and it is kept inside the viewport (opens above or below, aligned to the button).
 */
export function ShareButton({ title, text, path, variant = "button", className = "" }: { title: string; text: string; path: string; variant?: "button" | "icon"; className?: string }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const [copied, setCopied] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const url = typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path;
  const message = `${text}\n${url}`;

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = Math.max(8, Math.min(r.right - MENU_W, vw - MENU_W - 8));
    const up = vh - r.bottom < MENU_H + 12 && r.top > vh - r.bottom;
    setStyle(up ? { left, bottom: vh - r.top + 8 } : { left, top: r.bottom + 8 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e.type === "mousedown" && (menu.current?.contains(e.target as Node) || btn.current?.contains(e.target as Node))) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      return true;
    } catch {
      toast("Could not copy — please copy the address bar link.", "error");
      return false;
    }
  };

  const onClick = async () => {
    // Native sheet on touch devices (mobile is where most sharing happens).
    if (typeof navigator.share === "function" && matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return; // user closed the sheet
      }
    }
    setOpen((o) => !o);
  };

  const e = encodeURIComponent;
  const links = [
    { label: "WhatsApp", icon: WhatsAppIcon, href: `https://wa.me/?text=${e(message)}` },
    { label: "Email", icon: Mail, href: `mailto:?subject=${e(title)}&body=${e(message)}` },
    { label: "Facebook", icon: Users, href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
    { label: "LinkedIn", icon: Briefcase, href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}` },
    { label: "Telegram", icon: Send, href: `https://t.me/share/url?url=${e(url)}&text=${e(text)}` },
  ];
  const item = "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-paper-2";

  return (
    <div className={className}>
      <button
        ref={btn}
        type="button"
        onClick={onClick}
        className={variant === "icon" ? "rounded-full p-1.5 text-subtle transition hover:bg-paper-2 hover:text-ink" : "btn-ghost btn-sm"}
        aria-label={variant === "icon" ? `Share ${title}` : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="share-button"
      >
        <Share2 className={variant === "icon" ? "size-4" : "size-3.5"} />
        {variant === "button" && " Share"}
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <m.div
                ref={menu}
                role="menu"
                aria-label={`Share ${title}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.14 }}
                style={{ ...style, width: MENU_W }}
                className="fixed z-[80] rounded-2xl border border-line bg-card p-1.5 text-ink shadow-[var(--shadow-lift)]"
                data-testid="share-menu"
              >
                {links.map((l) => (
                  <a key={l.label} role="menuitem" href={l.href} target="_blank" rel="noopener" className={item} onClick={() => setOpen(false)}>
                    <l.icon className="size-4 text-verdi-600" /> {l.label}
                  </a>
                ))}
                <button
                  type="button"
                  role="menuitem"
                  className={item}
                  onClick={async () => {
                    if (await copy()) {
                      toast("Link copied — paste it in your Instagram message or story.", "success");
                      window.open("https://www.instagram.com/direct/inbox/", "_blank", "noopener");
                    }
                    setOpen(false);
                  }}
                >
                  <Camera className="size-4 text-verdi-600" /> Instagram
                </button>
                <button type="button" role="menuitem" className={item} onClick={copy} data-testid="share-copy">
                  {copied ? <Check className="size-4 text-verdi-600" /> : <Copy className="size-4 text-verdi-600" />} {copied ? "Link copied" : "Copy link"}
                </button>
              </m.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
