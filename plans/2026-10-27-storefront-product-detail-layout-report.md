# ဆိုင်ခန်း ကုန်ပစ္စည်းအသေးစိတ် Page Layout ပြန်လည်ဒီဇိုင်းဆွဲခြင်း အစီရင်ခံစာ (Report)

- **ရက်စွဲ:** 2026-10-28
- **Page:** `/storefront/:storeId/product/:productId` → `dashboard/pages/StorefrontProductDetail.tsx`
- **မူရင်း Plan:** [`dashboard/plans/2026-10-27-storefront-product-detail-layout-plan.md`](./2026-10-27-storefront-product-detail-layout-plan.md)
- **စစ်ဆေးမှု ရလဒ်:** အားလုံး အောင်မြင်စွာ စစ်ဆေးပြီးစီး (Pass: 7/7)

---

## ၁။ ပြင်ဆင်/ဖန်တီးခဲ့သည့် ဖိုင်စာရင်း

| # | ဖိုင်လမ်းကြောင်း | အမျိုးအစား | ဖော်ပြချက် |
|---|---|---|---|
| 1 | `dashboard/pages/StorefrontProductDetail.tsx` | ပြင်ဆင် | Layout အသစ် ပြင်ဆင်ခြင်း၊ bug 9 ပြင်ဆင်ခြင်း၊ console.log များ ဖယ်ရှားခြင်း၊ English စာသားများကို i18n သို့ ပြောင်းလဲခြင်း |
| 2 | `dashboard/components/Storefront/UnitPriceStockTable.tsx` | ဖန်တီး (အသစ်) | "Unit အလိုက် ဈေးနှင့် လက်ကျန်" Desktop ဇယား နှင့် ဖုန်း (< md) row card component |
| 3 | `dashboard/utils/uom.ts` | ပြင်ဆင် | `breakdownQuantity(baseQty, baseUnit, conversions)` helper ထည့်သွင်းခြင်း |
| 4 | `dashboard/translations/my.ts` | ပြင်ဆင် | `storefrontProduct.*` key (၅၀ ခု) မြန်မာဘာသာပြန် ဖြည့်သွင်းခြင်း |
| 5 | `dashboard/translations/en.ts` | ပြင်ဆင် | `storefrontProduct.*` key (၅၀ ခု) အင်္ဂလိပ်ဘာသာပြန် ဖြည့်သွင်းခြင်း |

---

## ၂။ `npm run build` Output

```text
> pyitawtar-pos@0.0.0 build
> vite build

vite v6.4.1 building for production...
transforming...
✓ 3793 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     4.42 kB │ gzip:   1.45 kB
dist/assets/index-hsh9VnWV.css      9.35 kB │ gzip:   2.56 kB
dist/assets/index-D592dptT.js   2,530.66 kB │ gzip: 605.29 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 9.39s
```

*(Build error 0 ဖြစ်ပြီး 9.39s ဖြင့် အောင်မြင်စွာ တည်ဆောက်ပြီးစီးပါသည်။ Single bundle ကြောင့် Rollup chunk size warning 1 ခု ရှိပါသည်)*

---

## ၃။ Translation Parity Output

```text
missingInMy 0 missingInEn 0
dashboard/translations/en.ts duplicateKeys 0
dashboard/translations/my.ts duplicateKeys 0
```

`en.ts` နှင့် `my.ts` ကြား ကွာဟချက်မရှိ (0 / 0) ဖြစ်ပြီး Duplicate key မရှိပါ။

---

## ၄။ Plan §5 စစ်ဆေးမှု ရလဒ်များ (Test Results)

Test DB (`uomtest`) တွင် seed data များထည့်သွင်း၍ Chrome Puppeteer ဖြင့် စစ်ဆေးခဲ့သော ရလဒ်များ ဖြစ်ပါသည် -

