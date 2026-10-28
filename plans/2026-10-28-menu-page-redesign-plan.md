# Menu Page UI / Layout ပြန်ဒီဇိုင်း Plan

- **ရက်စွဲ:** 2026-10-28
- **အခြေအနေ:** ⏳ Approval စောင့်ဆိုင်းဆဲ
- **Page:** `/menu` → `dashboard/pages/Menu.tsx` (197 ကြောင်း), `config/menuConfig.ts` (238 ကြောင်း)
- **နောက်ခံ:** User screenshot (owner, 1846px desktop)

---

## ၁. Brief — ဘယ်သူ၊ ဘာအတွက်

- **အသုံးပြုသူ:** ဆေးဆိုင်/ဆေးဖြန့်ချိရေး၏ owner/admin — မနက်တိုင်း dashboard ဖွင့်ပြီး **အွန်လိုင်းအော်ဒါ စစ်ခြင်း → ဂိုဒေါင်ထုပ်ပိုး → စတော့/PO စီမံ** ကို လုပ်
- **Page ၏ အဓိကအလုပ်:** (၁) **ယနေ့ ဘာကိုင်တွယ်ရမလဲ** ကို ချက်ချင်းပြ (၂) လိုတဲ့ page ကို တစ်ချက်နှိပ်ဖြင့် ရောက်
- ယခု page သည် (၂) ကိုသာ လုပ်ပြီး (၁) ကို badge အသေးလေးဖြင့်သာ ပြ — 0 ဆိုလျှင် လုံးဝ မပြ

## ၂. လက်ရှိ ပြဿနာ (screenshot + code)

| # | ပြဿနာ | နေရာ |
|---|---|---|
| 1 | **Card ၁၄ ခု အားလုံး ပုံစံ / အရွယ် / အလေးချိန် တူ** — နေ့တိုင်းသုံး (အီးကော်မတ်အော်ဒါ) နှင့် တစ်လတစ်ခါသုံး (အကောင့်စီမံ) ကို မျက်စိက ခွဲမရ | `Menu.tsx:152-185` |
| 2 | **Grid 4 column, section တစ်ခုလျှင် card ၂-၃ ခုသာ** → ညာဘက် ¼ - ½ အမြဲ ဗလာ (screenshot ၏ ညာဘက် နေရာကြီး) | `lg:grid-cols-4` |
| 3 | **Page ထဲ scroll box သီးသန့်** (`h-full … overflow-hidden` + `overflow-y-auto`) → အစိမ်းရောင် scrollbar ပေါ်, browser scroll မဟုတ်၍ ဖုန်း/trackpad တွင် ရှုပ် | `Menu.tsx:115, 146` |
| 4 | **"လုပ်စရာ" မမြင်ရ** — pending badge သည် icon ဘေး ၂၂px အနီစက်သာ; 0 ဆိုလျှင် ပျောက် → "အော်ဒါ မရှိ" ကိုလည်း မသိရ | `Menu.tsx:168-171` |
| 5 | Card description `text-xs text-slate-500` — မြန်မာစာ သေးလွန်း၍ ဖတ်ရခက် (screenshot) | `Menu.tsx:180` |
| 6 | Greeting "မင်္ဂလာပါ owner / အသုံးပြုလိုသည့် အပိုင်းကို ရွေးချယ်ပါ" — နေရာယူပြီး အချက်အလက် မပေး | `Menu.tsx:117-125` |
| 7 | Section ခေါင်းစဉ် `uppercase tracking-wide` — မြန်မာစာတွင် အကျိုးမရှိ | `Menu.tsx:149` |

---

## ၃. Design plan

