# Dashboard — Sidebar အစား Card Menu Page + E-commerce Mode (POS ယာယီဖျောက်) Plan (v2 — Antigravity အတွက်)

- **ရက်စွဲ:** 2026-10-27
- **အခြေအနေ:** ⏳ အကောင်အထည်ဖော်ရန် စောင့်ဆိုင်းဆဲ
- **v2 ပြောင်းလဲချက်:** User တောင်းဆိုချက်အရ menu တွင် **အသုံးစရိတ်, အစီရင်ခံစာများ, AI လက်ထောက်** ပါ ထည့် (v1 တွင် ဖျောက်ထားခဲ့)
- **Antigravity ကို ပေးမည့် prompt:** [`2026-10-27-card-menu-antigravity-prompt.md`](./2026-10-27-card-menu-antigravity-prompt.md)

---

## 0. Agent စည်းမျဉ်း (မဖြစ်မနေ)

1. ပြန်ဖြေချက် / code comment — **မြန်မာလို** (`AGENTS.md`, `CLAUDE.md`)
2. **စမစတင်မီ** — `git status` စစ်ပါ။ ယခင် UI/i18n ပြင်ဆင်ချက် (commit မလုပ်ရသေးသော ဖိုင်များ) ရှိနေလျှင် **user ကို "အရင် commit လုပ်မလား" မေးပြီး အဖြေရမှ** စ (ပြင်ဆင်ချက် ၂ မျိုး မရောစေရန်)။ ကိုယ်တိုင် commit / push **မလုပ်ရ**
3. Backend မပြောင်း; menu မှ ဖွင့်မည့် page များ၏ **အတွင်းပိုင်း / logic မပြောင်း**
4. Dependency အသစ် မထည့်; Tailwind CDN ၏ ရှိပြီးသား class + theme (`#1E2937` header, primary green `#4CAF50`, `#F8F9FA` bg, Inter) သာ
5. **Code မဖျက်** — ဖျောက်မည့် page / `Sidebar.tsx` ဖိုင်များ ကျန်ရမည် (flag ဖြင့် ပြန်ဖွင့်ရန်)
6. UI စာတိုင်း `t()` — `translations/my.ts` + `en.ts` **နှစ်ခုလုံး** (parity 0 ဖြစ်ရမည်)
7. "ပြီး" ဟု report မရေးမီ §6 စစ်ဆေးချက်အားလုံး run ပြီး output ကို report ထဲ ကူး

---

## ၁. လက်ရှိအခြေအနေ (code နေရာ)

| နေရာ | လက်ရှိ |
|---|---|
| `App.tsx` `AppLayout` (line ~42-88) | Header (☰ `Menu` icon → `setSidebarOpen(true)`, "Pyi-Taw-Tar POS", `LanguageSwitcher`) + `<Sidebar isOpen onClose />` |
| `App.tsx` route `/` | `<Navigate to="/pos" replace />` |
| `App.tsx` route များ (line ~89-126) | `/pos` … `/print-receipt/:orderId` — `ProtectedRoute` > `AppLayout` အောက် |
| `pages/Login.tsx:18, 56` | login ပြီး `navigate("/pos")` |
| `pages/PurchaseReport.tsx:49` | role မရှိလျှင် `<Navigate to="/pos" />` |
| `components/Sidebar.tsx` | `menuGroups` (line ~84-236) — item တိုင်း `path`, `label: t("sidebar.*")`, `icon` (lucide), `roles?`; `canAccessChild(child, role)`; role = `localStorage("adminData").role` သို့ `useApp().currentUser.role`; အောက်ခြေ Settings link + `handleLogout` (`removeAuthToken()`, `localStorage.removeItem("adminData")`, toast `sidebar.loggedOut`, `navigate("/login")`) |

---

## ၂. Menu တွင် ပြမည့် card (section ၅ ခု / card ၁၄ ခု)

