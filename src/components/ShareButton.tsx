import { Briefcase, Camera, Check, Copy, Mail, Send, Share2, Users } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { m } from "./motion";
import { useToast } from "./ui";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * Share a product (or any page). On phones it opens the native share sheet, which lists every
 * installed app (WhatsApp, Instagram, Gmail, Telegram…). Elsewhere it shows a menu of share links.
 * Instagram has no web share link, so on desktop we copy the link and open Instagram.
 */
export function ShareButton({ title, text, path, variant = "button", className = "" }: { title: string; text: string; path: string; variant?: "button" | "icon"; className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const url = typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path;
  const message = `${text}\n${url}`;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
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
    <div ref={ref} className={`relative ${className}`}>
      {variant === "icon" ? (
        <button type="button" onClick={onClick} className="rounded-full p-1.5 text-subtle transition hover:bg-paper-2 hover:text-ink" aria-label={`Share ${title}`} aria-haspopup="menu" aria-expanded={open} data-testid="share-button">
          <Share2 className="size-4" />
        </button>
      ) : (
        <button type="button" onClick={onClick} className="btn-ghost btn-sm" aria-haspopup="menu" aria-expanded={open} data-testid="share-button">
          <Share2 className="size-3.5" /> Share
        </button>
      )}
      <AnimatePresence>
        {open && (
          <m.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 z-50 mb-2 w-56 origin-bottom-left rounded-2xl border border-line bg-card p-1.5 shadow-[var(--shadow-lift)]"
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
      </AnimatePresence>
    </div>
  );
}