### Color (dashboard ရှိပြီးသား theme ကိုသာ — brand အသစ် မထွင်)
| Name | Hex | သုံးမည့်နေရာ |
|---|---|---|
| Ink navy | `#1E2937` | header (ယခုအတိုင်း), ခေါင်းစဉ်, လုပ်စရာ ကိန်း |
| Shop green | `#4CAF50` (`primary`) | icon, link hover, "ကြည့်မယ်" action |
| Paper | `#F8F9FA` | page bg |
| Line | `#E2E8F0` (slate-200) | panel border, row divider |
| Attention amber | `#B45309` / bg `#FFFBEB` | စောင့်ဆိုင်းဆဲ အရေအတွက် > 0 |
| Muted | `#64748B` (slate-500) | description, 0 ဖြစ်သော အခြေအနေ |

### Type
- Inter (ယခုအတိုင်း) + မြန်မာ glyph အတွက် browser ၏ Myanmar font (ယခုအတိုင်း); **မြန်မာစာ line-height ≥ 1.6**
- Scale — 13 (description) / 15 (item title) / 17 (section) / 32 (လုပ်စရာ ကိန်း, `tabular-nums`)
- Description ကို 12px → **13px**, `slate-600` (အလင်းနည်း မြန်မာစာ ဖတ်ရလွယ်ရန်)

### Layout concept — "လုပ်စရာ တန်း + လမ်းညွှန် panel"
Page ကို **ဇုန် ၂ ခု** ခွဲ:
1. **ယနေ့ လုပ်စရာ (work queue)** — page ထိပ်တွင် တန်းတစ်တန်း; အလုပ် ၄ မျိုး၏ အရေအတွက်ကို ဝါကျဖြင့် ပြ, နှိပ်လျှင် ထို page
2. **လမ်းညွှန် (directory)** — section ၅ ခုကို **panel ၅ ခု** (card ၁၄ ခု မဟုတ်); panel တစ်ခုထဲ item များကို **row list** (icon · ခေါင်းစဉ် · description · ›)

```
Desktop (≥ lg)
┌─────────────────────────────────────────────────────────────────────┐
│ ယနေ့ လုပ်စရာ                                   အင်္ဂါ၊ ၂၈ အောက်တိုဘာ ၂၀၂၆ │
│ ┌────────────────┐┌────────────────┐┌────────────────┐┌────────────────┐│
│ │ 3              ││ 1              ││ 0              ││ 5              ││  ← ကိန်း 32px
│ │ အော်ဒါ အတည်ပြုရန် ││ ထုပ်ပိုးရန်       ││ PO ပစ္စည်းရောက်ရန် ││ စတော့ နည်းနေ     ││
│ │ စောင့်နေ        ││ စောင့်နေ        ││ မရှိ            ││ ပစ္စည်း          ││
│ └──amber─────────┘└──amber─────────┘└──muted─────────┘└──amber─────────┘│  ← > 0 = amber bg, 0 = muted
│                                                                     │
│ ┌ အွန်လိုင်း အရောင်း ───────┐ ┌ ကုန်ပစ္စည်း နှင့် စတော့ ──┐ ┌ ဝယ်ယူရေး ─────────┐ │
│ │ 🛍 အီးကော်မတ် အော်ဒါ  ›│ │ 📦 ကုန်ပစ္စည်းစာရင်း  › │ │ 🛍 ဝယ်ယူမှု အော်ဒါ  › │ │
│ │   အော်ဒါ စစ်/ဂိုဒေါင်ပို့ │ │   ဈေး၊ unit         │ │   PO ဖွင့် / GRN    │ │
│ │ ─────────────────── │ │ ───────────────── │ │ ───────────────  │ │
│ │ 📦 Order ထုပ်ပိုး    › │ │ 🚚 ကုန်လှောင်ရုံ      › │ │ 👥 ပစ္စည်းသွင်းသူ   › │ │
│ │ 👥 ဖောက်သည်များ     › │ │ 🏪 ဆိုင်ခန်း          › │ │ 📋 PO အစီရင်ခံစာ   › │ │
│ └───────────────────┘ └──────────────────┘ └─────────────────┘ │
│ ┌ ငွေကြေး နှင့် အစီရင်ခံစာ ┐ ┌ စနစ် ────────────────┐                     │
│ │ 📊 အသုံးစရိတ်       › │ │ 💬 AI လက်ထောက်      › │                     │
│ │ 📈 အစီရင်ခံစာများ    › │ │ 🛡 အကောင့်စီမံ       › │                     │
│ └───────────────────┘ │ ⚙ ဆက်တင်များ        › │                     │
│                       └────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
  panel grid: lg 3 col (section ၅ ခု → 3 + 2), xl တွင်လည်း 3 col (ဗလာ မဖြစ်စေရန်)

ဖုန်း (< md)
┌──────────────────────────┐
│ ယနေ့ လုပ်စရာ               │
│ [3 အော်ဒါ][1 ထုပ်ပိုး]      │  ← 2×2 grid
│ [0 PO   ][5 စတော့နည်း]     │
│ ┌ အွန်လိုင်း အရောင်း ───────┐│
│ │ 🛍 အီးကော်မတ် အော်ဒါ   › ││  ← row အမြင့် ≥ 56px
│ │ …                      ││
│ └────────────────────────┘│
│ (panel များ အောက်သို့ စီ)     │
└──────────────────────────┘
```