| Section (`menu.section*`) | Card | Route | Icon (Sidebar အတိုင်း) | Roles | Label key (ရှိပြီးသား) |
|---|---|---|---|---|---|
| **အွန်လိုင်း အရောင်း** | အီးကော်မတ် အော်ဒါများ | `/admin/ecommerce-orders` | `ShoppingBag` | admin, owner | `sidebar.ecommerceOrders` |
| | အော်ဒါ ထုတ်ပိုးစစ်ဆေးခြင်း | `/order-fulfillment` | `PackageCheck` | (မကန့်) | `sidebar.orderFulfillment` |
| | ဖောက်သည်များ | `/customers` | `Users` | admin, owner | `sidebar.customers` |
| **ကုန်ပစ္စည်း နှင့် စတော့** | ကုန်ပစ္စည်းစာရင်း | `/inventory` | `Package` | admin, owner | `sidebar.inventory` |
| | ကုန်လှောင်ရုံ | `/warehouse` | `Truck` | admin, owner | `sidebar.warehouse` |
| | ဆိုင်ခန်း | `/storefront` | `Store` | (မကန့်) | `sidebar.storefront` |
| **ဝယ်ယူရေး** | ဝယ်ယူမှု အော်ဒါ (PO) | `/purchasing` | `ShoppingBag` | admin, owner | `sidebar.purchasing` |
| | ပစ္စည်း သွင်းသူများ | `/suppliers` | `Users` | admin, owner | `sidebar.suppliers` |
| | PO အစီရင်ခံစာ | `/purchase-report` | `ClipboardList` | admin, owner | `sidebar.purchaseReport` |
| **ငွေကြေး နှင့် အစီရင်ခံစာ** | အထွေထွေ အသုံးစရိတ် | `/expenses` | `PieChart` | (မကန့်) | `sidebar.expenses` |
| | အစီရင်ခံစာများ | `/reports` | `LayoutDashboard` | (မကန့်) | `sidebar.reports` |
| **စနစ်** | AI လက်ထောက် | `/ai-chat` | `MessageSquare` | (မကန့်) | `sidebar.aiAssistant` |
| | အကောင့်စီမံခန့်ခွဲမှု | `/accounts` | `Shield` | owner | `sidebar.accountManagement` |
| | ဆက်တင်များ | `/settings` | `Settings` | (မကန့်) | `sidebar.settings` |

- Card description (တစ်ကြောင်း, `menu.desc.*` key အသစ်) — ဥပမာ: "အော်ဒါ စစ်ဆေး / ဂိုဒေါင်သို့ ပို့", "barcode scan ဖြင့် ထုပ်ပိုး", "ဖောက်သည် အကောင့် / tier", "ပစ္စည်း၊ ဈေး၊ unit", "ဂိုဒေါင် စတော့", "ဆိုင်ခန်း စတော့", "PO ဖွင့် / GRN လက်ခံ", "ပစ္စည်းသွင်းသူ စာရင်း", "PO ငွေ/ပစ္စည်း အခြေအနေ", "နေ့စဉ် အသုံးစရိတ်", "အရောင်း / ဝင်ငွေ အစီရင်ခံစာ", "မြန်မာလို မေးမြန်းရန်", "ဝန်ထမ်း အကောင့်", "ဆိုင် အချက်အလက် / မှတ်တမ်း"
- `roles` — Sidebar ၏ ယခုတန်ဖိုးအတိုင်း (**မပြောင်း**)

### 🙈 ယာယီဖျောက်မည် (flag `posSales: false`)
`/pos`, `/quick-sale`, `/direct-sale`, `/orders`, `/direct-sale-orders`, `/credit-orders`, `/credits`, `/quotations`, `/quotations/create`, `/quotations/new`, `/quotations/:id`, `/quotations/:id/edit`, `/print-receipt/:orderId`

> `/reports` page ထဲတွင် POS ၏ Paid / Credit orders tab ပါသော်လည်း page တစ်ခုလုံး ပြ (tab မဖျောက် — အတွင်းပိုင်း မပြောင်း rule)

---

## ၃. Design

