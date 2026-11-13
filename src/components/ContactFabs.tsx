import { Phone } from "lucide-react";
import { SITE } from "../site";
import { m } from "./motion";
import { WhatsAppIcon, WHATSAPP_GREEN } from "./WhatsAppIcon";

/** Floating WhatsApp + Call buttons (bottom-right), with an attention pulse on WhatsApp. */
export function ContactFabs() {
  const base = "group relative grid size-13 place-items-center rounded-full text-white shadow-[var(--shadow-lift)] focus-visible:outline-offset-4";
  const label =
    "pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 sm:block";
  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6" data-testid="contact-fabs">
      <m.a
        href={SITE.phoneHref}
        className={`${base} bg-sky-500`}
        aria-label={`Call VERDI SOLARR on ${SITE.phoneDisplay}`}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        data-testid="fab-call"
      >
        <span className={label}>Call {SITE.phoneDisplay}</span>
        <Phone className="size-6" />
      </m.a>
      <m.a
        href={SITE.whatsappUrl}
        target="_blank"
        rel="noopener"
        className={base}
        style={{ backgroundColor: WHATSAPP_GREEN }}
        aria-label="Chat with VERDI SOLARR on WhatsApp"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        data-testid="fab-whatsapp"
      >
        <span className="absolute inset-0 animate-ping rounded-full opacity-30 motion-reduce:hidden" style={{ backgroundColor: WHATSAPP_GREEN, animationDuration: "2.6s" }} aria-hidden="true" />
        <span className={label}>WhatsApp us</span>
        <WhatsAppIcon className="relative size-7" />
      </m.a>
    </div>
  );
}
