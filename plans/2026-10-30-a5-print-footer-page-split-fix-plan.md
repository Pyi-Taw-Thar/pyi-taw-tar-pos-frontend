# A5 Print — Footer စာမျက်နှာ ၂ သို့ ကွဲထွက်ခြင်း ပြင်ဆင်ရန် Plan

- **ရက်စွဲ**: 2026-10-30
- **Scope**: dashboard

---

## ၁. ပြဿနာ

A5 ဖြင့် ဘောက်ချာ print ထုတ်သည့်အခါ ပစ္စည်း ၄ မျိုးသာ ရှိသော်လည်း အောက်ခြေ footer (`အဆင်မပြေမှုများရှိပါက … / Vr.No / Printed by / Page 1 / 1`) သည် **စာမျက်နှာ ၂ သို့ သီးခြား ကွဲထွက်** နေသည်။

## ၂. အကြောင်းရင်း (Root Cause) — အတည်ပြုပြီး

- `/print-receipt/:orderId` route သည် `AppLayout` ၏ nested `<Routes>` အတွင်း ရှိသည် (`App.tsx:131`)
- `AppLayout` ၏ `<main>` တွင် fixed header အတွက် **inline style `paddingTop: "56px"`** ရှိသည် (`App.tsx:127-130`)
- Header ကို `print:hidden` ဖြင့် ဖျောက်ထားသော်လည်း `<main>` ၏ 56px (≈ 15mm) padding သည် print တွင် **ဆက်ရှိနေ**သည်
- A5 `.voucher-page` (print) = `min-height: 206mm` — A5 (210mm) တွင် နေရာ **4mm သာ** ပိုသဖြင့် 15mm ထပ်တိုးလိုက်လျှင် footer က စာမျက်နှာ ၂ သို့ ကျော်သွားသည်

**သက်သေ** — A5 voucher CSS အတိုင်း static HTML ဖြင့် headless Chrome `--print-to-pdf` စမ်းသပ်ချက်:

| အခြေအနေ | PDF စာမျက်နှာ |
|---|---|
| Voucher CSS သီးသန့် | 1 |
| အပေါ်တွင် 56px padding ထည့် (`<main>` အတိုင်း) | **2** |

## ၃. ပြင်ဆင်မည့်ပုံ

### `dashboard/App.tsx` (တစ်နေရာတည်း)

```tsx
// ယခင်
<main className="flex-1 overflow-x-hidden" style={{ paddingTop: "56px" }}>

// ပြင်ပြီး — header မပြသော print တွင် padding ဖယ်
<main className="flex-1 overflow-x-hidden pt-[56px] print:pt-0">
```

- Inline style ကို Tailwind class ဖြင့် အစားထိုး (inline style ကို `print:` variant ဖြင့် override မလုပ်နိုင်သောကြောင့်)
- Screen တွင် 56px အတိုင်း — **မျက်နှာပြင်ပေါ်တွင် ဘာမှ မပြောင်း**
- Print တွင်သာ 0 — header သည် print တွင် အမြဲ ဖျောက်ထားပြီးသားဖြစ်၍ page အားလုံးအတွက် မှန်ကန်
- A4 print (`height: 100vh`) တွင်လည်း ဤ 56px ကြောင့် စာမျက်နှာ အလွတ် ပိုထွက်နိုင်ခြေကို တစ်ပါတည်း ဖြေရှင်းပေးသည်

### မပြောင်းမည့်အရာ

- `VoucherContent.tsx`, `printPaperSize.ts` (A5 CSS ကိုယ်တိုင်တွင် ပြဿနာ မရှိကြောင်း စမ်းသပ်ပြီး)
- Header, sidebar ပုံစံ

## ၄. Verification

1. `npm run build` — အောင်မြင်ရမည်
2. Headless Chrome ဖြင့် `print:pt-0` ပါဝင်သော test HTML → 1 page
3. App ထဲတွင် (backend run ပြီး) ecommerce order တစ်ခုကို A5 ဖြင့် print preview → footer သည် စာမျက်နှာ ၁ အောက်ခြေတွင် ရှိရမည်
4. A4 နှင့် Thermal 72mm print ကိုလည်း တစ်ကြိမ်စီ စစ် — page အလွတ် မပိုရ
5. Screen ပေါ်ရှိ page အားလုံးတွင် header အောက်၌ content မဖုံးရ (56px padding ဆက်ရှိ)