### 3.1 Menu page (`/menu`)
```
┌─────────────────────────────────────────────────────┐
│ ပြည်တော်သာ                               [🌐] [👤 owner ▾]│  ← /menu တွင် ▦ မပြ
├─────────────────────────────────────────────────────┤
│ မင်္ဂလာပါ owner                                       │  ← menu.greeting (adminData.name)
│                                                     │
│ အွန်လိုင်း အရောင်း                                       │  ← section ခေါင်းစဉ် (text-sm font-semibold text-slate-500)
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│ │ [icon]    (3)│ │ [icon]    (1)│ │ [icon]       │   │  ← (n) pending badge (§3.3)
│ │ အီးကော်မတ်    │ │ အော်ဒါ        │ │ ဖောက်သည်များ  │   │  ← title (font-semibold text-slate-800)
│ │ အော်ဒါများ     │ │ ထုတ်ပိုးစစ်ဆေး │ │              │   │
│ │ အော်ဒါ စစ်/ပို့ │ │ barcode scan │ │ အကောင့်/tier │   │  ← description (text-xs text-slate-500, line-clamp-2)
│ └──────────────┘ └──────────────┘ └──────────────┘   │
│ ကုန်ပစ္စည်း နှင့် စတော့ …  ဝယ်ယူရေး …  ငွေကြေး နှင့် အစီရင်ခံစာ …  စနစ် … │
│                                                     │
│                              [⎋ အကောင့်ကနေ ထွက်မယ်]     │  ← sidebar.logout
└─────────────────────────────────────────────────────┘
```
| Element | Tailwind |
|---|---|
| Page | `max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8` |
| Grid | `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4` |
| Card | `<Link>` — `relative flex flex-col gap-2 rounded-2xl bg-white border border-slate-200 p-4 min-h-[120px] hover:border-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary outline-none transition` |
| Icon | `w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center` (icon `w-5 h-5`) |
| Badge | `absolute top-3 right-3 min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center` |
| Logout | `self-end` outline ခလုတ် `border border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-4 min-h-[44px]` |
- Section ထဲ ခွင့်ရှိသော card **မရှိလျှင် section မပြ**
- Card **အားလုံး** မရှိလျှင် (ဥပမာ role တစ်ခုခု) — `menu.noAccess` "ခွင့်ပြုထားသော menu မရှိပါ — အက်ဒမင်ကို ဆက်သွယ်ပါ" + logout ခလုတ်

### 3.2 Header (page တိုင်း — `App.tsx`)
```
┌──────────────────────────────────────────────────────┐
│ [▦] ပြည်တော်သာ › အီးကော်မတ် အော်ဒါများ     [🌐] [👤 owner ▾] │
└──────────────────────────────────────────────────────┘
```
- ☰ ခလုတ် → **▦ `LayoutGrid` icon** ခလုတ် (`aria-label={t("menu.openMenu")}`, `navigate("/menu")`) — `/menu` တွင် မပြ
- "Pyi-Taw-Tar POS" → `t("menu.appName")` "ပြည်တော်သာ" + ` › ` + လက်ရှိ page အမည် (menuConfig မှ — `location.pathname` နှင့် path prefix ကိုက်သော item; `/warehouse/:id` ကဲ့သို့ detail page တွင် parent အမည်); ဖုန်းတွင် page အမည်သာ (`truncate`)
- ညာ — `LanguageSwitcher` + **user dropdown** (`components/UserMenu.tsx` အသစ်): အမည် + role, "ဆက်တင်များ" (`/settings`), "အကောင့်ကနေ ထွက်မယ်" (Sidebar ၏ `handleLogout` logic အတိုင်း — `utils/logout.ts` သို့ ထုတ်ပြီး Menu page နှင့် မျှသုံး); outside click / Esc ပိတ်
- `<Sidebar … />` render ကို **ဖယ်** (import ပါ ဖယ်; `components/Sidebar.tsx` ဖိုင် **ကျန်**)

### 3.3 Pending badge (ရှိပြီးသား API — fetch ကို `pages/Menu.tsx` တွင်သာ)
| Card | API | ယူမည့်တန်ဖိုး |
|---|---|---|
| အီးကော်မတ် အော်ဒါ | `services/Ecommerce/fetchEcommerceOrders.ts` ၏ function ကို `status: "pending", page: 1, limit: 1` ဖြင့် | `pagination.totalItems` |
| ထုတ်ပိုးစစ်ဆေး | `services/Fulfillment/*` ၏ pending ယူသော function (`GET /fulfillment/pending`) | array အရှည် (သို့ pagination total) |
- Role ခွင့်မရှိသော card ၏ API ကို **မခေါ်**; 0 / error → badge မပြ (toast မပြ — menu မပျက်စေ)
- `Promise.allSettled` ဖြင့် တစ်ပြိုင်နက်; mount တစ်ကြိမ်သာ (polling မလုပ်)

