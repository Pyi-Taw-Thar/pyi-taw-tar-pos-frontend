# Dashboard — Remove Hardcoded Myanmar Text (i18n) Plan

- **Date:** 2026-10-31
- **Status:** Approved by user, ready to implement
- **App:** dashboard only
- **Language note:** Plan is in English at user request. **Code comments must stay in Myanmar** (CLAUDE.md). Myanmar text moves into `translations/my.ts`; English goes into `translations/en.ts`.

## 1. Problem

When the user selects **English**, some pages still show Myanmar. The worst case is the Customer Detail page (`/customers/:id`), where almost everything is Myanmar: card titles, tabs, filters, table headers, status chips, buttons and modals.

How i18n works now (`context/LanguageContext.tsx`):
- `t(key, params?)` looks up `translations[language]`. If the key is missing, it falls back to `en`, and then to **the key string itself**. It never returns `""`.
- **Consequence:** the common pattern `t("x.y") || "မြန်မာ fallback"` **never** uses the fallback. A missing key shows the raw key, for example `ecommerceOrders.editPrices`. Every key used must exist in **both** `en.ts` and `my.ts`.
- `params` replace `{name}` placeholders. Check the implementation and use the same placeholder syntax as existing keys.

## 2. Scan result (non-comment lines containing Myanmar characters)

The command used is below. Comments are excluded because comments are Myanmar by rule.
```bash
export LC_ALL=C.UTF-8
grep -rlP "[\x{1000}-\x{109F}]" pages components hooks utils context --include=*.tsx --include=*.ts
# then per file: grep -P "[\x{1000}-\x{109F}]" | drop lines that are comments
```

| Lines | File | Notes |
|---|---|---|
| 125 | `pages/CustomerDetail.tsx` | **Priority 1** — the whole page is hardcoded (only 1 `t()` call) |
| 94 | `components/Print/VoucherContent.tsx` | **Keep Myanmar** — printed customer receipt (see §3 D-1) |
| 66 | `pages/EcommerceReports.tsx` | uses `t` partly |
| 52 | `pages/EcommerceProductOrdersReport.tsx` | uses `t` partly |
| 28 | `pages/SupplierDetail.tsx` | |
| 21 | `pages/Menu.tsx` | Myanmar digits and weekdays for the date. Make it language-aware (D-2) |
| 19 | `components/Ecommerce/EcommerceOrderDetailModal.tsx` | |
| 18 | `pages/Suppliers.tsx` | filters, placeholders |
| 18 | `components/Orders/OrderFulfillmentModal.tsx` | toasts, scan errors |
| 17 | `components/Ecommerce/EditEcommerceOrderPricesModal.tsx` | new price-edit modal |
| 13 | `pages/EcommerceOrders.tsx` | toasts |
| 6 | `hooks/usePOS.ts` | scan and checkout toasts |
| 4 | `utils/printPaperSize.ts` | paper size labels and descriptions |
| 4 | `pages/DirectSale.tsx` | |
| 4 | `components/Purchasing/RecordPaymentModal.tsx` | |
| 3 | `components/POS/ProductGrid.tsx`, `components/POS/CartSidebar.tsx` | |
| 2 | `pages/POS.tsx`, `pages/OrderFulfillment.tsx`, `components/Settings/PrintPaperSizeSettingsCard.tsx`, `components/Purchasing/CreateGRNModal.tsx`, `components/Menu/WorkQueue.tsx`, `components/Ecommerce/AddItemsToEcommerceOrderModal.tsx` | |
| 1 | `pages/Customers.tsx`, `components/Settings/ActivityLogTab.tsx`, `components/Purchasing/GRNDetailModal.tsx`, `components/Purchasing/CreatePOModal.tsx`, `components/POS/CheckoutModal.tsx`, `components/Common/BatchBarcodeStickerModal.tsx` | |
| 1 | `components/LanguageSwitcher.tsx` | **Keep** — the "မြန်မာ" option label must stay Myanmar |

Re-run the scan yourself before starting. The line numbers above are a snapshot.

## 3. Decisions

| # | Decision |
|---|---|
| D-1 | **Printed vouchers and receipts stay Myanmar** (`components/Print/VoucherContent.tsx` and other print templates). They are given to customers, not shown to staff. Do not translate them. |
| D-2 | `pages/Menu.tsx` date line: when `language === "en"`, show an English date (for example `Friday, 31 Oct 2026`, using `toLocaleDateString("en-GB", ...)`). When `my`, keep the existing Myanmar digits and weekdays. |
| D-3 | Mixed strings such as `"မြို့နယ် (Township)"` and `"အားလုံး (All)"` become one key with a clean value per language: `my: "မြို့နယ်"`, `en: "Township"`. |
| D-4 | Backend error messages shown as-is (for example `err.response.data.message`) are **out of scope**. Only text written in dashboard code is in scope. |
| D-5 | Product names, customer names, notes and other user data stay as entered. |
| D-6 | Number and date formatting is unchanged, except D-2. |

## 4. Approach

For each in-scope file:

