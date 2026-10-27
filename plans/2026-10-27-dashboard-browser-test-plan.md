# Dashboard Browser Test Plan — Responsive + i18n စစ်ဆေးခြင်း (Antigravity အတွက်)

- **ရက်စွဲ:** 2026-10-27
- **အခြေအနေ:** ⏳ စစ်ဆေးရန် စောင့်ဆိုင်းဆဲ
- **စစ်မည့်အရာ:** [`2026-10-27-dashboard-ui-fixes-plan.md`](./2026-10-27-dashboard-ui-fixes-plan.md) နှင့် [`2026-10-27-dashboard-i18n-followup-plan.md`](./2026-10-27-dashboard-i18n-followup-plan.md) ၏ ပြင်ဆင်ချက်များ (working tree — commit မလုပ်ရသေး)
- **ရလဒ်ရေးမည့်ဖိုင်:** `dashboard/plans/2026-10-27-dashboard-browser-test-report.md` (§8 template အတိုင်း)

---

## 0. စည်းမျဉ်း

1. **Production DB ကို လုံးဝ မထိရ** — ဖတ်ခြင်းပါ မလုပ်ရ။ Test DB `uomtest` ကိုသာ သုံး (§1)
2. ဤ test သည် **စစ်ဆေးခြင်းသာ** — test အတွင်း code **မပြင်ရ**။ Fail ဖြစ်လျှင် report တွင် မှတ်ပြီး ဆက်စစ်
3. Commit / push မလုပ်ရ
4. ရလဒ်တိုင်းကို **အထောက်အထား** (JS output / screenshot path) ဖြင့် ရေး — "ပြီး" / "pass" ဟု အထောက်အထားမပါဘဲ မရေးရ
5. Test ပြီးလျှင် §7 cleanup မဖြစ်မနေ လုပ်
6. ပြန်ဖြေချက် — မြန်မာလို

---

## 1. Test environment ပြင်ဆင်ခြင်း

### 1.1 Demo data (backend/ မှ)
`backend/scripts/_tmp-seed-dash.js` ကို ယာယီ ဖန်တီး (test ပြီး ဖျက်):

