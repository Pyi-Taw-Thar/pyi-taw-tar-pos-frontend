# Dashboard UI ပြင်ဆင်ရန် အသေးစိတ် Plan (Antigravity အတွက်)

- **ရက်စွဲ:** 2026-10-27
- **အခြေအနေ:** ⏳ အကောင်အထည်ဖော်ရန် စောင့်ဆိုင်းဆဲ
- **အခြေခံ:** Demo data ဖြင့် page ၂၁ ခုကို desktop 1366px / tablet 768px / ဖုန်း 390px တွင် စစ်ဆေးချက် (2026-10-27)
- **Branch:** `dashboard` repo ၏ `production-v2` (လက်ရှိ working tree သန့်)

---

## 0. Agent လိုက်နာရမည့် စည်းမျဉ်း (မဖြစ်မနေ)

1. **ဘာသာစကား** — user ကို ပြန်ဖြေချက်၊ code comment အားလုံး **မြန်မာလို** (`AGENTS.md`, `CLAUDE.md` အတိုင်း)
2. **Logic မပြောင်းရ** — ဤ plan သည် UI / layout / စာသားသာ ဖြစ်သည်။ API call, state, cart/price တွက်ချက်ပုံ, permission ကို မထိရ (Phase 5 မှလွဲ၍ — ထိုနေရာတွင်လည်း request အရေအတွက်သာ လျှော့)
3. **Phase တစ်ခုချင်း** ပြီးမှ နောက်တစ်ခု — phase တစ်ခုပြီးတိုင်း §7 စစ်ဆေးချက်ကို လုပ်ပြီး user ကို အစီရင်ခံ
4. **Commit/push မလုပ်ရ** — user ခွင့်ပြုမှသာ (phase တစ်ခု = commit တစ်ခု အဖြစ် အဆိုပြုနိုင်)
5. **Tailwind** — `index.html` ထဲ CDN ဖြင့် load ထားခြင်း ဖြစ်၍ npm package မထည့်ရ; ရှိပြီးသား class / theme color (`primary`, `dark-*`) ကိုသာ သုံး
6. **Dependency အသစ် မထည့်ရ**
7. `.backup` ဖိုင်များ (`Settings.tsx.backup`, `ThermalReceipt.tsx.backup`) ကို **မထိ**
8. Build — `npm run build` pass ရမည် (lint/typecheck script မရှိ; `npx tsc --noEmit` တွင် ယခင်ကတည်းက error ရှိနိုင်သဖြင့် **ပြင်သောဖိုင်တွင် error အသစ် မတိုးစေရ**)

---

## Phase 1 — 🔴 POS screen ကို tablet / ဖုန်းတွင် သုံးလို့ရအောင် (ဦးစားပေး ၁)

### ပြဿနာ (တိုင်းတာချက်)
| Viewport | ရလဒ် |
|---|---|
| 390px | Cart `w-96` (384px) ပုံသေ → product နေရာ **48px** သာကျန်; search box 82px; product card မမြင်ရ |
| 768px | product နေရာ 384px, grid **1 column**; search box ကျုံ့; ဆိုင်ရွေး dropdown ဖြတ်ခံရ |
| 1366px | ကောင်း (4 column) — **မပြောင်းရ** |

### အကြောင်းရင်း (ဖိုင် / line)
- `components/POS/CartSidebar.tsx:44` — `className="w-96 bg-white flex flex-col border-l ... h-[calc(100vh-60px)] sticky top-0"` (အမြဲ ဘေးတွင် ကပ်)
- `pages/POS.tsx:36` — `<div className="flex h-[calc(100vh-60px)] overflow-hidden ...">` (ProductGrid + CartSidebar ဘေးချင်းယှဉ် အမြဲ)
- `components/POS/ProductGrid.tsx:40` — `px-6 py-4` (ဖုန်းတွင် padding ကြီး)
- `components/POS/ProductGrid.tsx:42` — toolbar `flex items-center gap-3` (wrap မဖြစ်)
- `components/POS/ProductGrid.tsx:166` — `flex overflow-y-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4` (`flex` နှင့် `grid` ရော; viewport breakpoint သာ — cart ယူထားသော နေရာ မတွက်)
- `components/POS/CartSidebar.tsx:42` — `console.log("cart", ...)` debug log ကျန်နေ (ဖယ်ရန်)

