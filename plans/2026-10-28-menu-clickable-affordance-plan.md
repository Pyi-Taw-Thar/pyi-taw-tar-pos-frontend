# Menu Page — "နှိပ်လို့ရမှန်း" သိသာအောင် ပြင်ရန် Plan

- **ရက်စွဲ:** 2026-10-28
- **အခြေအနေ:** ⏳ Approval စောင့်ဆိုင်းဆဲ
- **အခြေခံ:** [`2026-10-28-menu-page-redesign-plan.md`](./2026-10-28-menu-page-redesign-plan.md) ၏ ရလဒ် (commit မလုပ်ရသေး — ဖိုင် ၈ ခု)
- **User feedback:** "ကြည့်လိုက်တာနဲ့ ဒါက page ဆီသွားမယ့် button ဆိုတာ မသိဘူး၊ အပေါ်က card တွေဆိုလည်း display only လို့ ထင်ရတယ်"

---

## ၁. ဘာကြောင့် နှိပ်လို့ရမှန်း မသိရလဲ

| နေရာ | လက်ရှိ | ပြဿနာ |
|---|---|---|
| "ယနေ့ လုပ်စရာ" tile (`components/Menu/WorkQueue.tsx:36-39`) | ကိန်း + ခေါင်းစဉ် + "2 ခု စောင့်နေ" သာ; chevron / ခလုတ် / "ကြည့်မယ်" **လုံးဝ မရှိ**; hover တွင် အရောင် အနည်းငယ်သာ ပြောင်း | Dashboard တွင် ကိန်းကြီး card သည် **အချက်အလက်ပြ (stat) card** ဟု အမြဲ နားလည်ကြ → နှိပ်ရမှန်း မသိ |
| Panel row (`components/Menu/MenuPanel.tsx:113-129`) | Hairline (`border-slate-100`) ဖြင့်သာ ခွဲထားသော စာကြောင်း list; chevron `w-4 h-4 text-slate-400` (အလွန်သေး/မှိန်); hover `bg-slate-50` (မမြင်သလောက်) | **စာရင်း (text list)** ဟု ဖတ်မိ — ခလုတ်ဟု မမြင် |
| နှစ်ခုလုံး | `cursor-pointer` / နှိပ်ချိန် (active) feedback မရှိ | ဖုန်းတွင် နှိပ်လိုက်ကြောင်း ခံစားမရ |

---

## ၂. ပြင်ပုံ — "ခလုတ်ဖြစ်ကြောင်း" ကို အမြင်ဖြင့် ပြ (စာရှင်းပြချက် ထပ်မထည့်)

### 2.1 "ယနေ့ လုပ်စရာ" tile — အောက်ခြေတွင် **လုပ်ဆောင်ချက် ခလုတ်** ထည့်
```
┌──────────────────────────────┐
│ 2                             │
│ အော်ဒါ အတည်ပြုရန်                │
│ 2 ခု စောင့်နေ                   │
│                               │
│ ┌──────────────────┐          │
│ │ အော်ဒါ စစ်မယ်    ›  │          │  ← ခလုတ်ပုံစံ (border + အစိမ်းစာ)
│ └──────────────────┘          │
└──────────────────────────────┘
 hover / focus → tile border အစိမ်း + shadow, ခလုတ် bg အစိမ်း စာဖြူ
 နှိပ်ချိန် → active:scale-[0.98]
```
| Tile | ခလုတ်စာ (`menu.workQueue.*Action`) | count 0 ဖြစ်လျှင် |
|---|---|---|
| အော်ဒါ အတည်ပြုရန် | **အော်ဒါ စစ်မယ်** | ခလုတ် ဆက်ပြ (မှိန်ပုံစံ — slate border/စာ) |
| ထုပ်ပိုးရန် | **ထုပ်ပိုးမယ်** | 〃 |
| PO ပစ္စည်းရောက်ရန် | **PO ကြည့်မယ်** | 〃 |
| ပစ္စည်းပြတ် (အွန်လိုင်းဆိုင်) | **ပစ္စည်း ကြည့်မယ်** | 〃 |

| Element | Class |
|---|---|
| Tile (`<Link>`) | ယခု class + `group cursor-pointer hover:border-primary hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100` |
| ခလုတ် (tile ထဲ `<span>` — tile တစ်ခုလုံးက link ဖြစ်၍ nested link မလုပ်) | `mt-3 self-start inline-flex items-center gap-1 rounded-lg border px-3 min-h-[36px] text-[13px] font-semibold transition-colors` — count > 0: `border-primary/40 bg-white text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary`; count 0: `border-slate-200 text-slate-500 group-hover:border-primary group-hover:text-primary` |
| Chevron | `ChevronRight w-4 h-4` (ခလုတ်ထဲ) |
| `aria-label` | `"{tile ခေါင်းစဉ်} — {count စာ}။ {ခလုတ်စာ}"` |
- PO tile စာကို "1 ခု **စောင့်နေ**" ဟု အခြား tile နှင့် တူအောင် ပြင် (ယခု "1 ခု" သာ)