```js
// ယာယီ — dashboard browser test အတွက် uomtest DB တွင်သာ demo data (စစ်ပြီး ဖျက်မည်)
import dns from "dns"; import dotenv from "dotenv"; import mongoose from "mongoose";
import Admin from "../src/models/admin.model.js";
import Customer from "../src/models/customer.model.js";
import Inventory from "../src/models/inventory.model.js";
import LocationProfile from "../src/models/locationProfile.model.js";
import StorefrontInventory from "../src/models/storefrontInventory.model.js";
import WarehouseStock from "../src/models/warehouse.model.js";
import SupplierProfile from "../src/models/supplierProfile.model.js";
import EcommerceOrder from "../src/models/ecommerceOrder.model.js";
dns.setServers(["1.1.1.1", "8.8.8.8"]); dotenv.config();
await mongoose.connect(process.env.MONGODB_URI.replace("/production", "/uomtest"));
// production ကို မထိမိစေရန် — DB နာမည် မမှန်လျှင် ရပ်
if (mongoose.connection.name !== "uomtest") throw new Error("wrong db: " + mongoose.connection.name);
await mongoose.connection.db.dropDatabase();
await Admin.create({ name: "owner", password: "123456", confirmPassword: "123456", role: "owner" }); // createAdmin.js ၏ seed အကောင့်
const sf = await LocationProfile.create({ type: "storefront", locationCode: "SF-001", locationName: "ပြည်တော်သာ ဆိုင်ခွဲ (၁)", locationAddress: "ရန်ကုန်", locationPhone: "09111111111" });
const wh = await LocationProfile.create({ type: "warehouse", locationCode: "WH-001", locationName: "ပင်မ ဂိုဒေါင်", locationAddress: "ရန်ကုန်", locationPhone: "09111111112" });
await SupplierProfile.insertMany(["Fame Pharma", "Mega Lifesciences", "AA Medical"].map((supplierName) => ({ supplierName })));
const items = [
  ["Biogesic 500mg", "Paracetamol", "Fame", 1200], ["Oramin-G", "Multivitamin", "Mega", 3150], ["Appeton Lysine", "Lysine", "Appeton", 18500],
  ["Silkron Cream", "Clotrimazole", "Fame", 3200], ["Neurobion", "Vitamin B", "Merck", 1050], ["Strepsils Honey Lemon", "Amylmetacresol", "Reckitt", 2800],
  ["Amoxicillin 500mg", "Amoxicillin", "AA", 2500], ["Vitamin C 1000mg", "Ascorbic acid", "Mega", 4500], ["Zinc Tablets", "Zinc", "AA", 1800],
  ["Alfalfa(O)အယ်လ်ဖာဖာအားဆေး", "Alfalfa", "Fame", 9000], ["Decolgen Forte", "Paracetamol", "Fame", 900], ["Omeprazole 20mg", "Omeprazole", "AA", 3000],
];
const invs = [];
for (const [i, [name, chem, brand, price]] of items.entries()) {
  const inv = await Inventory.create({ productName: name, productCode: `P${String(i + 1).padStart(3, "0")}`, category: "Medicine", subCategory: i % 2 ? "Vitamin" : "Pain Relief", brand, chemicalNames: [chem], buyingPrice: Math.round(price * 0.8), sellingPrice: price, unitOfMeasure: "ဘူး", uomConversions: [{ unit: "ပုံး", factor: 10 }, { unit: "ဖာ", factor: 120 }], status: "active", ecommerceMaxPerUser: i < 2 ? 20 : null });
  invs.push(inv);
  await StorefrontInventory.create({ storefrontId: sf._id, inventoryId: inv._id, quantity: i === 9 ? 0 : 40 + i * 7 });
  await WarehouseStock.create({ inventoryId: inv._id, warehouseId: wh._id, quantity: 200 + i * 15 });
}
const custs = await Customer.create([
  { name: "Test Customer", phone: "09222222222", password: "password123", address: "အမှတ် ၁၂၊ ဗိုလ်ချုပ်လမ်း", township: "ကမာရွတ်" },
  { name: "Daw Aye Aye", phone: "09333333333", password: "password123", tier: "gold" },
  { name: "U Kyaw Kyaw", phone: "09444444444", password: "password123" },
]);
const line = (inv, q) => ({ inventoryId: inv._id, productName: inv.productName, productCode: inv.productCode, unit: "ဘူး", quantity: q, factor: 1, baseQuantity: q, unitPrice: inv.sellingPrice, subtotal: q * inv.sellingPrice });
for (const [i, [status, lines]] of [["pending", [line(invs[0], 3), line(invs[1], 2)]], ["pending", [line(invs[2], 1)]], ["delivered", [line(invs[4], 10)]], ["cancelled", [line(invs[5], 2)]]].entries()) {
  await EcommerceOrder.create({ orderNumber: `ECO-20261027-${String(i + 1).padStart(6, "0")}`, customerId: custs[i % 3]._id, products: lines, totalAmount: lines.reduce((a, l) => a + l.subtotal, 0), status, shippingAddress: { addressLine: "အမှတ် ၁၂", city: "ကမာရွတ်" } });
}
console.log(JSON.stringify({ SF: sf._id.toString(), invs: invs.slice(0, 6).map((x) => ({ id: x._id.toString(), price: x.sellingPrice })) }));
await mongoose.disconnect();
```
```bash
cd backend && node scripts/_tmp-seed-dash.js      # output ၏ SF id နှင့် invs ကို မှတ်ထား
```

### 1.2 Test backend (port 5055)
```bash
cd backend
URI=$(grep '^MONGODB_URI=' .env | cut -d= -f2- | tr -d '"\r' | sed 's#/production#/uomtest#')
MONGODB_URI="$URI" ECOMMERCE_STOREFRONT_ID=<SF id> PORT=5055 node src/server.js
```
- Log တွင် `Database Connected` ပေါ်ရမည်