### ပြင်ပုံ
```
≥ lg (1024px+)  — ယခုအတိုင်း ဘေးချင်းယှဉ်
┌──────────────────────────┬──────────┐
│ ProductGrid (flex-1)     │ Cart     │  ← Cart: lg:w-80 xl:w-96
└──────────────────────────┴──────────┘

< lg (ဖုန်း / tablet) — cart ကို အောက်ခြေ bar + drawer
┌──────────────────────────────────┐
│ [🔍 search ........ full width ] │  ← row 1
│ [အမျိုးအစား ▾]   [🏪 ဆိုင် ▾]     │  ← row 2 (wrap)
│ ┌──────┐ ┌──────┐ ┌──────┐       │  ← 2 col (sm) / 3 col (md)
│ │card  │ │card  │ │card  │       │
├──────────────────────────────────┤
│ 🛒 3 ခု · 12,600 MMK [ငွေရှင်းမယ်]│  ← fixed bottom bar (cart ရှိမှ ပေါ်)
└──────────────────────────────────┘
  bar နှိပ် → Cart ကို အောက်မှ full-height drawer (✕ / overlay နှိပ်ပိတ်)
```

| ဖိုင် | ပြောင်းလဲမှု |
|---|---|
| `pages/POS.tsx` | `const [cartOpen, setCartOpen] = useState(false)` ထည့်; `CartSidebar` ကို `isOpen` / `onClose` prop ဖြင့် ပေး; `< lg` တွင်သာ ပြမည့် bottom bar component (သို့ inline) ထည့် — item အရေအတွက် (`cart.reduce(qty)`), `subtotal`, "ငွေရှင်းမယ်" ခလုတ် (`setCartOpen(true)`) |
| `components/POS/CartSidebar.tsx` | `isOpen?: boolean; onClose?: () => void` prop ထည့်။ Class ကို — `lg:static lg:w-80 xl:w-96 lg:translate-y-0` (desktop ယခုအတိုင်း) + `< lg` တွင် `fixed inset-x-0 bottom-0 z-50 h-[85vh] rounded-t-2xl transition-transform` နှင့် `isOpen ? translate-y-0 : translate-y-full`; header တွင် `lg:hidden` ✕ ခလုတ်; နောက်ခံ overlay (`lg:hidden fixed inset-0 bg-black/40`) — နှိပ်လျှင် `onClose`; `console.log` ဖယ် |
| `components/POS/ProductGrid.tsx:40` | `px-3 sm:px-4 lg:px-6 py-3 lg:py-4` + `pb-24 lg:pb-4` (bottom bar ဖုံးမသွားစေရန်) |
| `components/POS/ProductGrid.tsx:42` | toolbar → `flex flex-wrap items-center gap-2 sm:gap-3`; search wrapper → `w-full sm:flex-1 sm:w-auto min-w-0` |
| `components/POS/ProductGrid.tsx:166` | `flex` ဖယ် → `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4 overflow-y-auto pb-20` |
| Checkout modal (`components/POS/CheckoutModal.tsx`) | drawer ထဲမှ "ငွေရှင်း" နှိပ်လျှင် ယခုအတိုင်း modal ဖွင့် (drawer ကို ပိတ်ပြီးမှ) |

- **`pages/DirectSale.tsx:814`** တွင်လည်း `w-96` cart တူညီသော ပြဿနာ — sidebar တွင် route ပိတ်ထား (comment) သော်လည်း `/direct-sale` route ရှိနေ၍ **တူညီသော pattern ဖြင့်** ပြင် (သို့ CartSidebar ကို ပြန်သုံး — logic မပြောင်းနိုင်လျှင် class သာ)
- Barcode scanner — search input `autoFocus` ယခုအတိုင်း ထား (desktop scanner workflow မပျက်စေရ)

### လက်ခံနိုင်မှု စံ
- 390px: product 2 column, search အပြည့်, cart bar အောက်ခြေတွင်, drawer ဖွင့်/ပိတ် ရ, checkout ပြီးဆုံးအောင် လုပ်နိုင်
- 768px: product 3 column, ဆိုင်ရွေး dropdown အပြည့်မြင်
- 1366px: **ယခင်အတိုင်း** (screenshot before/after တူ)
- `document.documentElement.scrollWidth === innerWidth` (horizontal scroll မရှိ) — viewport ၃ မျိုးလုံး

