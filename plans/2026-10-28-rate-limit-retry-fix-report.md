# Dashboard 429 Retry + CORS Exposed Headers ပြင်ဆင်မှု အစီရင်ခံစာ

- **ရက်စွဲ:** 2026-10-28
- **အခြေအနေ:** ✅ R-1 မှ R-6 အထိ စစ်ဆေးပြီးစီး
- **မူရင်း Plan:** [`2026-10-28-rate-limit-retry-fix-plan.md`](./2026-10-28-rate-limit-retry-fix-plan.md)
- **စစ်ဆေးသည့် ပတ်ဝန်းကျင်:** Local MongoDB (`127.0.0.1:27018/retrytest`, replicaSet `rs0`) + Local Temp Backend (`PORT=5055`) + Dashboard Vite Preview (`http://localhost:3000`) — Production Atlas / Railway ကို လုံးဝ မထိပါ။

---

## ၁. ပြင်ဆင်ခဲ့သည့် ဖိုင်စာရင်းနှင့် Diff အနှစ်ချုပ်

| စဉ် | ဖိုင်လမ်းကြောင်း | ပြောင်းလဲမှု အနှစ်ချုပ် |
|---|---|---|
| 1 | `backend/src/configs/cors.config.js` | Line 62 ရှိ `exposedHeaders` ကို `["X-Total-Count", "Content-Range"]` မှ `["X-Total-Count", "Content-Range", "Retry-After", "RateLimit", "RateLimit-Policy"]` သို့ ပြောင်းလဲခဲ့သည် (Cross-origin browser JavaScript က Rate Limit header များ ဖတ်ရှုနိုင်ရန်)။ |
| 2 | `dashboard/services/axios.ts` | • `MAX_RETRY_WAIT_MS = 10000` (၁၀ စက္ကန့်) သတ်မှတ်ခဲ့သည်။<br>• Request URL တွင် `/admin/login` ပါဝင်ပါက (`isLoginRequest`) 429 တွင် retry လုံးဝ မလုပ်ဘဲ ချက်ချင်း `Promise.reject(error)` ပြန်ရန် ပြင်ဆင်ခဲ့သည်။<br>• အခြား request များအတွက် `Retry-After` header ရှိပြီး `> 10000 ms` (၁၀ စက္ကန့်ထက် များလျှင်) retry မလုပ်ဘဲ ချက်ချင်း `Promise.reject(error)` ပြန်ရန်နှင့် `≤ 10000 ms` ဖြစ်ပါက ထိုစက္ကန့်အတိုင်း စောင့်၍ retry လုပ်ရန် ပြင်ဆင်ခဲ့သည်။<br>• `Retry-After` header မပါပါက ယခုအတိုင်း `2s` → `4s` ဖြင့် အများဆုံး ၂ ကြိမ် retry လုပ်ရန် ထိန်းသိမ်းထားသည်။ |
| 3 | `dashboard/translations/my.ts` | `login.tooManyAttempts` တွင် `"ကြိုးစားမှု များလွန်းပါသည်။ မိနစ်အနည်းငယ်ကြာမှ ပြန်ကြိုးစားပါ။"` ထည့်သွင်းခဲ့သည်။ |
| 4 | `dashboard/translations/en.ts` | `login.tooManyAttempts` တွင် `"Too many attempts. Please try again in a few minutes."` ထည့်သွင်းခဲ့သည်။ |
| 5 | `dashboard/pages/Login.tsx` | `catch (error: any)` block (line 61-71) တွင် 429 error (`error?.response?.status === 429` သို့မဟုတ် `error.message` တွင် `"too many requests"` ပါဝင်ခြင်း) ဖြစ်ပါက `toast.error(t("login.tooManyAttempts"))` ပြသရန် ပြင်ဆင်ခဲ့သည်။ |

---

## ၂. Browser နှင့် Cross-Origin စစ်ဆေးချက်များ (R-1 မှ R-6)