### 1.3 POS order ၅ ခု (Reports / Orders / Credit page တွင် data ရှိစေရန်)
`POST http://localhost:5055/api/v1/admin/login` (`{ name: "owner", password: "123456" }`) → token ဖြင့် `POST /api/v1/order` ၅ ကြိမ်:
```json
{ "saleType": "storefront", "storefrontId": "<SF id>", "customerName": "Walk-in",
  "ordersProducts": [{ "inventoryId": "<inv id>", "quantity": 5, "unit": "ဘူး", "unitPrice": <price> }],
  "subTotal": <sum>, "finalAmount": <sum>, "paidAmount": <sum>, "paymentType": "paid", "paymentMethod": "cash" }
```
- ၅ ခုထဲမှ ၁ ခုကို `"customerName": "Daw Aye Aye", "paymentType": "credit", "paidAmount": <sum/2>`, ၁ ခုကို `"paymentMethod": "kpay"`
- ၅ ခုလုံး `201` ရမည်

### 1.4 Dashboard build + preview (port 3000 — backend CORS ခွင့်ပြုထား)
```bash
cd dashboard
VITE_API_BASE_URL=http://localhost:5055/api/v1/ npx vite build --outDir <temp-dir>/dash-dist --emptyOutDir
npx vite preview --outDir <temp-dir>/dash-dist --port 3000 --strictPort --host 127.0.0.1
```
- **Dev server (`npm run dev`) မသုံးရ** — StrictMode ကြောင့် API ၂ ကြိမ်ခေါ်၍ Phase 5 ရလဒ် မှားနိုင်
- Build ထဲတွင် `localhost:5055` ပါကြောင်း စစ်: `grep -o "localhost:5055" <temp-dir>/dash-dist/assets/*.js | head -1`

### 1.5 Login
- `http://127.0.0.1:3000/login` → name `owner`, password `123456` → `/pos` သို့ ရောက်ရမည်

---

## 2. စစ်ဆေးရေး JS helper (browser console တွင် page တစ်ခါဖွင့်တိုင်း paste လုပ်၍ သုံး)

```js
// Page တစ်ခုကို audit — English UI စာ / horizontal scroll / ခလုတ်အရွယ် / console warning
window.__testWarnings = window.__testWarnings || [];
if (!window.__warnHooked) {
  const orig = console.warn;
  console.warn = (...a) => { window.__testWarnings.push(a.join(" ")); orig(...a); };
  window.__warnHooked = true;
}
// demo data ထဲမှ English (ပစ္စည်းအမည်/brand/လူအမည်) — UI စာ မဟုတ်၍ ချန်
const DATA_WORDS = ["Biogesic","Oramin","Appeton","Lysine","Silkron","Cream","Neurobion","Strepsils","Honey","Lemon","Amoxicillin","Vitamin","Zinc","Tablets","Alfalfa","Decolgen","Forte","Omeprazole","Medicine","Pain","Relief","Fame","Mega","Merck","Reckitt","AA","Pharma","Lifesciences","Medical","Test","Customer","Daw","Aye","U","Kyaw","Walk-in","owner","Paracetamol","Multivitamin","Clotrimazole","Amylmetacresol","Ascorbic","acid","Pyi-Taw-Tar","POS"];
// ဘာသာမပြန်ရ ဟု သတ်မှတ်ထားသော စကားလုံး (plan rule)
const ALLOWED = ["MMK","Ks","PO","GRN","SKU","FOC","MMQR","KBZ","Pay","Wave","AYA","UAB","KPay","WavePay","Silver","Gold","Platinum","Excel","AI","ID","QR","COD"];
window.__audit = () => {
  const ok = new Set([...DATA_WORDS, ...ALLOWED]);
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  const english = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode, el = n.parentElement, txt = n.textContent.trim();
    if (!txt || !el || !vis(el) || el.closest("script,style,code")) continue;
    const words = txt.match(/[A-Za-z][A-Za-z'-]{2,}/g) || [];
    const bad = words.filter((w) => !ok.has(w) && !/^(ECO|ORD|TRF|P\d)/.test(w));
    if (bad.length && !/[က-႟]/.test(txt)) english.add(txt.slice(0, 50));
  }
  document.querySelectorAll("input[placeholder],[title],[aria-label]").forEach((el) => {
    ["placeholder", "title", "aria-label"].forEach((a) => {
      const v = el.getAttribute(a); if (v && /^[A-Za-z][A-Za-z ]{3,}$/.test(v) && !v.split(" ").every((w) => ok.has(w))) english.add(`[${a}] ${v}`);
    });
  });
  const small = [...document.querySelectorAll("button,a,[role=button],select")].filter(vis)
    .filter((e) => { const r = e.getBoundingClientRect(); return r.height < 28 || r.width < 28; })
    .map((e) => (e.innerText || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 20));
  return {
    path: location.pathname, lang: document.documentElement.lang, storedLang: localStorage.getItem("language"),
    width: innerWidth, horizontalScroll: document.documentElement.scrollWidth > innerWidth + 1,
    englishCount: english.size, english: [...english].slice(0, 30),
    smallButtons: small.length, smallSample: [...new Set(small)].slice(0, 8),
    translationMissing: window.__testWarnings.filter((w) => w.includes("Translation missing")),
  };
};
```
- **ဘာသာပြောင်း** — `localStorage.setItem("language","my")` (သို့ `"en"`) ပြီး `location.reload()` (သို့ header ၏ 🌐 language ခလုတ်)
- Reload ပြီးလျှင် helper ကို ပြန် paste လုပ်ရမည်