---

## ၄. Feature flag + route guard

### `config/features.ts` *(အသစ်)*
```ts
// e-commerce သာ သုံးနေစဉ် POS / အရောင်းပိုင်းကို ဖျောက်ထား — true ပြောင်းလျှင် menu card နှင့် route ပြန်ပေါ်
export const FEATURES = {
  posSales: false,
} as const;
export type FeatureKey = keyof typeof FEATURES;
```

### `config/menuConfig.ts` *(အသစ်)*
```ts
import type { LucideIcon } from "lucide-react";
import type { FeatureKey } from "./features";

export interface MenuItem {
  path: string;
  labelKey: string;        // ဥပမာ "sidebar.ecommerceOrders"
  descKey: string;         // ဥပမာ "menu.desc.ecommerceOrders"
  icon: LucideIcon;
  roles?: string[];        // Sidebar ၏ ယခုတန်ဖိုး
  feature?: FeatureKey;    // false ဆိုလျှင် မပြ
  badge?: "ecommercePending" | "fulfillmentPending";
}
export interface MenuSection { id: string; titleKey: string; items: MenuItem[]; }
export const MENU_SECTIONS: MenuSection[] = [ /* §2 ဇယားအတိုင်း */ ];
// POS ပိုင်း item များ (flag ပြန်ဖွင့်လျှင် ပေါ်ရန်) — section "sales": /pos, /quick-sale, /orders, /credit-orders, /credits (feature: "posSales")
export const canSeeItem = (item: MenuItem, role: string, features: Record<FeatureKey, boolean>) =>
  (!item.feature || features[item.feature]) && (!item.roles?.length || item.roles.includes(role));
```
- POS item များကို `feature: "posSales"` ဖြင့် **config ထဲ ထည့်ထား** (flag `true` ပြောင်းရုံဖြင့် section "အရောင်း" ပြန်ပေါ်) — ဇယား: `/pos` (`sidebar.checkout`, `ShoppingCart`), `/quick-sale` (`sidebar.quickSale`, `ShoppingBag`), `/orders` (`sidebar.orders`, `Receipt`), `/credit-orders` (`sidebar.creditOrder`, `CreditCard`), `/credits` (`sidebar.creditSales`, `CreditCard`)

### `components/FeatureRoute.tsx` *(အသစ်)*
```tsx
// flag ပိတ်ထားသော page ကို URL တိုက်ရိုက်ဖြင့် ဝင်လျှင် menu သို့ ပြန်ပို့
export const FeatureRoute: React.FC<{ feature: FeatureKey; children: React.ReactElement }> = ({ feature, children }) =>
  FEATURES[feature] ? children : <Navigate to="/menu" replace />;
```
- `App.tsx` — §2 ဖျောက်မည့် route တိုင်း၏ `element` ကို `<FeatureRoute feature="posSales">…</FeatureRoute>` ဖြင့် ပတ်

### Redirect ပြင်ရန်
| ဖိုင် | ယခု | ပြောင်း |
|---|---|---|
| `App.tsx` `/` | `/pos` | `/menu` |
| `App.tsx` | — | `<Route path="/menu" element={<Menu />} />` ထည့် |
| `pages/Login.tsx:18, 56` | `/pos` | `/menu` |
| `pages/PurchaseReport.tsx:49` | `/pos` | `/menu` |
| (ရှာ) `grep -rn "\"/pos\"" pages components hooks utils` | ကျန်သမျှ | posSales flag ပိတ်ချိန် ရောက်နိုင်သော နေရာဆိုလျှင် `/menu` |

---

