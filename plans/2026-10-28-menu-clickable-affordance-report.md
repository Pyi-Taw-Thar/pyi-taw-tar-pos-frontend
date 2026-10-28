# Menu Page (`/menu`) — Clickable Affordance ပြင်ဆင်မှု အစီရင်ခံစာ (Report)

- **ရက်စွဲ:** 2026-10-28
- **Page:** `/menu` → `dashboard/components/Menu/WorkQueue.tsx`, `dashboard/components/Menu/MenuPanel.tsx`
- **မူရင်း Plan:** [`dashboard/plans/2026-10-28-menu-clickable-affordance-plan.md`](./2026-10-28-menu-clickable-affordance-plan.md)
- **စစ်ဆေးမှု ရလဒ်:** အားလုံး အောင်မြင်စွာ စစ်ဆေးပြီးစီး (Pass: 7/7)

---

## ၁။ ပြင်ဆင်ခဲ့သည့် ဖိုင်စာရင်း

| # | ဖိုင်လမ်းကြောင်း | အမျိုးအစား | ဖော်ပြချက် |
|---|---|---|---|
| 1 | `dashboard/config/menuConfig.ts` | ပြင်ဆင် | `WorkQueueItemConfig` နှင့် `WORK_QUEUE` item ၄ ခုတွင် `actionKey` (`menu.workQueue.*Action`) ထည့်သွင်းခြင်း |
| 2 | `dashboard/components/Menu/WorkQueue.tsx` | ပြင်ဆင် | Plan §2.1 အတိုင်း tile အောက်ခြေတွင် `<span>` လုပ်ဆောင်ချက်ခလုတ် (`min-h-[36px]`, `ChevronRight`)၊ `count > 0` အစိမ်း border/စာ (`border-primary/40 text-primary`)၊ `count = 0` မှိန်ပုံစံ (`border-slate-200 text-slate-500`)၊ `group-hover:`/`group-focus-visible:` အစိမ်းပြည့် state၊ `active:scale-[0.98] motion-reduce:active:scale-100` နှင့် `aria-label` (`"{ခေါင်းစဉ်} — {count စာ}။ {ခလုတ်စာ}"`) ထည့်သွင်းခြင်း |
| 3 | `dashboard/components/Menu/MenuPanel.tsx` | ပြင်ဆင် | Plan §2.2 အတိုင်း panel background ကို `bg-slate-50 p-3` သို့ ပြောင်းလဲခြင်း၊ row တစ်ခုစီကို `space-y-2` ဖြင့် ခြားထားသော အဖြူရောင် rounded box (`bg-white rounded-lg border border-slate-200 min-h-[60px] shadow-sm`) အဖြစ် ပြောင်းလဲခြင်း၊ ညာဘက်တွင် 32px အဝိုင်း (`w-8 h-8 rounded-full bg-slate-100`) ထဲ `ChevronRight` ထည့်သွင်းခြင်း၊ hover/focus နှင့် `active:scale-[0.99] motion-reduce:active:scale-100` ထည့်သွင်းခြင်း |
| 4 | `dashboard/translations/my.ts` | ပြင်ဆင် | `menu.workQueue.*Action` ၄ ခု (`"အော်ဒါ စစ်မယ်"`, `"ထုပ်ပိုးမယ်"`, `"PO ကြည့်မယ်"`, `"ပစ္စည်း ကြည့်မယ်"`)၊ `poAwaitingActive` (`"{n} ခု စောင့်နေ"`) နှင့် `sidebar.orderFulfillment` (`"အော်ဒါ ထုပ်ပိုးစစ်ဆေးခြင်း"`) ပြင်ဆင်ခြင်း |
| 5 | `dashboard/translations/en.ts` | ပြင်ဆင် | `menu.workQueue.*Action` ၄ ခု (`"Review orders"`, `"Start packing"`, `"View POs"`, `"View products"`) နှင့် `poAwaitingActive` (`"{n} waiting"`) ထည့်သွင်းခြင်း |

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
dist/assets/index-CjqpiRzE.js   2,537.61 kB │ gzip: 607.19 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 9.98s
```

*(Build error 0 ဖြစ်ပြီး 9.98s ဖြင့် တည်ဆောက်ပြီးစီးပါသည်။ Single bundle ကြောင့် Rollup chunk size > 500 kB warning 1 ခု ရှိပါသည်)*

---

## ၃။ Translation Parity Output

```text
missingInMy 0 missingInEn 0
dashboard/translations/en.ts duplicateKeys 0
dashboard/translations/my.ts duplicateKeys 0
```

`en.ts` နှင့် `my.ts` ကြား ကွာဟချက် `0 / 0` ဖြစ်ပြီး Duplicate key `0` ဖြစ်ပါသည်။

---

## ၄။ Plan §4 စစ်ဆေးမှု ရလဒ်များ (Browser Test Results)

Test ကို `uomtest` DB (pending ecommerce 2, fulfillment 0, pending PO 1, ecommerce ဆိုင်တွင် quantity 0 product 3) + test backend (`port 5055`) + `vite preview` (`port 3000`) ဖြင့် စစ်ဆေးခဲ့ပါသည်။

| # | စစ်ဆေးချက် | ရလဒ် | အထောက်အထား (JS Output / Evidence) |
|---|---|---|---|
| 1 | **Hover မလုပ်ဘဲ (Idle State) Tile ခလုတ် ၄ ခု နှင့် `aria-label` စစ်ဆေးချက်** | **PASS** | Tile ၄ ခုလုံးတွင် `<Link>` အတွင်း nested `<a/button>` မရှိဘဲ (`nestedInteractive: 0`) `<span>` ခလုတ် (`btnHeight: 36px`) ပါဝင်ပါသည် —<br>1. `"အော်ဒါ စစ်မယ်"` (`aria-label: "အော်ဒါ အတည်ပြုရန် — 2 ခု စောင့်နေ။ အော်ဒါ စစ်မယ်"`, `btnColor: rgb(76, 175, 80)`, `btnBorderColor: rgba(76, 175, 80, 0.4)`)<br>2. `"ထုပ်ပိုးမယ်"` (`aria-label: "ထုပ်ပိုးရန် — ထုပ်ပိုးရန် မရှိ။ ထုပ်ပိုးမယ်"`, `count = 0` မှိန်ပုံစံ `btnColor: rgb(100, 116, 139)`, `btnBorderColor: rgb(226, 232, 240)`)<br>3. `"PO ကြည့်မယ်"` (`aria-label: "PO ပစ္စည်းရောက်ရန် — 1 ခု စောင့်နေ။ PO ကြည့်မယ်"`, `btnColor: rgb(76, 175, 80)`)<br>4. `"ပစ္စည်း ကြည့်မယ်"` (`aria-label: "ပစ္စည်းပြတ် (အွန်လိုင်းဆိုင်) — ပစ္စည်း 3 မျိုး။ ပစ္စည်း ကြည့်မယ်"`, `btnColor: rgb(76, 175, 80)`) |
| 2 | **Hover မလုပ်ဘဲ (Idle State) Panel ၅ ခု နှင့် Row Box ၁၄ ခု စစ်ဆေးချက်** | **PASS** | `panelCount: 5`, Panel bg `rgb(248, 250, 252)` (`slate-50`), `padding: 12px` (`p-3`)။<br>`rowCount: 14`, Row တစ်ခုစီ `bg: rgb(255, 255, 255)`, `borderColor: rgb(226, 232, 240)`, `borderRadius: 8px`, `minRowHeight: 71px (>= 60px)`, Row ကြား gap `rowGapPx: 8px` (`space-y-2`)။<br>ညာဘက် Chevron အဝိုင်း: `chevronSize: "32x32"`, `chevronBg: rgb(241, 245, 249)` (`slate-100`), `chevronRadius: "9999px"`။<br>`sidebar.orderFulfillment` စာသား: `"အော်ဒါ ထုပ်ပိုးစစ်ဆေးခြင်း"`။ |
| 3 | **Hover / Tab Focus State (အစိမ်းရောင် ပြောင်းလဲမှု)** | **PASS** | - **Tile Hover / Focus:** `tileBorderColor: "rgb(76, 175, 80)"`, `boxShadow: "... rgb(76, 175, 80) 0px 0px 0px 2px"`, ခလုတ် `btnBg: "rgb(76, 175, 80)"`, `btnColor: "rgb(255, 255, 255)"`။<br>- **Row Hover / Focus:** `borderColor: "rgb(76, 175, 80)"`, `iconBoxBg: "rgb(76, 175, 80)"`, `iconBoxColor: "rgb(255, 255, 255)"`, `titleColor: "rgb(76, 175, 80)"`, `chevronBg: "rgb(76, 175, 80)"`, `chevronColor: "rgb(255, 255, 255)"`။ |
| 4 | **Active Scale Feedback (`active:scale-*` + `motion-reduce:`)** | **PASS** | Tile တွင် `active:scale-[0.98] motion-reduce:active:scale-100` နှင့် Row တွင် `active:scale-[0.99] motion-reduce:active:scale-100` (`hasActiveScale: true`, `hasMotionReduce: true`) ပါဝင်ပါသည်။ |
| 5 | **Tile ခလုတ်ဧရိယာ (`<span>`) နှင့် Row နှိပ်လျှင် မှန်ကန်သော Page သို့ ရောက်ခြင်း** | **PASS** | - Tile 1 action span → `/admin/ecommerce-orders` (`pass: true`)<br>- Tile 2 (`count = 0`) action span → `/order-fulfillment` (`pass: true`)<br>- Tile 3 action span → `/purchasing` (`pass: true`)<br>- Tile 4 action span → `/storefront` (`pass: true`)<br>- Panel row → `/order-fulfillment` (`pass: true`) |
| 6 | **English Mode ဘာသာပြန် စစ်ဆေးချက်** | **PASS** | `"2 \| Orders to Confirm \| 2 waiting \| Review orders"`, `"0 \| To Pack & Fulfill \| Nothing to pack \| Start packing"`, `"1 \| PO Awaiting Delivery \| 1 waiting \| View POs"`, `"3 \| Out of Stock (Online) \| 3 products \| View products"` |
| 7 | **Responsive (390px နှင့် 1366px) Horizontal Scroll မရှိခြင်း** | **PASS** | `390px`: `innerWidth: 390, scrollWidth: 390, horizontalOverflow: false, minRowHeight: 71`။<br>`1366px`: `horizontalOverflow: false, minRowHeight: 71`။ |

---

## ၅။ Screenshots (၄ ပုံ)

1. **1366px — (က) Hover မလုပ်ဘဲ (Idle):**
   `C:\Users\PC\.gemini\antigravity\brain\200af19d-58ae-41b6-8043-74881f81656e\menu-affordance-1366-idle.png`
2. **1366px — (ခ) Tile နှင့် Row ကို Focus/Hover လုပ်ထားချိန်:**
   `C:\Users\PC\.gemini\antigravity\brain\200af19d-58ae-41b6-8043-74881f81656e\menu-affordance-1366-hover.png`
3. **390px — (က) Hover မလုပ်ဘဲ (Idle):**
   `C:\Users\PC\.gemini\antigravity\brain\200af19d-58ae-41b6-8043-74881f81656e\menu-affordance-390-idle.png`
4. **390px — (ခ) Tile နှင့် Row ကို Focus/Hover လုပ်ထားချိန်:**
   `C:\Users\PC\.gemini\antigravity\brain\200af19d-58ae-41b6-8043-74881f81656e\menu-affordance-390-hover.png`

---

## ၆။ Cleanup ရလဒ်

- Test backend server (`port 5055`) နှင့် `vite preview` server (`port 3000`) တို့ကို ရပ်တန့်ပြီး ဖြစ်ပါသည်။
- `uomtest` database ကို `mongoose.connection.name === "uomtest"` စစ်ဆေးပြီးမှ `dropDatabase()` ဖြင့် ဖျက်သိမ်းပြီး ဖြစ်ပါသည် (`dropped: uomtest`)။ Production DB ကို လုံးဝ မထိပါ။
- ယာယီဖန်တီးခဲ့သော `_tmp-seed-dash.js`, `_tmp-start-test-server.js` နှင့် `scratch/` ဖိုဒါတို့ကို အပြီးအပိုင် ဖျက်သိမ်းပြီး ဖြစ်ပါသည်။
- `git -C dashboard status --short`:
  ```text
   M App.tsx
   M config/menuConfig.ts
   M pages/Menu.tsx
   M translations/en.ts
   M translations/my.ts
  ?? components/Menu/
  ?? plans/2026-10-28-menu-clickable-affordance-plan.md
  ?? plans/2026-10-28-menu-clickable-affordance-report.md
  ?? plans/2026-10-28-menu-page-redesign-plan.md
  ?? plans/2026-10-28-menu-page-redesign-report.md
  ```
