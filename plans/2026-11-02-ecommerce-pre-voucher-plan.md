# Ecommerce Order Pre-Voucher (Print without amounts) Plan

- **Date:** 2026-11-02
- **Status:** Approved by user, ready to implement
- **App:** dashboard only (no backend change)
- **Language note:** The plan, the prompt and the report are in English. Code comments are in Myanmar. Printed text follows the existing voucher rule: Myanmar labels (printed documents stay Myanmar).

## 1. Goal

Add a **Pre-Voucher** print to ecommerce orders. It is a slip that shows **only**:
- Shop header: shop name (and phone/address if the voucher shows them), **without the shop logo** (user decision)
- Document title: **"ကြိုတင်ဘောက်ချာ (Pre-Voucher)"**
- Order number and order date
- **Customer data:** name, phone, delivery address (`shippingAddress` addressLine + city, otherwise the customer's profile address), and township
- **Items:** No., product name, quantity + unit

It **must not** show:
- Any money: unit price, line total, subtotal, discount, total, paid, remaining, previous credit, or outstanding
- Payment method
- **Notes** (order note, admin edit notes)
- Batches or expiry dates

## 2. Current state

- `components/Ecommerce/EcommerceOrderDetailModal.tsx` → `handlePrint` (~L73–L138):
  - builds `VoucherReceiptData` (the full invoice with amounts, credit outstanding, note and batches)
  - stores it in `localStorage["receipt_<orderNumber>"]`
  - navigates to `/print-receipt/<orderNumber>?size=<saved>&autoprint=1`
- `pages/PrintReceipt.tsx`:
  - loads `receipt_<id>` (`loadReceiptData`)
  - loads the shop branding
  - offers paper size (A4, A5, thermal-80mm, thermal-72mm) and thermal layout options
  - renders `<VoucherContent>` (~L300) and auto-prints, then goes back on `afterprint`
- `components/Print/VoucherContent.tsx` is 1,234 lines with separate thermal, A4 and A5 layouts. Money and notes are spread through every layout.

## 3. Decisions

| # | Decision |
|---|---|
| D-1 | **New component** `components/Print/PreVoucherContent.tsx`. Do **not** add pre-voucher branches inside `VoucherContent.tsx`; it is too large and the risk of breaking the real invoice is high. The invoice must not change at all. |
| D-2 | Reuse the **same print page and flow**: `PrintReceipt.tsx`, `localStorage`, auto-print, back after print, the paper size selector and shop branding. `PrintReceipt` renders `PreVoucherContent` when `receiptData.documentType === "pre-voucher"`, otherwise `VoucherContent` exactly as today. |
| D-3 | Extend `VoucherDocumentType` with `"pre-voucher"`. For a pre-voucher, the money fields in `VoucherReceiptData` are set to `0` and are **never read** by `PreVoucherContent`. Add `customerTownship?: string` to the type, or reuse the existing customer fields. |
| D-4 | Use a **separate storage and route key** so a pre-voucher never overwrites a pending invoice print of the same order: `receipt_<orderNumber>-PRE` and `/print-receipt/<orderNumber>-PRE?...`. The printed order number is still `<orderNumber>`, from `invoiceNumber`. |
| D-5 | Paper sizes: support **all 4** sizes. Thermal (80/72 mm) is one narrow column. A4 and A5 are a simple page with a header block, a customer block and an item table. Hide the thermal **layout** (table/list) selector for a pre-voucher; it has no price columns, so one layout is enough. |
| D-6 | **Long orders:** let the item table flow across pages (`page-break-inside: avoid` on rows, and a repeated table header on A4/A5 through `thead { display: table-header-group }`). The custom pagination in `VoucherContent` is not needed. |
| D-7 | **Button:** a new **"Pre-Voucher"** button in the `EcommerceOrderDetailModal` header, next to the existing Print button. It uses a different icon (`FileText` or `ClipboardList` from lucide) and the same button style, in an outline or secondary variant so the two are easy to tell apart. It is available for every status, including pending and cancelled. |
| D-8 | Items use the **current** line `quantity` and `unit`, the same values the invoice prints. Products are listed in order line order. |
| D-9 | Bottom of the slip: show the item count, as "ပစ္စည်း N မျိုး", and nothing else. No signature lines unless the existing voucher already has them; keep it minimal. |

## 4. Implementation

### 4.1 `components/Print/VoucherContent.tsx` (types only)
- `export type VoucherDocumentType = "invoice" | "quotation" | "pre-voucher";`
- Add `customerTownship?: string` to `VoucherReceiptData`, if it is needed.
- **No rendering changes in this file.**

### 4.2 New `components/Print/PreVoucherContent.tsx`
- Props: the same shape as `VoucherContent`: `receiptData`, `shopBranding`, `paperSize`, `formatDate`.
- Reuse the shop name styling from `VoucherContent`. Copy the small pieces you need, so the look matches. Do not import private internals by refactoring `VoucherContent`.
- **No logo:** do not render `shopBranding.logo` or the A5 voucher logo (`A5_VOUCHER_LOGO`) on any paper size.
- Sections:
  1. Header: shop name (text only, no logo) + title "ကြိုတင်ဘောက်ချာ (Pre-Voucher)"
  2. Meta: order number and date
  3. Customer: name, phone, address, township (skip empty fields)
  4. Items table: `စဉ်` | `ပစ္စည်းအမည်` | `အရေအတွက်` (qty + unit). Wrap long names.
  5. Footer: "ပစ္စည်း N မျိုး"
- Styling: follow the existing print CSS conventions, including the `@page` and print classes used by `VoucherContent` for each paper size. Thermal width must match the invoice's thermal width.
- **Defensive rule:** the component must not render `price`, `subtotal`, `total`, `paidAmount`, `paymentMethod`, `note`, `creditPerson*`, `batches` or `expiryDate`, even if the data has them.
- Comments in Myanmar.

### 4.3 `pages/PrintReceipt.tsx`
- `const isPreVoucher = receiptData?.documentType === "pre-voucher";`
- Render `<PreVoucherContent …/>` when `isPreVoucher`, otherwise the existing `<VoucherContent …/>`, unchanged.
- Hide the thermal layout selector when `isPreVoucher`. Keep the paper size selector.
- `loadReceiptData` already reads `receipt_<id>`, so the `-PRE` suffix works with no change. Confirm this, and confirm that `handleBack` removes the `-PRE` key.

### 4.4 `components/Ecommerce/EcommerceOrderDetailModal.tsx`
- New `handlePrintPreVoucher`:
  - customer = populated `order.customerId`
  - address = `shippingAddress` (addressLine, city), otherwise `customer.address`
  - township = `customer.township`
  - Build `VoucherReceiptData`:
    - `documentType: "pre-voucher"`
    - `invoiceNumber: order.orderNumber`, `date: order.createdAt`
    - `customerName`, `customerPhone`, `customerAddress`, `customerTownship`
    - `storefrontName`: the customer name, the same as the invoice
    - `items`: `{ name, code, qty: quantity, unit, price: 0 }` with **no batches**
    - `subtotal: 0`, `discountPercent: 0`, `total: 0`, `paymentMethod: ""`
    - **no `note`** and **no `creditPerson*`**
  - `localStorage.setItem("receipt_<orderNumber>-PRE", …)`
  - `navigate("/print-receipt/<encoded orderNumber>-PRE?size=<saved>&autoprint=1")`
- Add the header button (D-7) with `title` and label from `t("ecommerceOrders.preVoucher")`.
- Do not change `handlePrint` (the invoice).

### 4.5 Translations
- `ecommerceOrders.preVoucher` in **both** `en.ts` ("Pre-Voucher") and `my.ts` ("ကြိုတင်ဘောက်ချာ").
- Printed labels inside `PreVoucherContent` stay Myanmar and hardcoded, like the invoice (printed documents are exempt from i18n).

## 5. Out of scope
- Backend, POS and storefront order prints, the fulfillment print, and the ecommerce customer app.
- Changing the existing invoice or `VoucherContent` rendering.
- Pre-voucher from the ecommerce orders **list** page. It can be added later with the same handler.

## 6. Verification

Environment:
- `npm run build` + `vite preview`.
- A local backend with the test DB `127.0.0.1:27018`. Assert the DB name.
- Seed one ecommerce order with:
  - a customer that has name, phone, township and a shipping address
  - 3 lines, including a long Myanmar product name and different units
  - a note
  - `paidAmount` > 0, and a customer with previous credit
  - a price-edited line

Never touch production or `.env`.

| # | Test | Expected |
|---|---|---|
| P-1 | Open the order detail → **Pre-Voucher** button | Print page opens with the pre-voucher, auto-print dialog. Screenshot of the preview (cancel the dialog). |
| P-2 | Thermal 80mm preview | Shop name (**no logo** on any paper size; check P-3 too, and check that the DOM has no `<img>`), title, order no + date, customer name/phone/address/township, 3 items with qty + unit, "ပစ္စည်း 3 မျိုး". Screenshot. |
| P-3 | A5 and A4 previews | The same content, readable layout. Screenshots ×2. |
| P-4 | **No-money check:** in the rendered pre-voucher DOM, read `innerText` and search for each price/total of the seed order (unit prices, subtotals, total, paid, outstanding), for "MMK"/"Ks"/"ကျပ်", for the note text, the payment method, and batch/expiry labels | 0 matches for every one. Paste the script and its output. |
| P-5 | Invoice regression: the normal **Print** button on the same order | Invoice exactly as before (prices, total, note, credit). Screenshot. Compare against an invoice screenshot taken **before** the change (take it first). |
| P-6 | Storage keys: print the invoice, then the pre-voucher, then the invoice again | Each prints its own document. `localStorage` keys `receipt_<no>` and `receipt_<no>-PRE` are separate and both are removed after "back". Paste the `localStorage` keys at each step. |
| P-7 | Long order (seed 25 lines) on A5 | Rows flow onto the next page, the header row repeats, and no row is cut in half. Screenshot of page 2 in print preview, or a PDF printed through CDP `Page.printToPDF` with the page count pasted. |
| P-8 | Pre-voucher for a **pending** and a **cancelled** order | The button works for both |
| P-9 | Myanmar and English UI | The button label is translated. The printed labels are Myanmar in both modes. No raw keys. |
| P-10 | Console | No errors and no `Translation missing` |
| P-11 | `npm run build` | exit 0. Paste the tail. |
| P-12 | `md5sum` + `ls -la` of the screenshots | All different, with different timestamps |

Screenshots go to `dashboard/plans/screenshots/pre-voucher/`. Take each one at the moment its test runs.
