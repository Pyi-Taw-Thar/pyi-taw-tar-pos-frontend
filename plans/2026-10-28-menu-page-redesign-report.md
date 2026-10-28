# Menu Page (`/menu`) UI / Layout ပြန်ဒီဇိုင်း အစီရင်ခံစာ (Report)

- **ရက်စွဲ:** 2026-10-28
- **Page:** `/menu` → `dashboard/pages/Menu.tsx`
- **မူရင်း Plan:** [`dashboard/plans/2026-10-28-menu-page-redesign-plan.md`](./2026-10-28-menu-page-redesign-plan.md)
- **စစ်ဆေးမှု ရလဒ်:** အားလုံး အောင်မြင်စွာ စစ်ဆေးပြီးစီး (Pass: 8/8)

---

## ၁။ ပြင်ဆင်/ဖန်တီးခဲ့သည့် ဖိုင်စာရင်း

| # | ဖိုင်လမ်းကြောင်း | အမျိုးအစား | ဖော်ပြချက် |
|---|---|---|---|
| 1 | `dashboard/pages/Menu.tsx` | ပြင်ဆင် | ဇုန် ၂ ခု layout ("ယနေ့ လုပ်စရာ" WorkQueue တန်း + မြန်မာရက်စွဲ နှင့် Section Panel 3-column grid)၊ `Promise.allSettled` ဖြင့် ခွင့်ပြုထားသော tile များကိုသာ mount တစ်ကြိမ် ခေါ်ခြင်း၊ internal scroll box / greeting / bottom logout ဖယ်ရှားခြင်း |
| 2 | `dashboard/components/Menu/WorkQueue.tsx` | ဖန်တီး (အသစ်) | "ယနေ့ လုပ်စရာ" tile ၄ ခု (loading skeleton, `0` muted + "မရှိ", `> 0` amber `#FFFBEB` / `#B45309`, API error `"—"`)၊ `motion-safe:` fade-in |
| 3 | `dashboard/components/Menu/MenuPanel.tsx` | ဖန်တီး (အသစ်) | Section panel နှင့် row list (`min-h-[56px]`, 15px semibold title, 13px `slate-600` description, `leading-[1.6]`, `ChevronRight`, keyboard focus ring) |
| 4 | `dashboard/config/menuConfig.ts` | ပြင်ဆင် | `MenuItem.badge` ကို ဖယ်ရှားပြီး `WORK_QUEUE` config နှင့် `canSeeWorkQueueItem` helper ထည့်သွင်းခြင်း |
| 5 | `dashboard/translations/my.ts` | ပြင်ဆင် | `menu.workQueue.*` မြန်မာဘာသာပြန် key (၁၄ ခု) ထည့်သွင်းခြင်း |
| 6 | `dashboard/translations/en.ts` | ပြင်ဆင် | `menu.workQueue.*` အင်္ဂလိပ်ဘာသာပြန် key (၁၄ ခု) ထည့်သွင်းခြင်း |
| 7 | `dashboard/App.tsx` | ပြင်ဆင် | `/menu` အတွက် scroll ပိတ်ထားသော `h-screen max-h-screen overflow-hidden` class များကို ဖယ်ရှား၍ browser scroll ပြန်ဖွင့်ခြင်း (header ၏ `isMenuPage` ကို မထိပါ) |

---

## ၂။ `npm run build` Output

```text
> pyitawtar-pos@0.0.0 build
> vite build

vite v6.4.1 building for production...
transforming...
✓ 3795 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     4.42 kB │ gzip:   1.45 kB
dist/assets/index-hsh9VnWV.css      9.35 kB │ gzip:   2.56 kB
dist/assets/index-D2D5CWB7.js   2,535.68 kB │ gzip: 606.82 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 32.45s
```

---

## ၃။ Translation Parity Output

```text
missingInMy 0 missingInEn 0
dashboard/translations/en.ts duplicateKeys 0
dashboard/translations/my.ts duplicateKeys 0
```

`en.ts` နှင့် `my.ts` ကြား ကွာဟချက် `0 / 0` ဖြစ်ပြီး Duplicate key `0` ဖြစ်ပါသည်။

---

## ၄။ Plan §5 စစ်ဆေးမှု ရလဒ်များ (Browser Test Results)

Test ကို `uomtest` DB (pending ecommerce 2, fulfillment 0, pending PO 1, ecommerce ဆိုင်တွင် quantity 0 product 3) + test backend (`port 5055`) + `vite preview` (`port 3000`) ဖြင့် စစ်ဆေးခဲ့ပါသည်။

