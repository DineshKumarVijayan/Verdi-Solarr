# Admin guide: updating prices

This guide is for VERDI staff. You don’t need any technical knowledge.

## Signing in
1. Open the website and click the **person icon** in the top bar, then **Staff / admin sign-in** (also available as **Staff sign-in** at the very bottom of any page, or go straight to `/admin`). On phones it is in the ☰ menu.
2. Cloudflare shows a sign-in screen. Enter your work email address and type in the one-time code you receive by email.
3. You land on the **Dashboard**. If you see “Access denied”, ask the owner to add your email address to the admin list.

## The dashboard
- **Active products / Manufacturers**: what is currently on the website.
- **Missing prices**: products customers see as “Price on request”. Click the tile to jump straight to them.
- **Missing images / datasheets**: products still showing an illustration instead of a photo.
- **Recently updated prices** and **Recent activity**: who changed what, and when.

## Changing a price
1. Click **Prices** in the dark admin bar.
2. Find the product: type part of its name, SKU or model (e.g. `620`, `STELLAR-5`). You can also pick a manufacturer or category, or tick **Missing price only**.
3. Click **Edit** on the product.
4. Fill in:
   - **Selling price (₹)**: e.g. `16500` or `16,500.50`. Leave it **empty** to show “Price on request”.
   - **MRP (₹)**: optional. It must not be lower than the selling price.
   - **GST rate**: 0, 5, 12, 18 or 28%, or “Not specified” (customers then see “+ GST as applicable”).
   - **Selling price includes GST**: tick this only if the price already includes GST.
   - **Price unit**: per piece, per metre, per coil, and so on. For cable, choose carefully.
   - **Reason** (optional): e.g. “Manufacturer revision Nov 2026”.
5. Check the **Customers will see** line, then click **Save price**.
6. A green message confirms the save **after** the database has stored it. The website shows the new price within **about one minute**.

### “Someone else changed this price”
If two people edit the same product at once, the second save is stopped so nobody overwrites the other by accident. Click **Load latest and re-apply**, check the current price, then save again if needed.

### Price history
The right-hand side of the edit window lists every change: old and new price, who changed it, when, and the reason.

## What customers see
- The product card and page show your selling price, the unit and the GST note.
- When a customer sends an enquiry, the site re-checks your latest price first. If it changed since they added the item, they see the old and new prices before sending.
- The WhatsApp message always says final prices, taxes, availability and delivery are confirmed by VERDI.

## Adding product photos (for now)
Until photo uploads are added to the admin screen (Phase 2), send the photos to the developer. Each photo needs a clear product shot on a plain background, at least 1200 px, named by model (e.g. `stellar-5ktl3x.jpg`). Only use real photos of the actual product.

## Adding or removing admins
The owner (or developer) adds people in the database. See “Admin management” in DATABASE.md. Removing someone takes effect immediately.

## Signing out
Click **Sign out** in the admin bar. On shared computers, always sign out.
