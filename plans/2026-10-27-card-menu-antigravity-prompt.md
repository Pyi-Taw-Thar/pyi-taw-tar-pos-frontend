# Antigravity Prompt — Card Menu Page + E-commerce Mode

> အောက်ပါ စာသားကို Antigravity ထဲ **အတိုင်း** ကူးထည့်ပါ။

---

```text
မင်းဟာ Pyi-Taw-Tar monorepo ရဲ့ dashboard/ (React 19 + TypeScript + Vite + Tailwind CDN) ကို ပြင်မယ့် developer ပါ။
ငါ့ကို ဘာပဲပြန်ပြောပြော မြန်မာလိုပဲ ပြောပါ။ Code comment တွေလည်း မြန်မာလို ရေးပါ။

## အလုပ်
Dashboard ရဲ့ slide-in sidebar ကို ဖယ်ပြီး login ဝင်ရင် card တွေနဲ့ပြတဲ့ Menu page (/menu) ကို ပြောင်းမယ်။
User က လောလောဆယ် e-commerce ပိုင်းပဲ သုံးမှာမို့ POS / အရောင်းပိုင်း UI ကို feature flag နဲ့ ခဏဖျောက်ထားမယ်။
Menu မှာ ပြမယ့် card ၁၄ ခု —
- အွန်လိုင်း အရောင်း: အီးကော်မတ် အော်ဒါများ, အော်ဒါ ထုတ်ပိုးစစ်ဆေးခြင်း, ဖောက်သည်များ
- ကုန်ပစ္စည်း နှင့် စတော့: ကုန်ပစ္စည်းစာရင်း, ကုန်လှောင်ရုံ, ဆိုင်ခန်း
- ဝယ်ယူရေး: ဝယ်ယူမှု အော်ဒါ (PO), ပစ္စည်း သွင်းသူများ, PO အစီရင်ခံစာ
- ငွေကြေး နှင့် အစီရင်ခံစာ: အထွေထွေ အသုံးစရိတ်, အစီရင်ခံစာများ
- စနစ်: AI လက်ထောက်, အကောင့်စီမံခန့်ခွဲမှု, ဆက်တင်များ

## ဖတ်ရမယ့်ဖိုင် (အစဉ်အတိုင်း — မစခင် အကုန်ဖတ်)
1. dashboard/AGENTS.md
2. dashboard/CLAUDE.md
3. dashboard/plans/2026-10-27-card-menu-ecommerce-mode-plan.md   ← အဓိက plan (v2) — ဒါအတိုင်း အတိအကျ လုပ်
4. dashboard/plans/2026-10-27-dashboard-browser-test-plan.md §1  ← test DB / server setup နည်း
5. dashboard/plans/2026-10-27-dashboard-i18n-followup-plan.md §2  ← translation parity command

## မစခင် လုပ်ရမယ့်အရာ (မဖြစ်မနေ)
1. `git -C dashboard status --short` ကို run ပြီး commit မလုပ်ရသေးတဲ့ ဖိုင် ဘယ်နှခု ရှိလဲ ငါ့ကို ပြော
2. ရှိနေရင် "ယခင် UI/i18n ပြင်ဆင်ချက်တွေကို အရင် commit လုပ်မလား" လို့ ငါ့ကို မေးပြီး ငါ ဖြေမှ စ
3. Plan ကို ဖတ်ပြီး နားမလည်တာ / plan နဲ့ code မကိုက်တာ တွေ့ရင် code မပြင်ခင် ငါ့ကို မေး

## စည်းမျဉ်း
- Plan ထဲက ဖိုင်တွေကိုပဲ ပြင်။ Backend, ecommerce/, menu က ဖွင့်တဲ့ page တွေရဲ့ အတွင်းပိုင်းကို မထိနဲ့
- Code မဖျက်နဲ့ — components/Sidebar.tsx နဲ့ POS page ဖိုင်တွေ ကျန်ရမယ် (flag `posSales: true` ပြောင်းရုံနဲ့ ပြန်ပေါ်ရမယ်)
- Dependency အသစ် မထည့်နဲ့။ Tailwind ရှိပြီးသား class + theme (header #1E2937, primary green, bg #F8F9FA) ပဲ သုံး
- UI စာတိုင်း t() နဲ့ — translations/my.ts နဲ့ en.ts နှစ်ခုလုံးမှာ key ထည့်
- Commit / push ကိုယ်တိုင် မလုပ်နဲ့
- Production DB ကို လုံးဝ မထိနဲ့ (ဖတ်တာပါ မလုပ်နဲ့)။ Test ကို uomtest DB နဲ့ပဲ လုပ်
- `npm run dev` မသုံးနဲ့ — build + `vite preview` နဲ့ စစ် (StrictMode ကြောင့် API ၂ ကြိမ်ခေါ်လို့)

## အလုပ်အစဉ်
1. config/features.ts, config/menuConfig.ts (plan §4)
2. utils/logout.ts (Sidebar ရဲ့ handleLogout ကို ထုတ်) → components/UserMenu.tsx → components/FeatureRoute.tsx
3. pages/Menu.tsx (plan §3.1, §3.3)
4. App.tsx — header ပြောင်း (plan §3.2), Sidebar render ဖယ်, /menu route, `/` → /menu, ဖျောက်မယ့် route တွေကို FeatureRoute နဲ့ ပတ်
5. pages/Login.tsx, pages/PurchaseReport.tsx — `/pos` → `/menu`; `grep -rn "\"/pos\"" pages components hooks utils` နဲ့ ကျန်တာ ရှာ
6. translations — menu.* key တွေ
7. Plan §6 အတိုင်း စစ် (build, parity, browser M-01 ကနေ M-12, cleanup)

## ပြီးရင် ပေးရမယ့် report
dashboard/plans/2026-10-27-card-menu-report.md မှာ ရေး —
- ပြင်/ဖန်တီးခဲ့တဲ့ ဖိုင်စာရင်း
- `npm run build` output (chunk-size warning ရှိရင် "0 warnings" လို့ မရေးနဲ့)
- Translation parity output
- M-01 ကနေ M-12 တစ်ခုချင်း pass/fail + အထောက်အထား (JS output သို့ screenshot path)
- Menu page screenshot — 390px နဲ့ 1366px တစ်ပုံစီ
- Cleanup ရလဒ် (server ရပ်ပြီး, uomtest drop ပြီး, temp ဖိုင်ဖျက်ပြီး, git status)
- Fail ဖြစ်တာ / မစစ်နိုင်ခဲ့တာ / plan နဲ့ မတူအောင် လုပ်ခဲ့တာ ရှိရင် ရိုးရိုးသားသား ရေး
အထောက်အထား မပါဘဲ "100% ပြီး" လို့ မရေးနဲ့။
```
