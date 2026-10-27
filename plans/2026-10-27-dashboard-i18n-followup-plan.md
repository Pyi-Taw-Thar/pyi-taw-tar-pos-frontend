# Dashboard i18n Follow-up Plan — ကျန်နေသော English စာ + `<html lang>` sync (Antigravity အတွက်)

- **ရက်စွဲ:** 2026-10-27
- **အခြေအနေ:** ⏳ အကောင်အထည်ဖော်ရန် စောင့်ဆိုင်းဆဲ
- **မူရင်း plan:** [`2026-10-27-dashboard-ui-fixes-plan.md`](./2026-10-27-dashboard-ui-fixes-plan.md)
- **ယခင် report:** [`2026-10-27-dashboard-ui-fixes-report.md`](./2026-10-27-dashboard-ui-fixes-report.md) — "100% ပြီး" ဟုဆိုသော်လည်း စစ်ဆေးချက်အရ **မပြီးသေး**
- **နေရာစာရင်း အပြည့်:** [`2026-10-27-dashboard-i18n-followup-appendix.md`](./2026-10-27-dashboard-i18n-followup-appendix.md)
- **Working tree:** ယခင်ပြင်ဆင်ချက် ဖိုင် ၅၀ (commit မလုပ်ရသေး) ပေါ်တွင် **ဆက်ပြင်** — revert / reset **မလုပ်ရ**

---

## 0. စည်းမျဉ်း (ယခင် plan §0 အတိုင်း + ထပ်ဆောင်း)

1. ပြန်ဖြေချက် / code comment — **မြန်မာလို**
2. UI စာသားသာ — logic / API / တွက်ချက်မှု မပြောင်း
3. Commit / push / dependency အသစ် **မလုပ်ရ**
4. **Report တွင် "ပြီး" ဟု မရေးမီ §5 ၏ စစ်ဆေးချက် ၅ ခုလုံးကို run ပြီး output ကို report ထဲ ကူးထည့်ရမည်** (ယခင် report တွင် အထောက်အထားမပါဘဲ ပြီးကြောင်း ဆိုခဲ့၍)
5. ဆုံးဖြတ်ရန် မသေချာသောအချက် (§4) — user ကို **မေးပြီးမှ** လုပ်

---

## 1. စစ်ဆေးချက်အရ ကျန်နေသော ပြဿနာ (snapshot 2026-10-27)

| # | ပြဿနာ | အရေအတွက် | အရေးကြီးပုံ |
|---|---|---|---|
| A | `en.ts` တွင်ရှိပြီး **`my.ts` တွင် မရှိသော key** — မြန်မာ mode တွင် English fallback ဖြင့် ပေါ် (`LanguageContext` ၏ fallback) | **189** (`reports` 83, `settings` 40, `purchaseReport` 35, `creditOrders` 16, `creditDetail` 15) | 🔴 အကြီးဆုံး — report / settings page တစ်ခုလုံး English ဖြစ်နေ |
| B | `my.ts` တွင်ရှိပြီး `en.ts` တွင် မရှိသော key | **5** (`common.deleting`, `pos.failedToLoadProducts`, `storefront.showAllInventory`, `storefront.hideInventory`, `purchasing.createNewPO`) | 🟡 English mode တွင် key နာမည် ပေါ်နိုင် |
| C | JSX ထဲ တိုက်ရိုက်ရေးထားသော English (comment / `MMK` / acronym ဖယ်ပြီး) | **294 ကြောင်း / ဖိုင် ၆၄** | 🔴 |
| D | English toast (`toast.error("...")` စသည်) | **75** | 🟡 |
| E | Object literal label / option (`{ label: "Cash" }` စသည်) | **45** | 🟡 |
| F | `<html lang>` sync — report တွင် လုပ်ပြီးဟုဆိုသော်လည်း **code ထဲ မရှိ** (`documentElement` ကို မည်သည့်ဖိုင်တွင်မျှ မတွေ့) | 1 | 🟢 |

### အထူးသတိပြုရန် — ဖုန်းတွင်သာ ပြသော label
ယခင်အလုပ်တွင် `hidden sm:inline` (desktop) ကိုသာ ဘာသာပြန်ပြီး **`sm:hidden` (ဖုန်းတွင်သာပြ) span များကို ကျော်ခဲ့** — ဥပမာ:
- `pages/AccountManagement.tsx:620-632` — `<span className="sm:hidden">Name / Role / Location / Status</span>`
- `pages/WarehouseDetail.tsx:502-503, 564-565` — `Transfer to Storefront` / `Transfer`, `Clear Filters` / `Clear`
- `pages/Settings.tsx:221-226` — `Date`, `Product` (desktop / mobile နှစ်ခုလုံး)