| # | စစ်ဆေးချက် | ရလဒ် | အထောက်အထား (Evidence) |
|---|---|---|---|
| 1 | **Work Queue (Owner, မြန်မာ)** — pending ecommerce 2, fulfillment 0, pending PO 1, out-of-stock 3 | **PASS** | Header: `"ယနေ့ လုပ်စရာ"` + `"ဗုဒ္ဓဟူး၊ ၂၈ အောက်တိုဘာ ၂၀၂၆"`။ Tile 1: `"2 \| အော်ဒါ အတည်ပြုရန် \| 2 ခု စောင့်နေ"` (`bg: rgb(255, 251, 235)` amber), Tile 2: `"0 \| ထုပ်ပိုးရန် \| ထုပ်ပိုးရန် မရှိ"` (`bg: rgb(255, 255, 255)` muted), Tile 3: `"1 \| PO ပစ္စည်းရောက်ရန် \| 1 ခု"` (`bg: rgb(255, 251, 235)` amber), Tile 4: `"3 \| ပစ္စည်းပြတ် (အွန်လိုင်းဆိုင်) \| ပစ္စည်း 3 မျိုး"` (`bg: rgb(255, 251, 235)` amber)။ Greeting (`hasGreeting: false`) နှင့် bottom logout လုံးဝ မရှိတော့ပါ။ |
| 2 | **Responsive Viewports (390 / 768 / 1366 / 1846px)** နှင့် Internal Scrollbar မရှိခြင်း | **PASS** | `390px`: `wqCols: 2`, `panelCols: 1`, `minRowHeight: 69px (>= 56px)`, `horizontalOverflow: false`, `internalScrollBoxes: []`။<br>`768px`: `wqCols: 2`, `panelCols: 2`, `horizontalOverflow: false`, `internalScrollBoxes: []`။<br>`1366px` & `1846px`: `wqCols: 4`, `panelCols: 3` (ညာဘက် 4th column ဗလာ မရှိတော့ပါ), `panelCount: 5`, `rowCount: 14`, `horizontalOverflow: false`, `internalScrollBoxes: []`။ |
| 3 | **Tile / Row နှိပ်လျှင် မှန်ကန်သော Page သို့ ရောက်ခြင်း** | **PASS** | `/admin/ecommerce-orders` (`pass: true`), `/order-fulfillment` (`pass: true`), `/purchasing` (`pass: true`), `/storefront` (`pass: true`), `/inventory` (`pass: true`) အားလုံး မှန်ကန်စွာ ပွင့်ပါသည်။ |
| 4 | **Role စစ်ဆေးချက် (`admin` နှင့် `cashier`)** | **PASS** | `admin`: `"အကောင့်စီမံခန့်ခွဲမှု"` (`/accounts`) row မပေါ်ပါ (`hasAccountsRow: false`)။<br>`cashier`: WorkQueue တွင် ခွင့်ရှိသော tile ၂ ခုသာ (`/order-fulfillment`, `/storefront`) ပေါ်ပြီး ခွင့်မရှိသော `/ecommerce/admin/orders` နှင့် `/purchase` API များကို လုံးဝ မခေါ်ပါ (`apiCalls: ["/location-profile", "/fulfillment/pending?page=1&limit=1", "/ecommerce/products"]`)။ Panel တွင်လည်း ခွင့်ရှိသော row ၆ ခုသာ ပေါ်ပါသည်။ |
| 5 | **API Error State (Backend ပိတ်/Fail ချိန်)** | **PASS** | API အားလုံး abort လုပ်ချိန်တွင် tile ၄ ခုလုံး မပျောက်ဘဲ `"— \| အော်ဒါ အတည်ပြုရန် \| —"`, `"— \| ထုပ်ပိုးရန် \| —"`, `"— \| PO ပစ္စည်းရောက်ရန် \| —"`, `"— \| ပစ္စည်းပြတ် (အွန်လိုင်းဆိုင်) \| —"` အဖြစ် ပြသပြီး error toast မတက်ပါ (`toastCount: 0`)။ |
| 6 | **Keyboard Tab Focus Ring** | **PASS** | Tile နှင့် Row တိုင်းကို `Tab` နှိပ်သွားချိန်တွင် `boxShadow: "... rgb(76, 175, 80) 0px 0px 0px 2px ..."` (`hasRing: true`) မြင်ရပါသည်။ |
| 7 | **ဘာသာစကား ပြောင်းလဲမှု (မြန်မာ ⇄ English)** | **PASS** | English mode တွင် `html[lang="en"]`, `"Today's Tasks"`, `"Wed, October 28, 2026"`, `"2 \| Orders to Confirm \| 2 waiting"`, `"0 \| To Pack & Fulfill \| Nothing to pack"`, `"1 \| PO Awaiting Delivery \| 1 pending"`, `"3 \| Out of Stock (Online) \| 3 products"` နှင့် Panel ခေါင်းစဉ် ၅ ခုလုံး မှန်ကန်စွာ ပြောင်းလဲပါသည်။ |
| 8 | **Screenshots (390px နှင့် 1846px)** | **PASS** | - 390px: `C:\Users\PC\.gemini\antigravity\brain\200af19d-58ae-41b6-8043-74881f81656e\menu-390.png`<br>- 1846px: `C:\Users\PC\.gemini\antigravity\brain\200af19d-58ae-41b6-8043-74881f81656e\menu-1846.png` |

---

## ၅။ Cleanup အတည်ပြုချက်

- Test backend server (`port 5055`) နှင့် `vite preview` server (`port 3000`) တို့ကို ရပ်တန့်ပြီး ဖြစ်ပါသည်။
- `uomtest` database ကို `mongoose.connection.name === "uomtest"` စစ်ဆေးပြီး `dropDatabase()` ဖြင့် ဖျက်သိမ်းပြီး ဖြစ်ပါသည် (`dropped: uomtest`)။ Production DB ကို လုံးဝ မထိပါ။
- ယာယီဖန်တီးခဲ့သော `_tmp-seed-dash.js`, `_tmp-start-test-server.js`, `_tmp-test-menu-redesign.mjs` နှင့် `temp-test-runner/` တို့ကို အပြီးအပိုင် ဖျက်သိမ်းပြီး ဖြစ်ပါသည်။
