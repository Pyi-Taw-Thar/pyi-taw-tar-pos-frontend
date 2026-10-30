# A5 ဘောက်ချာတွင် PTT Logo (`public/pyi-taw-tar.jpg`) အသုံးပြုရန် Plan

- **ရက်စွဲ**: 2026-10-30
- **Scope**: dashboard

---

## ၁. ရည်မှန်းချက်

A5 ဘောက်ချာ header (စာမျက်နှာ ၁) ၏ logo နေရာတွင် `dashboard/public/pyi-taw-tar.jpg` (PTT · Since 1962) ကို ပြမည်။

## ၂. လက်ရှိ အခြေအနေ

| အချက် | တွေ့ရှိချက် |
|---|---|
| A5 logo | `shopBranding.logo` (Shop Settings မှ) ရှိလျှင် `h-11 w-11` (44px လေးထောင့်) ဖြင့်ပြ၊ မရှိလျှင် ဆိုင်နာမည် ပထမစာလုံး box (`VoucherContent.tsx:604-614`) |
| ပုံ | 1600 × 915 px (≈ 1.75 : 1)၊ အပေါ်/အောက် အဖြူနေရာ ~23% စီ |
| Auto print | `PrintReceipt.tsx` က `shopBranding.logo` ကိုသာ preload လုပ်ပြီးမှ `window.print()` ခေါ် |

→ လေးထောင့် 44px ထဲ ထည့်လျှင် logo အလွန်သေးမည်။

## ၃. ပြင်ဆင်ပုံ

1. **`dashboard/utils/printShopBranding.ts`**
   - `export const A5_VOUCHER_LOGO = "/pyi-taw-tar.jpg";` ထည့် (public folder ဖိုင်၊ build တွင် root သို့ ကူး)
2. **`dashboard/components/Print/VoucherContent.tsx`** — A5 header (စာမျက်နှာ ၁) သာ
   - `shopBranding.logo` / စာလုံး box အစား `A5_VOUCHER_LOGO` ကို **အမြဲ** ပြ
   - အရွယ်: `w-[26mm] h-[11mm] object-cover object-center` — box အချိုး (2.4 : 1) သည် ပုံထက် ပိုကျယ်၍ အပေါ်/အောက် အဖြူနေရာကိုသာ ဖြတ်ပြီး logo အပြည့်ကျန် (logo စာသား/မျဉ်းကွေး မဖြတ်)
   - `alt={shopBranding.shopName}`၊ ညာဘက် ဆိုင်နာမည်/လိပ်စာ စာသား ယခင်အတိုင်း
3. **`dashboard/pages/PrintReceipt.tsx`** — `paperSize === "A5"` ဖြစ်လျှင် `A5_VOUCHER_LOGO` ကိုလည်း preload လုပ်ပြီးမှ print (auto print တွင် logo မပါဘဲ ထွက်ခြင်း ကာကွယ်)

### မပြောင်းမည့်အရာ
- A4 / Thermal ဘောက်ချာ logo (Shop Settings logo ဆက်သုံး)
- A5 စာမျက်နှာ ၂ နောက်ပိုင်း header (logo မပါ — ယခင်အတိုင်း)
- Shop Settings

## ၄. Verification

1. `npm run build` အောင်မြင်ရမည်
2. Headless Chrome ဖြင့် A5 header ကို ပုံထည့်၍ PDF ထုတ် → logo ပြည့်စုံစွာ ပေါ်၊ စာမျက်နှာ ၁ ခုသာ
3. App ထဲတွင် order တစ်ခုကို A5 print preview → logo ပေါ်၊ footer စာမျက်နှာ ၁ တွင်ရှိ
4. A4 / Thermal တွင် logo မပြောင်း