→ **span နှစ်ခုလုံး** (`hidden sm:inline` + `sm:hidden`) ကို ဘာသာပြန်ရမည်; ဖုန်းအတွက် key အတို (`...Short`) ခွဲသုံးနိုင်

---

## 2. နေရာရှာရန် command (dashboard/ မှ run)

```bash
# C — JSX English
grep -rnE ">\s*[A-Z][A-Za-z/&().'-]+( [A-Za-z/&().'-]+){0,6}\s*<|placeholder=\"[A-Z][a-z]|title=\"[A-Z][a-z]" pages components --include=*.tsx \
  | grep -v "\.backup" | grep -vE "^\S+:[0-9]+:\s*\{/\*|^\S+:[0-9]+:\s*//" \
  | grep -vE ">\s*(MMK|Ks|PO|GRN|SKU|KBZ Pay|Wave Pay|AYA Pay|UAB Pay|Pyi-Taw-Tar POS)\s*<"

# D — toast
grep -rnE "toast\.(error|success|warning|info)\(\"[A-Z]" pages components hooks --include=*.ts* | grep -v "\.backup"

# E — label / option literal
grep -rnE "(label|title|header|placeholder|text|name): \"[A-Z][a-z]+( [A-Za-z]+)*\"" pages components hooks --include=*.ts* | grep -v "\.backup"

# A/B — key parity (esbuild ကို vite မှ ရှိပြီးသား)
node -e "
const fs=require('fs'),e=require('./node_modules/esbuild');
const load=f=>{const{code}=e.transformSync(fs.readFileSync(f,'utf8'),{loader:'ts',format:'cjs'});const m={exports:{}};new Function('module','exports',code)(m,m.exports);return Object.values(m.exports)[0];};
const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'?flat(v,p+k+'.'):[p+k]);
const en=new Set(flat(load('translations/en.ts'))),my=new Set(flat(load('translations/my.ts')));
console.log('missingInMy',[...en].filter(k=>!my.has(k)).length,'missingInEn',[...my].filter(k=>!en.has(k)).length);
for(const f of ['translations/en.ts','translations/my.ts']){const w=e.transformSync(fs.readFileSync(f,'utf8'),{loader:'ts'}).warnings.filter(x=>/Duplicate key/.test(x.text));console.log(f,'duplicateKeys',w.length);}"
```

---

## 3. အလုပ်အစဉ် (Step တစ်ခုပြီးတိုင်း `npm run build` + parity command)

### Step 1 — `my.ts` ပျောက်နေသော key 189 ခု ဖြည့် (🔴 ဦးစားပေး)
- Appendix §A ပါ key တိုင်းကို `translations/my.ts` ၏ သက်ဆိုင်ရာ section ထဲ ထည့်
  - `creditOrders` (my.ts:672), `creditDetail` (my.ts:736), `reports` (my.ts:1086 — ယခု key **အနည်းငယ်သာ** ရှိ), `purchaseReport` (my.ts:1092), `settings` (my.ts:1183)
  - en.ts ၏ တန်ဖိုးကို ကြည့်၍ မြန်မာ ဘာသာပြန် (ယခင် plan §Phase 2 ၏ ဝေါဟာရ / ချွင်းချက် rule အတိုင်း)
  - en.ts ၏ section ထဲ key အစဉ်အတိုင်း ထား (နောက်ပိုင်း နှိုင်းယှဉ်လွယ်ရန်)
- `{count}`, `{name}` စသည့် placeholder ကို မြန်မာစာထဲတွင် **အတိအကျ ထိန်း**
- ပြီးလျှင် parity — `missingInMy 0`

### Step 2 — `en.ts` ပျောက်နေသော key 5 ခု ဖြည့်
- `common.deleting`, `pos.failedToLoadProducts`, `storefront.showAllInventory`, `storefront.hideInventory`, `purchasing.createNewPO` → English တန်ဖိုး ထည့်
- ပြီးလျှင် parity — `missingInEn 0`