| Element | အသေးစိတ် |
|---|---|
| Page | `max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8` — **page ထဲ scroll box ဖယ်** (browser scroll) |
| Work queue tile | `<Link>` — `rounded-xl border p-4 min-h-[104px]`; count > 0: `bg-amber-50 border-amber-200`, ကိန်း `text-[#1E2937]`; count = 0: `bg-white border-slate-200`, ကိန်း `text-slate-400`; loading: ကိန်းနေရာတွင် skeleton bar; error: tile ကို "—" ဖြင့် (tile မပျောက် — layout မခုန်) |
| Work queue grid | `grid grid-cols-2 lg:grid-cols-4 gap-3` |
| Panel | `bg-white rounded-xl border border-slate-200` + panel ခေါင်းစဉ် `px-4 pt-4 pb-2 text-[17px] font-semibold text-slate-800` (uppercase / tracking **ဖယ်**) |
| Row | `<Link>` — `flex items-center gap-3 px-4 py-3 min-h-[56px] border-t border-slate-100 first:border-t-0 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-2 ring-inset ring-primary outline-none`; icon `w-9 h-9 rounded-lg bg-primary/10 text-primary`; title 15px semibold; description 13px slate-600 `line-clamp-1`; ညာ `ChevronRight` slate-400 |
| Panel grid | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start` |
| Greeting | ဖယ် — ခေါင်းစဉ် "ယနေ့ လုပ်စရာ" + ရက်စွဲ (မြန်မာ ဂဏန်း/လ) တစ်တန်းတည်း; user အမည်သည် header ၏ user dropdown တွင် ရှိပြီး |
| Logout | ဖယ် — header user dropdown တွင် ရှိပြီး (ထပ်နေ) |
| Motion | **တစ်ခုသာ** — work queue ကိန်း load ပြီးချိန် fade-in (`motion-safe:` — reduced motion တွင် မပြ); hover lift / card animation မထည့် |

### Work queue — data (ရှိပြီးသား API သာ, backend မပြောင်း)
| Tile | စာ (count > 0 / = 0) | API | Link | Role |
|---|---|---|---|---|
| အော်ဒါ အတည်ပြုရန် | "{n} ခု စောင့်နေ" / "စောင့်နေသော အော်ဒါ မရှိ" | `fetchEcommerceOrders({ status: "pending", page: 1, limit: 1 })` → `pagination.totalItems` (ယခု badge အတိုင်း) | `/admin/ecommerce-orders` | admin, owner |
| ထုပ်ပိုးရန် | "{n} ခု စောင့်နေ" / "ထုပ်ပိုးရန် မရှိ" | `fetchPendingFulfillmentOrders({ page: 1, limit: 1 })` (ယခု badge အတိုင်း) | `/order-fulfillment` | (မကန့်) |
| PO ပစ္စည်းရောက်ရန် | "{n} ခု" / "မရှိ" | `fetchPurchases({ status: "pending", isDeleted: false, page: 1, limit: 1 })` → `pagination.totalItems` (`usePurchasing.ts` ၏ ယခုခေါ်ပုံအတိုင်း — `confirmed` ကို dashboard တွင် မသုံး) | `/purchasing` | admin, owner |
| ပစ္စည်းပြတ် (အွန်လိုင်းဆိုင်) | "ပစ္စည်း {n} မျိုး" / "ပစ္စည်းပြတ် မရှိ" | `axios.get("ecommerce/products")` (`AddItemsToEcommerceOrderModal.tsx:70` ၏ ခေါ်ပုံ) → `data.filter((i) => (i.quantity ?? 0) <= 0).length` | `/storefront` | (မကန့်) |

> **2026-10-28 ပြင်ဆင်ချက်:** "စတော့ နည်းနေ" (`isLowStock`) tile ကို ဖယ် — backend တွင် `isLowStock` field ကို **မည်သည့်နေရာကမျှ မရေး** (default `false` သာ) ဖြစ်၍ အမြဲ 0 ပြမည်; `fetchStorefrontStock` ၏ ပထမ page ကို filter လုပ်ခြင်းလည်း product 100 ကျော်လျှင် မမှန်။ အစား e-commerce ဆိုင်၏ **ပစ္စည်းပြတ်** အရေအတွက် (ecommerce product စာရင်း အပြည့်ကို API တစ်ကြိမ်ဖြင့် ရ)
- `Promise.allSettled` — mount တစ်ကြိမ် (polling မလုပ်); role ခွင့်မရှိသော tile မပြ + API မခေါ်
- Tile link — target page တွင် status filter ကို URL မှ မဖတ်သေး၍ **page ကိုသာ ဖွင့်** (filter ချိတ်ခြင်း = §7 Q2)

### Plan ကို brief နှင့် ပြန်စစ်ခြင်း (generic ဖြစ်မနေကြောင်း)
- **ပြင်လိုက်သည်** — ပထမ draft တွင် လုပ်စရာ tile ကို "ကိန်းကြီး + label အသေး + gradient" stat card ဖြင့် စဉ်းစားခဲ့ — ၎င်းသည် dashboard တိုင်း၏ default ဖြစ်၍ **ဝါကျ (ဥပမာ "3 ခု စောင့်နေ")** + count 0 တွင် "မရှိ" ဟု ရှင်းပြ + amber/muted သာ (gradient မသုံး) သို့ ပြောင်း — ကိန်းသည် အလှမဟုတ်ဘဲ ယနေ့ လုပ်ရမည့် အလုပ်ပမာဏ ဖြစ်၍
- **ပြင်လိုက်သည်** — card ၁၄ ခု ပုံစံတူ (SaaS-card kit) ကို panel ၅ ခု + row list သို့ — section ခေါင်းစဉ်သည် panel ခေါင်းစဉ်အဖြစ် အမှန်တကယ် အုပ်စုဖွဲ့ခြင်းကို ပြ; ညာဘက် ဗလာနေရာ ပြဿနာလည်း ပြေ
- ရဲရဲလုပ်သော နေရာ **တစ်ခုတည်း** = လုပ်စရာ တန်း; ကျန်အပိုင်း (panel/row) ကို တိတ်ဆိတ် ရိုးရှင်း ထား

---

## ၄. ပြင်ဆင်မည့်ဖိုင်

| ဖိုင် | ပြောင်းလဲမှု |
|---|---|
| `pages/Menu.tsx` | §3 layout; badge state → work queue state (ecommerce / fulfillment / PO / lowStock); scroll box ဖယ်; greeting / logout ဖယ် |
| `components/Menu/WorkQueue.tsx` *(အသစ်)* | tile ၄ ခု (loading / 0 / > 0 / error) |
| `components/Menu/MenuPanel.tsx` *(အသစ်)* | section panel + row list |
| `config/menuConfig.ts` | `badge` field ကို မလိုတော့ — ဖယ် (work queue သည် သီးခြား config `WORK_QUEUE` ဖြင့်); item `descKey` ယခုအတိုင်း |
| `translations/my.ts`, `en.ts` | `menu.workQueue.*` (title, ecommercePending, fulfillmentPending, poAwaiting, lowStock, none…), panel ခေါင်းစဉ် ယခု key ပြန်သုံး |

| `App.tsx` *(2026-10-28 ထပ်ထည့်)* | `/menu` အတွက် scroll ပိတ်ထားသော class ကိုသာ ဖယ် — line ~66 ၏ `isMenuPage ? "h-screen max-h-screen overflow-hidden" : ""` နှင့် line ~130-132 ၏ `isMenuPage ? "h-screen max-h-screen overflow-hidden flex flex-col" : "overflow-x-hidden"` → `"overflow-x-hidden"` အမြဲ; header ၏ `isMenuPage` (▦ ဖျောက်ခြင်း, line ~86, ~98) **မထိ** |

> Backend / API **မပြောင်း**; menu item စာရင်း / role / feature flag (`posSales`) **မပြောင်း**; header (`UserMenu.tsx`, App.tsx ၏ header အပိုင်း) **မပြောင်း**

---

## ၅. စစ်ဆေးမည့်နည်း
1. `npm run build` pass; translation parity 0 / 0
2. Test DB (`uomtest`) + build preview (`plans/2026-10-27-dashboard-browser-test-plan.md` §1) — **390 / 768 / 1366 / 1846px**:
   - Work queue — pending ecommerce 2, fulfillment 0, pending PO 1, ecommerce ဆိုင်တွင် quantity 0 product 3 seed → "2 ခု စောင့်နေ" (amber) / "ထုပ်ပိုးရန် မရှိ" (muted) / "1 ခု" / "ပစ္စည်း 3 မျိုး"
   - Tile / row နှိပ် → မှန်ကန်သော page
   - 1846px — ညာဘက် ဗလာ ကြီး မရှိ (panel 3 col ပြည့်); page ထဲ scrollbar သီးသန့် မပေါ်
   - `admin` — "အကောင့်စီမံ" row နှင့် ခွင့်မရှိ tile မပေါ်; `cashier` — ခွင့်ရှိသော row / tile သာ
   - API တစ်ခု fail (backend ရပ်) — tile "—", page မပျက်
   - Keyboard Tab — tile / row တိုင်း focus ring မြင်
   - မြန်မာ ⇄ English; horizontal scroll မရှိ; row ≥ 56px (ဖုန်း)
3. စစ်ပြီး test DB / server ဖျက်

---

## ၆. Scope အပြင်
- Header / user dropdown, menu item စာရင်း, feature flag
- Target page များတွင် URL ဖြင့် status filter ချိတ်ခြင်း (§7 Q2)
- Polling / realtime count

## ၇. ဆုံးဖြတ်ရန်
| # | မေးခွန်း | အကြံ |
|---|---|---|
| Q1 | Work queue tile ၄ ခု (အော်ဒါ အတည်ပြု / ထုပ်ပိုး / PO ရောက်ရန် / ပစ္စည်းပြတ် (အွန်လိုင်းဆိုင်)) | ✅ 2026-10-28 — ၄ ခု; "စတော့နည်း" ကို "ပစ္စည်းပြတ်" ဖြင့် အစားထိုး (§3 ပြင်ဆင်ချက်) |
| Q2 | Tile နှိပ်လျှင် target page ကို filter ပါပြီးသား (ဥပမာ pending အော်ဒါသာ) ဖွင့်ချင်လား — target page ၃ ခု ပြင်ရမည် | နောက်တစ်ဆင့် (ဤ plan တွင် မပါ) |
| Q3 | ဤ plan ကို Claude ပြင်မလား၊ Antigravity ကို ပေးမလား | — |
