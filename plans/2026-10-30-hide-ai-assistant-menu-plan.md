# Dashboard Frontend — Menu Page မှ AI Assistant (AI လက်ထောက်) ဖျောက်ရန် Implementation Plan

- **ရက်စွဲ:** 2026-10-30
- **အခြေအနေ:** ✅ အောင်မြင်စွာ ပြီးစီး (2026-10-30) — build pass; Menu page မှ AI Assistant ဖျောက်ပြီး၊ /ai-chat route အား FeatureRoute ဖြင့် ကာကွယ်ပြီး
- **ပစ်မှတ် Sub-project:** `dashboard/`

---

## ၁။ ရည်ရွယ်ချက် (Objective)
Dashboard ၏ ပင်မ Menu စာမျက်နှာ (`/menu`) တွင် ပြသထားသော "စနစ်" (System) section အောက်ရှိ **AI Assistant (AI လက်ထောက်)** card ကို သပ်ရပ်စွာ ဖျောက်ထားရန် (hide ပြုလုပ်ရန်) ဖြစ်ပါသည်။

---

## ၂။ လက်ရှိ အခြေအနေနှင့် ချဉ်းကပ်ပုံ (Current State & Approach)

### လက်ရှိ အခြေအနေ:
* `dashboard/config/features.ts` တွင် feature flag စနစ် (`FEATURES = { posSales: false }`) ရှိပြီးဖြစ်ပါသည်။
* `dashboard/config/menuConfig.ts` တွင် menu items များသည် `feature?: FeatureKey` flag ကို အသုံးပြု၍ ပြသ/ဖျောက်ထားနိုင်သော `canSeeItem(item, role, features)` စနစ် ပါရှိပြီးဖြစ်ပါသည်။
* လက်ရှိ `menuConfig.ts` ရှိ "system" section အောက်တွင် `/ai-chat` (AI Assistant) သည် feature flag မပါဘဲ အမြဲတမ်း ပေါ်နေပါသည်။
* `dashboard/App.tsx` တွင်လည်း `<FeatureRoute>` component ဖြင့် feature flag မဖွင့်ထားသော route များကို `/menu` သို့ အလိုအလျောက် redirect လုပ်ပေးသည့် စနစ် ရှိပြီးဖြစ်ပါသည်။

### ပြင်ဆင်မည့် နည်းလမ်း:
1. **Feature Flag ထည့်သွင်းခြင်း (`dashboard/config/features.ts`)**:
   * `FEATURES` object တွင် `aiAssistant: false` ဟု သတ်မှတ်ပေးမည်။ (နောင်တစ်ချိန်တွင် ပြန်ဖွင့်လိုပါက `true` သို့ ပြောင်းရုံဖြင့် အလွယ်တကူ ပြန်ဖွင့်နိုင်စေမည်)။
2. **Menu Configuration ချိတ်ဆက်ခြင်း (`dashboard/config/menuConfig.ts`)**:
   * "system" section အောက်ရှိ `/ai-chat` item တွင် `feature: "aiAssistant"` ထည့်သွင်းပေးမည်။
   * ဤသို့ဖြင့် `canSeeItem()` စစ်ဆေးချက်အရ Menu page တွင် AI Assistant card အလိုအလျောက် ပုန်းသွားမည် ဖြစ်သည်။
3. **Route Guard ကာကွယ်ခြင်း (`dashboard/App.tsx`)**:
   * `/ai-chat` route ကို `<FeatureRoute feature="aiAssistant">` ဖြင့် အုပ်ပေးမည်ဖြစ်သောကြောင့် URL မှ `/ai-chat` ဟု တိုက်ရိုက်ရိုက်ထည့်၍ ဝင်ရောက်လျှင်လည်း Menu သို့ ပြန်လည် redirect ဖြစ်စေမည်။
4. **Sidebar စစ်ဆေးခြင်း (`dashboard/components/Sidebar.tsx`)**:
   * Sidebar ရှိ AI Assistant item တွင်လည်း feature flag စစ်ဆေးမှု ထည့်သွင်းပေးမည် (သို့မဟုတ် သင့်လျော်စွာ hide ပေးမည်)။

---

## ၃။ ပြင်ဆင်မည့် ဖိုင်များ (Files to Modify)

| ဖိုင်လမ်းကြောင်း | လုပ်ဆောင်မည့် အပြောင်းအလဲ |
|---|---|
| `dashboard/config/features.ts` | `aiAssistant: false` feature flag ထည့်သွင်းခြင်း |
| `dashboard/config/menuConfig.ts` | `/ai-chat` menu item တွင် `feature: "aiAssistant"` ချိတ်ဆက်ခြင်း |
| `dashboard/App.tsx` | `/ai-chat` route ကို `<FeatureRoute feature="aiAssistant">` ဖြင့် ကာကွယ်ခြင်း |

---

## ၄။ စစ်ဆေးအတည်ပြုမည့် နည်းလမ်းများ (Verification Steps)
1. `dashboard` folder တွင် `npm run build` run ၍ Build error မရှိကြောင်း စစ်ဆေးခြင်း။
2. Menu page (`/menu`) သို့ ဝင်ရောက်ကြည့်ရှုရာတွင် "စနစ်" section အောက်၌ "AI လက်ထောက်" card မပေါ်တော့ဘဲ "အကောင့်စီမံခန့်ခွဲမှု" နှင့် "ဆက်တင်များ" သာ သပ်ရပ်စွာ ကျန်ရှိနေကြောင်း စစ်ဆေးခြင်း။
3. Browser URL တွင် `/ai-chat` ဟု တိုက်ရိုက်ရိုက်ထည့်ပါက `/menu` သို့ ပြန်လည် redirect ဖြစ်သွားကြောင်း စစ်ဆေးခြင်း။