### Step 3 — JSX English 294 ကြောင်း (Appendix §B)
အစဉ် (အသုံးများသော page အရင်):
| Batch | ဖိုင် (ကျန်အရေအတွက်) |
|---|---|
| 3A | `pages/AccountManagement.tsx` (22), `pages/Settings.tsx` (18), `components/Settings/*` (ActivityLogTab 4, BusinessHoursCard 2, ShopSettingsForm 1, ShopLogoUpload 1) |
| 3B | `pages/WarehouseDetail.tsx` (15), `pages/Warehouse.tsx` (8), `pages/Storefront.tsx` (8), `pages/StorefrontDetail.tsx` (7), `pages/StorefrontProductDetail.tsx` (2) |
| 3C | `components/PurchaseReport/OverviewTab.tsx` (15), `ProductTab.tsx` (3), `SupplierTab.tsx` (2), `components/Reports/ReportTabs.tsx` (12), `TotalRevenueTab.tsx` (6), `PaidOrdersTab.tsx` (1), `OverallReportTab.tsx` (1), `pages/Reports.tsx` (1) |
| 3D | QuickSale — `components/QuickSale/CheckoutModal.tsx` (8), `CartProductModal.tsx` (6), `MarkupCalculatorModal.tsx` (5), `DiscountCalculatorModal.tsx` (5), `CartSidebar.tsx` (4), `SuccessModal.tsx` (2), `ProductGrid.tsx` (2), `BrandPanel.tsx` (1), `pages/QuickSale.tsx` (2); POS — `components/POS/MarkupCalculatorModal.tsx` (5), `DiscountCalculatorModal.tsx` (5), `SuccessModal.tsx` (2), `CheckoutModal.tsx` (2); `pages/DirectSale.tsx` (13) |
| 3E | Purchasing — `PurchaseOrderList.tsx` (7), `RecordPaymentModal.tsx` (5), `TransferWarehouseModal.tsx` (4), `TransferStorefrontModal.tsx` (4), `CreateGRNModal.tsx` (4), `UpdateLineItemModal.tsx` (3), `PaymentHistoryModal.tsx` (3), `GRNManager.tsx` (3), `CreatePOModal.tsx` (3), `PODetailModal.tsx` (2), `GRNDetailModal.tsx` (2), `TransferDetailModal.tsx` (1); `pages/SupplierDetail.tsx` (5), `pages/Suppliers.tsx` (3) |
| 3F | ကျန် — `pages/Customers.tsx` (4), `pages/CreditOrders.tsx` (4), `pages/CreditDetail.tsx` (3), `pages/Credits.tsx` (2), `pages/Expenses.tsx` (2), `components/Inventory/ImportResultModal.tsx` (6), `ProductDetailModal.tsx` (2), `components/Orders/*` (Add 3, Remove 3, Detail 1, CreditPerson 1), `components/Ecommerce/EcommerceOrderDetailModal.tsx` (2), `components/Customer/CustomerDetailModal.tsx` (2), `components/AIChat.tsx` (3), `components/ProtectedRoute.tsx` (1) |

- **မလုပ်ရ (user ဆုံးဖြတ်ချက် စောင့်):** `components/Print/VoucherContent.tsx` (10), `components/ThermalReceipt.tsx` (5) — §4.1

### Step 4 — Toast 75 ခု (Appendix §C)
- `toast.error("Failed to ...")` → `toast.error(t("section.failedToX"))`
- **Backend message fallback** ပုံစံ — `toast.error(response.message || "Failed to load accounts")` → `toast.error(response.message || t("accountManagement.failedToLoad"))` (backend message ကို ယခုအတိုင်း ရှေ့တွင်ထား — §4.2)
- အများဆုံး: `pages/Reports.tsx` (14), `pages/StorefrontDetail.tsx` (7), `pages/AccountManagement.tsx` (5), Purchasing modal များ (Transfer×2, CreateGRN — 5 စီ), `GRNManager.tsx` (4)
- `hooks/usePurchasing.ts` (1) — hook ထဲတွင် `useLanguage()` မရှိလျှင် hook ထဲ ထည့်သုံး (hook rule အတိုင်း top level)

### Step 5 — Object literal label 45 ခု (Appendix §D)
- Component အပြင်ဘက် (module level) တွင် ကြေညာထားသော array ဖြစ်လျှင် — label ကို key အဖြစ်ပြောင်း (`labelKey: "credits.methodCash"`) ပြီး render ချိန် `t(item.labelKey)`; သို့ component ထဲ `useMemo(() => [...], [t])` သို့ ရွှေ့
- **ဘာသာမပြန်ရ** — payment brand (`KBZ Pay`, `Wave Pay`, `AYA Pay`, `UAB Pay`), tier နာမည် ဖြစ်သော `Silver` / `Gold` / `Platinum` (brand-like ဖြစ်၍ — **§4.3 user ကိုမေး**); `Cash`, `Bank Transfer`, `Regular` → ဘာသာပြန်