---

## 3. Test case — i18n (မြန်မာ mode)

Viewport **1366×800** နှင့် **390×844** နှစ်မျိုးလုံးတွင်။ Page တိုင်း ဖွင့်ပြီး ~2 စက္ကန့်စောင့် → `__audit()` → output ကို report ထဲ ကူး + screenshot ၁ ပုံ (1366 / 390 တစ်ပုံစီ)

| ID | Route | ထပ်လုပ်ရမည့် action |
|---|---|---|
| I-01 | `/pos` | ပစ္စည်း ၁ ခု cart ထည့် → checkout modal ဖွင့် (audit) → ပိတ် |
| I-02 | `/quick-sale` | brand တစ်ခုနှိပ် → ပစ္စည်း modal ဖွင့် (audit) |
| I-03 | `/inventory` | ပထမ row ၏ အသေးစိတ် modal ဖွင့် (audit) |
| I-04 | `/orders` | ပထမ order ၏ "ကြည့်" modal ဖွင့် (audit) |
| I-05 | `/order-fulfillment` | — |
| I-06 | `/credit-orders` | — |
| I-07 | `/admin/ecommerce-orders` | ပထမ order detail modal (audit) |
| I-08 | `/customers` | customer detail modal (tier "သာမန်" / Gold ပြ) |
| I-09 | `/storefront`, `/storefront/:id` | detail page |
| I-10 | `/warehouse`, `/warehouse/:id` | detail page — Transfer / Clear Filters ခလုတ် (390px တွင် အတိုစာ) |
| I-11 | `/suppliers`, `/suppliers/:id` | — |
| I-12 | `/purchasing` | PO / GRN / Transfer tab အားလုံး |
| I-13 | `/purchase-report` | Overview / By Product / By Supplier tab အားလုံး; **PO status badge** စာကို အထူးမှတ် |
| I-14 | `/reports` | tab အားလုံး (Overall, Paid, Credit, Sale Statistics, FOC) |
| I-15 | `/credits` | — |
| I-16 | `/expenses` | — |
| I-17 | `/quotations` | — |
| I-18 | `/settings` | tab အားလုံး (Shop Settings, Stock Audit Logs, Transfer, Activity Log — filter dropdown ဖွင့်) |
| I-19 | `/accounts` | 390px တွင် mobile label (Name/Role/Location/Status ၏ မြန်မာ) |
| I-20 | Sidebar (☰) | group / link အမည် ထပ်မနေ — "အော်ဒါ စီမံခြင်း" / "ရောင်းချမှု အော်ဒါများ", "ဝယ်ယူရေး" / "ဝယ်ယူမှု အော်ဒါ (PO)", "အီးကော်မတ်" |