---

## Phase 2 — 🔴 မြန်မာဘာသာ ရွေးထားလျှင် English စာ ရောမပြရ (i18n)

### ပြဿနာ
- `t()` မသုံးဘဲ English စာ **တိုက်ရိုက်ရေးထားသော နေရာ ~688 ခု / ဖိုင် ၇၈ ခု** + English toast **~121 ခု**
- စာရင်းထုတ်ရန် command (project root `dashboard/` မှ):
  ```bash
  grep -rnE ">\s*[A-Z][A-Za-z/&().'-]+( [A-Za-z/&().'-]+){0,6}\s*<|placeholder=\"[A-Z][a-z]|title=\"[A-Z][a-z]" pages components --include=*.tsx | grep -v "\.backup"
  grep -rnE "toast\.(error|success|warning|info)\(\"[A-Z]" pages components hooks --include=*.ts*
  ```

### Translation စနစ် (ရှိပြီးသား — ဤအတိုင်းသုံး)
- `context/LanguageContext.tsx` — `const { t } = useLanguage();` → `t("section.key")`; key မရှိလျှင် English fallback
- `translations/my.ts`, `translations/en.ts` — top-level section များ (`common`, `sidebar`, `pos`, `inventory` (line 197), `orders` (370), `fulfillment` (462), `ecommerceOrders` (536), `customers` (589), `creditOrders`, `credits`, `expenses`, `accountManagement` (756), `warehouse` (816), `storefront` (857), `suppliers` (898), `purchasing` (948), `reports` (964), `purchaseReport` (970), `quotation`, `settings` (1061) …)
- Parameter — `t("pos.showingProducts").replace("{count}", ...)` ပုံစံ (ရှိပြီးသား) သို့ `t(key, { count })`

### ပြင်ပုံ စည်းမျဉ်း
1. English စာတိုင်းကို သက်ဆိုင်ရာ section ထဲ key အသစ်ဖြင့် **`en.ts` နှင့် `my.ts` နှစ်ခုလုံး** တွင် ထည့်ပြီး `t()` ဖြင့် အစားထိုး
2. Key နာမည် — camelCase, အဓိပ္ပာယ်ဖြင့် (`orders.colOrderNumber`, `inventory.statusActive`); **ရှိပြီးသား key ကို အရင်ရှာ၍ ပြန်သုံး** (`common.total`, `common.cancel`, `common.save`, `common.previous` …)
3. မြန်မာ စာသား — ယခု app ထဲတွင် သုံးပြီးသား ဝေါဟာရအတိုင်း (ဥပမာ အော်ဒါ, ကုန်ပစ္စည်း, ဆိုင်ခန်း, ကုန်လှောင်ရုံ, ပစ္စည်းသွင်းသူ, အကြွေး); အတိုချုံး ရိုးရှင်းစွာ
4. **ဘာသာမပြန်ရ** — ပစ္စည်းအမည်, brand, product code, order number, `MMK`, `KBZ Pay` / `Wave Pay` စသည့် payment brand နာမည်, `PO` / `GRN` acronym
5. Toast / `alert` / `confirm` စာ များလည်း ပါဝင်
6. Debug `console.log` ကို ဘာသာမပြန် (ထိလည်း မထိ)

