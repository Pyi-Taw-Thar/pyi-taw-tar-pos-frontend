# ဆိုင်ခန်း ကုန်ပစ္စည်းအသေးစိတ် Page Layout ပြန်ဒီဇိုင်း Plan

- **ရက်စွဲ:** 2026-10-27
- **အခြေအနေ:** ⏳ Approval စောင့်ဆိုင်းဆဲ
- **Page:** `/storefront/:storeId/product/:productId` → `dashboard/pages/StorefrontProductDetail.tsx` (931 ကြောင်း)
- **နောက်ခံ:** User screenshot (Pyo May Honey, FH008, လက်ကျန် 0) — "data ကို ကောင်းကောင်း မမြင်ရ"

---

## ၁. ဘာကြောင့် data ကြည့်ရခက်လဲ

| # | ပြဿနာ | နေရာ |
|---|---|---|
| 1 | **အရေးကြီးဆုံး ၂ ခု (လက်ကျန် / ဈေး) ကို unit တစ်ခု (ဘူး) ဖြင့်သာ ပြ** — ပုံး 90,000 / ဖာ 1,080,000 ဈေး ဘယ်နေရာမှ မပြ; ပုံး/ဖာ ဖြင့် လက်ကျန် ဘယ်လောက်လဲ တွက်ရ | stat card (line ~352-401), Unit Conversions card (~570-610) |
| 2 | **တူညီသော ကိန်း ၄ နေရာ** — Quantity card, Available card, Stock Information ၏ "လက်ရှိ" + "ရောင်းချနိုင်သော"; backend တွင် `availableQuantity` = `quantity` (virtual, reservation မရှိ — `storefrontInventory.model.js:52`) | |
| 3 | **ဆက်စပ်အချက် ကွဲနေ** — unit factor (Unit Conversions), unit အလိုက်လက်ကျန် (Quantity by Unit chip), ဈေး (Price card / Product Information) ကို card ၃ ခုခွဲ၍ ပြ → မျက်စိ ဟိုဒီရှာရ | |
| 4 | **လုပ်ဆောင်ချက် ခလုတ်** (stock ထည့်/နုတ်/ဂိုဒေါင်သို့) page **အောက်ဆုံး** — screenshot တွင် မမြင်ရ | line ~613-639 |
| 5 | Status (Out of Stock) ကို stat card တစ်ခုလုံးယူ၍ ပြ (နေရာဖြုန်း) | |
| 6 | English စာ ~28 ကြောင်း (Quantity, Product Information, Out of Stock, Edit Limit …) + "No description available" | multi-line JSX |
| 7 | "အမြတ် 8,000 MMK (800.0%)" — % သည် markup (`(ရောင်း−ဝယ်)÷ဝယ်`) ဖြစ်၍ "အမြတ်" ဟု ဖတ်လျှင် မှားနားလည် | line ~460-470, `inventory.model.js:227` |
| 8 | ရက်စွဲ US format (`10/16/2026, 1:20:51 PM`) | line ~529 |
| 9 | 🐞 **ပစ္စည်းမှား၍ ပြနိုင်** — stock ကို `productCode` ဖြင့် regex (တစ်စိတ်တစ်ပိုင်းတူ) ရှာပြီး `data[0]` ကိုယူ → `FH008` ရှာလျှင် `FH0080` ၏ stock ကို ပြ/ပြင် မိနိုင် | line ~90-98 |
| 10 | Debug `console.log` ၄ ကြောင်း | line 86, 120-122 |

---

## ၂. Design — "unit ဇယား တစ်ခုတည်း" ကို page ၏ အလယ်ဗဟို ထား

