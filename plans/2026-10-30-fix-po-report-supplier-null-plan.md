# PO Report Supplier Null Error ဖြေရှင်းခြင်း Implementation Plan

- **ရက်စွဲ**: 2026-10-30
- **App**: `dashboard`
- **ပြဿနာ**: PO Report ဖွင့်ချိန်တွင် `Uncaught TypeError: Cannot read properties of null (reading 'supplierName') at getSupplierFromPurchase (purchaseReportUtils.tsx:30:22)` error တက်ပြီး မျက်နှာပြင် မပေါ်ခြင်း။

---

## ၁။ ပြဿနာ ဖြစ်ပွားရသည့် အကြောင်းရင်း (Root Cause Analysis)

`dashboard/components/PurchaseReport/purchaseReportUtils.tsx` ရှိ `getSupplierFromPurchase` function တွင်:

```ts
export const getSupplierFromPurchase = (
  supplierId: { supplierName?: string; supplierCode?: string } | string,
): { name: string; code: string } => {
  if (typeof supplierId === "string") {
    return { name: supplierId, code: "" };
  }
  return {
    name: supplierId.supplierName || "—",
    code: supplierId.supplierCode || "",
  };
};
```

Purchase order တစ်ခုတွင် `supplierId` တန်ဖိုးသည် `null` သို့မဟုတ် `undefined` ဖြစ်နေပါက (ဥပမာ - supplier မထည့်ထားသော PO သို့မဟုတ် supplier ပျက်သွားသော အခြေအနေ):
JavaScript တွင် `typeof null === "object"` ဖြစ်သောကြောင့် `typeof supplierId === "string"` သည် `false` ဖြစ်ပြီး `supplierId.supplierName` သို့ ရောက်သွားပါသည်။
ထိုအခါ `null.supplierName` ကို ဖတ်ရန်ကြိုးစားသဖြင့် `Cannot read properties of null (reading 'supplierName')` runtime exception ဖြစ်ပေါ်ရခြင်း ဖြစ်ပါသည်။

---

## ၂။ ဖြေရှင်းမည့် နည်းလမ်း (Approach)

`getSupplierFromPurchase` function တွင် `supplierId` သည် `null` သို့မဟုတ် `undefined` ဖြစ်မဖြစ် null-check အရင်စစ်ဆေးပါမည်။
`!supplierId` ဖြစ်ပါက fallback အဖြစ် `{ name: "—", code: "" }` ကို တိုက်ရိုက် return ပြန်ပေးပါမည်။

```ts
export const getSupplierFromPurchase = (
  supplierId?: { supplierName?: string; supplierCode?: string } | string | null,
): { name: string; code: string } => {
  if (!supplierId) {
    return { name: "—", code: "" };
  }
  if (typeof supplierId === "string") {
    return { name: supplierId, code: "" };
  }
  return {
    name: supplierId.supplierName || "—",
    code: supplierId.supplierCode || "",
  };
};
```

---

## ၃။ ပြင်ဆင်မည့် ဖိုင် (File to Modify)

- `dashboard/components/PurchaseReport/purchaseReportUtils.tsx`

---

## ၄။ စစ်ဆေးအတည်ပြုမည့် နည်းလမ်းများ (Verification Steps)

1. `dashboard/components/PurchaseReport/purchaseReportUtils.tsx` တွင် code comments များကို မြန်မာဘာသာဖြင့် ထည့်သွင်းထားကြောင်း စစ်ဆေးခြင်း။
2. Dashboard project ကို build စစ်ဆေးခြင်း (`npm run build` သို့မဟုတ် TypeScript check)။
3. `supplierId` က `null`၊ `undefined`၊ `string` နှင့် `{ supplierName: "..." }` ဖြစ်သည့် အခြေအနေ ၄ ခုလုံးတွင် error မတက်ဘဲ မှန်ကန်စွာ အလုပ်လုပ်ကြောင်း အတည်ပြုခြင်း။