**Pass စံ** — `englishCount === 0` (ကျန်ပါက စာတစ်ခုချင်း ချွင်းချက်ဟုတ်/မဟုတ် report တွင် ရှင်းပြ), `translationMissing` ဗလာ, `lang === "my"`

### သိထားပြီးသော fail ဖြစ်နိုင်ခြေ (မှန်ကန်ကြောင်း အတည်ပြုရန်)
- I-13 — `components/PurchaseReport/purchaseReportUtils.tsx:69` က `{style.label}` (English "Pending/Confirmed/Arrived/Completed/Cancelled") ကို render — **fail ဖြစ်ရန် မျှော်လင့်**
- `translations/my.ts` တွင် English အတိုင်းကျန်သော value ၁၆ ခု (ဥပမာ `inventory.batchBarcode`, `inventory.createDate`, `fulfillment.modalTitle`, `quotation.status.draft`) — ပေါ်သည့် page တွင် မှတ်
- Activity log admin နာမည် fallback `"Unknown"` (`components/Settings/activityLogUtils.ts:42,47`)

---

## 4. Test case — i18n (English mode)

`localStorage.setItem("language","en"); location.reload()` → I-01, I-03, I-07, I-13, I-14, I-18, I-19 ကို 1366px တွင် ပြန်ဖွင့်
- **Pass စံ** — page တွင် key နာမည် (`reports.xxx`, `settings.xxx` ကဲ့သို့ `.` ပါသော camelCase) **မပေါ်**; မြန်မာစာ မရော (data မှလွဲ၍); `lang === "en"`; `translationMissing` ဗလာ
- စစ်ရန် JS: `[...document.body.innerText.matchAll(/\b[a-z]+[A-Z]?\w*\.[a-z]\w+\b/g)].map(m=>m[0]).slice(0,20)` — ဗလာ ဖြစ်ရမည်
- ပြီးလျှင် `localStorage.setItem("language","my")` ပြန်ထား

---

## 5. Test case — Responsive / layout

| ID | Viewport | Route | လုပ်ရမည် | Pass စံ |
|---|---|---|---|---|
| R-01 | 390×844 | `/pos` | — | product grid **2 column**; search input အကျယ် ≥ 300px; `horizontalScroll false` |
| R-02 | 390×844 | `/pos` | ပစ္စည်း ၂ ခု ထည့် | အောက်ခြေ bar ပေါ် — item အရေအတွက် 2 နှင့် စုစုပေါင်းငွေ မှန် |
| R-03 | 390×844 | `/pos` | bar ၏ "ငွေရှင်းမယ်" နှိပ် | Cart drawer အောက်မှ ပေါ် (အမြင့် ~85vh), ✕ နှင့် backdrop နှိပ်လျှင် ပိတ် |
| R-04 | 390×844 | `/pos` | drawer → checkout → **ငွေသား၊ order တင်** | Success modal; order `/orders` တွင် ပေါ် (test DB သာ) |
| R-05 | 768×1024 | `/pos` | — | grid **3 column**; ဆိုင်ရွေး dropdown အပြည့်မြင် (ဖြတ်မခံရ) |
| R-06 | 1366×800 | `/pos` | — | cart ဘေးတွင် ကပ်လျက် (drawer မဟုတ်), bottom bar **မပေါ်**; ယခင်အတိုင်း |
| R-07 | 390×844 | `/direct-sale` | ပစ္စည်း ၁ ခု ထည့် | R-01–R-03 အတိုင်း |
| R-08 | 390×844 | `/admin/ecommerce-orders` | — | table မဟုတ်ဘဲ **card list**; order number ၁ ကြောင်းတည်း; card ၏ View / status dropdown နှိပ်ရ |
| R-09 | 1366×800 | `/admin/ecommerce-orders` | — | table view |
| R-10 | 390×844 | `/inventory` | — | row action ခလုတ် ≥ 36px (`smallButtons` တွင် မပါ) |
| R-11 | 390×844 | page ၂၀ လုံး (§3) | `__audit()` | `horizontalScroll false` အားလုံး |