### 2.2 Panel row → **ခလုတ် row** (တစ်ခုချင်း ကွဲကွဲပြားပြား)
```
┌ အွန်လိုင်း အရောင်း ──────────────────────┐   ← panel bg အဖြူ → slate-50 (ခလုတ်များ ပေါ်လွင်ရန်)
│ ┌─────────────────────────────────────┐ │
│ │ [🛍] အီးကော်မတ် အော်ဒါများ           (›) │ │  ← row တစ်ခုစီ အဖြူ rounded box + border
│ │      အော်ဒါ စစ်ဆေး / ဂိုဒေါင်သို့ ပို့       │ │     (›) = အဝိုင်း 32px
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │  ← row ကြား gap 8px
│ │ [📦] အော်ဒါ ထုပ်ပိုးစစ်ဆေးခြင်း        (›) │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
 hover / focus → row border အစိမ်း, ခေါင်းစဉ် အစိမ်း, icon box နှင့် (›) bg အစိမ်း icon အဖြူ
 နှိပ်ချိန် → active:scale-[0.99]
```
| Element | Class |
|---|---|
| Panel | `bg-slate-50 rounded-xl border border-slate-200 p-3` (ယခု `bg-white … overflow-hidden`) ; ခေါင်းစဉ် `px-1 pb-2` |
| Row list | `space-y-2` (hairline `border-t` ဖယ်) |
| Row (`<Link>`) | `group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 min-h-[60px] cursor-pointer shadow-sm hover:border-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary outline-none active:scale-[0.99] motion-reduce:active:scale-100 transition` |
| Icon box | ယခု + `group-hover:bg-primary group-hover:text-white transition-colors` |
| ခေါင်းစဉ် | ယခု + `group-hover:text-primary` |
| Chevron | `w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white` ထဲ `ChevronRight w-4 h-4` |

### 2.3 စာသား သေးငယ်ပြင်ဆင်ချက်
- `my.ts:113` `sidebar.orderFulfillment` — "Order ထုပ်ပိုးစစ်ဆေးခြင်း" → **"အော်ဒါ ထုပ်ပိုးစစ်ဆေးခြင်း"** (English "Order" မရော)

### Brief နှင့် ပြန်စစ်ခြင်း
- "Hover တွင်သာ ပြ" မဟုတ်ဘဲ **hover မလုပ်ခင်ကပင်** (ဖုန်းတွင် hover မရှိ) ခလုတ်ဖြစ်ကြောင်း မြင်ရ — tile တွင် ခလုတ်, row တွင် border box + အဝိုင်း chevron
- ခလုတ်စာကို "ကြည့်မယ်" တစ်မျိုးတည်း မဟုတ်ဘဲ **လုပ်မည့်အလုပ်** အတိုင်း (အော်ဒါ စစ်မယ် / ထုပ်ပိုးမယ်) — နှိပ်လျှင် ဘာဖြစ်မလဲ သိ
- အစိမ်းရောင်ကို **နှိပ်ရမည့်အရာ** အတွက်သာ သုံး (ခလုတ်, hover) — amber = အာရုံစိုက်ရန်, slate = အချက်အလက်

---

## ၃. ပြင်ဆင်မည့်ဖိုင်
| ဖိုင် | |
|---|---|
| `components/Menu/WorkQueue.tsx` | §2.1 |
| `components/Menu/MenuPanel.tsx` | §2.2 |
| `config/menuConfig.ts` | `WORK_QUEUE` item တွင် `actionKey` ထည့် |
| `translations/my.ts`, `en.ts` | `menu.workQueue.*Action` ၄ ခု (en: "Review orders", "Start packing", "View POs", "View products"); PO count စာ; `sidebar.orderFulfillment` (§2.3) |

> Layout (zone ၂ ခု, grid column), data / API, role, feature flag **မပြောင်း**

## ၄. စစ်ဆေးမည့်နည်း
1. `npm run build` pass; translation parity 0 / 0
2. Test DB + build preview — **390 / 1366px**: hover **မလုပ်ဘဲ** screenshot ရိုက်၍ tile ခလုတ် ၄ ခု နှင့် row box ၁၄ ခု နှိပ်ရမှန်း မြင်ရ; hover / Tab focus တွင် အစိမ်း state; ဖုန်းတွင် နှိပ်ချိန် scale feedback; tile / row / tile ထဲခလုတ်ဧရိယာ နှိပ်လျှင် မှန်ကန်သော page; count 0 tile ခလုတ် မှိန်ပုံစံ; horizontal scroll မရှိ
3. User ကို before/after screenshot ပြ

## ၅. ဆုံးဖြတ်ရန်
| # | မေးခွန်း |
|---|---|
| Q1 | ဤ plan ကို Claude ပြင်မလား၊ Antigravity ကို ပေးမလား |
