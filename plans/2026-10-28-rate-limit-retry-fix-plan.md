# Dashboard 429 Retry + CORS Exposed Headers ပြင်ဆင်ရေး Plan

- **ရက်စွဲ:** 2026-10-28
- **အခြေအနေ:** ⏳ Approval စောင့်ဆိုင်းဆဲ
- **ရည်ရွယ်ချက် (Objective):**
  1. Dashboard ၏ Axios 429 interceptor (`dashboard/services/axios.ts`) တွင် `Retry-After` စောင့်ချိန် အမြင့်ဆုံးကန့်သတ်ချက် (`MAX_RETRY_WAIT_MS = 10000` / ၁၀ စက္ကန့်) သတ်မှတ်ရန်၊ `/admin/login` request များကို 429 ရသည့်အခါ လုံးဝ retry မလုပ်ရန်နှင့် Login စာမျက်နှာတွင် 429 ရရှိပါက မြန်မာ/အင်္ဂလိပ် ဘာသာပြန်စာသား (`t("login.tooManyAttempts")`) ဖြင့် ချက်ချင်း ပြသရန်။
  2. Cross-origin (ဥပမာ `pos.pyithawtar.com` မှ Railway API သို့) ခေါ်ဆိုရာတွင် Browser JavaScript မှ Rate Limit ဆိုင်ရာ header များကို ဖတ်ရှုနိုင်စေရန် `backend/src/configs/cors.config.js` ၏ `exposedHeaders` တွင် `"Retry-After"`, `"RateLimit"`, `"RateLimit-Policy"` တို့ကို ထည့်သွင်းရန်။

---

## ၁. လက်ရှိ ပြဿနာ ၂ ခု နှင့် `Login.tsx` စစ်ဆေးတွေ့ရှိချက်

### ပြဿနာ ၁ — `Retry-After` အမြင့်ဆုံး ကန့်သတ်ချက် မရှိခြင်း နှင့် Login 429 Message
- **Interceptor ပြဿနာ:** `authLimiter` က 429 ပြန်သည့်အခါ `Retry-After: 896` (~၁၅ မိနစ်) ပါလာသည်။ လက်ရှိ `dashboard/services/axios.ts:56-70` သည် ထိုစက္ကန့်အတိုင်း (`896000 ms`) စောင့်ပြီးမှ retry ပြန်ပို့သဖြင့် Login ခလုတ်သည် ၁၅ မိနစ်မှ ၃၀ မိနစ်အထိ loading (`isSubmitting = true`) ဖြင့် ရပ်နေပြီး အသုံးပြုသူထံ error မပြတော့ပါ။ ထို့အပြင် `/admin/login` ကို retry ပြန်ပို့ခြင်းသည် credential မှားကို ထပ်ပို့သလို `authLimiter` ကိုပါ ထပ်မံရေတွက်စေသည်။
- **`Login.tsx` နှင့် `services/Auth/login.ts` လက်ရှိ အလုပ်လုပ်ပုံ:**
  - `dashboard/services/Auth/login.ts:28-31` တွင် `axios.post("/admin/login", payload)` မှ error တက်ပါက `throw new Error(error.response?.data?.message || "Failed to login")` ဟုသာ ပြန်ပစ်ပေးသဖြင့် HTTP status code (`429`) ပျောက်ဆုံးသွားပြီး backend ၏ English message (`"Too many requests, please try again later."`) သာ `error.message` အဖြစ် ထွက်လာသည်။
  - `dashboard/pages/Login.tsx:60-63` ၏ `catch (error: any)` တွင် `toast.error(error.message || t("login.checkCredentials"))` ဖြင့် ပြသထားရာ 429 အတွက် သီးသန့်စစ်ဆေးထားခြင်း မရှိသဖြင့် `t()` ဘာသာပြန်စာသား မပေါ်ဘဲ backend မှ English စာသားသာ ပေါ်နေမည်ဖြစ်သည်။
  - `dashboard/translations/my.ts` နှင့် `en.ts` ၏ `login` section တွင်လည်း 429 အတွက် translation key မရှိသေးပါ။

### ပြဿနာ ၂ — Cross-Origin တွင် Browser က `Retry-After` Header ကို ဖတ်ခွင့်မရခြင်း
- `backend/src/configs/cors.config.js:62` တွင် `exposedHeaders: ["X-Total-Count", "Content-Range"]` သာ ပါဝင်သဖြင့် Cross-origin ဖြစ်သော Production (`pos.pyithawtar.com` → Railway API) သို့မဟုတ် Local Preview (`localhost:3000` → `localhost:5055`) တွင် Browser က `Retry-After`, `RateLimit`, `RateLimit-Policy` header များကို JavaScript (`error.response.headers["retry-after"]` / `response.headers.get("Retry-After")`) သို့ ပေးမဖတ်ပါ။