### Step 6 — `<html lang>` sync (F)
- `context/LanguageContext.tsx:23-25` ရှိ effect ကို:
  ```ts
  useEffect(() => {
    localStorage.setItem("language", language);
    // screen reader / browser font ရွေးချယ်မှုအတွက် စာမျက်နှာ ဘာသာစကား သတ်မှတ်
    document.documentElement.lang = language === "my" ? "my" : "en";
  }, [language]);
  ```
- `index.html:2` `<html lang="en">` — default ကို `my` သို့ ပြောင်း (app default language = my ဖြစ်၍ ပထမ render မတိုင်မီ မှန်စေရန်)

---

## 4. User ကို မေးရမည့်အချက် (Step မစမီ / ထိုအဆင့်ရောက်လျှင်)
| # | မေးခွန်း | မေးမည့်အချိန် |
|---|---|---|
| 4.1 | ပုံနှိပ်ဘောင်ချာ (`VoucherContent.tsx`, `ThermalReceipt.tsx`) ကို **English ဆက်ထားမလား / UI ဘာသာအတိုင်း ပြောင်းမလား / မြန်မာ အမြဲ** | Step 3 မစမီ |
| 4.2 | Backend error message (English) ကို toast တွင် ဆက်ပြမလား၊ frontend ၏ မြန်မာ message ဖြင့် အစားထိုးမလား (backend ပြင်ခြင်းမှာ scope အပြင်) | Step 4 မစမီ |
| 4.3 | Customer tier `Silver` / `Gold` / `Platinum` ကို ဘာသာပြန်မလား | Step 5 မစမီ |
| 4.4 | (ယခင် plan Phase 3.6) Desktop 1280px+ တွင် sidebar အမြဲဖွင့်ထားမလား — **ယခင်အလုပ်တွင် မမေးဘဲ ကျော်ခဲ့** | ဤ plan ပြီးနောက် သီးခြား |

---

## 5. "ပြီး" ဟု report မရေးမီ စစ်ဆေးရမည့်အချက် (output ကို report ထဲ ကူးထည့်)
1. `npm run build` — pass (chunk-size warning သည် ယခင်ကတည်းက ရှိ — **"0 warnings" ဟု မရေးရ**)
2. §2 parity command — `missingInMy 0`, `missingInEn 0`, `duplicateKeys 0` (ဖိုင်နှစ်ခုလုံး)
3. §2 grep C / D / E — ကျန်သော ကြောင်းတိုင်းကို report ထဲ စာရင်းပြုစု၍ **ချွင်းချက်အကြောင်းရင်း** (ပစ္စည်းအမည်, brand, acronym, §4 user ဆုံးဖြတ်ချက်) ရေး; ချွင်းချက်မဟုတ်သော ကြောင်း **0**
4. `grep -n "documentElement.lang" context/LanguageContext.tsx` — ရလဒ် ၁ ကြောင်း
5. Browser — test DB + build preview (ယခင် plan §7 ၏ နည်းအတိုင်း; **production DB မထိ**):
   - Language **မြန်မာ** — `/reports`, `/purchase-report`, `/settings`, `/accounts`, `/credit-orders`, `/credits/:id`, `/warehouse/:id`, `/quick-sale` ကို **390px နှင့် 1366px** နှစ်မျိုးလုံးတွင် ဖွင့်၍ English UI စာ မရှိ (screenshot ၁ ပုံစီ report တွင် ပူးတွဲ)
   - Language **English** သို့ ပြောင်း — တူညီသော page များ English ဖြင့် မှန်, key နာမည် (`reports.xxx`) မပေါ်
   - Browser console — `Translation missing for key` warning **0**
   - `document.documentElement.lang` — language ပြောင်းတိုင်း `my` ⇄ `en`

---

## 6. Scope အပြင်
- Backend message ဘာသာပြန်ခြင်း
- Layout / responsive ပြောင်းလဲမှု (ယခင် plan Phase 1/4 — ပြီးပြီ)
- Sidebar desktop mode (§4.4 — user ဆုံးဖြတ်ပြီးမှ သီးခြား)
- `.backup` ဖိုင်များ