**POS barcode (desktop regression)** — 1366px `/pos` တွင် search input ကို focus ဖြစ်နေကြောင်း (`document.activeElement.classList.contains("search-input")`) နှင့် ပစ္စည်း code `P001` ရိုက် Enter → cart ထဲ ရောက်/မရောက် မှတ်

---

## 6. Phase 5 — API request ထပ်ခေါ်ခြင်း (production build ဖြင့်သာ)

1366px, DevTools Network tab (Fetch/XHR) ကို clear → page ဖွင့် → request စာရင်း ကူး
| Route | စစ်ရမည့် request | Pass စံ |
|---|---|---|
| `/pos` | `storefront-profile`, `inventory/categories`, `credit-persona` | တစ်ခုစီ **၁ ကြိမ်** |
| `/order-fulfillment` | `fulfillment/pending` | ၁ ကြိမ် |
| `/reports` | `sale-report` | params တူ request ၁ ကြိမ် |
| `/settings` | `location-profile` | ၁ ကြိမ် |
- JS ဖြင့်: `performance.getEntriesByType("resource").filter(e=>e.name.includes("5055")).map(e=>e.name.split("/api/v1/")[1])` (page မဖွင့်မီ `performance.clearResourceTimings()`)
- ၁ ကြိမ်ထက်ပိုလျှင် **fail** — ဘယ် request ဘယ်နှကြိမ် report တွင်ရေး (ယခင် report ၏ "StrictMode ကြောင့်သာ" ဟူသော ဆိုချက်ကို ဤ test ဖြင့် အတည်ပြု/ငြင်း)

---

## 7. Cleanup (မဖြစ်မနေ)
1. Preview server (3000) နှင့် test backend (5055) ရပ် — port မကျန်ကြောင်း စစ်
2. uomtest DB drop (connection name `uomtest` ဖြစ်ကြောင်း assert ပြီးမှ):
   ```js
   await mongoose.connect(process.env.MONGODB_URI.replace("/production", "/uomtest"));
   if (mongoose.connection.name !== "uomtest") throw new Error("wrong db");
   await mongoose.connection.db.dropDatabase();
   ```
3. `backend/scripts/_tmp-*.js` ဖိုင်များ ဖျက်; temp build dir ဖျက်
4. `git status` — backend / dashboard တွင် test ကြောင့် ဖိုင်အသစ် / ပြောင်းလဲမှု မကျန် (dashboard ၏ ယခင် ပြင်ဆင်ချက် ၈၈ ဖိုင်မှလွဲ၍)

---

## 8. Report template (`2026-10-27-dashboard-browser-test-report.md`)

```markdown
# Dashboard Browser Test Report
- ရက်စွဲ / စစ်သူ:
- Build hash (dist/assets/index-*.js):
- Environment: uomtest DB / port 5055 / preview 3000 (production မထိ)

## အနှစ်ချုပ်
| အပိုင်း | Pass | Fail | မှတ်ချက် |
|---|---|---|---|
| i18n မြန်မာ (I-01–I-20) × 2 viewport | | | |
| i18n English (§4) | | | |
| Responsive (R-01–R-11) | | | |
| API request (§6) | | | |

## Fail စာရင်း (အရေးကြီးမှုအလိုက်)
| ID | Route / viewport | တွေ့ရှိချက် (English စာ / ပြဿနာ) | ဖိုင်:line (ရှာတွေ့လျှင်) | screenshot |
|---|---|---|---|---|

## Test case တစ်ခုချင်း ရလဒ်
### I-01 /pos — 1366
`__audit()` output:
```json
{ ... }
```
screenshot: …
(… case တိုင်း)

## Cleanup
- server ရပ်ပြီး: / DB drop: / temp ဖိုင်ဖျက်: / git status:
```