---

## ၂. ပြင်ဆင်မည့် ဖိုင်များနှင့် ပြင်ဆင်ပုံ အသေးစိတ်

| စဉ် | ဖိုင်လမ်းကြောင်း | ပြင်ဆင်မည့် အချက်အလက် |
|---|---|---|
| 1 | `backend/src/configs/cors.config.js` | Line 62 ရှိ `exposedHeaders` ကို `["X-Total-Count", "Content-Range", "Retry-After", "RateLimit", "RateLimit-Policy"]` သို့ ပြောင်းမည်။ (ကျန် CORS setting များ လုံးဝ မပြောင်းပါ) |
| 2 | `dashboard/services/axios.ts` | • `MAX_RETRY_WAIT_MS = 10000` (၁၀ စက္ကန့်) သတ်မှတ်မည်။<br>• Request URL သည် `/admin/login` ဖြစ်ပါက (`config?.url?.includes("/admin/login")`) 429 တွင် retry လုံးဝ မလုပ်ဘဲ ချက်ချင်း `Promise.reject(error)` ပြန်မည်။<br>• အခြား endpoint များအတွက် `Retry-After` header ရှိပါက စက္ကန့်ကို မီလီစက္ကန့်ပြောင်း၍ `> MAX_RETRY_WAIT_MS` (၁၀ စက္ကန့်ထက် များလျှင်) retry မလုပ်ဘဲ ချက်ချင်း `Promise.reject(error)` ပြန်မည်။<br>• `Retry-After` ≤ ၁၀ စက္ကန့် ဖြစ်ပါက ထိုစက္ကန့်အတိုင်း စောင့်ပြီး retry လုပ်မည်။<br>• `Retry-After` header မပါပါက ယခုအတိုင်း `2s` / `4s` (`config._retryCount * 2000`) စောင့်၍ အများဆုံး ၂ ကြိမ် retry လုပ်မည်။<br>• 401 interceptor ကို လုံးဝ မထိပါ။ |
| 3 | `dashboard/translations/my.ts` | `login` section တွင် `tooManyAttempts: "ကြိုးစားမှု များလွန်းပါသည်။ မိနစ်အနည်းငယ်ကြာမှ ပြန်ကြိုးစားပါ။"` ထည့်မည်။ |
| 4 | `dashboard/translations/en.ts` | `login` section တွင် `tooManyAttempts: "Too many attempts. Please try again in a few minutes."` ထည့်မည်။ |
| 5 | `dashboard/pages/Login.tsx` | `services/Auth/login.ts` ကို မပြင်ဘဲ (ပြင်ရမည့်ဖိုင်စာရင်း စည်းမျဉ်းအတိုင်း)၊ `Login.tsx` ၏ `catch (error: any)` (line 60-63) တွင် backend ၏ 429 message (`error?.response?.status === 429` သို့မဟုတ် `error?.message?.toLowerCase().includes("too many requests")`) ဖြစ်ပါက `toast.error(t("login.tooManyAttempts"))` ဖြင့် ပြသပြီး၊ မဟုတ်ပါက ယခုအတိုင်း `toast.error(error.message || t("login.checkCredentials"))` ပြသမည်။ |

---

## ၃. အကောင်အထည်ဖော်မည့် အဆင့်များ (Implementation Steps)