### Desktop (≥ lg)
```
┌───────────────────────────────────────────────────────────────────┐
│ ←  Pyo May Honey (ပျားရည်)  [FH008]  [● ပစ္စည်းပြတ်]               [⟳] │  ← status badge ကို ခေါင်းစဉ်ဘေး
│    Fame · Online Order ဆိုင်ခန်း                                       │
├───────────────────────────────────────────────────────────────────┤
│ ┌──────────────── လက်ကျန် ────────────────┐ ┌──── လုပ်ဆောင်ချက် ─────┐ │
│ │  0 ဘူး                                │ │ [+ stock ထည့်]          │ │  ← owner သာ
│ │  = 0 ဖာ 0 ပုံး 0 ဘူး                     │ │ [− stock နုတ်]          │ │
│ │  နောက်ဆုံးပြင် 16 Oct 2026, 1:20 PM      │ │ [⇄ ဂိုဒေါင်သို့ လွှဲ]      │ │
│ └───────────────────────────────────────┘ └──────────────────────┘ │
│                                                                   │
│ ┌──────────── Unit အလိုက် ဈေးနှင့် လက်ကျန် ─────────────────────────────┐ │
│ │ Unit        ပါဝင်မှု      ရောင်းဈေး      ဝယ်ဈေး       လက်ကျန်          │ │
│ │ ဘူး (အခြေခံ)  1 ဘူး       9,000       1,000       0               │ │
│ │ ပုံး          10 ဘူး      90,000      10,000      0               │ │
│ │ ဖာ          120 ဘူး     1,080,000   120,000     0               │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌──── ကုန်ပစ္စည်း အချက်အလက် ────┐ ┌──── အွန်လိုင်း ဝယ်ယူမှု ကန့်သတ်ချက် ──┐ │
│ │ ကုဒ်       FH008             │ │ ကန့်သတ်ချက် မရှိ                   │ │
│ │ SKU       —                 │ │ [ကန့်သတ်ချက် သတ်မှတ်မယ်]  ← owner   │ │
│ │ အမှတ်တံဆိပ် Fame              │ └────────────────────────────────┘ │
│ │ အမြတ် (ဘူး) 8,000 MMK          │                                    │
│ │   ဝယ်ဈေးအပေါ် 800% · ရောင်းဈေးအပေါ် 88.9% │                          │
│ │ ဖော်ပြချက် (ရှိမှသာ)              │                                    │
│ └────────────────────────────┘                                    │
└───────────────────────────────────────────────────────────────────┘
```

### ဖုန်း (< md)
```
← Pyo May Honey (ပျားရည်)
  [FH008] [● ပစ္စည်းပြတ်]
┌ လက်ကျန် ────────────────┐
│ 0 ဘူး                   │
│ = 0 ဖာ 0 ပုံး 0 ဘူး        │
│ [+ ထည့်] [− နုတ်] [⇄ လွှဲ] │  ← ခလုတ်များ card ထဲ ပါ (3 col)
└────────────────────────┘
┌ Unit အလိုက် ───────────────┐
│ ဘူး (အခြေခံ)       9,000 Ks │  ← table အစား row card
│ 1 ဘူး · လက်ကျန် 0           │
│ ─────────────────────── │
│ ပုံး             90,000 Ks │
│ 10 ဘူး · လက်ကျန် 0          │
│ ─────────────────────── │
│ ဖာ           1,080,000 Ks │
│ 120 ဘူး · လက်ကျန် 0         │
└────────────────────────┘
┌ ကုန်ပစ္စည်း အချက်အလက် ┐  ┌ ကန့်သတ်ချက် ┐
```

### တွက်ချက်ပုံ (frontend သာ — backend မပြောင်း)
| တန်ဖိုး | တွက်ပုံ |
|---|---|
| Unit row ၏ ရောင်းဈေး / ဝယ်ဈေး | `sellingPrice × factor` / `buyingPrice × factor` (ecommerce ၏ unit ဈေး တွက်ပုံ `sellingPrice * factor` နှင့် တူ) |
| Unit row ၏ လက်ကျန် | ယခု API ၏ `quantityByUnit[unit]` (= `quantity ÷ factor`); ဒသမ ဖြစ်လျှင် ဒသမ ၁ နေရာ (ဥပမာ `12.5 ပုံး`) |
| "= 0 ဖာ 0 ပုံး 0 ဘူး" breakdown | factor ကြီးရာမှ ငယ်ရာသို့ `Math.floor` ဖြင့် ခွဲ (ဥပမာ 135 ဘူး → `1 ဖာ 1 ပုံး 5 ဘူး`); 0 ဖြစ်သော unit ကို ချန် (အားလုံး 0 ဆိုလျှင် breakdown မပြ) |
| အမြတ် | ပမာဏ = `sellingPrice − buyingPrice`; "ဝယ်ဈေးအပေါ် %" = markup (ယခု `profitMargin`), "ရောင်းဈေးအပေါ် %" = `(ရောင်း−ဝယ်)÷ရောင်း×100`; ဝယ်ဈေး 0 ဆိုလျှင် % မပြ |
| Status badge | ယခု `isOutOfStock` / `isLowStock` logic အတိုင်း (မပြောင်း) — ပစ္စည်းပြတ် (အနီ) / နည်းနေ (amber) / ရှိ (အစိမ်း) |

### ဖယ်မည်
- Stat card ၄ ခု (Quantity / Available / Price / Status) — လက်ကျန် card + unit ဇယား + badge ဖြင့် အစားထိုး
- "Stock Information" card (ထပ်နေ၍) နှင့် "Quantity by Unit" chip — unit ဇယားထဲ ပေါင်း
- "Unit Conversions" card — unit ဇယားထဲ ပေါင်း
- "ရောင်းချနိုင်သော အရေအတွက်" (quantity နှင့် အမြဲတူ)
- ဖော်ပြချက် မရှိလျှင် "No description available" အစား section ကိုယ်တိုင် မပြ

