# Voucher Layout နှင့် Style ပြင်ဆင်ရန် အစီအစဉ် (Page Number Fix)

Voucher A4/A5 Print Layout တွင် စာမျက်နှာနံပါတ်များ (Page X of Y) နှင့် အောက်ခြေ Footer စာသားများ စာမျက်နှာတိုင်းတွင် အမှန်ကန်ဆုံး ပေါ်စေရန် React-based Pagination စနစ်သို့ ပြောင်းလဲပြင်ဆင်မည်။

## Proposed Changes

### 1. Print Utilities Layer

#### [MODIFY] [printPaperSize.ts](file:///c:/Users/PC/Desktop/Pyi-Taw-Tar/dashboard/utils/printPaperSize.ts)
- `.voucher-page` class အား styling ထည့်သွင်းမည်။ 
- screen နှင့် print mode များတွင် စာမျက်နှာတစ်ခုချင်းစီသည် စက္ကူအရွယ်အစားအတိုင်း (A4/A5) သီးခြားစီ တိကျစွာ ပိုင်းခြားပြသနိုင်ရန် `min-height`, `page-break-after: always` နှင့် flex layout အသုံးပြု၍ footer အား အောက်ဆုံးသို့ ကပ်ထားမည်။

### 2. Print Components Layer

#### [MODIFY] [VoucherContent.tsx](file:///c:/Users/PC/Desktop/Pyi-Taw-Tar/dashboard/components/Print/VoucherContent.tsx)
- **Pagination Logic**:
  - A5 အတွက် စာမျက်နှာတစ်ခုလျှင် ၆ ခုနှုန်း၊ A4 အတွက် ၁၂ ခုနှုန်းဖြင့် ကုန်ပစ္စည်းများကို Slice လုပ်ပြီး Page ခွဲထုတ်မည်။
  - စာမျက်နှာတိုင်းအတွက် Header (ပထမစာမျက်နှာတွင် full header၊ နောက်စာမျက်နှာများတွင် simple header) နှင့် Table အား သီးခြားစီ Render ပြုလုပ်မည်။
  - Summary Box နှင့် Checklist Table တို့ကို နောက်ဆုံးစာမျက်နှာ (Last Page) တွင်သာ ပြသမည်။
  - အောက်ခြေ Footer (`Vr.No`, `Printed by`, `Page X / Y`) အား **စာမျက်နှာတိုင်း၏ အောက်ဆုံးတွင်** ထည့်သွင်းပြသမည်။

---

## Verification Plan

### Manual Verification
- အရောင်းတစ်ခုအား A4/A5 အရွယ်အစားဖြင့် Print Preview ကြည့်ရှုပြီး စာမျက်နှာ ၁ နှင့် စာမျက်နှာ ၂ (ရှိပါက) တို့တွင် စာမျက်နှာနံပါတ် `Page 1 / 2` နှင့် `Page 2 / 2` ဟု မှန်ကန်စွာ ပေါ်မပေါ် စစ်ဆေးမည်။
- `npm run build` ဖြင့် compile စစ်ဆေးမည်။
