# Dashboard (POS Frontend) — CLAUDE.md

## 📋 အလုပ်လုပ်ရမည့် စည်းမျဉ်းများ (Strict Workflow Rules)

အောက်ပါစည်းမျဉ်းများကို **မဖြစ်မနေ** လိုက်နာရမည်။

### ၁. ဘာသာစကားသတ်မှတ်ချက် (Language Requirement)
- **All responses, status updates, implementation plans, and code comments MUST be written in Myanmar Language (မြန်မာဘာသာ).**
- English may only be used for: code itself, technical terms, and direct quotes from existing documentation.

### ၂. Plan First Principle
- **NEVER write or modify code directly** without first creating an implementation plan.
- When asked to make changes: draft a detailed Implementation Plan in Myanmar Language → show user → wait for approval.

### ၃. Auto-Save Plan Files
- Save plans in `dashboard/plans/` folder.
- Format: `YYYY-MM-DD-short-description-plan.md`
- Example: `2026-07-27-add-inventory-filter-plan.md`

### ၄. Wait for Explicit Approval
- Present the plan in Myanmar Language.
- **DO NOT** modify any files until the user explicitly says "OK", "Go ahead", "လုပ်ပါ", or equivalent.

---

## 🚀 Quick Start

```bash
npm install        # Install dependencies
npm run dev        # Vite dev server on http://0.0.0.0:3000
npm run build      # Production build → dist/
```

- No lint, typecheck, or test scripts exist.

---

## 🏗️ Architecture

```
dashboard/
├── App.tsx              # Root — LanguageProvider → AppProvider → BrowserRouter → Routes
├── index.tsx            # Entry point (ReactDOM.createRoot)
├── pages/               # 22+ route-level page components
├── components/          # 60+ shared UI components (organized by feature)
├── services/            # API service layer (one folder per domain)
├── context/
│   ├── AppContext.tsx      # Global state (legacy localStorage)
│   └── LanguageContext.tsx # i18n (English + Myanmar)
├── hooks/
│   ├── usePOS.ts          # POS page logic (500+ lines)
│   └── useQuickSale.ts    # Quick sale page logic
├── utils/
│   ├── authSession.ts     # Session validation caching (30-min TTL)
│   ├── posCartUom.ts      # POS cart UOM helpers
│   ├── uom.ts             # UOM validation utilities
│   ├── printPaperSize.ts  # Receipt paper size config
│   ├── printShopBranding.ts # Shop branding for receipts
│   ├── deviceDetect.ts    # Device detection
│   └── directSaleCart.ts  # Direct sale cart utilities
├── translations/
│   ├── en.ts              # English translations (~930 lines)
│   └── my.ts              # Myanmar translations (~942 lines)
├── types/
│   └── uom.ts             # UOM-related type definitions
├── public/                # Static assets (logos, images)
├── rules/                 # Coding rules and patterns
└── plans/                 # Implementation plans
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19.2.6 + TypeScript 5.8 |
| Build | Vite 6.2 |
| Routing | react-router-dom v7.11 |
| HTTP | Axios 1.13 (with interceptors) |
| Styling | Tailwind CSS (CDN, not npm) |
| Icons | lucide-react 0.554 |
| Charts | recharts 3.5 |
| Notifications | sonner 2.0 |
| Date | date-fns 4.1, react-date-range 2.0 |
| AI Chat UI | @ai-sdk/react, react-markdown, remark-gfm |
| State | React Context (no Redux/Zustand) |

---

## 🗺️ Routing

| Route | Page | Description |
|---|---|---|
| `/` | → Redirect to `/pos` | Root redirect |
| `/pos` | POS | Main POS checkout |
| `/quick-sale` | QuickSale | Express checkout |
| `/inventory` | Inventory | Product CRUD + Excel import |
| `/warehouse` | Warehouse | Warehouse list |
| `/warehouse/:id` | WarehouseDetail | Warehouse stock detail |
| `/storefront` | Storefront | Storefront list |
| `/storefront/:id` | StorefrontDetail | Storefront stock detail |
| `/storefront/:storeId/product/:productId` | StorefrontProductDetail | Product detail at storefront |
| `/suppliers` | Suppliers | Supplier list |
| `/suppliers/:id` | SupplierDetail | Supplier detail |
| `/purchasing` | Purchasing | PO + GRN + Transfers |
| `/orders` | Orders | Storefront order list |
| `/direct-sale-orders` | DirectSaleOrders | Direct sale orders |
| `/credit-orders` | CreditOrders | Credit order list |
| `/admin/ecommerce-orders` | EcommerceOrders | Ecommerce order management |
| `/customers` | Customers | Customer list |
| `/quotations` | QuotationList | Quotation list |
| `/quotations/create` | QuotationCreate | Create/edit quotation |
| `/quotations/:id` | QuotationDetail | Quotation detail |
| `/credits` | Credits | Credit sales list |
| `/credits/:id` | CreditDetail | Credit detail + payments |
| `/expenses` | Expenses | Expense tracking |
| `/reports` | Reports | Sales reports dashboard |
| `/purchase-report` | PurchaseReport | Purchase reports |
| `/settings` | Settings | Shop settings |
| `/accounts` | AccountManagement | Admin account management |
| `/ai-chat` | AIChat | AI assistant |
| `/print-receipt/:orderId` | PrintReceipt | Receipt printing |
| `/login` | Login | Authentication |

---

## 🎨 UI Patterns & Conventions

### Styling
- **Tailwind CSS** loaded via CDN `<script>` in `index.html` (NOT npm)
- Custom theme defined inline in `tailwind.config`:
  - Primary: Green (`#4CAF50`)
  - Dark: `#1E2937` (sidebar, header)
  - Background: `#F8F9FA`
  - Font: Inter (Google Fonts CDN)
  - Custom shadows: `glow-sm`, `glow-md`, `glow-lg`