### လုပ်ဆောင်မည့် အစဉ် (batch — batch တစ်ခုပြီးတိုင်း build + browser စစ်)
| Batch | ဖိုင်များ | screenshot တွင် တွေ့ရသော ဥပမာ |
|---|---|---|
| 2A — နေ့စဉ်သုံး | `components/Orders/OrdersTable.tsx` (21), `components/Orders/OrderDetailModal.tsx` (13), `components/Inventory/InventoryTable.tsx` (11; line 54 "← Swipe to see more →", 76-77 `Code`/`Name`…), `pages/Inventory.tsx` (8; line 892 "Status:", All/Active/Inactive), `components/Inventory/ProductDetailModal.tsx` (37), `pages/EcommerceOrders.tsx` (table header line 389-413: Order Number/Customer/Total Amount/Status/Payment/Date/Actions; line 545 `Fulfillment Vr:`), `components/POS/CheckoutModal.tsx` (8), `components/QuickSale/*`, `pages/POS.tsx:30` ("You are not assigned to any storefront…"), `pages/POS.tsx` ("Please wait while we process your order...") | Order Number, Items, Final Amount, View, Import Excel |
| 2B — စတော့ / ဆိုင် | `pages/Storefront.tsx` (19; "Show All Inventory"), `pages/StorefrontDetail.tsx` (33), `pages/StorefrontProductDetail.tsx` (21), `pages/Warehouse.tsx` (19), `pages/WarehouseDetail.tsx` (40), `components/Purchasing/TransferList.tsx`, `TransferDetailModal.tsx` | Show All Inventory, active |
| 2C — ဝယ်ယူမှု | `components/Purchasing/PurchaseOrderList.tsx` (15; "Purchase Orders List", "Create New PO", PO ID…), `CreatePOModal.tsx`, `PODetailModal.tsx`, `GRNDetailModal.tsx` (17), `GRNList.tsx`, `PaymentHistoryModal.tsx`, `pages/Suppliers.tsx` ("Reset", "Consign"), `pages/SupplierDetail.tsx` | Purchase Orders List |
| 2D — ငွေကြေး / report | `components/Reports/*` (ReportTabs 12, TotalRevenueTab, FOCTab, OverallReportTab, CreditOrdersTab, PaidOrdersTab, ReportsHeader — "Financial Reports", "Overall", "Paid Orders", "Total Sales"…), `components/PurchaseReport/*` (OverviewTab 22, ProductTab 14, SupplierTab 12 — "Overview", "By Product", "Refresh", "Total POs"…), `pages/Credits.tsx`, `pages/CreditDetail.tsx`, `pages/CreditOrders.tsx` ("Credit Order Number"), `pages/Expenses.tsx`, `pages/DirectSaleOrders.tsx` ("No orders found"), Quotation ("Select date range") | Financial Reports |
| 2E — စနစ် | `pages/Settings.tsx` (31; "System Settings", "Shop Settings", "Stock Audit Logs", "Transfer Management", "Activity Log", "No shop settings yet", "Create Shop Settings"…), `pages/AccountManagement.tsx` (42; "Account Management", "Manage system user accounts…", "Create Account", "Total Accounts", Active/Deleted/Roles) | System Settings |
| 2F — ကျန် | grep command ကို ပြန် run ၍ ကျန်သမျှ (`ThermalReceipt.tsx`, `Print/VoucherContent.tsx` — **ပုံနှိပ်မည့် ဘောင်ချာ ဖြစ်၍ user ကို အရင်မေး**: ဘောင်ချာကို English ထားမလား မြန်မာ ပြောင်းမလား) | |

### လက်ခံနိုင်မှု စံ
- Language = မြန်မာ ဖြင့် page ၂၁ ခုလုံးတွင် §4 rule 4 ပါ စာများမှလွဲ၍ English UI စာ မကျန်
- Language = English သို့ ပြောင်းလျှင် English ဖြင့် မှန်ကန်စွာ ပြ (key မပျောက်) — console တွင် `Translation missing for key` warning **မရှိ**
- grep command ရလဒ် — ပစ္စည်းအမည်/brand ကဲ့သို့ ချွင်းချက်များသာ ကျန်

---

## Phase 3 — 🟡 Sidebar

ဖိုင်: `components/Sidebar.tsx`, `translations/my.ts`, `translations/en.ts`