| # | စစ်ချက် | ရလဒ် | အထောက်အထား (Console Output, Network Request အရေအတွက်, Screenshot Path) |
|---|---|---|---|
| **R-1** | Browser console (`http://localhost:3000`) မှ Cross-Origin API (`http://localhost:5055`) သို့ `fetch` ဖြင့် 429 ရအောင်ခေါ်ပြီး `response.headers.get("Retry-After")` စစ်ဆေးခြင်း | ✅ **PASS** | • Origin: `http://localhost:3000` → API: `http://localhost:5055/api/v1/customer/login`<br>• Statuses (11 ကြိမ်): `[401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 429]`<br>• `response.headers.get("Retry-After")` → **`"897"`** (`null` မဟုတ်ဘဲ ဖတ်၍ရသည်)<br>• `response.headers.get("RateLimit")` → `"\"300-in-1min\"; r=289; t=57, \"10-in-15min\"; r=0; t=897"`<br>• `response.headers.get("RateLimit-Policy")` → `"\"300-in-1min\"; q=300; w=60; pk=:YmIwY2Q1MTM2YWU1:, \"10-in-15min\"; q=10; w=900; pk=:YmIwY2Q1MTM2YWU1:"` |
| **R-2** | Dashboard `/login` page တွင် name/password အမှားဖြင့် ၁၁ ကြိမ် login ဝင်ခြင်း | ✅ **PASS** | • ၁၁ ကြိမ်နှိပ်ရာတွင် Network tab ၌ `POST /api/v1/admin/login` စုစုပေါင်း **၁၁ ကြိမ်သာ** ပို့သည် (၃ စက္ကန့် စောင့်ကြည့်သော်လည်း retry ထပ်မပို့ပါ)။<br>• Network Statuses: `[400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 429]`<br>• ၁၁ ကြိမ်မြောက် ကြာချိန်: **`46 ms`** (၁ စက္ကန့်အတွင်း ချက်ချင်း ပြီးဆုံးသည်)၊ Submit ခလုတ် `disabled: false` (`"ဝင်ရောက်မည်"`) သို့ ချက်ချင်း ပြန်ပြောင်းပြီး loading မကျန်ပါ။<br>• မြန်မာ Toast: **`"ကြိုးစားမှု များလွန်းပါသည်။ မိနစ်အနည်းငယ်ကြာမှ ပြန်ကြိုးစားပါ။"`**<br>• English Toast: **`"Too many attempts. Please try again in a few minutes."`**<br>• Screenshots:<br>  - `C:/Users/PC/.gemini/antigravity/brain/fc731f95-18a1-430f-8f8c-56376e4f6bcb/r2_login_429_my.png`<br>  - `C:/Users/PC/.gemini/antigravity/brain/fc731f95-18a1-430f-8f8c-56376e4f6bcb/r2_login_429_en.png` |
| **R-3** | Login ဝင်ပြီးနောက် `RATE_LIMIT_STAFF_MAX=20` ထား၍ page ပြောင်းပြီး 429 တွင် `Retry-After > 10s` နှင့် `Retry-After ≤ 10s` စစ်ဆေးခြင်း | ✅ **PASS** | **Part A (`Retry-After > 10s` — Retry မလုပ်ရ):**<br>• Page များ ဆက်တိုက်ပြောင်း၍ request 20 ပြည့်ပြီးနောက် `/accounts` သို့ သွားရာ `GET /api/v1/admin` သည် `429` (`Retry-After: "54"`) ရရှိသည်။<br>• `54s > 10s` ဖြစ်သဖြင့် Axios က retry မလုပ်ဘဲ ချက်ချင်း reject လုပ်သည် (`GET /api/v1/admin` request အရေအတွက် = **1 ကြိမ်သာ**)။<br>• Screenshot: `C:/Users/PC/.gemini/antigravity/brain/fc731f95-18a1-430f-8f8c-56376e4f6bcb/r3_staff_limit_20_nav.png`<br><br>**Part B (`Retry-After ≤ 10s` — ထိုစက္ကန့်အတိုင်း စောင့်ပြီး Retry လုပ်ရမည်):**<br>• Window reset ရန် ၁ စက္ကန့်အလိုတွင် `/expenses` သို့ သွားရာ ပထမအကြိမ် `GET /api/v1/expense` (`t = 10ms`) တွင် `status: 429`, `Retry-After: "1"` ရရှိသည်။<br>• Axios က `Retry-After: 1` (၁ စက္ကန့် / `1013 ms`) စောင့်ပြီး ဒုတိယအကြိမ် `GET /api/v1/expense` (`t = 1023ms`) ကို အလိုအလျောက် ပြန်ပို့ရာ **`status: 200`** (`RateLimit: "20-in-1min"; r=19; t=60`) ဖြင့် အောင်မြင်စွာ ပြန်ရရှိသည်။ |
| **R-4** | `Retry-After` header မပါသော 429 တွင် `2s → 4s` retry ၂ ကြိမ် စစ်ဆေးခြင်း | ✅ **PASS** | • Browser XHR တွင် `Retry-After` header ကို ဖယ်ထုတ်ပြီး 429 ရနေချိန် `/accounts` (`GET /api/v1/admin`) ကို ခေါ်ဆိုခဲ့သည်။<br>• Network tab တွင် စုစုပေါင်း **၃ ကြိမ်** (မူရင်း ၁ ကြိမ် + retry ၂ ကြိမ်) ပို့ခဲ့သည် -<br>  1. Attempt 1: `status: 429` at `40 ms`<br>  2. Attempt 2 (Retry #1): `status: 429` at `2050 ms` (**Delay 1 = `2010 ms` / ~2s**)<br>  3. Attempt 3 (Retry #2): `status: 429` at `6066 ms` (**Delay 2 = `4016 ms` / ~4s**) |
| **R-5** | 401 စစ်ဆေးချက် (Token အတု/ဖျက်ပြီး API ခေါ်ဆိုခြင်း) | ✅ **PASS** | • `localStorage` ရှိ `authToken` ကို invalid token ပြောင်းပြီး `/inventory` သို့ သွားရာ `401` ပြန်လာသည်နှင့် `removeAuthToken()` အလုပ်လုပ်ပြီး `localStorage.getItem("authToken")` သည် **`null`** ဖြစ်သွားကာ `window.location.pathname` သည် **`"/login"`** သို့ အလိုအလျောက် ရောက်ရှိသွားသည်။<br>• Screenshot: `C:/Users/PC/.gemini/antigravity/brain/fc731f95-18a1-430f-8f8c-56376e4f6bcb/r5_401_redirect_login.png` |
| **R-6** | `npm run build` (dashboard) နှင့် Translation Parity စစ်ဆေးချက် | ✅ **PASS** | အောက်ပါ §၃ တွင် Build နှင့် Parity command output အပြည့်အစုံကို ကူးထည့်ထားပါသည်။ |

---

## ၃. Build နှင့် Translation Parity Output (R-6 အထောက်အထား)

### `npm run build` Output
*(မှတ်ချက် - Vite ၏ `> 500 kB` chunk-size warning ၁ ခုသည် ယခင်ကတည်းက ရှိနေသော warning ဖြစ်ပြီး build error မရှိဘဲ အောင်မြင်စွာ build ပြီးဆုံးပါသည်)*

```text
> pyitawtar-pos@0.0.0 build
> vite build

vite v6.4.1 building for production...
transforming...
✓ 3795 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     4.42 kB │ gzip:   1.45 kB
dist/assets/index-hsh9VnWV.css      9.35 kB │ gzip:   2.56 kB
dist/assets/index-AP4cCQYP.js   2,538.32 kB │ gzip: 607.47 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 9.34s
```

### Translation Key Parity Output
```text
missingInMy 0 missingInEn 0
translations/en.ts duplicateKeys 0
translations/my.ts duplicateKeys 0
```

---

## ၄. Railway Deploy ပြီးနောက် စစ်ဆေးရမည့် L-9 လမ်းညွှန်ချက် (Phase A Report §4)

Code များကို Railway Production သို့ deploy လုပ်ပြီးနောက် Railway ၏ edge proxy နောက်ကွယ်တွင် `app.set("trust proxy", 1)` က Client IP ကို မှန်ကန်စွာ ခွဲခြားပေးနိုင်ခြင်း ရှိ/မရှိ အောက်ပါအတိုင်း စစ်ဆေးပါ (Production ကို ဖတ်ရုံသာ — request အများ မပို့ရပါ) -

1. **Network ၁ (ဥပမာ - ဆိုင်/အိမ် Wi-Fi)** မှနေ၍ Terminal သို့မဟုတ် Browser DevTools ဖြင့် Production API ကို ၂–၃ ကြိမ် ခေါ်ပါ -
   ```bash
   curl -I https://<railway-production-domain>/api/v1/ecommerce/products
   ```
   Response header ထဲမှ `RateLimit` တန်ဖိုး (ဥပမာ `"300-in-1min"; r=299; t=60`) နှင့် `RateLimit-Policy` ထဲမှ `pk=:<partition-key>:` ကို မှတ်သားပါ။
2. **Network ၂ (ဥပမာ - ဖုန်း Mobile Data — Wi-Fi ပိတ်ထားပါ)** မှနေ၍ တူညီသော endpoint ကို ၁–၂ ကြိမ် ထပ်ခေါ်ပါ။
3. **အကဲဖြတ်ရန်:**
   - **မှန်ကန်ပါက (Pass):** Network ၂ တွင် `r=299` မှ သီးခြား ပြန်စပြီး `RateLimit-Policy` ၏ `pk` တန်ဖိုးသည် Network ၁ နှင့် မတူညီပါ။
   - **မမှန်ကန်ပါက (Fail):** Network ၂ မှ ခေါ်သော်လည်း Network ၁ ၏ remaining (`r=...`) အတိုင်း ဆက်လျော့နေပြီး `pk` တူညီနေပါက Railway edge proxy က `X-Forwarded-For` တွင် hop ပိုထည့်နေခြင်း ဖြစ်သဖြင့် `src/app.js:54` ရှိ `app.set("trust proxy", 1)` ကို hop အရေအတွက်အလိုက် (`2` စသည်ဖြင့်) ညှိပေးရပါမည်။

---

## ၅. Cleanup ရလဒ်နှင့် လက်ရှိ Git Status

- **Cleanup:**
  - Local temp backend (`PORT=5055`)၊ Vite preview server (`PORT=3000`) နှင့် local `mongod` (`PORT=27018`) တို့ကို ရပ်တန့်ပြီး ဖြစ်သည်။
  - Temp data directory (`mongo-data-retry`)၊ Chrome headless temp profile နှင့် temp test script များအားလုံးကို ဖျက်သိမ်းပြီး ဖြစ်သည်။
- **လက်ရှိ Git Status:**
  - `git -C backend status --short`:
    ```text
     M src/app.js
     M src/configs/cors.config.js
     M src/middlewares/rateLimiter.middleware.js
     M src/routes/admin.route.js
     M src/routes/customer.route.js
    ?? plans/2026-10-28-rate-limiter-and-load-test-plan.md
    ?? plans/2026-10-28-rate-limiter-report.md
    ```
  - `git -C dashboard status --short`:
    ```text
     M pages/Login.tsx
     M services/axios.ts
     M translations/en.ts
     M translations/my.ts
    ?? plans/2026-10-28-rate-limit-retry-fix-plan.md
    ?? plans/2026-10-28-rate-limit-retry-fix-report.md
    ```
