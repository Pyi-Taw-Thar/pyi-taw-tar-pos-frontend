# Implementation Plan: Ecommerce Order Detail Modal မှ ဒုတိယ Customer Information ကတ် ဖယ်ရှားခြင်း

## 🎯 ၁။ ရည်ရွယ်ချက် (Objective)
`EcommerceOrderDetailModal` တွင် Customer အမည်နှင့် ဖုန်းနံပါတ် ပြသထားသော ပထမ `Customer Information` ကတ် (အစိမ်းနုရောင်) တစ်ခုတည်းကိုသာ ထားရှိပြီး၊ ညာဘက်ခြမ်းရှိ မလိုအပ်သော ဒုတိယ `Customer Information` (`[Main] -, -`) ကတ်ကို ဖယ်ရှားရန် ဖြစ်ပါသည်။

---

## 🛠️ ၂။ ပြင်ဆင်မည့် ဖိုင်နှင့် အသေးစိတ်အစီအစဉ်

### [MODIFY] `dashboard/components/Ecommerce/EcommerceOrderDetailModal.tsx`
- လိုင်း `164-178` ရှိ ဒုတိယ `Customer Information` (`order.shippingAddress`) `<div>` block ကို ဖယ်ရှားမည်။
- ကျန်ရှိသော ပထမ `Customer Information` ကတ်ကို သပ်ရပ်စွာ ပေါ်နေစေရန် `mb-6` ဖြင့် ထားရှိမည်။

---

## ✅ ၃။ စစ်ဆေးအတည်ပြုမည့် အဆင့်များ (Verification Steps)
- `EcommerceOrderDetailModal.tsx` ကို ပြင်ဆင်ပြီး `npm --prefix dashboard run build` ဖြင့် Error ကင်းရှင်းကြောင်း စစ်ဆေးမည်။