| # | ပြဿနာ | နေရာ | ပြင်ပုံ |
|---|---|---|---|
| 3.1 | Group နှင့် link နာမည်တူ "အော်ဒါများ" | `Sidebar.tsx:106` (`sidebar.groupOrders`) + `:109` (`sidebar.orders`); `my.ts:76`, `my.ts:91` | `my.ts` `groupOrders` → "အော်ဒါ စီမံခြင်း"; link `orders` → "ရောင်းချမှု အော်ဒါများ" (en: "Order Management" / "Sales Orders") |
| 3.2 | Group နှင့် link နာမည်တူ "ပစ္စည်းဝယ်ယူမှု" | `Sidebar.tsx:158` (`groupPurchasing`) + `:169` (`purchasing`); `my.ts:78`, `my.ts:89` | group → "ဝယ်ယူရေး"; link → "ဝယ်ယူမှု အော်ဒါ (PO)" |
| 3.3 | "Ecommerce" group — key မဟုတ်သော `t("Ecommerce")` | `Sidebar.tsx:219` | `t("sidebar.groupEcommerce")` + `my.ts`: "အွန်လိုင်း အရောင်း", `en.ts`: "Ecommerce" |
| 3.4 | `t("sidebar.orderFulfillment") \|\| "Order ထုတ်ပိုးစစ်ဆေးခြင်း"` fallback မလို | `Sidebar.tsx:112` | `|| ...` ဖယ် (key ရှိပြီး — `my.ts:92`); `my.ts` စာ → "အော်ဒါ ထုတ်ပိုးစစ်ဆေးခြင်း" (English "Order" ရော မပါစေ) |
| 3.5 | Close ခလုတ် `aria-label="Close menu"` English | `Sidebar.tsx:318` | `aria-label={t("sidebar.closeMenu")}` |
| 3.6 | **Desktop တွင် sidebar အမြဲဖွက်** (☰ နှိပ်ရ) | `Sidebar.tsx:300` (`fixed ... -translate-x-full`) + `App.tsx` layout | **POS / Quick sale route မဟုတ်သော page များတွင်** `xl` (1280px+) ၌ sidebar ကို အမြဲဖွင့်ထား (`xl:translate-x-0` + main content `xl:pl-72`); POS (`/pos`, `/quick-sale`, `/direct-sale`) တွင် ယခုအတိုင်း drawer — **ဤချက်သည် UX ပြောင်းလဲမှုဖြစ်၍ Phase 3 မစမီ user ကို အတည်ပြုချက် တောင်း** |

---

## Phase 4 — 🟡 ဖုန်းတွင် ခလုတ်သေး / table ကျပ်

| # | နေရာ | ပြဿနာ (390px) | ပြင်ပုံ |
|---|---|---|---|
| 4.1 | `components/Inventory/InventoryTable.tsx` row action ခလုတ်များ | 28px အောက် ခလုတ် **36 ခု** | icon ခလုတ်များကို `min-w-[36px] min-h-[36px]` (ဖုန်း) / ယခုအရွယ် (`sm:` အထက်) — icon-only ဆိုလျှင် `aria-label={t(...)}` ထည့် |
| 4.2 | `pages/Inventory.tsx` header action ခလုတ်များ (Refresh / ဂိုဒေါင်ကိုပို့ / အရောင်းဆိုင်ကိုပို့ / Import / +) | ၂ တန်းခွဲ၍ "+" ခလုတ် အစွန်းထိ | `flex flex-wrap gap-2`; ဖုန်းတွင် grid `grid-cols-2` (Refresh ကို icon-only) |
| 4.3 | `pages/Customers.tsx` — "+ Credit", "ကြည့်ရှုမည်", "ပြင်ဆင်မည်" | 28px အောက် (3 ခု) | `py-1.5 px-3 min-h-[32px]` |
| 4.4 | `pages/EcommerceOrders.tsx` table | 28px အောက် 7 ခု; order number (`ECO-2026-10-27-000004`) ၄ ကြောင်းခွဲ (line ~483) | order number cell `whitespace-nowrap font-mono text-xs`; `< sm` တွင် table အစား **card list** (order no. / customer / ငွေ / status badge / "ကြည့်မယ်") — `hidden sm:table` + `sm:hidden` card |
| 4.5 | ကျန် table page များ (Orders, Purchasing, Credits) | table ကို ဘေးတိုက် swipe ရ — လက်ခံနိုင်; **4.4 ပုံစံကို Phase 4 တွင် EcommerceOrders တစ်ခုသာ** လုပ်ပြီး ကျန်တာ user ကိုမေး | — |

---

## Phase 5 — 🟡 API ကို ထပ်ခါထပ်ခါ ခေါ်ခြင်း လျှော့ရန်

Network log တွင် page တစ်ခုဖွင့်တိုင်း တူညီသော request ထပ်:
| Page | ထပ်နေသော request |
|---|---|
| `/pos` | `GET /storefront-profile` ×3, `GET /inventory/categories` ×2, `GET /credit-persona` ×2 |
| `/order-fulfillment` | `GET /fulfillment/pending` ×2 |
| `/reports` | `GET /sale-report?...` ×2 နှင့် `?storefrontId=` ×2 |
| `/settings` | `GET /location-profile` ×3 |

