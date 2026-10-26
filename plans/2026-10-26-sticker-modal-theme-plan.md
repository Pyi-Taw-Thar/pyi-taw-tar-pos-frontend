# Batch Barcode Sticker Modal — Dashboard Theme နှင့် ကိုက်အောင် ပြင်ရန် Plan

- **ရက်စွဲ:** 2026-10-26
- **အခြေအနေ:** ✅ ပြီး (2026-10-26) — User က **B** (နေရာ ၂ ခုလုံးမှ copies/print ဖယ်) ကို ရွေး; build pass, dark mode browser ဖြင့် စစ်ပြီး

## ၁. ရည်ရွယ်ချက်
`components/Common/BatchBarcodeStickerModal.tsx` ကို —
1. Dashboard ၏ modal ပုံစံ (light theme) နှင့် ကိုက်အောင် ပြင်ရန်
2. **"ထုတ်မည့် အရေအတွက် (Copies)"** input နှင့် **"Sticker ပရင့်ထုတ်မည်"** ခလုတ်ကို ဖယ်ရန်

## ၂. လက်ရှိပြဿနာ
- Modal တွင် `dark:` class များ ပါ၍ OS က dark mode ဆိုလျှင် **အမည်း theme** ဖြင့် ပေါ်သည် — dashboard ၏ အခြား modal များ (`ProductDetailModal`, `BatchBarcodeModal`) တွင် `dark:` မသုံး၍ မကိုက်
- Header မပါ (title ကို body ထဲတွင်သာ), ခလုတ်အရောင် `bg-blue-600` (dashboard primary = green)

## ၃. Dashboard modal pattern (ProductDetailModal / BatchBarcodeModal အတိုင်း)
```
Overlay : fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
Card    : bg-white rounded-xl shadow-2xl max-w-md
Header  : flex justify-between p-4 border-b bg-slate-50
          <h3 font-bold text-base text-slate-800> 🏷 icon + title
          close: p-1 hover:bg-slate-200 rounded-lg text-slate-500
Body    : p-5 space-y-4
Footer  : p-4 border-t bg-white, ခလုတ် border-slate-300 / bg-primary
```

## ၄. ပြောင်းလဲမှု
| အပိုင်း | ပြောင်းလဲမှု |
|---|---|
| Theme | `dark:` class အားလုံး ဖယ်; slate/primary အရောင်ဖြင့် အစားထိုး |
| Header | Title + close ခလုတ်ကို `bg-slate-50 border-b` header ထဲ ရွှေ့ |
| Preview | Sticker preview (barcode, unit, batch, expiry, စျေး) ကို `bg-slate-50 border-dashed border-slate-300` box ထဲ ဆက်ထား |
| Unit | Dropdown — `border-slate-300 focus:ring-primary` ပုံစံ; "Scan တစ်ကြိမ် = 10 ဘူး" ဆက်ပြ |
| Copies | **ဖယ်** |
| Print ခလုတ် | **ဖယ်** — footer တွင် "ပိတ်မည်" တစ်ခုတည်း ကျန် |

## ⚠️ ၅. ဆုံးဖြတ်ရန် — Print ကို ဘယ်နေရာမှာ ဖယ်မလဲ
ဤ modal ကို **နေရာ ၂ ခု** မှ သုံးသည် —
- **Product detail → Batches** (screenshot ပါ နေရာ)
- **GRN detail** — PO မှ ပစ္စည်းလက်ခံပြီး sticker **ထုတ်သည့် တစ်ခုတည်းသော နေရာ**

| ရွေးချယ်ချက် | ရလဒ် |
|---|---|
| **A. (အကြံပြု)** `printable` prop ထည့် — Product detail = ကြည့်ရုံ (copies/print မပါ), GRN = ယခုအတိုင်း print ရ | GRN မှ sticker ဆက်ထုတ်နိုင် |
| B. နေရာ ၂ ခုလုံးမှ ဖယ် | **Sticker ထုတ်၍ မရတော့** — unit barcode ကို ပုံး/ဖာ ပေါ် ကပ်ရန် လမ်းမရှိ |

> A ကို ရွေးလျှင် GRN modal ကိုလည်း ဤ theme အတိုင်း ပြင်မည် (copies + print ခလုတ်ကို primary green ဖြင့် ထား)။

## ၆. စစ်ဆေးမည့်နည်း
1. `npm run build`
2. Browser (test backend + OS dark mode) — Product detail sticker modal light theme ဖြင့်ပေါ်, copies/print မပါ, unit ပြောင်းလျှင် barcode/label/စျေး ပြောင်း
3. GRN detail sticker modal — (A ဆိုလျှင်) print ဆက်ရ
