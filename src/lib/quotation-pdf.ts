// Builds the quotation PDF in the browser (jsPDF + autoTable). Loaded on demand from the admin only.
// Standard PDF fonts cannot draw "₹", so amounts are written as "Rs. 1,23,456.00".

import { jsPDF } from "jspdf";
import autoTableImport from "jspdf-autotable";
import { DEFAULT_TERMS, mediaPath, validUntil, type Quote, type QuoteSettings } from "../../shared/quotation";
import type { SiteInfo } from "./site";

// The dev server pre-bundles the UMD build, where the function sits on `.default`.
const autoTable: typeof autoTableImport =
  typeof autoTableImport === "function" ? autoTableImport : (autoTableImport as unknown as { default: typeof autoTableImport }).default;

const INK: [number, number, number] = [10, 24, 34];
const GREEN: [number, number, number] = [21, 128, 61];
const SUN: [number, number, number] = [250, 204, 21];
const MUTED: [number, number, number] = [96, 110, 120];
const LINE: [number, number, number] = [222, 228, 232];

const num = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rs = (paise: number) => `Rs. ${num.format(paise / 100)}`;
const dateText = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/** Keep text inside the WinAnsi range the built-in fonts can draw. */
const clean = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/₹/g, "Rs.")
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, "");

// ------------------------------------------------------------------ amount in words (Indian system)
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const two = (n: number) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : ""));
const three = (n: number) => {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]} Hundred` : "", r ? two(r) : ""].filter(Boolean).join(" ");
};
function words(n: number): string {
  if (n === 0) return "Zero";
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1000);
  const rest = n % 1000;
  return [crore ? `${words(crore)} Crore` : "", lakh ? `${two(lakh)} Lakh` : "", thousand ? `${two(thousand)} Thousand` : "", rest ? three(rest) : ""].filter(Boolean).join(" ");
}
export function amountInWords(paise: number): string {
  const r = Math.floor(paise / 100);
  const p = paise % 100;
  return `Rupees ${words(r)}${p ? ` and ${two(p)} Paise` : ""} Only`;
}

// ------------------------------------------------------------------ images

interface Img {
  data: string;
  w: number;
  h: number;
}

/** Fetch an image (any browser-supported format) and flatten it to JPEG/PNG on a canvas. */
async function loadImage(url: string, max: number, format: "JPEG" | "PNG"): Promise<Img | null> {
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) return null;
    const bmp = await createImageBitmap(await res.blob());
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    if (format === "JPEG") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    return { data: c.toDataURL(format === "JPEG" ? "image/jpeg" : "image/png", 0.85), w, h };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ document

export { DEFAULT_TERMS };

export async function buildQuotationPdf(q: Quote, site: SiteInfo, settings: QuoteSettings): Promise<{ blob: Blob; filename: string }> {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;

  const [logo, qr, ...thumbs] = await Promise.all([
    loadImage("/brand/verdi-logo.png", 400, "PNG"),
    settings.quoteUpiQr ? loadImage(mediaPath(settings.quoteUpiQr), 900, "PNG") : Promise.resolve(null), // PNG keeps the QR sharp
    ...q.items.map((i) => (i.imageUrl ? loadImage(i.imageUrl, 220, "JPEG") : Promise.resolve(null))),
  ]);

  // ---- header (first page)
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 30, "F");
  doc.setFillColor(...SUN);
  doc.rect(0, 30, W, 1.2, "F");
  let x = M;
  if (logo) {
    const h = 16;
    const w = Math.min(40, (logo.w / logo.h) * h);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(M - 1.5, 7 - 1.5, w + 3, h + 3, 2, 2, "F");
    doc.addImage(logo.data, "PNG", M, 7, w, h);
    x = M + w + 6;
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(clean(site.name), x, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 210, 216);
  doc.text(settings.quoteGstin ? `GSTIN: ${clean(settings.quoteGstin)}` : "Solar panels, inverters, cables & components", x, 20);
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const web = /^(localhost|127\.|\[)/.test(location.hostname) ? [] : [clean(location.host)];
  doc.text([`Phone: ${clean(site.phoneDisplay)}`, `Email: ${clean(site.email)}`, ...web], W - M, 11, { align: "right", lineHeightFactor: 1.5 });

  // ---- title + meta
  let y = 44;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("QUOTATION", M, y);
  const created = new Date(q.createdAt);
  const meta: [string, string][] = [
    ["Quotation no.", q.number],
    ["Date", dateText(created)],
    ["Valid until", dateText(validUntil(q.createdAt, q.validDays))],
  ];
  doc.setFontSize(9);
  meta.forEach(([k, v], i) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(k, W - M - 56, y - 8 + i * 5.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(v, W - M, y - 8 + i * 5.5, { align: "right" });
  });

  // ---- prepared for / prepared by
  y += 8;
  const boxW = (W - 2 * M - 6) / 2;
  const forLines = [q.customerCompany, q.customerMobile ? `Mobile: +${q.customerMobile.replace(/^(\d{2})(\d{5})(\d{5})$/, "$1 $2 $3")}` : null, q.customerEmail ? `Email: ${q.customerEmail}` : null, q.customerAddress]
    .filter(Boolean)
    .map((s) => clean(s));
  const forWrapped = doc.splitTextToSize(forLines.join("\n"), boxW - 8) as string[];
  const byLines = [`Phone: ${clean(site.phoneDisplay)}`, `Email: ${clean(site.email)}`];
  const boxH = Math.max(24, 15 + Math.max(forWrapped.length, byLines.length) * 4.3);
  for (const [i, title] of ["PREPARED FOR", "FROM"].entries()) {
    const bx = M + i * (boxW + 6);
    doc.setFillColor(246, 248, 249);
    doc.setDrawColor(...LINE);
    doc.roundedRect(bx, y, boxW, boxH, 2.5, 2.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GREEN);
    doc.text(title, bx + 4, y + 6);
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(clean(i === 0 ? q.customerName : site.name), bx + 4, y + 11.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(i === 0 ? forWrapped : byLines, bx + 4, y + 16.5, { lineHeightFactor: 1.45 });
  }
  y += boxH + 7;

  // ---- items
  const hasImages = thumbs.some(Boolean);
  const body = q.items.map((it, i) => {
    const sub = [[it.brand, it.model ? `Model ${it.model}` : null].filter(Boolean).join(" | "), [it.unit, it.gstNote].filter(Boolean).join(" | ")].filter(Boolean).join("\n");
    const disc =
      it.discountPaise > 0 ? (it.discountType === "pct" ? `${(it.discountValue / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}%\n- ${rs(it.discountPaise)}` : `- ${rs(it.discountPaise)}`) : "-";
    return [String(i + 1), ...(hasImages ? [""] : []), { content: clean(it.name), sub: clean(sub) }, String(it.qty), rs(it.unitPaise), disc, rs(it.lineTotalPaise)];
  });
  const imgCol = hasImages ? 1 : -1;
  const itemCol = hasImages ? 2 : 1;
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, top: 18, bottom: 22 },
    head: [["#", ...(hasImages ? [""] : []), "Item", "Qty", "Unit price", "Discount", "Amount"]],
    body: body.map((r) => r.map((c) => (typeof c === "object" ? `${c.content}\n${c.sub}` : c))),
    theme: "plain",
    styles: { font: "helvetica", fontSize: 8.5, textColor: INK, cellPadding: { top: 3, bottom: 3, left: 2, right: 2 }, valign: "middle", lineColor: LINE },
    headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", textColor: MUTED },
      ...(hasImages ? { 1: { cellWidth: 18, minCellHeight: 18 } } : {}),
      [itemCol]: { cellWidth: "auto" },
      [itemCol + 1]: { cellWidth: 13, halign: "center" },
      [itemCol + 2]: { cellWidth: 27, halign: "right" },
      [itemCol + 3]: { cellWidth: 25, halign: "right", textColor: GREEN },
      [itemCol + 4]: { cellWidth: 29, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (d) => {
      if (d.section === "head" && d.column.index >= itemCol + 1) d.cell.styles.halign = d.column.index === itemCol + 1 ? "center" : "right";
    },
    willDrawCell: (d) => {
      // Row height is already sized from the text; the item cell is drawn manually below (bold name, muted details).
      if (d.section === "body" && d.column.index === itemCol) d.cell.text = [];
    },
    didDrawCell: (d) => {
      if (d.section !== "body") return;
      if (d.column.index === imgCol) {
        const t = thumbs[d.row.index];
        if (t) {
          const s = 15;
          const r = Math.min(s / t.w, s / t.h);
          const w = t.w * r;
          const h = t.h * r;
          doc.addImage(t.data, "JPEG", d.cell.x + (d.cell.width - w) / 2, d.cell.y + (d.cell.height - h) / 2, w, h);
        }
      }
      if (d.column.index === itemCol) {
        // bold name, muted details
        const cell = body[d.row.index][itemCol] as { content: string; sub: string };
        const pad = 2;
        const width = d.cell.width - 2 * pad;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        const nameLines = doc.splitTextToSize(cell.content, width) as string[];
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        const subLines = cell.sub ? (doc.splitTextToSize(cell.sub, width) as string[]) : [];
        const total = nameLines.length * 4 + subLines.length * 3.4;
        let ty = d.cell.y + (d.cell.height - total) / 2 + 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(nameLines, d.cell.x + pad, ty, { lineHeightFactor: 1.25 });
        ty += nameLines.length * 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        if (subLines.length) doc.text(subLines, d.cell.x + pad, ty, { lineHeightFactor: 1.3 });
      }
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  const ensure = (need: number) => {
    if (y + need > H - 24) {
      doc.addPage();
      y = 20;
    }
  };

  // ---- totals
  ensure(40);
  const tx = W - M - 78;
  const rows: [string, string][] = [["Subtotal", rs(q.subtotalPaise)]];
  if (q.discountPaise > 0) rows.push(["Discount", `- ${rs(q.discountPaise)}`]);
  doc.setFontSize(9.5);
  for (const [k, v] of rows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(k, tx + 4, y + 4);
    doc.setTextColor(...(k === "Discount" ? GREEN : INK));
    doc.text(v, W - M - 4, y + 4, { align: "right" });
    y += 6.5;
  }
  doc.setFillColor(...GREEN);
  doc.roundedRect(tx, y, 78, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Total", tx + 4, y + 7.3);
  doc.text(rs(q.totalPaise), W - M - 4, y + 7.3, { align: "right" });
  y += 16;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const inWords = doc.splitTextToSize(amountInWords(q.totalPaise), W - 2 * M) as string[];
  doc.text(inWords, W - M, y, { align: "right" });
  y += inWords.length * 4 + 6;

  // ---- payment: UPI / GPay QR + UPI ID + bank details
  if (qr || settings.quoteUpiId || settings.quoteBank) {
    const qrH = qr ? 44 : 0;
    const qrW = qr ? Math.min(44, (qr.w / qr.h) * qrH) : 0;
    const tx0 = M + (qr ? qrW + 8 : 5);
    const tw = W - M - tx0 - 5;
    doc.setFontSize(8.5);
    const bankLines = settings.quoteBank ? (doc.splitTextToSize(clean(settings.quoteBank), tw) as string[]) : [];
    const textH = 8 + (qr ? 9 : 0) + (settings.quoteUpiId ? 7 : 0) + (bankLines.length ? 6 + bankLines.length * 4.2 : 0);
    const boxH = Math.max(qrH, textH) + 8;
    ensure(boxH + 4);
    doc.setFillColor(246, 248, 249);
    doc.setDrawColor(...LINE);
    doc.roundedRect(M, y, W - 2 * M, boxH, 3, 3, "FD");
    if (qr) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(M + 3, y + 3, qrW + 2, qrH + 2, 2, 2, "F");
      doc.addImage(qr.data, "PNG", M + 4, y + 4, qrW, qrH);
    }
    let ty = y + 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text("PAYMENT", tx0, ty);
    ty += 5.5;
    if (qr) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text("Scan to pay with GPay, PhonePe, Paytm or any UPI app", tx0, ty, { maxWidth: tw });
      ty += 9;
    }
    if (settings.quoteUpiId) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("UPI ID:", tx0, ty);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text(clean(settings.quoteUpiId), tx0 + 13, ty);
      ty += 7;
    }
    if (bankLines.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text("BANK TRANSFER", tx0, ty);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text(bankLines, tx0, ty + 5, { lineHeightFactor: 1.45 });
    }
    y += boxH + 8;
  }

  // ---- notes, terms, bank
  const block = (title: string, text: string) => {
    const lines = doc.splitTextToSize(clean(text), W - 2 * M) as string[];
    ensure(10 + lines.length * 4.2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text(title.toUpperCase(), M, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(lines, M, y + 5, { lineHeightFactor: 1.45 });
    y += 9 + lines.length * 4.2;
  };
  if (q.notes) block("Notes", q.notes);
  const terms = (settings.quoteTerms || DEFAULT_TERMS)
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  // ---- terms (left) and signature (right), side by side so a quotation usually fits one page
  const termText = [...terms, `This quotation is valid until ${dateText(validUntil(q.createdAt, q.validDays))}.`].map((t, i) => `${i + 1}. ${clean(t)}`).join("\n");
  const sigW = 62;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const termLines = doc.splitTextToSize(termText, W - 2 * M - sigW - 10) as string[];
  const bandH = Math.max(9 + termLines.length * 4.2, 28);
  ensure(bandH + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GREEN);
  doc.text("TERMS & CONDITIONS", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text(termLines, M, y + 5, { lineHeightFactor: 1.45 });
  // signature
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(`For ${clean(site.name)}`, W - M, y + 1, { align: "right" });
  doc.setDrawColor(...LINE);
  doc.line(W - M - sigW, y + 17, W - M, y + 17);
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(clean(settings.quoteSignatory || "Authorised signatory"), W - M, y + 22, { align: "right" });
  y += bandH + 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  ensure(8);
  doc.text("Thank you for your enquiry!", M, y);

  // ---- footer + page numbers on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    if (p > 1) {
      doc.setFillColor(...INK);
      doc.rect(0, 0, W, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`${clean(site.name)}  |  Quotation ${q.number}`, M, 6.5);
    }
    doc.setDrawColor(...LINE);
    doc.line(M, H - 16, W - M, H - 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text(clean(site.name), M, H - 11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(clean(site.addressOneLine), M, H - 7);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 11, { align: "right" });
    doc.text("Computer-generated quotation", W - M, H - 7, { align: "right" });
  }

  doc.setProperties({ title: `Quotation ${q.number}`, subject: `Quotation for ${clean(q.customerName)}`, author: clean(site.name), creator: clean(site.name) });
  return { blob: doc.output("blob"), filename: `Quotation-${q.number}.pdf` };
}