## ၅. ပြင်ဆင်မည့်ဖိုင် အနှစ်ချုပ်
| ဖိုင် | |
|---|---|
| `config/features.ts` *(အသစ်)* | flag |
| `config/menuConfig.ts` *(အသစ်)* | section / item / `canSeeItem` |
| `pages/Menu.tsx` *(အသစ်, default export)* | card grid, greeting, badge, logout, no-access |
| `components/UserMenu.tsx` *(အသစ်)* | header user dropdown |
| `components/FeatureRoute.tsx` *(အသစ်)* | route guard |
| `utils/logout.ts` *(အသစ်)* | `handleLogout` logic ကို Sidebar မှ ထုတ် (Sidebar ကလည်း ဤ function ကို ခေါ်အောင် ပြင်) |
| `App.tsx` | header ပြောင်း, Sidebar render ဖယ်, `/menu` route, `/` redirect, FeatureRoute ပတ် |
| `pages/Login.tsx`, `pages/PurchaseReport.tsx` | redirect `/menu` |
| `translations/my.ts`, `en.ts` | `menu.*` (appName, greeting, openMenu, noAccess, sectionOnline, sectionStock, sectionPurchasing, sectionFinance, sectionSystem, sectionSales, desc.*) |

---

## ၆. စစ်ဆေးမည့်နည်း ("ပြီး" မရေးမီ မဖြစ်မနေ — output ကို report ထဲ ကူး)
1. `npm run build` — pass
2. Translation parity (`plans/2026-10-27-dashboard-i18n-followup-plan.md` §2 ၏ command) — `missingInMy 0`, `missingInEn 0`, duplicate 0
3. Browser — **test DB `uomtest` + build preview** (`plans/2026-10-27-dashboard-browser-test-plan.md` §1 ၏ setup အတိုင်း; **production DB မထိ**), viewport **390 / 768 / 1366**:
   | ID | စစ်ချက် | Pass စံ |
   |---|---|---|
   | M-01 | `owner` login | `/menu` ရောက်; section ၅ / card ၁၄ (owner); POS card **မရှိ** |
   | M-02 | Card ၁၄ ခု တစ်ခုချင်း နှိပ် | မှန်ကန်သော page ဖွင့်; header တွင် page အမည် မှန် |
   | M-03 | Header ▦ | page တိုင်းမှ `/menu` ပြန်; `/menu` တွင် ▦ မပေါ် |
   | M-04 | Pending badge | seed ၏ pending ecommerce order ၂ ခု → **(2)**; fulfillment pending 0 → badge မပေါ် |
   | M-05 | `/pos`, `/quick-sale`, `/orders`, `/credits`, `/quotations` URL တိုက်ရိုက် | `/menu` သို့ redirect |
   | M-06 | `/reports`, `/expenses`, `/ai-chat` | ဖွင့်ရ (redirect မဖြစ်) |
   | M-07 | `admin` role အကောင့် (test DB တွင် ဖန်တီး) | "အကောင့်စီမံခန့်ခွဲမှု" card **မပေါ်** |
   | M-08 | `cashier` role အကောင့် | ထုတ်ပိုးစစ်ဆေး, ဆိုင်ခန်း, အသုံးစရိတ်, အစီရင်ခံစာ, AI, ဆက်တင် သာ (roles မကန့်သော card များ) |
   | M-09 | User dropdown | Settings ဖွင့်; Logout → `/login`, `authToken` / `adminData` ဖယ် |
   | M-10 | ဘာသာ မြန်မာ ⇄ English | card / section / header စာ ပြောင်း; `Translation missing` warning 0 |
   | M-11 | Layout | 390 = 2 col, 768 = 3 col, 1366 = 4 col; horizontal scroll မရှိ; card ≥ 44px |
   | M-12 | Flag `posSales: true` ယာယီပြောင်း build | "အရောင်း" section + POS card ပြန်ပေါ်, `/pos` ဖွင့်ရ → **`false` ပြန်ထား** |
4. Cleanup — server ရပ်, `uomtest` drop (connection name assert), temp script ဖျက်
5. Report — `plans/2026-10-27-card-menu-report.md` (ပြင်သောဖိုင်, M-01–M-12 ရလဒ် + screenshot (390 / 1366 menu page တစ်ပုံစီ), build / parity output)

---

## ၇. Scope အပြင်
- Backend, ecommerce app
- Menu မှ ဖွင့်သော page များ၏ အတွင်းပိုင်း (Reports ၏ POS tab အပါအဝင်)
- `Sidebar.tsx`, POS page ဖိုင်များ ဖျက်ခြင်း
- Polling / websocket (badge သည် menu ဖွင့်ချိန် တစ်ကြိမ်သာ)