1. Make sure the component uses `const { t } = useLanguage();`.
   - In hooks (`usePOS.ts`): it is a React hook, so call `useLanguage()` there.
   - In non-React utils (`utils/printPaperSize.ts`): store **translation keys** (for example `labelKey: "settings.paperSize.listLabel"`) instead of text, and let the consuming component call `t()`. Keep exported names and types compatible. Update all consumers (grep).
2. Replace every hardcoded Myanmar UI string with `t("section.key")`.
   - User-visible text includes: labels, headers, buttons, placeholders, `title=` tooltips, `aria-label`, toast/alert messages, empty states, chip labels, and modal text.
   - Dynamic values use params. Follow the existing param syntax in `LanguageContext`.
3. Add every new key to **both** `translations/en.ts` and `translations/my.ts`, in the same section, in the same order.
   - **Reuse existing keys** where the meaning is the same: `common.*`, `customers.*`, `ecommerceOrders.*`, `pos.*`, `fulfillment.*`, `suppliers.*`, `reports.*`, `settings.*`.
   - New page-specific keys go in a matching section. Customer detail goes under `customers.detail.*`. Create the subsection if it is missing.
   - The `my` value must be **exactly the current Myanmar text** (copy it), so the Myanmar UI does not change.
4. Remove `|| "fallback"` only where the key now exists in both files. If you touch a line with this pattern, keep the code style consistent with the file. Do not do a repo-wide rewrite of untouched lines.
5. Do not change logic, layout, classes or behaviour. Text only.

### Order of work
1. `pages/CustomerDetail.tsx` (all tabs, cards, filters, table, status and payment chips, pay-credit modal, credit toggle, blacklist modal, tooltips, empty states, recharts axis and tooltip labels).
2. Ecommerce: `EcommerceOrderDetailModal.tsx`, `EditEcommerceOrderPricesModal.tsx`, `AddItemsToEcommerceOrderModal.tsx`, `EcommerceOrders.tsx`, `EcommerceReports.tsx`, `EcommerceProductOrdersReport.tsx`.
3. Fulfillment and POS: `OrderFulfillmentModal.tsx`, `OrderFulfillment.tsx`, `usePOS.ts`, `POS.tsx`, `ProductGrid.tsx`, `CartSidebar.tsx`, `CheckoutModal.tsx`, `DirectSale.tsx`.
4. Suppliers and purchasing: `Suppliers.tsx`, `SupplierDetail.tsx`, `RecordPaymentModal.tsx`, `CreateGRNModal.tsx`, `GRNDetailModal.tsx`, `CreatePOModal.tsx`.
5. Settings, menu and misc: `Menu.tsx` (D-2), `WorkQueue.tsx`, `printPaperSize.ts` + `PrintPaperSizeSettingsCard.tsx`, `ActivityLogTab.tsx`, `BatchBarcodeStickerModal.tsx`, `Customers.tsx`.

### Out of scope (do not touch)
- `components/Print/*` voucher text (D-1), `LanguageSwitcher.tsx`, code comments, backend, ecommerce app.
- Any refactor beyond replacing strings.

## 5. Verification

Environment:
- `npm run build` + `vite preview` with a local backend: MongoDB `127.0.0.1:27018` with a test DB. Assert the DB name.
- Never touch production or `.env`. Seed data must include at least one customer with ecommerce orders, a credit payment, and a supplier.

| # | Test | Expected |
|---|---|---|
| L-1 | Re-run the §2 scan after the changes | Only the allowed files remain: `components/Print/*`, `LanguageSwitcher.tsx`, and `Menu.tsx` Myanmar digit/weekday constants. Paste the output. |
| L-2 | Key parity script: load `en.ts` and `my.ts` and compare the flattened key sets | 0 keys missing on either side. Paste the output. |
| L-3 | Key usage check: grep every `t("...")` literal key in changed files and confirm each exists in both files | 0 missing. Paste the output. |
| L-4 | Language **English**: `/customers/:id`, all 3 tabs, pay-credit modal, blacklist modal | No Myanmar UI text (user data excepted). Screenshots ×4. |
| L-5 | Language **Myanmar**: same screens | Looks the same as before the change. Screenshots ×2. |
| L-6 | English: ecommerce order detail + price edit modal + ecommerce orders list | No Myanmar. Screenshots ×2. |
| L-7 | English: Suppliers list + Supplier detail | No Myanmar. Screenshot ×1. |
| L-8 | English: Menu page date | English date. Myanmar mode: Myanmar date. Screenshots ×2. |
| L-9 | English: Settings → print paper size card | English labels. Screenshot ×1. |
| L-10 | English: one POS scan toast (scan a batch barcode) | English toast. Screenshot ×1. |
| L-11 | Browser console on all visited pages | No `Translation missing for key` warnings. Paste the console output. |
| L-12 | Print a voucher in English mode | Voucher is still Myanmar (D-1). Screenshot. |
| L-13 | `npm run build` (dashboard) | exit 0 |
| L-14 | `md5sum` of all screenshots | All different |

Screenshots go to `dashboard/plans/screenshots/i18n/`. Take each screenshot at the moment its test runs.