| Test ID | စစ်ဆေးချက် | ရလဒ် | အထောက်အထား (Evidence) |
|---|---|---|---|
| **T-01** | **Product 1 (FH008, လက်ကျန် 0 ဘူး) — 1366px**<br>- `● ပစ္စည်းပြတ်` badge အနီ<br>- လက်ကျန် `0 ဘူး`<br>- breakdown မပြ<br>- Unit ဇယား (ဘူး: 9,000 / 1,000 / 0, ပုံး: 90,000 / 10,000 / 0, ဖာ: 1,080,000 / 120,000 / 0)<br>- ဝယ်ဈေး (Owner) ပေါ်ခြင်း<br>- Action buttons (Stock ထည့်/နုတ်/လွှဲ) ပေါ်ခြင်း | **PASS** | `hasOutOfStockBadge: true`<br>`hasZeroQty: true`<br>`hasTable: true`<br>`hasBuyingPrice: true`<br>Screenshot: `temp-test-runner/screenshots/storefront-p1-stock0-1366.png` |
| **T-01-M** | **Product 1 (FH008, လက်ကျန် 0 ဘူး) — 390px (Mobile)**<br>- Horizontal scroll မရှိခြင်း (`scrollWidth <= clientWidth`)<br>- Action buttons card ထဲတွင် အဆင်ပြေစွာ ပေါ်ခြင်း | **PASS** | `horizontalScrollOk: true`<br>Screenshot: `temp-test-runner/screenshots/storefront-p1-stock0-390.png` |
| **T-02** | **Product 3 (ALF001, လက်ကျန် 135 ဘူး) — 1366px**<br>- `● ပစ္စည်းရှိသည်` badge အစိမ်း<br>- လက်ကျန် `135 ဘူး`<br>- Breakdown `= 1 ဖာ 1 ပုံး 5 ဘူး` ပေါ်ခြင်း<br>- ဇယားတွင် လက်ကျန် 135 / 13.5 / 1.1 ပေါ်ခြင်း<br>- Ecommerce Limit (အများဆုံး 5 ပုံး / 7 ရက်) ပေါ်ခြင်း | **PASS** | `hasInStockBadge: true`<br>`has135Qty: true`<br>`hasBreakdown: true` (`1 ဖာ 1 ပုံး 5 ဘူး`)<br>`hasLimitInfo: true`<br>Screenshot: `temp-test-runner/screenshots/storefront-p3-stock135-1366.png` |
| **T-02-M** | **Product 3 (ALF001, လက်ကျန် 135 ဘူး) — 390px (Mobile)**<br>- ဖုန်းမျက်နှာပြင်တွင် စာသားများ မပြတ်ဘဲ သပ်ရပ်စွာ ပေါ်ခြင်း | **PASS** | Screenshot: `temp-test-runner/screenshots/storefront-p3-stock135-390.png` |
| **T-03** | **Bug 9 ပြင်ဆင်ချက် (Code ဆင်တူ FH008 vs FH0080)**<br>- FH008 page တွင် FH008 ၏ stock 0 သာ ပြခြင်း (FH0080 ၏ stock 50 နှင့် မရောထွေး) | **PASS** | `p1Stock: 0`<br>`p2Stock: 50`<br>`p2HasFH0080: true` |
| **T-04** | **Stock ထည့်သွင်းခြင်း (Quick Action Logic)**<br>- FH008 သို့ ၁၀ ပုံး (100 ဘူး) ထည့်သွင်းခြင်း<br>- လက်ကျန် `100 ဘူး` သို့ ပြောင်းလဲသွားပြီး `● ပစ္စည်းရှိသည်` badge သို့ ပြောင်းသွားခြင်း | **PASS** | `textIncludes100: true`<br>`hasInStockBadge: true` |
| **T-05** | **Admin Role စစ်ဆေးချက်**<br>- Admin အကောင့်ဖြင့် ဝင်ရောက်ချိန် ဝယ်ဈေး (Buying Price) column လုံးဝ မပေါ်ခြင်း<br>- Stock ထည့်/နုတ်/လွှဲ ခလုတ်များ မပေါ်ခြင်း<br>- Ecommerce limit ပြင်ဆင်/ဖယ်ရှား ခလုတ်များ မပေါ်ခြင်း | **PASS** | `buyingPriceHidden: true`<br>`addStockHidden: true`<br>`limitActionsHidden: true` |
| **T-06** | **i18n & Console Warnings**<br>- Console ထဲတွင် Translation Missing warning 0 ခု | **PASS** | `warningsCount: 0` |

---

## ၅။ Screenshots

- **လက်ကျန် 0 ဘူး (FH008):**
  - Desktop (1366px): `temp-test-runner/screenshots/storefront-p1-stock0-1366.png`
  - Mobile (390px): `temp-test-runner/screenshots/storefront-p1-stock0-390.png`
- **လက်ကျန် 135 ဘူး (ALF001):**
  - Desktop (1366px): `temp-test-runner/screenshots/storefront-p3-stock135-1366.png`
  - Mobile (390px): `temp-test-runner/screenshots/storefront-p3-stock135-390.png`

---

## ၆။ Cleanup ရလဒ်များ

1. **Test Backend & Preview Server:**
   - Background processes (Tasks 6963, 6983) အားလုံးကို ရပ်တန့်ခဲ့ပြီး ဖြစ်ပါသည်။
2. **Test Database Drop:**
   - Connection name `uomtest` ဖြစ်ကြောင်း စစ်ဆေးအတည်ပြုပြီးမှ `uomtest` Database ကို အပြီးသတ် drop ခဲ့ပါသည်။
   - Output: `Verified database name: uomtest`, `Database uomtest dropped successfully.`
3. **ယာယီဖိုင်များ ရှင်းလင်းမှု:**
   - `backend/scripts/_tmp-seed-storefront.js` (ဖျက်ပြီး)
   - `backend/scripts/_tmp-run-test-backend.js` (ဖျက်ပြီး)
   - `backend/scripts/_tmp-drop-uomtest.js` (ဖျက်ပြီး)
   - `temp-test-runner/test-storefront-detail.js` (ဖျက်ပြီး)
   - `temp-test-runner/dash-dist` (ဖျက်ပြီး)
4. **Git Status စစ်ဆေးမှု:**
   - Backend: Clean (`git -C backend status --short` -> 0 output)
   - Dashboard: ပြင်ဆင်ခဲ့သည့် ဖိုင် ၄ ခုနှင့် component အသစ် ၁ ခုသာ ရှိပါသည်။

---

## ၇။ သုံးသပ်ချက်နှင့် ကွဲလွဲချက်မှတ်တမ်း

- **ဝယ်ဈေး (Buying Price) ပြသခွင့်:** User ၏ ညွှန်ကြားချက်အရ Owner သာ မြင်တွေ့ခွင့်ရှိစေရန် (`isOwner = userRole === "owner"`) သတ်မှတ်ပေးခဲ့ပြီး Admin/Staff များ ဝင်ရောက်ကြည့်ရှုပါက ဝယ်ဈေးကော်လံ လုံးဝ မပေါ်ပါ။
- အခြား Plan ပါ အချက်အလက်များ အားလုံးနှင့် ၁၀၀% တိကျစွာ ကိုက်ညီအောင် ဆောင်ရွက်ပြီးစီးခဲ့ပါသည်။