1. **Step 1 (Backend CORS):** `backend/src/configs/cors.config.js:62` တွင် `exposedHeaders` ၌ `"Retry-After"`, `"RateLimit"`, `"RateLimit-Policy"` တို့ကို ထည့်သွင်းမည်။
2. **Step 2 (Dashboard Axios 429 Interceptor):** `dashboard/services/axios.ts:56-70` ကို `/admin/login` skip စစ်ဆေးချက်နှင့် `MAX_RETRY_WAIT_MS = 10000` ကန့်သတ်ချက် ထည့်သွင်းပြင်ဆင်မည်။
3. **Step 3 (Translations & Login 429 Toast):** `dashboard/translations/my.ts` နှင့် `en.ts` တွင် `login.tooManyAttempts` key ထည့်သွင်းပြီး `dashboard/pages/Login.tsx` ၏ `catch` block တွင် 429 ဖြစ်ပါက `t("login.tooManyAttempts")` ပြသရန် ပြင်ဆင်မည်။
4. **Step 4 (Build & Key Parity Check):** `dashboard` တွင် `npm run build` နှင့် i18n key parity check command ကို run ၍ စစ်ဆေးမည်။
5. **Step 5 (Local Browser & Cross-Origin Verification R-1 မှ R-6):** Local MongoDB (`retrytest` DB, port 27018) + Temp Backend (`PORT=5055`) + Dashboard (`VITE_API_BASE_URL=http://localhost:5055/api/v1/ npx vite build` နှင့် `npx vite preview --port 3000`) တို့ဖြင့် R-1 မှ R-6 အထိ စစ်ဆေးမည်။
6. **Step 6 (Cleanup & Report):** Background process များ (preview, backend, mongod) ရပ်တန့်ခြင်း၊ temp data/script ဖျက်သိမ်းခြင်းနှင့် `dashboard/plans/2026-10-28-rate-limit-retry-fix-report.md` ရေးသားခြင်း။

---

## ၄. စစ်ဆေးမည့် နည်းလမ်းများ (Verification Plan — R-1 မှ R-6)

- **ပတ်ဝန်းကျင်:**
  - Local MongoDB single-node replica set (`port 27018`, DB `retrytest` — seed script တွင် `mongoose.connection.name === "retrytest"` ဖြစ်ကြောင်း assert လုပ်မည်)
  - Temp Backend (`PORT=5055`, `MONGODB_URI=mongodb://127.0.0.1:27018/retrytest?replicaSet=rs0`)
  - Dashboard Preview (`http://localhost:3000` — Cross-origin ဖြစ်စေရန် Port 3000 မှ Port 5055 API သို့ ခေါ်မည်)

| # | စစ်ချက် | မျှော်မှန်း ရလဒ် |
|---|---|---|
| **R-1** | Browser console (`http://localhost:3000`) တွင် `fetch` ဖြင့် 429 ရအောင်ခေါ်ပြီး `response.headers.get("Retry-After")` ဖတ်ခြင်း | `null` မဟုတ်ဘဲ စက္ကန့်တန်ဖိုး (ဥပမာ `"899"` သို့မဟုတ် `"59"`) ဖတ်၍ ရရမည် (CORS `Access-Control-Expose-Headers` အလုပ်လုပ်သည်) |
| **R-2** | Dashboard `/login` page တွင် name/password အမှားဖြင့် ၁၁ ကြိမ် login ဝင်ခြင်း | ၁၁ ကြိမ်မြောက်တွင် ချက်ချင်း (၁ စက္ကန့်အတွင်း) `"ကြိုးစားမှု များလွန်းပါသည်။ မိနစ်အနည်းငယ်ကြာမှ ပြန်ကြိုးစားပါ။"` (EN: `"Too many attempts. Please try again in a few minutes."`) toast ပေါ်ရမည်၊ ခလုတ် loading မကျန်ရ၊ Network tab တွင် `/admin/login` ကို retry ထပ်မပို့ရ (စုစုပေါင်း POST ၁၁ ကြိမ်သာ) |
| **R-3** | Login ဝင်ပြီးနောက် `RATE_LIMIT_STAFF_MAX=20` ဖြင့် page ပြောင်း/API ခေါ်၍ 429 ရစေခြင်း | • `Retry-After` ≤ 10s ဖြစ်ပါက ထိုစက္ကန့်အတိုင်း စောင့်ပြီး retry ပြန်ပို့ရမည်။<br>• `Retry-After` > 10s ဖြစ်ပါက retry လုံးဝ မလုပ်ဘဲ ချက်ချင်း error ပြန်ပေးရမည်။ |
| **R-4** | `Retry-After` header မပါသော 429 (mock / interceptor စမ်းသပ်ချက်) | ယခုအတိုင်း `2s` → `4s` ခြား၍ အများဆုံး ၂ ကြိမ် (စုစုပေါင်း request ၃ ကြိမ်) retry လုပ်ရမည်။ |
| **R-5** | 401 စစ်ဆေးချက် (token ဖျက်/အတုထည့်ပြီး API ခေါ်ခြင်း) | ယခုအတိုင်း `authToken` ဖျက်ပြီး `/login` သို့ redirect လုပ်ရမည်။ |
| **R-6** | `npm run build` (dashboard) နှင့် translation parity command (`missingInMy 0`, `missingInEn 0`, `duplicateKeys 0`) | Build အောင်မြင်ပြီး key parity `0 / 0` ဖြစ်ရမည်။ |
