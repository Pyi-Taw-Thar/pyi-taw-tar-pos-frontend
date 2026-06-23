# Pyi-Taw-Tar POS — Agent Guide

## Language Rule
ငါဘာပဲမေးမေး အင်္ဂလိပ်လိုမေးမေး မြန်မာလိုမေးမေး **မြန်မာလိုပဲ** ပြန်ဖြေပေးရမယ်။

## Commands
- `npm run dev` — Vite dev on `http://0.0.0.0:3000`
- `npm run build` — production build
- No lint, typecheck, or test scripts exist

## Architecture
- **Two data paths**: (1) local-first via `AppContext` → `dataService.ts` → `localStorage("mobileax_pos_data")`, (2) API-driven via `services/*` → Axios → `VITE_API_BASE_URL`
- **Auth**: JWT in `localStorage("authToken")`; `ProtectedRoute` caches validation in `sessionStorage` (30-min TTL). Axios interceptor auto-logouts on 401, retries 429 up to 2×
- **i18n**: `LanguageContext` in `context/LanguageContext.tsx`; `t("key")` for translations in `translations/{en,my}.ts`. Default: Myanmar (`"my"`)
- **Tailwind CSS**: loaded via CDN `<script>` in `index.html`, NOT via npm. Theme colors (brand/primary/dark/btn/status) defined inline in `tailwind.config`
- **Import map**: some deps (uuid, react, lucide-react, recharts) served via CDN importmap in `index.html`
- **Receipt printing**: order data saved to `localStorage("receipt_<invoiceNumber>")`, navigates to `/print-receipt/:orderId?autoprint=1`
- **Path alias**: `@/` maps to project root (Vite + tsconfig)

## Directory Layout
- `pages/` — route-level page components (29 files)
- `components/` — shared UI (POS/, Print/, Quotation/, etc.)
- `services/` — one folder per API domain (Auth/, Order/, Inventory/, Storefront/, etc.)
- `context/` — `AppContext` (global state), `LanguageContext` (i18n)
- `hooks/` — `usePOS` (POS page logic)
- `utils/` — helpers (authSession, posCartUom, printPaperSize)
- `types/` — shared TS types

## Key Constraints
- `VITE_API_BASE_URL` env var required for API calls; `GEMINI_API_KEY` for AI Chat
- Staff role cannot authorize >20% discount (enforced in `AppContext.processSale`)
- Some products filtered out by hardcoded `_id` in pos cart (line 184 of `hooks/usePOS.ts`)
- Detailed API specs for Activity Log and Quotation live in `prompt-frontend-activity-log.md` and `prompt-frontend-quotation.md`
- Logo/shop images in `public/`

## Style Conventions
- Default export for page components
- Redux/recoil NOT used — only React context for state management
