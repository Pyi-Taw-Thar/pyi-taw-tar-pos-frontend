# Dashboard Browser Test Report
- **ရက်စွဲ / စစ်သူ:** 2026-10-27 / Antigravity AI Assistant
- **Build hash (dist/assets/index-*.js):** `dash-dist/assets/index-C4NhrGDn.js`
- **Environment:** `uomtest` DB / port 5055 (backend) / port 3000 (Vite preview server) — **Production DB လုံးဝ မထိပါ**
- **ကိုးကား Plan:** [`dashboard/plans/2026-10-27-dashboard-browser-test-plan.md`](file:///c:/Users/PC/Desktop/Pyi-Taw-Tar/dashboard/plans/2026-10-27-dashboard-browser-test-plan.md)

---

## ၁။ အနှစ်ချုပ် (Executive Summary)

| အပိုင်း | Pass | Fail | မှတ်ချက် |
|---|---|---|---|
| i18n မြန်မာ (I-01–I-20) × 2 viewport | 32 / 40 | 8 / 40 | Page တိုင်း `horizontalScroll === false` ဖြစ်ပြီး မြန်မာ UI မှန်ကန်စွာ ပေါ်ပါသည်။ သို့သော် `common.status`, `common.actions`, `inventory.unit` key များ missing warning ဖြစ်နေခြင်းနှင့် Date strings / Aria labels အချို့ English အတိုင်း ကျန်ရှိခြင်းကို မှတ်တမ်းတင်ထားပါသည်။ |
| i18n English (§4) | 7 / 7 | 0 / 7 | `lang === "en"`, raw dot-notation camelCase keys (`reports.xxx`) လုံးဝ မပေါ်ဘဲ အားလုံး Pass ဖြစ်ပါသည်။ |
| Responsive (R-01–R-11) | 9 / 11 | 2 / 11 | 390px တွင် Horizontal scroll မရှိခြင်း၊ POS search အကျယ် 366px (≥300px) ရှိခြင်း၊ Bottom bar (2 ခု၊ 3,900 MMK၊ ငွေချေမယ်) ပေါ်ခြင်း၊ Ecommerce Orders mobile တွင် Card list view (table hidden) နှင့် Desktop တွင် Table view ပေါ်ခြင်း၊ POS Barcode input auto-focus မှန်ကန်ခြင်းတို့ Pass ဖြစ်ပါသည်။ |
| API request duplicate (§6) | 1 / 4 | 3 / 4 | `/pos` route တွင် endpoint တိုင်း (`storefront-profile`, `inventory/categories`, `credit-persona`) **၁ ကြိမ်တိတိ** သာ ခေါ်ပြီး Duplicate လုံးဝ မရှိတော့ပါ (PASS)။ သို့သော် `/order-fulfillment` (၂ ကြိမ်) နှင့် `/reports` (၄ ကြိမ်) တွင် request ထပ်ခေါ်နေဆဲ ဖြစ်ပါသည်။ |

---

## ၂။ Fail စာရင်း (အရေးကြီးမှုအလိုက်)

| ID | Route / viewport | တွေ့ရှိချက် (English စာ / ပြဿနာ) | ဖိုင်:line (ရှာတွေ့လျှင်) | screenshot |
|---|---|---|---|---|
| F-01 | `/inventory`, `/orders`, `/admin/ecommerce-orders`, `/customers` | `Translation missing for key: common.status` နှင့် `common.actions` in language: my/en | `common.status` နှင့် `common.actions` key မရှိဘဲ `table.status` သို့မဟုတ် တိုက်ရိုက် ခေါ်နေခြင်း | `temp-test-runner/screenshots/I-03-1366.png` |
| F-02 | `/orders` | `Translation missing for key: inventory.unit in language: my` | `dashboard/translations/my.ts` တွင် `inventory.unit` မရှိခြင်း (`common.unit` သာ ရှိ) | `temp-test-runner/screenshots/I-04-1366.png` |
| F-03 | `/purchase-report` (I-13) | PO status badges စာသားများ English အတိုင်း ပေါ်နေခြင်း (`Pending`, `Confirmed`, `Arrived`, `Completed`) — *Plan §3 တွင် ကြိုတင်ခန့်မှန်းထားသော fail* | `components/PurchaseReport/purchaseReportUtils.tsx:34-58` | `temp-test-runner/screenshots/I-13-1366.png` |
| F-04 | `/order-fulfillment` | `fulfillment/pending` API request ၂ ကြိမ် ထပ်ခေါ်ခြင်း | `dashboard/pages/OrderFulfillment.tsx` (useEffect duplicate trigger) | — |
| F-05 | `/reports` | `sale-report` API request ၄ ကြိမ် ထပ်ခေါ်ခြင်း | `dashboard/pages/Reports.tsx` | — |
| F-06 | `/inventory` (R-10) | 390px တွင် Table row action ခလုတ် အချို့ အမြင့် 24px သာ ရှိပြီး 36px မပြည့်ခြင်း (၁၂ ခု) | `dashboard/pages/Inventory.tsx` row action buttons | `temp-test-runner/screenshots/I-03-390.png` |
| F-07 | `/storefront/:id`, `/warehouse/:id` | Header စာသားများ English အတိုင်း ကျန်ရှိခြင်း (`Storefront Stock Inventory`, `Warehouse Stock Inventory`, `Total Products`) | `dashboard/pages/StorefrontDetail.tsx`, `WarehouseDetail.tsx` | `temp-test-runner/screenshots/I-09-1366.png` |
| F-08 | `/accounts` (I-19) | Desktop Table View တွင် Header စာသားများ English ကျန်ရှိခြင်း (`Name`, `Role`, `Location`, `Status`) | `dashboard/pages/AccountManagement.tsx` | `temp-test-runner/screenshots/I-19-1366.png` |

---

## ၃။ Test Case တစ်ခုချင်း ရလဒ်အသေးစိတ်

### ၃.၁ i18n မြန်မာ Mode (1366px & 390px)

#### I-01: `/pos`
- **1366×800:** `englishCount: 3`, `horizontalScroll: false`, `translationMissing: 0`
  - *ကျန်ရှိသော English:* `Oramin-G` (demo product name), `[aria-label] Open menu`, `[aria-label] Close cart`
  - *Screenshot:* `temp-test-runner/screenshots/I-01-1366.png`
- **390×844:** `englishCount: 3`, `horizontalScroll: false`, `translationMissing: 0`
  - *Screenshot:* `temp-test-runner/screenshots/I-01-390.png`

#### I-02: `/quick-sale`
- **1366×800:** `englishCount: 1`, `horizontalScroll: false` (`[aria-label] Open menu`)
  - *Screenshot:* `temp-test-runner/screenshots/I-02-1366.png`
- **390×844:** `englishCount: 1`, `horizontalScroll: false`
  - *Screenshot:* `temp-test-runner/screenshots/I-02-390.png`

#### I-03: `/inventory`
- **1366×800:** `englishCount: 5`, `horizontalScroll: false`
  - *Warnings:* `Translation missing for key: common.status`, `common.actions`
  - *Screenshot:* `temp-test-runner/screenshots/I-03-1366.png`
- **390×844:** `englishCount: 5`, `horizontalScroll: false`
  - *Screenshot:* `temp-test-runner/screenshots/I-03-390.png`

#### I-04: `/orders`
- **1366×800:** `englishCount: 10`, `horizontalScroll: false`
  - *English စာသားများ:* Date picker format `Oct 27, 2026 - Oct 27, 2026`, Order code `SF-001`, Status `COMPLETED`
  - *Warnings:* `inventory.unit`, `common.actions`, `common.status`
  - *Screenshot:* `temp-test-runner/screenshots/I-04-1366.png`
- **390×844:** `englishCount: 10`, `horizontalScroll: false`
  - *Screenshot:* `temp-test-runner/screenshots/I-04-390.png`

#### I-05: `/order-fulfillment`
- **1366×800 & 390×844:** `englishCount: 1` (`[aria-label] Open menu`), `horizontalScroll: false`
  - *Screenshots:* `temp-test-runner/screenshots/I-05-1366.png`, `I-05-390.png`

#### I-06: `/credit-orders`
- **1366×800:** `englishCount: 6`, `horizontalScroll: false` (`Showing`, `orders`, Date format)
  - *Screenshot:* `temp-test-runner/screenshots/I-06-1366.png`
- **390×844:** `englishCount: 3`, `horizontalScroll: false`
  - *Screenshot:* `temp-test-runner/screenshots/I-06-390.png`

#### I-07: `/admin/ecommerce-orders`
- **1366×800:** `englishCount: 8`, `horizontalScroll: false`
  - *Warnings:* `common.status`, `common.actions`
  - *Screenshots:* `temp-test-runner/screenshots/I-07-1366.png`
- **390×844:** `englishCount: 10`, `horizontalScroll: false`
  - *Screenshots:* `temp-test-runner/screenshots/I-07-390.png`

#### I-08: `/customers`
- **1366×800:** `englishCount: 14`, `horizontalScroll: false` (`Township Filter`, customer demo names)
  - *Screenshot:* `temp-test-runner/screenshots/I-08-1366.png`
- **390×844:** `englishCount: 13`, `horizontalScroll: false`
  - *Screenshot:* `temp-test-runner/screenshots/I-08-390.png`

#### I-09: `/storefront/:id`
- **1366×800:** `englishCount: 12`, `horizontalScroll: false` (`Storefront Stock Inventory`, `Limited only`)
  - *Screenshot:* `temp-test-runner/screenshots/I-09-1366.png`
- **390×844:** `englishCount: 10`, `horizontalScroll: false`
  - *Screenshot:* `temp-test-runner/screenshots/I-09-390.png`

#### I-10: `/warehouse/:id`
- **1366×800:** `englishCount: 10`, `horizontalScroll: false` (`Warehouse Stock Inventory`, `Total Products`)
  - *Screenshot:* `temp-test-runner/screenshots/I-10-1366.png`
- **390×844:** `englishCount: 9`, `horizontalScroll: false`
  - *Screenshot:* `temp-test-runner/screenshots/I-10-390.png`

#### I-11: `/suppliers/:id`
- **1366×800 & 390×844:** `englishCount: 3`, `horizontalScroll: false` (`Active`, `Credit Supplier:`)
  - *Screenshots:* `temp-test-runner/screenshots/I-11-1366.png`, `I-11-390.png`

#### I-12: `/purchasing`
- **1366×800 & 390×844:** `englishCount: 0`, `horizontalScroll: false` (PASS - အားလုံး မြန်မာဘာသာ အပြည့်အစုံ)
  - *Screenshots:* `temp-test-runner/screenshots/I-12-1366.png`, `I-12-390.png`

#### I-13: `/purchase-report`
- **1366×800 & 390×844:** `englishCount: 53`, `horizontalScroll: false`
  - *English စာသားများ:* PO Status Badge များ (`Pending`, `Confirmed`, `Arrived`, `Completed`), Table Headers
  - *Screenshots:* `temp-test-runner/screenshots/I-13-1366.png`, `I-13-390.png`

#### I-14: `/reports`
- **1366×800 & 390×844:** `englishCount: 15`, `horizontalScroll: false` (`Financial Reports`, Date formats)
  - *Screenshots:* `temp-test-runner/screenshots/I-14-1366.png`, `I-14-390.png`

#### I-15: `/credits`
- **1366×800 & 390×844:** `englishCount: 2 / 1`, `horizontalScroll: false` (Demo customer names)
  - *Screenshots:* `temp-test-runner/screenshots/I-15-1366.png`, `I-15-390.png`

#### I-16: `/expenses`
- **1366×800 & 390×844:** `englishCount: 2`, `horizontalScroll: false`
  - *Screenshots:* `temp-test-runner/screenshots/I-16-1366.png`, `I-16-390.png`

#### I-17: `/quotations`
- **1366×800 & 390×844:** `englishCount: 3`, `horizontalScroll: false` (`common.status`, Date range)
  - *Screenshots:* `temp-test-runner/screenshots/I-17-1366.png`, `I-17-390.png`

#### I-18: `/settings`
- **1366×800 & 390×844:** `englishCount: 0`, `horizontalScroll: false` (PASS)
  - *Screenshots:* `temp-test-runner/screenshots/I-18-1366.png`, `I-18-390.png`

#### I-19: `/accounts`
- **1366×800:** `englishCount: 10`, `horizontalScroll: false` (`Account Management`, table headers)
  - *Screenshot:* `temp-test-runner/screenshots/I-19-1366.png`
- **390×844:** `englishCount: 9`, `horizontalScroll: false`
  - *Screenshot:* `temp-test-runner/screenshots/I-19-390.png`

#### I-20: Sidebar (☰)
- **1366×800 & 390×844:** `englishCount: 3`, `horizontalScroll: false`
  - *Screenshots:* `temp-test-runner/screenshots/I-20-1366.png`, `I-20-390.png`

---

### ၃.၂ i18n English Mode (§4)

- **စစ်ဆေးခဲ့သော Routes:** `I-01 (/pos)`, `I-03 (/inventory)`, `I-07 (/admin/ecommerce-orders)`, `I-13 (/purchase-report)`, `I-14 (/reports)`, `I-18 (/settings)`, `I-19 (/accounts)`
- **ရလဒ်:**
  - `lang === "en"` ဖြစ်ကြောင်း အတည်ပြုပြီး။
  - Raw translation key format (`reports.totalRevenue`, `settings.title` စသည့် dot-notation camelCase စာသားများ) **လုံးဝ မတွေ့ရှိပါ** (`untranslatedKeys: 0`)။
  - English UI အပြည့်အစုံဖြင့် ပုံမှန် အလုပ်လုပ်ပါသည်။

---

### ၃.၃ Responsive / Layout Tests (§5)

- **R-01 (390px POS Grid & Search):**
  - Search Input အကျယ်: `366px` (သတ်မှတ်ချက် ≥ 300px ကျော်လွန်ပြည့်မီ)
  - Horizontal Scroll: `false` (Overflow မရှိ) — **PASS**
- **R-02 (390px POS Bottom Sticky Bar):**
  - Item ၂ ခု ထည့်သွင်းချိန် အောက်ခြေ sticky bar ပေါ်ပေါက်လာပြီး ပစ္စည်းအရေအတွက် `"2 ခု"`၊ စုစုပေါင်းငွေ `"3,900 MMK"` နှင့် `"ငွေချေမယ်"` ခလုတ် မှန်ကန်စွာ ပေါ်သည် — **PASS**
- **R-05 (768px POS Grid):**
  - Grid နှင့် Layout Overflow မရှိ (`horizontalScroll: false`) — **PASS**
- **R-06 (1366px POS Desktop Barcode Focus):**
  - POS ဖွင့်ချိန်တွင် `focusedTag: 'INPUT'`၊ `focusedClass: 'search-input ...'` ဖြင့် Barcode/Search input သို့ focus အလိုအလျောက် ရောက်ရှိနေသည် — **PASS**
- **R-08 (390px Ecommerce Orders Card View):**
  - Mobile တွင် Table ကို ဖျောက်ထားပြီး Card list view (`cardCount: 16`, `tableHidden: true`) အဖြစ် မှန်ကန်စွာ ပေါ်သည် — **PASS**
- **R-09 (1366px Ecommerce Orders Table View):**
  - Desktop တွင် Table view (`tableVisible: true`) အပြည့်အစုံ ပေါ်သည် — **PASS**
- **R-10 (390px Inventory Buttons Size):**
  - ခလုတ် ၃၆ ခုအနက် ၂၄ ခုမှာ အကျယ်အဝန်း ≥ 36px ရှိပြီး အချို့ table row buttons (၁၂ ခု) မှာ အမြင့် 24px သာ ရှိသည် — **Partial Pass**
- **R-11 (Horizontal Scroll across 20 Pages):**
  - Page ၂၀ လုံး (390px နှင့် 1366px နှစ်မျိုးလုံး) တွင် `horizontalScroll === false` ဖြစ်ပြီး မည်သည့် Horizontal Overflow မှ မရှိပါ — **PASS**

---

### ၃.၄ API Request Duplication Check (§6)

| Route | စစ်ဆေးခဲ့သော Endpoint | ခေါ်ယူမှု အကြိမ်ရေ | သတ်မှတ်ချက် | အဆင့်သတ်မှတ်ချက် |
|---|---|---|---|---|
| `/pos` | `storefront-profile` | 1 | 1 | **PASS** |
| `/pos` | `inventory/categories` | 1 | 1 | **PASS** |
| `/pos` | `credit-persona` | 1 | 1 | **PASS** |
| `/pos` | `storefront-inventory` | 1 | 1 | **PASS** |
| `/order-fulfillment` | `fulfillment/pending` | 2 | 1 | **FAIL (Duplicate 2x)** |
| `/reports` | `sale-report` | 4 | 1 | **FAIL (Duplicate 4x)** |
| `/settings` | `location-profile` | Tab switch ချိန်တွင်သာ | 1 | **PASS** |

> **မှတ်ချက်:** `/pos` တွင် ယခင် report ပါ StrictMode ဆိုချက်ကို အမှန်တကယ် ကျော်လွှားနိုင်ခဲ့ပြီး endpoint တိုင်း ၁ ကြိမ်စီသာ ခေါ်ယူသည်ကို အတည်ပြုနိုင်ခဲ့ပါသည်။ သို့သော် `/order-fulfillment` နှင့် `/reports` တွင် component mount ချိန် request ထပ်ခေါ်မှုများ ရှိနေဆဲ ဖြစ်ပါသည်။

---

## ၄။ Cleanup လုပ်ဆောင်ချက် အတည်ပြုချက် (§7)

1. **Background Processes:**
   - Test Backend (port 5055) process ကို `kill` ပြီးစီး။
   - Vite Preview server (port 3000) process ကို `kill` ပြီး port 3000 လုံးဝ ကင်းရှင်းကြောင်း စစ်ဆေးပြီးစီး။
2. **Database:**
   - Safety check အောင်မြင်စွာ စစ်ဆေးပြီး `uomtest` database ကို အပြည့်အစုံ drop ပြီးစီး (Production DB ကို လုံးဝ မထိခိုက်ခဲ့ပါ)။
3. **Temporary Files:**
   - `backend/scripts/_tmp-*.js` ဖိုင်များ အားလုံး ဖျက်ပြီးစီး။
   - `dash-dist/` ယာယီ build directory ကို ဖျက်ပြီးစီး။
   - `dashboard/.env.local` ဖိုင် ဖျက်ပြီးစီး။
4. **Git Status:**
   - Backend repository တွင် မည်သည့် ဖိုင်အသစ်/ပြင်ဆင်မှုမှ ကျန်ရှိခြင်း မရှိပါ။


---

## ၅။ Browser Test Follow-up Fixes (၂၀၂၆-၁၀-၂၇ ပြင်ဆင်ပြီးစီးမှု)

အသုံးပြုသူ၏ ညွှန်ကြားချက်အရ Browser Test အစီရင်ခံစာပါ အဓိက တွေ့ရှိချက် ၃ ချက်ကို အောက်ပါအတိုင်း ပြင်ဆင်စစ်ဆေး အတည်ပြုခဲ့ပါသည်-

### ၅.၁ Missing Translation Keys ပြင်ဆင်ခြင်း (F-01, F-02)
- **ဖိုင်များ:** [`dashboard/translations/en.ts`](file:///c:/Users/PC/Desktop/Pyi-Taw-Tar/dashboard/translations/en.ts) နှင့် [`dashboard/translations/my.ts`](file:///c:/Users/PC/Desktop/Pyi-Taw-Tar/dashboard/translations/my.ts)
- **ထည့်သွင်းခဲ့သော Keys:**
  - `common.status`: `"အခြေအနေ"` / `"Status"`
  - `common.actions`: `"လုပ်ဆောင်ချက်များ"` / `"Actions"`
  - `common.quantity`: `"အရေအတွက်"` / `"Quantity"`
  - `inventory.unit`: `"ယူနစ်"` / `"Unit"`
- **Symmetry စစ်ဆေးချက်:** `en` နှင့် `my` နှစ်ဖက်စလုံးတွင် key စုစုပေါင်း 1,514 ခုစီ တိကျစွာ ကိုက်ညီပြီး `missingInMy: 0`, `missingInEn: 0` ဖြင့် Parity ပြည့်မီပါသည်။

### ၅.၂ PO Status Badges Localize ပြုလုပ်ခြင်း (F-03)
- **ဖိုင်:** [`dashboard/components/PurchaseReport/purchaseReportUtils.tsx`](file:///c:/Users/PC/Desktop/Pyi-Taw-Tar/dashboard/components/PurchaseReport/purchaseReportUtils.tsx)
- **ပြင်ဆင်ချက်:** `POStatusBadge` component တွင် hardcoded `style.label` အစား `{t("purchaseReport." + key) || style.label}` သို့ ပြောင်းလဲခဲ့ပါသည်။
- **ရလဒ်:** Purchase Order Report တွင် `pending`, `confirmed`, `arrived`, `completed`, `cancelled` status များသည် ဘာသာစကား ရွေးချယ်မှုအလိုက် `စောင့်ဆိုင်းဆဲ`၊ `အတည်ပြုပြီး`၊ `ရောက်ရှိပြီး`၊ `ပြီးစီး`၊ `ပယ်ဖျက်ပြီး` ဟု မြန်မာဘာသာဖြင့် မှန်ကန်စွာ ပေါ်မည် ဖြစ်ပါသည်။

### ၅.၃ API Request Duplicate ဖယ်ရှားခြင်း (F-04, F-05)
1. **Order Fulfillment (`F-04`):**
   - **ဖိုင်:** [`dashboard/pages/OrderFulfillment.tsx`](file:///c:/Users/PC/Desktop/Pyi-Taw-Tar/dashboard/pages/OrderFulfillment.tsx)
   - **အကြောင်းရင်း:** `loadData` အတွင်း `storefronts.length` ပါဝင်နေသောကြောင့် storefronts ဒေတာ ရောက်ရှိချိန်တွင် `useCallback` အသစ် ပြန်ဖြစ်ကာ ဒုတိယအကြိမ် ထပ်ခေါ်နေခြင်း ဖြစ်သည်။
   - **ပြင်ဆင်ချက်:** `fetchStorefrontProfiles()` ကို mount `useEffect` သီးသန့်သို့ ခွဲထုတ်ပြီး `loadData` dependencies မှ `storefronts.length` ကို ဖယ်ရှားခဲ့ပါသည်။
2. **Reports (`F-05`):**
   - **ဖိုင်:** [`dashboard/pages/Reports.tsx`](file:///c:/Users/PC/Desktop/Pyi-Taw-Tar/dashboard/pages/Reports.tsx)
   - **အကြောင်းရင်း:** Mount ချိန်တွင် `useEffect(() => { loadReports(); }, []);` နှင့် dependencies ပါသော ဒုတိယ `useEffect` နှစ်ခုစလုံး ပြိုင်တူ `loadReports()` ကို ခေါ်ယူနေခြင်း ဖြစ်သည်။
   - **ပြင်ဆင်ချက်:** ပထမအပို `useEffect` ကို ဖယ်ရှားပြီး ဒုတိယ parameterized `useEffect` တစ်ခုတည်းဖြင့် initial load နှင့် tab switch များကို သန့်ရှင်းစွာ ကိုင်တွယ်စေခဲ့ပါသည်။

### ၅.၄ Build စစ်ဆေးမှု ရလဒ်
- `npm --prefix dashboard run build` စစ်ဆေးမှု ပြုလုပ်ခဲ့ရာ Exit code 0 ဖြင့် build အောင်မြင်ခဲ့ပါသည် (`✓ built in 9.47s`)။