- Some dependencies via **CDN importmap** in `index.html` (uuid, react, lucide-react, recharts)

### Component Patterns
- **Page components**: Default export, in `pages/`
- **Shared UI**: Organized by feature in `components/<Feature>/`
- **Modals**: Custom overlay modals with `fixed inset-0 bg-black/50 backdrop-blur-sm`
- **Notifications**: sonner `toast` for success/error feedback
- **Charts**: recharts for reports
- **Date pickers**: react-date-range

### Layout
- **Header**: Sticky dark bar (`#1E2937`), hamburger + title + language switcher
- **Sidebar**: Slide-in accordion navigation with icon groups
- **Content**: Light background (`#F8F9FA`), responsive
- **Print styling**: `@media print` hides navigation for receipt printing

---

## 🗄️ State Management

### Two Contexts (No Redux)
1. **AppProvider** (`context/AppContext.tsx`):
   - Legacy localStorage-based state (coexists with API-driven data)
   - Provides: `products`, `sales`, `customers`, `expenses`, `purchaseOrders`, `currentUser`
   - Mutators: `processSale()`, `addProduct()`, `transferStock()`, `createPurchaseOrder()`, etc.
   - **Note:** Most pages now use API services instead of this context

2. **LanguageProvider** (`context/LanguageContext.tsx`):
   - i18n with `t("key")` function
   - Default language: Myanmar (`"my"`)
   - Persisted to localStorage

---

## 🌐 API Service Layer

Services are organized by domain in `services/`:
```
services/
├── axios.ts              # Axios instance + interceptors
├── Auth/login.ts         # POST /admin/login
├── Auth/validateSession.ts  # Session validation
├── Order/                # createOrder, fetchOrders, addItemsToOrder, etc.
├── Inventory/            # fetchProducts, createProduct, importExcel, etc.
├── Purchase/             # fetchPurchases, createGRN, transfers, etc.
├── Reports/              # fetchSaleReport, fetchFOCOrders, etc.
├── Storefront/           # profiles, stock
├── Warehouse/            # profiles, stock, transfers
├── Supplier/             # CRUD with soft delete/restore
├── Customer/             # register, fetch, update
├── Credit/               # personas, records
├── Expense/              # CRUD
├── Quotation/            # API + types
├── ShopSettings/         # settings + logo upload
└── ...(more)
```

### Axios Config
- Base URL from `VITE_API_BASE_URL`
- JWT from `localStorage("authToken")`
- Request interceptor: adds `Authorization: Bearer <token>`
- Response interceptor:
  - **429**: Retry up to 2× with 2s/4s delay
  - **401**: Remove token, redirect to `/login`

---

## 🔐 Authentication

- **Login**: `POST /admin/login` → stores JWT in `localStorage("authToken")` + admin data in `localStorage("adminData")`
- **Protected Routes**: `ProtectedRoute` component checks token existence, validates session with 30-min cache via `sessionStorage`
- **Role-based access**: Sidebar menu items conditionally shown based on role (owner/admin/cashier)
- **Logout**: Removes token + admin data, redirects to `/login`

---

## 📁 Rules & Plans

- **Coding rules & patterns:** `dashboard/rules/`
- **Implementation plans:** `dashboard/plans/`

---

## 🚀 Deployment

| Platform | Config | Notes |
|---|---|---|
| **Netlify** | `netlify.toml` | SPA redirect (`/*` → `/index.html`, 200) |
| **Build** | `vite build` → `dist/` | Output to `dist/` |
| **Environment** | `.env` file | `VITE_API_BASE_URL`, `GEMINI_API_KEY` |