- **အရင်စစ်ရန်** — `index.tsx` / `App.tsx` တွင် `<React.StrictMode>` ရှိလျှင် **dev mode** ၌ effect ၂ ကြိမ် run ခြင်းသာ ဖြစ်နိုင် → **production build (`npm run build && npm run preview`)** ဖြင့် network ကို ပြန်တိုင်း; build တွင်ပါ ထပ်နေမှသာ ပြင်
- ပြင်ပုံ — ထပ်ခေါ်သော component/hook ကို ရှာ (`grep -rn "fetchStorefronts\|storefront-profile" hooks services pages components`), parent တစ်နေရာတည်းတွင် ခေါ်၍ prop ဖြင့် ပေး သို့ `useEffect` dependency ကို ပြင်; **response data/ပုံစံ မပြောင်းရ**
- Request ၁ ကြိမ်သာ ဖြစ်ကြောင်း network ဖြင့် အတည်ပြု

---

## Phase 6 — 🟢 Accessibility / သေးငယ်သော ပြင်ဆင်ချက်

| # | နေရာ | ပြင်ပုံ |
|---|---|---|
| 6.1 | `index.html:2` `<html lang="en">` | `LanguageContext.tsx` ၏ `useEffect` (language ပြောင်းချိန်) တွင် `document.documentElement.lang = language === "my" ? "my" : "en"` ထည့် |
| 6.2 | PurchaseReport page — label မရှိသော icon-only ခလုတ် ၂ ခု | `aria-label={t(...)}` ထည့် (`components/PurchaseReport/*` တွင် `<button` ထဲ text မရှိသော နေရာ) |
| 6.3 | `components/POS/ProductGrid.tsx:138` pagination စာ `"{n} to {m} of {total}"` English + `* 100` hardcode | `t("pos.paginationRange", ...)`; `100` ကို `itemsPerPage` prop ဖြင့် (usePOS မှ ပေး — တန်ဖိုး မပြောင်း) |
| 6.4 | `ProductGrid.tsx` `title="First Page"` စသည် | `t()` |

---

## 7. Phase တိုင်း စစ်ဆေးနည်း

1. `npm run build` — pass
2. Test environment — **production DB မထိရ**။ Backend ကို သီးသန့် test DB ဖြင့် run:
   ```bash
   # backend/ မှ — MONGODB_URI ၏ /production ကို /uomtest ဖြင့် အစားထိုး၍ (connection name = uomtest ဖြစ်ကြောင်း assert)
   PORT=5055 ECOMMERCE_STOREFRONT_ID=<test storefront id> node src/server.js
   # dashboard/ မှ
   VITE_API_BASE_URL=http://localhost:5055/api/v1/ npx vite build --outDir <temp-dir>
   npx vite preview --outDir <temp-dir> --port 3000 --strictPort --host 127.0.0.1
   ```
   - Demo data — admin (`backend/createAdmin.js` ၏ seed အကောင့်), storefront + warehouse (`LocationProfile` field: `type`, `locationCode`, `locationName`, `locationAddress`, `locationPhone`), supplier (`supplierName`), inventory ~12 (UOM: base `ဘူး`, `ပုံး=10`, `ဖာ=120`; တစ်ခု stock 0), `StorefrontInventory`, `WarehouseStock`, customer ၃, ecommerce order ၄ (status အမျိုးမျိုး), POS order ၅ (`POST /api/v1/order` — credit တစ်ခုပါ)
   - စစ်ပြီး test DB drop, temp script/server ဖျက်
3. Browser — **390 / 768 / 1366px** ၃ မျိုးလုံး (Phase 1 & 4 အဓိက) + language **မြန်မာ ↔ English** ပြောင်း (Phase 2)
4. JS ဖြင့် တိုင်း — `document.documentElement.scrollWidth <= innerWidth` (horizontal scroll မရှိ)
5. Console — error / `Translation missing` warning အသစ် မရှိ
6. User ကို အစီရင်ခံ — ပြင်သောဖိုင်, before/after, မစစ်နိုင်ခဲ့သည့်အချက်

---

## 8. Scope အပြင် (မလုပ်ရ)
- Backend ပြောင်းလဲမှု
- Ecommerce app (`ecommerce/`)
- Feature အသစ်, color/brand ပြောင်းခြင်း, library ထည့်ခြင်း
- POS / checkout ၏ တွက်ချက်မှု, barcode scan logic
- Comment ပိတ်ထားသော sidebar route များ (Direct sale, Quotation) ကို ပြန်ဖွင့်ခြင်း