### Style
Dashboard ရှိပြီးသား (`bg-white rounded-xl border shadow-sm`, primary green, slate စာ, Inter); လက်ကျန် ကိန်း `text-3xl font-bold`, ဈေး column `tabular-nums text-right`; card အရေအတွက် လျှော့၍ အမျိုးအစားတူ data ကို ဇယားတစ်ခုတည်းတွင် ညှိ

---

## ၃. Bug / သန့်ရှင်းရေး

| # | ပြင်ပုံ |
|---|---|
| 9 | `loadData` — `stockRes.data.find((s) => s.inventoryId?._id === productId)` ဖြင့် ရွေး; မတွေ့လျှင် "ဤဆိုင်ခန်းတွင် ပစ္စည်း မရှိပါ" not-found state (ယခု not-found UI ကို ပြန်သုံး) |
| 10 | `console.log` ၄ ကြောင်း ဖယ် |
| 6 | Page ၏ English UI စာ အားလုံး (modal ၂ ခု — stock ပြင်ခြင်း / ecommerce limit အပါအဝင်) ကို `t("storefrontProduct.*")` — `translations/my.ts` + `en.ts` နှစ်ခုလုံး |
| 8 | ရက်စွဲ — `toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })` (`16 Oct 2026, 1:20 pm`) |

---

## ၄. ပြင်ဆင်မည့်ဖိုင်
| ဖိုင် | ပြောင်းလဲမှု |
|---|---|
| `dashboard/pages/StorefrontProductDetail.tsx` | §2 layout; §3 bug fix; modal ၂ ခု ၏ logic **မပြောင်း** (စာသားသာ) |
| `dashboard/components/Storefront/UnitPriceStockTable.tsx` *(အသစ်)* | unit ဇယား (desktop table / ဖုန်း row card) — props: `baseUnit`, `uomConversions`, `sellingPrice`, `buyingPrice`, `quantityByUnit` |
| `dashboard/utils/uom.ts` | `breakdownQuantity(baseQty, baseUnit, conversions)` helper ထည့် (ရှိပြီးသား helper ရှိလျှင် ပြန်သုံး) |
| `dashboard/translations/my.ts`, `en.ts` | `storefrontProduct.*` key |

> Backend / API **မပြောင်း**; stock ပြင်ခြင်း၊ ဂိုဒေါင်သို့ လွှဲခြင်း၊ ecommerce limit သိမ်းခြင်း logic **မပြောင်း**
> ⚠️ ဤဖိုင်တွင် Antigravity ၏ commit မလုပ်ရသေးသော ပြင်ဆင်ချက် ရှိ — ထိုအပေါ်တွင် ဆက်ပြင်မည်

---

## ၅. စစ်ဆေးမည့်နည်း
1. `npm run build` pass; translation parity 0 / 0
2. Test DB (`uomtest`) + build preview + `owner` seed အကောင့် ဖြင့် browser (**390 / 768 / 1366px**) — product ၃ မျိုး:
   - လက်ကျန် 0 (ပစ္စည်းပြတ်) — badge အနီ, breakdown မပြ
   - လက်ကျန် 135 ဘူး — `= 1 ဖာ 1 ပုံး 5 ဘူး`; ဇယား လက်ကျန် 135 / 13.5 / 1.1
   - Code ဆင်တူ ၂ ခု (`FH008`, `FH0080`) — `FH008` page တွင် FH008 ၏ stock သာ ပြ (bug 9)
   - ဇယား ဈေး: 9,000 / 90,000 / 1,080,000
   - Stock ထည့် 10 ပုံး → လက်ကျန် 100 ဘူး ဖြစ်ပြီး ဇယား update (logic မပျက်)
   - Ecommerce limit သတ်မှတ် / ဖယ် ယခင်အတိုင်း အလုပ်လုပ်
   - `admin` role — လုပ်ဆောင်ချက် / limit ခလုတ် မပေါ် (ယခုအတိုင်း owner သာ)
   - မြန်မာ ⇄ English — English / key နာမည် မကျန်; console warning 0
   - ဖုန်းတွင် horizontal scroll မရှိ; ခလုတ် ≥ 44px
3. စစ်ပြီး test DB / server ဖျက်

---

## ၆. ဆုံးဖြတ်ရန်
| # | မေးခွန်း | အကြံ |
|---|---|---|
| Q1 | ဝယ်ဈေး column ကို ဇယားတွင် ပြမလား (staff အားလုံး မြင်ရမည်) | **owner / admin သာ** ပြ |
| Q2 | ဤ page ကို ကျွန်တော် (Claude) ပြင်မလား၊ Antigravity ကို ပေးမလား | — |
