# Admin guide

This guide is for VERDI staff. You don’t need any technical knowledge. Everything on the website that changes from time to time (products, brands, prices, datasheets, photos, contact details, enquiries, customers and reward points) is managed from the admin area. **No code changes are needed.**

## Signing in
1. Go to `/admin` (or the person icon → **Staff / admin sign-in**; on phones it is in the ☰ menu).
2. Enter your **mobile number** and **password**, then click **Sign in**. You stay signed in for 12 hours.
3. Forgot your password? The owner sets a new one in **Admin users**. Five wrong attempts lock the account for 15 minutes.

Passwords are stored only as salted one-way hashes, so nobody can read them, including the owner and the developer. The **Admin users** list also decides what each person may do.

| Role | Can do |
|---|---|
| Owner | Everything, including managing admin users |
| Admin | Products, brands, categories, prices, photos, settings, enquiries and customers |
| Price editor | Change prices only; view everything else |
| Viewer | Look only |

## Dashboard
Shows new enquiries, customer accounts, products, missing prices, images and datasheets, and recent activity. Each tile is a shortcut.

## Products
**Products → Add product**
1. Enter the **product name**. The web address fills in automatically.
2. Choose the **brand** and **category**. If either is new, add it first under **Brands & categories**.
3. Enter your **SKU** (your own code, e.g. `VS-WAA-540`) and the manufacturer **model number**.
4. **Product family / series** and **Variant label** group models that share one datasheet (e.g. family “TOPCon 600–630 Wp”, variant “610 Wp”).
5. Add a **short description**, **full description** and **highlights**. Only state facts from the manufacturer datasheet.
6. **Specifications:** use **Copy fields from a similar product** to get the same rows (blank values), then type each value exactly as in the datasheet. Keeping the same field keys (e.g. `power_wp`, `voc_v`) keeps search, compare and the calculators working.
7. Set the **price** (optional; leave blank for “Price on request”).
8. Click **Create product**. It is live on every page straight away.
9. Then add **images** (drag & drop; large photos are shrunk automatically, and the ★ image is shown first) and the **datasheet PDF**. Customers can open the datasheet in the website’s PDF viewer.

**Tips**
- **Duplicate** (copy icon in the list) is the fastest way to add another wattage of the same family. The copy starts hidden; edit it, then switch **Visible on website** on.
- To take a product off the site temporarily, switch **Visible on website** off. **Delete permanently** removes it and its price history (a copy stays in the audit log).
- If two people edit the same product at once, the second save is stopped. Reload and re-apply your change.

## Brands & categories
- **Add brand:** name, slug (short web name, e.g. `waaree`), description, manufacturer website and logo.
- **Add category:** name, slug (page address `/category/<slug>`), description and sort order (lower numbers appear first).
- Hiding a brand or category hides all of its products. You can only delete one that has no products.

## Prices
1. Go to **Prices**, find the product, and click **Edit**.
2. Enter the **selling price** (e.g. `16500` or `16,500.50`; empty = “Price on request”), plus optional **MRP**, **GST rate**, **GST included**, **unit** and a **reason**.
3. Click **Save price**. The website updates on the next page load, and every change is kept in **price history**.

When a customer sends an enquiry, the site re-checks your latest price first. If it changed since they added the item, they see the old and new prices before sending.

## Field photos
Photos for the **In the field** page and the home-page filmstrip.
- Pick a **tag** (Rooftop, Inverters, Mounting…), then **Upload photos** (several at once is fine).
- Edit each **caption** and click **Save**. Use **Portrait** for tall photos, **Visible** to hide or show, and the arrows to reorder.
- Use only your own photos or properly licensed stock, and keep captions factual.

## Settings
Contact person, phone, WhatsApp number (where enquiries are sent), email, address, business hours, Instagram, Facebook, YouTube and LinkedIn links, and an **announcement bar** at the top of every page. Empty fields fall back to the built-in defaults.

## Enquiries
Every enquiry sent from the basket is saved with a reference number (e.g. `VS-261113-K7QPM`), which also appears in the customer’s WhatsApp message.
- Filter by status, or search by reference, name or mobile.
- Open an enquiry to see the items, call or WhatsApp the customer, set the **status** (Received → Contacted → Quoted → Order confirmed / Closed / Cancelled) and keep **internal notes**. Customers never see the notes.
- For registered customers you can credit **reward points** right there.

## Quotations
Any admin (every role) can prepare quotations under **Quotations**. On an enquiry you can also click **Create quotation**, which fills in the customer details and products.
1. **New quotation**: enter the customer name. Mobile number, email, company and address are optional.
2. **Add products**: search the catalogue. Unit prices come from the catalogue and cannot be changed here; change them under Prices. Only products without a listed price, and **Custom lines**, take a typed price.
3. **Add a discount** to any line if needed: **%** or **₹ off**. Totals update as you type.
4. **Preview PDF** saves the quotation and shows the PDF. From the preview you can:
   - **Download PDF**, to send it yourself (email, your own WhatsApp, print);
   - **Share PDF** (phones), which attaches the file to WhatsApp, Gmail or any app;
   - **WhatsApp to customer**, which opens a chat with the customer and a ready message containing a private link to the PDF. The quotation is then marked as **Sent**.
5. Set the status (Draft, Sent, Accepted, Declined) from the dropdown at the top right of the quotation.

Prices are copied onto the quotation when it is saved. Later catalogue price changes do not alter an existing quotation.

**PDF details** (owner and admin roles): GSTIN, default validity, signatory name, terms and bank or UPI details. These are printed on every PDF but are not shown on the public website.

## Customers & reward points
Customers create their own accounts (mobile number + password) under the person icon → **Create an account**. They see their enquiry history, status and points under **My account**. Customer accounts are completely separate from admin access.
- **Reward points:** open a customer → enter `+500` (credit) or `-200` (redeem) with a reason. The customer sees the reason in their history. The balance can’t go below zero.
- **Forgotten password:** open the customer → **Create reset link** → **Send on WhatsApp**. The link works once, within 48 hours.
- **Disable account:** switch **Account enabled** off. They are signed out everywhere immediately.

## Admin users (owner only)
Add a person’s mobile number, password, email and role, and share the password with them privately. To reset someone’s password, edit them and type a new one. Switching a user to inactive, or changing their password, signs them out everywhere immediately. You can’t remove your own owner access, and there is always at least one owner.

## Signing out
Click **Sign out** in the admin bar. On shared computers, always sign out.
